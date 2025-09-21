#!/usr/bin/env pwsh
# Script to generate TypeScript/JavaScript code from proto files for gRPC-Web

$ErrorActionPreference = "Stop"

Write-Host "🚀 Generating TypeScript/JavaScript code from proto files..." -ForegroundColor Cyan

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

# Check if proto directory exists
if (-not (Test-Path $PROTO_DIR)) {
    Write-Host "❌ Proto directory not found: $PROTO_DIR" -ForegroundColor Red
    exit 1
}

# Clean and create output directory
if (Test-Path $OUT_DIR) {
    Write-Host "🧹 Cleaning existing output directory..." -ForegroundColor Yellow
    Remove-Item -Path $OUT_DIR -Recurse -Force
}

Write-Host "📁 Creating output directory: $OUT_DIR" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null

# Create subdirectories
$subDirs = @("common", "v1", "google\api")
foreach ($subDir in $subDirs) {
    $fullPath = Join-Path $OUT_DIR $subDir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    }
}

# Check for protoc
$protocPath = Get-Command protoc -ErrorAction SilentlyContinue
if (-not $protocPath) {
    Write-Host "📦 Installing protoc..." -ForegroundColor Yellow
    
    # Download protoc
    $protocVersion = "28.3"
    $protocZip = "protoc-$protocVersion-win64.zip"
    $protocUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$protocVersion/$protocZip"
    $tempDir = Join-Path $env:TEMP "protoc-install"
    $zipPath = Join-Path $tempDir $protocZip
    
    if (-not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }
    
    Write-Host "📥 Downloading protoc..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $protocUrl -OutFile $zipPath -UseBasicParsing
    
    Write-Host "📦 Extracting protoc..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    
    # Add to PATH for current session
    $env:PATH = "$tempDir\bin;$env:PATH"
    
    Write-Host "✅ protoc installed temporarily" -ForegroundColor Green
}

# Install protoc-gen-grpc-web
$grpcWebPlugin = Join-Path $ROOT_DIR "tools\protoc-gen-grpc-web.exe"
if (-not (Test-Path $grpcWebPlugin)) {
    Write-Host "📦 Installing protoc-gen-grpc-web..." -ForegroundColor Yellow
    
    $toolsDir = Join-Path $ROOT_DIR "tools"
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    }
    
    # Download protoc-gen-grpc-web
    $grpcWebVersion = "1.5.0"
    $grpcWebExe = "protoc-gen-grpc-web-$grpcWebVersion-windows-x86_64.exe"
    $grpcWebUrl = "https://github.com/grpc/grpc-web/releases/download/$grpcWebVersion/$grpcWebExe"
    
    Write-Host "📥 Downloading protoc-gen-grpc-web..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $grpcWebUrl -OutFile $grpcWebPlugin -UseBasicParsing
    
    Write-Host "✅ protoc-gen-grpc-web installed" -ForegroundColor Green
}

# Check if ts-protoc-gen is installed
Push-Location $FRONTEND_DIR
$tsProtocGenInstalled = Test-Path "node_modules\ts-protoc-gen"
if (-not $tsProtocGenInstalled) {
    Write-Host "📦 Installing ts-protoc-gen..." -ForegroundColor Yellow
    pnpm add -D ts-protoc-gen
    Write-Host "✅ ts-protoc-gen installed" -ForegroundColor Green
}
Pop-Location

# Find all proto files
Write-Host "🔍 Finding proto files..." -ForegroundColor Cyan
$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse

if ($protoFiles.Count -eq 0) {
    Write-Host "⚠️ No proto files found in $PROTO_DIR" -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 Found $($protoFiles.Count) proto files" -ForegroundColor Cyan

# Generate JavaScript and TypeScript definitions for all proto files at once
Write-Host "⚙️ Generating JavaScript files..." -ForegroundColor White

# Create proto file list
$protoFileList = @()
foreach ($protoFile in $protoFiles) {
    $protoFileList += $protoFile.FullName
}

# Generate JS files
$jsArgs = @(
    "--proto_path=$PROTO_DIR",
    "--js_out=import_style=commonjs,binary:$OUT_DIR"
) + $protoFileList

& protoc @jsArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate JavaScript files" -ForegroundColor Red
    exit 1
}

