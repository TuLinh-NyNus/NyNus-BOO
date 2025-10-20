# NyNus - Start Prisma Studio Locally
# 
# Chạy Prisma Studio local thay vì Docker để tránh phải install dependencies mỗi lần
# 
# Usage: .\scripts\database\start-prisma-studio.ps1

param(
    [switch]$Stop
)

$ErrorActionPreference = "Stop"

Write-Host "NyNus Prisma Studio Manager" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Database connection string
$DATABASE_URL = "postgresql://exam_bank_user:exam_bank_password@localhost:5433/exam_bank_db?schema=public&sslmode=disable"

if ($Stop) {
    Write-Host "Stopping Prisma Studio..." -ForegroundColor Yellow

    # Find and kill Prisma Studio process
    $prismaProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*prisma studio*"
    }

    if ($prismaProcesses) {
        $prismaProcesses | ForEach-Object {
            Write-Host "   Killing process $($_.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
        }
        Write-Host "Prisma Studio stopped" -ForegroundColor Green
    } else {
        Write-Host "Prisma Studio is not running" -ForegroundColor Gray
    }

    exit 0
}

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Cyan
$pgCheck = docker ps --filter "name=NyNus-postgres" --filter "status=running" --format "{{.Names}}"

if (-not $pgCheck) {
    Write-Host "PostgreSQL container is not running!" -ForegroundColor Red
    Write-Host "   Please start PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "   .\start-dev.bat" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL is running" -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory
Write-Host "Navigating to frontend directory..." -ForegroundColor Cyan
Push-Location "apps/frontend"

try {
    # Set DATABASE_URL environment variable
    $env:DATABASE_URL = $DATABASE_URL

    Write-Host "Starting Prisma Studio..." -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:5555" -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""

    # Start Prisma Studio
    pnpx prisma studio --port 5555 --browser auto

} catch {
    Write-Host "Error starting Prisma Studio: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

