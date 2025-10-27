#!/bin/bash

set -e

# Configuration
FLAVOR=${1:-production}
PLATFORM=${2:-both}

echo "🚀 Building NyNus Exam Bank - Flavor: $FLAVOR, Platform: $PLATFORM"

# Clean
echo "🧹 Cleaning..."
flutter clean
flutter pub get

# Generate code
echo "⚙️ Generating code..."
if [ -f "./scripts/generate_proto.sh" ]; then
    chmod +x ./scripts/generate_proto.sh
    ./scripts/generate_proto.sh
fi

flutter pub run build_runner build --delete-conflicting-outputs

# Run tests
echo "🧪 Running tests..."
flutter test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

# Build Android
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
    echo "📱 Building Android App Bundle..."
    
    flutter build appbundle \
        --flavor $FLAVOR \
        --release \
        --dart-define=ENVIRONMENT=$FLAVOR \
        --obfuscate \
        --split-debug-info=build/app/outputs/symbols
    
    echo "✅ Android build complete!"
    echo "Output: build/app/outputs/bundle/${FLAVOR}Release/"
fi

# Build iOS
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
    echo "🍎 Building iOS IPA..."
    
    flutter build ipa \
        --flavor $FLAVOR \
        --release \
        --dart-define=ENVIRONMENT=$FLAVOR \
        --obfuscate \
        --split-debug-info=build/ios/outputs/symbols
    
    echo "✅ iOS build complete!"
    echo "Output: build/ios/ipa/"
fi

echo "🎉 Build complete!"

