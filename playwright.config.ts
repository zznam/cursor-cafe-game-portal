import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // A shared real SQL fixture includes controlled database outages.
  workers: process.env.CI || process.env.E2E_MOCK_DATABASE === 'true' ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad (gen 7)'],
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: process.env.E2E_MOCK_DATABASE === 'true' ? 'node scripts/e2e-server.mjs' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI && process.env.E2E_MOCK_DATABASE !== 'true',
    timeout: 120000,
  },
})
