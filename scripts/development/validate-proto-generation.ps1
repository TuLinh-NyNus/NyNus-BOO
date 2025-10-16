#!/usr/bin/env pwsh
# Validate that proto generation is consistent

$ErrorActionPreference = "Stop"

Write-Host "🔍 Validating Proto Generation..." -ForegroundColor Cyan

# Check for conflicting config
if (Test-Path "packages/proto/buf.gen.ts.yaml") {
    $content = Get-Content "packages/proto/buf.gen.ts.yaml" -Raw
    if ($content -notmatch "# DEPRECATED") {
        Write-Host "❌ ERROR: buf.gen.ts.yaml should be deprecated!" -ForegroundColor Red
        Write-Host "   Use gen-proto-web.ps1 instead" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✅ buf.gen.ts.yaml is properly deprecated" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No conflicting buf.gen.ts.yaml found" -ForegroundColor Green
}

# Check generated files exist
$requiredFiles = @(
    "apps/frontend/src/generated/v1/UserServiceClientPb.ts",
    "apps/frontend/src/generated/v1/QuestionServiceClientPb.ts",
    "apps/frontend/src/generated/v1/AdminServiceClientPb.ts",
    "apps/frontend/src/generated/v1/ProfileServiceClientPb.ts",
    "apps/frontend/src/generated/v1/ContactServiceClientPb.ts",
    "apps/frontend/src/generated/v1/NewsletterServiceClientPb.ts"
)

Write-Host "🔍 Checking required generated files..." -ForegroundColor Cyan

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    } else {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ ERROR: Missing $($missingFiles.Count) required generated files!" -ForegroundColor Red
    Write-Host "   Run: ./scripts/development/gen-proto-web.ps1" -ForegroundColor Yellow
    exit 1
}

# Check that archived proto files are not in v1 directory
$archivedProtos = @("blog.proto", "search.proto", "import.proto", "tikz.proto")
$foundArchived = @()

foreach ($proto in $archivedProtos) {
    $v1Path = "packages/proto/v1/$proto"
    if (Test-Path $v1Path) {
        $foundArchived += $proto
        Write-Host "❌ Found archived proto in v1: $proto" -ForegroundColor Red
    }
}

if ($foundArchived.Count -gt 0) {
    Write-Host "❌ ERROR: Found $($foundArchived.Count) archived proto files in v1 directory!" -ForegroundColor Red
    Write-Host "   These should be in packages/proto/archive/future/" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ No archived proto files found in v1 directory" -ForegroundColor Green
}

# Check that archived proto files exist in archive directory
foreach ($proto in $archivedProtos) {
    $archivePath = "packages/proto/archive/future/$proto"
    if (-not (Test-Path $archivePath)) {
        Write-Host "❌ Missing archived proto: $archivePath" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Archived proto found: $proto" -ForegroundColor Green
    }
}

Write-Host "✅ Proto generation validation passed!" -ForegroundColor Green
