#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROTO_DIR="../../packages/proto"
OUT_DIR="lib/generated/proto"

echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Protocol Buffer Generation for Dart${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if protoc is installed
if ! command -v protoc &> /dev/null; then
    echo -e "${RED}Error: protoc is not installed${NC}"
    echo -e "Please install protoc first:"
    echo -e "  macOS:   brew install protobuf"
    echo -e "  Linux:   sudo apt-get install protobuf-compiler"
    echo -e "  Windows: Download from https://github.com/protocolbuffers/protobuf/releases"
    exit 1
fi

# Check if protoc-gen-dart is installed
if ! command -v protoc-gen-dart &> /dev/null; then
    echo -e "${RED}Error: protoc-gen-dart is not installed${NC}"
    echo -e "Please install protoc-gen-dart:"
    echo -e "  dart pub global activate protoc_plugin"
    echo -e "  export PATH=\"\$PATH:\$HOME/.pub-cache/bin\""
    exit 1
fi

echo -e "${YELLOW}Protoc version: ${NC}$(protoc --version)"
echo -e "${YELLOW}Output directory: ${NC}$OUT_DIR"
echo ""

# Clean old generated files
echo -e "${YELLOW}Cleaning old generated files...${NC}"
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

# Check if proto directory exists
if [ ! -d "$PROTO_DIR" ]; then
    echo -e "${RED}Error: Proto directory not found: $PROTO_DIR${NC}"
    exit 1
fi

# Count proto files
proto_count=$(find $PROTO_DIR/v1 -name "*.proto" 2>/dev/null | wc -l)
if [ "$proto_count" -eq 0 ]; then
    echo -e "${RED}Error: No proto files found in $PROTO_DIR/v1${NC}"
    exit 1
fi

echo -e "${GREEN}Found $proto_count proto files${NC}"
echo ""

# Generate for each proto file
success_count=0
fail_count=0

for proto_file in $PROTO_DIR/v1/*.proto; do
    filename=$(basename "$proto_file")
    echo -e "Generating code for ${GREEN}$filename${NC}..."
    
    if protoc \
        --dart_out=grpc:$OUT_DIR \
        --proto_path=$PROTO_DIR \
        --proto_path=$PROTO_DIR/.. \
        v1/$filename 2>&1; then
        ((success_count++))
        echo -e "  ${GREEN}✓ Success${NC}"
    else
        ((fail_count++))
        echo -e "  ${RED}✗ Failed${NC}"
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Generation Summary:${NC}"
echo -e "  Success: ${GREEN}$success_count${NC}"
echo -e "  Failed:  ${RED}$fail_count${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $fail_count -gt 0 ]; then
    echo -e "${RED}Some files failed to generate${NC}"
    exit 1
fi

# Count generated files
file_count=$(find $OUT_DIR -name "*.dart" 2>/dev/null | wc -l)
echo -e "Generated ${GREEN}$file_count${NC} Dart files"
echo ""

# Format generated code
echo -e "${YELLOW}Formatting generated code...${NC}"
if dart format $OUT_DIR > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Code formatted${NC}"
else
    echo -e "${YELLOW}Warning: Could not format code${NC}"
fi

echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo -e "${BLUE}========================================${NC}"

# List generated files
echo -e "${YELLOW}Generated files:${NC}"
ls -1 $OUT_DIR/v1/*.dart 2>/dev/null | head -20
file_count=$(find $OUT_DIR -name "*.dart" | wc -l)
if [ $file_count -gt 20 ]; then
    echo -e "... and $((file_count - 20)) more files"
fi

