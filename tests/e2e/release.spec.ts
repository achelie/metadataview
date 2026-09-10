import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { ooxmlFixture, ooxmlMime } from '../fixtures/ooxml';

test.describe('Release regression', { tag: '@release' }, () => {
test.setTimeout(120_000);

async function select(page: Page, name: string, buffer: Buffer, mimeType: string) {
  const input = page.locator('input[type=file]');
  await expect(page.locator('astro-island[component-export="default"]').first()).not.toHaveAttribute('ssr', '');
  await input.setInputFiles({ name, buffer, mimeType });
}

async function png(page: Page) {
  return Buffer.from(await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 8; canvas.height = 8;
    const context = canvas.getContext('2d')!; context.fillStyle = '#ef6a38'; context.fillRect(0, 0, 8, 8);
    return Array.from(new Uint8Array(await (await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!)))).arrayBuffer()));
  }));
}

test('production routes hydrate in four languages without loading heavy engines', async ({ page }) => {
  const errors: string[] = []; const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  for (const prefix of ['', '/de', '/fr', '/zh-cn']) {
    await page.goto(`${prefix}/metadata-remover/`);
    await expect(page.locator('.removal-dropzone')).toBeVisible();
    await expect(page.locator('astro-island').first()).not.toHaveAttribute('ssr', '');
    await expect(page.locator('h1')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
  expect(requests.filter((url) => /\.wasm(?:\?|$)|\/fonts\//.test(url))).toEqual([]);
});

test('image cleanup verifies payload and downloads a receipt', async ({ page }) => {
  await page.goto('/metadata-remover/');
  await select(page, 'private.png', await png(page), 'image/png');
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.removal-result')).toBeVisible({ timeout: 60_000 });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download receipt' }).click();
  const receipt = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(receipt.checks).toContainEqual(expect.objectContaining({ id: 'content-payload', status: 'passed' }));
  expect(receipt.status).not.toBe('blocked');
});

test('Office cleanup proves untouched package contents match', async ({ page }) => {
  await page.goto('/document-metadata-remover/');
  await select(page, 'private.docx', Buffer.from(await ooxmlFixture('docx', { author: 'Private Name', bodyText: 'Preserve body' })), ooxmlMime('docx'));
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.removal-result')).toBeVisible({ timeout: 60_000 });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download receipt' }).click();
  const receipt = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(receipt.checks).toContainEqual(expect.objectContaining({ id: 'office-content', status: 'passed' }));
});

test('Unicode PDF export keeps the original filename', async ({ page }) => {
  await page.goto('/metadata-viewer/');
  await select(page, '旅行照片-张三.png', await png(page), 'image/png');
  await expect(page.getByRole('button', { name: 'Readable PDF', exact: true })).toBeEnabled({ timeout: 60_000 });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Readable PDF', exact: true }).click();
  const bytes = await readFile((await (await download).path())!);
  const { PDFDocument } = await import('pdf-lib');
  expect((await PDFDocument.load(bytes)).getTitle()).toBe('旅行照片-张三.png metadata report');
});

test('cold engine load stays usable under constrained CPU and network', async ({ page, browserName }, info) => {
  test.skip(browserName !== 'chromium', 'CDP throttling is Chromium-specific.');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1_000_000, uploadThroughput: 500_000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/metadata-viewer/');
  const source = await png(page);
  const start = Date.now();
  await select(page, 'cold.png', source, 'image/png');
  await expect(page.getByRole('button', { name: 'Complete JSON', exact: true })).toBeEnabled({ timeout: 100_000 });
  await info.attach('cold-load-budget.json', { body: JSON.stringify({ elapsedMs: Date.now() - start, downloadBytesPerSecond: 1_000_000, cpuSlowdown: 4 }), contentType: 'application/json' });
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.report-dropzone')).toBeVisible();
});

});
