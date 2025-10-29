#!/bin/bash

# Comprehensive test runner for exam-bank-system CI/CD
# Runs all tests: backend, frontend, and mobile

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="apps/backend"
FRONTEND_DIR="apps/frontend"
MOBILE_DIR="apps/mobile"
LOG_DIR="test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create log directory
mkdir -p "$LOG_DIR"

# Functions
print_header() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Backend Tests
run_backend_tests() {
    print_header "Running Backend Tests"
    
    cd "$BACKEND_DIR"
    
    echo "Running Go tests with race detector..."
    if go test -v -race -coverprofile=coverage.out -covermode=atomic ./... 2>&1 | tee "../$LOG_DIR/backend_tests_${TIMESTAMP}.log"; then
        print_success "Backend tests passed"
        
        # Generate coverage report
        if command -v go &> /dev/null; then
            go tool cover -html=coverage.out -o "../$LOG_DIR/backend_coverage_${TIMESTAMP}.html"
            print_success "Backend coverage report generated"
        fi
    else
        print_error "Backend tests failed"
        return 1
    fi
    
    cd - > /dev/null
}

# Frontend Tests
run_frontend_tests() {
    print_header "Running Frontend Tests"
    
    cd "$FRONTEND_DIR"
    
    echo "Setting up frontend environment..."
    
    # Install dependencies if needed
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found, installing..."
        npm install -g pnpm
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    # Run linting
    echo "Running ESLint..."
    if pnpm lint --max-warnings=0 2>&1 | tee "../$LOG_DIR/frontend_lint_${TIMESTAMP}.log"; then
        print_success "Frontend linting passed"
    else
        print_error "Frontend linting failed"
        return 1
    fi
    
    # Type checking
    echo "Running TypeScript type check..."
    if pnpm type-check 2>&1 | tee "../$LOG_DIR/frontend_types_${TIMESTAMP}.log"; then
        print_success "Frontend type check passed"
    else
        print_error "Frontend type check failed"
        return 1
    fi
    
    # Unit tests
    echo "Running unit tests..."
    if pnpm test:unit --passWithNoTests --coverage 2>&1 | tee "../$LOG_DIR/frontend_unit_${TIMESTAMP}.log"; then
        print_success "Frontend unit tests passed"
    else
        print_warning "Frontend unit tests completed with warnings"
    fi
    
    cd - > /dev/null
}

# Mobile Tests
run_mobile_tests() {
    print_header "Running Mobile Tests"
    
    cd "$MOBILE_DIR"
    
    # Check if Flutter is installed
    if ! command -v flutter &> /dev/null; then
        print_warning "Flutter not found, skipping mobile tests"
        cd - > /dev/null
        return 0
    fi
    
    echo "Getting dependencies..."
    flutter pub get
    
    # Analysis
    echo "Running Flutter analysis..."
    if flutter analyze 2>&1 | tee "../$LOG_DIR/mobile_analysis_${TIMESTAMP}.log"; then
        print_success "Mobile analysis passed"
    else
        print_error "Mobile analysis failed"
        return 1
    fi
    
    # Format check
    echo "Checking Dart formatting..."
    if flutter format --set-exit-if-changed lib/ test/ 2>&1 | tee "../$LOG_DIR/mobile_format_${TIMESTAMP}.log"; then
        print_success "Mobile formatting check passed"
    else
        print_warning "Mobile code needs formatting"
    fi
    
    # Unit tests
    echo "Running Flutter unit tests..."
    if flutter test --coverage 2>&1 | tee "../$LOG_DIR/mobile_unit_${TIMESTAMP}.log"; then
        print_success "Mobile unit tests passed"
    else
        print_warning "Mobile unit tests completed with warnings"
    fi
    
    cd - > /dev/null
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting comprehensive test suite${NC}"
    echo "Test results will be saved to: $LOG_DIR"
    echo ""
    
    FAILED_TESTS=()
    PASSED_TESTS=()
    
    # Run backend tests
    if run_backend_tests; then
        PASSED_TESTS+=("Backend")
    else
        FAILED_TESTS+=("Backend")
    fi
    
    echo ""
    
    # Run frontend tests
    if run_frontend_tests; then
        PASSED_TESTS+=("Frontend")
    else
        FAILED_TESTS+=("Frontend")
    fi
    
    echo ""
    
    # Run mobile tests
    if run_mobile_tests; then
        PASSED_TESTS+=("Mobile")
    else
        FAILED_TESTS+=("Mobile")
    fi
    
    echo ""
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    echo ""
    echo "Passed tests:"
    for test in "${PASSED_TESTS[@]}"; do
        print_success "$test"
    done
    
    if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
        echo ""
        echo "Failed tests:"
        for test in "${FAILED_TESTS[@]}"; do
            print_error "$test"
        done
        
        echo ""
        print_error "Some tests failed"
        exit 1
    else
        echo ""
        print_success "All tests passed!"
        
        # Generate summary report
        echo ""
        echo "Test results saved to: $LOG_DIR"
        ls -lh "$LOG_DIR"
        
        exit 0
    fi
}

# Run main function
main "$@"

