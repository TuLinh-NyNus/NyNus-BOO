# Final Proto Generation Script - Fix namespace conflicts
$ErrorActionPreference = "Stop"

$PROTO_DIR = "packages/proto"
$BACKEND_OUT = "apps/backend/pkg/proto"

Write-Host "[INFO] Generating Go protobuf code..."

# Create output directories
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT/v1" | Out-Null
New-Item -ItemType Directory -Force -Path "$BACKEND_OUT/common" | Out-Null

# Step 1: Generate common proto
Write-Host "[1/2] Generating common/common.proto..."
protoc `
  -I="$PROTO_DIR" `
  --go_out="$BACKEND_OUT" `
  --go_opt=paths=source_relative `
  --go_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common `
  "$PROTO_DIR/common/common.proto"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate common.proto"
    exit 1
}

# Step 2: Get all v1 proto files and build comprehensive M flags
Write-Host "[2/2] Generating v1 proto files..."
$v1Files = Get-ChildItem -Path "$PROTO_DIR/v1/*.proto" -File
$v1Names = $v1Files | ForEach-Object { $_.Name }

# Build comprehensive M flags for all imports
$allGoMFlags = @()
$allGrpcMFlags = @()
$allGwMFlags = @()

# Add common mapping
$allGoMFlags += "--go_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common"
$allGrpcMFlags += "--go-grpc_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common"
$allGwMFlags += "--grpc-gateway_opt=Mcommon/common.proto=exam-bank-system/apps/backend/pkg/proto/common"

# Add mappings for all v1 files
foreach ($name in $v1Names) {
    $allGoMFlags += "--go_opt=Mv1/$name=exam-bank-system/apps/backend/pkg/proto/v1"
    $allGrpcMFlags += "--go-grpc_opt=Mv1/$name=exam-bank-system/apps/backend/pkg/proto/v1"
    $allGwMFlags += "--grpc-gateway_opt=Mv1/$name=exam-bank-system/apps/backend/pkg/proto/v1"
}

# Generate all v1 files together with full mappings
$allV1Files = $v1Files | ForEach-Object { "v1/$($_.Name)" }

$protocArgs = @(
  "-I=$PROTO_DIR",
  "--go_out=$BACKEND_OUT",
  "--go_opt=paths=source_relative"
) + $allGoMFlags + @(
  "--go-grpc_out=$BACKEND_OUT",
  "--go-grpc_opt=paths=source_relative"
) + $allGrpcMFlags + @(
  "--grpc-gateway_out=$BACKEND_OUT",
  "--grpc-gateway_opt=paths=source_relative"
) + $allGwMFlags + $allV1Files

# Run protoc and capture output
$ErrorActionPreference = "Continue"
$output = & protoc @protocArgs 2>&1
$ErrorActionPreference = "Stop"

# Check for actual errors (ignore warnings)
if ($output -match "error" -and -not ($output -match "warning")) {
    Write-Host "[ERROR] Proto generation failed"
    Write-Host $output
    exit 1
}

$count = (Get-ChildItem -Path "$BACKEND_OUT" -Recurse -Filter "*.pb.go" -File).Count
Write-Host "[OK] Generated $count proto files successfully!"

