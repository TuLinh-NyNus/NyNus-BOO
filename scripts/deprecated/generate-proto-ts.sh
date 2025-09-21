#!/bin/bash

# Generate TypeScript protobuf files
echo "Generating TypeScript protobuf files..."

PROTO_DIR="packages/proto"
OUT_DIR="apps/frontend/src/generated"

# Create output directory
mkdir -p $OUT_DIR

# Install required packages if not installed
if ! command -v protoc &> /dev/null; then
    echo "protoc is not installed. Please install protoc first."
    exit 1
fi

# Generate TypeScript files using protoc with grpc-web plugin
protoc \
  --proto_path=$PROTO_DIR \
  --js_out=import_style=commonjs,binary:$OUT_DIR \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR \
  $PROTO_DIR/common/*.proto \
  $PROTO_DIR/v1/*.proto

echo "TypeScript protobuf files generated in $OUT_DIR"