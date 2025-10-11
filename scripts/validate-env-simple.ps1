# Simple Environment Variable Validation Script
# Quick validation for critical environment variables

param(
    [string]$Environment = "development"
)

Write-Host "🔍 Simple Environment Variable Validation" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Set file paths based on environment
$frontendEnv = ""
$backendEnv = ""

if ($Environment -eq "development") {
    $frontendEnv = "apps/frontend/.env.local"
    $backendEnv = "apps/backend/.env"
} elseif ($Environment -eq "staging") {
    $frontendEnv = "apps/frontend/.env.staging"
    $backendEnv = "apps/backend/.env.staging"
} elseif ($Environment -eq "production") {
    $frontendEnv = "apps/frontend/.env.production"
    $backendEnv = "apps/backend/.env.production"
} else {
    Write-Host "❌ Invalid environment: $Environment" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Checking files:" -ForegroundColor Blue
Write-Host "Frontend: $frontendEnv"
Write-Host "Backend: $backendEnv"
Write-Host ""

# Check if files exist
$frontendExists = Test-Path $frontendEnv
$backendExists = Test-Path $backendEnv

if (-not $frontendExists) {
    Write-Host "❌ Frontend environment file not found: $frontendEnv" -ForegroundColor Red
}

if (-not $backendExists) {
    Write-Host "❌ Backend environment file not found: $backendEnv" -ForegroundColor Red
}

if (-not $frontendExists -or -not $backendExists) {
    Write-Host ""
    Write-Host "❌ Configuration validation failed - missing files" -ForegroundColor Red
    exit 1
}

# Simple validation function
function Test-SimpleEnvVar {
    param(
        [string]$VarName,
        [string]$FilePath,
        [bool]$Required = $true,
        [string]$Description = ""
    )
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    if (-not $content) {
        Write-Host "❌ Cannot read file: $FilePath" -ForegroundColor Red
        return $false
    }
    
    $line = $content | Where-Object { $_ -match "^$VarName=" }
    if (-not $line) {
        if ($Required) {
            Write-Host "❌ Missing: $VarName in $FilePath" -ForegroundColor Red
            return $false
        } else {
            Write-Host "⚠️  Optional: $VarName not found in $FilePath" -ForegroundColor Yellow
            return $true
        }
    }
    
    $value = ($line -split "=", 2)[1]
    
    # Check for default values
    if ($value -match "your-" -or $value -match "change-this" -or $value -match "example" -or $value -eq "") {
        if ($Required) {
            Write-Host "❌ Not configured: $VarName in $FilePath" -ForegroundColor Red
            return $false
        } else {
            Write-Host "⚠️  Default value: $VarName in $FilePath" -ForegroundColor Yellow
            return $true
        }
    }
    
    Write-Host "✅ Valid: $VarName$(if ($Description) { " ($Description)" })" -ForegroundColor Green
    return $true
}

Write-Host "🔍 Validating critical variables..." -ForegroundColor Blue
Write-Host ""

$allValid = $true

# Database validation
Write-Host "Database Configuration:" -ForegroundColor Magenta
$allValid = (Test-SimpleEnvVar "DB_HOST" $backendEnv -Description "Database host") -and $allValid
$allValid = (Test-SimpleEnvVar "DB_PORT" $backendEnv -Description "Database port") -and $allValid
$allValid = (Test-SimpleEnvVar "DB_USER" $backendEnv -Description "Database user") -and $allValid
$allValid = (Test-SimpleEnvVar "DB_PASSWORD" $backendEnv -Description "Database password") -and $allValid
$allValid = (Test-SimpleEnvVar "DB_NAME" $backendEnv -Description "Database name") -and $allValid

Write-Host ""

# Server validation
Write-Host "Server Configuration:" -ForegroundColor Magenta
$allValid = (Test-SimpleEnvVar "GRPC_PORT" $backendEnv -Description "gRPC port") -and $allValid
$allValid = (Test-SimpleEnvVar "HTTP_PORT" $backendEnv -Description "HTTP port") -and $allValid
$allValid = (Test-SimpleEnvVar "ENV" $backendEnv -Description "Environment") -and $allValid

Write-Host ""

# JWT validation
Write-Host "JWT Configuration:" -ForegroundColor Magenta
$allValid = (Test-SimpleEnvVar "JWT_SECRET" $backendEnv -Description "JWT secret") -and $allValid

Write-Host ""

# NextAuth validation
Write-Host "NextAuth Configuration:" -ForegroundColor Magenta
$allValid = (Test-SimpleEnvVar "NEXTAUTH_URL" $frontendEnv -Description "NextAuth URL") -and $allValid
$allValid = (Test-SimpleEnvVar "NEXTAUTH_SECRET" $frontendEnv -Description "NextAuth secret") -and $allValid

Write-Host ""

# OAuth validation (optional for development)
Write-Host "OAuth Configuration:" -ForegroundColor Magenta
$oauthRequired = $Environment -eq "production" -or $Environment -eq "staging"
$allValid = (Test-SimpleEnvVar "GOOGLE_CLIENT_ID" $frontendEnv -Required $oauthRequired -Description "Google Client ID") -and $allValid
$allValid = (Test-SimpleEnvVar "GOOGLE_CLIENT_SECRET" $frontendEnv -Required $oauthRequired -Description "Google Client Secret") -and $allValid

Write-Host ""

# Summary
Write-Host "📊 Validation Summary:" -ForegroundColor Blue

if ($allValid) {
    Write-Host "✅ All critical environment variables are configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start backend: cd apps/backend && go run cmd/main.go"
    Write-Host "2. Start frontend: cd apps/frontend && pnpm dev"
    Write-Host "3. Test application functionality"
    
    exit 0
} else {
    Write-Host "❌ Environment variable validation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Review the errors above"
    Write-Host "2. Update your environment files"
    Write-Host "3. Run this script again to validate"
    
    exit 1
}
