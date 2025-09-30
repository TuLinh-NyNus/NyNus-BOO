/**
 * Unified Jest Configuration with Projects
 * Consolidated configuration for unit, integration, and e2e tests
 * Uses Jest projects pattern to eliminate duplication
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Shared configuration for all test types
const sharedConfig = {
  // Test environment
  testEnvironment: 'jsdom',

  // Module name mapping for absolute imports (shared across all projects)
  // Note: Tests are now in root-level tests/ directory
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/generated/(.*)$': '<rootDir>/src/generated/$1',
    '^@/tests/(.*)$': '<rootDir>/../../tests/frontend/$1',
  },

  // Transform configuration (shared)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module file extensions (shared)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Common settings
  clearMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
};

// Jest Projects Configuration
const customJestConfig = {
  ...sharedConfig,

  // Use projects for different test types
  projects: [
    // Unit Tests Project
    {
      displayName: 'unit',
      ...sharedConfig,
      setupFilesAfterEnv: ['<rootDir>/../../tests/frontend/setup/jest.setup.ts'],
      testMatch: [
        '<rootDir>/../../tests/frontend/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/../../tests/frontend/unit/**/*.spec.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/../../tests/frontend/e2e/',
        '<rootDir>/../../tests/frontend/integration/',
      ],
      collectCoverageFrom: [
        'src/components/**/*.{js,jsx,ts,tsx}',
        'src/lib/**/*.{js,ts}',
        'src/hooks/**/*.{js,ts}',
        'src/stores/**/*.{js,ts}',
        'src/services/**/*.{js,ts}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/tests/**/*',
        '!src/**/index.{js,ts}',
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/components/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        './src/stores/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      testTimeout: 10000,
      globalSetup: '<rootDir>/../../tests/frontend/setup/global-setup.ts',
      globalTeardown: '<rootDir>/../../tests/frontend/setup/global-teardown.ts',
      cacheDirectory: '<rootDir>/.jest-cache/unit',
    },

    // Integration Tests Project
    {
      displayName: 'integration',
      ...sharedConfig,
      setupFilesAfterEnv: ['<rootDir>/../../tests/frontend/setup/jest.integration.setup.ts'],
      testMatch: [
        '<rootDir>/../../tests/frontend/integration/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/../../tests/frontend/e2e/**/*.test.{js,jsx,ts,tsx}',
      ],
      collectCoverageFrom: [
        'src/services/**/*.{js,ts,tsx}',
        'src/contexts/**/*.{js,ts,tsx}',
        'src/lib/**/*.{js,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**/*',
        '!src/generated/**/*',
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      testTimeout: 30000,
      globalSetup: '<rootDir>/../../tests/frontend/setup/global.setup.ts',
      globalTeardown: '<rootDir>/../../tests/frontend/setup/global.teardown.ts',
      watchPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/test-reports/',
      ],
      cacheDirectory: '<rootDir>/.jest-cache/integration',
    },
  ],

  // Global coverage configuration
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',

  // Global settings
  verbose: true,
  notify: false,
  maxWorkers: '50%',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
