import { expect, test } from '@playwright/test';

const toolPaths = [
  '/metadata-viewer/', '/image-metadata-viewer/', '/document-metadata-viewer/', '/video-metadata-viewer/', '/audio-metadata-viewer/',
  '/image-privacy-checker/', '/metadata-remover/', '/image-metadata-remover/', '/video-metadata-remover/', '/audio-metadata-remover/',
  '/document-metadata-remover/', '/c2pa-viewer/',
];

const locales = [
  { prefix: '/zh-cn', lang: 'zh-CN' },
  { prefix: '/de', lang: 'de' },
  { prefix: '/fr', lang: 'fr' },
] as const;

test('German, French and Chinese routes have four-way reciprocal SEO links', async ({ page }) => {
  for (const locale of locales) {
    for (const path of ['/', ...toolPaths, '/about/', '/privacy/']) {
      const localizedPath = path === '/' ? `${locale.prefix}/` : `${locale.prefix}${path}`;
      const response = await page.goto(localizedPath);
      expect(response?.ok(), localizedPath).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.viewexif.com${localizedPath}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `https://www.viewexif.com${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute('href', `https://www.viewexif.com${path === '/' ? '/de/' : `/de${path}`}`);
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', `https://www.viewexif.com${path === '/' ? '/fr/' : `/fr${path}`}`);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute('href', `https://www.viewexif.com${path === '/' ? '/zh-cn/' : `/zh-cn${path}`}`);
    }
  }
});

test('desktop language dropdown switches the same page and sends localized blog choices home', async ({ page }) => {
  await page.goto('/image-metadata-viewer/');
  const dropdown = page.locator('.header-inner > .language-dropdown');
  await dropdown.getByRole('button').click();
  await expect(dropdown.getByRole('link', { name: /Deutsch/ })).toHaveAttribute('href', '/de/image-metadata-viewer/');
  await expect(dropdown.getByRole('link', { name: /Français/ })).toHaveAttribute('href', '/fr/image-metadata-viewer/');
  await expect(dropdown.getByRole('link', { name: /中文/ })).toHaveAttribute('href', '/zh-cn/image-metadata-viewer/');
  await dropdown.getByRole('link', { name: /Deutsch/ }).click();
  await expect(page).toHaveURL(/\/de\/image-metadata-viewer\/$/);

  await page.goto('/blog/');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await page.locator('.header-inner > .language-dropdown').getByRole('button').click();
  await expect(page.locator('.header-inner > .language-dropdown').getByRole('link', { name: /Deutsch/ })).toHaveAttribute('href', '/de/');
  await expect(page.locator('.header-inner > .language-dropdown').getByRole('link', { name: /Français/ })).toHaveAttribute('href', '/fr/');
  await expect(page.locator('.header-inner > .language-dropdown').getByRole('link', { name: /中文/ })).toHaveAttribute('href', '/zh-cn/');
});

test('localized links retain their prefix while Blog remains English', async ({ page }) => {
  await page.goto('/de/');
  const nav = page.locator('.desktop-nav');
  await expect(nav.getByRole('link', { name: 'Datenschutz prüfen' })).toHaveAttribute('href', '/de/image-privacy-checker/');
  await expect(nav.getByRole('link', { name: 'C2PA prüfen' })).toHaveAttribute('href', '/de/c2pa-viewer/');
  await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog/');
});

test('French navigation retains its prefix while Blog remains English', async ({ page }) => {
  await page.goto('/fr/');
  const nav = page.locator('.desktop-nav');
  await expect(nav.getByRole('link', { name: 'Vérifier la confidentialité' })).toHaveAttribute('href', '/fr/image-privacy-checker/');
  await expect(nav.getByRole('link', { name: 'Vérifier C2PA' })).toHaveAttribute('href', '/fr/c2pa-viewer/');
  await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog/');
});

test('mobile language dropdown exposes all states and remains usable at 239px', async ({ page }) => {
  await page.setViewportSize({ width: 239, height: 844 });
  await page.goto('/de/image-privacy-checker/');
  await page.getByRole('button', { name: 'Navigation öffnen' }).click();
  const dropdown = page.locator('.mobile-language-dropdown');
  await dropdown.getByRole('button').click();
  await expect(dropdown.getByRole('link', { name: /Deutsch/ })).toHaveAttribute('aria-current', 'page');
  await expect(dropdown.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(dropdown.getByRole('link', { name: /中文/ })).toHaveAttribute('href', '/zh-cn/image-privacy-checker/');
  await expect(dropdown.getByRole('link', { name: /Français/ })).toHaveAttribute('href', '/fr/image-privacy-checker/');
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test('German workbenches expose localized file controls', async ({ page }) => {
  for (const [path, label] of [
    ['/de/metadata-viewer/', 'Datei auswählen'],
    ['/de/image-privacy-checker/', 'Bild auswählen'],
    ['/de/metadata-remover/', 'Datei auswählen'],
    ['/de/c2pa-viewer/', 'Datei auswählen'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
  }
});

test('French workbenches expose localized file controls', async ({ page }) => {
  for (const [path, label] of [
    ['/fr/metadata-viewer/', 'Choisir un fichier'],
    ['/fr/image-privacy-checker/', 'Choisir une image'],
    ['/fr/metadata-remover/', 'Choisir un fichier'],
    ['/fr/c2pa-viewer/', 'Choisir un fichier'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
  }
});
