# Setup gRPC-Web for Frontend
# =============================

Write-Host "Setting up gRPC-Web for Frontend" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Resolve project root based on script location
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$FrontendDir = Join-Path $RootDir "apps\frontend"
$ToolsBinDir = Join-Path $RootDir "tools\bin"

# Check pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm not found. Please install pnpm first (npm i -g pnpm)." -ForegroundColor Red
    exit 1
}

# Ensure frontend directory exists
if (!(Test-Path $FrontendDir)) {
    Write-Host "Frontend directory not found at $FrontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "Installing gRPC-Web dependencies..." -ForegroundColor Blue

# Install gRPC-Web dependencies in frontend
Push-Location $FrontendDir
pnpm add grpc-web google-protobuf
pnpm add -D @types/google-protobuf
Pop-Location

Write-Host "Dependencies installed" -ForegroundColor Green

# Create generated directory
$GeneratedDir = Join-Path $FrontendDir "src\generated"
Write-Host "Creating generated directory at $GeneratedDir ..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path $GeneratedDir | Out-Null
Write-Host "Generated directory ready" -ForegroundColor Green

# Download protoc-gen-grpc-web binary for Windows
Write-Host "Downloading protoc-gen-grpc-web..." -ForegroundColor Blue

$GrpcWebVersion = "1.5.0"
$DownloadUrl = "https://github.com/grpc/grpc-web/releases/download/$GrpcWebVersion/protoc-gen-grpc-web-$GrpcWebVersion-windows-x86_64.exe"
$GrpcWebPath = Join-Path $ToolsBinDir "protoc-gen-grpc-web.exe"

# Create tools/bin directory if not exists
New-Item -ItemType Directory -Force -Path $ToolsBinDir | Out-Null

# Download the binary
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $GrpcWebPath
    Write-Host "protoc-gen-grpc-web downloaded to $GrpcWebPath" -ForegroundColor Green
    
    # Add to PATH for current session
    $env:PATH = "$(Resolve-Path $ToolsBinDir).Path;$env:PATH"
    Write-Host "Added tools/bin to PATH for current session" -ForegroundColor Green
} catch {
    Write-Host "Failed to download protoc-gen-grpc-web: $_" -ForegroundColor Red
    exit 1
}

Write-Host "gRPC-Web setup completed." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Ensure 'protoc' is installed (see https://github.com/protocolbuffers/protobuf/releases)." -ForegroundColor White
Write-Host "  2. Run tools/scripts/gen-proto-web.ps1 to generate TypeScript code." -ForegroundColor White
Write-Host "  3. Create gRPC-Web client services in frontend and switch from REST to gRPC-Web." -ForegroundColor White
