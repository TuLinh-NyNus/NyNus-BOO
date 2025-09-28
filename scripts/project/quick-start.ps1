#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Quick Start
# ========================================
# Script to start project with Docker database and local development servers
# Usage: .\quick-start.ps1

param(
    [switch]$Stop = $false,
    [switch]$Clean = $false,
    [switch]$Status = $false,
    [switch]$Help = $false
)

# Colors for output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

function Show-Help {
    Write-ColorOutput "`nNyNus Exam Bank System - Quick Start" "Cyan"
    Write-ColorOutput "=====================================" "Cyan"
    Write-Host "`nUsage: .\quick-start.ps1 [options]"
    Write-Host "`nOptions:"
    Write-Host "  -Stop       Stop all services"
    Write-Host "  -Clean      Clean up database container"
    Write-Host "  -Status     Show status of services"
    Write-Host "  -Help       Show this help message"
    Write-Host "`nWithout options, all services will be started.`n"
}

function Show-Banner {
    Clear-Host
    Write-ColorOutput @"
    
    ███╗   ██╗██╗   ██╗███╗   ██╗██╗   ██╗███████╗
    ████╗  ██║╚██╗ ██╔╝████╗  ██║██║   ██║██╔════╝
    ██╔██╗ ██║ ╚████╔╝ ██╔██╗ ██║██║   ██║███████╗
    ██║╚██╗██║  ╚██╔╝  ██║╚██╗██║██║   ██║╚════██║
    ██║ ╚████║   ██║   ██║ ╚████║╚██████╔╝███████║
    ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
    
    Quick Start - Hybrid Mode
    ========================
"@ "Cyan"
}

function Check-Requirements {
    Write-ColorOutput "`n[CHECK] Checking requirements..." "Yellow"
    
    $requirements = @{
        "Docker" = "docker"
        "Node.js" = "node"
        "pnpm" = "pnpm"
        "Go" = "go"
    }
    
    $allPresent = $true
    foreach ($req in $requirements.GetEnumerator()) {
        $cmd = Get-Command $req.Value -ErrorAction SilentlyContinue
        if ($cmd) {
            Write-ColorOutput "  [OK] $($req.Key) found" "Green"
        } else {
            Write-ColorOutput "  [MISSING] $($req.Key) not found" "Red"
            $allPresent = $false
        }
    }
    
    if (-not $allPresent) {
        Write-ColorOutput "`n[ERROR] Some requirements are missing. Please install them first." "Red"
        exit 1
    }
    
    Write-ColorOutput "`n[OK] All requirements met!" "Green"
}

function Start-Database {
    Write-ColorOutput "`n[DB] Starting PostgreSQL with Docker..." "Blue"
    
    # Check if database is already running
    $dbRunning = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($dbRunning.TcpTestSucceeded) {
        Write-ColorOutput "[WARN] Database already running on port 5432" "Yellow"
        return
    }
    
    # Start database using simple docker-compose
    docker-compose -f docker-compose.simple.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[OK] PostgreSQL started in Docker" "Green"
        
        # Wait for database to be ready
        Write-ColorOutput "[WAIT] Waiting for database to be ready..." "Yellow"
        $attempt = 0
        $maxAttempts = 30
        
        while ($attempt -lt $maxAttempts) {
            $attempt++
            $dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($dbTest.TcpTestSucceeded) {
                Write-ColorOutput "[OK] Database is ready!" "Green"
                break
            }
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
        }
    } else {
        Write-ColorOutput "[ERROR] Failed to start database" "Red"
        exit 1
    }
}

function Start-Backend {
    Write-ColorOutput "`n[BE] Starting Backend (Go)..." "Blue"
    
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $backendPath = Join-Path $projectRoot "apps\backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-ColorOutput "[ERROR] Backend directory not found: $backendPath" "Red"
        return
    }
    
    # Check if backend is already running
    $backendRunning = Test-NetConnection -ComputerName localhost -Port 50051 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($backendRunning.TcpTestSucceeded) {
        Write-ColorOutput "[WARN] Backend already running on port 50051" "Yellow"
        return
    }
    
    Write-ColorOutput "[BUILD] Installing Go dependencies..." "Yellow"
    Push-Location $backendPath
    go mod download
    go mod tidy
    Pop-Location
    
    Write-ColorOutput "[START] Starting Go backend server..." "Yellow"
    
    # Start backend in new window
    $cmd = @"
