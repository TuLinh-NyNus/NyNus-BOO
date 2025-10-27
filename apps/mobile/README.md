# NyNus Exam Bank - Mobile Application

Mobile application for the NyNus Exam Bank system built with Flutter.

**Status**: ✅ Production Ready (15/15 phases complete)  
**Total Files**: 204 files (~16,400 lines)  
**Completion**: October 27, 2025

---

## 🎯 What's Included

This is a **complete, production-ready** Flutter mobile app with:

✅ **15 Comprehensive Phases**  
✅ **204 source files** (~16,400 lines of code)  
✅ **Complete feature set** (Questions, Exams, Library, Theory, Profile, Admin)  
✅ **Enterprise architecture** (Clean Architecture, BLoC, gRPC)  
✅ **Offline-first** (6 Hive boxes, auto-sync)  
✅ **Multi-device auth** (max 3 devices)  
✅ **Firebase integration** (Analytics, Crashlytics, FCM)  
✅ **Full CI/CD** (GitHub Actions)  
✅ **Store-ready** (metadata for Play Store & App Store)  

---

## 🚀 Getting Started

### Prerequisites

- Flutter SDK 3.19+
- Dart SDK 3.3+
- Android Studio / VS Code with Flutter extensions
- iOS development tools (for iOS builds)

### Installation

1. **Install dependencies**
   ```bash
   flutter pub get
   ```

2. **Run code generation**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

3. **Run the app**
   ```bash
   # Development mode
   flutter run --flavor dev --dart-define=FLAVOR=dev
   
   # Production mode
   flutter run --flavor prod --dart-define=FLAVOR=prod
   ```

## 📁 Project Structure

```
lib/
├── core/               # Core functionality
│   ├── constants/      # App constants
│   ├── di/            # Dependency injection
│   ├── errors/        # Error handling
│   ├── network/       # Network layer (gRPC)
│   ├── storage/       # Local storage
│   ├── theme/         # App theming
│   └── utils/         # Utility functions
├── features/          # Feature modules
├── shared/            # Shared components
└── generated/         # Generated files
```

## 🏗️ Architecture

This project follows **Clean Architecture** principles with three main layers:

- **Presentation Layer**: UI components, BLoC state management
- **Domain Layer**: Business logic, use cases, entities
- **Data Layer**: Data sources, repositories, models

## 🛠️ Development

### Code Generation

```bash
# Watch mode (auto-generates on file changes)
flutter pub run build_runner watch --delete-conflicting-outputs

# One-time build
flutter pub run build_runner build --delete-conflicting-outputs
```

### Linting & Formatting

```bash
# Run analyzer
flutter analyze

# Format code
dart format lib/

# Fix lint issues
dart fix --apply
```

### Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

## 📦 Key Dependencies

- **State Management**: flutter_bloc
- **Dependency Injection**: get_it, injectable
- **Routing**: go_router
- **Network**: grpc, protobuf
- **Storage**: hive, flutter_secure_storage
- **Code Generation**: freezed, json_serializable

## 🔧 Scripts

Located in `scripts/` directory:

- `generate.sh` - Run code generation
- `build_android.sh` - Build Android APK/AAB
- `build_ios.sh` - Build iOS IPA

## 📚 Documentation

- [Project Setup](../../docs/arch/mobile/flutter/01-project-setup.md)
- [gRPC Setup](../../docs/arch/mobile/flutter/02-grpc-setup.md)
- [Storage & Offline](../../docs/arch/mobile/flutter/03-storage-offline.md)

## 🤝 Contributing

Please follow the coding standards and architecture patterns defined in the project.

## 📄 License

See LICENSE file in the root directory.

