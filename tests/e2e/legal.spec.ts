import { expect, test, type Page } from '@playwright/test';

const ADSENSE_ACCOUNT_ID = 'ca-pub-7443237558968985';
const ADS_TXT_LINE = 'google.com, pub-7443237558968985, DIRECT, f08c47fec0942fa0';
const PUBLIC_EMAIL = 'contact@viewexif.com';
const POLICY_EFFECTIVE_DATE = '2026-08-23';
const GOOGLE_AD_REQUEST = /(?:googlesyndication\.com|doubleclick\.net|fundingchoicesmessages\.google\.com)/i;

const legalKinds = ['about', 'privacy', 'contact', 'terms'] as const;

const locales = [
  {
    prefix: '',
    lang: 'en',
    labels: { contact: 'Contact', terms: 'Terms' },
    operatorPattern: /independently operated by an individual/i,
    privacyTokens: [/file ?names?/i, /hash(?:es)?/i, /metadata/i, /cookies?/i, /local storage/i, /web beacons?/i, /IP address/i, /advertising technology partners/i],
  },
  {
    prefix: '/de',
    lang: 'de',
    labels: { contact: 'Kontakt', terms: 'Nutzungsbedingungen' },
    operatorPattern: /unabhängig von einer Einzelperson betrieben/i,
    privacyTokens: [/Dateinamen?/i, /Hash(?:es)?/i, /Metadaten/i, /Cookies?/i, /lokal(?:e|en|er|em|es).{0,24}(?:Speicher|Speicherung)/i, /Web.Beacons?/i, /IP.Adresse/i, /(?:Drittanbieter.{0,24}Werbetechnologie|Werbetechnologiepartner)/i],
  },
  {
    prefix: '/fr',
    lang: 'fr',
    labels: { contact: 'Contact', terms: 'Conditions d’utilisation' },
    operatorPattern: /exploitée? de façon indépendante par une personne/i,
    privacyTokens: [/noms? de fichiers?/i, /hachage|empreintes?/i, /métadonnées/i, /cookies?/i, /local storage|stockage local/i, /balises? web|web beacons?/i, /adresse IP/i, /partenaires technologiques/i],
  },
  {
    prefix: '/zh-cn',
    lang: 'zh-CN',
    labels: { contact: '联系我们', terms: '使用条款' },
    operatorPattern: /个人独立运营/,
    privacyTokens: [/文件名/, /哈希/, /元数据/, /Cookie/i, /本地存储|local storage/i, /网络信标|web beacon/i, /IP\s*地址/i, /第三方|合作伙伴/],
  },
] as const;

function route(prefix: string, kind: (typeof legalKinds)[number]): string {
  return `${prefix}/${kind}/`;
}

async function expectNoAdRuntime(page: Page) {
  await expect(page.locator('script[src*="pagead2.googlesyndication.com"], script[src*="fundingchoicesmessages.google.com"], ins.adsbygoogle, [data-ad-client], [data-ad-slot]')).toHaveCount(0);
  const html = await page.locator('html').evaluate((element) => element.outerHTML);
  expect(html).not.toMatch(/adsbygoogle|googlefc|fundingchoicesmessages\.google\.com/i);
}

test('all localized trust pages are reachable and expose one verification meta', async ({ page }) => {
  const adRequests: string[] = [];
  page.on('request', (outbound) => {
    if (GOOGLE_AD_REQUEST.test(outbound.url())) adRequests.push(outbound.url());
  });
  for (const locale of locales) {
    for (const kind of legalKinds) {
      const path = route(locale.prefix, kind);
      const response = await page.goto(path);
      expect(response?.ok(), path).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('meta[name="google-adsense-account"]')).toHaveCount(1);
      await expect(page.locator('meta[name="google-adsense-account"]')).toHaveAttribute('content', ADSENSE_ACCOUNT_ID);
      await expect(page.locator('main form')).toHaveCount(0);
      await expect(page.locator('main')).toContainText('ViewExif');
      await expectNoAdRuntime(page);
    }
  }
  expect(adRequests).toEqual([]);
});

