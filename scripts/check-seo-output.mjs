import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const productionOrigin = 'https://www.viewexif.com';
const legacyOrigin = 'https://www.screentesthub.com';
const retiredOrigin = 'https://achelie-metadataview.pages.dev';
const legacySitemaps = ['sitemap-index.xml', 'sitemap-0.xml'];
const homepageFiles = new Set(['index.html', 'de/index.html', 'fr/index.html', 'zh-cn/index.html']);

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

// Astro escapes these named entities; decode numeric references in one pass too.
// A second pass would incorrectly turn literal text such as "&lt;" into markup.
function decodeHtml(value) {
  const named = { amp: '&', AMP: '&', lt: '<', LT: '<', gt: '>', GT: '>', quot: '"', QUOT: '"', apos: "'", nbsp: '\u00a0' };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (!code.startsWith('#')) return named[code] ?? entity;
    const point = /^#x/i.test(code) ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
    return !point || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff) ? '\ufffd' : String.fromCodePoint(point);
  });
}

function attributes(source) {
  return new Map([...source.matchAll(/([^\s=/"'<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map((entry) => [entry[1].toLowerCase(), decodeHtml(entry[2] ?? entry[3] ?? entry[4])]));
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function visibleText(html) {
  return normalizeText(decodeHtml(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')));
}

const failures = [];
const assetCache = new Map();
const homeImageRecords = [];
const htmlFiles = (await filesUnder(distDir)).filter((file) => file.endsWith('.html'));
const indexableCanonicals = [];
const titles = [];
const pageRecords = [];

async function pngDimensions(url, relativeFile, label) {
  const assetPath = path.resolve(distDir, `.${decodeURIComponent(url.pathname)}`);
  if (!assetPath.startsWith(`${distDir}${path.sep}`)) {
    failures.push(`${relativeFile}: ${label} is outside dist`);
    return;
  }
  if (!assetCache.has(assetPath)) assetCache.set(assetPath, readFile(assetPath));
  let bytes;
  try {
    bytes = await assetCache.get(assetPath);
  } catch {
    failures.push(`${relativeFile}: ${label} asset is missing: ${url.pathname}`);
    return;
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)
    || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') {
    failures.push(`${relativeFile}: ${label} must have a valid PNG signature and IHDR`);
    return;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (!width || !height) {
    failures.push(`${relativeFile}: ${label} has invalid PNG dimensions`);
    return;
  }
  return { width, height };
}

function productionImageUrl(value, relativeFile, label) {
  try {
    const url = new URL(value);
    if (url.origin !== productionOrigin || url.username || url.password || url.search || url.hash) throw new Error();
    // Check percent escapes before resolving an asset on the filesystem.
    decodeURIComponent(url.pathname);
    return url;
  } catch {
    failures.push(`${relativeFile}: ${label} must be an absolute production asset URL`);
  }
}

async function checkHomepage(relativeFile, html, schemas, locale) {
  const meta = new Map([...html.matchAll(/<meta\b([^>]*)>/g)].map((entry) => {
    const props = attributes(entry[1]);
    return [props.get('property') ?? props.get('name'), props.get('content') ?? ''];
  }));
  const socialImage = productionImageUrl(meta.get('og:image') ?? '', relativeFile, 'og:image');
  const twitterImage = productionImageUrl(meta.get('twitter:image') ?? '', relativeFile, 'twitter:image');
  if (socialImage && twitterImage && socialImage.href !== twitterImage.href) failures.push(`${relativeFile}: OG and Twitter images must use the same asset`);
  if (meta.get('twitter:card') !== 'summary_large_image') failures.push(`${relativeFile}: homepage requires summary_large_image`);
  if (meta.get('og:image:width') !== '1200' || meta.get('og:image:height') !== '630') failures.push(`${relativeFile}: social image metadata must declare 1200 × 630`);
  const socialAlt = normalizeText(meta.get('og:image:alt') ?? '');
  if (!socialAlt || socialAlt !== normalizeText(meta.get('twitter:image:alt') ?? '')) failures.push(`${relativeFile}: OG and Twitter require matching nonempty localized alt text`);
  if (socialImage) {
    const dimensions = await pngDimensions(socialImage, relativeFile, 'social image');
    if (dimensions && (dimensions.width !== 1200 || dimensions.height !== 630)) failures.push(`${relativeFile}: social PNG must actually be 1200 × 630`);
  }

  const images = [...html.matchAll(/<img\b([^>]*)>/g)].map((entry) => attributes(entry[1]));
  const screenshots = images.filter((image) => (image.get('src') ?? '').startsWith('/seo/'));
  if (!screenshots.length) failures.push(`${relativeFile}: missing independent /seo/ example screenshot`);
  const screenshotAlts = [];
  for (const image of screenshots) {
    const source = image.get('src');
    const screenshot = productionImageUrl(`${productionOrigin}${source}`, relativeFile, 'example screenshot');
    if (!screenshot || !screenshot.pathname.startsWith('/seo/') || screenshot.pathname.includes('/samples/')) {
      failures.push(`${relativeFile}: example screenshot must use an independent /seo/ asset`);
      continue;
    }
    if (socialImage && screenshot.pathname === socialImage.pathname) failures.push(`${relativeFile}: example screenshot must be independent from the social image`);
    const alt = normalizeText(image.get('alt') ?? '');
    if (!alt) failures.push(`${relativeFile}: example screenshot is missing localized alt text`);
    screenshotAlts.push(alt);
    const width = Number(image.get('width'));
    const height = Number(image.get('height'));
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) failures.push(`${relativeFile}: example screenshot needs explicit positive width and height`);
    if (image.get('loading') !== 'lazy' || image.get('decoding') !== 'async') failures.push(`${relativeFile}: example screenshot requires lazy loading and async decoding`);
    const dimensions = await pngDimensions(screenshot, relativeFile, 'example screenshot');
    if (dimensions && (width !== dimensions.width || height !== dimensions.height)) failures.push(`${relativeFile}: screenshot width and height do not match its PNG`);
  }
  homeImageRecords.push({ relativeFile, socialImage: socialImage?.href, socialAlt, screenshotAlts });

  const faqSections = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)]
    .filter((entry) => (attributes(entry[1]).get('class') ?? '').split(/\s+/).includes('home-faq'));
  const faqSchemas = schemas.filter((schema) => schema['@type'] === 'FAQPage');
  if (faqSections.length !== 1 || faqSchemas.length !== 1) {
    failures.push(`${relativeFile}: expected one visible .home-faq and one FAQPage schema`);
    return;
  }
  const visibleFaqs = [...faqSections[0][2].matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map((entry) => ({
    question: visibleText(match(entry[1], /<h3\b[^>]*>([\s\S]*?)<\/h3>/)),
    answer: visibleText(match(entry[1], /<p\b[^>]*>([\s\S]*?)<\/p>/)),
  }));
  const faq = faqSchemas[0];
  if (faq.inLanguage !== locale) failures.push(`${relativeFile}: FAQPage uses the wrong language`);
  const structuredFaqs = Array.isArray(faq.mainEntity) ? faq.mainEntity.map((entry) => ({
    question: normalizeText(typeof entry?.name === 'string' ? entry.name : ''),
    answer: normalizeText(typeof entry?.acceptedAnswer?.text === 'string' ? entry.acceptedAnswer.text : ''),
  })) : [];
  if (!visibleFaqs.length || visibleFaqs.some((entry) => !entry.question || !entry.answer)
    || JSON.stringify(visibleFaqs) !== JSON.stringify(structuredFaqs)) failures.push(`${relativeFile}: FAQPage questions and answers must match visible FAQs in order`);
}

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');
  const title = match(html, /<title>(.*?)<\/title>/s);
  const description = match(html, /<meta name="description" content="([^"]*)"/);
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  const ogUrl = match(html, /<meta property="og:url" content="([^"]+)"/);
  const robots = match(html, /<meta name="robots" content="([^"]+)"/);
  const htmlLang = match(html, /<html\b[^>]*\slang="([^"]+)"/i);
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

  if (!title) failures.push(`${relativeFile}: missing title`);
  if (!description) failures.push(`${relativeFile}: missing meta description`);
  if (!canonical) failures.push(`${relativeFile}: missing canonical`);
  const expectedLang = relativeFile.startsWith('zh-cn/') ? 'zh-CN' : relativeFile.startsWith('de/') ? 'de' : relativeFile.startsWith('fr/') ? 'fr' : 'en';
  if (htmlLang !== expectedLang) failures.push(`${relativeFile}: expected html lang ${expectedLang}, found ${htmlLang || 'none'}`);
  if (h1Count !== 1) failures.push(`${relativeFile}: expected one H1, found ${h1Count}`);
  if (html.includes(retiredOrigin)) failures.push(`${relativeFile}: still references the retired pages.dev origin`);
  if (html.includes(legacyOrigin)) failures.push(`${relativeFile}: still references the previous production origin`);

  const schemas = [];
  for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      schemas.push(JSON.parse(block[1]));
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
  if (homepageFiles.has(relativeFile)) await checkHomepage(relativeFile, html, schemas, expectedLang);
}

if (new Set(titles).size !== titles.length) failures.push('Indexable page titles are not unique');
if (new Set(indexableCanonicals).size !== indexableCanonicals.length) failures.push('Indexable canonicals are not unique');
for (const homepage of homepageFiles) {
  if (!homeImageRecords.some((entry) => entry.relativeFile === homepage)) failures.push(`${homepage}: missing indexable homepage`);
}
if (new Set(homeImageRecords.map((entry) => entry.socialAlt)).size !== homeImageRecords.length) failures.push('Homepage social image alt text must be localized in all four languages');
if (new Set(homeImageRecords.map((entry) => JSON.stringify(entry.screenshotAlts))).size !== homeImageRecords.length) failures.push('Homepage example screenshot alt text must be localized in all four languages');

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
