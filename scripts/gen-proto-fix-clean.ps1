# Fixed Proto Generation Script
# Generates proto files without google/api namespace conflict

$ErrorActionPreference = "Stop"

# Paths
$PROTO_DIR = "packages/proto"
$BACKEND_OUT = "apps/backend/pkg/proto"

Write-Host "?? Generating Go protobuf code..." -ForegroundColor Cyan

# Create output directories
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT/v1" | Out-Null
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT/common" | Out-Null

# Generate common proto
Write-Host "?? Generating common/common.proto..." -ForegroundColor Yellow
protoc `
  -I="$PROTO_DIR" `
  --go_out="$BACKEND_OUT" `
  --go_opt=paths=source_relative `
  --go_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common `
  "$PROTO_DIR/common/common.proto"

if ($LASTEXITCODE -ne 0) { exit 1 }

# Get all v1 proto files
$v1Files = Get-ChildItem -Path "$PROTO_DIR/v1/*.proto" -File

# Build M flags for all v1 files
$goMFlags = @("--go_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common")
$grpcMFlags = @("--go-grpc_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common")
$gwMFlags = @("--grpc-gateway_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common")

foreach ($file in $v1Files) {
    $basename = $file.Name
    $goMFlags += "--go_opt=Mv1/$basename=exam-bank-system/apps/backend/pkg/proto/v1"
    $grpcMFlags += "--go-grpc_opt=Mv1/$basename=exam-bank-system/apps/backend/pkg/proto/v1"
    $gwMFlags += "--grpc-gateway_opt=Mv1/$basename=exam-bank-system/apps/backend/pkg/proto/v1"
}

# Generate each v1 proto file
foreach ($protoFile in $v1Files) {
    Write-Host "?? Generating v1/$($protoFile.Name)..." -ForegroundColor Yellow
    
    $args = @(
        "-I=$PROTO_DIR",
        "--go_out=$BACKEND_OUT",
        "--go_opt=paths=source_relative"
    ) + $goMFlags + @(
        "--go-grpc_out=$BACKEND_OUT",
        "--go-grpc_opt=paths=source_relative"
    ) + $grpcMFlags + @(
        "--grpc-gateway_out=$BACKEND_OUT",
        "--grpc-gateway_opt=paths=source_relative"
    ) + $gwMFlags + @(
        "v1/$($protoFile.Name)"
    )
    
    $output = & protoc @args 2>&1
    
    # Check for actual errors (not warnings)
    if ($LASTEXITCODE -ne 0 -and $output -match "error") {
        Write-Host "[ERROR] Failed: $($protoFile.Name)" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
}

# Count generated files
$count = (Get-ChildItem -Path "$BACKEND_OUT" -Recurse -Filter "*.pb.go" -File).Count
Write-Host "[OK] Generated $count proto files successfully!" -ForegroundColor Green

