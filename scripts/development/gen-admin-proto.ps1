# Simple script to generate gRPC-Web code for admin.proto
$ErrorActionPreference = "Stop"

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

Write-Host "Generating gRPC-Web code for admin.proto..." -ForegroundColor Cyan

# Create output directory if it doesn't exist
if (-not (Test-Path $OUT_DIR)) {
    Write-Host "Creating output directory: $OUT_DIR" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

# Create v1 subdirectory
$v1Dir = Join-Path $OUT_DIR "v1"
if (-not (Test-Path $v1Dir)) {
    New-Item -ItemType Directory -Path $v1Dir -Force | Out-Null
}

# Install protoc if not available
$protocPath = Get-Command protoc -ErrorAction SilentlyContinue
if (-not $protocPath) {
    Write-Host "Installing protoc..." -ForegroundColor Yellow
    
    $protocVersion = "28.3"
    $protocZip = "protoc-$protocVersion-win64.zip"
    $protocUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$protocVersion/$protocZip"
    $tempDir = Join-Path $env:TEMP "protoc-install"
    $zipPath = Join-Path $tempDir $protocZip
    
    if (-not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }
    
    Write-Host "Downloading protoc..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $protocUrl -OutFile $zipPath
    
    Write-Host "Extracting protoc..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    
    $env:PATH = "$tempDir\bin;$env:PATH"
    Write-Host "protoc installed" -ForegroundColor Green
}

# Install protoc-gen-grpc-web if not available
$grpcWebPlugin = Join-Path $ROOT_DIR "tools\protoc-gen-grpc-web.exe"
if (-not (Test-Path $grpcWebPlugin)) {
    Write-Host "Installing protoc-gen-grpc-web..." -ForegroundColor Yellow
    
    $toolsDir = Join-Path $ROOT_DIR "tools"
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    }
    
    $grpcWebVersion = "1.5.0"
    $grpcWebExe = "protoc-gen-grpc-web-$grpcWebVersion-windows-x86_64.exe"
    $grpcWebUrl = "https://github.com/grpc/grpc-web/releases/download/$grpcWebVersion/$grpcWebExe"
    
    Write-Host "Downloading protoc-gen-grpc-web..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $grpcWebUrl -OutFile $grpcWebPlugin
    
    Write-Host "protoc-gen-grpc-web installed" -ForegroundColor Green
}

$adminProto = Join-Path $PROTO_DIR "v1\admin.proto"

# Generate JavaScript code for admin.proto
Write-Host "Generating JavaScript code for admin.proto..." -ForegroundColor White
& protoc --proto_path="$PROTO_DIR" --js_out="import_style=commonjs,binary:$OUT_DIR" "$adminProto"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate JavaScript for admin.proto" -ForegroundColor Red
    exit 1
}

# Generate gRPC-Web code for admin.proto
Write-Host "Generating gRPC-Web code for admin.proto..." -ForegroundColor White
& protoc --proto_path="$PROTO_DIR" --plugin="protoc-gen-grpc-web=$grpcWebPlugin" --grpc-web_out="import_style=typescript,mode=grpcwebtext:$OUT_DIR" "$adminProto"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate gRPC-Web code for admin.proto" -ForegroundColor Red
    exit 1
}

Write-Host "Code generation complete!" -ForegroundColor Green
Write-Host "Generated files in: $OUT_DIR" -ForegroundColor Cyan

# List generated files
Get-ChildItem -Path $OUT_DIR -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($OUT_DIR.Length + 1)
    Write-Host "  - $relativePath" -ForegroundColor Gray
}