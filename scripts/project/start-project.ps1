#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Project Starter
# ========================================
# Script to start all services for development
# Usage: .\start-project.ps1

param(
    [switch]$Backend = $false,
    [switch]$Frontend = $false,
    [switch]$Database = $false,
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
    Write-ColorOutput "`nNyNus Exam Bank System - Project Starter" "Cyan"
    Write-ColorOutput "=========================================" "Cyan"
    Write-Host "`nUsage: .\start-project.ps1 [options]"
    Write-Host "`nOptions:"
    Write-Host "  -Backend    Start only backend services"
    Write-Host "  -Frontend   Start only frontend application"
    Write-Host "  -Database   Start only database (PostgreSQL)"
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
    
    Exam Bank System - Development Environment
    ===========================================
"@ "Cyan"
}

function Check-Requirements {
    Write-ColorOutput "`n[CHECK] Checking requirements..." "Yellow"
    
    $requirements = @{
        "Node.js" = "node"
        "pnpm" = "pnpm"
        "Go" = "go"
        "PostgreSQL" = "psql"
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
        Write-ColorOutput "`n[WARN] Some requirements are missing. Please install them first." "Red"
        exit 1
    }
    
    Write-ColorOutput "`n[OK] All requirements met!" "Green"
}

function Start-Database {
    Write-ColorOutput "`n[DB] Starting PostgreSQL..." "Blue"
    
    # Check if PostgreSQL is running
    $pgStatus = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    
    if ($pgStatus) {
        if ($pgStatus.Status -eq "Running") {
            Write-ColorOutput "  [OK] PostgreSQL is already running" "Green"
        } else {
            Write-ColorOutput "  Starting PostgreSQL service..." "Yellow"
            Start-Service $pgStatus.Name
            Start-Sleep -Seconds 2
            Write-ColorOutput "  [OK] PostgreSQL started" "Green"
        }
    } else {
        # Try to start PostgreSQL using pg_ctl if service not found
        $pgBin = "C:\Program Files\PostgreSQL\15\bin"
        $pgData = "C:\Program Files\PostgreSQL\15\data"
        
        if (Test-Path $pgBin) {
            Write-ColorOutput "  Starting PostgreSQL using pg_ctl..." "Yellow"
            Start-Process -NoNewWindow -FilePath "$pgBin\pg_ctl.exe" -ArgumentList "start", "-D", $pgData
            Start-Sleep -Seconds 3
            Write-ColorOutput "  [OK] PostgreSQL started" "Green"
        } else {
            Write-ColorOutput "  [WARN] PostgreSQL not found. Please start it manually." "Yellow"
        }
    }
}

function Start-Backend {
    Write-ColorOutput "`n[BE] Starting Backend Services..." "Blue"
    
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $backendPath = Join-Path $projectRoot "apps\backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-ColorOutput "  [ERROR] Backend directory not found: $backendPath" "Red"
        return
    }
    
    # Check if backend is already running
    $backendPort = 50051
    $httpPort = 8080
    $backendRunning = Test-NetConnection -ComputerName localhost -Port $backendPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($backendRunning.TcpTestSucceeded) {
        Write-ColorOutput "  [WARN] Backend already running on port $backendPort" "Yellow"
    } else {
        Write-ColorOutput "  Installing Go dependencies..." "Yellow"
        Push-Location $backendPath
        & go mod download 2>&1 | Out-Null
        Pop-Location
        
        Write-ColorOutput "  Starting gRPC server (port $backendPort) and HTTP gateway (port $httpPort)..." "Yellow"
        
        # Start backend in new window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", @"
            cd '$backendPath'
            Write-Host '[BE] NyNus Backend Server' -ForegroundColor Cyan
            Write-Host '========================' -ForegroundColor Cyan
            Write-Host 'Starting backend services...' -ForegroundColor Yellow
            Write-Host ''
            go run cmd/main.go
"@
        
        Write-ColorOutput "  [OK] Backend started in new window" "Green"
        Write-ColorOutput "     - gRPC Server: http://localhost:$backendPort" "Gray"
        Write-ColorOutput "     - HTTP Gateway: http://localhost:$httpPort" "Gray"
    }
}

