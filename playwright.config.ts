import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config for Kontrola App.
 *
 * - Captures screenshots on failure automatically
 * - Full-page screenshots available via test helpers
 * - Vision-friendly output for AI-driven UX analysis
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/results',

  /* Fail fast in CI, retry once locally */
  retries: process.env.CI ? 0 : 1,

  /* Parallel by default — single worker in CI for stability */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter: HTML for local review, line for CI */
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]]
    : [['html', { open: 'on-failure', outputFolder: 'e2e/report' }]],

  use: {
    /* Base URL from env or default Vite dev server */
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',

    /* Screenshot config for AI analysis */
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },

    /* Trace on first retry for debugging */
    trace: 'on-first-retry',

    /* Video on failure for complex flow debugging */
    video: 'retain-on-failure',

    /* Viewport for consistent screenshots */
    viewport: { width: 1280, height: 720 },

    /* Locale & timezone matching target users */
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],

  /* Dev server — auto-start Vite when running E2E locally */
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
