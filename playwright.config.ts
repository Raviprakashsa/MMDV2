import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for integration tests.
 *
 * Local:   npx playwright test
 * CI:      npx playwright test --reporter=list  (as per package.json test:integration)
 */
export default defineConfig({
  testDir: './tests/integration',
  testMatch: ['**/*.spec.ts'],

  // Fail fast — stop after first failure in CI to save time
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  // Each test gets 60s; global setup gets 120s
  timeout: 60_000,
  globalTimeout: 600_000,

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Capture traces on retry for debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',

    // Don't follow redirects automatically for API calls
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },

    // Chromium-only in CI (faster)
    ...devices['Desktop Chrome'],
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No webServer — CI starts the app manually before running tests
})