function Start-Frontend {
    Write-ColorOutput "`n[FE] Starting Frontend Application..." "Blue"
    
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $frontendPath = Join-Path $projectRoot "apps\frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-ColorOutput "  [ERROR] Frontend directory not found: $frontendPath" "Red"
        return
    }
    
    # Check if frontend is already running
    $frontendPort = 3000
    $frontendRunning = Test-NetConnection -ComputerName localhost -Port $frontendPort -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($frontendRunning.TcpTestSucceeded) {
        Write-ColorOutput "  [WARN] Frontend already running on port $frontendPort" "Yellow"
    } else {
        Write-ColorOutput "  Installing npm dependencies..." "Yellow"
        Push-Location $frontendPath
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            & pnpm install 2>&1 | Out-Null
        }
        
        Pop-Location
        
        Write-ColorOutput "  Starting Next.js development server (port $frontendPort)..." "Yellow"
        
        # Start frontend in new window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", @"
            cd '$frontendPath'
            Write-Host '[FE] NyNus Frontend Application' -ForegroundColor Cyan
            Write-Host '===============================' -ForegroundColor Cyan
            Write-Host 'Starting Next.js development server...' -ForegroundColor Yellow
            Write-Host ''
            pnpm dev
"@
        
        Write-ColorOutput "  [OK] Frontend started in new window" "Green"
        Write-ColorOutput "     - Application: http://localhost:$frontendPort" "Gray"
    }
}

function Show-Status {
    Write-ColorOutput "`nService Status:" "Cyan"
    Write-ColorOutput "===============" "Cyan"
    
    # Check PostgreSQL
    $pgStatus = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgStatus -and $pgStatus.Status -eq "Running") {
        Write-ColorOutput "  [OK] PostgreSQL: Running" "Green"
    } else {
        $pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($pgTest.TcpTestSucceeded) {
            Write-ColorOutput "  [OK] PostgreSQL: Running (port 5432)" "Green"
        } else {
            Write-ColorOutput "  [FAIL] PostgreSQL: Not running" "Red"
        }
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
}

function Show-URLs {
    Write-ColorOutput "`nAccess URLs:" "Cyan"
    Write-ColorOutput "============" "Cyan"
    Write-ColorOutput "  Frontend Application: http://localhost:3000" "White"
    Write-ColorOutput "  Backend gRPC Server: http://localhost:50051" "White"
    Write-ColorOutput "  Backend HTTP Gateway: http://localhost:8080" "White"
    Write-ColorOutput "  PostgreSQL Database: localhost:5432" "White"
    
    Write-ColorOutput "`nUseful Pages:" "Cyan"
    Write-ColorOutput "  - Login: http://localhost:3000/login" "Gray"
    Write-ColorOutput "  - Register: http://localhost:3000/register" "Gray"
    Write-ColorOutput "  - Dashboard: http://localhost:3000/dashboard" "Gray"
}

function Stop-All {
    Write-ColorOutput "`nStopping all services..." "Yellow"
    
    # Stop Node.js processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Stop Go processes
    Get-Process go -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-ColorOutput "[OK] All services stopped" "Green"
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Show-Banner
Check-Requirements

# Handle specific service starts
$startAll = -not ($Backend -or $Frontend -or $Database)

if ($startAll -or $Database) {
    Start-Database
}

if ($startAll -or $Backend) {
    Start-Backend
}

if ($startAll -or $Frontend) {
    Start-Frontend
}

# Wait a bit for services to start
Start-Sleep -Seconds 3

Show-Status
Show-URLs

Write-ColorOutput "`n[SUCCESS] Project started successfully!" "Green"
Write-ColorOutput "Press Ctrl+C to stop all services`n" "Yellow"

# Keep script running
Write-Host "Monitoring services... Press Ctrl+C to stop all services"
try {
    while ($true) {
        Start-Sleep -Seconds 60
    }
} finally {
    Write-ColorOutput "`n[SHUTDOWN] Shutting down..." "Yellow"
    Stop-All
}