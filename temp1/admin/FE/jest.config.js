/**
 * Jest Configuration for NyNus Admin App
 * Cấu hình Jest cho NyNus Admin App với focus vào security testing
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Test environment
  testEnvironment: "jsdom",

  // Module name mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@nynusboo/lib$": "<rootDir>/../../packages/lib/src",
    "^@nynusboo/lib/(.*)$": "<rootDir>/../../packages/lib/src/$1",
  },

  // Test file patterns
  testMatch: [
    "<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.test.{js,jsx,ts,tsx}",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "middleware.ts",
    "!src/**/*.d.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/not-found.tsx",
    "!src/app/**/error.tsx",
    "!src/app/**/page.tsx",
    "!**/*.config.{js,ts}",
    "!**/node_modules/**",
  ],

  // Coverage thresholds - Focus on security components
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher thresholds for security-critical files
    "./middleware.ts": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    "./src/lib/admin-paths.ts": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output for security testing
  verbose: true,

  // Test timeout for security tests
  testTimeout: 10000,

  // Globals for security testing
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
