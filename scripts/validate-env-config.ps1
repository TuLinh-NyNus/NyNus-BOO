# Comprehensive Environment Variable Validation Script
# Validates all critical environment variables for NyNus Exam Bank System

param(
    [string]$Environment = "development",
    [switch]$Strict = $false,
    [switch]$Verbose = $false
)

# Avoid conflicts with Pester module
if (Get-Module -Name Pester) {
    Remove-Module Pester -Force
}

Write-Host "🔍 NyNus Environment Variable Validation" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Strict Mode: $Strict" -ForegroundColor Yellow
Write-Host ""

# Global validation results
$script:ValidationErrors = @()
$script:ValidationWarnings = @()
$script:ValidationPassed = 0

# Function to add validation error
function Add-ValidationError {
    param([string]$Message, [string]$Variable = "", [string]$File = "")
    $script:ValidationErrors += @{
        Message = $Message
        Variable = $Variable
        File = $File
    }
    Write-Host "❌ ERROR: $Message" -ForegroundColor Red
    if ($Verbose -and $Variable) {
        Write-Host "   Variable: $Variable" -ForegroundColor Gray
    }
    if ($Verbose -and $File) {
        Write-Host "   File: $File" -ForegroundColor Gray
    }
}

# Function to add validation warning
function Add-ValidationWarning {
    param([string]$Message, [string]$Variable = "", [string]$File = "")
    $script:ValidationWarnings += @{
        Message = $Message
        Variable = $Variable
        File = $File
    }
    Write-Host "⚠️  WARNING: $Message" -ForegroundColor Yellow
    if ($Verbose -and $Variable) {
        Write-Host "   Variable: $Variable" -ForegroundColor Gray
    }
    if ($Verbose -and $File) {
        Write-Host "   File: $File" -ForegroundColor Gray
    }
}

# Function to add validation success
function Add-ValidationSuccess {
    param([string]$Message)
    $script:ValidationPassed++
    Write-Host "✅ $Message" -ForegroundColor Green
}

# Function to check if environment variable exists and is valid
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$FilePath,
        [bool]$Required = $true,
        [string]$Pattern = "",
        [string]$Description = "",
        [string[]]$ValidValues = @(),
        [int]$MinLength = 0,
        [int]$MaxLength = 0
    )
    
    $content = Get-Content $FilePath -ErrorAction SilentlyContinue
    if (-not $content) {
        Add-ValidationError "Cannot read file: $FilePath" $VarName $FilePath
        return $false
    }
    
    $line = $content | Where-Object { $_ -match "^$VarName=" }
    if (-not $line) {
        if ($Required) {
            Add-ValidationError "Missing required variable: $VarName" $VarName $FilePath
            return $false
        } else {
            Add-ValidationWarning "Optional variable not found: $VarName" $VarName $FilePath
            return $true
        }
    }
    
    $value = ($line -split "=", 2)[1]
    
    # Check for default/placeholder values
    $defaultPatterns = @("your-", "change-this", "example", "placeholder", "default", "test-")
    foreach ($defaultPattern in $defaultPatterns) {
        if ($value -match $defaultPattern) {
            if ($Required -or $Strict) {
                Add-ValidationError "Variable uses default/placeholder value: $VarName = $value" $VarName $FilePath
                return $false
            } else {
                Add-ValidationWarning "Variable uses default/placeholder value: $VarName = $value" $VarName $FilePath
            }
        }
    }
    
    # Check if empty
    if ($value -eq "" -and $Required) {
        Add-ValidationError "Required variable is empty: $VarName" $VarName $FilePath
        return $false
    }
    
    # Check minimum length
    if ($MinLength -gt 0 -and $value.Length -lt $MinLength) {
        $msg = "Variable too short (minimum $MinLength characters): $VarName = $($value.Length) characters"
        Add-ValidationError $msg $VarName $FilePath
        return $false
    }

    # Check maximum length
    if ($MaxLength -gt 0 -and $value.Length -gt $MaxLength) {
        $msg = "Variable too long (maximum $MaxLength characters): $VarName = $($value.Length) characters"
        Add-ValidationError $msg $VarName $FilePath
        return $false
    }
    
    # Check pattern
    if ($Pattern -and $value -notmatch $Pattern) {
        Add-ValidationError "Variable format invalid: $VarName (expected pattern: $Pattern)" $VarName $FilePath
        return $false
    }
    
    # Check valid values
    if ($ValidValues.Count -gt 0 -and $ValidValues -notcontains $value) {
        Add-ValidationError "Variable has invalid value: $VarName = $value (valid: $($ValidValues -join ', '))" $VarName $FilePath
        return $false
    }
    
    Add-ValidationSuccess "Valid: $VarName$(if ($Description) { " ($Description)" })"
    return $true
}

