import { expect, test, type Page } from '@playwright/test';

const ARTICLE_PATH = '/blog/do-screenshots-have-metadata/';
const ARTICLE_TITLE = 'Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save';
const WHATSAPP_PATH = '/blog/does-whatsapp-remove-exif-data/';
const WHATSAPP_TITLE = 'Does WhatsApp Remove EXIF Data? Photos, Dates, and GPS Explained';
const INSTAGRAM_PATH = '/blog/does-instagram-remove-exif-data/';
const INSTAGRAM_TITLE = 'Does Instagram Remove EXIF Data? What Photos Still Reveal';
const DISCORD_PATH = '/blog/does-discord-remove-exif-data/';
const DISCORD_TITLE = 'Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained';

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
  await expect(page.locator('.blog-latest')).toHaveCount(1);
  await expect(page.getByRole('link', { name: ARTICLE_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveAttribute('href', INSTAGRAM_PATH);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveAttribute('href', DISCORD_PATH);
  await expect(page.locator('.blog-latest .blog-post-card')).toHaveCount(3);
  await expect(page.locator('.blog-latest .blog-post-card__media img')).toHaveCount(3);
  await expect(page.locator('.blog-latest .blog-post-card__media img').first()).toHaveAttribute('src', /does-discord-remove-exif-data/);
  await expect(page.locator('.blog-feature .blog-post-card__media img')).toHaveAttribute('src', /do-screenshots-have-metadata/);
  await expect(page.locator('.blog-feature').getByText('Image privacy', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View image metadata' })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.locator('.desktop-nav > a[href="/blog/"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.site-footer a[href="/blog/"]')).toHaveText('Blog');
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const collection = schemas.find((schema) => schema['@type'] === 'CollectionPage');
  expect(collection.mainEntity.itemListElement.map((item: { name: string }) => item.name)).toEqual([DISCORD_TITLE, INSTAGRAM_TITLE, WHATSAPP_TITLE, ARTICLE_TITLE]);
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

test('article renders the byline, concise contents, practical take, FAQ, and tool links', async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  await expect(page.getByRole('heading', { level: 1, name: ARTICLE_TITLE })).toBeVisible();
  await expect(page.getByText('MetadataView Editorial Team', { exact: true })).toBeVisible();
  await expect(page.getByText('MetadataView product engineering', { exact: true })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-09/);
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /hand using a smartphone/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(7);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'What a screenshot usually keeps' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(6);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.locator('.blog-byline__date small')).toHaveText(/[45] min read/);
  await expect(page.getByRole('link', { name: /View image metadata/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Check image privacy/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Make a cleaner copy/ })).toHaveAttribute('href', '/image-metadata-remover/');
  await page.locator('.blog-toc a[href="#how-to-check-the-file-you-will-share"]').click();
  await expect(page).toHaveURL(/#how-to-check-the-file-you-will-share$/);
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

test('WhatsApp guide answers real date, filename, and recovery questions without a sources block', async ({ page }) => {
  await page.goto(WHATSAPP_PATH);
  await expect(page.getByRole('heading', { level: 1, name: WHATSAPP_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-10/);
  await expect(page.locator('.blog-byline__date small')).toHaveText('4 min read');
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /WhatsApp and Signal messaging app icons/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'Why WhatsApp photos land on the wrong date' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A WhatsApp filename is a clue, not proof' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can you recover EXIF after WhatsApp removed it?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(3);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: ARTICLE_TITLE, exact: true })).toHaveAttribute('href', ARTICLE_PATH);
  await expect(page.getByRole('link', { name: /View image metadata/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Check image privacy/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Make a cleaner copy/ })).toHaveAttribute('href', '/image-metadata-remover/');
});

test('WhatsApp guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(WHATSAPP_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${WHATSAPP_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(WHATSAPP_TITLE);
  expect(posting.keywords).toContain('WhatsApp');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('Instagram guide answers separate privacy, recovery, ranking, and reused-content questions', async ({ page }) => {
  await page.goto(INSTAGRAM_PATH);
  await expect(page.getByRole('heading', { level: 1, name: INSTAGRAM_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-11/);
  await expect(page.locator('.blog-byline__date small')).toHaveText('5 min read');
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /Instagram photo grid/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Can someone recover the original EXIF from an Instagram download?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can an Instagram photo reveal your IP or home address?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does changing the EXIF date improve Instagram reach?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does removing metadata beat reused-content detection?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(5);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  await expect(page.getByRole('link', { name: ARTICLE_TITLE, exact: true })).toHaveAttribute('href', ARTICLE_PATH);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10)).toBe(true);
});

test('Instagram guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(INSTAGRAM_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${INSTAGRAM_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(INSTAGRAM_TITLE);
  expect(posting.keywords).toContain('Instagram');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('Discord guide covers photos, old videos, PNG data, location clues, and archive dates', async ({ page }) => {
  await page.goto(DISCORD_PATH);
  await expect(page.getByRole('heading', { level: 1, name: DISCORD_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-12/);
  await expect(page.locator('.blog-byline__date small')).toHaveText('5 min read');
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /smartphone beside a computer/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Can someone recover EXIF from a Discord download?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why did Discord videos leak GPS in 2020?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does Discord keep PNG metadata and custom chunks?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can a Discord image reveal your IP or address?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why do saved Discord images show the wrong date?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(5);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveAttribute('href', INSTAGRAM_PATH);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  await expect(page.getByRole('link', { name: ARTICLE_TITLE, exact: true })).toHaveAttribute('href', ARTICLE_PATH);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10)).toBe(true);
});

test('Discord guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(DISCORD_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${DISCORD_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(DISCORD_TITLE);
  expect(posting.keywords).toContain('Discord');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

for (const article of [
  { path: ARTICLE_PATH, title: ARTICLE_TITLE, label: 'screenshots' },
  { path: WHATSAPP_PATH, title: WHATSAPP_TITLE, label: 'WhatsApp' },
  { path: INSTAGRAM_PATH, title: INSTAGRAM_TITLE, label: 'Instagram' },
  { path: DISCORD_PATH, title: DISCORD_TITLE, label: 'Discord' },
]) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 239, height: 844 }]) {
    test(`${article.label} article stays readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const consoleErrors: string[] = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      await page.goto(article.path);
      await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
      await expect(page.locator('.blog-toc-mobile')).toBeVisible();
      await page.locator('.blog-toc-mobile summary').click();
      await expect(page.locator('.blog-toc-mobile nav')).toBeVisible();
      await assertNoHorizontalOverflow(page);
      expect(consoleErrors).toEqual([]);
    });
  }
}
