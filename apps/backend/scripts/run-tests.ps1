# Comprehensive Test Runner for Exam Bank System Backend (PowerShell)
# Runs unit tests, integration tests, and generates coverage reports

param(
    [switch]$UnitOnly,
    [switch]$IntegrationOnly,
    [switch]$NoCoverage,
    [switch]$NoLint,
    [switch]$Help
)

# Configuration
$TEST_DB_NAME = "test_exam_bank_db"
$TEST_DB_USER = "test_user"
$TEST_DB_PASSWORD = "test_password"
$COVERAGE_THRESHOLD = 80
$COVERAGE_FILE = "coverage.out"
$COVERAGE_HTML = "coverage.html"

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

function Test-Dependencies {
    Write-Header "Checking Dependencies"
    
    # Check Go
    try {
        $goVersion = go version
        Write-Success "Go is installed: $goVersion"
    }
    catch {
        Write-Error "Go is not installed"
        exit 1
    }
    
    # Check PostgreSQL
    try {
        psql --version | Out-Null
        Write-Success "PostgreSQL client is available"
        $script:SKIP_DB_TESTS = $false
    }
    catch {
        Write-Warning "PostgreSQL client not found, skipping database tests"
        $script:SKIP_DB_TESTS = $true
    }
    
    # Check Docker
    try {
        docker --version | Out-Null
        Write-Success "Docker is available"
    }
    catch {
        Write-Warning "Docker not found, using local database for tests"
    }
}

function Initialize-TestDatabase {
    if ($script:SKIP_DB_TESTS) {
        Write-Warning "Skipping database setup"
        return
    }
    
    Write-Header "Setting Up Test Database"
    
    # Check if test database exists
    try {
        $env:PGPASSWORD = $TEST_DB_PASSWORD
        psql -h localhost -U $TEST_DB_USER -d $TEST_DB_NAME -c '\q' 2>$null
        Write-Success "Test database already exists"
    }
    catch {
        Write-Warning "Test database not found, please ensure test database is set up"
        Write-Warning "You can run: make db-test-setup"
    }
}

function Invoke-UnitTests {
    Write-Header "Running Unit Tests"
    
    Write-Host "Running unit tests with coverage..."
    
    # Run unit tests with coverage
    $testResult = go test -v -race -coverprofile=$COVERAGE_FILE `
        ./internal/service/service_mgmt/exam_mgmt/... `
        ./internal/grpc/... `
        ./internal/cache/... `
        ./internal/repository/... `
        ./internal/validation/... `
        ./internal/latex/... 2>&1 | Tee-Object -FilePath "test_unit.log"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Unit tests passed"
        return $true
    }
    else {
        Write-Error "Unit tests failed"
        return $false
    }
}

function Invoke-IntegrationTests {
    if ($script:SKIP_DB_TESTS) {
        Write-Warning "Skipping integration tests (no database)"
        return $true
    }
    
    Write-Header "Running Integration Tests"
    
    Write-Host "Running integration tests..."
    
    # Set test environment variables
    $env:TEST_DB_HOST = "localhost"
    $env:TEST_DB_PORT = "5432"
    $env:TEST_DB_USER = $TEST_DB_USER
    $env:TEST_DB_PASSWORD = $TEST_DB_PASSWORD
    $env:TEST_DB_NAME = $TEST_DB_NAME
    $env:JWT_SECRET = "test-secret"
    
    # Run integration tests
    $testResult = go test -v -race -tags=integration `
        ./internal/grpc/... `
        ./internal/repository/... 2>&1 | Tee-Object -FilePath "test_integration.log"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Integration tests passed"
        return $true
    }
    else {
        Write-Error "Integration tests failed"
        return $false
    }
}

function New-CoverageReport {
    Write-Header "Generating Coverage Report"
    
    if (-not (Test-Path $COVERAGE_FILE)) {
        Write-Warning "Coverage file not found, skipping coverage report"
        return
    }
    
    # Generate HTML coverage report
    go tool cover -html=$COVERAGE_FILE -o $COVERAGE_HTML
    Write-Success "HTML coverage report generated: $COVERAGE_HTML"
    
    # Get coverage percentage
    $coverageOutput = go tool cover -func=$COVERAGE_FILE | Select-String "total"
    if ($coverageOutput) {
        $coverageText = $coverageOutput.ToString()
        $coverage = [regex]::Match($coverageText, '(\d+\.\d+)%').Groups[1].Value
        $script:COVERAGE = [double]$coverage
        
        Write-Host "Total coverage: $coverage%"
        
        # Check coverage threshold
        if ($script:COVERAGE -ge $COVERAGE_THRESHOLD) {
            Write-Success "Coverage meets threshold ($coverage% >= $COVERAGE_THRESHOLD%)"
        }
        else {
            Write-Warning "Coverage below threshold ($coverage% < $COVERAGE_THRESHOLD%)"
        }
        
        # Show coverage by package
        Write-Host ""
        Write-Host "Coverage by package:"
        go tool cover -func=$COVERAGE_FILE | Where-Object { $_ -notmatch "total" }
    }
}

