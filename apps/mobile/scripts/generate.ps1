# Code generation script for Flutter project (PowerShell)

Write-Host "🔄 Running code generation..." -ForegroundColor Cyan

# Clean previous builds
flutter clean

# Get dependencies
Write-Host "📦 Getting dependencies..." -ForegroundColor Yellow
flutter pub get

# Run build_runner
Write-Host "🏗️ Running build_runner..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs

Write-Host "✅ Code generation complete!" -ForegroundColor Green

