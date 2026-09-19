import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const locales = [
  { path: '', title: 'No Content Credentials found', sample: 'Try signed sample' },
  { path: '/zh-cn', title: '未找到内容凭证', sample: '试试带签名的样例' },
  { path: '/de', title: 'Keine Content Credentials gefunden', sample: 'Signiertes Beispiel testen' },
  { path: '/fr', title: 'Aucun Content Credential trouvé', sample: 'Tester un exemple signé' },
];

for (const locale of locales) {
  test(`${locale.path || 'en'}: no credentials gives a compact explanation and preserves the real report`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    let pickers = 0;
    page.on('filechooser', () => { pickers++; });
    await page.goto(`${locale.path}/c2pa-viewer/`);
    await expect(page.locator('astro-island').first()).not.toHaveAttribute('ssr', '');
    await page.locator('input[type=file]').setInputFiles({ name: 'ordinary-photo.jpg', mimeType: 'image/jpeg', buffer: await readFile('public/samples/metadata-demo-v1.jpg') });
    const result = page.locator('.c2pa-no-credentials');
    await expect(result).toBeVisible({ timeout: 60_000 });
    await expect(result.locator('h3')).toHaveText(locale.title);
    await expect(result.locator('.c2pa-no-preview img')).toBeVisible();
    await expect(page.locator('.c2pa-evidence-stack, .c2pa-checks, .c2pa-asset-copy')).toHaveCount(0);
    await expect(result.locator('.c2pa-no-diagnostics')).not.toHaveAttribute('open', '');
    const hash = await result.locator('.c2pa-no-fingerprint code').innerText();
    const download = page.waitForEvent('download');
    await page.locator('.c2pa-result-actions > button').click();
    const report = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
    expect(report.status).toBe('not-found');
    expect(report.fingerprint.value).toBe(hash);
    expect(report.checks).toMatchObject({ signature: 'not-applicable', binding: 'not-applicable' });
    for (const width of [320, 375, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        oversized: [...document.querySelectorAll('.c2pa-no-credentials *')].filter(el => el.getClientRects().length && Number.parseFloat(getComputedStyle(el).fontSize) > 28).length,
        height: document.querySelector('.c2pa-no-summary')!.getBoundingClientRect().height,
      }));
      expect(layout.overflow).toBeLessThanOrEqual(1);
      expect(layout.oversized).toBe(0);
      expect(layout.height).toBeLessThan(1100);
      if (width === 390 || width === 1440) {
        await result.locator('h3').scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath(`c2pa-empty-${width}.png`) });
      }
    }
    await result.locator('[data-tool-file-link]').click();
    await expect(page).toHaveURL(`${locale.path}/image-metadata-viewer/`);
    await expect(page.locator('.report-heading h2')).toContainText('ordinary-photo.jpg');
    await expect(page.locator('[data-exif-summary="camera"]')).toContainText('Demo Camera');
    expect(pickers).toBe(0);
  });
}

test('an unsigned result can load a real signed sample, retry a failure, and cancel without losing the result', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/c2pa-viewer/');
  await expect(page.locator('astro-island').first()).not.toHaveAttribute('ssr', '');
  await page.locator('input[type=file]').setInputFiles({ name: 'ordinary.jpg', mimeType: 'image/jpeg', buffer: await readFile('public/samples/metadata-demo-v1.jpg') });
  const result = page.locator('.c2pa-no-credentials');
  await expect(result).toBeVisible({ timeout: 60_000 });
  await page.route('**/samples/c2pa-signed-v1.jpg', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await result.getByRole('button', { name: 'Try signed sample', exact: true }).click();
  await expect(result.getByRole('alert')).toBeVisible();
  await expect(result.getByRole('button', { name: 'Retry signed sample', exact: true })).toBeEnabled();
  await page.unroute('**/samples/c2pa-signed-v1.jpg');
  let release!: () => void;
  let seen!: () => void;
  const requested = new Promise<void>(resolve => { seen = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/samples/c2pa-signed-v1.jpg', async route => { seen(); await held; await route.continue().catch(() => {}); });
  await result.getByRole('button', { name: 'Retry signed sample', exact: true }).click();
  await requested;
  await result.getByRole('button', { name: 'Cancel', exact: true }).click();
  release();
  await expect(result.getByRole('button', { name: 'Try signed sample', exact: true })).toBeEnabled();
  await expect(page.locator('.c2pa-report-heading h2')).toHaveText('ordinary.jpg');
  await page.unroute('**/samples/c2pa-signed-v1.jpg');
  await result.getByRole('button', { name: 'Try signed sample', exact: true }).click();
  await expect(page.locator('.c2pa-report-heading h2')).toHaveText('adobe-20220124-C.jpg', { timeout: 60_000 });
  await expect(page.locator('.c2pa-no-credentials')).toHaveCount(0);
  await expect(page.locator('.c2pa-validation-panel')).toBeVisible();
  await expect(page.locator('.sample-image-badge')).toContainText('Adobe');
});
