#!/usr/bin/env pwsh
# Complete TypeScript proto generation for all files

$ErrorActionPreference = "Stop"

$ROOT_DIR = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$OUT_DIR = Join-Path $ROOT_DIR "apps\frontend\src\generated"

Write-Host "Complete TypeScript proto generation..." -ForegroundColor Cyan

# Create output directories
New-Item -ItemType Directory -Force -Path $OUT_DIR | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OUT_DIR "v1") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OUT_DIR "common") | Out-Null

# Check if protoc-gen-grpc-web exists
$grpcWebPlugin = Join-Path $ROOT_DIR "tools\protoc-gen-grpc-web.exe"
if (-not (Test-Path $grpcWebPlugin)) {
    Write-Host "protoc-gen-grpc-web not found. Skipping TypeScript generation." -ForegroundColor Yellow
    exit 0
}

# Find all proto files
$protoFiles = @()
$protoFiles += Get-ChildItem -Path (Join-Path $PROTO_DIR "v1") -Filter "*.proto" -ErrorAction SilentlyContinue
$protoFiles += Get-ChildItem -Path (Join-Path $PROTO_DIR "common") -Filter "*.proto" -ErrorAction SilentlyContinue

if ($protoFiles.Count -eq 0) {
    Write-Host "No proto files found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($protoFiles.Count) proto files" -ForegroundColor White

# Generate for each proto file
foreach ($protoFile in $protoFiles) {
    $relativePath = $protoFile.FullName.Substring($PROTO_DIR.Length + 1)
    Write-Host "Generating code for $relativePath..." -ForegroundColor White

    # 1. Generate JavaScript message definitions (using grpc-tools protoc.js)
    Write-Host "  - Generating JavaScript..." -ForegroundColor Gray
    $protocJs = Join-Path $ROOT_DIR "apps\frontend\node_modules\grpc-tools\bin\protoc.js"
    if (Test-Path $protocJs) {
        $jsArgs = @(
            $protocJs
            "--proto_path=$PROTO_DIR"
            "--js_out=import_style=commonjs,binary:$OUT_DIR"
            "$($protoFile.FullName)"
        )
        & node $jsArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Failed to generate JavaScript" -ForegroundColor Red
            continue
        }
    } else {
        Write-Host "  ⚠️ grpc-tools not found, skipping JavaScript generation" -ForegroundColor Yellow
    }

    # 2. Generate TypeScript definitions
    Write-Host "  - Generating TypeScript definitions..." -ForegroundColor Gray
    $tsPluginPath = Join-Path $ROOT_DIR "apps\frontend\node_modules\.bin\protoc-gen-ts.cmd"
    if (Test-Path $tsPluginPath) {
        & protoc --proto_path="$PROTO_DIR" --plugin="protoc-gen-ts=$tsPluginPath" --ts_out="$OUT_DIR" "$($protoFile.FullName)"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠️ Failed to generate TypeScript definitions (non-critical)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️ protoc-gen-ts not found, skipping TypeScript definitions" -ForegroundColor Yellow
    }

    # 3. Generate gRPC-Web service clients
    Write-Host "  - Generating gRPC-Web client..." -ForegroundColor Gray
    & protoc --proto_path="$PROTO_DIR" --plugin="protoc-gen-grpc-web=$grpcWebPlugin" --grpc-web_out="import_style=typescript,mode=grpcwebtext:$OUT_DIR" "$($protoFile.FullName)"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Generated all files for $relativePath" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to generate gRPC-Web client" -ForegroundColor Red
    }
}

Write-Host "Complete generation finished!" -ForegroundColor Green
