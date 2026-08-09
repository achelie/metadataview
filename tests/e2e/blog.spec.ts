import { expect, test, type Page } from '@playwright/test';

const ARTICLE_PATH = '/blog/do-screenshots-have-metadata/';
const ARTICLE_TITLE = 'Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save';

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(1);
  expect(overflow.body).toBeLessThanOrEqual(1);
}

test('blog index features the first guide once and exposes the editorial navigation', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.getByText('Useful answers for files that overshare.')).toHaveCount(0);
  await expect(page.getByText('Metadata is small, invisible, and surprisingly chatty.')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: ARTICLE_TITLE })).toBeVisible();
  await expect(page.locator('.blog-feature .blog-post-card')).toHaveCount(1);
  await expect(page.locator('.blog-latest')).toHaveCount(0);
  await expect(page.getByRole('link', { name: ARTICLE_TITLE, exact: true })).toHaveCount(1);
  await expect(page.locator('.blog-post-card__media img')).toHaveAttribute('src', /do-screenshots-have-metadata/);
  await expect(page.getByText('Image privacy', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View image metadata' })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.locator('.desktop-nav > a[href="/blog/"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.site-footer a[href="/blog/"]')).toHaveText('Blog');
  await assertNoHorizontalOverflow(page);
});

test('mobile navigation exposes the current Blog route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const blogLink = page.locator('#mobile-navigation-drawer a[href="/blog/"]');
  await expect(blogLink).toBeVisible();
  await expect(blogLink).toHaveAttribute('aria-current', 'page');
  await blogLink.click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('article renders the byline, contents, practical take, FAQ, sources, and tool links', async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  await expect(page.getByRole('heading', { level: 1, name: ARTICLE_TITLE })).toBeVisible();
  await expect(page.getByText('MetadataView Editorial Team', { exact: true })).toBeVisible();
  await expect(page.getByText('MetadataView product engineering', { exact: true })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-09/);
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /hand using a smartphone/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(12);
  await expect(page.locator('.practical-take li')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Original photo metadata versus screenshot metadata' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(8);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources li')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /View image metadata/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Check image privacy/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Make a cleaner copy/ })).toHaveAttribute('href', '/image-metadata-remover/');
  await page.locator('.blog-toc a[href="#how-to-check-a-screenshot-before-sharing-it"]').click();
  await expect(page).toHaveURL(/#how-to-check-a-screenshot-before-sharing-it$/);
});

test('article metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${ARTICLE_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  const breadcrumb = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
  expect(posting.headline).toBe(ARTICLE_TITLE);
  expect(posting.author.name).toBe('MetadataView Editorial Team');
  expect(faq.mainEntity).toHaveLength(5);
  expect(breadcrumb.itemListElement).toHaveLength(3);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 239, height: 844 }]) {
  test(`blog article stays readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(ARTICLE_PATH);
    await expect(page.getByRole('heading', { level: 1, name: ARTICLE_TITLE })).toBeVisible();
    await expect(page.locator('.blog-toc-mobile')).toBeVisible();
    await page.locator('.blog-toc-mobile summary').click();
    await expect(page.locator('.blog-toc-mobile nav')).toBeVisible();
    await assertNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
  });
}
