# Simple Proto Generation Script
$ErrorActionPreference = "Stop"

Write-Host "🔧 Generating protobuf for focus_room.proto..." -ForegroundColor Cyan

# Use current directory
$current = Get-Location
$protoFile = Join-Path $current "packages\proto\v1\focus_room.proto"
$protoDir = Join-Path $current "packages\proto"
$outputDir = $current

Write-Host "Proto file: $protoFile"
Write-Host "Proto dir: $protoDir"

# Check if file exists
if (-not (Test-Path $protoFile)) {
    Write-Host "❌ Proto file not found: $protoFile" -ForegroundColor Red
    exit 1
}

# Generate Go code
Write-Host "📦 Generating Go code..." -ForegroundColor Yellow

protoc `
    -I="$protoDir" `
    --go_out="$outputDir" `
    --go_opt=paths=source_relative `
    --go_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common `
    --go-grpc_out="$outputDir" `
    --go-grpc_opt=paths=source_relative `
    --go-grpc_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common `
    --grpc-gateway_out="$outputDir" `
    --grpc-gateway_opt=paths=source_relative `
    --grpc-gateway_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common `
    "$protoFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Proto code generated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate proto code" -ForegroundColor Red
    exit 1
}


