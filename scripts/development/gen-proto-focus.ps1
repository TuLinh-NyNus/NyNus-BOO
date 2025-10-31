# Generate Proto Code for Focus Room System
# PowerShell script

$ErrorActionPreference = "Stop"

Write-Host "🔧 Generating Go protobuf code for Focus Room..." -ForegroundColor Cyan

# Paths
$ROOT_DIR = "D:\exam-bank-system"
$PROTO_DIR = "${ROOT_DIR}\packages\proto"
$BACKEND_OUT = "${ROOT_DIR}\apps\backend\pkg\proto"

# Create output directories
New-Item -ItemType Directory -Force -Path "${BACKEND_OUT}\v1" | Out-Null
New-Item -ItemType Directory -Force -Path "${BACKEND_OUT}\common" | Out-Null

# Define Go import paths
$GO_COMMON_PKG = "exam-bank-system/apps/backend/pkg/proto/common"
$GO_V1_PKG = "exam-bank-system/apps/backend/pkg/proto/v1"

# Generate common proto files first
Write-Host "📦 Generating common proto files..." -ForegroundColor Yellow
Get-ChildItem -Path "${PROTO_DIR}\common\*.proto" | ForEach-Object {
    Write-Host "  Processing: $($_.Name)" -ForegroundColor Gray
    & protoc `
        -I "$PROTO_DIR" `
        --go_out="$ROOT_DIR" --go_opt=paths=source_relative `
        --go_opt="Mcommon/common.proto=$GO_COMMON_PKG" `
        $_.FullName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error generating $($_.Name)" -ForegroundColor Red
        exit 1
    }
}

# Get all v1 proto files
$V1_PROTO_FILES = Get-ChildItem -Path "${PROTO_DIR}\v1\*.proto" | Select-Object -ExpandProperty Name

# Build M flags
$M_FLAGS = @("--go_opt=Mcommon/common.proto=$GO_COMMON_PKG")
$M_GRPC_FLAGS = @("--go-grpc_opt=Mcommon/common.proto=$GO_COMMON_PKG")
$M_GW_FLAGS = @("--grpc-gateway_opt=Mcommon/common.proto=$GO_COMMON_PKG")

foreach ($v1_file in $V1_PROTO_FILES) {
    $M_FLAGS += "--go_opt=Mv1/$v1_file=$GO_V1_PKG"
    $M_GRPC_FLAGS += "--go-grpc_opt=Mv1/$v1_file=$GO_V1_PKG"
    $M_GW_FLAGS += "--grpc-gateway_opt=Mv1/$v1_file=$GO_V1_PKG"
}

# Generate v1 proto files
Write-Host "📦 Generating v1 proto files..." -ForegroundColor Yellow
Get-ChildItem -Path "${PROTO_DIR}\v1\*.proto" | ForEach-Object {
    Write-Host "  Processing: $($_.Name)" -ForegroundColor Gray
    
    $args = @(
        "-I", "$PROTO_DIR",
        "--go_out=$ROOT_DIR", "--go_opt=paths=source_relative"
    ) + $M_FLAGS + @(
        "--go-grpc_out=$ROOT_DIR", "--go-grpc_opt=paths=source_relative"
    ) + $M_GRPC_FLAGS + @(
        "--grpc-gateway_out=$ROOT_DIR", "--grpc-gateway_opt=paths=source_relative"
    ) + $M_GW_FLAGS + @(
        $_.FullName
    )
    
    & protoc $args
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error generating $($_.Name)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Go protobuf code generated successfully!" -ForegroundColor Green

# Count generated files
$count = (Get-ChildItem -Path "$BACKEND_OUT" -Filter "*.pb.go" -Recurse).Count
Write-Host "📋 Generated $count .pb.go files" -ForegroundColor Cyan

