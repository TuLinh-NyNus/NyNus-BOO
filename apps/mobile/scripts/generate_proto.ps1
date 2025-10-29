# Protocol Buffer Generation Script for Dart (PowerShell)

# Paths
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$MOBILE_DIR = Split-Path -Parent $SCRIPT_DIR
$ROOT_DIR = Split-Path -Parent (Split-Path -Parent $MOBILE_DIR)
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$OUT_DIR = Join-Path $MOBILE_DIR "lib\generated\proto"
$PROTOC_PATH = Join-Path $ROOT_DIR "tools\protoc\bin\protoc.exe"

Write-Host "======================================" -ForegroundColor Blue
Write-Host "Protocol Buffer Generation for Dart" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Add protoc-gen-dart to PATH
$env:PATH = "$env:USERPROFILE\AppData\Local\Pub\Cache\bin;$env:PATH"

# Check if protoc exists
if (-not (Test-Path $PROTOC_PATH)) {
    Write-Host "Error: protoc not found at: $PROTOC_PATH" -ForegroundColor Red
    exit 1
}

try {
    $protocVersion = & $PROTOC_PATH --version 2>&1
    Write-Host "Protoc version: $protocVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: Failed to execute protoc" -ForegroundColor Red
    exit 1
}

# Check if protoc-gen-dart is installed
try {
    $dartPluginPath = Get-Command protoc-gen-dart -ErrorAction Stop
    Write-Host "Dart plugin found: $($dartPluginPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "Error: protoc-gen-dart is not installed" -ForegroundColor Red
    Write-Host "Please install protoc-gen-dart:" -ForegroundColor Yellow
    Write-Host "  dart pub global activate protoc_plugin"
    Write-Host "  Add to PATH: %USERPROFILE%\AppData\Local\Pub\Cache\bin"
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

# Get all proto files from both common and v1
$commonProtos = Get-ChildItem -Path "$PROTO_DIR\common" -Filter "*.proto" -ErrorAction SilentlyContinue
$v1Protos = Get-ChildItem -Path "$PROTO_DIR\v1" -Filter "*.proto" -ErrorAction SilentlyContinue

$totalProtos = $commonProtos.Count + $v1Protos.Count

if ($totalProtos -eq 0) {
    Write-Host "Error: No proto files found" -ForegroundColor Red
    exit 1
}

Write-Host "Found $totalProtos proto files ($($commonProtos.Count) common, $($v1Protos.Count) v1)" -ForegroundColor Green
Write-Host ""

# Generate for each proto file
$successCount = 0
$failCount = 0

# Generate common protos first
Write-Host "Generating common protos..." -ForegroundColor Cyan
foreach ($protoFile in $commonProtos) {
    $filename = $protoFile.Name
    $relativePath = "common\$filename"
    Write-Host "Generating code for $filename..." -ForegroundColor Green
    
    try {
        # Change to proto directory to resolve relative paths
        Push-Location $PROTO_DIR
        
        $result = & $PROTOC_PATH `
            --dart_out=grpc:$OUT_DIR `
            --proto_path=. `
            $relativePath 2>&1
        
        Pop-Location
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "  Success" -ForegroundColor Green
        } else {
            $failCount++
            Write-Host "  Failed: $result" -ForegroundColor Red
        }
    } catch {
        Pop-Location
        $failCount++
        Write-Host "  Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Generating v1 protos..." -ForegroundColor Cyan
foreach ($protoFile in $v1Protos) {
    $filename = $protoFile.Name
    $relativePath = "v1\$filename"
    Write-Host "Generating code for $filename..." -ForegroundColor Green
    
    try {
        # Change to proto directory to resolve relative paths
        Push-Location $PROTO_DIR
        
        $result = & $PROTOC_PATH `
            --dart_out=grpc:$OUT_DIR `
            --proto_path=. `
            $relativePath 2>&1
        
        Pop-Location
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "  Success" -ForegroundColor Green
        } else {
            $failCount++
            Write-Host "  Failed: $result" -ForegroundColor Red
        }
    } catch {
        Pop-Location
        $failCount++
        Write-Host "  Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "Generation Summary:" -ForegroundColor Green
Write-Host "  Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Failed:  $failCount" -ForegroundColor Red
} else {
    Write-Host "  Failed:  $failCount" -ForegroundColor Green
}
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

# Format generated code
Write-Host "Formatting generated code..." -ForegroundColor Yellow
try {
    dart format $OUT_DIR | Out-Null
    Write-Host "Code formatted" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not format code" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All done!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Blue

# List generated files
Write-Host "Generated files:" -ForegroundColor Yellow
$v1Dir = Join-Path $OUT_DIR "v1"
if (Test-Path $v1Dir) {
    $files = Get-ChildItem -Path $v1Dir -Filter "*.dart" -ErrorAction SilentlyContinue | Select-Object -First 20
    foreach ($file in $files) {
        Write-Host "  $($file.Name)"
    }

    if ($fileCount -gt 20) {
        $moreFiles = $fileCount - 20
        Write-Host "  ... and $moreFiles more files"
    }
}
