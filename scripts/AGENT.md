# Scripts & Tools Agent Guide
*Hướng dẫn chi tiết cho AI agents sử dụng scripts và tools*

## 📋 Tổng quan Scripts & Tools

**NyNus Scripts & Tools** bao gồm các automation scripts, development tools, và utilities để hỗ trợ development workflow.

### Categories
- **Development Scripts** - Protocol buffer generation, gRPC-Web setup
- **Database Scripts** - Database setup và management
- **Setup Scripts** - Environment setup và installation
- **Testing Scripts** - Test automation
- **Utility Scripts** - General purpose utilities
- **Build Tools** - Custom build và deployment tools

## 🏗️ Scripts Structure

```
scripts/
├── development/                 # Development workflow scripts
│   ├── gen-proto-web.ps1       # Generate TypeScript from proto
│   ├── gen-admin-proto.ps1     # Generate admin-specific proto
│   └── run-grpcwebproxy.ps1    # Run gRPC-Web proxy
├── database/                   # Database management scripts
│   ├── setup-db.sh            # Database setup
│   ├── setup-simple-db.sh     # Simple database setup
│   └── gen-db.sh              # Database generation
├── setup/                      # Environment setup scripts
│   ├── install-protoc.ps1     # Install Protocol Buffers compiler
│   └── setup-grpc-web.ps1     # Setup gRPC-Web tools
├── testing/                    # Testing automation
│   ├── test-apis.sh           # API testing
│   └── test.sh                # General testing
├── utilities/                  # General utilities
│   ├── clean.sh               # Cleanup script
│   ├── status.sh              # Status checking
│   └── batch-import.sh        # Batch import utilities
└── deprecated/                 # Legacy scripts (for reference)
    ├── build.sh               # Old build script
    ├── dev.sh                 # Old development script
    └── *.ps1                  # Various deprecated PowerShell scripts

tools/
├── protoc/                     # Protocol Buffers compiler
│   ├── include/               # Proto include files
│   └── readme.txt             # Installation instructions
├── protoc-gen-grpc-web.exe    # gRPC-Web code generator
├── image/                     # Image processing tools
│   ├── app.py                 # Image processing application
│   ├── processor.py           # Image processor
│   └── requirements.txt       # Python dependencies
├── parsing-question/          # Question parsing tools
│   ├── streamlit_app.py       # Streamlit question parser
│   ├── src/                   # Parser source code
│   └── requirements.txt       # Python dependencies
└── docker/                    # Docker utilities
    └── docker-compose.yml     # Docker composition
```

## 🚀 Development Scripts

### Protocol Buffer Generation (gen-proto-web.ps1)
```powershell
#!/usr/bin/env pwsh
# Generate TypeScript/JavaScript code from proto files for gRPC-Web

param(
    [switch]$Clean = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"
$PROTOC_PATH = Join-Path $ROOT_DIR "tools\protoc\bin\protoc.exe"
$GRPC_WEB_PLUGIN = Join-Path $ROOT_DIR "tools\protoc-gen-grpc-web.exe"

function Write-Status($Message, $Color = "Cyan") {
    Write-Host "🔧 $Message" -ForegroundColor $Color
}

function Write-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error($Message) {
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Clean output directory if requested
if ($Clean) {
    Write-Status "Cleaning output directory..."
    if (Test-Path $OUT_DIR) {
        Remove-Item -Recurse -Force $OUT_DIR
    }
}

# Create output directory
Write-Status "Creating output directory..."
New-Item -ItemType Directory -Force -Path $OUT_DIR | Out-Null

# Generate TypeScript code
Write-Status "Generating TypeScript code from proto files..."

$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse
foreach ($protoFile in $protoFiles) {
    $relativePath = $protoFile.FullName.Substring($PROTO_DIR.Length + 1)
    Write-Status "Processing: $relativePath"
    
    # Generate TypeScript definitions
    & $PROTOC_PATH `
        --plugin=protoc-gen-grpc-web=$GRPC_WEB_PLUGIN `
        --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR `
        --proto_path=$PROTO_DIR `
        $protoFile.FullName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to generate TypeScript code for $relativePath"
        exit 1
    }
}

# Generate index file
Write-Status "Generating index file..."
$indexContent = @"
// Auto-generated index file
// Generated at: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@

$generatedFiles = Get-ChildItem -Path $OUT_DIR -Filter "*.ts" -Recurse
foreach ($file in $generatedFiles) {
    $relativePath = $file.FullName.Substring($OUT_DIR.Length + 1).Replace('\', '/')
    $exportName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $indexContent += "export * from './$($relativePath.Replace('.ts', ''))'`n"
}

