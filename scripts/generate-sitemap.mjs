import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const productionOrigin = 'https://www.screentesthub.com';
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

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const htmlFiles = (await filesUnder(distDir)).filter((file) => file.endsWith('.html'));
const canonicalUrls = [];

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  const robots = match(html, /<meta name="robots" content="([^"]+)"/);

  if (relativeFile === '404.html' || robots.toLowerCase().includes('noindex')) continue;

  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  if (!canonical) throw new Error(`${relativeFile}: cannot generate sitemap without a canonical URL`);

  const url = new URL(canonical);
  if (url.origin !== productionOrigin) throw new Error(`${relativeFile}: canonical uses the wrong origin`);
  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    throw new Error(`${relativeFile}: canonical is missing its trailing slash`);
  }

  canonicalUrls.push(url.toString());
}

const sitemapUrls = [...new Set(canonicalUrls)].sort();
if (sitemapUrls.length !== canonicalUrls.length) throw new Error('Cannot generate sitemap with duplicate canonical URLs');
if (sitemapUrls.length > 50_000) throw new Error('A single sitemap cannot contain more than 50,000 URLs');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await Promise.all(legacySitemaps.map((file) => rm(path.join(distDir, file), { force: true })));
await writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf8');

console.log(`Generated sitemap.xml with ${sitemapUrls.length} canonical URLs.`);
