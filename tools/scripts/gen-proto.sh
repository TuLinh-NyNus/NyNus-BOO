#!/bin/bash

# Protocol Buffer Code Generation Script

set -e

echo "🔧 Generating Protocol Buffer Code..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Create output directories
mkdir -p apps/backend/internal/proto
mkdir -p apps/frontend/src/generated
mkdir -p docs/api

# Generate Go code
print_status "Generating Go gRPC code..."
protoc \
    --proto_path=packages/proto \
    --go_out=apps/backend/pkg/proto \
    --go_opt=paths=source_relative \
    --go-grpc_out=apps/backend/pkg/proto \
    --go-grpc_opt=paths=source_relative \
    --grpc-gateway_out=apps/backend/pkg/proto \
    --grpc-gateway_opt=paths=source_relative \
    --openapiv2_out=docs/api \
    packages/proto/common/common.proto \
    packages/proto/v1/user.proto \
    packages/proto/v1/profile.proto \
    packages/proto/v1/admin.proto \
    packages/proto/v1/question.proto \
    packages/proto/v1/question_filter.proto \
    packages/proto/v1/exam.proto

print_success "Go code generated"

# Generate TypeScript/JavaScript gRPC-Web code
print_status "Generating TypeScript/JavaScript gRPC-Web code..."
if command -v protoc-gen-grpc-web &> /dev/null; then
    # Generate JavaScript protobuf messages
    protoc \
        --proto_path=packages/proto \
        --js_out=import_style=commonjs:apps/frontend/src/generated \
        --grpc-web_out=import_style=commonjs,mode=grpcwebtext:apps/frontend/src/generated \
        packages/proto/common/common.proto \
        packages/proto/v1/user.proto \
        packages/proto/v1/profile.proto \
        packages/proto/v1/admin.proto \
        packages/proto/v1/question.proto \
        packages/proto/v1/question_filter.proto \
        packages/proto/v1/exam.proto
    print_success "TypeScript/JavaScript gRPC-Web code generated"
else
    echo "⚠️  protoc-gen-grpc-web not found. Skipping TypeScript/JavaScript generation."
fi

# Update Go module
cd apps/backend
go mod tidy
cd ../..

print_success "Protocol buffer code generation completed!"
