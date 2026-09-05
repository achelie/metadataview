import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const baseline = JSON.parse(readFileSync('docs/content-url-baseline.json', 'utf8')) as { canonical: string }[];
for (const width of [1440, 390, 239]) {
  test(`existing content remains readable at ${width}px`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const entry of baseline) {
      const route = new URL(entry.canonical).pathname;
      const response = await page.goto(route, { waitUntil: 'load' });
      expect(response?.status(), route).toBe(200);
      await expect(page.locator('h1'), route).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]'), route).toHaveAttribute('href', entry.canonical);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
      if (/metadata-(viewer|remover)|privacy-checker|c2pa-viewer/.test(route) || ['/', '/de/', '/fr/', '/zh-cn/'].includes(route)) {
        await expect(page.locator('.result-reading-guide'), route).toBeVisible();
      }
      if (['/', '/image-metadata-remover/', '/blog/how-to-check-metadata-of-an-image/'].includes(route)) {
        await page.screenshot({ path: `output/playwright/content-${route === '/' ? 'home' : route.split('/').filter(Boolean).pop()}-${width}.png`, fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}
