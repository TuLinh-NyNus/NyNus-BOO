#!/usr/bin/env bash
set -euo pipefail

# Paths
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PROTO_DIR="$ROOT_DIR/packages/proto"
BACKEND_OUT="$ROOT_DIR/apps/backend/pkg/proto"

echo "🔧 Generating Go protobuf code..."

# Create output directories
mkdir -p "$BACKEND_OUT/v1"
mkdir -p "$BACKEND_OUT/common"

# Define Go import paths for module mapping
GO_COMMON_PKG="exam-bank-system/apps/backend/pkg/proto/common"
GO_V1_PKG="exam-bank-system/apps/backend/pkg/proto/v1"
GO_GOOGLE_API_PKG="exam-bank-system/apps/backend/pkg/proto/google/api"

# Generate Go code for common proto files first (dependencies)
echo "📦 Generating common proto files..."
for proto_file in "$PROTO_DIR/common"/*.proto; do
    if [ -f "$proto_file" ]; then
        echo "  Processing: $(basename "$proto_file")"
        protoc \
          -I "$PROTO_DIR" \
          --go_out="$BACKEND_OUT" --go_opt=paths=source_relative \
          --go_opt="Mcommon/common.proto=$GO_COMMON_PKG" \
          "$proto_file"
    fi
done

# Generate Go code for v1 proto files
echo "📦 Generating v1 proto files..."

# Get all v1 proto files for mapping
V1_PROTO_FILES=()
for proto_file in "$PROTO_DIR/v1"/*.proto; do
    if [ -f "$proto_file" ]; then
        V1_PROTO_FILES+=("$(basename "$proto_file")")
    fi
done

# Generate each v1 proto file with proper mappings
for proto_file in "$PROTO_DIR/v1"/*.proto; do
    if [ -f "$proto_file" ]; then
        filename=$(basename "$proto_file")
        echo "  Processing: $filename"
        
        # Build dynamic -M flags for all v1 imports
        M_FLAGS="--go_opt=Mcommon/common.proto=$GO_COMMON_PKG --go_opt=Mgoogle/api/annotations.proto=$GO_GOOGLE_API_PKG --go_opt=Mgoogle/api/http.proto=$GO_GOOGLE_API_PKG"
        M_GRPC_FLAGS="--go-grpc_opt=Mcommon/common.proto=$GO_COMMON_PKG --go-grpc_opt=Mgoogle/api/annotations.proto=$GO_GOOGLE_API_PKG --go-grpc_opt=Mgoogle/api/http.proto=$GO_GOOGLE_API_PKG"
        M_GW_FLAGS="--grpc-gateway_opt=Mcommon/common.proto=$GO_COMMON_PKG --grpc-gateway_opt=Mgoogle/api/annotations.proto=$GO_GOOGLE_API_PKG --grpc-gateway_opt=Mgoogle/api/http.proto=$GO_GOOGLE_API_PKG"
        
        # Add mapping for all other v1 files
        for v1_file in "${V1_PROTO_FILES[@]}"; do
            M_FLAGS="$M_FLAGS --go_opt=Mv1/$v1_file=$GO_V1_PKG"
            M_GRPC_FLAGS="$M_GRPC_FLAGS --go-grpc_opt=Mv1/$v1_file=$GO_V1_PKG"
            M_GW_FLAGS="$M_GW_FLAGS --grpc-gateway_opt=Mv1/$v1_file=$GO_V1_PKG"
        done
        
        # Run protoc with all mappings
        protoc \
          -I "$PROTO_DIR" \
          --go_out="$BACKEND_OUT" --go_opt=paths=source_relative $M_FLAGS \
          --go-grpc_out="$BACKEND_OUT" --go-grpc_opt=paths=source_relative $M_GRPC_FLAGS \
          --grpc-gateway_out="$BACKEND_OUT" --grpc-gateway_opt=paths=source_relative $M_GW_FLAGS \
          "$proto_file"
    fi
done

echo "✅ Go protobuf code generated successfully!"

# Verify output
echo "📋 Generated files:"
find "$BACKEND_OUT" -name "*.pb.go" -type f | wc -l