$indexPath = Join-Path $OUT_DIR "index.ts"
$indexContent | Out-File -FilePath $indexPath -Encoding UTF8

Write-Success "TypeScript code generation completed!"
Write-Host "📁 Output directory: $OUT_DIR" -ForegroundColor Yellow
Write-Host "📄 Generated files: $($generatedFiles.Count)" -ForegroundColor Yellow
```

### Admin Proto Generation (gen-admin-proto.ps1)
```powershell
#!/usr/bin/env pwsh
# Generate admin-specific proto files

param(
    [string]$Service = "all",
    [switch]$Watch = $false
)

$services = @("user", "question", "admin", "profile", "contact", "newsletter")

function Generate-AdminProto($serviceName) {
    Write-Host "🔧 Generating admin proto for $serviceName..." -ForegroundColor Cyan
    
    $protoFile = "packages/proto/v1/$serviceName.proto"
    if (-not (Test-Path $protoFile)) {
        Write-Host "❌ Proto file not found: $protoFile" -ForegroundColor Red
        return $false
    }
    
    # Generate admin-specific TypeScript code
    $adminOutDir = "apps/frontend/src/generated/admin"
    New-Item -ItemType Directory -Force -Path $adminOutDir | Out-Null
    
    & tools/protoc/bin/protoc.exe `
        --plugin=protoc-gen-grpc-web=tools/protoc-gen-grpc-web.exe `
        --grpc-web_out=import_style=typescript,mode=grpcwebtext:$adminOutDir `
        --proto_path=packages/proto `
        $protoFile
    
    return $LASTEXITCODE -eq 0
}

if ($Service -eq "all") {
    foreach ($svc in $services) {
        if (-not (Generate-AdminProto $svc)) {
            exit 1
        }
    }
} else {
    if (-not (Generate-AdminProto $Service)) {
        exit 1
    }
}

if ($Watch) {
    Write-Host "👀 Watching for proto file changes..." -ForegroundColor Yellow
    # Implementation for file watching would go here
}

Write-Host "✅ Admin proto generation completed!" -ForegroundColor Green
```

## 🗄️ Database Scripts

### Database Setup (setup-db.sh)
```bash
#!/bin/bash
# Database setup script for NyNus system

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-exam_bank_db}
DB_USER=${DB_USER:-exam_bank_user}
DB_PASSWORD=${DB_PASSWORD:-exam_bank_password}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if PostgreSQL is running
check_postgres() {
    log_info "Checking PostgreSQL connection..."
    
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
        log_error "PostgreSQL is not running or not accessible"
        log_info "Please start PostgreSQL with: docker-compose up -d postgres"
        exit 1
    fi
    
    log_success "PostgreSQL is running"
}

# Create database if not exists
create_database() {
    log_info "Creating database if not exists..."
    
    # Check if database exists
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_warning "Database $DB_NAME already exists"
    else
        createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        log_success "Database $DB_NAME created"
    fi
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    
    cd "$(dirname "$0")/../.."
    
    # Check if migrate tool is available
    if ! command -v migrate &> /dev/null; then
        log_error "migrate tool not found. Please install golang-migrate"
        log_info "Install with: go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest"
        exit 1
    fi
    
    # Run migrations
    migrate -path packages/database/migrations \
            -database "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" \
            up
    
    log_success "Migrations completed"
}

# Seed default data
seed_data() {
    log_info "Seeding default data..."
    
    # Run seeder through Go application
    cd apps/backend
    go run cmd/main.go --seed-only
    
    log_success "Default data seeded"
}

