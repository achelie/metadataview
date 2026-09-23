import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';

const articleGroups = {
  image: [
    'do-screenshots-have-metadata',
    'does-discord-remove-exif-data',
    'does-gmail-remove-exif-data',
    'does-instagram-remove-exif-data',
    'does-reddit-remove-exif-data',
    'does-telegram-remove-exif-data',
    'does-whatsapp-remove-exif-data',
    'exif-metadata-definition-and-how-to-view',
    'exif-vs-metadata',
    'how-to-check-exif-data',
    'how-to-check-metadata-of-an-image',
    'how-to-find-camera-settings-from-a-photo',
    'how-to-find-where-a-photo-was-taken',
    'how-to-remove-gps-data-from-photos-before-sharing',
    'how-to-remove-metadata-from-a-photo',
    'how-to-tell-when-a-photo-was-taken',
    'how-to-view-exif-data-on-android',
    'how-to-view-exif-data-on-iphone',
    'how-to-view-exif-data-on-windows-11',
    'how-to-view-photo-metadata-on-mac',
    'what-is-exif-data',
    'what-is-xmp-metadata',
  ],
  document: [
    'how-to-view-pdf-metadata',
    'remove-metadata-from-pdf',
    'remove-metadata-from-word-document',
  ],
  audio: ['remove-metadata-from-mp3'],
  video: ['remove-metadata-from-mp4'],
  all: ['what-is-a-metadata-strategy'],
};

const expectedTools = {
  image: ['/image-metadata-viewer/', '/image-privacy-checker/', '/image-metadata-remover/'],
  document: ['/document-metadata-viewer/', '/document-metadata-remover/'],
  audio: ['/audio-metadata-viewer/', '/audio-metadata-remover/'],
  video: ['/video-metadata-viewer/', '/video-metadata-remover/'],
  all: ['/metadata-viewer/', '/metadata-remover/'],
};

test('tool recommendations cover every published guide', () => {
  const publishedSlugs = readdirSync(new URL('../../src/content/blog/', import.meta.url))
    .filter(name => /\.(md|mdoc)$/.test(name))
    .map(name => name.replace(/\.(md|mdoc)$/, ''))
    .sort();
  expect(Object.values(articleGroups).flat().sort()).toEqual(publishedSlugs);
});

for (const [scope, slugs] of Object.entries(articleGroups)) {
  for (const slug of slugs) {
    test(`${slug} recommends tools for the guide's file type`, async ({ page }) => {
      await page.goto(`/blog/${slug}/`);
      const strip = page.getByRole('navigation', { name: 'Recommended metadata tools', exact: true });
      const links = strip.getByRole('link');
      const paths = expectedTools[scope as keyof typeof expectedTools];
      expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(paths);
      await expect(strip.locator('strong')).toHaveText(paths.map((_, index) => String(index + 1).padStart(2, '0')));
      await expect(links.first()).toContainText(`View ${scope === 'all' ? 'file' : scope} metadata`);
      await expect(links.last()).toContainText('Make a cleaner copy');
    });
  }
}

