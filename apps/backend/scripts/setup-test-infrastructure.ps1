# Test Infrastructure Setup Script for Exam Bank System (PowerShell)
# Sets up CI/CD integration, coverage reporting, and performance baselines

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"

function Write-Header {
    param([string]$Message)
    Write-Host "================================" -ForegroundColor $BLUE
    Write-Host $Message -ForegroundColor $BLUE
    Write-Host "================================" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $RED
}

function New-GitHubWorkflow {
    Write-Header "Creating GitHub Actions Workflow"
    
    $workflowDir = "../../.github/workflows"
    if (-not (Test-Path $workflowDir)) {
        New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
    }
    
    $workflowContent = @'
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
        go test -v -race -coverprofile=coverage.out ./internal/...
    
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
'@
    
    Set-Content -Path "$workflowDir/test.yml" -Value $workflowContent
    Write-Success "GitHub Actions workflow created"
}

function New-CoverageConfig {
    Write-Header "Creating Coverage Configuration"
    
    # Backend coverage config
    $backendCoverageConfig = @'
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
'@
    
    Set-Content -Path ".coveragerc" -Value $backendCoverageConfig
    
    # Frontend coverage config
    $frontendCoverageConfig = @'
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
'@
    
    Set-Content -Path "../frontend/coverage.config.js" -Value $frontendCoverageConfig
    Write-Success "Coverage configuration created"
}

function New-PerformanceBaselines {
    Write-Header "Creating Performance Baselines"
    
    $performanceDir = "../../docs/performance"
    if (-not (Test-Path $performanceDir)) {
        New-Item -ItemType Directory -Path $performanceDir -Force | Out-Null
    }
    
    $baselinesContent = @'
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
'@
    
    Set-Content -Path "$performanceDir/baselines.json" -Value $baselinesContent
    Write-Success "Performance baselines created"
}

function New-TestDocumentation {
    Write-Header "Creating Test Documentation"
    
    $testingDir = "../../docs/testing"
    if (-not (Test-Path $testingDir)) {
        New-Item -ItemType Directory -Path $testingDir -Force | Out-Null
    }
    
    $readmeContent = @'
# Testing Guide for Exam Bank System

## Overview
Comprehensive testing strategy covering unit tests, integration tests, E2E tests, and performance tests.

## Test Structure

### Backend Tests (Go)
- **Location**: `apps/backend/internal/`
- **Framework**: Go testing + testify
- **Coverage Target**: 90%+
- **Run Command**: `go test ./internal/...`

### Frontend Tests (TypeScript/React)
- **Location**: `apps/frontend/src/tests/`
- **Framework**: Jest + React Testing Library + Playwright
- **Coverage Target**: 80%+
- **Run Command**: `npm test`

## Running Tests

### Local Development
```bash
# Backend tests
cd apps/backend
go test -v -race -coverprofile=coverage.out ./internal/...

# Frontend tests
cd apps/frontend
npm test -- --coverage --watchAll=false

# E2E tests
cd apps/frontend
npx playwright test
```

### Coverage Reports
- **Backend**: `apps/backend/coverage.html`
- **Frontend**: `apps/frontend/coverage/lcov-report/index.html`

## Performance Monitoring
- Baselines defined in `docs/performance/baselines.json`
- Automated performance regression detection
- Performance reports in CI/CD pipeline
'@
    
    Set-Content -Path "$testingDir/README.md" -Value $readmeContent
    Write-Success "Test documentation created"
}

function New-TestMakefile {
    Write-Header "Creating Test Commands Script"
    
    $makefileContent = @'
# Exam Bank System - Test Commands (Windows)

.PHONY: help test test-backend test-frontend test-all coverage clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@echo '  test-backend     Run backend tests'
	@echo '  test-frontend    Run frontend tests'
	@echo '  test-all         Run all tests'
	@echo '  coverage         Generate coverage reports'
	@echo '  clean            Clean test artifacts'

test-backend: ## Run backend tests
	cd apps/backend && go test -v -race -coverprofile=coverage.out ./internal/...

test-frontend: ## Run frontend tests
	cd apps/frontend && npm test -- --watchAll=false

test-all: test-backend test-frontend ## Run all tests

coverage: ## Generate coverage reports
	cd apps/backend && go test -v -race -coverprofile=coverage.out ./internal/... && go tool cover -html=coverage.out -o coverage.html
	cd apps/frontend && npm test -- --coverage --watchAll=false

clean: ## Clean test artifacts
	cd apps/backend && del /f coverage.out coverage.html *.log 2>nul || true
	cd apps/frontend && rmdir /s /q coverage .jest-cache 2>nul || true
'@
    
    Set-Content -Path "../../Makefile" -Value $makefileContent
    Write-Success "Makefile created"
}

# Main execution
function Main {
    Write-Header "Setting Up Test Infrastructure for Exam Bank System"
    
    # Check if we're in the right directory
    if (-not (Test-Path "../../package.json") -and -not (Test-Path "../../apps")) {
        Write-Error "Please run this script from the apps/backend directory"
        exit 1
    }
    
    try {
        # Create all infrastructure components
        New-GitHubWorkflow
        New-CoverageConfig
        New-PerformanceBaselines
        New-TestDocumentation
        New-TestMakefile
        
        Write-Header "Test Infrastructure Setup Complete!"
        
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor $BLUE
        Write-Host "1. Run backend tests: go test ./internal/..." -ForegroundColor $GREEN
        Write-Host "2. Run frontend tests: cd ../frontend && npm test" -ForegroundColor $GREEN
        Write-Host "3. Check docs/testing/README.md for detailed guide" -ForegroundColor $GREEN
        Write-Host "4. Configure your CI/CD environment variables" -ForegroundColor $GREEN
        Write-Host ""
        
        Write-Success "Test infrastructure is ready!"
    }
    catch {
        Write-Error "Failed to setup test infrastructure: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main
