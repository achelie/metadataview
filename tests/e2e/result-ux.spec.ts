import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const languages = [
  { path: '/', sample: 'Try sample', title: 'EXIF Summary', more: 'More photo details', iso: 'ISO', search: 'camera' },
  { path: '/zh-cn/', sample: '测试案例', title: 'EXIF 摘要', more: '更多拍摄参数', iso: 'ISO', search: '相机' },
  { path: '/de/', sample: 'Beispiel testen', title: 'EXIF-Übersicht', more: 'Weitere Aufnahmedaten', iso: 'ISO', search: 'Kamera' },
  { path: '/fr/', sample: 'Tester un exemple', title: 'Résumé EXIF', more: 'Autres paramètres photo', iso: 'ISO', search: 'appareil' },
] as const;

async function example(page: Page, path: string, name: string) {
  await page.goto(path);
  await expect(page.locator('astro-island').filter({ has: page.locator('input[type="file"]') }).first()).not.toHaveAttribute('ssr', '');
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.locator('.sample-image-badge')).toBeVisible();
  await expect(page.locator('section.workbench')).toHaveAttribute('aria-busy', 'false', { timeout: 90_000 });
}

for (const locale of languages) {
  test(`${locale.path} photo result keeps the preview, download, and key fields compact`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await example(page, locale.path, locale.sample);
    const summary = page.locator('.home-exif-summary');
    await expect(summary.locator('h3')).toHaveText(locale.title);
    await expect(summary.locator(':scope > dl > div')).toHaveCount(3);
    const photoDetails = page.locator('.report-photo-details');
    await expect(photoDetails).toHaveAttribute('open', '');
    await expect(summary.locator('[data-exif-summary="iso"]')).toBeVisible();
    await expect(page.locator('.report-file-details')).not.toHaveAttribute('open', '');
    await expect(page.locator('.report-heading-preview img')).toBeVisible();
    await expect(page.locator('.map-open-button')).toHaveCount(1);
    await expect(page.locator('a[href*="openstreetmap.org"]')).toHaveCount(0);
    for (const width of [320, 375, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(page.locator('.report-export-actions')).toHaveAttribute('data-floating', 'false');
      const layout = await page.evaluate(() => {
        const header = document.querySelector('.report-heading')!.getBoundingClientRect();
        const actions = document.querySelector('.result-action-slot')!.getBoundingClientRect();
        const summary = document.querySelector('.home-exif-summary')!.getBoundingClientRect();
        const ledger = document.querySelector('.report-ledger')!.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          actionsAfterHeader: actions.top >= header.bottom,
          actionsBeforeSummary: actions.bottom <= summary.top,
          summaryBeforeLedger: summary.bottom < ledger.top,
          summaryHeight: summary.height,
          oversized: [...document.querySelectorAll('section.workbench *')].filter((el) => el.getClientRects().length && Number.parseFloat(getComputedStyle(el).fontSize) > 28).map((el) => el.tagName),
        };
      });
      expect(layout).toMatchObject({ overflow: false, actionsAfterHeader: true, actionsBeforeSummary: true, summaryBeforeLedger: true, oversized: [] });
      // All nine fields are visible; French labels and the GPS note wrap at 320px.
      expect(layout.summaryHeight).toBeLessThan(width < 680 ? 960 : 600);
      if (width === 390 || width === 1440) {
        await page.locator('.report-heading').scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath(`result-${width}.png`), fullPage: false });
      }
    }
    await page.getByText(locale.more, { exact: true }).click();
    await expect(photoDetails).not.toHaveAttribute('open', '');
    await expect(summary.locator('[data-exif-summary="iso"]')).not.toBeVisible();
    await page.getByText(locale.more, { exact: true }).click();
    await expect(summary.locator('[data-exif-summary="iso"]')).toBeVisible();
    await expect(summary.locator('[data-exif-summary="iso"]')).toContainText('ISO 200');
    await page.getByText(locale.more, { exact: true }).click();
    await page.locator('.report-controls input').fill(locale.search);
    await expect(photoDetails).not.toHaveAttribute('open', '');
    await expect(page.locator('.report-section[open] .report-field-list')).not.toHaveCount(0);
    await expect(page.locator('.report-sections')).toContainText('ViewExif');
  });
}

