#!/usr/bin/env pwsh
# Simple script to generate protobuf files

$ErrorActionPreference = "Stop"

Write-Host "Generating protobuf files..." -ForegroundColor Green

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

# Check if proto directory exists
if (-not (Test-Path $PROTO_DIR)) {
    Write-Host "Proto directory not found: $PROTO_DIR" -ForegroundColor Red
    exit 1
}

# Create output directory
if (-not (Test-Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

# Find proto files
$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse

if ($protoFiles.Count -eq 0) {
    Write-Host "No proto files found" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($protoFiles.Count) proto files" -ForegroundColor Cyan

# Check if protoc is available
$protoc = Get-Command protoc -ErrorAction SilentlyContinue
if (-not $protoc) {
    Write-Host "protoc not found in PATH. Please install Protocol Buffers compiler." -ForegroundColor Red
    exit 1
}

# Generate for each proto file
foreach ($protoFile in $protoFiles) {
    $relativePath = $protoFile.FullName.Substring($PROTO_DIR.Length + 1)
    Write-Host "Processing: $relativePath" -ForegroundColor White
    
    # Generate JavaScript
    $jsArgs = @(
        "--proto_path=$PROTO_DIR"
        "--js_out=$OUT_DIR"
        $protoFile.FullName
    )
    
    & protoc $jsArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to generate JS for $relativePath" -ForegroundColor Red
        continue
    }
    
    Write-Host "Generated: $relativePath" -ForegroundColor Green
}

# Create index file
$indexContent = "// Generated protobuf exports`n"
$generatedFiles = Get-ChildItem -Path $OUT_DIR -Filter "*_pb.js" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $generatedFiles) {
    $relativePath = $file.FullName.Substring($OUT_DIR.Length + 1).Replace('\', '/')
    $importPath = "./" + $relativePath.Replace('.js', '')
    $indexContent += "export * from '$importPath';`n"
}

$indexPath = Join-Path $OUT_DIR "index.ts"
Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8

Write-Host "Code generation complete!" -ForegroundColor Green
Write-Host "Output directory: $OUT_DIR" -ForegroundColor Cyan

$jsFiles = (Get-ChildItem -Path $OUT_DIR -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
Write-Host "Generated $jsFiles JavaScript files" -ForegroundColor White