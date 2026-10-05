import { chromium, expect } from '@playwright/test';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const options = { baseUrl: undefined, outputFile: undefined, fixtureDir: 'output/playwright/adsense-20261005' };
for (let index = 2; index < process.argv.length; index++) {
  const argument = process.argv[index];
  if (argument === '--help') {
    console.log('Usage: node scripts/check-mobile-editorial.mjs --base-url <preview-url> --output-file <new-evidence.json> [--fixture-dir <existing-fixtures>]');
    process.exit(0);
  }
  const key = { '--base-url': 'baseUrl', '--output-file': 'outputFile', '--fixture-dir': 'fixtureDir' }[argument];
  if (!key || !process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`Unknown or incomplete option: ${argument}`);
  options[key] = process.argv[++index];
}
if (!options.baseUrl || !options.outputFile) throw new Error('Provide an explicit preview URL and a new evidence filename.');
const baseUrl = new URL(options.baseUrl).origin;
const outputFile = path.resolve(options.outputFile);
try { await access(outputFile); throw new Error(`Evidence exists; refusing to overwrite ${outputFile}`); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const widths = [320, 375, 390, 430];
const locales = [['en', ''], ['de', '/de'], ['fr', '/fr'], ['zh-CN', '/zh-cn']];
const toolSlugs = ['metadata-viewer', 'image-metadata-viewer', 'document-metadata-viewer', 'video-metadata-viewer', 'audio-metadata-viewer', 'image-privacy-checker', 'metadata-remover', 'image-metadata-remover', 'video-metadata-remover', 'audio-metadata-remover', 'document-metadata-remover', 'c2pa-viewer'];
const guideSlugs = ['verify-metadata-removal', 'why-metadata-is-missing', 'how-to-read-c2pa-results'];
const fixtures = {};
for (const [family, name, mimeType] of [
  ['image', 'synthetic-photo.jpg', 'image/jpeg'],
  ['document', 'synthetic-document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['audio', 'synthetic-audio.wav', 'audio/wav'],
  ['video', 'synthetic-container.mp4', 'video/mp4'],
  ['cleanup', 'synthetic-cleanup.png', 'image/png'],
]) {
  const buffer = await readFile(path.resolve(options.fixtureDir, name));
  fixtures[family] = { name, mimeType, buffer, sha256: sha256(buffer), size: buffer.length };
}
const source = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirtyFiles: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean),
  note: 'A commit with dirty files is a working-tree build, not a deployed release. Per-navigation HTML hashes identify the tested preview output.',
};
const startedAt = new Date().toISOString();
const records = [];
const downloads = [];
const screenshotsDirectory = path.resolve('output/playwright', `mobile-editorial-${Date.now()}`);
await mkdir(screenshotsDirectory);
const browser = await chromium.launch({ headless: true });
source.browserVersion = browser.version();
source.nodeVersion = process.version;
const context = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: 'reduce', acceptDownloads: false });
// A synthetic UI test must not transmit sample values to analytics or an upload endpoint.
await context.route('**/*', async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.hostname === 'analytics.ahrefs.com' && url.pathname.startsWith('/api/')) {
    await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
  } else if (url.pathname === '/cdn-cgi/rum' || url.hostname === 'cloudflareinsights.com') {
    await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
  } else if (!['GET', 'HEAD'].includes(request.method())) {
    await route.abort('blockedbyclient');
  } else {
    await route.continue();
  }
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);
let activeRecord;
page.on('download', download => {
  downloads.push({ at: new Date().toISOString(), route: activeRecord?.route, state: activeRecord?.state, name: download.suggestedFilename() });
  activeRecord?.errors.push('Unexpected automatic download');
  void download.cancel();
});
page.on('pageerror', error => activeRecord?.errors.push(`Browser error: ${error.message}`));