test('blog index and all archive pages recommend tools for any supported file', async ({ page }) => {
  await page.goto('/blog/');
  const archivePaths = await page.locator('.blog-pagination a').evaluateAll(nodes => nodes.map(node => new URL((node as HTMLAnchorElement).href).pathname));
  for (const path of new Set(['/blog/', ...archivePaths])) {
    await page.goto(path);
    const strip = page.getByRole('navigation', { name: 'Recommended metadata tools', exact: true });
    expect(await strip.getByRole('link').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(expectedTools.all);
    await expect(strip.locator('strong')).toHaveText(['01', '02']);
  }
});

const removerSlugs = ['metadata-remover', 'image-metadata-remover', 'document-metadata-remover', 'audio-metadata-remover', 'video-metadata-remover'];
for (const localePrefix of ['', '/zh-cn', '/de', '/fr']) {
  for (const slug of removerSlugs) {
    const path = `${localePrefix}/${slug}/`;
    test(`${path} keeps one working upload anchor through hydration`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
      const html = await response!.text();
      expect(html.match(/\bid="metadata-workbench-tool"/g)).toHaveLength(1);

      const workbench = page.locator('section.removal-workbench#metadata-workbench-tool');
      await expect(workbench).toHaveCount(1);
      await expect(workbench.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
      await expect(page.locator('[id="metadata-workbench-tool"]')).toHaveCount(1);
      await expect(workbench.locator('.removal-dropzone')).toBeVisible();
      await expect(page.locator('.format-guide-process .home-process-cta a')).toHaveAttribute('href', '#metadata-workbench-tool');
      await expect(page.locator('.format-guide-benefits a[href="#metadata-workbench-tool"]')).toHaveCount(2);
    });
  }
}

for (const path of ['/document-metadata-remover/', '/zh-cn/document-metadata-remover/']) {
  test(`${path} returns to the picker without opening or processing a file`, async ({ page }) => {
    let pickers = 0;
    let downloads = 0;
    page.on('filechooser', () => { pickers += 1; });
    page.on('download', () => { downloads += 1; });
    await page.goto(path);
    const workbench = page.locator('#metadata-workbench-tool');
    await expect(workbench.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
    await page.locator('.format-guide-process .home-process-cta a').click();
    await expect(page).toHaveURL(/#metadata-workbench-tool$/);
    await expect.poll(() => workbench.evaluate(node => {
      const top = node.getBoundingClientRect().top;
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      return top >= headerBottom - 1 && top < window.innerHeight / 2;
    })).toBe(true);
    await expect(workbench).toHaveAttribute('aria-busy', 'false');
    await expect(workbench.locator('.removal-report, .removal-progress, .removal-result')).toHaveCount(0);
    expect(await workbench.locator('input[type="file"]').evaluate(node => (node as HTMLInputElement).files?.length)).toBe(0);
    expect(pickers).toBe(0);
    expect(downloads).toBe(0);
  });
}

for (const width of [320, 375, 390, 430]) {
  test(`mobile navigation keeps submenu targets reachable at ${width}px and closes with Escape`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const trigger = page.locator('[data-mobile-menu-trigger]');
    const layer = page.locator('[data-mobile-menu-layer]');
    const drawer = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(layer).toHaveAttribute('aria-hidden', 'false');

    for (const name of ['View metadata', 'Remove metadata']) {
      const group = drawer.locator('[data-mobile-accordion]').filter({
        has: page.getByRole('button', { name, exact: true }),
      });
      await group.getByRole('button', { name, exact: true }).click();
      const links = group.getByRole('link');
      await expect(links).toHaveCount(5);
      for (const link of await links.all()) {
        await expect(link).toBeVisible();
        await expect.poll(async () => (await link.boundingBox())?.height ?? 0,
          { message: `${name}: ${await link.textContent()} at ${width}px` }).toBeGreaterThanOrEqual(44);
        const box = (await link.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(layer).toHaveAttribute('aria-hidden', 'true');
    await expect(layer).toHaveAttribute('inert', '');
    await expect(trigger).toBeFocused();
  });

  test(`two- and three-action recommendations fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    for (const slug of ['do-screenshots-have-metadata', 'remove-metadata-from-word-document', 'what-is-a-metadata-strategy']) {
      await page.goto(`/blog/${slug}/`);
      const strip = page.locator('.blog-tool-strip');
      await expect(strip).toBeVisible();
      const layout = await strip.evaluate(node => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        links: [...node.querySelectorAll('nav a')].map(link => {
          const rect = link.getBoundingClientRect();
          return { left: rect.left, right: rect.right, height: rect.height };
        }),
        maxFontSize: Math.max(...[...node.querySelectorAll('*')].map(element => Number.parseFloat(getComputedStyle(element).fontSize))),
      }));
      expect(layout.overflow, slug).toBeLessThanOrEqual(1);
      expect(layout.maxFontSize, slug).toBeLessThanOrEqual(28);
      for (const link of layout.links) {
        expect(link.left, slug).toBeGreaterThanOrEqual(0);
        expect(link.right, slug).toBeLessThanOrEqual(width);
        expect(link.height, slug).toBeGreaterThanOrEqual(44);
      }
    }
  });
}
