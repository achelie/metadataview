import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ooxmlFixture, ooxmlMime } from '../fixtures/ooxml';

const sampleName = 'viewexif-metadata-demo.jpg';
const cleanedName = 'viewexif-metadata-demo-clean.jpg';
const sampleAsset = '/samples/metadata-demo-v1.jpg';
const locales = [
  { prefix: '', language: 'en', sample: 'Try sample' },
  { prefix: '/de', language: 'de', sample: 'Beispiel testen' },
  { prefix: '/fr', language: 'fr', sample: 'Tester un exemple' },
  { prefix: '/zh-cn', language: 'zh-CN', sample: '测试案例' },
] as const;

type StorageWrite = { kind: string; key: string };
type HandoffAudit = { documentId: string; writes: StorageWrite[] };
type AuditedWindow = Window & typeof globalThis & { __toolHandoffAudit: HandoffAudit };

async function hydratedWorkbench(page: Page) {
  const input = page.locator('input[type="file"]').first();
  await expect(input).toBeAttached();
  await expect(input.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
  return input.locator('xpath=ancestor::section[contains(@class,"workbench")][1]');
}

async function ready(page: Page, heading: string, filename = sampleName) {
  const workbench = await hydratedWorkbench(page);
  await expect(page.locator(heading)).toContainText(filename, { timeout: 90_000 });
  await expect(workbench).toHaveAttribute('aria-busy', 'false', { timeout: 90_000 });
}

async function handoff(page: Page, selector: string, path: string) {
  const link = page.locator(selector).locator(`a[data-tool-file-link][href="${path}"]`);
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL((url) => url.pathname === path && !url.search && !url.hash);
}

async function installStorageAudit(page: Page) {
  await page.addInitScript(() => {
    const audit: HandoffAudit = { documentId: crypto.randomUUID(), writes: [] };
    (window as AuditedWindow).__toolHandoffAudit = audit;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      audit.writes.push({ kind: this === localStorage ? 'localStorage' : 'sessionStorage', key });
      return setItem.call(this, key, value);
    };
    const open = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (name, version) {
      audit.writes.push({ kind: 'indexedDB.open', key: name });
      return version === undefined ? open.call(this, name) : open.call(this, name, version);
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      audit.writes.push({ kind: 'indexedDB.put', key: this.name });
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    };
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (value, key) {
      audit.writes.push({ kind: 'indexedDB.add', key: this.name });
      return key === undefined ? add.call(this, value) : add.call(this, value, key);
    };
  });
}

async function auditSnapshot(page: Page) {
  return page.evaluate(() => (window as AuditedWindow).__toolHandoffAudit);
}

test('a sample travels viewer → privacy → remover → processed-copy privacy without a picker or persistence', async ({ page }) => {
  test.setTimeout(300_000);
  let pickers = 0;
  const requests: Array<{ method: string; url: string; body: string }> = [];
  page.on('filechooser', () => { pickers += 1; });
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url(), body: request.postData() ?? '' }));
  await installStorageAudit(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'load' });
  await hydratedWorkbench(page);
  const baseline = await auditSnapshot(page);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await ready(page, '.report-heading h2');
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('[data-exif-summary="gps"]')).toContainText('48.858400, 2.294500');

  await handoff(page, '.report-privacy', '/image-privacy-checker/');
  await ready(page, '.privacy-result-actions h2');
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('#risk-precise-location')).toBeVisible();
  await expect(page.locator('#risk-device-model')).toBeVisible();
  await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete');
  expect((await auditSnapshot(page)).documentId).toBe(baseline.documentId);

  // Header listeners must be rebound after Astro replaces the page body.
  const language = page.locator('.site-header .language-dropdown');
  const languageTrigger = language.locator('.language-ticket');
  await languageTrigger.click();
  await expect(languageTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(language.locator('a[href="/de/image-privacy-checker/"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(languageTrigger).toHaveAttribute('aria-expanded', 'false');
  await expect(languageTrigger).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  const menuTrigger = page.locator('[data-mobile-menu-trigger]');
  await menuTrigger.click();
  await expect(page.locator('[data-mobile-menu-layer]')).toHaveAttribute('data-open', 'true');
  const viewGroup = page.locator('.mobile-nav-group').first();
  await viewGroup.locator('.t-acc-head').click();
  await expect(viewGroup.getByRole('link', { name: 'Images', exact: true })).toBeVisible();
  await menuTrigger.click();
  await expect(page.locator('[data-mobile-menu-layer]')).toHaveAttribute('data-open', 'false');

  await handoff(page, '.tool-next-steps', '/image-metadata-remover/');
  await ready(page, '.removal-file-head h2');
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('.removal-result')).toHaveCount(0);
  const create = page.getByRole('button', { name: 'Create and verify clean copy', exact: true });
  await expect(create).toBeEnabled();
  await create.click();
  const result = page.locator('.removal-result');
  await expect(result).toBeVisible({ timeout: 90_000 });
  await expect(result).not.toHaveClass(/is-blocked/);
  await handoff(page, '.removal-result .tool-next-steps', '/image-privacy-checker/');
  await ready(page, '.privacy-result-actions h2', cleanedName);
  await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete');
  await expect(page.locator('#risk-precise-location')).toHaveCount(0);
  await expect(page.locator('#risk-device-model')).toHaveCount(0);
  await expect(page.locator('#risk-creator-identity')).toHaveCount(0);
  expect(pickers).toBe(0);
  const finalAudit = await auditSnapshot(page);
  expect(finalAudit.documentId).toBe(baseline.documentId);
  expect(finalAudit.writes).toEqual(baseline.writes);
  expect(requests.filter(({ url }) => new URL(url).pathname === sampleAsset)).toHaveLength(1);
  const origin = new URL(page.url()).origin;
  expect(requests.filter((request) => new URL(request.url).origin === origin && !['GET', 'HEAD'].includes(request.method))).toEqual([]);
  const traffic = requests.map(({ url, body }) => {
    try { return decodeURIComponent(`${url}\n${body}`); } catch { return `${url}\n${body}`; }
  }).join('\n');
  expect(traffic).not.toMatch(/viewexif-metadata-demo(?:-clean)?\.jpg|ViewExif Demo|Demo Camera|48\.8584|2\.2945/i);

  await page.reload({ waitUntil: 'load' });
  await hydratedWorkbench(page);
  await expect(page.getByRole('button', { name: 'Choose an image', exact: true })).toBeVisible();
  await expect(page.locator('.privacy-scoreboard')).toHaveCount(0);
  await expect(page.locator('.sample-image-badge')).toHaveCount(0);
  expect((await auditSnapshot(page)).documentId).not.toBe(baseline.documentId);
  expect(pickers).toBe(0);
});

