#!/bin/bash

# Test Infrastructure Setup Script for Exam Bank System
# Sets up CI/CD integration, coverage reporting, and performance baselines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Create GitHub Actions workflow for CI/CD
create_github_workflow() {
    print_header "Creating GitHub Actions Workflow"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/test.yml << 'EOF'
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: test_user
          POSTGRES_DB: test_exam_bank_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    
    - name: Cache Go modules
      uses: actions/cache@v3
      with:
        path: ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
        restore-keys: |
          ${{ runner.os }}-go-
    
    - name: Install dependencies
      working-directory: ./apps/backend
      run: go mod download
    
    - name: Run backend tests
      working-directory: ./apps/backend
      run: |
        export TEST_DB_HOST=localhost
        export TEST_DB_PORT=5432
        export TEST_DB_USER=test_user
        export TEST_DB_PASSWORD=test_password
        export TEST_DB_NAME=test_exam_bank_db
        export REDIS_URL=redis://localhost:6379
        export JWT_SECRET=test-secret
        ./scripts/run-tests.sh --no-lint
    
    - name: Upload backend coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./apps/backend/coverage.out
        flags: backend
        name: backend-coverage

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: ./apps/frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./apps/frontend
      run: npm ci
    
    - name: Run frontend tests
      working-directory: ./apps/frontend
      run: npm test -- --coverage --watchAll=false
    
    - name: Upload frontend coverage
      uses: codecov/codecov-action@v3
      with:
        directory: ./apps/frontend/coverage
        flags: frontend
        name: frontend-coverage

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: ./apps/frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./apps/frontend
      run: npm ci
    
    - name: Install Playwright
      working-directory: ./apps/frontend
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      working-directory: ./apps/frontend
      run: npx playwright test
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: ./apps/frontend/playwright-report/
        retention-days: 30
EOF
    
    print_success "GitHub Actions workflow created"
}

# Create coverage configuration
create_coverage_config() {
    print_header "Creating Coverage Configuration"
    
    # Backend coverage config
    cat > apps/backend/.coveragerc << 'EOF'
[run]
source = .
omit = 
    */vendor/*
    */node_modules/*
    */test*
    */mock*
    *_test.go
    */cmd/*
    */scripts/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:

[html]
directory = coverage_html_report
EOF
    
    # Frontend coverage config (update package.json)
    cat > apps/frontend/coverage.config.js << 'EOF'
module.exports = {
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
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
    'cobertura',
  ],
  coverageDirectory: 'coverage',
};
EOF
    
    print_success "Coverage configuration created"
}

# Create performance baseline configuration
create_performance_baselines() {
    print_header "Creating Performance Baselines"
    
    mkdir -p docs/performance
    
    cat > docs/performance/baselines.json << 'EOF'
{
  "api_performance": {
    "simple_queries": {
      "target": "< 200ms",
      "warning": "< 300ms",
      "critical": "< 500ms"
    },
    "complex_queries": {
      "target": "< 500ms",
      "warning": "< 750ms",
      "critical": "< 1000ms"
    },
    "concurrent_users": {
      "target": "100+ users",
      "warning": "50+ users",
      "critical": "25+ users"
    }
  },
  "frontend_performance": {
    "page_load": {
      "target": "< 1s",
      "warning": "< 2s",
      "critical": "< 3s"
    },
    "component_render": {
      "target": "< 100ms",
      "warning": "< 200ms",
      "critical": "< 500ms"
    },
    "bundle_size": {
      "target": "< 500KB",
      "warning": "< 750KB",
      "critical": "< 1MB"
    }
  },
  "database_performance": {
    "simple_queries": {
      "target": "< 100ms",
      "warning": "< 200ms",
      "critical": "< 300ms"
    },
    "analytics_queries": {
      "target": "< 300ms",
      "warning": "< 500ms",
      "critical": "< 1000ms"
    }
  }
}
EOF
    
    print_success "Performance baselines created"
}

