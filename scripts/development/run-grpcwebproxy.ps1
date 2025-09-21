# Script to download and run grpcwebproxy for Windows

$ErrorActionPreference = "Stop"

$TOOLS_DIR = Join-Path $PSScriptRoot ".." | Resolve-Path
$TOOLS_BIN = Join-Path $TOOLS_DIR "bin"
$PROXY_EXE = Join-Path $TOOLS_BIN "grpcwebproxy.exe"

# Ensure tools bin directory
New-Item -ItemType Directory -Force -Path $TOOLS_BIN | Out-Null

# Download grpcwebproxy if not exists
if (!(Test-Path $PROXY_EXE)) {
    Write-Host "Downloading grpcwebproxy..." -ForegroundColor Yellow
    $version = "0.15.0"
    $zipName = "grpcwebproxy-v$version-win64.zip"
    $url = "https://github.com/improbable-eng/grpc-web/releases/download/grpcwebproxy%2Fv$version/$zipName"
    
    $tmp = Join-Path $env:TEMP "grpcwebproxy-download"
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    $zipPath = Join-Path $tmp $zipName
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath $tmp -Force
        
        # Find the exe in extracted files
        $exeFile = Get-ChildItem -Path $tmp -Filter "grpcwebproxy*.exe" -Recurse | Select-Object -First 1
        if ($exeFile) {
            Copy-Item -Force $exeFile.FullName $PROXY_EXE
            Write-Host "grpcwebproxy downloaded successfully" -ForegroundColor Green
        } else {
            throw "grpcwebproxy.exe not found in archive"
        }
    } catch {
        Write-Host "Failed to download from GitHub releases. Trying alternative method..." -ForegroundColor Yellow
        # Alternative: direct exe download
        $directUrl = "https://github.com/improbable-eng/grpc-web/releases/download/grpcwebproxy%2Fv$version/grpcwebproxy-v$version-win64.exe"
        Invoke-WebRequest -Uri $directUrl -OutFile $PROXY_EXE
    }
    
    # Clean up
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

# Run grpcwebproxy
Write-Host "Starting grpcwebproxy..." -ForegroundColor Green
Write-Host "Backend gRPC: localhost:50051" -ForegroundColor Cyan
Write-Host "Proxy endpoint: localhost:8081" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

# Start proxy with proper parameters
& $PROXY_EXE `
    --backend_addr=localhost:50051 `
    --run_tls_server=false `
    --server_http_port=8081 `
    --allow_all_origins `
    --use_websockets