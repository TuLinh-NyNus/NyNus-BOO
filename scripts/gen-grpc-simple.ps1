# Simple gRPC-Web code generation for frontend

$ErrorActionPreference = "Stop"

Write-Host "Generating gRPC-Web code..." -ForegroundColor Cyan

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

# Create output directories
if (-not (Test-Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

$v1Dir = Join-Path $OUT_DIR "v1"
if (-not (Test-Path $v1Dir)) {
    New-Item -ItemType Directory -Path $v1Dir -Force | Out-Null
}

# Check for tools directory
$toolsDir = Join-Path $ROOT_DIR "tools"
if (-not (Test-Path $toolsDir)) {
    Write-Host "Tools directory not found at: $toolsDir" -ForegroundColor Red
    exit 1
}

# Path to protoc-gen-grpc-web plugin
$grpcWebPlugin = Join-Path $toolsDir "protoc-gen-grpc-web.exe"
if (-not (Test-Path $grpcWebPlugin)) {
    Write-Host "protoc-gen-grpc-web.exe not found at: $grpcWebPlugin" -ForegroundColor Red
    exit 1
}

# Generate JavaScript and TypeScript using protoc directly
Write-Host "Generating JavaScript and TypeScript code..." -ForegroundColor Yellow

# Use npx to run protoc with grpc-tools
Push-Location $FRONTEND_DIR

# Install grpc-tools if not present
Write-Host "Installing grpc-tools..." -ForegroundColor Yellow
pnpm add -D grpc-tools

# Generate JavaScript code using grpc-tools
Write-Host "Generating JavaScript code..." -ForegroundColor Yellow
$protocJs = ".\node_modules\.bin\grpc_tools_node_protoc.cmd"

& $protocJs `
    --js_out=import_style=commonjs,binary:src/generated `
    --proto_path=../../proto `
    ../../proto/v1/user.proto

# Generate gRPC-Web service stubs
Write-Host "Generating gRPC-Web service stubs..." -ForegroundColor Yellow
& $protocJs `
    --plugin=protoc-gen-grpc-web=$grpcWebPlugin `
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:src/generated `
    --proto_path=../../proto `
    ../../proto/v1/user.proto

Pop-Location

Write-Host "Code generation complete!" -ForegroundColor Green
Write-Host "Generated files in: $OUT_DIR" -ForegroundColor Cyan