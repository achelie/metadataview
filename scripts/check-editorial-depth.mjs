import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Use Astro's existing HTML parser instead of adding a runtime dependency.
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { parse } = astroRequire('parse5');
const options = { distDir: 'dist', outputFile: undefined };
for (let index = 2; index < process.argv.length; index += 1) {
  const option = process.argv[index];
  if (option === '--help') {
    console.log('Usage: node scripts/check-editorial-depth.mjs --output-file <new-report.json> [--dist-dir dist]');
    process.exit(0);
  }
  const key = option === '--dist-dir' ? 'distDir' : option === '--output-file' ? 'outputFile' : undefined;
  if (!key || !process.argv[index + 1] || process.argv[index + 1].startsWith('--')) {
    throw new Error(`Unknown or incomplete option: ${option}`);
  }
  options[key] = process.argv[++index];
}
if (!options.outputFile) throw new Error('Provide --output-file with a new evidence filename; existing reports are never overwritten.');
const distDir = path.resolve(options.distDir);
const outputFile = path.resolve(options.outputFile);

const locales = [['en', ''], ['de', '/de'], ['fr', '/fr'], ['zh-CN', '/zh-cn']];
const toolSlugs = [
  'metadata-viewer', 'image-metadata-viewer', 'document-metadata-viewer',
  'video-metadata-viewer', 'audio-metadata-viewer', 'image-privacy-checker',
  'metadata-remover', 'image-metadata-remover', 'document-metadata-remover',
  'video-metadata-remover', 'audio-metadata-remover', 'c2pa-viewer',
];
const blogSlugs = ['verify-metadata-removal', 'why-metadata-is-missing', 'how-to-read-c2pa-results'];
const excludedTags = new Set(['astro-island', 'script', 'style', 'nav', 'template', 'noscript', 'button', 'input', 'select', 'textarea', 'svg']);
const excludedClasses = new Set([
  'tool-hero', 'home-tool-intro', 'related-tools', 'related-list', 'reading-routes',
  'tool-editorial-next', 'home-process-cta', 'section-index', 'eyebrow',
  'home-benefit-icon', 'blog-tool-strip', 'blog-related',
  'result-reading-guide',
]);
const contentTags = new Set(['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'th', 'td', 'dt', 'dd', 'figcaption', 'summary', 'pre']);
const failures = [];
const records = [];

function attribute(node, name) {
  return node.attrs?.find(entry => entry.name === name)?.value ?? '';
}
function hasClass(node, name) {
  return attribute(node, 'class').split(/\s+/).includes(name);
}
function excluded(node) {
  if (excludedTags.has(node.tagName)) return node.tagName;
  const blockedClass = attribute(node, 'class').split(/\s+/).find(name => excludedClasses.has(name));
  if (blockedClass) return `.${blockedClass}`;
  // The final strong element in a format benefit link is its repeated action label.
  if (node.tagName === 'strong') {
    let ancestor = node.parentNode;
    while (ancestor) {
      if (hasClass(ancestor, 'home-benefit-grid')) return 'benefit-action-label';
      ancestor = ancestor.parentNode;
    }
  }
  return undefined;
}
function findAll(node, predicate) {
  return [predicate(node) ? node : undefined, ...(node.childNodes ?? []).flatMap(child => findAll(child, predicate))].filter(Boolean);
}
function extractText(node, excludedCounts = {}, inContent = false) {
  const reason = excluded(node);
  if (reason) {
    excludedCounts[reason] = (excludedCounts[reason] ?? 0) + 1;
    return '';
  }
  const readable = inContent || contentTags.has(node.tagName);
  if (node.nodeName === '#text') return readable ? node.value : '';
  return (node.childNodes ?? []).map(child => extractText(child, excludedCounts, readable)).join(' ');
}
function normalizedText(node, excludedCounts = {}) {
  return extractText(node, excludedCounts).replace(/\s+/g, ' ').trim();
}
function countText(text, locale) {
  const words = [...new Intl.Segmenter(locale, { granularity: 'word' }).segment(text)]
    .filter(segment => segment.isWordLike).length;
  return { words, hanCharacters: [...text.matchAll(/\p{Script=Han}/gu)].length, characters: [...text].length };
}
function illustrations(main) {
  return findAll(main, node => node.tagName === 'figure').filter(figure => {
    let ancestor = figure;
    while (ancestor && ancestor !== main) {
      if (excluded(ancestor)) return false;
      ancestor = ancestor.parentNode;
    }
    return true;
  }).map(figure => {
    const image = findAll(figure, node => node.tagName === 'img')[0];
    const caption = findAll(figure, node => node.tagName === 'figcaption')[0];
    const alt = attribute(image ?? {}, 'alt');
    const captionText = caption ? normalizedText(caption) : '';
    return {
      src: attribute(image ?? {}, 'src'), alt, caption: captionText,
      labelledDemonstration: Boolean(captionText) && /synthetic|sample|demo|example|controlled|synthetisch|beispiel|démonstration|contrôlé|synthétique|示例|教学|合成|受控/iu.test(`${alt} ${captionText}`),
    };
  });
}
function editorialSections(main, locale) {
  return findAll(main, node => hasClass(node, 'tool-editorial-section')).map(section => {
    const heading = findAll(section, node => node.tagName === 'h2')[0];
    const paragraphs = findAll(section, node => hasClass(node, 'tool-editorial-copy'))
      .flatMap(copy => findAll(copy, node => node.tagName === 'p'));
    const tableBodies = findAll(section, node => node.tagName === 'tbody');
    return {
      id: attribute(heading ?? section, 'id'),
      heading: heading ? normalizedText(heading) : '',
      paragraphCount: paragraphs.length,
      paragraphCounts: paragraphs.map(paragraph => countText(normalizedText(paragraph), locale)),
      fieldRows: tableBodies.reduce((total, body) => total + findAll(body, node => node.tagName === 'tr').length, 0),
      counts: countText(normalizedText(section), locale),
    };
  });
}

async function inspect(route, locale, kind, baseRoute) {
  const relativeFile = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  const record = { route, baseRoute, locale, kind, relativeFile, errors: [] };
  records.push(record);
  let html;
  try {
    html = await readFile(path.join(distDir, relativeFile), 'utf8');
  } catch (error) {
    record.errors.push(`Built page unavailable: ${error.code ?? error.message}`);
    return;
  }
  record.htmlSha256 = createHash('sha256').update(html).digest('hex');
  const document = parse(html);
  const mainNodes = findAll(document, node => node.tagName === 'main');
  if (mainNodes.length !== 1) record.errors.push(`Expected one main, found ${mainNodes.length}`);
  const main = mainNodes[0];
  if (!main) return;
  const htmlElement = findAll(document, node => node.tagName === 'html')[0];
  if (attribute(htmlElement, 'lang') !== locale) record.errors.push(`Expected HTML language ${locale}`);
  const proseNodes = kind === 'blog' ? findAll(main, node => hasClass(node, 'blog-prose')) : [main];
  if (proseNodes.length !== 1) record.errors.push(`Expected one counted content root, found ${proseNodes.length}`);
  if (!proseNodes[0]) return;
  record.excludedNodes = {};
  const text = normalizedText(proseNodes[0], record.excludedNodes);
  record.counts = countText(text, locale);
  record.headingCount = findAll(proseNodes[0], node => node.tagName === 'h2' && !excluded(node)).length;
  if (!text || !record.headingCount) record.errors.push('Expected meaningful body text with section headings');
  if (kind === 'blog') {
    if (record.counts.words < 800 || record.counts.words > 1500) record.errors.push(`Blog body must have 800–1500 words; found ${record.counts.words}`);
  } else {
    record.editorialSections = editorialSections(main, locale);
    record.illustrations = illustrations(main);
    if (baseRoute !== '/' && !record.editorialSections.length) record.errors.push('Missing format-specific editorial sections');
    const editorialIds = record.editorialSections.map(section => section.id);
    if (editorialIds.some(id => !id) || new Set(editorialIds).size !== editorialIds.length) record.errors.push('Editorial heading IDs must be present and unique within the page');
    if (baseRoute !== '/' && !record.editorialSections.some(section => section.fieldRows > 0)) record.errors.push('Missing explanatory field table rows');
    if (!record.illustrations.some(figure => figure.src && figure.labelledDemonstration)) record.errors.push('Missing screenshot with a labelled synthetic or controlled-demonstration caption');
    if (locale !== 'zh-CN' && record.counts.words < 800) record.errors.push(`Tool explanation must have at least 800 words; found ${record.counts.words}`);
    if (baseRoute === '/') {
      record.homeSections = findAll(main, node => node.tagName === 'section' && !excluded(node))
        .filter(section => (section.childNodes ?? []).some(child => child.tagName === 'h2')
          || findAll(section, child => child.tagName === 'h2').length === 1)
        .map(section => ({
          id: attribute(section, 'aria-labelledby'),
          counts: countText(normalizedText(section), locale),
        })).filter(section => section.id);
    }
  }
}

for (const [locale, prefix] of locales) {
  await inspect(`${prefix}/`, locale, 'tool', '/');
  for (const slug of toolSlugs) await inspect(`${prefix}/${slug}/`, locale, 'tool', `/${slug}/`);
}
for (const slug of blogSlugs) await inspect(`/blog/${slug}/`, 'en', 'blog', `/blog/${slug}/`);

for (const record of records.filter(record => record.locale === 'zh-CN' && record.counts)) {
  const english = records.find(candidate => candidate.locale === 'en' && candidate.baseRoute === record.baseRoute);
  if (!record.counts.hanCharacters) record.errors.push('Chinese explanation contains no Han text');
  if (record.baseRoute === '/') {
    const homeIds = record.homeSections?.map(section => section.id) ?? [];
    if (!homeIds.length || new Set(homeIds).size !== homeIds.length) record.errors.push('Chinese homepage sections must have unique local IDs');
    if (record.homeSections?.some(section => !section.counts.hanCharacters)) record.errors.push('A Chinese homepage explanation section has no Han text');
  } else {
    if (record.editorialSections.some(section => !section.paragraphCount || !/\p{Script=Han}/u.test(section.heading)
      || section.paragraphCounts.some(counts => !counts.hanCharacters))) record.errors.push('A Chinese editorial heading or paragraph lacks meaningful Chinese text');
  }
  const summary = candidate => ({
    sections: candidate?.editorialSections?.length ?? 0,
    paragraphs: candidate?.editorialSections?.reduce((sum, section) => sum + section.paragraphCount, 0) ?? 0,
    fieldRows: candidate?.editorialSections?.reduce((sum, section) => sum + section.fieldRows, 0) ?? 0,
    homeSections: candidate?.homeSections?.length ?? 0,
    screenshots: candidate?.illustrations?.map(figure => figure.src) ?? [],
    counts: candidate?.counts,
  });
  record.equivalenceReview = { english: summary(english), chinese: summary(record) };
  record.chineseReview = 'Local heading IDs need not match English. Mechanical Han text, unique IDs, field rows and labelled illustrations support a separate manual review of complete meaning and limits; no Chinese word-count floor is imposed.';
}

for (const record of records) {
  for (const error of record.errors) failures.push(`${record.route}: ${error}`);
}
const toolRecords = records.filter(record => record.kind === 'tool');
if (toolRecords.length !== 52 || new Set(toolRecords.map(record => record.route)).size !== 52) failures.push('Expected exactly 52 distinct tool-bearing routes');
const report = {
  generatedAt: new Date().toISOString(),
  distDir,
  method: {
    parser: 'parse5 resolved through Astro',
    wordCounter: 'Intl.Segmenter(locale, { granularity: word }), isWordLike',
    countedTags: [...contentTags],
    excludedTags: [...excludedTags],
    excludedClasses: [...excludedClasses],
    foldedFaqs: 'Static summary and answer text is included even when details is initially closed.',
    repeatedHelper: 'The entire shared .result-reading-guide helper is excluded so its repeated operating tips cannot meet the per-tool editorial minimum.',
    blogRoot: '.blog-prose only; frontmatter, byline, cover, practical take, template FAQs and related links are excluded.',
    thresholds: { toolWordsEnDeFrMinimum: 800, newBlogBodyMinimum: 800, newBlogBodyMaximum: 1500 },
    chinese: 'Record Han characters and segmented words. Require local unique IDs, Chinese editorial headings/paragraphs, field rows and labelled illustrations. Record English/Chinese section, paragraph and field counts without demanding identical structures; manual semantic-equivalence review remains required.',
  },
  expected: { toolBearingPages: 52, newBlogBodies: 3 },
  totals: { toolBearingPages: toolRecords.length, newBlogBodies: records.length - toolRecords.length, failures: failures.length },
  records,
  failures,
  passed: failures.length === 0,
};
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(`Editorial depth: ${toolRecords.length} tool pages, ${blogSlugs.length} new blog bodies; ${failures.length} failures. Evidence: ${outputFile}`);
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
}
