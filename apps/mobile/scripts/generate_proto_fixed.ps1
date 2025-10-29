# Protocol Buffer Generation Script for Dart (PowerShell)

# Paths
$PROTO_DIR = "..\..\packages\proto"
$OUT_DIR = "lib\generated\proto"

Write-Host "======================================" -ForegroundColor Blue
Write-Host "Protocol Buffer Generation for Dart" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Check if protoc is installed
try {
    $protocVersion = protoc --version 2>&1
    Write-Host "Protoc version: $protocVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: protoc is not installed" -ForegroundColor Red
    Write-Host "Please install protoc first:" -ForegroundColor Yellow
    Write-Host "  Download from https://github.com/protocolbuffers/protobuf/releases"
    Write-Host "  Extract and add to PATH"
    exit 1
}

Write-Host "Output directory: $OUT_DIR" -ForegroundColor Yellow
Write-Host ""

# Clean old generated files
Write-Host "Cleaning old generated files..." -ForegroundColor Yellow
if (Test-Path $OUT_DIR) {
    Remove-Item -Path $OUT_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null

# Check if proto directory exists
if (-not (Test-Path $PROTO_DIR)) {
    Write-Host "Error: Proto directory not found: $PROTO_DIR" -ForegroundColor Red
    exit 1
}

# Get all proto files
$protoFiles = Get-ChildItem -Path "$PROTO_DIR\v1" -Filter "*.proto" -ErrorAction SilentlyContinue

if ($protoFiles.Count -eq 0) {
    Write-Host "Error: No proto files found in $PROTO_DIR\v1" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($protoFiles.Count) proto files" -ForegroundColor Green
Write-Host ""

# Generate for each proto file
$successCount = 0
$failCount = 0

foreach ($protoFile in $protoFiles) {
    $filename = $protoFile.Name
    Write-Host "Generating code for $filename..." -ForegroundColor Green
    
    try {
        $result = protoc `
            --dart_out=grpc:$OUT_DIR `
            --proto_path=$PROTO_DIR `
            --proto_path="$PROTO_DIR\.." `
            "v1\$filename" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "  Success" -ForegroundColor Green
        } else {
            $failCount++
            Write-Host "  Failed: $result" -ForegroundColor Red
        }
    } catch {
        $failCount++
        Write-Host "  Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "Generation Summary:" -ForegroundColor Green
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "======================================" -ForegroundColor Blue

if ($failCount -gt 0) {
    Write-Host "Some files failed to generate" -ForegroundColor Red
    exit 1
}

# Count generated files
$generatedFiles = Get-ChildItem -Path $OUT_DIR -Filter "*.dart" -Recurse -ErrorAction SilentlyContinue
$fileCount = $generatedFiles.Count
Write-Host "Generated $fileCount Dart files" -ForegroundColor Green
Write-Host ""

Write-Host ""
Write-Host "All done!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Blue

# List generated files
Write-Host "Generated files:" -ForegroundColor Yellow
$files = Get-ChildItem -Path "$OUT_DIR\v1" -Filter "*.dart" -ErrorAction SilentlyContinue | Select-Object -First 10
foreach ($file in $files) {
    Write-Host "  $($file.Name)"
}

if ($fileCount -gt 10) {
    Write-Host "  ... and $($fileCount - 10) more files"
}




