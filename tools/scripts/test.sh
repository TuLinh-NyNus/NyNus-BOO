#!/bin/bash

# Test Script

set -e

echo "🧪 Running tests..."

# Backend tests
echo "📦 Testing backend..."
cd apps/backend
go test -v ./...
cd ../..

# Frontend tests
echo "🌐 Testing frontend..."
cd apps/frontend
if [ -f "package.json" ]; then
    npm test
fi
cd ../..

echo "✅ All tests completed!"
