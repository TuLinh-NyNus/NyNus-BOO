# Simple gRPC-Web code generation for Windows (PowerShell)
# Generates JS, d.ts, and TS gRPC-Web stubs from packages/proto into apps/frontend/src/generated

$ErrorActionPreference = "Stop"

# Resolve paths
$ROOT = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$PROTO_DIR = Join-Path $ROOT "packages\proto"
$OUT_DIR = Join-Path $ROOT "apps\frontend\src\generated"
$TOOLS_DIR = Join-Path $ROOT "tools"
$TOOLS_BIN = Join-Path $TOOLS_DIR "bin"
$PROTOC_DIR = Join-Path $TOOLS_DIR "protoc"
$PROTOC_BIN = Join-Path $PROTOC_DIR "bin"
$PROTOC_EXE = Join-Path $PROTOC_BIN "protoc.exe"
$INCLUDE_GOOGLE = Join-Path $PROTOC_DIR "include"
$GRPC_WEB_PLUGIN = Join-Path $TOOLS_BIN "protoc-gen-grpc-web.exe"
$TS_PLUGIN = Join-Path $ROOT "apps\frontend\node_modules\.bin\protoc-gen-ts.cmd"

# Ensure output directory
New-Item -ItemType Directory -Force -Path $OUT_DIR | Out-Null

# Ensure tools directories
New-Item -ItemType Directory -Force -Path $TOOLS_BIN | Out-Null
New-Item -ItemType Directory -Force -Path $PROTOC_BIN | Out-Null

# Ensure protoc is available
if (!(Test-Path $PROTOC_EXE)) {
  Write-Host "Downloading protoc..." -ForegroundColor Yellow
  $version = "28.3"
  $zipName = "protoc-$version-win64.zip"
  $url = "https://github.com/protocolbuffers/protobuf/releases/download/v$version/$zipName"
  $tmp = Join-Path $env:TEMP "protoc-download"
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $zipPath = Join-Path $tmp $zipName
  Invoke-WebRequest -Uri $url -OutFile $zipPath
  Expand-Archive -Path $zipPath -DestinationPath $tmp -Force
  Copy-Item -Force (Join-Path $tmp "bin\protoc.exe") $PROTOC_EXE
  # Copy include
  New-Item -ItemType Directory -Force -Path $INCLUDE_GOOGLE | Out-Null
  Copy-Item -Recurse -Force (Join-Path $tmp "include\*") $INCLUDE_GOOGLE
}

# Ensure protoc-gen-grpc-web is available
if (!(Test-Path $GRPC_WEB_PLUGIN)) {
  Write-Host "Downloading protoc-gen-grpc-web..." -ForegroundColor Yellow
  $grpcWebVersion = "1.5.0"
  $exeName = "protoc-gen-grpc-web-$grpcWebVersion-windows-x86_64.exe"
  $url = "https://github.com/grpc/grpc-web/releases/download/$grpcWebVersion/$exeName"
  Invoke-WebRequest -Uri $url -OutFile $GRPC_WEB_PLUGIN
}

# Ensure ts-protoc-gen plugin exists
if (!(Test-Path $TS_PLUGIN)) {
  Write-Host "Installing ts-protoc-gen in apps/frontend..." -ForegroundColor Yellow
  Push-Location (Join-Path $ROOT "apps\frontend")
  pnpm add -D ts-protoc-gen
  Pop-Location
}

# Files list
$FILES = @(
  (Join-Path $PROTO_DIR "common\common.proto"),
  (Join-Path $PROTO_DIR "v1\question.proto"),
  (Join-Path $PROTO_DIR "v1\question_filter.proto")
)

# Run protoc: TS definitions (and grpc-web service typings)
# Note: Skipping JS generation because protoc-gen-js is not required when using ts-protoc-gen and grpc-web TS
& $PROTOC_EXE `
  --proto_path=$PROTO_DIR `
  --proto_path=$INCLUDE_GOOGLE `
  --plugin=protoc-gen-ts=$TS_PLUGIN `
  --ts_out=service=grpc-web:$OUT_DIR `
  $FILES

if ($LASTEXITCODE -ne 0) { throw "protoc ts_out failed with code $LASTEXITCODE" }

# Run protoc: gRPC-Web TS service stubs
& $PROTOC_EXE `
  --proto_path=$PROTO_DIR `
  --proto_path=$INCLUDE_GOOGLE `
  --plugin=protoc-gen-grpc-web=$GRPC_WEB_PLUGIN `
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR `
  $FILES

if ($LASTEXITCODE -ne 0) { throw "protoc grpc-web_out failed with code $LASTEXITCODE" }

Write-Host "gRPC-Web code generation completed." -ForegroundColor Green
Write-Host "Output: $OUT_DIR" -ForegroundColor Cyan
