import { defineConfig, devices } from '@playwright/test';

const HOST = 'http://127.0.0.1:4173';
const BASE = `${HOST}/Embedded32`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: HOST,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx serve .e2e-pages -l 4173',
    url: `${BASE}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
