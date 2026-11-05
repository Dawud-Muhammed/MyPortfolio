import { defineConfig } from '@playwright/test';
declare const process: { env: Record<string, string | undefined> };
export default defineConfig({
  testDir: './tests',
  testMatch: 'ui.spec.ts',
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'artifacts/ui-results.json' }]],
  outputDir: 'artifacts/ui-test-results',
  use: {
    baseURL: process.env.UI_BASE_URL || 'http://127.0.0.1:5174',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});