# Set file paths based on environment
$envLower = $Environment.ToLower()
if ($envLower -eq "development") {
    $frontendEnv = "apps/frontend/.env.local"
    $backendEnv = "apps/backend/.env"
} elseif ($envLower -eq "staging") {
    $frontendEnv = "apps/frontend/.env.staging"
    $backendEnv = "apps/backend/.env.staging"
} elseif ($envLower -eq "production") {
    $frontendEnv = "apps/frontend/.env.production"
    $backendEnv = "apps/backend/.env.production"
} else {
    Write-Host "❌ Invalid environment: $Environment (valid: development, staging, production)" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Checking configuration files..." -ForegroundColor Blue
Write-Host "Frontend: $frontendEnv"
Write-Host "Backend: $backendEnv"
Write-Host ""

# Debug: Show what we got
if ($Verbose) {
    Write-Host "DEBUG: Environment = $Environment" -ForegroundColor Gray
    Write-Host "DEBUG: frontendEnv = '$frontendEnv'" -ForegroundColor Gray
    Write-Host "DEBUG: backendEnv = '$backendEnv'" -ForegroundColor Gray
}

# Check if files exist
$frontendExists = Test-Path $frontendEnv
$backendExists = Test-Path $backendEnv

if (-not $frontendExists) {
    Add-ValidationError "Frontend environment file not found: $frontendEnv"
}

if (-not $backendExists) {
    Add-ValidationError "Backend environment file not found: $backendEnv"
}

if (-not $frontendExists -or -not $backendExists) {
    Write-Host ""
    Write-Host "❌ Configuration validation failed - missing files" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Validating environment variables..." -ForegroundColor Blue
Write-Host ""

# Define validation rules based on environment
$isProduction = $Environment.ToLower() -eq "production"
$isStaging = $Environment.ToLower() -eq "staging"
$isDevelopment = $Environment.ToLower() -eq "development"

# ===== DATABASE VALIDATION =====
Write-Host "Database Configuration:" -ForegroundColor Magenta

# Backend database validation
Test-EnvVar "DB_HOST" $backendEnv -Required $true -Description "Database host"
Test-EnvVar "DB_PORT" $backendEnv -Required $true -Pattern '^\d+$' -Description "Database port"
Test-EnvVar "DB_USER" $backendEnv -Required $true -MinLength 3 -Description "Database user"
Test-EnvVar "DB_PASSWORD" $backendEnv -Required $true -MinLength 8 -Description "Database password"
Test-EnvVar "DB_NAME" $backendEnv -Required $true -MinLength 3 -Description "Database name"
Test-EnvVar "DB_SSLMODE" $backendEnv -Required $false -ValidValues @("disable", "require", "verify-ca", "verify-full") -Description "Database SSL mode"

Write-Host ""

# ===== SERVER CONFIGURATION VALIDATION =====
Write-Host "Server Configuration:" -ForegroundColor Magenta

# Backend server validation
Test-EnvVar "GRPC_PORT" $backendEnv -Required $true -Pattern '^\d+$' -Description "gRPC server port"
Test-EnvVar "HTTP_PORT" $backendEnv -Required $true -Pattern '^\d+$' -Description "HTTP server port"
Test-EnvVar "ENV" $backendEnv -Required $true -ValidValues @("development", "dev", "staging", "stage", "production", "prod", "test") -Description "Environment"

Write-Host ""

# ===== JWT CONFIGURATION VALIDATION =====
Write-Host "JWT Configuration:" -ForegroundColor Magenta

# JWT secrets validation
$jwtMinLength = if ($isProduction) { 64 } else { 32 }
Test-EnvVar "JWT_SECRET" $backendEnv -Required $true -MinLength $jwtMinLength -Description "Primary JWT secret"

# Optional separate secrets
Test-EnvVar "JWT_ACCESS_SECRET" $backendEnv -Required $false -MinLength $jwtMinLength -Description "JWT access token secret"
Test-EnvVar "JWT_REFRESH_SECRET" $backendEnv -Required $false -MinLength $jwtMinLength -Description "JWT refresh token secret"

Write-Host ""

# ===== NEXTAUTH CONFIGURATION VALIDATION =====
Write-Host "NextAuth Configuration:" -ForegroundColor Magenta

# NextAuth validation
$expectedUrl = switch ($Environment.ToLower()) {
    "development" { "http://localhost:3000" }
    "staging" { "https://staging.nynus.edu.vn" }
    "production" { "https://app.nynus.edu.vn" }
}

Test-EnvVar "NEXTAUTH_URL" $frontendEnv -Required $true -Description "NextAuth URL"
Test-EnvVar "NEXTAUTH_SECRET" $frontendEnv -Required $true -MinLength 32 -Description "NextAuth secret"

Write-Host ""

# ===== OAUTH CONFIGURATION VALIDATION =====
Write-Host "OAuth Configuration:" -ForegroundColor Magenta

# Google OAuth validation
$oauthRequired = $isProduction -or $isStaging
Test-EnvVar "GOOGLE_CLIENT_ID" $frontendEnv -Required $oauthRequired -Pattern '\.apps\.googleusercontent\.com$' -Description "Google OAuth Client ID"
Test-EnvVar "GOOGLE_CLIENT_SECRET" $frontendEnv -Required $oauthRequired -MinLength 20 -Description "Google OAuth Client Secret"

# Backend OAuth validation
Test-EnvVar "GOOGLE_CLIENT_ID" $backendEnv -Required $oauthRequired -Pattern '\.apps\.googleusercontent\.com$' -Description "Google OAuth Client ID (Backend)"
Test-EnvVar "GOOGLE_CLIENT_SECRET" $backendEnv -Required $oauthRequired -MinLength 20 -Description "Google OAuth Client Secret (Backend)"

Write-Host ""

# ===== SECURITY CONFIGURATION VALIDATION =====
Write-Host "Security Configuration:" -ForegroundColor Magenta

# Bcrypt cost validation
$bcryptCost = if ($isProduction) { "12" } else { "10" }
Test-EnvVar "BCRYPT_COST" $backendEnv -Required $false -Pattern '^(10|11|12|13|14|15)$' -Description "Bcrypt cost factor"

# Rate limiting validation
Test-EnvVar "LOGIN_RATE_LIMIT_PER_MINUTE" $backendEnv -Required $false -Pattern '^\d+$' -Description "Login rate limit"
Test-EnvVar "REGISTRATION_RATE_LIMIT_PER_HOUR" $backendEnv -Required $false -Pattern '^\d+$' -Description "Registration rate limit"
Test-EnvVar "PASSWORD_RESET_RATE_LIMIT_PER_HOUR" $backendEnv -Required $false -Pattern '^\d+$' -Description "Password reset rate limit"

Write-Host ""

# ===== PRODUCTION-SPECIFIC VALIDATION =====
if ($isProduction) {
    Write-Host "Production-Specific Configuration:" -ForegroundColor Magenta

    # TLS Configuration
    Test-EnvVar "TLS_ENABLED" $backendEnv -Required $false -ValidValues @("true", "false") -Description "TLS enabled"
    Test-EnvVar "TLS_CERT_FILE" $backendEnv -Required $false -Description "TLS certificate file"
    Test-EnvVar "TLS_KEY_FILE" $backendEnv -Required $false -Description "TLS key file"

    # HTTP Gateway should be disabled in production
    Test-EnvVar "HTTP_GATEWAY_ENABLED" $backendEnv -Required $false -ValidValues @("false") -Description "HTTP Gateway (should be disabled)"

    # Email configuration
    Test-EnvVar "SMTP_HOST" $backendEnv -Required $true -Description "SMTP host"
    Test-EnvVar "SMTP_PORT" $backendEnv -Required $true -Pattern '^\d+$' -Description "SMTP port"
    Test-EnvVar "SMTP_USERNAME" $backendEnv -Required $true -Description "SMTP username"
    Test-EnvVar "SMTP_PASSWORD" $backendEnv -Required $true -MinLength 8 -Description "SMTP password"

    Write-Host ""
}

# ===== CROSS-VALIDATION =====
Write-Host "Cross-Validation:" -ForegroundColor Magenta

# Check if Google OAuth credentials match between frontend and backend
$frontendContent = Get-Content $frontendEnv -ErrorAction SilentlyContinue
$backendContent = Get-Content $backendEnv -ErrorAction SilentlyContinue

if ($frontendContent -and $backendContent) {
    $frontendClientId = ($frontendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""
    $backendClientId = ($backendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_ID=" }) -replace "GOOGLE_CLIENT_ID=", ""

    if ($frontendClientId -and $backendClientId) {
        if ($frontendClientId -eq $backendClientId) {
            Add-ValidationSuccess "Google Client ID matches between frontend and backend"
        } else {
            Add-ValidationError "Google Client ID mismatch between frontend and backend"
        }
    }

    $frontendSecret = ($frontendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_SECRET=" }) -replace "GOOGLE_CLIENT_SECRET=", ""
    $backendSecret = ($backendContent | Where-Object { $_ -match "^GOOGLE_CLIENT_SECRET=" }) -replace "GOOGLE_CLIENT_SECRET=", ""

    if ($frontendSecret -and $backendSecret) {
        if ($frontendSecret -eq $backendSecret) {
            Add-ValidationSuccess "Google Client Secret matches between frontend and backend"
        } else {
            Add-ValidationError "Google Client Secret mismatch between frontend and backend"
        }
    }
}

Write-Host ""

# ===== VALIDATION SUMMARY =====
Write-Host "📊 Validation Summary:" -ForegroundColor Blue
Write-Host "Passed: $script:ValidationPassed" -ForegroundColor Green
Write-Host "Warnings: $($script:ValidationWarnings.Count)" -ForegroundColor Yellow
Write-Host "Errors: $($script:ValidationErrors.Count)" -ForegroundColor Red
Write-Host ""

# Show detailed errors and warnings if verbose
if ($Verbose -and $script:ValidationWarnings.Count -gt 0) {
    Write-Host "⚠️  Detailed Warnings:" -ForegroundColor Yellow
    foreach ($warning in $script:ValidationWarnings) {
        Write-Host "   - $($warning.Message)" -ForegroundColor Yellow
        if ($warning.Variable) { Write-Host "     Variable: $($warning.Variable)" -ForegroundColor Gray }
        if ($warning.File) { Write-Host "     File: $($warning.File)" -ForegroundColor Gray }
    }
    Write-Host ""
}

if ($Verbose -and $script:ValidationErrors.Count -gt 0) {
    Write-Host "❌ Detailed Errors:" -ForegroundColor Red
    foreach ($error in $script:ValidationErrors) {
        Write-Host "   - $($error.Message)" -ForegroundColor Red
        if ($error.Variable) { Write-Host "     Variable: $($error.Variable)" -ForegroundColor Gray }
        if ($error.File) { Write-Host "     File: $($error.File)" -ForegroundColor Gray }
    }
    Write-Host ""
}

# Final result
if ($script:ValidationErrors.Count -eq 0) {
    if ($script:ValidationWarnings.Count -eq 0) {
        Write-Host "✅ All environment variables are valid!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Environment variables are valid with warnings" -ForegroundColor Yellow
        Write-Host "   Consider addressing the warnings above" -ForegroundColor Yellow
    }

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
    Write-Host "4. Use -Verbose flag for detailed information"

    exit 1
}
