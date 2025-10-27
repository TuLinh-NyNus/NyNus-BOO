#!/bin/bash

# Code generation script for Flutter project

echo "🔄 Running code generation..."

# Clean previous builds
flutter clean

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Run build_runner
echo "🏗️ Running build_runner..."
flutter pub run build_runner build --delete-conflicting-outputs

echo "✅ Code generation complete!"

