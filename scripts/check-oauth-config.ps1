# Simple OAuth Configuration Checker
# Validates Google OAuth configuration for NyNus Exam Bank System

param(
    [string]$Environment = "development"
)

Write-Host "OAuth Configuration Check" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Set file paths based on environment
if ($Environment -eq "development") {
    $frontendEnv = "apps/frontend/.env.local"
    $backendEnv = "apps/backend/.env"
} else {
    $frontendEnv = "apps/frontend/.env.production"
    $backendEnv = "apps/backend/.env.production"
}

Write-Host "Checking files:" -ForegroundColor Blue
Write-Host "Frontend: $frontendEnv"
Write-Host "Backend: $backendEnv"
Write-Host ""

# Check if files exist
$frontendExists = Test-Path $frontendEnv
$backendExists = Test-Path $backendEnv

if (-not $frontendExists) {
    Write-Host "❌ Frontend environment file not found: $frontendEnv" -ForegroundColor Red
    Write-Host "   Create it by copying from .env.example" -ForegroundColor Yellow
}

if (-not $backendExists) {
    Write-Host "❌ Backend environment file not found: $backendEnv" -ForegroundColor Red
    Write-Host "   Create it by copying from .env.example" -ForegroundColor Yellow
}

if (-not $frontendExists -or -not $backendExists) {
    Write-Host ""
    Write-Host "❌ Configuration check failed - missing files" -ForegroundColor Red
    exit 1
}

Write-Host "Checking OAuth configuration..." -ForegroundColor Blue
Write-Host ""

# Function to check environment variable
function CheckEnvVar {
    param(
        [string]$VarName,
        [string]$FilePath,
        [string]$FileType
    )
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    $line = $content | Where-Object { $_ -match "^$VarName=" }
    
    if (-not $line) {
        Write-Host "❌ Missing: $VarName in $FileType" -ForegroundColor Red
        return $false
    }
    
    $value = ($line -split "=", 2)[1]
    if ($value -match "your-" -or $value -match "change-this" -or $value -match "example" -or $value -eq "") {
        Write-Host "❌ Not configured: $VarName in $FileType" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Configured: $VarName in $FileType" -ForegroundColor Green
    return $true
}

# Check frontend configuration
Write-Host "Frontend Configuration:" -ForegroundColor Magenta
$frontendValid = $true
$frontendValid = (CheckEnvVar "GOOGLE_CLIENT_ID" $frontendEnv "Frontend") -and $frontendValid
$frontendValid = (CheckEnvVar "GOOGLE_CLIENT_SECRET" $frontendEnv "Frontend") -and $frontendValid
$frontendValid = (CheckEnvVar "NEXTAUTH_URL" $frontendEnv "Frontend") -and $frontendValid
$frontendValid = (CheckEnvVar "NEXTAUTH_SECRET" $frontendEnv "Frontend") -and $frontendValid

Write-Host ""

# Check backend configuration
Write-Host "Backend Configuration:" -ForegroundColor Magenta
$backendValid = $true
$backendValid = (CheckEnvVar "GOOGLE_CLIENT_ID" $backendEnv "Backend") -and $backendValid
$backendValid = (CheckEnvVar "GOOGLE_CLIENT_SECRET" $backendEnv "Backend") -and $backendValid
$backendValid = (CheckEnvVar "JWT_SECRET" $backendEnv "Backend") -and $backendValid
$backendValid = (CheckEnvVar "JWT_ACCESS_SECRET" $backendEnv "Backend") -and $backendValid
$backendValid = (CheckEnvVar "JWT_REFRESH_SECRET" $backendEnv "Backend") -and $backendValid

Write-Host ""

# Cross-validation
Write-Host "Cross-validation:" -ForegroundColor Magenta
$frontendContent = Get-Content $frontendEnv
$backendContent = Get-Content $backendEnv

$frontendClientId = ($frontendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""
$backendClientId = ($backendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""

if ($frontendClientId -eq $backendClientId) {
    Write-Host "✅ Google Client ID matches between frontend and backend" -ForegroundColor Green
    $crossValid = $true
} else {
    Write-Host "❌ Google Client ID mismatch between frontend and backend" -ForegroundColor Red
    $crossValid = $false
}

$allValid = $frontendValid -and $backendValid -and $crossValid

Write-Host ""
Write-Host "Summary:" -ForegroundColor Blue

if ($allValid) {
    Write-Host "✅ OAuth configuration looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: cd apps/backend && go run cmd/main.go"
    Write-Host "2. Start frontend: cd apps/frontend && pnpm dev"
    Write-Host "3. Test OAuth at: http://localhost:3000/login"
    Write-Host ""
    Write-Host "For detailed setup guide, see:" -ForegroundColor Cyan
    Write-Host "docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md"
} else {
    Write-Host "❌ OAuth configuration has issues" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Review the errors above"
    Write-Host "2. Update your environment files"
    Write-Host "3. Follow: docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md"
    Write-Host "4. Run this script again"
    exit 1
}