# Main execution
main() {
    log_info "Starting database setup for NyNus system..."
    
    check_postgres
    create_database
    run_migrations
    
    # Ask if user wants to seed data
    read -p "Do you want to seed default data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        seed_data
    fi
    
    log_success "Database setup completed!"
    log_info "Database URL: postgres://$DB_USER:***@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Run main function
main "$@"
```

## 🔧 Setup Scripts

### Protocol Buffers Installation (install-protoc.ps1)
```powershell
#!/usr/bin/env pwsh
# Install Protocol Buffers compiler and tools

param(
    [string]$Version = "21.12",
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

$TOOLS_DIR = Join-Path $PSScriptRoot "..\tools"
$PROTOC_DIR = Join-Path $TOOLS_DIR "protoc"
$PROTOC_EXE = Join-Path $PROTOC_DIR "bin\protoc.exe"

function Write-Status($Message) {
    Write-Host "🔧 $Message" -ForegroundColor Cyan
}

function Write-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error($Message) {
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if already installed
if ((Test-Path $PROTOC_EXE) -and -not $Force) {
    $currentVersion = & $PROTOC_EXE --version 2>$null
    Write-Success "Protocol Buffers compiler already installed: $currentVersion"
    Write-Host "Use -Force to reinstall" -ForegroundColor Yellow
    exit 0
}

Write-Status "Installing Protocol Buffers compiler v$Version..."

# Create tools directory
New-Item -ItemType Directory -Force -Path $TOOLS_DIR | Out-Null

# Download protoc
$downloadUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$Version/protoc-$Version-win64.zip"
$zipPath = Join-Path $TOOLS_DIR "protoc-$Version-win64.zip"

Write-Status "Downloading from $downloadUrl..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
} catch {
    Write-Error "Failed to download protoc: $_"
    exit 1
}

# Extract
Write-Status "Extracting protoc..."
if (Test-Path $PROTOC_DIR) {
    Remove-Item -Recurse -Force $PROTOC_DIR
}

try {
    Expand-Archive -Path $zipPath -DestinationPath $PROTOC_DIR -Force
} catch {
    Write-Error "Failed to extract protoc: $_"
    exit 1
}

# Cleanup
Remove-Item $zipPath

# Verify installation
if (Test-Path $PROTOC_EXE) {
    $version = & $PROTOC_EXE --version
    Write-Success "Protocol Buffers compiler installed successfully: $version"
} else {
    Write-Error "Installation failed - protoc.exe not found"
    exit 1
}

# Install Go plugins
Write-Status "Installing Go plugins..."
$env:PATH += ";$(Join-Path $PROTOC_DIR "bin")"

$plugins = @(
    "google.golang.org/protobuf/cmd/protoc-gen-go@latest",
    "google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest",
    "github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest",
    "github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest"
)

foreach ($plugin in $plugins) {
    Write-Status "Installing $plugin..."
    go install $plugin
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install $plugin"
        exit 1
    }
}

Write-Success "All Protocol Buffers tools installed successfully!"
Write-Host "📁 Installation directory: $PROTOC_DIR" -ForegroundColor Yellow
Write-Host "🔧 Add to PATH: $(Join-Path $PROTOC_DIR "bin")" -ForegroundColor Yellow
```

## 🧪 Testing Scripts

### API Testing (test-apis.sh)
```bash
#!/bin/bash
# API testing script for NyNus gRPC services

set -e

# Configuration
GRPC_HOST=${GRPC_HOST:-localhost:50051}
HTTP_HOST=${HTTP_HOST:-localhost:8080}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}🧪 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test HTTP health endpoint
test_http_health() {
    log_info "Testing HTTP health endpoint..."
    
    if curl -f -s "$HTTP_HOST/health" > /dev/null; then
        log_success "HTTP health endpoint is working"
        return 0
    else
        log_error "HTTP health endpoint failed"
        return 1
    fi
}

# Test gRPC health (if grpcurl is available)
test_grpc_health() {
    log_info "Testing gRPC health..."
    
    if command -v grpcurl &> /dev/null; then
        if grpcurl -plaintext $GRPC_HOST grpc.health.v1.Health/Check > /dev/null 2>&1; then
            log_success "gRPC health check passed"
            return 0
        else
            log_error "gRPC health check failed"
            return 1
        fi
    else
        log_info "grpcurl not available, skipping gRPC health check"
        return 0
    fi
}

