import { expect, test, type BrowserContext, type Page, type Request } from '@playwright/test';
import { analyticsPrivacyFixture } from '../fixtures/analytics-privacy';

type SensitiveFixture = Awaited<ReturnType<typeof analyticsPrivacyFixture>>;
type CapturedRequest = { url: string; method: string; headers: Record<string, string>; body: string; blocked?: boolean; authorizedMap?: boolean };
const localAuditOrigin = 'https://viewexif-audit.test';
const ahrefsHost = 'analytics.ahrefs.com';
const isRum = (url: URL, origin: string) => url.pathname === '/cdn-cgi/rum' && [origin, 'https://cloudflareinsights.com'].includes(url.origin);

async function installNetworkAudit(context: BrowserContext, baseURL: string) {
  const backend = new URL(baseURL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(backend.hostname);
  const origin = local ? localAuditOrigin : backend.origin;
  const requests: CapturedRequest[] = [];
  const capturedRequests = new WeakMap<Request, CapturedRequest>();
  const headerReads: Promise<void>[] = [];
  const actions: string[] = [];
  const blockedLeaks: Array<{ destination: string; reasons: string[] }> = [];
  let fixture: SensitiveFixture | undefined;
  let permittedMaps = 0;

  // The real Ahrefs SDK skips localhost and webdriver. Use a non-local browser
  // origin and ordinary-visitor detection, while retaining the unmodified SDK.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => false });
    // This marker only distinguishes documents; about:blank popups need not have
    // the secure-context randomUUID API when this init script first runs.
    Object.defineProperty(window, '__privacyDocumentId', { value: `${Date.now()}:${Math.random()}` });
  });
  context.on('request', request => {
    const captured = { url: request.url(), method: request.method(), headers: request.headers(), body: request.postDataBuffer()?.toString('utf8') ?? '' };
    requests.push(captured);
    capturedRequests.set(request, captured);
    headerReads.push(request.allHeaders().then(headers => { captured.headers = headers; }).catch(() => {}));
  });
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const captured = capturedRequests.get(request)!;
    captured.headers = await request.allHeaders();
    const authorizedMap = Boolean(fixture && permittedMaps > 0 && request.isNavigationRequest()
      && request.method() === 'GET' && url.origin === 'https://www.openstreetmap.org' && url.pathname === '/'
      && Math.abs(Number(url.searchParams.get('mlat')) - fixture.latitude) < 1e-9
      && Math.abs(Number(url.searchParams.get('mlon')) - fixture.longitude) < 1e-9);
    if (authorizedMap) { permittedMaps--; captured.authorizedMap = true; }
    if (fixture) {
      const reasons = sensitiveReasons(captured, fixture, authorizedMap);
      if (reasons.length) {
        captured.blocked = true;
        blockedLeaks.push({ destination: `${url.origin}${url.pathname}`, reasons });
        // Check every method/endpoint BEFORE route.fetch or route.continue. A
        // future SDK GET endpoint must not exfiltrate a canary before assertions.
        await route.abort('blockedbyclient');
        return;
      }
    }
    // Capture actual SDK payloads before they leave the browser. Never replace
    // analytics.js, fabricate pageviews, or send fixture values to a provider.
    if (url.hostname === ahrefsHost && url.pathname.startsWith('/api/')) {
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    } else if (isRum(url, origin)) {
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    } else if (url.hostname === 'www.openstreetmap.org') {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Intercepted map</title><p>No map request left this test.</p>' });
    } else if (!['GET', 'HEAD'].includes(request.method())) {
      // Unexpected uploads should fail the assertions without uploading a fixture.
      await route.fulfill({ status: 204 });
    } else if (local && ['http:', 'https:'].includes(url.protocol) && url.origin === origin) {
      // Firefox includes Host in routed request headers; retaining the synthetic
      // browser host would make the local preview reject the request with 403.
      // WebKit also routes blob: URLs: those must stay in the browser's blob store.
      const response = await route.fetch({
        url: new URL(url.pathname + url.search, backend).href,
        headers: { ...captured.headers, host: backend.host },
      });
      await route.fulfill({ response });
    } else {
      await route.continue();
    }
  });
  const ahrefsEvents = () => requests.filter(request => new URL(request.url).hostname === ahrefsHost && new URL(request.url).pathname === '/api/event');
  const pageviews = () => ahrefsEvents().filter(request => {
    try { return JSON.parse(request.body).n === 'pageview'; } catch { return false; }
  });
  const maps = () => requests.filter(request => new URL(request.url).hostname === 'www.openstreetmap.org');
  const rum = () => requests.filter(request => isRum(new URL(request.url), origin) && request.method === 'POST');
  return {
    origin, local, requests, pageviews, maps, rum, actions, blockedLeaks,
    registerFixture: (value: SensitiveFixture) => { fixture = value; actions.push('synthetic-fixture-registered-before-file-selection'); },
    fixtureHash: () => fixture?.sha256,
    allowNextMap: (action: string) => { permittedMaps++; actions.push(`map:${action}`); },
    recordAction: (action: string) => actions.push(action),
    flush: () => Promise.all(headerReads),
  };
}

