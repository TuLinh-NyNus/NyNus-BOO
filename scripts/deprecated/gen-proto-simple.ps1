$ErrorActionPreference = "Stop"

Write-Host "Generating protobuf files for frontend..." -ForegroundColor Cyan

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

# Create output directory
if (-not (Test-Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

# Create subdirectories
New-Item -ItemType Directory -Path (Join-Path $OUT_DIR "common") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OUT_DIR "v1") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OUT_DIR "google\api") -Force | Out-Null

# Check for protoc
$protocPath = Get-Command protoc -ErrorAction SilentlyContinue
if (-not $protocPath) {
    Write-Host "Please install protoc first" -ForegroundColor Red
    Write-Host "Download from: https://github.com/protocolbuffers/protobuf/releases" -ForegroundColor Yellow
    exit 1
}

# Download grpc-web plugin if needed
$grpcWebPlugin = Join-Path $ROOT_DIR "tools\protoc-gen-grpc-web.exe"
if (-not (Test-Path $grpcWebPlugin)) {
    $toolsDir = Join-Path $ROOT_DIR "tools"
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    }
    
    Write-Host "Downloading protoc-gen-grpc-web..." -ForegroundColor Yellow
    $grpcWebVersion = "1.5.0"
    $grpcWebUrl = "https://github.com/grpc/grpc-web/releases/download/$grpcWebVersion/protoc-gen-grpc-web-$grpcWebVersion-windows-x86_64.exe"
    Invoke-WebRequest -Uri $grpcWebUrl -OutFile $grpcWebPlugin -UseBasicParsing
    Write-Host "protoc-gen-grpc-web downloaded" -ForegroundColor Green
}

# Install ts-protoc-gen if needed
Set-Location $FRONTEND_DIR
if (-not (Test-Path "node_modules\ts-protoc-gen")) {
    Write-Host "Installing ts-protoc-gen..." -ForegroundColor Yellow
    pnpm add -D ts-protoc-gen
}

# Get all proto files
$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse
$protoFileList = $protoFiles | ForEach-Object { $_.FullName }

Write-Host "Found $($protoFiles.Count) proto files" -ForegroundColor Cyan

# Generate JavaScript files
Write-Host "Generating JavaScript files..." -ForegroundColor Yellow
$jsCommand = "protoc --proto_path=$PROTO_DIR --js_out=import_style=commonjs,binary:$OUT_DIR $($protoFileList -join ' ')"
Invoke-Expression $jsCommand

# Generate TypeScript definitions
Write-Host "Generating TypeScript definitions..." -ForegroundColor Yellow
$tsPlugin = "$FRONTEND_DIR\node_modules\.bin\protoc-gen-ts.cmd"
if (Test-Path $tsPlugin) {
    $tsCommand = "protoc --proto_path=$PROTO_DIR --plugin=protoc-gen-ts=$tsPlugin --ts_out=$OUT_DIR $($protoFileList -join ' ')"
    Invoke-Expression $tsCommand
}

# Generate gRPC-Web service files
Write-Host "Generating gRPC-Web service files..." -ForegroundColor Yellow
$grpcCommand = "protoc --proto_path=$PROTO_DIR --plugin=protoc-gen-grpc-web=$grpcWebPlugin --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR $($protoFileList -join ' ')"
Invoke-Expression $grpcCommand

Write-Host "Generation complete!" -ForegroundColor Green
Write-Host "Files generated in: $OUT_DIR" -ForegroundColor Cyan

Set-Location $ROOT_DIR