test('about, contact, terms and footer expose a consistent public identity', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(route(locale.prefix, 'about'));
    const about = page.locator('main');
    await expect(about).toContainText(locale.operatorPattern);
    await expect(about.locator(`a[href="${route(locale.prefix, 'contact')}"]`)).toBeVisible();
    await expect(about.locator(`a[href="${route(locale.prefix, 'privacy')}"]`)).toBeVisible();
    await expect(about.locator(`a[href="${route(locale.prefix, 'terms')}"]`)).toBeVisible();

    await page.goto(route(locale.prefix, 'contact'));
    await expect(page.locator(`main a[href="mailto:${PUBLIC_EMAIL}"]`).first()).toBeVisible();
    await expect(page.locator('main')).toContainText(PUBLIC_EMAIL);

    for (const kind of ['privacy', 'terms'] as const) {
      await page.goto(route(locale.prefix, kind));
      await expect(page.locator('main')).toContainText(PUBLIC_EMAIL);
    }

    for (const kind of legalKinds) {
      await page.goto(route(locale.prefix, kind));
      const footer = page.locator('footer');
      await expect(footer.getByRole('link', { name: locale.labels.contact, exact: true })).toHaveAttribute('href', route(locale.prefix, 'contact'));
      await expect(footer.getByRole('link', { name: locale.labels.terms, exact: true })).toHaveAttribute('href', route(locale.prefix, 'terms'));
    }
  }
});

test('localized privacy pages disclose processing, advertising controls and providers', async ({ page }) => {
  for (const locale of locales) {
    const path = route(locale.prefix, 'privacy');
    await page.goto(path);
    const main = page.locator('main');
    await expect(main).toContainText(POLICY_EFFECTIVE_DATE);
    await expect(main).toContainText(PUBLIC_EMAIL);
    await expect(main).toContainText('Ahrefs');
    await expect(main).toContainText('Cloudflare');
    await expect(main).toContainText('Google');

    const body = await main.innerText();
    for (const token of locale.privacyTokens) expect(body, `${path} should disclose ${token}`).toMatch(token);

    const hrefs = await main.locator('a[href^="https://"]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    expect(hrefs, path).toEqual(expect.arrayContaining([
      expect.stringMatching(/^https:\/\/policies\.google\.com\/technologies\/partner-sites/i),
      expect.stringMatching(/^https:\/\/adssettings\.google\.com\//i),
      expect.stringMatching(/^https:\/\/(?:www\.)?ahrefs\.com\/privacy-policy/i),
      expect.stringMatching(/^https:\/\/(?:www\.)?cloudflare\.com\/privacypolicy/i),
    ]));
  }
});

test('localized terms cover the complete service and responsibility outline', async ({ page }) => {
  const sectionIds = ['service', 'local', 'responsibility', 'acceptable-use', 'ownership', 'third-parties', 'availability', 'liability', 'changes'];
  for (const locale of locales) {
    const path = route(locale.prefix, 'terms');
    await page.goto(path);
    for (const id of sectionIds) await expect(page.locator(`main section#${id}`), `${path} #${id}`).toBeVisible();
    await expect(page.locator('main')).toContainText(POLICY_EFFECTIVE_DATE);
    await expect(page.locator(`main a[href="mailto:${PUBLIC_EMAIL}"]`).first()).toBeVisible();
  }
});

test('ads.txt is exact and the application build makes no Google ad requests', async ({ page, request }) => {
  const adsTextResponse = await request.get('/ads.txt');
  expect(adsTextResponse.ok()).toBe(true);
  const nonEmptyLines = (await adsTextResponse.text()).split(/\r?\n/).filter((line) => line.length > 0);
  expect(nonEmptyLines).toEqual([ADS_TXT_LINE]);

  const adRequests: string[] = [];
  page.on('request', (outbound) => {
    if (GOOGLE_AD_REQUEST.test(outbound.url())) adRequests.push(outbound.url());
  });
  await page.goto('/');
  await expect(page.locator('meta[name="google-adsense-account"]')).toHaveCount(1);
  await expectNoAdRuntime(page);
  expect(adRequests).toEqual([]);
});

for (const width of [390, 239]) {
  test(`localized trust pages do not overflow or log errors at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.setViewportSize({ width, height: 844 });
    for (const locale of locales) {
      for (const kind of legalKinds) {
        const path = route(locale.prefix, kind);
        const response = await page.goto(path);
        expect(response?.ok(), path).toBe(true);
        const dimensions = await page.evaluate(() => ({
          documentScroll: document.documentElement.scrollWidth,
          documentClient: document.documentElement.clientWidth,
        }));
        expect(dimensions.documentScroll, `${path} document overflow at ${width}px`).toBeLessThanOrEqual(dimensions.documentClient + 1);
      }
    }
    expect(consoleErrors).toEqual([]);
  });
}
