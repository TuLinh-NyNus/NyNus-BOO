# Generate gRPC-Web Code for Frontend
# ====================================

Write-Host "🔧 Generating gRPC-Web Code for Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if protoc is installed
if (!(Get-Command protoc -ErrorAction SilentlyContinue)) {
    Write-Host "❌ protoc not found. Please install Protocol Buffers compiler." -ForegroundColor Red
    Write-Host "Download from: https://github.com/protocolbuffers/protobuf/releases" -ForegroundColor Yellow
    exit 1
}

# Check if protoc-gen-grpc-web exists
$grpcWebPlugin = "../../tools/bin/protoc-gen-grpc-web.exe"
if (!(Test-Path $grpcWebPlugin)) {
    Write-Host "❌ protoc-gen-grpc-web not found." -ForegroundColor Red
    Write-Host "Run: ./tools/scripts/setup-grpc-web.ps1" -ForegroundColor Yellow
    exit 1
}

# Add tools/bin to PATH
$toolsBin = (Resolve-Path "../../tools/bin").Path
$env:PATH = "$toolsBin;$env:PATH"

# Create output directories
Write-Host "`n📁 Creating output directories..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "../../apps/frontend/src/generated" | Out-Null
New-Item -ItemType Directory -Force -Path "../../apps/backend/pkg/proto/common" | Out-Null
New-Item -ItemType Directory -Force -Path "../../apps/backend/pkg/proto/v1" | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green

# Define proto files
$protoFiles = @(
    "common/common.proto",
    "v1/user.proto",
    "v1/profile.proto",
    "v1/admin.proto",
    "v1/question.proto",
    "v1/question_filter.proto",
    "v1/exam.proto"
)

# Change to project root
Set-Location "../.."

# Generate Go code
Write-Host "`n📦 Generating Go gRPC code..." -ForegroundColor Blue
foreach ($proto in $protoFiles) {
    Write-Host "  Processing: $proto" -ForegroundColor Gray
    protoc `
        --proto_path=packages/proto `
        --go_out=apps/backend/pkg/proto `
        --go_opt=paths=source_relative `
        --go-grpc_out=apps/backend/pkg/proto `
        --go-grpc_opt=paths=source_relative `
        "packages/proto/$proto"
}
Write-Host "✅ Go code generated" -ForegroundColor Green

# Generate TypeScript/JavaScript gRPC-Web code
Write-Host "`n📦 Generating TypeScript gRPC-Web code..." -ForegroundColor Blue
foreach ($proto in $protoFiles) {
    Write-Host "  Processing: $proto" -ForegroundColor Gray
    
    # Generate JS protobuf messages
    protoc `
        --proto_path=packages/proto `
        --js_out=import_style=commonjs:apps/frontend/src/generated `
        "packages/proto/$proto"
    
    # Generate gRPC-Web client
    protoc `
        --proto_path=packages/proto `
        --plugin=protoc-gen-grpc-web=tools/bin/protoc-gen-grpc-web.exe `
        --grpc-web_out=import_style=commonjs,mode=grpcwebtext:apps/frontend/src/generated `
        "packages/proto/$proto"
}
Write-Host "✅ TypeScript/JavaScript code generated" -ForegroundColor Green

# Generate TypeScript definitions
Write-Host "`n📝 Creating TypeScript index file..." -ForegroundColor Blue
$indexContent = @"
// Auto-generated index file for gRPC-Web
// =======================================

// Common types
export * from './common/common_pb';

// Services
export * from './v1/user_pb';
export * from './v1/user_grpc_web_pb';
export * from './v1/profile_pb';
export * from './v1/profile_grpc_web_pb';
export * from './v1/admin_pb';
export * from './v1/admin_grpc_web_pb';
export * from './v1/question_pb';
export * from './v1/question_grpc_web_pb';
export * from './v1/question_filter_pb';
export * from './v1/question_filter_grpc_web_pb';
export * from './v1/exam_pb';
export * from './v1/exam_grpc_web_pb';
"@

$indexContent | Out-File -FilePath "apps/frontend/src/generated/index.js" -Encoding UTF8
Write-Host "✅ Index file created" -ForegroundColor Green

Write-Host "`n✅ gRPC-Web code generation completed!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create gRPC-Web client wrapper in frontend/src/services/grpc/" -ForegroundColor White
Write-Host "  2. Update auth context to use gRPC services" -ForegroundColor White
Write-Host "  3. Setup Envoy proxy or grpc-gateway for HTTP/2 to HTTP/1.1 translation" -ForegroundColor White