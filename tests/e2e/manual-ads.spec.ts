import { expect, test, type Page } from '../fixtures/browser-test';
import { readFile } from 'node:fs/promises';

const article = '/blog/do-screenshots-have-metadata/';
const loader = '**/pagead/js/adsbygoogle.js?*';
const toolAd = '[data-manual-ad="tool-after-result-guide"]';
const articleAd = '[data-manual-ad="article-after-prose"]';

async function mockAds(page: Page, mode: 'filled' | 'unfilled' | 'blocked' | 'consent' = 'filled') {
  const requests: string[] = [];
  await page.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url());
    return hostname === '127.0.0.1' || hostname === 'localhost' ? route.continue() : route.abort();
  });
  await page.route(loader, (route) => {
    requests.push(route.request().url());
    if (mode === 'blocked') return route.abort();
    return route.fulfill({
      contentType: 'application/javascript',
      headers: { 'access-control-allow-origin': '*' },
      body: `
        window.testAds = { pushes: [], listeners: 0 };
        if (${mode === 'consent'}) {
          window.__tcfapi = (command, version, callback) => {
            window.testAds.listeners++;
            callback({ gdprApplies: true, cmpStatus: 'loading' }, true);
            window.testAds.choose = (granted) => callback({
              gdprApplies: true, cmpStatus: 'loaded', eventStatus: 'useractioncomplete',
              purpose: { consents: { 1: granted } }, vendor: { consents: { 755: granted } },
            }, true);
          };
        }
        window.adsbygoogle = {
          push() {
            const unit = document.querySelector('ins.adsbygoogle:not([data-ad-status])');
            window.testAds.pushes.push(unit?.dataset.adSlot);
            if (!unit) throw new Error('Unexpected push');
            unit.dataset.adStatus = '${mode === 'unfilled' ? 'unfilled' : 'filled'}';
            if (unit.dataset.adStatus === 'filled') {
              const creative = document.createElement('div');
              creative.style.height = '160px';
              unit.append(creative);
            }
          }
        };
      `,
    });
  });
  return requests;
}

type TestWindow = typeof window & { testAds: { pushes: string[]; listeners: number; choose: (granted: boolean) => void } };
const adState = (page: Page) => page.evaluate(() => ({
  pushes: (window as TestWindow).testAds.pushes,
  listeners: (window as TestWindow).testAds.listeners,
}));

