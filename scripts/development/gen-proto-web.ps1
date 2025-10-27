#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Generate gRPC-Web code for frontend using local protoc

.DESCRIPTION
    This script generates TypeScript/JavaScript code for the frontend
    using local protoc and protoc-gen-grpc-web.exe (compatible with google-protobuf 3.21.2)

.EXAMPLE
    .\gen-proto-web.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🔄 Generating gRPC-Web code for frontend..." -ForegroundColor Cyan
Write-Host ""

# Paths
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$protoDir = Join-Path $projectRoot "packages\proto"
$outputDir = Join-Path $projectRoot "apps\frontend\src\generated"
$protocGenGrpcWeb = Join-Path $projectRoot "tools\protoc-gen-grpc-web.exe"

# Check if protoc-gen-grpc-web exists
if (-not (Test-Path $protocGenGrpcWeb)) {
    Write-Host "❌ protoc-gen-grpc-web.exe not found at: $protocGenGrpcWeb" -ForegroundColor Red
    exit 1
}

# Clean old generated files
if (Test-Path $outputDir) {
    Write-Host "🗑️  Cleaning old generated files..." -ForegroundColor Yellow
    Remove-Item -Path $outputDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Create output directory
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# Proto files to compile
$protoFiles = @(
    # Common
    "common/common.proto",
    # Google API
    "google/api/annotations.proto",
    "google/api/http.proto",
    # V1 Services
    "v1/user.proto",
    "v1/question.proto",
    "v1/question_filter.proto",
    "v1/exam.proto",
    "v1/library.proto",
    "v1/book.proto",
    "v1/analytics.proto",
    "v1/admin.proto",
    "v1/profile.proto",
    "v1/notification.proto",
    "v1/search.proto",
    "v1/import.proto",
    "v1/mapcode.proto",
    "v1/blog.proto",
    "v1/contact.proto",
    "v1/faq.proto",
    "v1/newsletter.proto",
    "v1/tikz.proto"
)

Write-Host "⚙️  Generating JavaScript + TypeScript definitions..." -ForegroundColor Cyan

# Generate JavaScript files with protoc
foreach ($protoFile in $protoFiles) {
    $fullPath = Join-Path $protoDir $protoFile
    if (Test-Path $fullPath) {
        Write-Host "   Processing: $protoFile" -ForegroundColor Gray
        
        # Generate JS files
        & protoc `
            --proto_path="$protoDir" `
            --js_out=import_style=commonjs,binary:"$outputDir" `
            "$fullPath"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to generate JS for $protoFile" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "⚙️  Generating gRPC-Web TypeScript clients..." -ForegroundColor Cyan

# Generate gRPC-Web client stubs
foreach ($protoFile in $protoFiles) {
    $fullPath = Join-Path $protoDir $protoFile
    if (Test-Path $fullPath) {
        Write-Host "   Processing: $protoFile" -ForegroundColor Gray
        
        # Generate gRPC-Web TypeScript client
        & protoc `
            --proto_path="$protoDir" `
            --plugin=protoc-gen-grpc-web="$protocGenGrpcWeb" `
            --grpc-web_out=import_style=typescript,mode=grpcwebtext:"$outputDir" `
            "$fullPath"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to generate gRPC-Web client for $protoFile" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "✅ gRPC-Web code generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Generated files location:" -ForegroundColor Cyan
Write-Host "   $outputDir" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. cd apps/frontend" -ForegroundColor White
Write-Host "   2. Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host "   3. pnpm dev:webpack" -ForegroundColor White
Write-Host ""

