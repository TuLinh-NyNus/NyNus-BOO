import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright Configuration for Login Testing
 */

export default defineConfig({
  testDir: './src/tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report' }],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