# Create test documentation
create_test_documentation() {
    print_header "Creating Test Documentation"
    
    mkdir -p docs/testing
    
    cat > docs/testing/README.md << 'EOF'
# Testing Guide for Exam Bank System

## Overview
Comprehensive testing strategy covering unit tests, integration tests, E2E tests, and performance tests.

## Test Structure

### Backend Tests (Go)
- **Location**: `apps/backend/internal/`
- **Framework**: Go testing + testify
- **Coverage Target**: 90%+
- **Run Command**: `./scripts/run-tests.sh`

#### Test Types:
1. **Unit Tests**: Business logic, services, utilities
2. **Integration Tests**: Database operations, gRPC services
3. **Repository Tests**: Data access layer validation

### Frontend Tests (TypeScript/React)
- **Location**: `apps/frontend/src/tests/`
- **Framework**: Jest + React Testing Library + Playwright
- **Coverage Target**: 80%+
- **Run Command**: `npm test`

#### Test Types:
1. **Component Tests**: React component rendering and behavior
2. **Store Tests**: State management validation
3. **Service Tests**: API service mocking and validation
4. **E2E Tests**: Complete user workflows

### Performance Tests
- **Location**: `apps/frontend/src/tests/load/`
- **Framework**: Playwright
- **Target**: 100+ concurrent users
- **Run Command**: `npx playwright test --grep="performance"`

## Running Tests

### Local Development
```bash
# Backend tests
cd apps/backend
./scripts/run-tests.sh

# Frontend tests
cd apps/frontend
npm test

# E2E tests
cd apps/frontend
npx playwright test

# Performance tests
cd apps/frontend
npx playwright test --grep="performance"
```

### CI/CD Pipeline
Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Scheduled nightly runs

## Coverage Reports
- **Backend**: `apps/backend/coverage.html`
- **Frontend**: `apps/frontend/coverage/lcov-report/index.html`
- **Combined**: Available in CI/CD artifacts

## Performance Monitoring
- Baselines defined in `docs/performance/baselines.json`
- Automated performance regression detection
- Performance reports in CI/CD pipeline

## Best Practices

### Writing Tests
1. Follow AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names
3. Mock external dependencies
4. Test edge cases and error conditions
5. Maintain test independence

### Test Data
1. Use factories for test data generation
2. Clean up after tests
3. Use isolated test databases
4. Avoid hardcoded values

### Performance Tests
1. Test realistic user scenarios
2. Monitor memory usage
3. Test concurrent operations
4. Validate response times
5. Check for memory leaks

## Troubleshooting

### Common Issues
1. **Database connection errors**: Ensure test database is running
2. **Mock failures**: Verify mock setup and expectations
3. **Timeout errors**: Increase timeout for slow operations
4. **Coverage gaps**: Add tests for uncovered code paths

### Debug Commands
```bash
# Run specific test
go test -v ./internal/service/... -run TestSpecificFunction

# Run with coverage
npm test -- --coverage --watchAll=false

# Debug E2E tests
npx playwright test --debug

# Performance profiling
npx playwright test --trace=on
```
EOF
    
    print_success "Test documentation created"
}

# Create Makefile for easy test execution
create_makefile() {
    print_header "Creating Makefile for Test Commands"
    
    cat > Makefile << 'EOF'
# Exam Bank System - Test Commands

.PHONY: help test test-backend test-frontend test-e2e test-performance test-all coverage clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Backend Tests
test-backend: ## Run backend unit and integration tests
	cd apps/backend && ./scripts/run-tests.sh

test-backend-unit: ## Run backend unit tests only
	cd apps/backend && ./scripts/run-tests.sh --unit-only

test-backend-integration: ## Run backend integration tests only
	cd apps/backend && ./scripts/run-tests.sh --integration-only

# Frontend Tests
test-frontend: ## Run frontend unit and component tests
	cd apps/frontend && npm test -- --watchAll=false

test-frontend-coverage: ## Run frontend tests with coverage
	cd apps/frontend && npm test -- --coverage --watchAll=false

# E2E Tests
test-e2e: ## Run end-to-end tests
	cd apps/frontend && npx playwright test

test-e2e-headed: ## Run E2E tests in headed mode
	cd apps/frontend && npx playwright test --headed

# Performance Tests
test-performance: ## Run performance tests
	cd apps/frontend && npx playwright test --grep="performance"

# Combined Tests
test-all: test-backend test-frontend test-e2e ## Run all tests

# Coverage
coverage: ## Generate coverage reports
	cd apps/backend && ./scripts/run-tests.sh --no-lint
	cd apps/frontend && npm test -- --coverage --watchAll=false

coverage-open: coverage ## Generate and open coverage reports
	cd apps/backend && open coverage.html
	cd apps/frontend && open coverage/lcov-report/index.html

# Cleanup
clean: ## Clean test artifacts
	cd apps/backend && rm -f coverage.out coverage.html *.log
	cd apps/frontend && rm -rf coverage .jest-cache

# Setup
setup-test-db: ## Setup test database
	docker-compose -f docker/compose/docker-compose.yml up -d postgres redis

teardown-test-db: ## Teardown test database
	docker-compose -f docker/compose/docker-compose.yml down

# CI/CD
ci-test: setup-test-db test-all ## Run tests in CI environment

# Development
watch-backend: ## Watch backend tests
	cd apps/backend && find . -name "*.go" | entr -r ./scripts/run-tests.sh --unit-only

watch-frontend: ## Watch frontend tests
	cd apps/frontend && npm test

# Lint and Format
lint: ## Run linters
	cd apps/backend && golangci-lint run ./...
	cd apps/frontend && npm run lint

format: ## Format code
	cd apps/backend && go fmt ./...
	cd apps/frontend && npm run format
EOF
    
    print_success "Makefile created"
}

# Main execution
main() {
    print_header "Setting Up Test Infrastructure for Exam Bank System"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -d "apps" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Create all infrastructure components
    create_github_workflow
    create_coverage_config
    create_performance_baselines
    create_test_documentation
    create_makefile
    
    print_header "Test Infrastructure Setup Complete!"
    
    echo ""
    echo "Next steps:"
    echo "1. Run 'make test-all' to execute all tests"
    echo "2. Run 'make coverage' to generate coverage reports"
    echo "3. Check 'docs/testing/README.md' for detailed testing guide"
    echo "4. Configure your CI/CD environment variables"
    echo ""
    echo "Available commands:"
    echo "- make test-backend      # Backend tests"
    echo "- make test-frontend     # Frontend tests"
    echo "- make test-e2e          # End-to-end tests"
    echo "- make test-performance  # Performance tests"
    echo "- make coverage          # Coverage reports"
    echo ""
    
    print_success "Test infrastructure is ready!"
}

# Run main function
main "$@"
