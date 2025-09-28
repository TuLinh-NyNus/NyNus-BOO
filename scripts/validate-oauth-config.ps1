# OAuth Configuration Validation Script
# Validates Google OAuth configuration for NyNus Exam Bank System

param(
    [string]$Environment = "development"
)

# Avoid conflicts with Pester module
if (Get-Module -Name Pester) {
    Remove-Module Pester -Force
}

Write-Host "🔐 OAuth Configuration Validation" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Function to check if environment variable exists and is not empty
function Check-EnvVar {
    param(
        [string]$VarName,
        [string]$FilePath,
        [bool]$Required = $true
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
    if ($value -match "^your-" -or $value -match "change-this" -or $value -match "example" -or $value -eq "") {
        if ($Required) {
            Write-Host "❌ Not configured: $VarName in $FilePath" -ForegroundColor Red
            return $false
        } else {
            Write-Host "⚠️  Default value: $VarName in $FilePath" -ForegroundColor Yellow
            return $true
        }
    }
    
    Write-Host "✅ Configured: $VarName" -ForegroundColor Green
    return $true
}

# Function to validate Google Client ID format
function Check-GoogleClientId {
    param(
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    $line = $content | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }
    
    if ($line) {
        $value = ($line -split "=", 2)[1]
        if ($value -match "\.apps\.googleusercontent\.com$") {
            Write-Host "✅ Valid Google Client ID format" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Invalid Google Client ID format (should end with .apps.googleusercontent.com)" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

# Function to validate redirect URI format
function Check-RedirectUri {
    param(
        [string]$FilePath,
        [string]$ExpectedDomain
    )
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    $line = $content | Where-Object { $_ -match "^GOOGLE_REDIRECT_URI=" }
    
    if ($line) {
        $value = ($line -split "=", 2)[1]
        if ($value -match "$ExpectedDomain/api/auth/callback/google$") {
            Write-Host "✅ Valid redirect URI format" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Invalid redirect URI format (should be $ExpectedDomain/api/auth/callback/google)" -ForegroundColor Red
            return $false
        }
    }
    return $false
}

# Set file paths based on environment
if ($Environment -eq "development") {
    $frontendEnv = "apps/frontend/.env.local"
    $backendEnv = "apps/backend/.env"
    $expectedDomain = "http://localhost:3000"
} else {
    $frontendEnv = "apps/frontend/.env.production"
    $backendEnv = "apps/backend/.env.production"
    $expectedDomain = "https://app.nynus.edu.vn"
}

Write-Host "📁 Checking configuration files..." -ForegroundColor Blue
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
    Write-Host "❌ Configuration validation failed - missing files" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Validating OAuth configuration..." -ForegroundColor Blue
Write-Host ""

# Validation results
$allValid = $true

# Frontend validation
Write-Host "Frontend Configuration ($frontendEnv):" -ForegroundColor Magenta
$frontendValid = $true
$frontendValid = (Check-EnvVar "GOOGLE_CLIENT_ID" $frontendEnv) -and $frontendValid
$frontendValid = (Check-EnvVar "GOOGLE_CLIENT_SECRET" $frontendEnv) -and $frontendValid
$frontendValid = (Check-EnvVar "NEXTAUTH_URL" $frontendEnv) -and $frontendValid
$frontendValid = (Check-EnvVar "NEXTAUTH_SECRET" $frontendEnv) -and $frontendValid
$frontendValid = (Check-GoogleClientId $frontendEnv) -and $frontendValid
$frontendValid = (Check-RedirectUri $frontendEnv $expectedDomain) -and $frontendValid

Write-Host ""

# Backend validation
Write-Host "Backend Configuration ($backendEnv):" -ForegroundColor Magenta
$backendValid = $true
$backendValid = (Check-EnvVar "GOOGLE_CLIENT_ID" $backendEnv) -and $backendValid
$backendValid = (Check-EnvVar "GOOGLE_CLIENT_SECRET" $backendEnv) -and $backendValid
$backendValid = (Check-EnvVar "JWT_SECRET" $backendEnv) -and $backendValid
$backendValid = (Check-EnvVar "JWT_ACCESS_SECRET" $backendEnv) -and $backendValid
$backendValid = (Check-EnvVar "JWT_REFRESH_SECRET" $backendEnv) -and $backendValid
$backendValid = (Check-GoogleClientId $backendEnv) -and $backendValid
$backendValid = (Check-RedirectUri $backendEnv $expectedDomain) -and $backendValid

Write-Host ""

# Cross-validation (frontend and backend should match)
Write-Host "Cross-validation:" -ForegroundColor Magenta
$frontendContent = Get-Content $frontendEnv
$backendContent = Get-Content $backendEnv

$frontendClientId = ($frontendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""
$backendClientId = ($backendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""

if ($frontendClientId -eq $backendClientId) {
    Write-Host "✅ Google Client ID matches between frontend and backend" -ForegroundColor Green
} else {
    Write-Host "❌ Google Client ID mismatch between frontend and backend" -ForegroundColor Red
    $allValid = $false
}

$frontendSecret = ($frontendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_SECRET=" }) -replace "GOOGLE_CLIENT_SECRET=", ""
$backendSecret = ($backendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_SECRET=" }) -replace "GOOGLE_CLIENT_SECRET=", ""

if ($frontendSecret -eq $backendSecret) {
    Write-Host "✅ Google Client Secret matches between frontend and backend" -ForegroundColor Green
} else {
    Write-Host "❌ Google Client Secret mismatch between frontend and backend" -ForegroundColor Red
    $allValid = $false
}

$allValid = $frontendValid -and $backendValid -and $allValid

Write-Host ""
Write-Host "📊 Validation Summary:" -ForegroundColor Blue

if ($allValid) {
    Write-Host "✅ All OAuth configuration is valid!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend: cd apps/backend && go run cmd/main.go"
    Write-Host "2. Start the frontend: cd apps/frontend && pnpm dev"
    Write-Host "3. Test OAuth flow at: $expectedDomain/login"
    Write-Host ""
    Write-Host "For detailed testing instructions, see:" -ForegroundColor Cyan
    Write-Host "docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md"
} else {
    Write-Host "❌ OAuth configuration has issues that need to be fixed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Review the errors above"
    Write-Host "2. Update your environment files"
    Write-Host "3. Follow the setup guide: docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md"
    Write-Host "4. Run this script again to validate"
    exit 1
}
