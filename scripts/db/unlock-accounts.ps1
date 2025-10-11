# ========================================
# PowerShell Script: Unlock All Locked User Accounts
# ========================================
# Purpose: Reset login attempts and unlock all accounts
#          Wrapper script for SQL execution
# 
# Usage: 
#   .\unlock-accounts.ps1
# 
# Prerequisites:
#   - PostgreSQL psql tool installed OR
#   - Docker with exam-bank-postgres container running
# ========================================

param(
    [switch]$Docker = $false,
    [string]$ContainerName = "exam-bank-postgres",
    [string]$DbUser = "exam_bank_user",
    [string]$DbName = "exam_bank_db",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5439"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Unlock All User Accounts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "unlock-all-accounts.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 SQL File: $sqlFile" -ForegroundColor Yellow

try {
    if ($Docker) {
        Write-Host "🐳 Using Docker container: $ContainerName" -ForegroundColor Blue
        
        # Check if container is running
        $containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
        if (-not $containerStatus) {
            Write-Host "❌ Docker container '$ContainerName' is not running" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✅ Container is running" -ForegroundColor Green
        Write-Host ""
        
        # Execute SQL via Docker
        Get-Content $sqlFile | docker exec -i $ContainerName psql -U $DbUser -d $DbName
        
    } else {
        Write-Host "🔧 Using local psql" -ForegroundColor Blue
        Write-Host "   Host: $DbHost" -ForegroundColor Gray
        Write-Host "   Port: $DbPort" -ForegroundColor Gray
        Write-Host "   User: $DbUser" -ForegroundColor Gray
        Write-Host "   Database: $DbName" -ForegroundColor Gray
        Write-Host ""
        
        # Check if psql is available
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $psqlPath) {
            Write-Host "❌ psql command not found. Please:" -ForegroundColor Red
            Write-Host "   1. Install PostgreSQL client tools, OR" -ForegroundColor Yellow
            Write-Host "   2. Use -Docker flag to run via Docker container" -ForegroundColor Yellow
            exit 1
        }
        
        # Set PGPASSWORD environment variable
        $env:PGPASSWORD = "exam_bank_password"
        
        # Execute SQL via psql
        Get-Content $sqlFile | psql -h $DbHost -p $DbPort -U $DbUser -d $DbName
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS: All accounts unlocked!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ ERROR: Failed to unlock accounts" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Examples
Write-Host ""
Write-Host "📝 Usage Examples:" -ForegroundColor Yellow
Write-Host "   Local:  .\unlock-accounts.ps1" -ForegroundColor Gray
Write-Host "   Docker: .\unlock-accounts.ps1 -Docker" -ForegroundColor Gray
Write-Host "   Custom: .\unlock-accounts.ps1 -DbHost 'myhost' -DbPort '5432'" -ForegroundColor Gray
