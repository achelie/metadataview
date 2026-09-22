import { expect, test, type Page, type Route } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const metadataAsset = '/samples/metadata-demo-v1.jpg';
const signedAsset = '/samples/c2pa-signed-v1.jpg';
const metadataName = 'viewexif-metadata-demo.jpg';
const signedName = 'adobe-20220124-C.jpg';

const tools = [
  { name: 'metadata viewer', path: '/image-metadata-viewer/', asset: metadataAsset, fileName: metadataName, heading: '.report-heading h2', choose: 'Choose an image' },
  { name: 'privacy checker', path: '/image-privacy-checker/', asset: metadataAsset, fileName: metadataName, heading: '.privacy-result-actions h2', choose: 'Choose an image' },
  { name: 'metadata remover', path: '/image-metadata-remover/', asset: metadataAsset, fileName: metadataName, heading: '.removal-file-head h2', choose: 'Choose an image' },
  { name: 'C2PA verifier', path: '/c2pa-viewer/', asset: signedAsset, fileName: signedName, heading: '.c2pa-report-heading h2', choose: 'Choose a file' },
] as const;
type Tool = typeof tools[number];

const locales = [
  { prefix: '', button: 'Try sample', note: 'The metadata and landmark coordinates were added for this demo.' },
  { prefix: '/zh-cn', button: '测试案例', note: 'metadata 和公共地标坐标均为演示设置。' },
  { prefix: '/de', button: 'Beispiel testen', note: 'Metadaten und Koordinaten einer Sehenswürdigkeit wurden für diese Demo hinzugefügt.' },
  { prefix: '/fr', button: 'Tester un exemple', note: 'Les métadonnées et les coordonnées d’un monument ont été ajoutées pour cette démonstration.' },
] as const;

async function openTool(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'load' });
  const input = page.locator('input[type="file"]').first();
  await expect(input).toBeAttached();
  await expect(input.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
  return input;
}

async function resultReady(page: Page, tool: Tool, name = tool.fileName as string) {
  await expect(page.locator(tool.heading)).toContainText(name, { timeout: 90_000 });
  const workbench = page.locator('input[type="file"]').first().locator('xpath=ancestor::section[contains(@class,"workbench")][1]');
  await expect(workbench).toHaveAttribute('aria-busy', 'false', { timeout: 90_000 });
}

function trackPickers(page: Page) {
  let count = 0;
  page.on('filechooser', () => { count += 1; });
  return () => count;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

async function delaySample(page: Page, asset: string, bytes: Buffer) {
  const seen = deferred();
  const released = deferred();
  const handled = deferred();
  let requests = 0;
  const pattern = `**${asset}`;
  const handler = async (route: Route) => {
    requests += 1;
    seen.resolve();
    await released.promise;
    try {
      await route.fulfill({ status: 200, contentType: 'image/jpeg', body: bytes });
    } catch {
      // A canceled fetch may already be gone when the held response is released.
    } finally {
      handled.resolve();
    }
  };
  await page.route(pattern, handler);
  return {
    seen: seen.promise,
    count: () => requests,
    release: async () => {
      released.resolve();
      await handled.promise;
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    },
    remove: () => page.unroute(pattern, handler),
  };
}

test('all seven image-capable routes run localized samples without preloading assets', async ({ page }) => {
  test.setTimeout(600_000);
  const requestedSamples: string[] = [];
  const pickerCount = trackPickers(page);
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/samples/')) requestedSamples.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 844 });
  const routes = ['/', '/metadata-viewer/', '/image-metadata-viewer/', '/image-privacy-checker/', '/metadata-remover/', '/image-metadata-remover/', '/c2pa-viewer/'];
  for (const locale of locales) {
    for (const path of routes) {
      await test.step(`${locale.prefix || 'en'}${path}`, async () => {
        const requestsBefore = requestedSamples.length;
        await openTool(page, `${locale.prefix}${path}`);
        const bar = page.locator('.sample-image-bar');
        const button = bar.getByRole('button', { name: locale.button, exact: true });
        await expect(bar).toHaveCount(1);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        expect(await button.evaluate((element) => element.parentElement?.closest('[role="button"]') !== null)).toBe(false);
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
        expect(requestedSamples).toHaveLength(requestsBefore);
        const tool = path === '/c2pa-viewer/' ? tools[3]
          : path === '/image-privacy-checker/' ? tools[1]
            : path.includes('metadata-remover') ? tools[2] : tools[0];
        await button.click();
        await resultReady(page, tool);
        await expect(page.locator('.sample-image-badge')).toBeVisible();
        if (tool.asset === metadataAsset) await expect(page.locator('.sample-image-badge p')).toHaveText(locale.note);
        await expect(bar).toHaveCount(0);
        expect(requestedSamples).toHaveLength(requestsBefore + 1);
        expect(new URL(requestedSamples[requestsBefore]!).pathname).toBe(tool.asset);
        expect(pickerCount()).toBe(0);
        const layout = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          oversized: [...document.querySelectorAll('body *')].filter((element) =>
            element.getClientRects().length > 0 &&
            [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) &&
            Number.parseFloat(getComputedStyle(element).fontSize) > 28,
          ).map((element) => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 80), fontSize: getComputedStyle(element).fontSize })),
        }));
        expect(layout.overflow).toBe(false);
        expect(layout.oversized).toEqual([]);
      });
    }
  }
});

