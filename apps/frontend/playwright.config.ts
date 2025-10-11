import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Testing
 * Cấu hình Playwright cho end-to-end testing của NyNus Exam Bank System
 */

export default defineConfig({
  // Test directory
  testDir: './src/tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Global timeout for each action
    actionTimeout: 10000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet testing
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Global setup and teardown - REMOVED (files deleted, causing test discovery issues)

  // Run your local dev server before starting the tests - DISABLED (server already running)
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },

  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Test match patterns
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.e2e.spec.ts',
  ],
  
  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
  ],
});
