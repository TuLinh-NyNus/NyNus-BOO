# Build Release Script (PowerShell)

param(
    [string]$Flavor = "production",
    [string]$Platform = "both"
)

Write-Host "🚀 Building NyNus Exam Bank - Flavor: $Flavor, Platform: $Platform" -ForegroundColor Cyan

# Clean
Write-Host "🧹 Cleaning..." -ForegroundColor Yellow
flutter clean
flutter pub get

# Generate code
Write-Host "⚙️ Generating code..." -ForegroundColor Yellow
if (Test-Path ".\scripts\generate_proto.ps1") {
    .\scripts\generate_proto.ps1
}

flutter pub run build_runner build --delete-conflicting-outputs

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
flutter test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed!" -ForegroundColor Red
    exit 1
}

# Build Android
if ($Platform -eq "android" -or $Platform -eq "both") {
    Write-Host "📱 Building Android App Bundle..." -ForegroundColor Yellow
    
    flutter build appbundle `
        --flavor $Flavor `
        --release `
        --dart-define=ENVIRONMENT=$Flavor `
        --obfuscate `
        --split-debug-info=build\app\outputs\symbols
    
    Write-Host "✅ Android build complete!" -ForegroundColor Green
    Write-Host "Output: build\app\outputs\bundle\${Flavor}Release\" -ForegroundColor Cyan
}

# Build iOS
if ($Platform -eq "ios" -or $Platform -eq "both") {
    Write-Host "🍎 Building iOS IPA..." -ForegroundColor Yellow
    
    flutter build ipa `
        --flavor $Flavor `
        --release `
        --dart-define=ENVIRONMENT=$Flavor `
        --obfuscate `
        --split-debug-info=build\ios\outputs\symbols
    
    Write-Host "✅ iOS build complete!" -ForegroundColor Green
    Write-Host "Output: build\ios\ipa\" -ForegroundColor Cyan
}

Write-Host "🎉 Build complete!" -ForegroundColor Green

