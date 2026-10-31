import { expect, test } from '@playwright/test';

const sharing = '/guides/sharing-metadata/';
const formats = '/guides/metadata-by-file-type/';
const platforms = ['whatsapp', 'telegram', 'discord', 'reddit', 'gmail', 'instagram'];

test('topic guides connect existing articles, tools and each other', async ({ page, request }) => {
  await page.goto(sharing);
  for (const platform of platforms) {
    const article = `/blog/does-${platform}-remove-exif-data/`;
    await expect(page.locator(`.guide-hub a[href="${article}"]`)).toHaveCount(1);
    await page.goto(article);
    await expect(page.locator(`.article-topics a[href="${sharing}"]`)).toBeVisible();
    await page.goto(sharing);
  }
  await expect(page.locator(`.guide-next a[href="${formats}"]`)).toBeVisible();
  await page.goto(formats);
  for (const name of ['Images and screenshots', 'Video', 'Documents', 'Audio']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.locator(`.guide-next a[href="${sharing}"]`)).toBeVisible();
  await page.goto('/blog/remove-metadata-from-mp4/');
  await expect(page.locator(`.article-topics a[href="${formats}"]`)).toBeVisible();
  for (const path of [sharing, formats]) {
    await page.goto(path);
    const cover = page.locator('.guide-cover img');
    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute('alt', /.+/);
    expect(await cover.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 1600 && image.naturalHeight === 900)).toBeTruthy();
    const coverSrc = await cover.getAttribute('src');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://www.viewexif.com${coverSrc}`);
    await expect(page.locator('head title')).not.toBeEmpty();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${path}`);
    expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining('CollectionPage'), expect.stringContaining('BreadcrumbList')]));
    for (const href of await page.locator('.guide-hub a').evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of [sharing, formats]) expect(sitemap).toContain(`https://www.viewexif.com${path}`);
});

test('reading routes appear on home and blog in the expected language', async ({ page }) => {
  for (const path of ['/', '/de/', '/fr/', '/zh-cn/', '/blog/']) {
    await page.goto(path);
    const nav = page.locator('.reading-routes');
    await expect(nav.locator(`a[href="${sharing}"]`)).toHaveAttribute('hreflang', 'en');
    await expect(nav.locator(`a[href="${formats}"]`)).toHaveAttribute('hreflang', 'en');
    await expect(nav.locator('p')).toContainText(path === '/zh-cn/' ? '英文' : path === '/de/' ? 'Englisch' : path === '/fr/' ? 'anglais' : 'English');
  }
});

for (const width of [320, 375, 390, 430, 1280]) {
  test(`topic pages remain readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    for (const path of [sharing, formats, '/']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      const scope = path === '/' ? '.reading-routes' : '.guide-hub';
      const measurements = await page.locator(`${scope} a, ${scope} h1, ${scope} h2, ${scope} p, ${scope} span, ${scope} strong`).evaluateAll((nodes) => nodes.map((node) => ({ size: parseFloat(getComputedStyle(node).fontSize), height: node.getBoundingClientRect().height, tag: node.tagName })));
      expect(measurements.every((item) => item.size <= 28)).toBeTruthy();
      expect(measurements.filter((item) => item.tag === 'A').every((item) => item.height >= 44)).toBeTruthy();
    }
  });
}

test('topic links can be opened with the keyboard', async ({ page }) => {
  await page.goto('/');
  const link = page.locator(`.reading-routes a[href="${sharing}"]`);
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${sharing}$`));
  const next = page.locator(`.guide-next a[href="${formats}"]`);
  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${formats}$`));
});
