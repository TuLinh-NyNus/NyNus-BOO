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

# Create output directory if it doesn't exist
if (-not (Test-Path $OUT_DIR)) {
    Write-Host "📁 Creating output directory: $OUT_DIR" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
}

# Install protoc if not available
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
    
    Write-Host "📥 Downloading protoc from $protocUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $protocUrl -OutFile $zipPath
    
    Write-Host "📦 Extracting protoc..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    
    # Add to PATH for current session
    $env:PATH = "$tempDir\bin;$env:PATH"
    
    Write-Host "✅ protoc installed temporarily" -ForegroundColor Green
}

# Install protoc-gen-grpc-web if not available
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
    
    Write-Host "📥 Downloading protoc-gen-grpc-web from $grpcWebUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $grpcWebUrl -OutFile $grpcWebPlugin
    
    Write-Host "✅ protoc-gen-grpc-web installed" -ForegroundColor Green
}

# Install protoc-gen-ts via npm if not available
$protocGenTs = Get-Command protoc-gen-ts -ErrorAction SilentlyContinue
if (-not $protocGenTs) {
    Write-Host "📦 Installing protoc-gen-ts..." -ForegroundColor Yellow
    
    # Check if we're in frontend directory
    Push-Location $FRONTEND_DIR
    
    # Install as dev dependency
    pnpm add -D ts-protoc-gen
    
    Pop-Location
    
    Write-Host "✅ protoc-gen-ts installed" -ForegroundColor Green
}

# Find all proto files
$protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse

if ($protoFiles.Count -eq 0) {
    Write-Host "⚠️ No proto files found in $PROTO_DIR" -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 Found $($protoFiles.Count) proto files" -ForegroundColor Cyan

# Generate code for each proto file
foreach ($protoFile in $protoFiles) {
    $relativePath = $protoFile.FullName.Substring($PROTO_DIR.Length + 1)
    $relativeDir = Split-Path -Parent $relativePath
    
    # Create output subdirectory
    $outSubDir = Join-Path $OUT_DIR $relativeDir
    if (-not (Test-Path $outSubDir)) {
        New-Item -ItemType Directory -Path $outSubDir -Force | Out-Null
    }
    
    Write-Host "⚙️ Processing: $relativePath" -ForegroundColor White
    
    # Generate JavaScript code
    $jsArgs = @(
        "--proto_path=$PROTO_DIR",
        "--js_out=import_style=commonjs,binary:$OUT_DIR",
        $protoFile.FullName
    )
    
    & protoc $jsArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate JavaScript for $relativePath" -ForegroundColor Red
        continue
    }
    
    # Generate TypeScript definitions
    $tsArgs = @(
        "--proto_path=$PROTO_DIR",
        "--plugin=protoc-gen-ts=$FRONTEND_DIR\node_modules\.bin\protoc-gen-ts.cmd",
        "--ts_out=$OUT_DIR",
        $protoFile.FullName
    )
    
    & protoc $tsArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Failed to generate TypeScript definitions for $relativePath (non-critical)" -ForegroundColor Yellow
    }
    
    # Generate gRPC-Web code
    $grpcWebArgs = @(
        "--proto_path=$PROTO_DIR",
        "--plugin=protoc-gen-grpc-web=$grpcWebPlugin",
        "--grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR",
        $protoFile.FullName
    )
    
    & protoc $grpcWebArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate gRPC-Web code for $relativePath" -ForegroundColor Red
        continue
    }
    
    Write-Host "✅ Generated code for $relativePath" -ForegroundColor Green
}

# Create index files for easier imports
Write-Host "📝 Creating index files..." -ForegroundColor Cyan

$indexContent = "// Auto-generated index file`n// Re-export all generated proto files`n`n"

# Find all generated files and create exports
$generatedFiles = Get-ChildItem -Path $OUT_DIR -Filter "*.js" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $generatedFiles) {
    if ($file.Name -notlike "*_pb.js") { continue }
    
    $relativePath = $file.FullName.Substring($OUT_DIR.Length + 1).Replace('\', '/')
    $importPath = "./" + $relativePath.Replace('.js', '')
    
    $indexContent += "export * from '$importPath';`n"
}

$indexPath = Join-Path $OUT_DIR "index.ts"
Set-Content -Path $indexPath -Value $indexContent

Write-Host "✅ Code generation complete!" -ForegroundColor Green
Write-Host "📁 Generated files in: $OUT_DIR" -ForegroundColor Cyan

# Show summary
$jsFiles = (Get-ChildItem -Path $OUT_DIR -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
$tsFiles = (Get-ChildItem -Path $OUT_DIR -Filter "*.d.ts" -Recurse -ErrorAction SilentlyContinue).Count

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  - JavaScript files: $jsFiles" -ForegroundColor White
Write-Host "  - TypeScript definitions: $tsFiles" -ForegroundColor White
Write-Host "`n🎉 You can now import the generated code in your TypeScript files!" -ForegroundColor Green
Write-Host "Example: import { UserServiceClient } from '@/generated/v1/user_grpc_web_pb'" -ForegroundColor Gray