cd '$backendPath'
Write-Host '[BE] NyNus Backend Server' -ForegroundColor Cyan
Write-Host '========================' -ForegroundColor Cyan
Write-Host 'gRPC Server: localhost:50051' -ForegroundColor Green
Write-Host 'HTTP Gateway: localhost:8080' -ForegroundColor Green
Write-Host ''
go run cmd/main.go
"@
    
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $cmd
    Write-ColorOutput "[OK] Backend started in new window" "Green"
}

function Start-Frontend {
    Write-ColorOutput "`n[FE] Starting Frontend (Next.js)..." "Blue"
    
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $frontendPath = Join-Path $projectRoot "apps\frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-ColorOutput "[ERROR] Frontend directory not found: $frontendPath" "Red"
        return
    }
    
    # Check if frontend is already running  
    $frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($frontendRunning.TcpTestSucceeded) {
        Write-ColorOutput "[WARN] Frontend already running on port 3000" "Yellow"
        return
    }
    
    Write-ColorOutput "[BUILD] Installing npm dependencies..." "Yellow"
    Push-Location $frontendPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        pnpm install
    }
    
    Pop-Location
    
    Write-ColorOutput "[START] Starting Next.js development server..." "Yellow"
    
    # Start frontend in new window
    $cmd = @"
cd '$frontendPath'
Write-Host '[FE] NyNus Frontend Application' -ForegroundColor Cyan
Write-Host '===============================' -ForegroundColor Cyan
Write-Host 'Development Server: http://localhost:3000' -ForegroundColor Green
Write-Host ''
pnpm dev
"@
    
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $cmd
    Write-ColorOutput "[OK] Frontend started in new window" "Green"
}

function Stop-Services {
    Write-ColorOutput "`n[STOP] Stopping all services..." "Yellow"
    
    # Stop Node.js processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Go processes  
    Get-Process go -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop database
    docker-compose -f docker-compose.simple.yml down
    
    Write-ColorOutput "[OK] All services stopped" "Green"
}

function Clean-Services {
    Write-ColorOutput "`n[CLEAN] Cleaning up..." "Yellow"
    
    Stop-Services
    
    # Remove database volume
    docker-compose -f docker-compose.simple.yml down -v
    
    Write-ColorOutput "[OK] Cleanup completed" "Green"
}

function Show-Status {
    Write-ColorOutput "`n[STATUS] Service Status:" "Cyan"
    Write-ColorOutput "===================" "Cyan"
    
    # Check Database
    $dbTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($dbTest.TcpTestSucceeded) {
        Write-ColorOutput "  [OK] PostgreSQL: Running (port 5432)" "Green"
    } else {
        Write-ColorOutput "  [FAIL] PostgreSQL: Not running" "Red"
    }
    
    # Check Backend
    $backendTest = Test-NetConnection -ComputerName localhost -Port 50051 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($backendTest.TcpTestSucceeded) {
        Write-ColorOutput "  [OK] Backend: Running (gRPC: 50051, HTTP: 8080)" "Green"
    } else {
        Write-ColorOutput "  [FAIL] Backend: Not running" "Red"
    }
    
    # Check Frontend
    $frontendTest = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($frontendTest.TcpTestSucceeded) {
        Write-ColorOutput "  [OK] Frontend: Running (port 3000)" "Green"
    } else {
        Write-ColorOutput "  [FAIL] Frontend: Not running" "Red"
    }
    
    Write-ColorOutput "`nAccess URLs:" "Cyan"
    Write-ColorOutput "============" "Cyan"
    Write-ColorOutput "  Frontend Application: http://localhost:3000" "White"
    Write-ColorOutput "  Backend gRPC Server: http://localhost:50051" "White"
    Write-ColorOutput "  Backend HTTP Gateway: http://localhost:8080" "White"
    Write-ColorOutput "  PostgreSQL Database: localhost:5432" "White"
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Show-Banner

if ($Stop) {
    Stop-Services
    exit 0
}

if ($Clean) {
    Clean-Services
    exit 0
}

if ($Status) {
    Show-Status
    exit 0
}

# Default: Start all services
Check-Requirements
Start-Database
Start-Sleep -Seconds 3
Start-Backend
Start-Sleep -Seconds 5
Start-Frontend
Start-Sleep -Seconds 3
Show-Status

Write-ColorOutput "`n[SUCCESS] All services started!" "Green"
Write-ColorOutput "Use '.\quick-start.ps1 -Status' to check status" "Cyan"
Write-ColorOutput "Use '.\quick-start.ps1 -Stop' to stop all services" "Cyan"

# According to user rules - port 3000 is reserved for frontend and already running
Write-ColorOutput "`nNote: Port 3000 is reserved for frontend interface (as per your rule)" "Yellow"