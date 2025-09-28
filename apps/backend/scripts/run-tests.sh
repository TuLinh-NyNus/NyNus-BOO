#!/bin/bash

# Comprehensive Test Runner for Exam Bank System Backend
# Runs unit tests, integration tests, and generates coverage reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DB_NAME="test_exam_bank_db"
TEST_DB_USER="test_user"
TEST_DB_PASSWORD="test_password"
COVERAGE_THRESHOLD=80
COVERAGE_FILE="coverage.out"
COVERAGE_HTML="coverage.html"

# Functions
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

check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Go
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed"
        exit 1
    fi
    print_success "Go is installed: $(go version)"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found, skipping database tests"
        SKIP_DB_TESTS=true
    else
        print_success "PostgreSQL client is available"
    fi
    
    # Check Docker (for test database)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found, using local database for tests"
    else
        print_success "Docker is available"
    fi
}

setup_test_database() {
    if [ "$SKIP_DB_TESTS" = true ]; then
        print_warning "Skipping database setup"
        return
    fi
    
    print_header "Setting Up Test Database"
    
    # Check if test database exists
    if psql -h localhost -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c '\q' 2>/dev/null; then
        print_success "Test database already exists"
    else
        print_warning "Test database not found, please ensure test database is set up"
        print_warning "You can run: make db-test-setup"
    fi
}

run_unit_tests() {
    print_header "Running Unit Tests"
    
    echo "Running unit tests with coverage..."
    
    # Run unit tests with coverage
    go test -v -race -coverprofile="$COVERAGE_FILE" \
        ./internal/service/service_mgmt/exam_mgmt/... \
        ./internal/grpc/... \
        ./internal/cache/... \
        ./internal/repository/... \
        ./internal/validation/... \
        ./internal/latex/... \
        2>&1 | tee test_unit.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        return 1
    fi
}

run_integration_tests() {
    if [ "$SKIP_DB_TESTS" = true ]; then
        print_warning "Skipping integration tests (no database)"
        return
    fi
    
    print_header "Running Integration Tests"
    
    echo "Running integration tests..."
    
    # Set test environment variables
    export TEST_DB_HOST="localhost"
    export TEST_DB_PORT="5432"
    export TEST_DB_USER="$TEST_DB_USER"
    export TEST_DB_PASSWORD="$TEST_DB_PASSWORD"
    export TEST_DB_NAME="$TEST_DB_NAME"
    export JWT_SECRET="test-secret"
    
    # Run integration tests
    go test -v -race -tags=integration \
        ./internal/grpc/... \
        ./internal/repository/... \
        2>&1 | tee test_integration.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        return 1
    fi
}

generate_coverage_report() {
    print_header "Generating Coverage Report"
    
    if [ ! -f "$COVERAGE_FILE" ]; then
        print_warning "Coverage file not found, skipping coverage report"
        return
    fi
    
    # Generate HTML coverage report
    go tool cover -html="$COVERAGE_FILE" -o "$COVERAGE_HTML"
    print_success "HTML coverage report generated: $COVERAGE_HTML"
    
    # Get coverage percentage
    COVERAGE=$(go tool cover -func="$COVERAGE_FILE" | grep total | awk '{print $3}' | sed 's/%//')
    
    echo "Total coverage: ${COVERAGE}%"
    
    # Check coverage threshold
    if (( $(echo "$COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
        print_success "Coverage meets threshold (${COVERAGE}% >= ${COVERAGE_THRESHOLD}%)"
    else
        print_warning "Coverage below threshold (${COVERAGE}% < ${COVERAGE_THRESHOLD}%)"
    fi
    
    # Show coverage by package
    echo ""
    echo "Coverage by package:"
    go tool cover -func="$COVERAGE_FILE" | grep -v "total"
}

run_linting() {
    print_header "Running Code Quality Checks"
    
    # Check if golangci-lint is installed
    if ! command -v golangci-lint &> /dev/null; then
        print_warning "golangci-lint not found, skipping linting"
        return
    fi
    
    echo "Running golangci-lint..."
    if golangci-lint run ./... 2>&1 | tee lint.log; then
        print_success "Linting passed"
    else
        print_warning "Linting issues found (see lint.log)"
    fi
}

run_security_checks() {
    print_header "Running Security Checks"
    
    # Check if gosec is installed
    if ! command -v gosec &> /dev/null; then
        print_warning "gosec not found, skipping security checks"
        return
    fi
    
    echo "Running gosec security scanner..."
    if gosec ./... 2>&1 | tee security.log; then
        print_success "Security checks passed"
    else
        print_warning "Security issues found (see security.log)"
    fi
}

cleanup() {
    print_header "Cleaning Up"
    
    # Remove temporary files
    rm -f test_unit.log test_integration.log lint.log security.log
    
    print_success "Cleanup completed"
}

show_summary() {
    print_header "Test Summary"
    
    echo "Test Results:"
    echo "- Unit Tests: $UNIT_TEST_STATUS"
    echo "- Integration Tests: $INTEGRATION_TEST_STATUS"
    echo "- Coverage: ${COVERAGE:-N/A}%"
    echo ""
    
    if [ -f "$COVERAGE_HTML" ]; then
        echo "Coverage report: $COVERAGE_HTML"
    fi
    
    if [ "$OVERALL_STATUS" = "PASSED" ]; then
        print_success "All tests passed!"
        exit 0
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Main execution
main() {
    print_header "Exam Bank System - Backend Test Suite"
    
    # Initialize status variables
    UNIT_TEST_STATUS="SKIPPED"
    INTEGRATION_TEST_STATUS="SKIPPED"
    OVERALL_STATUS="PASSED"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit-only)
                UNIT_ONLY=true
                shift
                ;;
            --integration-only)
                INTEGRATION_ONLY=true
                shift
                ;;
            --no-coverage)
                NO_COVERAGE=true
                shift
                ;;
            --no-lint)
                NO_LINT=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --unit-only        Run only unit tests"
                echo "  --integration-only Run only integration tests"
                echo "  --no-coverage      Skip coverage report generation"
                echo "  --no-lint          Skip linting"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Setup test database
    setup_test_database
    
    # Run tests based on options
    if [ "$INTEGRATION_ONLY" != true ]; then
        if run_unit_tests; then
            UNIT_TEST_STATUS="PASSED"
        else
            UNIT_TEST_STATUS="FAILED"
            OVERALL_STATUS="FAILED"
        fi
    fi
    
    if [ "$UNIT_ONLY" != true ]; then
        if run_integration_tests; then
            INTEGRATION_TEST_STATUS="PASSED"
        else
            INTEGRATION_TEST_STATUS="FAILED"
            OVERALL_STATUS="FAILED"
        fi
    fi
    
    # Generate coverage report
    if [ "$NO_COVERAGE" != true ] && [ "$INTEGRATION_ONLY" != true ]; then
        generate_coverage_report
    fi
    
    # Run linting
    if [ "$NO_LINT" != true ]; then
        run_linting
    fi
    
    # Run security checks
    run_security_checks
    
    # Show summary
    show_summary
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
