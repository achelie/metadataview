import { expect, test } from '@playwright/test';

const toolPaths = [
  '/metadata-viewer/', '/image-metadata-viewer/', '/document-metadata-viewer/', '/video-metadata-viewer/', '/audio-metadata-viewer/',
  '/image-privacy-checker/', '/metadata-remover/', '/image-metadata-remover/', '/video-metadata-remover/', '/audio-metadata-remover/',
  '/document-metadata-remover/', '/c2pa-viewer/',
];

test('Chinese home and every translated route are generated with reciprocal SEO links', async ({ page }) => {
  for (const path of ['/', ...toolPaths, '/about/', '/privacy/']) {
    const zhPath = path === '/' ? '/zh-cn/' : `/zh-cn${path}`;
    const response = await page.goto(zhPath);
    expect(response?.ok(), zhPath).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${zhPath}`);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `https://www.viewexif.com${path}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute('href', `https://www.viewexif.com${zhPath}`);
  }
});

test('language ticket switches the same page both ways and English blog switches to Chinese home', async ({ page }) => {
  await page.goto('/image-metadata-viewer/');
  const toChinese = page.locator('.language-ticket');
  await expect(toChinese).toHaveAttribute('href', '/zh-cn/image-metadata-viewer/');
  await toChinese.click();
  await expect(page).toHaveURL(/\/zh-cn\/image-metadata-viewer\/$/);
  await expect(page.locator('.language-ticket')).toHaveAttribute('href', '/image-metadata-viewer/');

  await page.goto('/blog/');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await expect(page.locator('.language-ticket')).toHaveAttribute('href', '/zh-cn/');
});

test('Chinese links retain their prefix while Blog remains the English URL', async ({ page }) => {
  await page.goto('/zh-cn/');
  const nav = page.locator('.desktop-nav');
  await expect(nav.getByRole('link', { name: '检查隐私' })).toHaveAttribute('href', '/zh-cn/image-privacy-checker/');
  await expect(nav.getByRole('link', { name: '验证 C2PA' })).toHaveAttribute('href', '/zh-cn/c2pa-viewer/');
  await expect(nav.getByRole('link', { name: '博客' })).toHaveAttribute('href', '/blog/');
});

test('mobile language choices expose current state and remain usable at 239px', async ({ page }) => {
  await page.setViewportSize({ width: 239, height: 844 });
  await page.goto('/zh-cn/image-privacy-checker/');
  await page.getByRole('button', { name: '打开导航' }).click();
  const switcher = page.locator('.mobile-language-switch');
  await expect(switcher.getByRole('link', { name: '中文' })).toHaveAttribute('aria-current', 'true');
  await expect(switcher.getByRole('link', { name: 'EN' })).toHaveAttribute('href', '/image-privacy-checker/');
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test('Chinese workbenches expose localized file controls', async ({ page }) => {
  for (const [path, label] of [
    ['/zh-cn/metadata-viewer/', '选择文件'],
    ['/zh-cn/image-privacy-checker/', '选择图片'],
    ['/zh-cn/metadata-remover/', '选择文件'],
    ['/zh-cn/c2pa-viewer/', '选择文件'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
  }
});