async function metrics(record, touchSelectors = []) {
  const result = await page.evaluate(({ touchSelectors }) => {
    const visible = element => {
      if (element.closest('[inert], [aria-hidden="true"], .sr-only')) return false;
      if (!element.getClientRects().length) return false;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      if (typeof element.checkVisibility === 'function' && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      return true;
    };
    const describe = element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.classList.length ? `.${[...element.classList].slice(0, 3).join('.')}` : ''}`;
    const text = element => (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    const oversized = [];
    let maximumFont = 0;
    let checkedTextNodes = 0;
    let checkedPseudos = 0;
    for (const element of document.body.querySelectorAll('*')) {
      if (element instanceof SVGElement || !visible(element)) continue;
      const ownText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (ownText || element.matches('input:not([type=file]), textarea, select')) {
        const font = parseFloat(getComputedStyle(element).fontSize);
        maximumFont = Math.max(maximumFont, font);
        checkedTextNodes++;
        if (font > 28.01) oversized.push({ element: describe(element), font, text: text(element) });
      }
      for (const pseudo of ['::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        if (['none', 'normal', '""', "''"].includes(style.content) || style.display === 'none' || style.visibility === 'hidden') continue;
        const font = parseFloat(style.fontSize);
        maximumFont = Math.max(maximumFont, font);
        checkedPseudos++;
        if (font > 28.01) oversized.push({ element: `${describe(element)}${pseudo}`, font, content: style.content });
      }
    }
    const inputs = [...document.querySelectorAll('input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=hidden]),textarea,select')]
      .filter(visible).map(element => ({ element: describe(element), font: parseFloat(getComputedStyle(element).fontSize) }));
    const touch = [...new Set(touchSelectors.flatMap(selector => [...document.querySelectorAll(selector)]))]
      .filter(visible).filter(element => !element.matches(':disabled'))
      .map(element => ({ element: describe(element), text: text(element), height: element.getBoundingClientRect().height, width: element.getBoundingClientRect().width }));
    const tables = [...document.querySelectorAll('main table')].filter(visible).map(element => {
      const rectangle = element.getBoundingClientRect();
      const overflowX = getComputedStyle(element).overflowX;
      return { element: describe(element), left: rectangle.left, right: rectangle.right, width: rectangle.width, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, overflowX, containedHorizontalScroll: ['auto', 'scroll'].includes(overflowX) && rectangle.left >= -1 && rectangle.right <= document.documentElement.clientWidth + 1 };
    });
    return {
      document: { scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth },
      maximumFont, checkedTextNodes, checkedPseudos,
      oversized: oversized.slice(0, 30), oversizedCount: oversized.length,
      inputs, touch, tables,
    };
  }, { touchSelectors });
  record.metrics = result;
  if (result.document.scroll > result.document.client + 1) record.errors.push(`Document overflow ${result.document.scroll - result.document.client}px`);
  if (result.oversizedCount) record.errors.push(`${result.oversizedCount} authored text/pseudo fonts exceed 28px`);
  for (const input of result.inputs.filter(input => input.font < 16)) record.errors.push(`Input font ${input.font}px: ${input.element}`);
  for (const target of result.touch.filter(target => target.height < 43.9)) record.errors.push(`Touch target height ${target.height.toFixed(2)}px: ${target.element} ${target.text}`);
  for (const table of result.tables.filter(table => table.left < -1 || table.right > result.document.client + 1 || table.scrollWidth > table.clientWidth + 1)) {
    record.errors.push(`Table overflow: ${table.element} bounds ${table.left.toFixed(2)}–${table.right.toFixed(2)}, scroll/client ${table.scrollWidth}/${table.clientWidth}`);
  }
}

function recordFor(route, width, locale, state) {
  const record = { route, width, locale, state, startedAt: new Date().toISOString(), errors: [] };
  records.push(record);
  activeRecord = record;
  return record;
}
async function captureFailure(record) {
  if (!record.errors.length) return;
  const filename = `${String(records.indexOf(record)).padStart(3, '0')}-${record.width}-${record.state.replace(/[^a-z0-9-]/gi, '-')}.png`;
  const screenshot = path.join(screenshotsDirectory, filename);
  await page.screenshot({ path: screenshot, fullPage: false }).catch(() => {});
  record.screenshot = path.relative(process.cwd(), screenshot).replaceAll('\\', '/');
}
async function navigate(record) {
  await page.setViewportSize({ width: record.width, height: 900 });
  const response = await page.goto(`${baseUrl}${record.route}`, { waitUntil: 'load', timeout: 45_000 });
  record.status = response?.status();
  record.htmlSha256 = response ? sha256(await response.body()) : null;
  if (!response?.ok()) record.errors.push(`HTTP ${response?.status() ?? 'unavailable'}`);
  if (record.status === 200 && await page.locator('astro-island').count()) {
    await expect(page.locator('astro-island').first()).not.toHaveAttribute('ssr', '');
  }
}
const staticTouch = ['.mobile-menu-trigger', '.report-dropzone', '.removal-dropzone', '.privacy-dropzone', '.c2pa-dropzone', '.sample-image-bar button', '.tool-editorial-next a'];

try {
  const staticRoutes = locales.flatMap(([locale, prefix]) => [
    { locale, route: `${prefix}/` },
    ...toolSlugs.map(slug => ({ locale, route: `${prefix}/${slug}/` })),
    { locale, route: `${prefix}/privacy/` },
  ]).concat(guideSlugs.map(slug => ({ locale: 'en', route: `/blog/${slug}/` })));
  for (const width of widths) {
    for (const { locale, route } of staticRoutes) {
      const record = recordFor(route, width, locale, 'initial');
      try {
        await navigate(record);
        await metrics(record, [...staticTouch, '.blog-toc-mobile > summary', '.blog-tool-strip a']);
      } catch (error) { record.errors.push(error.message); }
      record.completedAt = new Date().toISOString();
      await captureFailure(record);
    }
    console.log(`Initial mobile pages checked at ${width}px: ${staticRoutes.length}`);
  }

  for (const width of widths) {
    for (const [locale, prefix] of locales) {
      const record = recordFor(`${prefix}/`, width, locale, 'mobile-menu-language');
      try {
        await navigate(record);
        await page.locator('[data-mobile-menu-trigger]').click();
        await expect(page.locator('[data-mobile-menu-layer]')).toHaveAttribute('data-open', 'true');
        const dropdown = page.locator('.mobile-language-dropdown');
        await dropdown.locator(':scope > button').click();
        await expect(dropdown).toHaveAttribute('data-open', 'true');
        const options = await dropdown.locator('.language-dropdown-panel a').allTextContents();
        const chinese = options.filter(value => value.includes('简体中文'));
        record.languageOptions = options.map(value => value.replace(/\s+/g, ' ').trim());
        if (options.length !== 4 || chinese.length !== 1 || chinese[0]?.trim() !== '简体中文') record.errors.push('Language options must contain exactly one unabridged 简体中文 entry and four choices');
        await metrics(record, ['.mobile-menu-trigger', '.mobile-language-dropdown button', '.mobile-language-dropdown a', '.mobile-nav-list > a', '.mobile-nav-group > button']);
        await dropdown.locator(':scope > button').click();
        for (const [index, button] of (await page.locator('[data-mobile-accordion] > button').all()).entries()) {
          const expanded = recordFor(`${prefix}/`, width, locale, index === 0 ? 'mobile-menu-view-expanded' : 'mobile-menu-remove-expanded');
          expanded.htmlSha256 = record.htmlSha256;
          await button.click();
          await expect(button).toHaveAttribute('aria-expanded', 'true');
          await metrics(expanded, ['.mobile-menu-trigger', '.mobile-language-dropdown button', '.mobile-nav-list a', '.mobile-nav-group > button']);
          expanded.completedAt = new Date().toISOString();
          await captureFailure(expanded);
        }
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-mobile-menu-layer]')).toHaveAttribute('data-open', 'false');
        activeRecord = record;
      } catch (error) { record.errors.push(error.message); }
      record.completedAt = new Date().toISOString();
      await captureFailure(record);
    }
  }

  const flows = [
    ['image', '/image-metadata-viewer/', '.report-heading h2', '.report-engine'],
    ['document', '/document-metadata-viewer/', '.report-heading h2', '.report-engine'],
    ['audio', '/audio-metadata-viewer/', '.report-heading h2', '.report-engine'],
    ['video', '/video-metadata-viewer/', '.report-heading h2', '.report-engine'],
    ['c2pa', '/c2pa-viewer/', '.c2pa-no-credentials', '.c2pa-workbench'],
    ['cleanup', '/image-metadata-remover/', '.removal-file-head h2', '.removal-workbench'],
  ];
  for (const [locale, prefix] of locales) {
    for (const [family, route, readySelector, busySelector] of flows) {
      const fixture = fixtures[family === 'c2pa' ? 'image' : family];
      const record = recordFor(`${prefix}${route}`, 320, locale, `${family}-uploaded`);
      const downloadStart = downloads.length;
      try {
        await navigate(record);
        await page.locator('input[type=file]').first().setInputFiles({ name: fixture.name, mimeType: fixture.mimeType, buffer: fixture.buffer });
        await expect(page.locator(readySelector)).toBeVisible({ timeout: 100_000 });
        if (family !== 'c2pa') await expect(page.locator(readySelector)).toContainText(fixture.name);
        await expect(page.locator(busySelector)).toHaveAttribute('aria-busy', 'false', { timeout: 100_000 });
        record.fixture = { name: fixture.name, sha256: fixture.sha256, size: fixture.size };
        if (family === 'cleanup') {
          // No cleanup from navigation or file selection: require and record this explicit click.
          if (await page.locator('.removal-result').count()) record.errors.push('Cleanup happened before an explicit user action');
          const button = page.locator('.removal-action > button');
          await expect(button).toBeEnabled();
          record.explicitCleanupAction = { at: new Date().toISOString(), button: await button.innerText() };
          await button.click();
          await expect(page.locator('.removal-result')).toBeVisible({ timeout: 100_000 });
          await expect(page.locator('.removal-workbench')).toHaveAttribute('aria-busy', 'false', { timeout: 100_000 });
          record.cleanupConclusion = await page.locator('#removal-result-title').innerText();
          record.cleanupClass = await page.locator('.removal-result').getAttribute('class');
          if (/is-blocked/.test(record.cleanupClass)) record.errors.push('Synthetic PNG output is blocked');
        }
        const stateWidths = locale === 'en' ? widths : [320];
        for (const width of stateWidths) {
          const state = width === 320 ? record : recordFor(`${prefix}${route}`, width, locale, `${family}-result`);
          state.htmlSha256 = record.htmlSha256;
          await page.setViewportSize({ width, height: 900 });
          // Start each width as a fresh mobile reading state. A stale desktop hover
          // position can repeatedly trigger button transforms while the width changes.
          await page.mouse.move(0, 0);
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await metrics(state, ['.mobile-menu-trigger', '.workbench button', '.workbench details > summary', '.workbench [role=button]', '.tool-next-steps a', '.tool-editorial-next a']);
          state.completedAt = new Date().toISOString();
          await captureFailure(state);
          const menus = page.locator('.workbench .result-export-menu > summary');
          if (await menus.count()) {
            const menuRecord = recordFor(`${prefix}${route}`, width, locale, `${family}-export-menu`);
            menuRecord.htmlSha256 = record.htmlSha256;
            await menus.first().click();
            await expect(menus.first().locator('..')).toHaveAttribute('open', '');
            await metrics(menuRecord, ['.workbench .result-export-menu button', '.workbench .result-export-menu > summary']);
            menuRecord.completedAt = new Date().toISOString();
            await captureFailure(menuRecord);
            await menus.first().focus();
            await page.keyboard.press('Escape');
            await expect(menus.first().locator('..')).not.toHaveAttribute('open', '');
          }
        }
      } catch (error) { record.errors.push(error.message); }
      if (downloads.length > downloadStart) record.errors.push('Result flow triggered a download without a download action');
      record.completedAt = new Date().toISOString();
      await captureFailure(record);
      console.log(`Result flow checked: ${locale} ${family}`);
    }
  }
} finally {
  await browser.close();
}

const failures = records.filter(record => record.errors.length).map(record => ({ route: record.route, width: record.width, locale: record.locale, state: record.state, errors: record.errors, screenshot: record.screenshot }));
const initialHashes = new Map();
for (const record of records.filter(record => record.state === 'initial')) {
  if (!initialHashes.has(record.route)) initialHashes.set(record.route, new Set());
  initialHashes.get(record.route).add(record.htmlSha256);
}
source.previewVersionConsistent = [...initialHashes.values()].every(hashes => hashes.size === 1 && !hashes.has(null) && !hashes.has(undefined));
source.initialHtmlSetSha256 = sha256([...initialHashes].sort(([left], [right]) => left.localeCompare(right)).map(([route, hashes]) => `${route}\t${[...hashes].sort().join(',')}`).join('\n'));
const report = {
  startedAt, completedAt: new Date().toISOString(), baseUrl, source,
  method: {
    engine: 'Playwright Chromium, reduced-motion mobile viewport; browser default zoom retained',
    widths, expectedInitialRoutes: 59, expectedInitialStates: 236,
    text: 'Computed fonts for rendered authored text nodes, inputs and generated before/after content; hidden/inert/screen-reader-only trees excluded.',
    touch: 'Measured main upload controls, mobile navigation/language options, editorial guide links and visible result controls. Ordinary inline prose links are not primary touch targets.',
    tables: 'Page overflow, table bounds outside the viewport and inner horizontal table overflow fail. CSS overflow mode is also recorded so a contained scroll area can be distinguished from page overflow.',
    results: 'Six real uploaded states in all four languages at 320px; English states also at375/390/430px. PNG cleanup requires an explicit recorded button click.',
    fixtures: 'Synthetic teaching files only. MP4 is container-only/non-playable; WAV has a known quick-parser warning; C2PA uses an unsigned JPEG.',
    requests: 'Analytics/RUM event endpoints and all non-GET/HEAD requests intercepted; this layout test is not analytics execution or privacy certification.',
    evidence: 'New output JSON and failure screenshots are preserved; existing output filenames are never overwritten.',
  },
  totals: { records: records.length, initialStates: records.filter(record => record.state === 'initial').length, failures: failures.length, automaticDownloads: downloads.length },
  passed: failures.length === 0 && downloads.length === 0 && source.previewVersionConsistent,
  records, failures, downloads,
};
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(`Mobile editorial verification: ${records.length} states, ${failures.length} failures, ${downloads.length} unexpected downloads. Evidence: ${outputFile}`);
if (!report.passed) process.exitCode = 1;
