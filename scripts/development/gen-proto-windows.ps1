# Generate Protocol Buffer code for Windows
# PowerShell script equivalent to gen-proto.sh

$ErrorActionPreference = "Stop"

# Paths
$ROOT_DIR = (Get-Item $PSScriptRoot).Parent.Parent.FullName
$PROTO_DIR = Join-Path $ROOT_DIR "packages\proto"
$BACKEND_OUT = Join-Path $ROOT_DIR "apps\backend\pkg\proto"

Write-Host "🔧 Generating Go protobuf code..." -ForegroundColor Blue

# Create output directories
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT\v1" | Out-Null
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT\common" | Out-Null

# Define Go import paths for module mapping
$GO_COMMON_PKG = "exam-bank-system/apps/backend/pkg/proto/common"
$GO_V1_PKG = "exam-bank-system/apps/backend/pkg/proto/v1"

# Generate Go code for common proto files first (dependencies)
Write-Host "📦 Generating common proto files..." -ForegroundColor Cyan
$commonProtos = Get-ChildItem -Path "$PROTO_DIR\common\*.proto" -File
foreach ($protoFile in $commonProtos) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor Gray
    
    & protoc `
      -I="$PROTO_DIR" `
      --go_out="$BACKEND_OUT" --go_opt=paths=source_relative `
      --go_opt="Mcommon/common.proto=$GO_COMMON_PKG" `
      "$($protoFile.FullName)"
      
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate: $($protoFile.Name)" -ForegroundColor Red
        exit 1
    }
}

# Generate Go code for v1 proto files
Write-Host "📦 Generating v1 proto files..." -ForegroundColor Cyan

# Get all v1 proto files for mapping
$v1Protos = Get-ChildItem -Path "$PROTO_DIR\v1\*.proto" -File
$V1_PROTO_FILES = $v1Protos | ForEach-Object { $_.Name }

# Generate each v1 proto file with proper mappings
foreach ($protoFile in $v1Protos) {
    Write-Host "  Processing: $($protoFile.Name)" -ForegroundColor Gray
    
    # Build dynamic -M flags for all v1 imports
    $M_FLAGS = @("--go_opt=Mcommon/common.proto=$GO_COMMON_PKG")
    $M_GRPC_FLAGS = @("--go-grpc_opt=Mcommon/common.proto=$GO_COMMON_PKG")
    $M_GW_FLAGS = @("--grpc-gateway_opt=Mcommon/common.proto=$GO_COMMON_PKG")
    
    # Add mapping for all other v1 files
    foreach ($v1File in $V1_PROTO_FILES) {
        $M_FLAGS += "--go_opt=Mv1/$v1File=$GO_V1_PKG"
        $M_GRPC_FLAGS += "--go-grpc_opt=Mv1/$v1File=$GO_V1_PKG"
        $M_GW_FLAGS += "--grpc-gateway_opt=Mv1/$v1File=$GO_V1_PKG"
    }
    
    # Run protoc with all mappings
    $allArgs = @(
        "-I=$PROTO_DIR",
        "--go_out=$BACKEND_OUT",
        "--go_opt=paths=source_relative"
    ) + $M_FLAGS + @(
        "--go-grpc_out=$BACKEND_OUT",
        "--go-grpc_opt=paths=source_relative"
    ) + $M_GRPC_FLAGS + @(
        "--grpc-gateway_out=$BACKEND_OUT",
        "--grpc-gateway_opt=paths=source_relative"
    ) + $M_GW_FLAGS + @(
        "$($protoFile.FullName)"
    )
    
    & protoc @allArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate: $($protoFile.Name)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Go protobuf code generated successfully!" -ForegroundColor Green

# Verify output
$generatedFiles = Get-ChildItem -Path "$BACKEND_OUT" -Recurse -Filter "*.pb.go" -File
Write-Host "📋 Generated $($generatedFiles.Count) files" -ForegroundColor Cyan


