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

# Generate Go code for all proto files
echo "📦 Generating v1 proto files..."
for proto_file in "$PROTO_DIR/v1"/*.proto; do
    if [ -f "$proto_file" ]; then
        echo "  Processing: $(basename "$proto_file")"
        protoc \
          -I "$PROTO_DIR" \
          --go_out="$ROOT_DIR" --go_opt=paths=source_relative \
          --go-grpc_out="$ROOT_DIR" --go-grpc_opt=paths=source_relative \
          --grpc-gateway_out="$ROOT_DIR" --grpc-gateway_opt=paths=source_relative \
          "$proto_file"
    fi
done

echo "📦 Generating common proto files..."
for proto_file in "$PROTO_DIR/common"/*.proto; do
    if [ -f "$proto_file" ]; then
        echo "  Processing: $(basename "$proto_file")"
        protoc \
          -I "$PROTO_DIR" \
          --go_out="$ROOT_DIR" --go_opt=paths=source_relative \
          --go-grpc_out="$ROOT_DIR" --go-grpc_opt=paths=source_relative \
          "$proto_file"
    fi
done

echo "✅ Go protobuf code generated successfully!"

# Verify output
echo "📋 Generated files:"
find "$BACKEND_OUT" -name "*.pb.go" -type f | wc -l

