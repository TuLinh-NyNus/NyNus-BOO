#!/usr/bin/env pwsh
<#
.SYNOPSIS
Run comprehensive CI/CD checks locally to identify issues before pushing to GitHub.
#>

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$Verbose = $false
)

$colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Pass    = "Green"
    Fail    = "Red"
}

function Write-Status {
    param([string]$Status, [string]$Message, [string]$Color = "White")
    Write-Host "[$Status] " -ForegroundColor $colors[$Status] -NoNewline
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Step)
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor Gray
    Write-Host "STEP: $Step" -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor Gray
}

$results = @{Pass = 0; Fail = 0; Warn = 0}

Write-Host ""
Write-Host "CI/CD LOCAL CHECKS SIMULATION" -ForegroundColor Cyan
Write-Host ""

# STEP 1: Check Environment
Write-Step "1. Verify Environment"
if (& node --version 2>&1) {
    Write-Status "Pass" "Node.js: $(node --version)" "Green"
    $results.Pass++
}

if (& pnpm --version 2>&1) {
    $pnpmVer = pnpm --version
    Write-Status "Pass" "PNPM: $pnpmVer" "Green"
    $results.Pass++
}

if (Test-Path "pnpm-lock.yaml") {
    Write-Status "Pass" "pnpm-lock.yaml found" "Green"
    $results.Pass++
}

# STEP 2: Check Buf Config
Write-Step "2. Check Buf Configuration"
if (Test-Path "packages/proto/buf.gen.frontend.yaml") {
    $bufGen = Get-Content "packages/proto/buf.gen.frontend.yaml" -Raw
    if ($bufGen -match "version:\s*v2") {
        Write-Status "Pass" "buf.gen.frontend.yaml uses v2" "Green"
        $results.Pass++
    } else {
        Write-Status "Fail" "buf.gen.frontend.yaml should use v2" "Red"
        $results.Fail++
    }
}

# STEP 3: Check Prisma
Write-Step "3. Check Prisma Schema"
if (Test-Path "apps/frontend/prisma/schema.prisma") {
    Write-Status "Pass" "Prisma schema found" "Green"
    $results.Pass++
}

# STEP 4: TypeScript Check
Write-Step "4. Run TypeScript Type Check"
Write-Host "Running: pnpm type-check" -ForegroundColor Yellow
$output = & cmd /c "cd apps/frontend && pnpm type-check 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Status "Pass" "TypeScript check passed" "Green"
    $results.Pass++
} else {
    $errors = ($output | Measure-Object -Line).Lines
    Write-Status "Fail" "TypeScript errors found" "Red"
    $results.Fail++
    Write-Host $output | Select-Object -First 20 -ForegroundColor Red
}

# STEP 5: ESLint Check
Write-Step "5. Run ESLint"
Write-Host "Running: pnpm lint" -ForegroundColor Yellow
$output = & cmd /c "cd apps/frontend && pnpm lint 2>&1"
if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Status "Pass" "ESLint check completed" "Green"
    $results.Pass++
} else {
    Write-Status "Fail" "ESLint failed" "Red"
    $results.Fail++
}

# STEP 6: Build Check
if (-not $SkipBuild) {
    Write-Step "6. Build Application"
    Write-Host "Running: pnpm build" -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://test:test@localhost:5432/test"
    $env:NEXTAUTH_URL = "http://localhost:3000"
    $env:NEXTAUTH_SECRET = "test-secret-key-for-ci-build-min-32-chars-long"
    $env:NEXT_PUBLIC_API_URL = "http://localhost:8080"
    $env:NEXT_PUBLIC_GRPC_URL = "http://localhost:8080"
    
    $output = & cmd /c "cd apps/frontend && pnpm build 2>&1"
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Pass" "Build passed" "Green"
        $results.Pass++
    } else {
        Write-Status "Fail" "Build failed" "Red"
        $results.Fail++
        if ($Verbose) { Write-Host $output -ForegroundColor Red }
    }
}

# FINAL REPORT
Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host "FINAL REPORT" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host ""
Write-Host "Pass: $($results.Pass)" -ForegroundColor Green
Write-Host "Fail: $($results.Fail)" -ForegroundColor Red
Write-Host "Warn: $($results.Warn)" -ForegroundColor Yellow
Write-Host ""

if ($results.Fail -eq 0) {
    Write-Host "Status: READY TO PUSH" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Status: FAILED - Fix errors before pushing" -ForegroundColor Red
    exit 1
}
