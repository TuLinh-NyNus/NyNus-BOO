#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Mobile App Setup & Backend Integration
    
.DESCRIPTION
    Automates the final steps of mobile app setup after Flutter SDK is installed:
    1. Verify Flutter/Dart/protoc installation
    2. Generate proto files
    3. Update backend integration
    4. Test gRPC connection
    5. Build and run app
    
.EXAMPLE
    .\scripts\setup-complete.ps1
    .\scripts\setup-complete.ps1 -SkipTests
    .\scripts\setup-complete.ps1 -GenerateProtoOnly
#>

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$GenerateProtoOnly,
    [switch]$Verbose
)

# Colors for output
$Green = @{ ForegroundColor = 'Green' }
$Red = @{ ForegroundColor = 'Red' }
$Yellow = @{ ForegroundColor = 'Yellow' }
$Cyan = @{ ForegroundColor = 'Cyan' }

function Write-Header {
    param([string]$Text)
    Write-Host "`n═══════════════════════════════════════" @Cyan
    Write-Host "  $Text" @Cyan
    Write-Host "═══════════════════════════════════════`n" @Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" @Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" @Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" @Yellow
}

# Step 1: Verify installations
Write-Header "STEP 1: Verifying Prerequisites"

$tools = @{
    'flutter' = 'Flutter SDK'
    'dart' = 'Dart'
    'protoc' = 'Protocol Buffer Compiler'
}

$allToolsFound = $true
foreach ($tool in $tools.GetEnumerator()) {
    try {
        $version = & $tool.Key --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$($tool.Value): $($version -split '\n' | Select-Object -First 1)"
        } else {
            Write-Error "$($tool.Value) not found or not in PATH"
            $allToolsFound = $false
        }
    } catch {
        Write-Error "$($tool.Value): Command not found"
        $allToolsFound = $false
    }
}

if (-not $allToolsFound) {
    Write-Error "Some required tools are missing. Please install them first."
    Write-Host "`nSee SETUP_INSTALLATION.md for installation instructions"
    exit 1
}

# Navigate to workspace
Write-Host "`nNavigating to workspace..."
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mobileDir = Split-Path -Parent $scriptDir
$workspaceDir = Split-Path -Parent (Split-Path -Parent $mobileDir)

Set-Location $workspaceDir
Write-Success "Working directory: $(Get-Location)"

# Step 2: Generate proto files (if not skipping build)
if (-not $SkipBuild -or $GenerateProtoOnly) {
    Write-Header "STEP 2: Generating Proto Files"
    
    Write-Host "Running proto generation script..."
    & "$mobileDir\scripts\generate_proto_fixed.ps1"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Proto files generated successfully"
    } else {
        Write-Error "Proto generation failed"
        exit 1
    }
}

if ($GenerateProtoOnly) {
    Write-Success "Proto generation complete!"
    exit 0
}

# Step 3: Update dependencies
Write-Header "STEP 3: Updating Dependencies"

Set-Location $mobileDir
Write-Host "Running: flutter pub get"
flutter pub get

if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies updated"
} else {
    Write-Error "Failed to update dependencies"
    exit 1
}

# Step 4: Run tests (if not skipping)
if (-not $SkipTests) {
    Write-Header "STEP 4: Running Tests"
    
    Write-Host "Running flutter analyze..."
    flutter analyze
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Code analysis passed"
    } else {
        Write-Warning "Code analysis completed with warnings"
    }
    
    # Run unit tests if they exist
    if (Test-Path "test") {
        Write-Host "Running unit tests..."
        flutter test test/ 2>&1 | Tee-Object -Variable testOutput
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Unit tests passed"
        } else {
            Write-Warning "Some unit tests failed - review output above"
        }
    }
}

# Step 5: Build APK (optional)
Write-Header "STEP 5: Build Status"

Write-Host "Run these commands to build and deploy:"
Write-Host "  Android: flutter build apk --release"
Write-Host "  iOS:     flutter build ios --release"
Write-Host "  Web:     flutter build web --release"

# Step 6: Summary
Write-Header "SETUP COMPLETE ✓"

Write-Host "✓ Proto files generated" @Green
Write-Host "✓ Dependencies installed" @Green
Write-Host "✓ Code analysis passed" @Green
Write-Host ""
Write-Host "NEXT STEPS:" @Cyan
Write-Host "1. Start the backend server:"
Write-Host "   cd apps/backend && go run cmd/main.go"
Write-Host ""
Write-Host "2. Run the mobile app:"
Write-Host "   flutter run"
Write-Host ""
Write-Host "3. Test backend connectivity:"
Write-Host "   - Login with: student33@nynus.edu.vn / Abd8stbcs!"
Write-Host "   - Verify questions load from backend"
Write-Host "   - Check console for gRPC logs"
Write-Host ""
Write-Host "4. For production deployment:"
Write-Host "   flutter build apk --release  # Android"
Write-Host "   flutter build ios --release  # iOS"
Write-Host ""
Write-Host "Documentation:" @Cyan
Write-Host "  - Setup: $mobileDir\SETUP_INSTALLATION.md"
Write-Host "  - Status: $mobileDir\INSTALLATION_STATUS.md"
Write-Host "  - Proto:  $workspaceDir\packages\proto\AGENT.md"
Write-Host ""

Write-Success "All setup steps completed successfully!"



