import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const productionOrigin = 'https://www.viewexif.com';
const retiredOrigin = 'https://achelie-metadataview.pages.dev';

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return files.flat();
}

function match(html, pattern) {
  return html.match(pattern)?.[1] ?? '';
}

const failures = [];
const htmlFiles = (await filesUnder(distDir)).filter((file) => file.endsWith('.html'));
const indexableCanonicals = [];
const titles = [];

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  const title = match(html, /<title>(.*?)<\/title>/s);
  const description = match(html, /<meta name="description" content="([^"]*)"/);
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  const ogUrl = match(html, /<meta property="og:url" content="([^"]+)"/);
  const robots = match(html, /<meta name="robots" content="([^"]+)"/);
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

  if (!title) failures.push(`${relativeFile}: missing title`);
  if (!description) failures.push(`${relativeFile}: missing meta description`);
  if (!canonical) failures.push(`${relativeFile}: missing canonical`);
  if (h1Count !== 1) failures.push(`${relativeFile}: expected one H1, found ${h1Count}`);
  if (html.includes(retiredOrigin)) failures.push(`${relativeFile}: still references the retired pages.dev origin`);

  for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      JSON.parse(block[1]);
    } catch {
      failures.push(`${relativeFile}: invalid JSON-LD`);
    }
  }

  for (const hrefMatch of html.matchAll(/href="(\/[^"?#]*)/g)) {
    const href = hrefMatch[1];
    const lastSegment = href.split('/').filter(Boolean).at(-1) ?? '';
    if (href !== '/' && !href.endsWith('/') && !lastSegment.includes('.')) {
      failures.push(`${relativeFile}: internal link is not canonical: ${href}`);
    }
  }

  if (relativeFile === '404.html') {
    if (!robots.includes('noindex')) failures.push('404.html: missing noindex');
    continue;
  }

  if (robots.includes('noindex')) failures.push(`${relativeFile}: public page is noindex`);
  if (!canonical.startsWith(`${productionOrigin}/`)) failures.push(`${relativeFile}: canonical uses the wrong origin`);
  if (canonical !== `${productionOrigin}/` && !canonical.endsWith('/')) failures.push(`${relativeFile}: canonical is missing its trailing slash`);
  if (ogUrl !== canonical) failures.push(`${relativeFile}: og:url does not match canonical`);
  indexableCanonicals.push(canonical);
  titles.push(title);
}

if (new Set(titles).size !== titles.length) failures.push('Indexable page titles are not unique');
if (new Set(indexableCanonicals).size !== indexableCanonicals.length) failures.push('Indexable canonicals are not unique');

const robots = await readFile(path.join(distDir, 'robots.txt'), 'utf8');
if (!/User-agent:\s*\*\r?\nAllow:\s*\//.test(robots)) failures.push('robots.txt does not allow crawling');
if (!robots.includes(`Sitemap: ${productionOrigin}/sitemap-index.xml`)) failures.push('robots.txt points to the wrong sitemap');
if (robots.includes(retiredOrigin)) failures.push('robots.txt still references the retired origin');

const sitemapIndex = await readFile(path.join(distDir, 'sitemap-index.xml'), 'utf8');
if (!sitemapIndex.includes(`<loc>${productionOrigin}/sitemap-0.xml</loc>`)) failures.push('sitemap index points to the wrong origin');

const sitemap = await readFile(path.join(distDir, 'sitemap-0.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => entry[1]).sort();
const canonicalUrls = [...indexableCanonicals].sort();
if (JSON.stringify(sitemapUrls) !== JSON.stringify(canonicalUrls)) {
  failures.push(`sitemap URLs do not match public canonicals (${sitemapUrls.length} sitemap, ${canonicalUrls.length} canonical)`);
}
if (sitemap.includes(retiredOrigin)) failures.push('sitemap still references the retired origin');

if (failures.length) {
  throw new Error(`SEO output check failed:\n- ${[...new Set(failures)].join('\n- ')}`);
}

console.log(`SEO output check: ${canonicalUrls.length} indexable pages; canonicals, robots, JSON-LD, internal links, and sitemap agree on ${productionOrigin}.`);
