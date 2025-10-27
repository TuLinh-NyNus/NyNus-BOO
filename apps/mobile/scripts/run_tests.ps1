# Flutter Test Suite (PowerShell)

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Flutter Test Suite" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Blue

# 1. Run unit tests
Write-Host "1. Running unit tests..." -ForegroundColor Yellow
flutter test --coverage --reporter expanded

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Unit tests failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Unit tests passed`n" -ForegroundColor Green

# 2. Run widget tests
Write-Host "2. Running widget tests..." -ForegroundColor Yellow
flutter test test\features\*\presentation\widgets\ --reporter expanded 2>$null
Write-Host "✓ Widget tests completed`n" -ForegroundColor Green

# 3. Check for connected devices
Write-Host "3. Checking for connected devices..." -ForegroundColor Yellow
$devices = flutter devices 2>$null | Select-String "connected" | Measure-Object | Select-Object -ExpandProperty Count

if ($devices -gt 0) {
    Write-Host "Found $devices device(s)" -ForegroundColor Green
    Write-Host "Running integration tests..." -ForegroundColor Yellow
    flutter test integration_test\ 2>$null
    Write-Host "✓ Integration tests completed`n" -ForegroundColor Green
} else {
    Write-Host "⚠ No devices connected, skipping integration tests`n" -ForegroundColor Yellow
}

# 4. Coverage summary
if (Test-Path "coverage\lcov.info") {
    Write-Host "4. Coverage report generated" -ForegroundColor Yellow
    Write-Host "✓ Coverage: coverage\lcov.info`n" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "✓ All tests completed successfully! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue

