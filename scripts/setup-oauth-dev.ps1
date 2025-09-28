# Quick OAuth Development Setup Script
# Sets up OAuth configuration for development environment

Write-Host "🚀 NyNus OAuth Development Setup" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "apps/frontend") -or -not (Test-Path "apps/backend")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 This script will help you set up Google OAuth for development" -ForegroundColor Blue
Write-Host ""

# Function to prompt for input with validation
function Get-ValidatedInput {
    param(
        [string]$Prompt,
        [string]$ValidationPattern = ".*",
        [string]$ValidationMessage = "Invalid input"
    )
    
    do {
        $input = Read-Host $Prompt
        if ($input -match $ValidationPattern) {
            return $input
        } else {
            Write-Host $ValidationMessage -ForegroundColor Red
        }
    } while ($true)
}

# Function to generate secure random string
function New-SecureSecret {
    param([int]$Length = 32)
    
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $secret = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $secret += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $secret
}

Write-Host "🔐 Google OAuth Credentials" -ForegroundColor Magenta
Write-Host "Get these from Google Cloud Console > APIs & Services > Credentials"
Write-Host "See docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md for detailed instructions"
Write-Host ""

# Get Google OAuth credentials
$clientId = Get-ValidatedInput -Prompt "Enter Google Client ID" -ValidationPattern "\.apps\.googleusercontent\.com$" -ValidationMessage "Client ID should end with .apps.googleusercontent.com"
$clientSecret = Get-ValidatedInput -Prompt "Enter Google Client Secret" -ValidationPattern ".{20,}" -ValidationMessage "Client Secret should be at least 20 characters"

Write-Host ""
Write-Host "🔑 Generating secure secrets..." -ForegroundColor Blue

# Generate secure secrets
$nextAuthSecret = New-SecureSecret -Length 32
$jwtSecret = New-SecureSecret -Length 32
$jwtAccessSecret = New-SecureSecret -Length 32
$jwtRefreshSecret = New-SecureSecret -Length 32

Write-Host "✅ Secrets generated" -ForegroundColor Green
Write-Host ""

# Create frontend .env.local
Write-Host "📝 Creating frontend environment file..." -ForegroundColor Blue

$frontendEnvContent = @"
# Google OAuth Configuration
GOOGLE_CLIENT_ID=$clientId
GOOGLE_CLIENT_SECRET=$clientSecret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$nextAuthSecret

# Redirect URI (must match Google Console)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080

# Development Settings
NODE_ENV=development
"@

$frontendEnvPath = "apps/frontend/.env.local"
$frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
Write-Host "✅ Created: $frontendEnvPath" -ForegroundColor Green

# Create backend .env
Write-Host "📝 Creating backend environment file..." -ForegroundColor Blue

$backendEnvContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db
DB_SSLMODE=disable

# Server Configuration
GRPC_PORT=50051
HTTP_PORT=8080
ENV=development

# JWT Configuration
JWT_SECRET=$jwtSecret
JWT_ACCESS_SECRET=$jwtAccessSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=$clientId
GOOGLE_CLIENT_SECRET=$clientSecret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Session Configuration
SESSION_SECRET=$nextAuthSecret
MAX_CONCURRENT_SESSIONS=3
SESSION_EXPIRE_HOURS=720

# Security Configuration
BCRYPT_COST=10
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# Development Settings
ENABLE_GRPC_REFLECTION=true
ENABLE_CORS=true
LOG_LEVEL=debug
"@

$backendEnvPath = "apps/backend/.env"
$backendEnvContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
Write-Host "✅ Created: $backendEnvPath" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 Validating configuration..." -ForegroundColor Blue

# Run validation script
& "scripts/validate-oauth-config.ps1" -Environment "development"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 OAuth setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker PostgreSQL is running:"
    Write-Host "   docker-compose up -d postgres"
    Write-Host ""
    Write-Host "2. Start the backend:"
    Write-Host "   cd apps/backend"
    Write-Host "   go run cmd/main.go"
    Write-Host ""
    Write-Host "3. Start the frontend (in another terminal):"
    Write-Host "   cd apps/frontend"
    Write-Host "   pnpm dev"
    Write-Host ""
    Write-Host "4. Test OAuth login at:"
    Write-Host "   http://localhost:3000/login"
    Write-Host ""
    Write-Host "📚 For troubleshooting, see:"
    Write-Host "   docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md"
    Write-Host ""
    Write-Host "🔐 Important Security Notes:" -ForegroundColor Red
    Write-Host "- Keep your Google Client Secret secure"
    Write-Host "- Never commit .env files to version control"
    Write-Host "- Use different credentials for production"
} else {
    Write-Host ""
    Write-Host "❌ Configuration validation failed" -ForegroundColor Red
    Write-Host "Please check the errors above and try again"
}