function Invoke-Linting {
    Write-Header "Running Code Quality Checks"
    
    # Check if golangci-lint is installed
    try {
        golangci-lint --version | Out-Null
        Write-Host "Running golangci-lint..."
        $lintResult = golangci-lint run ./... 2>&1 | Tee-Object -FilePath "lint.log"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Linting passed"
        }
        else {
            Write-Warning "Linting issues found (see lint.log)"
        }
    }
    catch {
        Write-Warning "golangci-lint not found, skipping linting"
    }
}

function Invoke-SecurityChecks {
    Write-Header "Running Security Checks"
    
    # Check if gosec is installed
    try {
        gosec --version | Out-Null
        Write-Host "Running gosec security scanner..."
        $secResult = gosec ./... 2>&1 | Tee-Object -FilePath "security.log"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Security checks passed"
        }
        else {
            Write-Warning "Security issues found (see security.log)"
        }
    }
    catch {
        Write-Warning "gosec not found, skipping security checks"
    }
}

function Remove-TempFiles {
    Write-Header "Cleaning Up"
    
    # Remove temporary files
    $tempFiles = @("test_unit.log", "test_integration.log", "lint.log", "security.log")
    foreach ($file in $tempFiles) {
        if (Test-Path $file) {
            Remove-Item $file -Force
        }
    }
    
    Write-Success "Cleanup completed"
}

function Show-Summary {
    Write-Header "Test Summary"
    
    Write-Host "Test Results:"
    Write-Host "- Unit Tests: $script:UNIT_TEST_STATUS"
    Write-Host "- Integration Tests: $script:INTEGRATION_TEST_STATUS"
    if ($script:COVERAGE) {
        Write-Host "- Coverage: $($script:COVERAGE)%"
    }
    else {
        Write-Host "- Coverage: N/A"
    }
    Write-Host ""
    
    if (Test-Path $COVERAGE_HTML) {
        Write-Host "Coverage report: $COVERAGE_HTML"
    }
    
    if ($script:OVERALL_STATUS -eq "PASSED") {
        Write-Success "All tests passed!"
        exit 0
    }
    else {
        Write-Error "Some tests failed!"
        exit 1
    }
}

function Show-Help {
    Write-Host "Usage: .\run-tests.ps1 [options]"
    Write-Host "Options:"
    Write-Host "  -UnitOnly        Run only unit tests"
    Write-Host "  -IntegrationOnly Run only integration tests"
    Write-Host "  -NoCoverage      Skip coverage report generation"
    Write-Host "  -NoLint          Skip linting"
    Write-Host "  -Help            Show this help message"
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Write-Header "Exam Bank System - Backend Test Suite"
    
    # Initialize status variables
    $script:UNIT_TEST_STATUS = "SKIPPED"
    $script:INTEGRATION_TEST_STATUS = "SKIPPED"
    $script:OVERALL_STATUS = "PASSED"
    $script:COVERAGE = $null
    $script:SKIP_DB_TESTS = $false
    
    # Check dependencies
    Test-Dependencies
    
    # Setup test database
    Initialize-TestDatabase
    
    # Run tests based on options
    if (-not $IntegrationOnly) {
        if (Invoke-UnitTests) {
            $script:UNIT_TEST_STATUS = "PASSED"
        }
        else {
            $script:UNIT_TEST_STATUS = "FAILED"
            $script:OVERALL_STATUS = "FAILED"
        }
    }
    
    if (-not $UnitOnly) {
        if (Invoke-IntegrationTests) {
            $script:INTEGRATION_TEST_STATUS = "PASSED"
        }
        else {
            $script:INTEGRATION_TEST_STATUS = "FAILED"
            $script:OVERALL_STATUS = "FAILED"
        }
    }
    
    # Generate coverage report
    if (-not $NoCoverage -and -not $IntegrationOnly) {
        New-CoverageReport
    }
    
    # Run linting
    if (-not $NoLint) {
        Invoke-Linting
    }
    
    # Run security checks
    Invoke-SecurityChecks
    
    # Show summary
    Show-Summary
}

# Cleanup on exit
try {
    Main
}
finally {
    Remove-TempFiles
}
