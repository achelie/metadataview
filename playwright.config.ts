import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: externalBaseUrl ?? 'http://127.0.0.1:4329',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: '**/release.spec.ts', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: '**/release.spec.ts', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: externalBaseUrl ? undefined : {
    command: 'pnpm preview --host 127.0.0.1 --port 4329',
    url: 'http://127.0.0.1:4329',
    reuseExistingServer: false,
  },
});
