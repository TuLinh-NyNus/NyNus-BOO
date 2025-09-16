#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Project Stopper
# ========================================
# Script to stop all running services
# Usage: .\stop-project.ps1

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
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
    
    Stopping All Services
    =====================
"@ "Red"
}

Show-Banner

Write-ColorOutput "`n🛑 Stopping all services..." "Yellow"

# Stop Node.js processes (Frontend)
Write-ColorOutput "`n  📦 Stopping Node.js processes (Frontend)..." "Cyan"
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-ColorOutput "    ✅ Stopped $($nodeProcesses.Count) Node.js process(es)" "Green"
} else {
    Write-ColorOutput "    ⚠️ No Node.js processes found" "Gray"
}

# Stop Go processes (Backend)
Write-ColorOutput "`n  🔧 Stopping Go processes (Backend)..." "Cyan"
$goProcesses = Get-Process go, main -ErrorAction SilentlyContinue
if ($goProcesses) {
    $goProcesses | Stop-Process -Force
    Write-ColorOutput "    ✅ Stopped $($goProcesses.Count) Go process(es)" "Green"
} else {
    Write-ColorOutput "    ⚠️ No Go processes found" "Gray"
}

# Kill processes on specific ports
Write-ColorOutput "`n  🔌 Checking and releasing ports..." "Cyan"

$ports = @{
    "3000" = "Frontend (Next.js)"
    "50051" = "Backend gRPC"
    "8080" = "Backend HTTP Gateway"
}

foreach ($port in $ports.Keys) {
    $process = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($process) {
        $pid = $process.OwningProcess
        $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).Name
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-ColorOutput "    ✅ Released port $port ($($ports[$port]))" "Green"
    } else {
        Write-ColorOutput "    ⚠️ Port $port already free ($($ports[$port]))" "Gray"
    }
}

Write-ColorOutput "`n✅ All services stopped successfully!" "Green"
Write-ColorOutput "`nTo start the project again, run: .\start-project.ps1" "Cyan"