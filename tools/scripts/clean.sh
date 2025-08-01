#!/bin/bash

# Clean Script

echo "🧹 Cleaning build artifacts..."

# Clean backend
rm -rf apps/backend/bin/
rm -rf apps/backend/internal/proto/

# Clean frontend
rm -rf apps/frontend/build/
rm -rf apps/frontend/dist/
rm -rf apps/frontend/src/generated/

# Clean docs
rm -rf docs/api/*.json

echo "✅ Clean completed!"
