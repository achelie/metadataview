import { expect, test, type Page } from '@playwright/test';

const ARTICLE_PATH = '/blog/do-screenshots-have-metadata/';
const ARTICLE_TITLE = 'Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save';
const WHATSAPP_PATH = '/blog/does-whatsapp-remove-exif-data/';
const WHATSAPP_TITLE = 'Does WhatsApp Remove EXIF Data? Photos, Dates, and GPS Explained';
const INSTAGRAM_PATH = '/blog/does-instagram-remove-exif-data/';
const INSTAGRAM_TITLE = 'Does Instagram Remove EXIF Data? What Photos Still Reveal';
const DISCORD_PATH = '/blog/does-discord-remove-exif-data/';
const DISCORD_TITLE = 'Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained';
const TELEGRAM_PATH = '/blog/does-telegram-remove-exif-data/';
const TELEGRAM_TITLE = 'Does Telegram Remove EXIF Data? Photos, Files, and GPS Explained';
const REDDIT_PATH = '/blog/does-reddit-remove-exif-data/';
const REDDIT_TITLE = 'Does Reddit Remove EXIF Data? Photos, GPS, and Upload Privacy';
const GMAIL_PATH = '/blog/does-gmail-remove-exif-data/';
const GMAIL_TITLE = 'Does Gmail Remove EXIF Data? What Photo Attachments Keep';
const GPS_REMOVAL_PATH = '/blog/how-to-remove-gps-data-from-photos-before-sharing/';
const GPS_REMOVAL_TITLE = 'How to Remove GPS Data from Photos Before Sharing';
const EXIF_DATA_PATH = '/blog/what-is-exif-data/';
const EXIF_DATA_TITLE = 'What Is EXIF Data?';
const EXIF_DATA_SEO_TITLE = 'What Is EXIF Data? GPS, Camera Info & Photo Metadata Explained | ViewExif';

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
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveAttribute('href', DISCORD_PATH);
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
  await expect(page.getByRole('link', { name: REDDIT_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: REDDIT_TITLE, exact: true })).toHaveAttribute('href', REDDIT_PATH);
  await expect(page.getByRole('link', { name: GMAIL_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: GMAIL_TITLE, exact: true })).toHaveAttribute('href', GMAIL_PATH);
  await expect(page.getByRole('link', { name: GPS_REMOVAL_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: GPS_REMOVAL_TITLE, exact: true })).toHaveAttribute('href', GPS_REMOVAL_PATH);
  await expect(page.getByRole('link', { name: EXIF_DATA_TITLE, exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: EXIF_DATA_TITLE, exact: true })).toHaveAttribute('href', EXIF_DATA_PATH);
  await expect(page.locator('.blog-latest .blog-post-card')).toHaveCount(6);
  await expect(page.locator('.blog-latest .blog-post-card__media img')).toHaveCount(6);
  await expect(page.locator('.blog-latest .blog-post-card__media img').first()).toHaveAttribute('src', /what-is-exif-data/);
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible();
  await expect(page.locator('.blog-pagination')).toBeVisible();
  await expect(page.locator('.blog-pagination [aria-current="page"]')).toHaveText('1');
  await expect(page.locator('.blog-pagination a[href="/blog/page/2/"]')).toHaveText('2');
  await expect(page.locator('.blog-feature .blog-post-card__media img')).toHaveAttribute('src', /do-screenshots-have-metadata/);
  await expect(page.locator('.blog-feature').getByText('Image privacy', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View image metadata' })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.locator('.desktop-nav > a[href="/blog/"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.site-footer a[href="/blog/"]')).toHaveText('Blog');
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const collection = schemas.find((schema) => schema['@type'] === 'CollectionPage');
  expect(collection.mainEntity.itemListElement.map((item: { name: string }) => item.name)).toEqual([EXIF_DATA_TITLE, GPS_REMOVAL_TITLE, GMAIL_TITLE, REDDIT_TITLE, TELEGRAM_TITLE, DISCORD_TITLE, INSTAGRAM_TITLE, WHATSAPP_TITLE, ARTICLE_TITLE]);
  await assertNoHorizontalOverflow(page);
});

test('regular guides continue on the second blog page without duplication', async ({ page }) => {
  await page.goto('/blog/page/2/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.viewexif.com/blog/page/2/');
  await expect(page.getByRole('heading', { level: 1, name: 'Latest metadata guides.' })).toBeVisible();
  await expect(page.locator('.blog-index__header > p')).toContainText('Page 2 of 2.');
  await expect(page.locator('.blog-latest .blog-post-card')).toHaveCount(2);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveAttribute('href', INSTAGRAM_PATH);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  expect(await page.locator('.blog-latest .blog-post-card h2 a').allTextContents()).toEqual([INSTAGRAM_TITLE, WHATSAPP_TITLE]);
  await expect(page.getByRole('link', { name: GPS_REMOVAL_TITLE, exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: EXIF_DATA_TITLE, exact: true })).toHaveCount(0);
  await expect(page.locator('.blog-pagination [aria-current="page"]')).toHaveText('2');
  await expect(page.locator('.blog-pagination a[href="/blog/"]')).toHaveText('1');
  await assertNoHorizontalOverflow(page);
});

test('mobile navigation exposes the current Blog route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const blogLink = page.locator('#mobile-navigation-drawer .mobile-nav-list > a[href="/blog/"]');
  await expect(blogLink).toBeVisible();
  await expect(blogLink).toHaveAttribute('aria-current', 'page');
  await blogLink.click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('article renders the byline, concise contents, practical take, FAQ, and tool links', async ({ page }) => {
  await page.goto(ARTICLE_PATH);
  await expect(page.getByRole('heading', { level: 1, name: ARTICLE_TITLE })).toBeVisible();
  await expect(page.getByText('ViewExif Editorial Team', { exact: true })).toBeVisible();
  await expect(page.getByText('ViewExif Product Engineering', { exact: true })).toBeVisible();
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
  expect(posting.author.name).toBe('ViewExif Editorial Team');
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
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
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
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
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
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
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

test('Telegram guide separates photo, file, HD, Secret Chat, forwarding, and visible clues', async ({ page }) => {
  await page.goto(TELEGRAM_PATH);
  await expect(page.getByRole('heading', { level: 1, name: TELEGRAM_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-13/);
  await expect(page.locator('.blog-byline__date small')).toHaveText('5 min read');
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /smartphone displaying a photo gallery/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Does Send as File keep GPS and camera details?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does Telegram HD remove EXIF data?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does Secret Chat strip image metadata?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What happens when you forward a Telegram image?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can Telegram reveal details after EXIF is gone?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(3);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveAttribute('href', DISCORD_PATH);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveAttribute('href', INSTAGRAM_PATH);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10)).toBe(true);
});

test('Telegram guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(TELEGRAM_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${TELEGRAM_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(TELEGRAM_TITLE);
  expect(posting.keywords).toContain('Telegram');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('Reddit guide separates hosted copies, linked originals, platform access, and visible clues', async ({ page }) => {
  await page.goto(REDDIT_PATH);
  await expect(page.getByRole('heading', { level: 1, name: REDDIT_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-14/);
  await expect(page.locator('.blog-byline__date small')).toHaveText(/[4-7] min read/);
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /person using a smartphone/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { level: 2, name: 'Can Reddit read EXIF before stripping it?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What changes when you post an image link?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why do Reddit downloads have different names and dates?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can someone recover the removed EXIF from Reddit?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can Reddit reveal your location without GPS?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(4);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: INSTAGRAM_TITLE, exact: true })).toHaveAttribute('href', INSTAGRAM_PATH);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveAttribute('href', DISCORD_PATH);
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10)).toBe(true);
});

test('Reddit guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(REDDIT_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${REDDIT_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(REDDIT_TITLE);
  expect(posting.keywords).toContain('Reddit');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('Gmail guide separates attachments, inline images, local dates, forwarding, and Drive links', async ({ page }) => {
  await page.goto(GMAIL_PATH);
  await expect(page.getByRole('heading', { level: 1, name: GMAIL_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-15/);
  await expect(page.locator('.blog-byline__date small')).toHaveText(/[4-7] min read/);
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /laptop and smartphone/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { level: 2, name: 'Does pasting a photo into Gmail change the answer?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why does a downloaded photo show a new created date?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can a Gmail recipient recover the original date or GPS?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What happens when someone forwards the email?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What happens to photos larger than 25 MB?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(4);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.locator('.blog-prose a[href*="reddit.com/"]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: TELEGRAM_TITLE, exact: true })).toHaveAttribute('href', TELEGRAM_PATH);
  await expect(page.getByRole('link', { name: WHATSAPP_TITLE, exact: true })).toHaveAttribute('href', WHATSAPP_PATH);
  await expect(page.getByRole('link', { name: DISCORD_TITLE, exact: true })).toHaveAttribute('href', DISCORD_PATH);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10)).toBe(true);
});

test('Gmail guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(GMAIL_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${GMAIL_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(GMAIL_TITLE);
  expect(posting.keywords).toContain('Gmail');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('GPS removal guide gives direct device steps, batch advice, verification, and visible-location warnings', async ({ page }) => {
  await page.goto(GPS_REMOVAL_PATH);
  await expect(page.getByRole('heading', { level: 1, name: GPS_REMOVAL_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-17/);
  await expect(page.locator('.blog-byline__date small')).toHaveText('6 min read');
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /smartphone over a paper city map/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.getByRole('heading', { level: 2, name: 'How do you remove GPS from an iPhone photo?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How do you remove GPS from an Android photo?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How do you clean a whole folder without missing files?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Does taking a screenshot remove GPS safely?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What can still reveal location after GPS is removed?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(4);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.locator('.blog-prose a[href*="reddit.com/"]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Image Metadata Viewer/ })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: /Image Privacy Checker/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Image Metadata Remover/ })).toHaveAttribute('href', '/image-metadata-remover/');
  await expect(page.getByRole('link', { name: /screenshot metadata guide/ })).toHaveAttribute('href', ARTICLE_PATH);
  await expect(page.getByRole('link', { name: /Gmail EXIF guide/ })).toHaveAttribute('href', GMAIL_PATH);
  await expect(page.getByRole('link', { name: /WhatsApp EXIF guide/ })).toHaveAttribute('href', WHATSAPP_PATH);
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10 && answer.trim().length < 180)).toBe(true);
});

test('GPS removal guide metadata and visible FAQ share the same source data', async ({ page }) => {
  await page.goto(GPS_REMOVAL_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${GPS_REMOVAL_PATH}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(GPS_REMOVAL_TITLE);
  expect(posting.keywords).toContain('GPS metadata');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

test('EXIF pillar explains fields, privacy, viewing, and removal in direct language', async ({ page }) => {
  await page.goto(EXIF_DATA_PATH);
  await expect(page).toHaveTitle(EXIF_DATA_SEO_TITLE);
  await expect(page.getByRole('heading', { level: 1, name: EXIF_DATA_TITLE })).toBeVisible();
  await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', /^2026-08-18/);
  await expect(page.locator('.blog-byline__date small')).toHaveText(/[67] min read/);
  await expect(page.locator('.blog-cover img')).toHaveAttribute('alt', /SD card.*camera.*laptop.*EXIF data/i);
  const coverRatio = await page.locator('.blog-cover img').evaluate((image) => image.getBoundingClientRect().width / image.getBoundingClientRect().height);
  expect(coverRatio).toBeGreaterThan(1.88);
  expect(coverRatio).toBeLessThan(1.92);
  await expect(page.locator('.practical-take li')).toHaveCount(3);
  await expect(page.locator('.blog-toc nav a')).toHaveCount(9);
  await expect(page.locator('.blog-prose > p').first()).toContainText('EXIF data is information stored inside many digital photo files.');
  await expect(page.getByRole('heading', { level: 2, name: 'Is EXIF the same as photo metadata?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'What information can EXIF data contain?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Does EXIF data include GPS location?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Can EXIF data be changed or deleted?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'How can you view photo EXIF data?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'How do you remove EXIF before sharing a photo?' })).toBeVisible();
  await expect(page.locator('.blog-prose table tbody tr')).toHaveCount(9);
  await expect(page.locator('.blog-faq article')).toHaveCount(5);
  await expect(page.locator('.blog-prose a[href*="reddit.com/"]')).toHaveCount(2);
  await expect(page.locator('.blog-sources')).toHaveCount(0);
  await expect(page.locator('.blog-cover figcaption')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Image Metadata Viewer', exact: true })).toHaveAttribute('href', '/image-metadata-viewer/');
  await expect(page.getByRole('link', { name: 'Image Privacy Checker', exact: true })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: 'Image Metadata Remover', exact: true })).toHaveAttribute('href', '/image-metadata-remover/');
  await expect(page.getByRole('link', { name: /removing GPS data before sharing/ })).toHaveAttribute('href', GPS_REMOVAL_PATH);
  await expect(page.getByRole('link', { name: /screenshot metadata guide/ })).toHaveAttribute('href', ARTICLE_PATH);
  await expect(page.getByRole('link', { name: /Gmail EXIF guide/ })).toHaveAttribute('href', GMAIL_PATH);
  const sectionAnswers = await page.locator('.blog-prose h2 + p').allTextContents();
  expect(sectionAnswers).toHaveLength(8);
  expect(sectionAnswers.every((answer) => answer.trim().length > 10 && answer.trim().length < 180)).toBe(true);
});

test('EXIF pillar exposes canonical, article metadata, and matching FAQ schema', async ({ page }) => {
  await page.goto(EXIF_DATA_PATH);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${EXIF_DATA_PATH}`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /what EXIF data stores inside a photo/i);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', EXIF_DATA_SEO_TITLE);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.viewexif\.com\/(?:_astro\/|@fs\/)/);
  const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
  expect(posting.headline).toBe(EXIF_DATA_TITLE);
  expect(posting.author.name).toBe('ViewExif Editorial Team');
  expect(posting.publisher.name).toBe('ViewExif');
  expect(posting.keywords).toContain('EXIF data');
  expect(posting.keywords).toContain('photo metadata');
  expect(faq.mainEntity).toHaveLength(5);
  const visibleQuestions = await page.locator('.blog-faq h3').allTextContents();
  expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
});

const relatedGuides = [
  { path: ARTICLE_PATH, expected: [WHATSAPP_PATH, INSTAGRAM_PATH, DISCORD_PATH] },
  { path: WHATSAPP_PATH, expected: [INSTAGRAM_PATH, TELEGRAM_PATH, DISCORD_PATH] },
  { path: INSTAGRAM_PATH, expected: [WHATSAPP_PATH, TELEGRAM_PATH, DISCORD_PATH] },
  { path: DISCORD_PATH, expected: [TELEGRAM_PATH, WHATSAPP_PATH, INSTAGRAM_PATH] },
  { path: TELEGRAM_PATH, expected: [DISCORD_PATH, WHATSAPP_PATH, INSTAGRAM_PATH] },
  { path: REDDIT_PATH, expected: [INSTAGRAM_PATH, DISCORD_PATH, TELEGRAM_PATH] },
  { path: GMAIL_PATH, expected: [TELEGRAM_PATH, WHATSAPP_PATH, DISCORD_PATH] },
  { path: GPS_REMOVAL_PATH, expected: [ARTICLE_PATH, WHATSAPP_PATH, GMAIL_PATH] },
  { path: EXIF_DATA_PATH, expected: [ARTICLE_PATH, GPS_REMOVAL_PATH, GMAIL_PATH] },
];

for (const guide of relatedGuides) {
  test(`${guide.path} keeps exactly three manually ordered related guides`, async ({ page }) => {
    await page.goto(guide.path);
    const links = page.locator('.blog-related .blog-post-card h2 a');
    await expect(links).toHaveCount(3);
    expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute('href')))).toEqual(guide.expected);
    expect(guide.expected).not.toContain(guide.path);
  });
}

for (const article of [
  { path: ARTICLE_PATH, title: ARTICLE_TITLE, label: 'screenshots' },
  { path: WHATSAPP_PATH, title: WHATSAPP_TITLE, label: 'WhatsApp' },
  { path: INSTAGRAM_PATH, title: INSTAGRAM_TITLE, label: 'Instagram' },
  { path: DISCORD_PATH, title: DISCORD_TITLE, label: 'Discord' },
  { path: TELEGRAM_PATH, title: TELEGRAM_TITLE, label: 'Telegram' },
  { path: REDDIT_PATH, title: REDDIT_TITLE, label: 'Reddit' },
  { path: GMAIL_PATH, title: GMAIL_TITLE, label: 'Gmail' },
  { path: GPS_REMOVAL_PATH, title: GPS_REMOVAL_TITLE, label: 'GPS removal' },
  { path: EXIF_DATA_PATH, title: EXIF_DATA_TITLE, label: 'EXIF data' },
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
