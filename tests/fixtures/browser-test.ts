import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Page, Route } from '@playwright/test';

const thirdPartyScripts = new Set([
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  'https://analytics.ahrefs.com/analytics.js',
]);

// General UI tests must not generate live advertising or analytics traffic.
// The dedicated network privacy audit uses the real scripts with serving blocked.
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route((url) => thirdPartyScripts.has(url.origin + url.pathname), (route) => route.fulfill({
      contentType: 'application/javascript',
      headers: { 'access-control-allow-origin': '*' },
      body: '',
    }));
    await use(context);
  },
});
