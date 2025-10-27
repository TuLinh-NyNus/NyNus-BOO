#!/usr/bin/env pwsh
# Native Windows Proto Generation (Go + TypeScript), no WSL required

$ErrorActionPreference = "Stop"

Write-Host "Generating ALL Proto Code (Native Windows)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Paths
$ROOT_DIR = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$TOOLS_DIR = Join-Path $ROOT_DIR "tools"
$BIN_DIR = Join-Path $TOOLS_DIR "bin"

function Check-Binary {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [string]$InstallHint = ""
    )
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        Write-Host ("Missing required binary: {0}" -f $Name) -ForegroundColor Red
        if ($InstallHint) {
            Write-Host ("Hint: {0}" -f $InstallHint) -ForegroundColor Yellow
        }
        exit 1
    }
}

Write-Host "`nStep 0: Validating required toolchain..." -ForegroundColor Yellow
# Core compiler
Check-Binary -Name "protoc" -InstallHint "Run scripts\setup\install-protoc.ps1 or install from https://github.com/protocolbuffers/protobuf/releases"
# Buf CLI (for managed Go generation)
Check-Binary -Name "buf" -InstallHint "Install Buf CLI >= 1.47.2: https://docs.buf.build/installation"
# Go plugins
Check-Binary -Name "protoc-gen-go" -InstallHint "go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1"
Check-Binary -Name "protoc-gen-go-grpc" -InstallHint "go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0"
Check-Binary -Name "protoc-gen-grpc-gateway" -InstallHint "go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@v2.19.0"

# Determine if local Buf supports managed mode v2 go_package_prefix
$useBufManaged = $false
try {
    $bufVersionRaw = (& buf --version) 2>&1
    $bufVersionStr = $bufVersionRaw.Trim().TrimStart('v','V')
    $bufVer = [version]$bufVersionStr
    $minBuf = [version]'1.47.2'
    if ($bufVer -ge $minBuf) {
        $useBufManaged = $true
    } else {
        Write-Host ("Buf CLI {0} detected (< 1.47.2), will skip managed mode and use direct protoc fallback." -f $bufVersionRaw) -ForegroundColor Yellow
    }
} catch {
    Write-Host "Unable to detect Buf version, defaulting to direct protoc fallback." -ForegroundColor Yellow
    $useBufManaged = $false
}

# gRPC-Web plugin: allow either on PATH or local tools/bin
$grpcWebOnPath = Get-Command "protoc-gen-grpc-web" -ErrorAction SilentlyContinue
$grpcWebLocal = Join-Path $BIN_DIR "protoc-gen-grpc-web.exe"
if (-not $grpcWebOnPath -and -not (Test-Path $grpcWebLocal)) {
    Write-Host "Warning: protoc-gen-grpc-web not found on PATH or tools\bin\protoc-gen-grpc-web.exe" -ForegroundColor Yellow
    Write-Host "Install with scripts\setup\setup-grpc-web.ps1 or add to PATH. TypeScript generation will attempt to proceed if available." -ForegroundColor Yellow
}

# Step 1: Generate Go code (Buf managed when supported, else fallback)
Write-Host "`nStep 1: Generating Go code..." -ForegroundColor Yellow
$protoDir = Join-Path $ROOT_DIR "packages\proto"
$bufGen = Join-Path $protoDir "buf.gen.yaml"
$goGenScript = Join-Path $ROOT_DIR "tools\scripts\gen-proto.ps1"

if ($useBufManaged) {
    if (-not (Test-Path $bufGen)) {
        Write-Host ("Missing Buf template: {0}" -f $bufGen) -ForegroundColor Red
        exit 1
    }
    # Lint and build before generate
    buf lint $protoDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Buf lint failed." -ForegroundColor Red
        exit 1
    }
    buf build $protoDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Buf build failed." -ForegroundColor Red
        exit 1
    }
    # Deterministic generate
    buf generate $protoDir --template $bufGen
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Buf generate failed! Falling back to direct protoc generation." -ForegroundColor Yellow
        if (-not (Test-Path $goGenScript)) {
            Write-Host ("Missing script: {0}" -f $goGenScript) -ForegroundColor Red
            exit 1
        }
        & $goGenScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Go code generation (fallback) failed!" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Using direct protoc generation (Buf CLI < 1.47.2 does not support managed go_package_prefix v2)." -ForegroundColor Yellow
    if (-not (Test-Path $goGenScript)) {
        Write-Host ("Missing script: {0}" -f $goGenScript) -ForegroundColor Red
        exit 1
    }
    & $goGenScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Go code generation (fallback) failed!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Generate TypeScript code (gRPC-Web) when plugin is available
Write-Host "`nStep 2: Generating TypeScript code (gRPC-Web)..." -ForegroundColor Yellow
$tsGenScript = Join-Path $ROOT_DIR "scripts\development\gen-proto-simple.ps1"
$shouldTs = $false
if ($grpcWebOnPath -or (Test-Path $grpcWebLocal)) {
    $shouldTs = $true
}
if ($shouldTs -and (Test-Path $tsGenScript)) {
    & $tsGenScript
    # TypeScript generation is non-blocking for backend; continue even if missing plugin
    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript generation encountered issues (non-blocking). See output above." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping TypeScript generation: protoc-gen-grpc-web not found. Install via scripts\setup\setup-grpc-web.ps1 or add to PATH." -ForegroundColor Yellow
}

# Step 3: Optional validation
Write-Host "`nStep 3: Validating outputs..." -ForegroundColor Yellow
$BACKEND_OUT = Join-Path $ROOT_DIR "apps\backend\pkg\proto"
$FRONTEND_OUT = Join-Path $ROOT_DIR "apps\frontend\src\generated"

$pbGoCount = (Get-ChildItem -Path $BACKEND_OUT -Filter "*.pb.go" -Recurse -ErrorAction SilentlyContinue).Count
Write-Host ("  Go .pb.go files: {0}" -f $pbGoCount) -ForegroundColor White
if ($pbGoCount -le 0) {
    Write-Host "  ❌ No Go .pb.go files found. Check protoc and plugins." -ForegroundColor Red
    exit 1
}

$tsAny = (Test-Path $FRONTEND_OUT)
if ($tsAny) {
    $jsCount = (Get-ChildItem -Path $FRONTEND_OUT -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
    $tsdCount = (Get-ChildItem -Path $FRONTEND_OUT -Filter "*.d.ts" -Recurse -ErrorAction SilentlyContinue).Count
    Write-Host ("  Frontend JS: {0}, d.ts: {1}" -f $jsCount, $tsdCount) -ForegroundColor White
} else {
    Write-Host "  Frontend generated folder not present (TypeScript generation may have been skipped)." -ForegroundColor Yellow
}

Write-Host "`nAll proto code generated successfully (Native Windows)!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# Summary
Write-Host "`nGeneration Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Go protobuf files generated to apps/backend/pkg/proto/" -ForegroundColor Green
Write-Host "  ✅ TypeScript (if plugin available) to apps/frontend/src/generated/" -ForegroundColor Green
Write-Host "  Info: Use this script for reproducible, cross-platform generation without WSL" -ForegroundColor White