Write-Host "✅ JavaScript files generated" -ForegroundColor Green

# Generate TypeScript definitions
Write-Host "⚙️ Generating TypeScript definitions..." -ForegroundColor White

$tsPlugin = "$FRONTEND_DIR\node_modules\.bin\protoc-gen-ts.cmd"
if (Test-Path $tsPlugin) {
    $tsArgs = @(
        "--proto_path=$PROTO_DIR",
        "--plugin=protoc-gen-ts=$tsPlugin",
        "--ts_out=$OUT_DIR"
    ) + $protoFileList

    & protoc @tsArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Failed to generate TypeScript definitions (non-critical)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ TypeScript definitions generated" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ TypeScript generator not found, skipping..." -ForegroundColor Yellow
}

# Generate gRPC-Web service files
Write-Host "⚙️ Generating gRPC-Web service files..." -ForegroundColor White

$grpcWebArgs = @(
    "--proto_path=$PROTO_DIR",
    "--plugin=protoc-gen-grpc-web=$grpcWebPlugin",
    "--grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR"
) + $protoFileList

& protoc @grpcWebArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate gRPC-Web service files" -ForegroundColor Red
    exit 1
}

Write-Host "✅ gRPC-Web service files generated" -ForegroundColor Green

# Create index.ts file
Write-Host "📝 Creating index file..." -ForegroundColor Cyan

$indexContent = @"
// Auto-generated index file
// Re-export all generated proto files

// Common types
export * from './common/common_pb';

// V1 Services
export * from './v1/user_pb';
export * from './v1/admin_pb';
export * from './v1/exam_pb';
export * from './v1/question_pb';
export * from './v1/question_filter_pb';
export * from './v1/profile_pb';
export * from './v1/contact_pb';
export * from './v1/newsletter_pb';

// Service Clients
export { UserServiceClient } from './v1/UserServiceClientPb';
export { AdminServiceClient } from './v1/AdminServiceClientPb';
export { ExamServiceClient } from './v1/ExamServiceClientPb';
export { QuestionServiceClient } from './v1/QuestionServiceClientPb';
export { QuestionFilterServiceClient } from './v1/QuestionFilterServiceClientPb';
export { ProfileServiceClient } from './v1/ProfileServiceClientPb';
export { ContactServiceClient } from './v1/ContactServiceClientPb';
export { NewsletterServiceClient } from './v1/NewsletterServiceClientPb';
"@

$indexPath = Join-Path $OUT_DIR "index.ts"
Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8

Write-Host "✅ Code generation complete!" -ForegroundColor Green
Write-Host "📁 Generated files in: $OUT_DIR" -ForegroundColor Cyan

# Show summary
$jsFiles = @(Get-ChildItem -Path $OUT_DIR -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
$tsFiles = @(Get-ChildItem -Path $OUT_DIR -Filter "*.d.ts" -Recurse -ErrorAction SilentlyContinue).Count
$serviceFiles = @(Get-ChildItem -Path $OUT_DIR -Filter "*ClientPb.js" -Recurse -ErrorAction SilentlyContinue).Count

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  - JavaScript files: $jsFiles" -ForegroundColor White
Write-Host "  - TypeScript definitions: $tsFiles" -ForegroundColor White
Write-Host "  - Service client files: $serviceFiles" -ForegroundColor White
Write-Host ""
Write-Host "🎉 You can now import the generated code in your TypeScript files!" -ForegroundColor Green
Write-Host "Example: import { UserServiceClient } from '@/generated'" -ForegroundColor Gray