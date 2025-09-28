/**
 * Jest Configuration for Integration Tests
 * Cấu hình Jest chuyên dụng cho integration testing
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup/jest.integration.setup.ts'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/tests/e2e/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/generated/(.*)$': '<rootDir>/src/generated/$1',
    '^@/tests/(.*)$': '<rootDir>/src/tests/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/services/**/*.{js,ts,tsx}',
    'src/contexts/**/*.{js,ts,tsx}',
    'src/lib/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/generated/**/*'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test timeout (longer for integration tests)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/src/tests/setup/global.setup.ts',
  globalTeardown: '<rootDir>/src/tests/setup/global.teardown.ts',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-reports',
        filename: 'integration-test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Authentication Integration Test Report'
      }
    ]
  ],
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/test-reports/'
  ]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
