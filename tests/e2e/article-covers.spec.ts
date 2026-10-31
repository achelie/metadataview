import { expect, test } from '@playwright/test';

const articles = [
  'exif-orientation-values', 'exif-timezone-offsettimeoriginal', 'how-to-read-c2pa-results',
  'verify-metadata-removal', 'why-metadata-is-missing',
];

test('five article covers load in the listing, article and share metadata', async ({ page }) => {
  await page.goto('/blog/');
  for (const slug of articles) {
    const card = page.locator(`.blog-post-card a[href="/blog/${slug}/"] img`);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('src', new RegExp(`${slug}.*\\.webp`));
    expect(await card.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy();
  }
  for (const slug of articles) {
    await page.goto(`/blog/${slug}/`);
    const image = page.locator('.blog-cover img');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', new RegExp(`${slug}.*\\.webp`));
    await expect(image).toHaveAttribute('alt', /.+/);
    const src = await image.getAttribute('src');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://www.viewexif.com${src}`);
  }
});
