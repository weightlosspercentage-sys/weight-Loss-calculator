// Dedicated config for the navigation/ad audit.
// Serves the ROOT static site (the live pages), not dist/.
// Your existing playwright.config.js is left untouched.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /nav-audit\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-audit' }]],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node tests/static-server.mjs',
    url: 'http://localhost:4321/',
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});
