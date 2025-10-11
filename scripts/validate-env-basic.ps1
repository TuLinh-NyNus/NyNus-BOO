# Basic Environment Variable Validation Script
param([string]$Environment = "development")

Write-Host "Environment Variable Validation" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Set file paths
$frontendEnv = ""
$backendEnv = ""

if ($Environment -eq "development") {
    $frontendEnv = "apps/frontend/.env.local"
    $backendEnv = "apps/backend/.env"
} elseif ($Environment -eq "production") {
    $frontendEnv = "apps/frontend/.env.production"
    $backendEnv = "apps/backend/.env.production"
} else {
    Write-Host "Invalid environment: $Environment" -ForegroundColor Red
    exit 1
}

Write-Host "Checking files:" -ForegroundColor Blue
Write-Host "Frontend: $frontendEnv"
Write-Host "Backend: $backendEnv"
Write-Host ""

# Check if files exist
if (-not (Test-Path $frontendEnv)) {
    Write-Host "Frontend environment file not found: $frontendEnv" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendEnv)) {
    Write-Host "Backend environment file not found: $backendEnv" -ForegroundColor Red
    exit 1
}

# Simple validation function
function Test-EnvVariable {
    param([string]$VarName, [string]$FilePath, [bool]$Required = $true)
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    if (-not $content) {
        Write-Host "Cannot read file: $FilePath" -ForegroundColor Red
        return $false
    }
    
    $line = $content | Where-Object { $_ -match "^$VarName=" }
    if (-not $line) {
        if ($Required) {
            Write-Host "Missing: $VarName" -ForegroundColor Red
            return $false
        } else {
            Write-Host "Optional: $VarName not found" -ForegroundColor Yellow
            return $true
        }
    }
    
    $value = ($line -split "=", 2)[1]
    if ($value -match "your-" -or $value -match "change-this" -or $value -eq "") {
        if ($Required) {
            Write-Host "Not configured: $VarName" -ForegroundColor Red
            return $false
        } else {
            Write-Host "Default value: $VarName" -ForegroundColor Yellow
            return $true
        }
    }
    
    Write-Host "Valid: $VarName" -ForegroundColor Green
    return $true
}

Write-Host "Validating variables..." -ForegroundColor Blue
Write-Host ""

$allValid = $true

# Database validation
Write-Host "Database Configuration:" -ForegroundColor Magenta
$allValid = (Test-EnvVariable "DB_HOST" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "DB_PORT" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "DB_USER" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "DB_PASSWORD" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "DB_NAME" $backendEnv) -and $allValid

Write-Host ""

# Server validation
Write-Host "Server Configuration:" -ForegroundColor Magenta
$allValid = (Test-EnvVariable "GRPC_PORT" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "HTTP_PORT" $backendEnv) -and $allValid
$allValid = (Test-EnvVariable "ENV" $backendEnv) -and $allValid

Write-Host ""

# JWT validation
Write-Host "JWT Configuration:" -ForegroundColor Magenta
$allValid = (Test-EnvVariable "JWT_SECRET" $backendEnv) -and $allValid

Write-Host ""

# NextAuth validation
Write-Host "NextAuth Configuration:" -ForegroundColor Magenta
$allValid = (Test-EnvVariable "NEXTAUTH_URL" $frontendEnv) -and $allValid
$allValid = (Test-EnvVariable "NEXTAUTH_SECRET" $frontendEnv) -and $allValid

Write-Host ""

# Summary
Write-Host "Validation Summary:" -ForegroundColor Blue

if ($allValid) {
    Write-Host "All critical environment variables are configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start backend: cd apps/backend && go run cmd/main.go"
    Write-Host "2. Start frontend: cd apps/frontend && pnpm dev"
    exit 0
} else {
    Write-Host "Environment variable validation failed" -ForegroundColor Red
    Write-Host "Please update your environment files and run again"
    exit 1
}
