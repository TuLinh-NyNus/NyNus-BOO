#!/usr/bin/env pwsh
# Script to open GitHub Actions page in browser

param(
    [string]$Owner = "TuLinh-NyNus",
    [string]$Repo = "NyNus-BOO"
)

$actionsUrl = "https://github.com/$Owner/$Repo/actions"
$latestRunUrl = "https://github.com/$Owner/$Repo/actions/runs"

Write-Host "Opening GitHub Actions in browser..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Actions URL: $actionsUrl" -ForegroundColor Blue
Write-Host ""

# Open in default browser
Start-Process $actionsUrl

Write-Host ""
Write-Host "Browser opened! Check the following:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Latest workflow runs status" -ForegroundColor Yellow
Write-Host "2. Click on any failed run (red X icon)" -ForegroundColor Yellow
Write-Host "3. View failed job details" -ForegroundColor Yellow
Write-Host "4. Click on failed step to see logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Common issues to look for:" -ForegroundColor Cyan
Write-Host "  - 'pnpm not found' -> Setup pnpm issue" -ForegroundColor White
Write-Host "  - 'Cannot find module @/generated' -> Protobuf generation failed" -ForegroundColor White
Write-Host "  - 'TS7006' or type errors -> TypeScript issues" -ForegroundColor White
Write-Host "  - 'DATABASE_URL' missing -> Env var not set" -ForegroundColor White
Write-Host "  - 'ESLint' errors -> Linting failed" -ForegroundColor White
Write-Host ""
Write-Host "If you find errors, copy the error message and share with me!" -ForegroundColor Green
Write-Host ""

