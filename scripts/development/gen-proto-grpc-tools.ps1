# Generate Protocol Buffer files using grpc-tools
# This script generates JavaScript and TypeScript files from .proto files

param(
    [string]$ProtoFile = "",
    [switch]$All = $false
)

$ErrorActionPreference = "Stop"

Write-Host "gRPC Protocol Buffer Code Generator (grpc-tools)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Define paths
$ROOT_DIR = (Get-Item $PSScriptRoot).Parent.Parent.FullName
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$OUT_DIR = Join-Path $ROOT_DIR "apps\frontend\src\generated"
$FRONTEND_DIR = Join-Path $ROOT_DIR "apps\frontend"

Write-Host ""
Write-Host "Directories:" -ForegroundColor Cyan
Write-Host "  Root: $ROOT_DIR" -ForegroundColor White
Write-Host "  Proto: $PROTO_DIR" -ForegroundColor White
Write-Host "  Output: $OUT_DIR" -ForegroundColor White

# Create output directory if it doesn't exist
if (-not (Test-Path $OUT_DIR)) {
    New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null
    Write-Host ""
    Write-Host "Created output directory" -ForegroundColor Green
}

# Find grpc-tools binaries
$GRPC_TOOLS_DIR = Join-Path $FRONTEND_DIR "node_modules\grpc-tools\bin"
$PROTOC_JS = Join-Path $GRPC_TOOLS_DIR "protoc.js"
$GRPC_PLUGIN_JS = Join-Path $GRPC_TOOLS_DIR "protoc_plugin.js"

if (-not (Test-Path $PROTOC_JS)) {
    Write-Host ""
    Write-Host "Error: protoc.js not found at $PROTOC_JS" -ForegroundColor Red
    Write-Host "Please run: pnpm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Found grpc-tools" -ForegroundColor Green

# Find proto files
if ($ProtoFile) {
    $protoFiles = @(Get-Item (Join-Path $PROTO_DIR $ProtoFile))
} else {
    $protoFiles = Get-ChildItem -Path $PROTO_DIR -Filter "*.proto" -Recurse
}

if ($protoFiles.Count -eq 0) {
    Write-Host ""
    Write-Host "No proto files found" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Found $($protoFiles.Count) proto file(s)" -ForegroundColor Cyan

# Generate code for each proto file
$successCount = 0
$failCount = 0

foreach ($file in $protoFiles) {
    $relativePath = $file.FullName.Substring($PROTO_DIR.Length + 1)
    Write-Host ""
    Write-Host "Processing: $relativePath" -ForegroundColor White

    try {
        # Generate JavaScript with grpc-tools (using node to run protoc.js)
        $jsArgs = @(
            $PROTOC_JS,
            "--proto_path=$PROTO_DIR",
            "--js_out=import_style=commonjs,binary:$OUT_DIR",
            "--grpc_out=grpc_js:$OUT_DIR",
            "--plugin=protoc-gen-grpc=$GRPC_PLUGIN_JS",
            $file.FullName
        )

        & node $jsArgs

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Generated JavaScript" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  Failed to generate JavaScript" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        $failCount++
    }
}

# Summary
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Failed: $failCount" -ForegroundColor Red
}

# Count generated files
$jsFiles = (Get-ChildItem -Path $OUT_DIR -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
$dtsFiles = (Get-ChildItem -Path $OUT_DIR -Filter "*.d.ts" -Recurse -ErrorAction SilentlyContinue).Count

Write-Host ""
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "  - JavaScript: $jsFiles" -ForegroundColor White
Write-Host "  - TypeScript definitions: $dtsFiles" -ForegroundColor White

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "Code generation complete!" -ForegroundColor Green
    Write-Host "Generated files are in: $OUT_DIR" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "No files were generated successfully" -ForegroundColor Yellow
    exit 1
}

