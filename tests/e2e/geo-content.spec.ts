import { expect, test } from '../fixtures/browser-test';
import { SITE_ORIGIN } from '../../src/lib/seo';

test.use({ javaScriptEnabled: false });

const guides = [
  { path: '/blog/why-metadata-is-missing/', evidence: '/how-we-test/#public-jpeg-check', published: '2026-10-05' },
  { path: '/blog/how-to-find-where-a-photo-was-taken/', evidence: '/how-we-test/#public-jpeg-check', published: '2026-08-20' },
  { path: '/blog/how-to-read-c2pa-results/', evidence: '/how-we-test/#c2pa', published: '2026-10-05' },
] as const;

test('public answers, evidence and authorship are available in the initial HTML', async ({ page, request }) => {
  const pages = [
    { path: '/', text: /selected copy contains readable fields/i, evidence: '/how-we-test/#public-jpeg-check' },
    { path: '/image-metadata-viewer/', text: /how to act on this result/i, evidence: '/how-we-test/' },
    { path: '/image-metadata-remover/', text: /read the cleanup status/i, evidence: '/how-we-test/' },
    { path: '/image-privacy-checker/', text: /look beyond the score/i, evidence: '/how-we-test/' },
    { path: '/c2pa-viewer/', text: /interpret missing credentials/i, evidence: '/how-we-test/#c2pa' },
    { path: '/how-we-test/', text: /repeat the public JPEG check/i, evidence: '/samples/metadata-demo-v1.jpg' },
    { path: '/about/', text: /independently operated by an individual/i },
    { path: '/privacy/', text: /tool events record the tool type/i },
    { path: '/editorial-policy/', text: /same operator is responsible/i },
    ...guides.map(guide => ({ ...guide, text: /ViewExif/ })),
  ];
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const indexed = new Set([...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));

  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    for (const entry of pages) {
      const { path, text } = entry;
      const response = await page.goto(path);
      expect(response?.ok(), path).toBe(true);
      expect(response?.headers()['x-robots-tag'] ?? '', path).not.toMatch(/noindex|nosnippet|max-snippet/i);
      expect(indexed.has(SITE_ORIGIN + path), path).toBe(true);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_ORIGIN + path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('main')).toContainText(text);
      if ('evidence' in entry) await expect(page.locator(`main a[href="${entry.evidence}"]`).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);

      if ('published' in entry) {
        const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? '{}')));
        const article = schemas.find(schema => schema['@type'] === 'BlogPosting');
        expect(article.author).toEqual(article.publisher);
        expect(article.author).toMatchObject({ name: 'ViewExif', url: SITE_ORIGIN + '/about/', '@id': SITE_ORIGIN + '/about/#viewexif' });
        await expect(page.locator('main a[rel="author"]')).toHaveAttribute('href', '/about/');
        expect(article.datePublished.slice(0, 10)).toBe(entry.published);
        await expect(page.locator('.blog-byline time')).toHaveAttribute('datetime', article.dateModified);
        const questions = await page.locator('.blog-faq article').evaluateAll(nodes => nodes.map(node => ({
          name: node.querySelector('h3')?.textContent, answer: node.querySelector('p')?.textContent,
        })));
        const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
        expect(faq.mainEntity.map((item: { name: string; acceptedAnswer: { text: string } }) => ({
          name: item.name, answer: item.acceptedAnswer.text,
        }))).toEqual(questions);
      }
    }
  }

  await page.goto('/fr/image-metadata-viewer/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_ORIGIN + '/fr/image-metadata-viewer/');
  expect(indexed.has(SITE_ORIGIN + '/fr/image-metadata-viewer/')).toBe(true);
  await expect(page.locator('head link[hreflang="en"]')).toHaveAttribute('href', SITE_ORIGIN + '/image-metadata-viewer/');
});
