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

# Define Go import paths for module mapping
$goCommonPkg = "exam-bank-system/apps/backend/pkg/proto/common"
$goV1Pkg     = "exam-bank-system/apps/backend/pkg/proto/v1"

# Generate Go code for common proto files FIRST (they are dependencies)
Write-Host "`n📦 Generating common proto files..." -ForegroundColor Yellow

$commonProtoFiles = Get-ChildItem -Path (Join-Path $PROTO_DIR "common") -Filter "*.proto"
$successCount = 0
$failCount = 0

foreach ($protoFile in $commonProtoFiles) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor White

    try {
        & protoc `
            -I "$PROTO_DIR" `
            --go_out="$BACKEND_OUT" `
            --go_opt=paths=source_relative `
            --go_opt="Mcommon/common.proto=$goCommonPkg" `
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

# Generate Go code for v1 proto files
Write-Host "`n📦 Generating v1 proto files..." -ForegroundColor Yellow

$v1ProtoFiles = Get-ChildItem -Path (Join-Path $PROTO_DIR "v1") -Filter "*.proto"

# Build list of v1 filenames for mapping
$v1FileNames = @($v1ProtoFiles | ForEach-Object { $_.Name })

foreach ($protoFile in $v1ProtoFiles) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor White

    try {
        # Start with base options
        $goOpts = @("paths=source_relative", "Mcommon/common.proto=$goCommonPkg")
        $goGrpcOpts = @("paths=source_relative", "Mcommon/common.proto=$goCommonPkg")
        $gwOpts = @("paths=source_relative", "Mcommon/common.proto=$goCommonPkg")
        
        # Add mappings for all v1 files
        foreach ($v1File in $v1FileNames) {
            $goOpts += "Mv1/$v1File=$goV1Pkg"
            $goGrpcOpts += "Mv1/$v1File=$goV1Pkg"
            $gwOpts += "Mv1/$v1File=$goV1Pkg"
        }
        
        # Build command with all options
        $goOptArgs = $goOpts | ForEach-Object { "--go_opt=$_" }
        $goGrpcOptArgs = $goGrpcOpts | ForEach-Object { "--go-grpc_opt=$_" }
        $gwOptArgs = $gwOpts | ForEach-Object { "--grpc-gateway_opt=$_" }
        
        & protoc `
            -I "$PROTO_DIR" `
            --go_out="$BACKEND_OUT" `
            --go-grpc_out="$BACKEND_OUT" `
            --grpc-gateway_out="$BACKEND_OUT" `
            $goOptArgs `
            $goGrpcOptArgs `
            $gwOptArgs `
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
Write-Host "Total .pb.go files: $($pbGoFiles.Count)" -ForegroundColor Green

if ($failCount -gt 0) {
    Write-Host "`n⚠️ $failCount proto files failed to generate" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ All proto files generated successfully!" -ForegroundColor Green
    exit 0
}