for (const locale of locales) {
  test(`${locale.language}: viewer hands its sample to the same-language privacy checker`, async ({ page }) => {
    test.setTimeout(180_000);
    let pickers = 0;
    const sampleRequests: string[] = [];
    page.on('filechooser', () => { pickers += 1; });
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === sampleAsset) sampleRequests.push(request.url());
    });
    await page.goto(`${locale.prefix}/image-metadata-viewer/`, { waitUntil: 'load' });
    await hydratedWorkbench(page);
    await page.getByRole('button', { name: locale.sample, exact: true }).click();
    await ready(page, '.report-heading h2');
    await handoff(page, '.report-privacy', `${locale.prefix}/image-privacy-checker/`);
    await ready(page, '.privacy-result-actions h2');
    await expect(page.locator('html')).toHaveAttribute('lang', locale.language);
    await expect(page.locator('.sample-image-badge')).toBeVisible();
    await expect(page.locator('#risk-precise-location')).toBeVisible();
    await expect(page.locator('#risk-creator-identity')).toBeVisible();
    expect(sampleRequests).toHaveLength(1);
    expect(pickers).toBe(0);
  });
}

test('clear and a new file cancel a slow tool handoff before it can replace the page', async ({ page }) => {
  test.setTimeout(180_000);
  for (const action of ['clear', 'replace']) {
    await page.goto('/');
    await hydratedWorkbench(page);
    await page.getByRole('button', { name: 'Try sample', exact: true }).click();
    await ready(page, '.report-heading h2');
    let seen!: () => void;
    let release!: () => void;
    const requested = new Promise<void>(resolve => { seen = resolve; });
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/image-privacy-checker/', async route => { seen(); await held; await route.continue().catch(() => {}); });
    await page.locator('.report-privacy a[href="/image-privacy-checker/"]').click();
    await requested;
    if (action === 'clear') await page.getByRole('button', { name: 'Clear', exact: true }).click();
    else await page.locator('input[type=file]').setInputFiles({ name: 'newer-selection.jpg', mimeType: 'image/jpeg', buffer: await readFile('public/samples/metadata-demo-v1.jpg') });
    const response = page.waitForResponse(response => new URL(response.url()).pathname === '/image-privacy-checker/');
    release();
    await (await response).finished();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(page).toHaveURL('/');
    if (action === 'clear') await expect(page.getByRole('button', { name: 'Try sample', exact: true })).toBeVisible();
    else {
      await ready(page, '.report-heading h2', 'newer-selection.jpg');
      await expect(page.locator('.sample-image-badge')).toHaveCount(0);
    }
    await page.unroute('**/image-privacy-checker/');
  }
});

test('a failed tool page leaves the current file available for retry', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await hydratedWorkbench(page);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await ready(page, '.report-heading h2');
  await page.route('**/image-privacy-checker/', route => route.fulfill({ status: 503, contentType: 'text/html', body: '<p>Unavailable</p>' }));
  await page.locator('.report-privacy a[href="/image-privacy-checker/"]').click();
  await expect(page.locator('.report-privacy [role=status]')).toContainText('could not open');
  await expect(page).toHaveURL('/');
  await expect(page.locator('.report-heading h2')).toContainText(sampleName);
  await page.unroute('**/image-privacy-checker/');
  await handoff(page, '.report-privacy', '/image-privacy-checker/');
  await ready(page, '.privacy-result-actions h2');
});

test('a document continues from the universal viewer to analysis without starting cleanup', async ({ page }) => {
  test.setTimeout(120_000);
  let pickers = 0;
  page.on('filechooser', () => { pickers++; });
  await page.goto('/metadata-viewer/');
  await hydratedWorkbench(page);
  await page.locator('input[type=file]').setInputFiles({ name: 'handoff-document.docx', mimeType: ooxmlMime('docx'), buffer: Buffer.from(await ooxmlFixture('docx')) });
  await ready(page, '.report-heading h2', 'handoff-document.docx');
  await handoff(page, '.tool-next-steps', '/metadata-remover/');
  await ready(page, '.removal-file-head h2', 'handoff-document.docx');
  await expect(page.getByRole('button', { name: 'Create and verify clean copy', exact: true })).toBeEnabled();
  await expect(page.locator('.removal-result')).toHaveCount(0);
  expect(pickers).toBe(0);
});
