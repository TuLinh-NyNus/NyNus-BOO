#!/bin/bash

# Build Script

set -e

echo "🔨 Building applications..."

# Build backend
echo "📦 Building backend..."
cd apps/backend
go build -o bin/server cmd/main.go
cd ../..

# Build frontend
echo "🌐 Building frontend..."
cd apps/frontend
if [ -f "package.json" ]; then
    npm run build
fi
cd ../..

echo "✅ Build completed!"