type NetworkAudit = Awaited<ReturnType<typeof installNetworkAudit>>;
const audits = new Map<string, NetworkAudit>();

function decoded(value: string): string {
  let result = value;
  for (let i = 0; i < 3; i++) {
    try {
      const unescaped = result.replace(/\\u([\da-f]{4})/gi, (_, value) => String.fromCharCode(parseInt(value, 16)))
        .replace(/\\x([\da-f]{2})/gi, (_, value) => String.fromCharCode(parseInt(value, 16)));
      const next = decodeURIComponent(unescaped);
      if (next === result) break;
      result = next;
    } catch { break; }
  }
  return result.toLowerCase();
}

function sensitiveReasons(request: CapturedRequest, fixture: SensitiveFixture, authorizedMap: boolean): string[] {
  const details = decoded(`${JSON.stringify(request.headers)}\n${request.body}`);
  const all = decoded(`${request.url}\n${details}`);
  const contains = (text: string, value: string) => [value, encodeURIComponent(value), Buffer.from(value).toString('base64'), Buffer.from(value).toString('base64url')]
    .some(token => text.includes(token.toLowerCase()));
  const reasons: string[] = [];
  for (const [kind, value] of [['file-marker', 'c7d493ab'], ['filename', fixture.filename], ['author', fixture.author], ['sha256', fixture.sha256]] as const) {
    if (contains(all, value)) reasons.push(kind);
  }
  const coordinateTraffic = authorizedMap ? details : all;
  for (const value of [fixture.latitude, fixture.longitude]) {
    if ([String(value), value.toFixed(6), value.toFixed(8)].some(token => contains(coordinateTraffic, token))) reasons.push('gps-coordinate');
  }
  if (!authorizedMap && /(?:mlat|mlon|gpslatitude|gpslongitude)["'\\\s:=]+[-\d]/i.test(all)) reasons.push('gps-parameter');
  return [...new Set(reasons)];
}

async function assertPrivateTraffic(audit: NetworkAudit, fixture: SensitiveFixture) {
  await audit.flush();
  expect(audit.blockedLeaks, 'Sensitive requests were blocked before reaching any destination').toEqual([]);
  const textCanaries = ['c7d493ab', fixture.author, fixture.sha256].map(value => value.toLowerCase());
  // Long coordinate representations avoid confusing RUM timing/geometry numbers
  // with GPS (e.g. a harmless duration of 37 ms is not location data).
  const coordinates = [fixture.latitude, fixture.longitude].flatMap(value => [String(value), value.toFixed(6), value.toFixed(8)]);
  for (const request of audit.requests) {
    const url = new URL(request.url);
    const details = decoded(`${JSON.stringify(request.headers)}\n${request.body}`);
    const traffic = decoded(`${request.url}\n${details}`);
    for (const token of textCanaries) expect(traffic, `Sensitive text/hash in ${url.origin}${url.pathname}`).not.toContain(token);
    const isMap = url.origin === 'https://www.openstreetmap.org';
    if (isMap) {
      expect(request.authorizedMap, 'Only a specifically activated map request may contain GPS').toBe(true);
      expect(request.method).toBe('GET');
      expect(url.pathname).toBe('/');
      expect(Number(url.searchParams.get('mlat'))).toBeCloseTo(fixture.latitude, 9);
      expect(Number(url.searchParams.get('mlon'))).toBeCloseTo(fixture.longitude, 9);
      for (const token of coordinates) expect(details, 'GPS must only be in the explicitly opened map URL').not.toContain(token);
    } else {
      for (const token of coordinates) expect(traffic, `GPS in ${url.origin}${url.pathname}`).not.toContain(token);
      expect(traffic).not.toMatch(/(?:mlat|mlon|gpslatitude|gpslongitude)["'\s:=]+[-\d]/i);
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      expect(url.hostname === ahrefsHost && url.pathname.startsWith('/api/') || isRum(url, audit.origin), `Unexpected upload to ${request.url}`).toBe(true);
    }
  }
}

async function hydratedWorkbench(page: Page) {
  const input = page.locator('input[type=file]').first();
  await expect(input).toBeAttached();
  await expect(input.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '');
  return input;
}

async function upload(page: Page, filename: string, bytes: Buffer) {
  await (await hydratedWorkbench(page)).setInputFiles({ name: filename, mimeType: 'image/jpeg', buffer: bytes });
  await expect(page.locator('.report-heading h2')).toContainText(filename, { timeout: 90_000 });
  await expect(page.locator('.report-engine')).toHaveAttribute('aria-busy', 'false', { timeout: 90_000 });
}

async function expectEmptyViewer(page: Page, fixture: SensitiveFixture, focusReturned = false) {
  const workbench = page.locator('#metadata-workbench-home');
  const input = await hydratedWorkbench(page);
  const choose = workbench.getByRole('button', { name: 'Choose a file', exact: true });
  await expect(workbench.locator('.report-heading, .report-pending, .home-exif-summary, .map-open-button, .report-export-actions')).toHaveCount(0);
  await expect(workbench.locator('img[src^="blob:"]')).toHaveCount(0);
  for (const value of [fixture.filename, fixture.plainFilename, fixture.author, fixture.sha256, fixture.latitude.toFixed(6), fixture.longitude.toFixed(6)]) {
    await expect(workbench).not.toContainText(value);
  }
  await expect(input).toHaveValue('');
  expect(await input.evaluate(element => (element as HTMLInputElement).files?.length)).toBe(0);
  await expect(workbench).toHaveAttribute('aria-busy', 'false');
  await expect(choose).toBeVisible();
  await expect(choose).toBeEnabled();
  if (focusReturned) await expect(choose).toBeFocused();
}

async function requireRealPageview(page: Page, audit: NetworkAudit, minimum = 1) {
  await expect.poll(() => audit.pageviews().length, { message: 'The unmodified real Ahrefs script must generate a pageview; skipped analytics is not a privacy pass.', timeout: 30_000 }).toBeGreaterThanOrEqual(minimum);
  expect(await page.evaluate(() => navigator.webdriver)).toBe(false);
  expect(audit.requests.some(request => request.url.startsWith('https://analytics.ahrefs.com/analytics.js'))).toBe(true);
}

async function finishOnPrivacyPage(page: Page, audit: NetworkAudit, fixture: SensitiveFixture) {
  const previousViews = audit.pageviews().length;
  audit.recordAction('native-navigation-pagehide-to-privacy');
  // A real navigation exercises pagehide/unload and delayed performance beacons.
  await page.goto(`${audit.origin}/privacy/`, { waitUntil: 'load' });
  await requireRealPageview(page, audit, previousViews + 1);
  if (!audit.local) {
    await expect.poll(() => audit.rum().length, { message: 'Production must exercise actual Cloudflare RUM, including its request payload, rather than silently skipping it.', timeout: 20_000 }).toBeGreaterThan(0);
  }
  await assertPrivateTraffic(audit, fixture);
}

test.describe('Analytics keeps file-derived data local', { tag: '@release' }, () => {
  test.setTimeout(300_000);

  test.afterEach(async ({}, testInfo) => {
    const audit = audits.get(testInfo.testId);
    if (!audit) return;
    await audit.flush();
    await testInfo.attach('analytics-privacy-network-summary.json', {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify({
        test: testInfo.title, status: testInfo.status, origin: audit.origin, localOriginMapping: audit.local,
        syntheticFixtureSha256: audit.fixtureHash(), actions: audit.actions,
        pageviews: audit.pageviews().length, cloudflareRum: audit.rum().length,
        explicitlyOpenedMaps: audit.maps().filter(request => request.authorizedMap).length,
        sensitiveRequestDetected: audit.blockedLeaks.length > 0, blockedBeforeNetwork: audit.blockedLeaks,
        requests: audit.requests.map(request => {
          const url = new URL(request.url);
          return { method: request.method, destination: `${url.origin}${url.pathname}`, queryKeys: [...url.searchParams.keys()], bodyBytes: Buffer.byteLength(request.body), blocked: Boolean(request.blocked), authorizedMap: Boolean(request.authorizedMap) };
        }),
      }, null, 2)),
    });
    audits.delete(testInfo.testId);
  });

  test('real pageviews survive map mouse/keyboard actions, replacement, clear and reload without sensitive analytics', async ({ context, page, baseURL }, testInfo) => {
    const audit = await installNetworkAudit(context, baseURL!);
    audits.set(testInfo.testId, audit);
    await page.goto(`${audit.origin}/`, { waitUntil: 'load' });
    await requireRealPageview(page, audit);
    const fixture = await analyticsPrivacyFixture(page);
    audit.registerFixture(fixture);
    audit.recordAction('select-gps-jpeg');
    await upload(page, fixture.filename, fixture.bytes);
    const button = page.getByRole('button', { name: 'View on OpenStreetMap', exact: true });
    await expect(button).toHaveClass(/map-open-button/);
    await expect(page.locator('[data-exif-summary="gps"]')).toContainText(`${fixture.latitude.toFixed(6)}, ${fixture.longitude.toFixed(6)}`);
    const attributes = await button.evaluate(element => Array.from(element.attributes, attribute => `${attribute.name}=${attribute.value}`).join('\n'));
    expect(attributes).not.toMatch(/https?:|mlat|mlon|data-.*url|href=/);
    expect(audit.maps()).toHaveLength(0);

    for (const method of ['mouse', 'Enter', 'Space']) {
      audit.allowNextMap(method);
      const opened = context.waitForEvent('page');
      if (method === 'mouse') await button.click();
      else { await button.focus(); await page.keyboard.press(method); }
      const popup = await opened;
      await popup.waitForLoadState('domcontentloaded');
      await expect(popup).toHaveURL(url => url.origin === 'https://www.openstreetmap.org');
      expect(await popup.evaluate(() => window.opener)).toBeNull();
      await popup.close();
      await expect(page.locator('.report-heading h2')).toContainText(fixture.filename);
      await assertPrivateTraffic(audit, fixture);
    }
    expect(audit.maps()).toHaveLength(3);
    // A native button's auxiliary click must not resurrect the former anchor's
    // outbound-link event or silently open a map.
    audit.recordAction('map:middle-button-no-navigation-authorized');
    await button.click({ button: 'middle' });
    // Windows Chromium may enter native auto-scroll on an auxiliary click.
    // Exit that browser mode so it cannot consume the later Clear click.
    await page.keyboard.press('Escape');
    audit.recordAction('replace-with-no-gps-jpeg');
    await upload(page, fixture.plainFilename, fixture.plain);
    await expect(page.locator('.map-open-button')).toHaveCount(0);
    expect(audit.maps()).toHaveLength(3);
    await upload(page, fixture.filename, fixture.bytes);
    audit.recordAction('clear-gps-result');
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expectEmptyViewer(page, fixture, true);
    const viewsBeforeReload = audit.pageviews().length;
    audit.recordAction('reload-cleared-page');
    await page.reload({ waitUntil: 'load' });
    await hydratedWorkbench(page);
    await requireRealPageview(page, audit, viewsBeforeReload + 1);
    await expectEmptyViewer(page, fixture);
    await finishOnPrivacyPage(page, audit, fixture);
    expect(audit.maps()).toHaveLength(3);
  });

  test('real analytics receives only page data across viewer → privacy → remover → cleaned-file privacy', async ({ context, page, baseURL }, testInfo) => {
    const audit = await installNetworkAudit(context, baseURL!);
    audits.set(testInfo.testId, audit);
    await page.goto(`${audit.origin}/`, { waitUntil: 'load' });
    await requireRealPageview(page, audit);
    const fixture = await analyticsPrivacyFixture(page);
    audit.registerFixture(fixture);
    audit.recordAction('select-gps-jpeg');
    await upload(page, fixture.filename, fixture.bytes);
    const documentId = await page.evaluate(() => (window as Window & { __privacyDocumentId?: string }).__privacyDocumentId);
    const continueTo = async (scope: string, path: string) => {
      audit.recordAction(`soft-handoff:${path}`);
      await page.locator(scope).locator(`a[data-tool-file-link][href="${path}"]`).click();
      await expect(page).toHaveURL(`${audit.origin}${path}`);
      await hydratedWorkbench(page);
      expect(await page.evaluate(() => (window as Window & { __privacyDocumentId?: string }).__privacyDocumentId)).toBe(documentId);
    };
    await continueTo('.report-privacy', '/image-privacy-checker/');
    await expect(page.locator('.privacy-result-actions h2')).toContainText(fixture.filename, { timeout: 90_000 });
    await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete', { timeout: 90_000 });
    await expect(page.locator('#risk-precise-location')).toBeVisible();
    await continueTo('.tool-next-steps', '/image-metadata-remover/');
    await expect(page.locator('.removal-file-head h2')).toContainText(fixture.filename, { timeout: 90_000 });
    await expect(page.locator('.removal-result')).toHaveCount(0);
    audit.recordAction('explicit-create-and-verify-clean-copy');
    await page.getByRole('button', { name: 'Create and verify clean copy', exact: true }).click();
    await expect(page.locator('.removal-result')).toBeVisible({ timeout: 90_000 });
    await expect(page.locator('.removal-result')).not.toHaveClass(/is-blocked/);
    await continueTo('.removal-result .tool-next-steps', '/image-privacy-checker/');
    await expect(page.locator('.privacy-result-actions h2')).toContainText('viewexif-private-c7d493ab-clean.jpg', { timeout: 90_000 });
    await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete', { timeout: 90_000 });
    await expect(page.locator('#risk-precise-location')).toHaveCount(0);
    await expect(page.locator('#risk-creator-identity')).toHaveCount(0);
    await expect.poll(() => audit.pageviews().map(request => new URL(JSON.parse(request.body).u).pathname)).toEqual(expect.arrayContaining(['/', '/image-privacy-checker/', '/image-metadata-remover/']));
    expect(audit.maps()).toHaveLength(0);
    await finishOnPrivacyPage(page, audit, fixture);
  });
});
