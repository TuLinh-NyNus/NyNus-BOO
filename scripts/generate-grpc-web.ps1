# Generate gRPC-Web TypeScript code from proto files

$ErrorActionPreference = "Stop"

Write-Host "Generating gRPC-Web TypeScript code..." -ForegroundColor Cyan

# Paths
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PROTO_DIR = Join-Path $ROOT_DIR "proto"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"
$OUT_DIR = Join-Path $FRONTEND_DIR "src\generated"

# Create output directory
if (-not (Test-Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

# Create v1 subdirectory
$v1Dir = Join-Path $OUT_DIR "v1"
if (-not (Test-Path $v1Dir)) {
    New-Item -ItemType Directory -Path $v1Dir -Force | Out-Null
}

# Check for protoc
$protoc = Get-Command protoc -ErrorAction SilentlyContinue
if (-not $protoc) {
    Write-Host "Installing protoc..." -ForegroundColor Yellow
    
    # Download and install protoc
    $protocVersion = "28.3"
    $protocZip = "protoc-$protocVersion-win64.zip"
    $protocUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$protocVersion/$protocZip"
    $tempDir = Join-Path $env:TEMP "protoc-temp"
    $zipPath = Join-Path $tempDir $protocZip
    
    if (-not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }
    
    Write-Host "Downloading protoc..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $protocUrl -OutFile $zipPath
    
    Write-Host "Extracting protoc..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    
    # Add to PATH
    $env:PATH = "$tempDir\bin;$env:PATH"
}

# Download protoc-gen-grpc-web plugin
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
}

# Install ts-protoc-gen
Write-Host "Installing ts-protoc-gen..." -ForegroundColor Yellow
Push-Location $FRONTEND_DIR
pnpm add -D ts-protoc-gen
Pop-Location

# Find proto files
$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse | Where-Object { $_.DirectoryName -like "*\v1" }

if ($protoFiles.Count -eq 0) {
    Write-Host "No proto files found in v1 directory, checking all proto files..." -ForegroundColor Yellow
    $protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse
}

Write-Host "Found $($protoFiles.Count) proto files" -ForegroundColor Cyan

# Generate code for each proto file
foreach ($proto in $protoFiles) {
    Write-Host "Processing $($proto.Name)..." -ForegroundColor White
    
    # Generate JavaScript
    & protoc `
        --proto_path=$PROTO_DIR `
        --js_out=import_style=commonjs,binary:$OUT_DIR `
        $proto.FullName
    
    # Generate TypeScript definitions
    $tsPlugin = "$FRONTEND_DIR\node_modules\.bin\protoc-gen-ts.cmd"
    if (Test-Path $tsPlugin) {
        & protoc `
            --proto_path=$PROTO_DIR `
            --plugin=protoc-gen-ts=$tsPlugin `
            --ts_out=$OUT_DIR `
            $proto.FullName
    }
    
    # Generate gRPC-Web
    & protoc `
        --proto_path=$PROTO_DIR `
        --plugin=protoc-gen-grpc-web=$grpcWebPlugin `
        --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR `
        $proto.FullName
}

Write-Host "Code generation complete!" -ForegroundColor Green
Write-Host "Generated files in: $OUT_DIR" -ForegroundColor Cyan