#!/usr/bin/env pwsh
# ========================================
# NyNus Exam Bank System - Docker Production
# ========================================
# Convenience script to run Docker setup for production
# Usage: .\docker-prod.ps1 [options]
# Location: docker/scripts/docker-prod.ps1

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
    Write-ColorOutput "`nNyNus Docker Production Helper" "Cyan"
    Write-ColorOutput "==============================" "Cyan"
    Write-ColorOutput "Convenience script to manage Docker production environment`n" "White"
    
    Write-ColorOutput "Usage:" "Yellow"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1                # Start production services" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Build         # Force rebuild and start" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Stop          # Stop all services" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Logs          # Show service logs" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Status        # Show service status" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Clean         # Clean up everything" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Help          # Show this help" "White"
    
    Write-ColorOutput "`nProduction Services:" "Yellow"
    Write-ColorOutput "  - Frontend: http://localhost:3000" "Green"
    Write-ColorOutput "  - Backend API: http://localhost:8080" "Green"
    Write-ColorOutput "  - gRPC Server: http://localhost:50051" "Green"
    Write-ColorOutput "  - Database: localhost:5432" "Green"
    
    Write-ColorOutput "`nEnvironment Variables:" "Yellow"
    Write-ColorOutput "  Set these before running production:" "White"
    Write-ColorOutput "  - DB_PASSWORD=your_secure_password" "Cyan"
    Write-ColorOutput "  - JWT_SECRET=your_jwt_secret" "Cyan"
    Write-ColorOutput "  - NEXTAUTH_SECRET=your_nextauth_secret" "Cyan"
    Write-ColorOutput "  - NEXT_PUBLIC_API_URL=your_api_url" "Cyan"
    
    Write-ColorOutput "`nNote: This script uses docker/compose/docker-compose.prod.yml" "Cyan"
}

if ($Help) {
    Show-Help
    exit 0
}

# Calculate project root path (from docker/scripts/ go up 2 levels)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerDir = Split-Path -Parent $scriptDir
$projectRoot = Split-Path -Parent $dockerDir
$composeFile = Join-Path $projectRoot "docker\compose\docker-compose.prod.yml"

# Check if Docker is available
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-ColorOutput "[ERROR] Docker or Docker Compose not found. Please install Docker Desktop." "Red"
    exit 1
}

# Set working directory to project root
Set-Location $projectRoot

Write-ColorOutput "`n🐳 NyNus Docker Production Environment" "Cyan"
Write-ColorOutput "======================================" "Cyan"

# Run comprehensive environment validation
Write-ColorOutput "`n[VALIDATION] Running environment variable validation..." "Yellow"
$validationScript = "scripts/validate-env-config.ps1"

if (Test-Path $validationScript) {
    try {
        & $validationScript -Environment "production" -Strict
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "[ERROR] Environment validation failed" "Red"
            Write-ColorOutput "Please fix the environment variable issues before proceeding" "Yellow"
            exit 1
        }
        Write-ColorOutput "[OK] Environment validation passed" "Green"
    } catch {
        Write-ColorOutput "[WARNING] Could not run environment validation: $($_.Exception.Message)" "Yellow"
        Write-ColorOutput "Falling back to basic validation..." "Yellow"

        # Fallback to basic validation
        $requiredEnvVars = @("DB_PASSWORD", "JWT_SECRET", "NEXTAUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")
        $missingVars = @()

        foreach ($var in $requiredEnvVars) {
            if (-not (Get-ChildItem Env: | Where-Object Name -eq $var)) {
                $missingVars += $var
            }
        }

        if ($missingVars.Count -gt 0) {
            Write-ColorOutput "[ERROR] Missing required environment variables: $($missingVars -join ', ')" "Red"
            exit 1
        }
    }
} else {
    Write-ColorOutput "[WARNING] Validation script not found: $validationScript" "Yellow"
    Write-ColorOutput "Running basic validation..." "Yellow"

    # Basic validation
    $requiredEnvVars = @("DB_PASSWORD", "JWT_SECRET", "NEXTAUTH_SECRET")
    $missingVars = @()

    foreach ($var in $requiredEnvVars) {
        if (-not (Get-ChildItem Env: | Where-Object Name -eq $var)) {
            $missingVars += $var
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-ColorOutput "[ERROR] Missing required environment variables: $($missingVars -join ', ')" "Red"
        exit 1
    }
}

if ($missingVars.Count -gt 0) {
    Write-ColorOutput "`n[WARNING] Missing environment variables for production:" "Yellow"
    foreach ($var in $missingVars) {
        Write-ColorOutput "  - $var" "Red"
    }
    Write-ColorOutput "`nProduction will use default values. Set these for security!" "Yellow"
}

# Execute based on parameters
if ($Stop) {
    Write-ColorOutput "`n[STOP] Stopping production services..." "Yellow"
    docker-compose -f $composeFile down
    Write-ColorOutput "[OK] Production services stopped" "Green"
    exit 0
}

if ($Clean) {
    Write-ColorOutput "`n[CLEAN] Cleaning up production environment..." "Yellow"
    docker-compose -f $composeFile down -v --rmi all
    docker system prune -f
    Write-ColorOutput "[OK] Production environment cleaned" "Green"
    exit 0
}

if ($Logs) {
    Write-ColorOutput "`n[LOGS] Showing production service logs..." "Blue"
    docker-compose -f $composeFile logs -f --tail=100
    exit 0
}

if ($Status) {
    Write-ColorOutput "`n[STATUS] Production Service Status:" "Cyan"
    Write-ColorOutput "===================================" "Cyan"
    docker-compose -f $composeFile ps
    exit 0
}

# Default: Start production services
if ($Build) {
    Write-ColorOutput "`n[BUILD] Building production images..." "Yellow"
    docker-compose -f $composeFile build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[ERROR] Failed to build images" "Red"
        exit 1
    }
}

Write-ColorOutput "`n[START] Starting production services..." "Blue"
docker-compose -f $composeFile up -d

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "`n[SUCCESS] Production environment started!" "Green"
    Write-ColorOutput "Services available at:" "Cyan"
    Write-ColorOutput "  - Frontend: http://localhost:3000" "Green"
    Write-ColorOutput "  - Backend API: http://localhost:8080" "Green"
    Write-ColorOutput "  - gRPC Server: http://localhost:50051" "Green"
    Write-ColorOutput "  - Database: localhost:5432" "Green"
    
    Write-ColorOutput "`nUseful commands:" "Cyan"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Logs    # View logs" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Status  # Check status" "White"
    Write-ColorOutput "  .\docker\scripts\docker-prod.ps1 -Stop    # Stop services" "White"
} else {
    Write-ColorOutput "[ERROR] Failed to start production services" "Red"
    exit 1
}