# Test user service endpoints
test_user_service() {
    log_info "Testing User Service endpoints..."
    
    # Test registration endpoint
    local register_response=$(curl -s -X POST "$HTTP_HOST/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "testpassword123",
            "fullName": "Test User"
        }')
    
    if echo "$register_response" | grep -q "success"; then
        log_success "User registration endpoint working"
    else
        log_error "User registration endpoint failed"
        echo "Response: $register_response"
    fi
}

# Test question service endpoints
test_question_service() {
    log_info "Testing Question Service endpoints..."
    
    # Test question listing (should work without auth for public questions)
    local questions_response=$(curl -s "$HTTP_HOST/v1/questions?page=1&pageSize=5")
    
    if echo "$questions_response" | grep -q "questions\|success"; then
        log_success "Question listing endpoint working"
    else
        log_error "Question listing endpoint failed"
        echo "Response: $questions_response"
    fi
}

# Main test execution
main() {
    log_info "Starting API tests for NyNus system..."
    
    local failed_tests=0
    
    # Run tests
    test_http_health || ((failed_tests++))
    test_grpc_health || ((failed_tests++))
    test_user_service || ((failed_tests++))
    test_question_service || ((failed_tests++))
    
    # Summary
    if [ $failed_tests -eq 0 ]; then
        log_success "All API tests passed!"
    else
        log_error "$failed_tests test(s) failed"
        exit 1
    fi
}

# Check if services are running
if ! curl -f -s "$HTTP_HOST/health" > /dev/null; then
    log_error "Backend services are not running"
    log_info "Please start services with: make dev or docker-compose up"
    exit 1
fi

main "$@"
```

## 🛠️ Utility Scripts

### Status Checker (status.sh)
```bash
#!/bin/bash
# System status checker for NyNus

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  NyNus System Status Check${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

check_service() {
    local service_name=$1
    local check_command=$2
    local port=$3
    
    printf "%-20s: " "$service_name"
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
        if [ -n "$port" ]; then
            echo "                     Port: $port"
        fi
    else
        echo -e "${RED}❌ Not running${NC}"
        if [ -n "$port" ]; then
            echo "                     Expected port: $port"
        fi
    fi
}

check_file() {
    local file_name=$1
    local file_path=$2
    
    printf "%-20s: " "$file_name"
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅ Found${NC}"
        echo "                     Path: $file_path"
    else
        echo -e "${RED}❌ Missing${NC}"
        echo "                     Expected: $file_path"
    fi
}

main() {
    print_header
    
    # Check services
    echo -e "${YELLOW}Services:${NC}"
    check_service "PostgreSQL" "pg_isready -h localhost -p 5432" "5432"
    check_service "Backend (gRPC)" "nc -z localhost 50051" "50051"
    check_service "Backend (HTTP)" "curl -f -s localhost:8080/health" "8080"
    check_service "Frontend" "curl -f -s localhost:3000" "3000"
    echo
    
    # Check important files
    echo -e "${YELLOW}Important Files:${NC}"
    check_file "Backend Binary" "bin/exam-bank-backend"
    check_file "Proto Generated" "packages/proto/gen/go"
    check_file "Frontend Generated" "apps/frontend/src/generated"
    check_file "Database Migrations" "packages/database/migrations"
    echo
    
    # Check tools
    echo -e "${YELLOW}Development Tools:${NC}"
    check_file "protoc" "tools/protoc/bin/protoc.exe"
    check_file "grpc-web plugin" "tools/protoc-gen-grpc-web.exe"
    echo
    
    # System info
    echo -e "${YELLOW}System Information:${NC}"
    echo "Go version:      $(go version 2>/dev/null || echo 'Not installed')"
    echo "Node version:    $(node --version 2>/dev/null || echo 'Not installed')"
    echo "pnpm version:    $(pnpm --version 2>/dev/null || echo 'Not installed')"
    echo "Docker version:  $(docker --version 2>/dev/null || echo 'Not installed')"
    echo
}

main "$@"
```

---

**🚀 Quick Script Usage:**
1. **Development**: `./scripts/development/gen-proto-web.ps1`
2. **Database**: `./scripts/database/setup-db.sh`
3. **Testing**: `./scripts/testing/test-apis.sh`
4. **Status**: `./scripts/utilities/status.sh`

**🔧 Script Best Practices:**
1. Always include error handling
2. Provide clear status messages
3. Use consistent color coding
4. Include help/usage information
5. Make scripts idempotent
6. Add proper logging
