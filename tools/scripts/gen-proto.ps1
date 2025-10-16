#!/usr/bin/env pwsh
# Generate Go protobuf code for backend
# PowerShell equivalent of gen-proto.sh

$ErrorActionPreference = "Stop"

# Paths
$ROOT_DIR = Resolve-Path (Join-Path $PSScriptRoot "../..")
$PROTO_DIR = Join-Path $ROOT_DIR "packages/proto"
$BACKEND_OUT = Join-Path $ROOT_DIR "apps/backend/pkg/proto"

Write-Host "🔧 Generating Go protobuf code..." -ForegroundColor Cyan

# Create output directories
New-Item -ItemType Directory -Force -Path (Join-Path $BACKEND_OUT "v1") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BACKEND_OUT "common") | Out-Null

# Check if protoc is available
try {
    $protocVersion = & protoc --version 2>&1
    Write-Host "Found protoc: $protocVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ protoc not found. Please install Protocol Buffers compiler." -ForegroundColor Red
    Write-Host "Download from: https://github.com/protocolbuffers/protobuf/releases" -ForegroundColor Yellow
    exit 1
}

# Generate Go code for v1 proto files
Write-Host "`n📦 Generating v1 proto files..." -ForegroundColor Yellow

$v1ProtoFiles = Get-ChildItem -Path (Join-Path $PROTO_DIR "v1") -Filter "*.proto"
$successCount = 0
$failCount = 0

foreach ($protoFile in $v1ProtoFiles) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor White
    
    try {
        & protoc `
            -I "$PROTO_DIR" `
            --go_out="$ROOT_DIR" --go_opt=paths=source_relative `
            --go-grpc_out="$ROOT_DIR" --go-grpc_opt=paths=source_relative `
            --grpc-gateway_out="$ROOT_DIR" --grpc-gateway_opt=paths=source_relative `
            "$($protoFile.FullName)"
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
        } else {
            Write-Host "    ⚠️ Failed to generate for $($protoFile.Name)" -ForegroundColor Yellow
            $failCount++
        }
    } catch {
        Write-Host "    ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

# Generate Go code for common proto files
Write-Host "`n📦 Generating common proto files..." -ForegroundColor Yellow

$commonProtoFiles = Get-ChildItem -Path (Join-Path $PROTO_DIR "common") -Filter "*.proto"

foreach ($protoFile in $commonProtoFiles) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor White
    
    try {
        & protoc `
            -I "$PROTO_DIR" `
            --go_out="$ROOT_DIR" --go_opt=paths=source_relative `
            --go-grpc_out="$ROOT_DIR" --go-grpc_opt=paths=source_relative `
            "$($protoFile.FullName)"
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
        } else {
            Write-Host "    ⚠️ Failed to generate for $($protoFile.Name)" -ForegroundColor Yellow
            $failCount++
        }
    } catch {
        Write-Host "    ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n✅ Go protobuf code generated successfully!" -ForegroundColor Green

# Verify output
Write-Host "`n📋 Generated files:" -ForegroundColor Cyan
$pbGoFiles = Get-ChildItem -Path $BACKEND_OUT -Filter "*.pb.go" -Recurse
Write-Host "  Total .pb.go files: $($pbGoFiles.Count)" -ForegroundColor White

# Summary
Write-Host "`n📊 Generation Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Success: $successCount files" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  ⚠️ Failed: $failCount files" -ForegroundColor Yellow
}

Write-Host "`n📁 Output directory: $BACKEND_OUT" -ForegroundColor Cyan

# List some generated files
Write-Host "`n📄 Sample generated files:" -ForegroundColor Cyan
$pbGoFiles | Select-Object -First 10 | ForEach-Object {
    $relativePath = $_.FullName.Substring($BACKEND_OUT.Length + 1)
    Write-Host "  - $relativePath" -ForegroundColor Gray
}

if ($failCount -gt 0) {
    Write-Host "`n⚠️ Some files failed to generate. Check errors above." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🎉 All protobuf files generated successfully!" -ForegroundColor Green