test('document, audio, and video tools do not offer an incompatible image sample', async ({ page }) => {
  test.setTimeout(180_000);
  const routes = ['/document-metadata-viewer/', '/audio-metadata-viewer/', '/video-metadata-viewer/', '/document-metadata-remover/', '/audio-metadata-remover/', '/video-metadata-remover/'];
  for (const locale of locales) {
    for (const path of routes) {
      await openTool(page, `${locale.prefix}${path}`);
      await expect(page.locator('.sample-image-bar')).toHaveCount(0);
    }
  }
});

test('sample click runs the real home viewer and exposes the embedded EXIF', async ({ page }) => {
  test.setTimeout(120_000);
  const pickerCount = trackPickers(page);
  await openTool(page, '/');
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await resultReady(page, tools[0]);
  const summary = page.locator('.home-exif-summary');
  await expect(summary.locator('[data-exif-summary="camera"]')).toContainText('ViewExif · Demo Camera');
  await expect(summary.locator('[data-exif-summary="iso"]')).toContainText('ISO 200');
  await expect(summary.locator('[data-exif-summary="gps"]')).toContainText('48.858400, 2.294500');
  await expect(page.locator('.report-sections')).toContainText('ViewExif Demo');
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('.sample-image-badge p')).toHaveText(locales[0].note);
  await expect(page.locator('.report-photo-details')).toHaveAttribute('open', '');
  await page.locator('.report-photo-details > summary').click();
  await expect(page.locator('.report-photo-details')).not.toHaveAttribute('open', '');
  await page.locator('.report-heading').getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.sample-image-badge')).toHaveCount(0);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await resultReady(page, tools[0]);
  await expect(page.locator('.report-photo-details')).toHaveAttribute('open', '');
  await expect(summary.locator('[data-exif-summary="iso"]')).toBeVisible();
  await expect(summary.locator('[data-exif-summary="iso"]')).toContainText('ISO 200');
  expect(pickerCount()).toBe(0);
});

test('sample click produces real GPS and identity privacy risks', async ({ page }) => {
  test.setTimeout(120_000);
  const pickerCount = trackPickers(page);
  await openTool(page, tools[1].path);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await resultReady(page, tools[1]);
  await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete');
  await expect(page.locator('#risk-precise-location')).toBeVisible();
  await expect(page.locator('#risk-creator-identity')).toBeVisible();
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('.privacy-cleanup-result')).toHaveCount(0);
  expect(pickerCount()).toBe(0);
});

