import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const productionOrigin = 'https://www.viewexif.com';
const legacyOrigin = 'https://www.screentesthub.com';
const retiredOrigin = 'https://achelie-metadataview.pages.dev';
const legacySitemaps = ['sitemap-index.xml', 'sitemap-0.xml'];

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
const pageRecords = [];

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  const title = match(html, /<title>(.*?)<\/title>/s);
  const description = match(html, /<meta name="description" content="([^"]*)"/);
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  const ogUrl = match(html, /<meta property="og:url" content="([^"]+)"/);
  const robots = match(html, /<meta name="robots" content="([^"]+)"/);
  const htmlLang = match(html, /<html lang="([^"]+)"/);
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

  if (!title) failures.push(`${relativeFile}: missing title`);
  if (!description) failures.push(`${relativeFile}: missing meta description`);
  if (!canonical) failures.push(`${relativeFile}: missing canonical`);
  const expectedLang = relativeFile.startsWith('zh-cn/') ? 'zh-CN' : relativeFile.startsWith('de/') ? 'de' : relativeFile.startsWith('fr/') ? 'fr' : 'en';
  if (htmlLang !== expectedLang) failures.push(`${relativeFile}: expected html lang ${expectedLang}, found ${htmlLang || 'none'}`);
  if (h1Count !== 1) failures.push(`${relativeFile}: expected one H1, found ${h1Count}`);
  if (html.includes(retiredOrigin)) failures.push(`${relativeFile}: still references the retired pages.dev origin`);
  if (html.includes(legacyOrigin)) failures.push(`${relativeFile}: still references the previous production origin`);

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
  pageRecords.push({ relativeFile, html, canonical });
}

if (new Set(titles).size !== titles.length) failures.push('Indexable page titles are not unique');
if (new Set(indexableCanonicals).size !== indexableCanonicals.length) failures.push('Indexable canonicals are not unique');

const canonicalSet = new Set(indexableCanonicals);
for (const { relativeFile, html, canonical } of pageRecords) {
  const pathname = new URL(canonical).pathname;
  const englishPath = pathname === '/zh-cn/' || pathname === '/de/' || pathname === '/fr/' ? '/' : pathname.replace(/^\/(?:zh-cn|de|fr)(?=\/)/, '');
  const germanPath = englishPath === '/' ? '/de/' : `/de${englishPath}`;
  const frenchPath = englishPath === '/' ? '/fr/' : `/fr${englishPath}`;
  const chinesePath = englishPath === '/' ? '/zh-cn/' : `/zh-cn${englishPath}`;
  const englishUrl = `${productionOrigin}${englishPath}`;
  const germanUrl = `${productionOrigin}${germanPath}`;
  const frenchUrl = `${productionOrigin}${frenchPath}`;
  const chineseUrl = `${productionOrigin}${chinesePath}`;
  const hasTranslatedSet = canonicalSet.has(englishUrl) && canonicalSet.has(germanUrl) && canonicalSet.has(frenchUrl) && canonicalSet.has(chineseUrl);
  const alternates = new Map([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((entry) => [entry[1], entry[2]]));
  const ogLocale = match(html, /<meta property="og:locale" content="([^"]+)"/);
  const ogAlternates = new Set([...html.matchAll(/<meta property="og:locale:alternate" content="([^"]+)"/g)].map((entry) => entry[1]));

  if (hasTranslatedSet) {
    if (alternates.get('en') !== englishUrl) failures.push(`${relativeFile}: invalid English alternate`);
    if (alternates.get('de') !== germanUrl) failures.push(`${relativeFile}: invalid German alternate`);
    if (alternates.get('fr') !== frenchUrl) failures.push(`${relativeFile}: invalid French alternate`);
    if (alternates.get('zh-CN') !== chineseUrl) failures.push(`${relativeFile}: invalid Chinese alternate`);
    if (alternates.get('x-default') !== englishUrl) failures.push(`${relativeFile}: invalid x-default alternate`);
    const expectedOgLocale = pathname.startsWith('/zh-cn/') ? 'zh_CN' : pathname.startsWith('/de/') ? 'de_DE' : pathname.startsWith('/fr/') ? 'fr_FR' : 'en_US';
    const expectedOgAlternates = new Set(['en_US', 'de_DE', 'fr_FR', 'zh_CN'].filter((entry) => entry !== expectedOgLocale));
    if (ogLocale !== expectedOgLocale) failures.push(`${relativeFile}: invalid og:locale`);
    if (ogAlternates.size !== expectedOgAlternates.size || [...expectedOgAlternates].some((entry) => !ogAlternates.has(entry))) failures.push(`${relativeFile}: invalid og:locale:alternate set`);
  } else if (alternates.size) {
    failures.push(`${relativeFile}: declares alternates without a real translated counterpart`);
  }
}

const robots = await readFile(path.join(distDir, 'robots.txt'), 'utf8');
if (!/User-agent:\s*\*\r?\nAllow:\s*\//.test(robots)) failures.push('robots.txt does not allow crawling');
if (!robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) failures.push('robots.txt points to the wrong sitemap');
if (robots.includes(retiredOrigin)) failures.push('robots.txt still references the retired origin');
if (robots.includes(legacyOrigin)) failures.push('robots.txt still references the previous production origin');

const distRootFiles = await readdir(distDir);
for (const legacySitemap of legacySitemaps) {
  if (distRootFiles.includes(legacySitemap)) failures.push(`${legacySitemap} should not be generated`);
}

const sitemap = await readFile(path.join(distDir, 'sitemap.xml'), 'utf8');
if (!/<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap)) {
  failures.push('sitemap.xml is not a direct sitemap urlset');
}
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => entry[1]).sort();
const canonicalUrls = [...indexableCanonicals].sort();
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap contains duplicate URLs');
if (JSON.stringify(sitemapUrls) !== JSON.stringify(canonicalUrls)) {
  failures.push(`sitemap URLs do not match public canonicals (${sitemapUrls.length} sitemap, ${canonicalUrls.length} canonical)`);
}
if (sitemap.includes(retiredOrigin)) failures.push('sitemap still references the retired origin');
if (sitemap.includes(legacyOrigin)) failures.push('sitemap still references the previous production origin');
if (sitemap.includes('/404/')) failures.push('sitemap contains the 404 page');

if (failures.length) {
  throw new Error(`SEO output check failed:\n- ${[...new Set(failures)].join('\n- ')}`);
}

console.log(`SEO output check: ${canonicalUrls.length} indexable pages; canonicals, language alternates, robots, JSON-LD, internal links, and sitemap agree on ${productionOrigin}.`);
