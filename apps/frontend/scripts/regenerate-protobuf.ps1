#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Regenerate protobuf code using buf CLI

.DESCRIPTION
    This script regenerates all protobuf/gRPC code for the frontend
    using buf CLI with the configuration in buf.gen.frontend.yaml

.EXAMPLE
    .\regenerate-protobuf.ps1
#>

Write-Host "🔄 Regenerating protobuf code..." -ForegroundColor Cyan
Write-Host ""

# Navigate to proto directory
$protoDir = Join-Path $PSScriptRoot ".." ".." ".." "packages" "proto"
Push-Location $protoDir

try {
    # Check if buf is available
    $bufVersion = buf --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ buf CLI not found. Please install it first:" -ForegroundColor Red
        Write-Host "   pnpm add -D @bufbuild/buf" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✅ Using buf version: $bufVersion" -ForegroundColor Green
    Write-Host ""

    # Clean old generated files
    $generatedDir = Join-Path $PSScriptRoot ".." "src" "generated"
    if (Test-Path $generatedDir) {
        Write-Host "🗑️  Cleaning old generated files..." -ForegroundColor Yellow
        Remove-Item -Path $generatedDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Old files removed" -ForegroundColor Green
        Write-Host ""
    }

    # Generate new code
    Write-Host "⚙️  Generating protobuf code..." -ForegroundColor Cyan
    buf generate --template buf.gen.frontend.yaml

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Protobuf code generated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Generated files location:" -ForegroundColor Cyan
        Write-Host "   apps/frontend/src/generated/" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Clean Next.js cache: Remove-Item -Recurse -Force apps/frontend/.next" -ForegroundColor White
        Write-Host "   2. Start dev server: pnpm dev" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to generate protobuf code" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