test('removal sample stops at ready and supports manual cleanup and both downloads', async ({ page }) => {
  test.setTimeout(180_000);
  const pickerCount = trackPickers(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await openTool(page, tools[2].path);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await resultReady(page, tools[2]);
  const clean = page.getByRole('button', { name: 'Create and verify clean copy', exact: true });
  await expect(clean).toBeEnabled();
  await expect(page.locator('.removal-result')).toHaveCount(0);
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await clean.click();
  const result = page.locator('.removal-result');
  await expect(result).toBeVisible({ timeout: 90_000 });
  await expect(result).not.toHaveClass(/is-blocked/);
  await expect(page.locator('#removal-result-title')).toBeFocused();
  const groups = result.locator('.removal-diff-grid > details');
  await expect(groups).toHaveCount(3);
  await expect(groups.locator(':scope > summary .disclosure-label')).toHaveText(['Removed fields', 'Intentionally preserved', 'Residual metadata']);
  await expect(result.locator('.removal-diff-grid > details[open]')).toHaveCount(0);
  const counts = await groups.locator(':scope > summary b').allTextContents();
  expect(counts.map(Number).every((count) => count > 0)).toBe(true);
  await expect(result.locator('.removal-download-note, #removal-download-note')).toContainText('remain');
  for (const group of await groups.all()) {
    await expect(group.locator(':scope > summary')).toBeVisible();
    await group.locator(':scope > summary').click();
    await expect(group.locator(':scope > div').first()).toBeVisible();
    await group.locator(':scope > summary').click();
    await expect(group.locator(':scope > div').first()).not.toBeVisible();
  }
  const copyEvent = page.waitForEvent('download');
  const downloadLabel = /\bis-(verified-residual|incomplete)\b/.test(await result.getAttribute('class') ?? '') ? 'Download processed copy' : 'Download clean copy';
  await result.locator('.result-action-bar').getByRole('button', { name: downloadLabel, exact: true }).click();
  const copy = await copyEvent;
  expect(copy.suggestedFilename()).toBe('viewexif-metadata-demo-clean.jpg');
  const cleanedBytes = await readFile((await copy.path())!);
  expect(cleanedBytes.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  await result.locator('details.result-export-menu > summary').click();
  const receiptEvent = page.waitForEvent('download');
  await result.getByRole('button', { name: 'Download receipt', exact: true }).click();
  const receiptDownload = await receiptEvent;
  expect(receiptDownload.suggestedFilename()).toMatch(/\.metadata-cleanup\.json$/);
  const receipt = JSON.parse(await readFile((await receiptDownload.path())!, 'utf8'));
  expect(receipt.schemaVersion).toBe('1.0');
  expect(receipt.source.type).toBe('jpeg');
  expect(receipt.counts.removed).toBeGreaterThan(0);
  expect(receipt.counts.residual).toBeGreaterThan(0);
  expect(counts.map(Number)).toEqual([receipt.counts.removed, receipt.counts.preserved, receipt.counts.residual]);
  expect(receipt.checks.every((check: { status: string }) => check.status !== 'failed')).toBe(true);
  await groups.first().locator(':scope > summary').click();
  await result.locator('details.result-export-menu > summary').click();
  await result.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(result).toHaveCount(0);
  await clean.click();
  await expect(result).toBeVisible({ timeout: 90_000 });
  await expect(result.locator('.removal-diff-grid > details[open]')).toHaveCount(0);
  const cleanInput = await openTool(page, tools[1].path);
  await cleanInput.setInputFiles({ name: 'cleaned-sample.jpg', mimeType: 'image/jpeg', buffer: cleanedBytes });
  await resultReady(page, tools[1], 'cleaned-sample.jpg');
  await expect(page.locator('#risk-precise-location')).toHaveCount(0);
  await expect(page.locator('#risk-creator-identity')).toHaveCount(0);
  expect(pickerCount()).toBe(0);
});

test('C2PA sample runs the official verifier and exports its real signed manifest', async ({ page }) => {
  test.setTimeout(180_000);
  const pickerCount = trackPickers(page);
  const bytes = await readFile(`public${signedAsset}`);
  await openTool(page, tools[3].path);
  await page.getByRole('button', { name: 'Try sample', exact: true }).click();
  await resultReady(page, tools[3]);
  await expect(page.getByRole('heading', { name: 'No Content Credentials', exact: true })).toHaveCount(0);
  await expect(page.locator('.c2pa-hash code')).toHaveText(createHash('sha256').update(bytes).digest('hex'));
  await expect(page.locator('.sample-image-badge')).toContainText('signed Adobe test image');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('.c2pa-result-actions.result-action-bar').getByRole('button', { name: 'Download report', exact: true }).click();
  const report = JSON.parse(await readFile((await (await downloadEvent).path())!, 'utf8'));
  expect(report.status).not.toBe('not-found');
  expect(report).toMatchObject({ status: 'valid', checks: { binding: 'passed', signature: 'passed', publisherTrust: 'not-checked', revocation: 'unknown' } });
  expect(report.activeManifestLabel).toBeTruthy();
  expect(report.manifests.length).toBeGreaterThan(0);
  expect(pickerCount()).toBe(0);
});

for (const language of [
  { prefix: '/zh-cn', sample: '测试案例', clean: '生成并验证清理副本', groups: ['已清除字段', '有意保留', '残留元数据'] },
  { prefix: '/de', sample: 'Beispiel testen', clean: 'Saubere Kopie erstellen und prüfen', groups: ['Entfernte Felder', 'Bewusst beibehalten', 'Rest-Metadaten'] },
  { prefix: '/fr', sample: 'Tester un exemple', clean: 'Créer et vérifier la copie nettoyée', groups: ['Champs retirés', 'Conservés volontairement', 'Métadonnées résiduelles'] },
]) {
  test(`${language.prefix} cleanup field groups stay compact with visible residual counts`, async ({ page }) => {
    test.setTimeout(180_000);
    await openTool(page, `${language.prefix}${tools[2].path}`);
    await page.getByRole('button', { name: language.sample, exact: true }).click();
    await resultReady(page, tools[2]);
    await page.getByRole('button', { name: language.clean, exact: true }).click();
    const result = page.locator('.removal-result');
    await expect(result).toBeVisible({ timeout: 90_000 });
    const groups = result.locator('.removal-diff-grid > details');
    await expect(groups.locator(':scope > summary .disclosure-label')).toHaveText(language.groups);
    await expect(result.locator('.removal-diff-grid > details[open]')).toHaveCount(0);
    expect(Number(await groups.last().locator(':scope > summary b').textContent())).toBeGreaterThan(0);
    await expect(result.locator('#removal-download-note')).toBeVisible();
    for (const width of [320, 375, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      for (const group of await groups.all()) {
        const summary = group.locator(':scope > summary');
        await expect(summary).toBeVisible();
        expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await expect(summary.locator('svg')).toBeVisible();
      }
    }
    await groups.last().locator(':scope > summary').click();
    await expect(groups.last().locator(':scope > div').first()).toBeVisible();
    await groups.last().locator(':scope > summary').click();
    await expect(groups.last().locator(':scope > div').first()).not.toBeVisible();
  });
}

for (const tool of tools) {
  test(`${tool.name}: cancel and personal selection supersede an unfinished sample fetch`, async ({ page }) => {
    test.setTimeout(180_000);
    const bytes = await readFile(`public${tool.asset}`);
    const pickerCount = trackPickers(page);
    await openTool(page, tool.path);
    const canceled = await delaySample(page, tool.asset, bytes);
    try {
      await page.getByRole('button', { name: 'Try sample', exact: true }).click();
      await canceled.seen;
      await page.locator('.sample-image-bar').getByRole('button', { name: 'Cancel', exact: true }).click();
      await canceled.release();
      await expect(page.getByRole('button', { name: 'Try sample', exact: true })).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Try sample', exact: true })).toBeFocused();
      await expect(page.locator('.sample-image-badge')).toHaveCount(0);
      await expect(page.locator(tool.heading)).toHaveCount(0);
      expect(canceled.count()).toBe(1);
      expect(pickerCount()).toBe(0);
    } finally {
      await canceled.remove();
    }

    const superseded = await delaySample(page, tool.asset, bytes);
    try {
      await page.getByRole('button', { name: 'Try sample', exact: true }).click();
      await superseded.seen;
      const chooserEvent = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: tool.choose, exact: true }).click();
      await (await chooserEvent).setFiles({ name: 'own-image.jpg', mimeType: 'image/jpeg', buffer: bytes });
      await superseded.release();
      await resultReady(page, tool, 'own-image.jpg');
      await expect(page.locator('.sample-image-badge')).toHaveCount(0);
      await expect(page.locator(tool.heading)).not.toContainText(tool.fileName);
      expect(superseded.count()).toBe(1);
      expect(pickerCount()).toBe(1);
    } finally {
      await superseded.remove();
    }
  });

  test(`${tool.name}: a missing sample can be retried and repeated clicks share one request`, async ({ page }) => {
    test.setTimeout(180_000);
    const bytes = await readFile(`public${tool.asset}`);
    const pickerCount = trackPickers(page);
    let failures = 0;
    await page.route(`**${tool.asset}`, async (route) => {
      failures += 1;
      await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Sample unavailable' });
    }, { times: 1 });
    await openTool(page, tool.path);
    await page.getByRole('button', { name: 'Try sample', exact: true }).click();
    const bar = page.locator('.sample-image-bar');
    await expect(bar.getByRole('alert')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Retry sample', exact: true })).toBeEnabled();
    expect(failures).toBe(1);

    const retry = await delaySample(page, tool.asset, bytes);
    try {
      // Two immediate activations must never start parallel sample downloads.
      await bar.getByRole('button', { name: 'Retry sample', exact: true }).evaluate((button) => {
        (button as HTMLButtonElement).click();
        (button as HTMLButtonElement).click();
      });
      await retry.seen;
      await expect(bar.getByRole('button', { name: 'Loading sample…', exact: true })).toBeDisabled();
      expect(retry.count()).toBe(1);
      await retry.release();
      await resultReady(page, tool);
      await expect(page.locator('.sample-image-badge')).toBeVisible();
      await expect(page.locator('.sample-image-error')).toHaveCount(0);
      expect(retry.count()).toBe(1);
      expect(pickerCount()).toBe(0);
    } finally {
      await retry.remove();
    }
  });
}