test('mobile report actions float once, keep menus in view, export real files, and clear', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await example(page, '/', 'Try sample');
  await page.locator('.report-ledger').scrollIntoViewIfNeeded();
  const actions = page.locator('.report-export-actions');
  await expect(actions).toHaveAttribute('data-floating', 'true');
  await expect(page.locator('.result-action-bar[data-floating="true"]')).toHaveCount(1);
  const menu = actions.locator('.result-export-menu');
  await menu.locator('summary').click();
  const box = await menu.locator('.result-export-options').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await menu.getByRole('button', { name: 'Complete JSON', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').click();
  const jsonEvent = page.waitForEvent('download');
  await menu.getByRole('button', { name: 'Complete JSON', exact: true }).click();
  const jsonDownload = await jsonEvent;
  const report = JSON.parse(await readFile((await jsonDownload.path())!, 'utf8'));
  expect(report.schemaVersion).toBe('1.1');
  expect(report.file.name).toBe('viewexif-metadata-demo.jpg');
  expect(JSON.stringify(report)).toContain('48.8584');
  await expect(menu).not.toHaveAttribute('open', '');
  const pdfEvent = page.waitForEvent('download');
  await actions.getByRole('button', { name: 'Download report (PDF)', exact: true }).click();
  const pdf = await pdfEvent;
  expect((await readFile((await pdf.path())!)).subarray(0, 5).toString()).toBe('%PDF-');
  await page.locator('.report-heading').getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('.result-action-bar')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Try sample', exact: true })).toBeVisible();
});

test('French privacy cleanup puts an honest verdict and download before translated details', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 375, height: 900 });
  await example(page, '/fr/image-privacy-checker/', 'Tester un exemple');
  await expect(page.locator('.privacy-score-number')).toContainText('Score de risque');
  await expect(page.locator('.privacy-score-number')).toContainText('Plus le score est bas');
  await expect(page.locator('.privacy-cleanup-run')).toContainText('risque(s) peuvent être supprimés');
  await expect(page.locator('.privacy-cleanup-run')).not.toContainText('risks are cleanup');
  await page.getByRole('button', { name: 'Créer et vérifier la copie nettoyée', exact: true }).click();
  const result = page.locator('.privacy-cleanup-result');
  await expect(result).toBeVisible({ timeout: 90_000 });
  const navigation = await page.getByRole('banner').boundingBox();
  await expect.poll(async () => (await page.locator('#privacy-cleanup-result-heading').boundingBox())!.y).toBeGreaterThanOrEqual(navigation!.y + navigation!.height);
  await expect(result.locator('.privacy-cleanup-details')).not.toHaveAttribute('open', '');
  await expect(result.locator('.privacy-cleanup-risk-counts')).toContainText('Risques restants');
  await result.locator('.result-action-slot').scrollIntoViewIfNeeded();
  await expect(page.locator('.privacy-report-actions-compact .result-action-bar')).toHaveAttribute('data-floating', 'false');
  const actionBox = await result.locator('.result-action-slot').boundingBox();
  const detailBox = await result.locator('.privacy-cleanup-details').boundingBox();
  expect(actionBox!.y).toBeLessThan(detailBox!.y);
  const download = page.waitForEvent('download');
  await result.locator('.result-action-bar > button').click();
  expect((await download).suggestedFilename()).toBe('viewexif-metadata-demo-clean.jpg');
  await result.locator('.privacy-cleanup-details > summary').click();
  await expect(result.locator('.privacy-cleanup-checks')).toContainText('JPEG');
  await expect(result.locator('.privacy-cleanup-checks')).not.toContainText('Output signature is');
  await expect(result.locator('.privacy-cleanup-checks')).not.toContainText('Display dimensions remain');
  await result.locator('.privacy-cleanup-checks').scrollIntoViewIfNeeded();
  await expect(page.locator('.result-action-bar[data-floating="true"]')).toHaveCount(1);
});

test('signed C2PA checks and action names use the selected language without changing raw codes', async ({ page }) => {
  test.setTimeout(180_000);
  const copy = [
    { path: '/', sample: 'Try sample', timestamp: 'Time stamp validated', created: 'Created' },
    { path: '/zh-cn/', sample: '测试案例', timestamp: '时间戳验证通过', created: '创建' },
    { path: '/de/', sample: 'Beispiel testen', timestamp: 'Zeitstempel bestätigt', created: 'Erstellt' },
    { path: '/fr/', sample: 'Tester un exemple', timestamp: 'Horodatage validé', created: 'Création' },
  ];
  for (const language of copy) {
    await example(page, `${language.path}c2pa-viewer/`, language.sample);
    const checks = page.locator('.c2pa-validation-panel');
    await expect(checks.getByRole('heading', { name: language.timestamp, exact: true })).toBeVisible();
    await expect(checks.locator('code').filter({ hasText: /^timeStamp\.validated$/ })).toBeVisible();
    await expect(page.locator('.c2pa-action-list strong').filter({ hasText: language.created })).toBeVisible();
    await page.locator('.c2pa-search input').fill(language.timestamp);
    await expect(checks.getByRole('heading', { name: language.timestamp, exact: true })).toBeVisible();
    await page.locator('.c2pa-search input').clear();
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
  }
});