test('tool and article units fit the requested mobile, tablet and desktop widths', async ({ page }) => {
  test.setTimeout(90_000);
  await mockAds(page);
  for (const width of [360, 390, 768, 1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    for (const { path, selector, previous, slot, format } of [
      { path: '/', selector: toolAd, previous: '.result-reading-guide', slot: '1396503722', format: 'auto' },
      { path: '/fr/image-metadata-remover/', selector: toolAd, previous: '.result-reading-guide', slot: '1396503722', format: 'auto' },
      { path: article, selector: articleAd, previous: '.blog-prose', slot: '6565583278', format: 'fluid' },
    ]) {
      await page.goto(path);
      const placement = page.locator(selector);
      await expect(page.locator('[data-manual-ad]')).toHaveCount(1);
      await expect(page.locator('[data-ad-preview]')).toHaveCount(0);
      await expect(page.locator('astro-island [data-manual-ad]')).toHaveCount(0);
      await expect(page.locator(`${previous} + ${selector}`)).toHaveCount(1);
      await placement.scrollIntoViewIfNeeded();
      const unit = placement.locator('ins');
      await expect(unit).toHaveAttribute('data-ad-slot', slot);
      await expect(unit).toHaveAttribute('data-ad-format', format);
      if (format === 'fluid') await expect(unit).toHaveAttribute('data-ad-layout', 'in-article');
      else await expect(unit).toHaveAttribute('data-full-width-responsive', 'true');
      const box = (await unit.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      expect(await unit.evaluate((element) => {
        const wrapper = element.parentElement!;
        const rect = element.getBoundingClientRect();
        let next = wrapper.nextElementSibling;
        while (next?.tagName === 'SCRIPT') next = next.nextElementSibling;
        return wrapper.previousElementSibling!.getBoundingClientRect().bottom <= rect.top
          && next!.getBoundingClientRect().top >= rect.bottom;
      }), `${path} at ${width}px`).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      expect((await adState(page)).pushes).toEqual([slot]);
    }
  }
});

test('an in-article ad waits for a 250px container', async ({ page }) => {
  await mockAds(page);
  await page.setViewportSize({ width: 239, height: 844 });
  await page.goto(article);
  const placement = page.locator(articleAd);
  await placement.scrollIntoViewIfNeeded();
  expect((await placement.boundingBox())!.width).toBeLessThan(250);
  await expect(placement.locator('ins')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await placement.scrollIntoViewIfNeeded();
  await expect(placement.locator('ins')).toHaveCount(1);
  expect((await adState(page)).pushes).toEqual(['6565583278']);
});

test('ad waits for a TCF choice and does not repush across width changes, files and tool history', async ({ page }) => {
  test.setTimeout(120_000);
  const requests = await mockAds(page, 'consent');
  await page.goto('/');
  const placement = page.locator(toolAd);
  await placement.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await adState(page)).listeners).toBe(1);
  await expect(placement.locator('ins')).toHaveCount(0);
  await page.evaluate(() => (window as TestWindow).testAds.choose(false));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  const input = page.locator('input[type=file]');
  await expect(page.locator('.report-heading h2')).toContainText('viewexif-metadata-demo.jpg');
  await placement.scrollIntoViewIfNeeded();
  await expect(placement.locator('ins')).toHaveCount(0);
  await page.evaluate(() => (window as TestWindow).testAds.choose(true));
  await expect(placement.locator('ins')).toHaveCount(1);
  const bytes = await readFile('public/samples/metadata-demo-v1.jpg');
  await input.setInputFiles({ name: 'replacement.jpg', buffer: bytes, mimeType: 'image/jpeg' });
  await expect(page.locator('.report-heading h2')).toContainText('replacement.jpg');
  await page.locator('.report-controls input').fill('camera');
  await page.locator('.report-view-switch button').last().click();
  await placement.scrollIntoViewIfNeeded();
  expect((await adState(page)).pushes).toEqual(['1396503722']);

  const handoff = page.locator('a[data-tool-file-link][href="/image-privacy-checker/"]');
  await expect(handoff).toHaveAttribute('data-google-vignette', 'false');
  await handoff.click();
  const privacyPlacement = page.locator(`.page-shell ${toolAd}`);
  await expect(page).toHaveURL((url) => url.pathname === '/image-privacy-checker/');
  await privacyPlacement.scrollIntoViewIfNeeded();
  await expect(privacyPlacement.locator('ins')).toHaveCount(1);
  await page.goBack();
  const homePlacement = page.locator(`.home-tool-first ${toolAd}`);
  await expect(page).toHaveURL((url) => url.pathname === '/');
  await homePlacement.scrollIntoViewIfNeeded();
  await expect(homePlacement.locator('ins')).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL((url) => url.pathname === '/image-privacy-checker/');
  await privacyPlacement.scrollIntoViewIfNeeded();
  await expect(privacyPlacement.locator('ins')).toHaveCount(0);
  expect(await adState(page)).toEqual({ pushes: ['1396503722', '1396503722'], listeners: 1 });
  expect(requests).toHaveLength(1);
});

for (const mode of ['blocked', 'unfilled'] as const) {
  test(`${mode} advertising leaves the viewer usable`, async ({ page }) => {
    await mockAds(page, mode);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const placement = page.locator(toolAd);
    await placement.scrollIntoViewIfNeeded();
    if (mode === 'unfilled') await expect(placement.locator('ins')).toHaveAttribute('data-ad-status', 'unfilled');
    else await expect(placement.locator('ins')).toHaveCount(0);
    expect((await placement.boundingBox())!.height).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Try sample', exact: true }).click();
    await expect(page.locator('.report-heading h2')).toContainText('viewexif-metadata-demo.jpg');
  });
}

test('file selection, drop, cleanup and downloads emit only fixed event names', async ({ page }) => {
  test.setTimeout(120_000);
  await mockAds(page, 'blocked');
  await page.addInitScript(() => {
    const events: unknown[][] = [];
    const downloadAttributes: (string | undefined)[] = [];
    Object.assign(window, { events, downloadAttributes });
    window.AhrefsAnalytics = { sendEvent: (...args) => { events.push(args); } };
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) downloadAttributes.push(this.dataset.googleVignette);
      click.call(this);
    };
  });
  const state = () => page.evaluate(() => {
    const audit = window as typeof window & { events: unknown[][]; downloadAttributes: (string | undefined)[] };
    return { events: audit.events, downloadAttributes: audit.downloadAttributes };
  });
  await page.goto('/');
  const input = page.locator('input[type=file]');
  await expect(input.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
  await input.setInputFiles({ name: 'private-marker.txt', buffer: Buffer.from('private-content'), mimeType: 'text/plain' });
  await expect(page.locator('.report-error')).toBeVisible();
  expect((await state()).events).toEqual([['file_processing_started'], ['metadata_parse_failed']]);
  await page.reload();
  await expect(input.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
  const bytes = await readFile('public/samples/metadata-demo-v1.jpg');
  const drop = await page.evaluateHandle((data) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(data)], 'private-photo.jpg', { type: 'image/jpeg' }));
    return transfer;
  }, Array.from(bytes));
  await page.locator('.report-dropzone').dispatchEvent('drop', { dataTransfer: drop });
  await expect(page.locator('.report-heading h2')).toContainText('private-photo.jpg');
  const actions = page.locator('.report-export-actions');
  await actions.locator('summary').click();
  const json = page.waitForEvent('download');
  await actions.getByRole('button', { name: 'Complete JSON', exact: true }).click();
  expect((await json).suggestedFilename()).toMatch(/\.json$/);
  expect(await state()).toEqual({
    events: [['file_processing_started'], ['metadata_parse_succeeded'], ['file_download_triggered']],
    downloadAttributes: ['false'],
  });
  await page.locator('a[data-tool-file-link][href="/image-metadata-remover/"]').click();
  await expect(page).toHaveURL((url) => url.pathname === '/image-metadata-remover/');
  await page.getByRole('button', { name: 'Create and verify clean copy', exact: true }).click();
  const clean = page.waitForEvent('download');
  await page.locator('.removal-result .result-action-bar > button').click();
  expect((await clean).suggestedFilename()).toBe('private-photo-clean.jpg');
  expect(await state()).toEqual({
    events: [
      ['file_processing_started'], ['metadata_parse_succeeded'], ['file_download_triggered'],
      ['file_processing_started'], ['metadata_parse_succeeded'], ['metadata_cleanup_succeeded'], ['file_download_triggered'],
    ],
    downloadAttributes: ['false', 'false'],
  });
});

test('indices, trust pages and 404 omit manual placements', async ({ page }) => {
  await mockAds(page);
  for (const path of ['/blog/', '/blog/page/2/', '/about/', '/contact/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('[data-manual-ad], [data-ad-preview]')).toHaveCount(0);
  }
});
