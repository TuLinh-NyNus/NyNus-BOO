#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Docker Development
# ========================================
# Convenience script to run Docker setup for development
# Usage: .\docker-dev.ps1 [options]

param(
    [switch]$Build = $false,
    [switch]$Stop = $false,
    [switch]$Logs = $false,
    [switch]$Status = $false,
    [switch]$Clean = $false,
    [switch]$Help = $false
)

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $previousColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $previousColor
}

function Show-Help {
    Write-ColorOutput "`nNyNus Docker Development Helper" "Cyan"
    Write-ColorOutput "===============================" "Cyan"
    Write-ColorOutput "Convenience script to manage Docker development environment`n" "White"
    
    Write-ColorOutput "Usage:" "Yellow"
    Write-ColorOutput "  .\docker-dev.ps1                # Start development services" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Build         # Force rebuild and start" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Stop          # Stop all services" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Logs          # Show service logs" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Status        # Show service status" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Clean         # Clean up everything" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Help          # Show this help" "White"
    
    Write-ColorOutput "`nServices:" "Yellow"
    Write-ColorOutput "  - Frontend: http://localhost:3000" "Green"
    Write-ColorOutput "  - Backend API: http://localhost:8080" "Green"
    Write-ColorOutput "  - gRPC Server: http://localhost:50051" "Green"
    Write-ColorOutput "  - Database: localhost:5432" "Green"
    
    Write-ColorOutput "`nNote: This script uses docker/compose/docker-compose.yml" "Cyan"
}

if ($Help) {
    Show-Help
    exit 0
}

# Calculate project root path
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$composeFile = Join-Path $projectRoot "docker\compose\docker-compose.yml"

# Check if Docker is available
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-ColorOutput "[ERROR] Docker or Docker Compose not found. Please install Docker Desktop." "Red"
    exit 1
}

# Set working directory to project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-ColorOutput "`n🐳 NyNus Docker Development Environment" "Cyan"
Write-ColorOutput "=======================================" "Cyan"

# Execute based on parameters
if ($Stop) {
    Write-ColorOutput "`n[STOP] Stopping development services..." "Yellow"
    docker-compose -f $composeFile down
    Write-ColorOutput "[OK] Development services stopped" "Green"
    exit 0
}

if ($Clean) {
    Write-ColorOutput "`n[CLEAN] Cleaning up development environment..." "Yellow"
    docker-compose -f $composeFile down -v --rmi all
    docker system prune -f
    Write-ColorOutput "[OK] Development environment cleaned" "Green"
    exit 0
}

if ($Logs) {
    Write-ColorOutput "`n[LOGS] Showing development service logs..." "Blue"
    docker-compose -f $composeFile logs -f --tail=100
    exit 0
}

if ($Status) {
    Write-ColorOutput "`n[STATUS] Development Service Status:" "Cyan"
    Write-ColorOutput "====================================" "Cyan"
    docker-compose -f $composeFile ps
    exit 0
}

# Default: Start development services
if ($Build) {
    Write-ColorOutput "`n[BUILD] Building development images..." "Yellow"
    docker-compose -f $composeFile build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Failed to build images" "Red"
        exit 1
    }
}

Write-ColorOutput "`n[START] Starting development services..." "Blue"
docker-compose -f $composeFile up -d

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "`n[SUCCESS] Development environment started!" "Green"
    Write-ColorOutput "Services available at:" "Cyan"
    Write-ColorOutput "  - Frontend: http://localhost:3000" "Green"
    Write-ColorOutput "  - Backend API: http://localhost:8080" "Green"
    Write-ColorOutput "  - gRPC Server: http://localhost:50051" "Green"
    Write-ColorOutput "  - Database: localhost:5432" "Green"
    
    Write-ColorOutput "`nUseful commands:" "Cyan"
    Write-ColorOutput "  .\docker-dev.ps1 -Logs    # View logs" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Status  # Check status" "White"
    Write-ColorOutput "  .\docker-dev.ps1 -Stop    # Stop services" "White"
} else {
    Write-ColorOutput "[ERROR] Failed to start development services" "Red"
    exit 1
}
