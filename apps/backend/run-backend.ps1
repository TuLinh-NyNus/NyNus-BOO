# Backend Startup Script with UTF-8 Support
# This script ensures proper Vietnamese character encoding on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NyNus Exam Bank System - Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set console encoding to UTF-8 for proper Vietnamese display
Write-Host "[SETUP] Setting console encoding to UTF-8..." -ForegroundColor Yellow
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LANG = "en_US.UTF-8"
chcp 65001 | Out-Null

Write-Host "[OK] UTF-8 encoding enabled" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found - using environment variables" -ForegroundColor Yellow
    Write-Host ""
}

# Check if backend executable exists
if (Test-Path "backend.exe") {
    Write-Host "[INFO] Using pre-built backend.exe" -ForegroundColor Cyan
    Write-Host "[STARTUP] Starting backend server..." -ForegroundColor Green
    Write-Host ""
    .\backend.exe
} else {
    Write-Host "[INFO] backend.exe not found - building and running from source" -ForegroundColor Cyan
    Write-Host "[BUILD] Compiling backend..." -ForegroundColor Yellow
    go build -o backend.exe cmd/main.go
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Build successful" -ForegroundColor Green
        Write-Host "[STARTUP] Starting backend server..." -ForegroundColor Green
        Write-Host ""
        .\backend.exe
    } else {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        exit 1
    }
}

