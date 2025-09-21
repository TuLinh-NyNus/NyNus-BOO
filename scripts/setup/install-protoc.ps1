# Install protoc (Protocol Buffers compiler) locally under tools/protoc
# This script downloads protoc for Windows and extracts it to tools/protoc/bin
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File tools/scripts/install-protoc.ps1

$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$ProtocDir = Join-Path $RootDir "tools\protoc"
$BinDir = Join-Path $ProtocDir "bin"
$Version = "28.3"
$ZipName = "protoc-$Version-win64.zip"
$Url = "https://github.com/protocolbuffers/protobuf/releases/download/v$Version/$ZipName"
$Tmp = Join-Path $env:TEMP "protoc-$Version"
$ZipPath = Join-Path $Tmp $ZipName

Write-Host "Installing protoc v$Version..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $Tmp | Out-Null
New-Item -ItemType Directory -Force -Path $ProtocDir | Out-Null

Write-Host "Downloading $Url ..." -ForegroundColor Blue
Invoke-WebRequest -Uri $Url -OutFile $ZipPath

Write-Host "Extracting to $ProtocDir ..." -ForegroundColor Blue
Expand-Archive -Path $ZipPath -DestinationPath $ProtocDir -Force

# The zip contains bin/protoc.exe and include/
if (!(Test-Path (Join-Path $BinDir "protoc.exe"))) {
    throw "protoc.exe not found after extraction at $BinDir"
}

Write-Host "protoc is ready at: $BinDir\protoc.exe" -ForegroundColor Green