# 01. Project Setup & Structure

**Phase**: 1 - Foundation  
**Duration**: 2-3 ngày  
**Prerequisites**: Flutter SDK 3.19+, Dart 3.3+, Android Studio/VS Code

---

## 🎯 Objectives

- ✅ Setup Flutter project với clean architecture
- ✅ Configure development environment
- ✅ Implement folder structure theo feature-first
- ✅ Setup code generation tools
- ✅ Configure linting và formatting

---

## 📋 Tasks Checklist

### 1. Flutter Project Initialization ✅

- [x] Tạo Flutter project mới
  ```bash
  cd apps/
  flutter create mobile --org com.nynus.exambank
cd mobile
```

- [x] Update `pubspec.yaml` với dependencies cần thiết
- [x] Configure Flutter version constraints
- [x] Setup asset management
- [x] Configure fonts và images

### 2. Folder Structure Setup ✅

- [x] Tạo folder structure theo clean architecture:
  ```
  lib/
  ├── core/
  │   ├── constants/
  │   ├── errors/
  │   ├── network/
  │   ├── storage/
  │   ├── theme/
  │   └── utils/
  ├── features/
  ├── shared/
  └── generated/
  ```

- [x] Tạo barrel files (index.dart) cho mỗi module
- [x] Setup assets folder structure
- [x] Tạo test folder structure

### 3. Development Tools Setup ✅

- [x] Configure analysis_options.yaml với strict rules
- [x] Setup code formatting (dart format)
- [x] Configure import sorting
- [x] Setup VSCode/Android Studio launch configs
- [x] Add useful VSCode extensions recommendations

### 4. Code Generation Setup ✅

- [x] Add build_runner dependency
- [x] Configure freezed cho immutable models
- [x] Setup json_serializable
- [x] Configure injectable for DI
- [x] Add generation scripts to scripts folder

---

## 📦 Dependencies

### Core Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_bloc: ^8.1.3
  bloc: ^8.1.2
  equatable: ^2.0.5
  
  # Dependency Injection
  get_it: ^7.6.4
  injectable: ^2.3.2
  
  # Routing
  go_router: ^13.0.0
  
  # Network
  grpc: ^3.2.4
  protobuf: ^3.1.0
  
  # Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2
  
  # Utils
  dartz: ^0.10.1
  intl: ^0.18.1
  logger: ^2.0.2+1
  
  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Code Generation
  build_runner: ^2.4.6
  freezed: ^2.4.5
  json_serializable: ^6.7.1
  injectable_generator: ^2.4.0
  hive_generator: ^2.0.1
  
  # Testing
  mockito: ^5.4.3
  bloc_test: ^9.1.5
  
  # Linting
  flutter_lints: ^3.0.1
```

---

## 🏗️ Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Widgets, BLoC, ViewModels)       │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│          Domain Layer               │
│  (Entities, Use Cases, Repos)      │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│           Data Layer                │
│  (Models, Data Sources, Repos)     │
└─────────────────────────────────────┘
```

### Feature Structure Example

```
features/auth/
├── data/
│   ├── models/          # Data models (JSON/Proto)
│   ├── datasources/     # Remote & local data sources
│   └── repositories/    # Repository implementations
├── domain/
│   ├── entities/        # Business entities
│   ├── repositories/    # Repository contracts
│   └── usecases/        # Business logic
└── presentation/
    ├── bloc/            # BLoC files
    ├── pages/           # Screen widgets
    └── widgets/         # Feature-specific widgets
```

---

## 🔧 Configuration Files

### 1. analysis_options.yaml

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "**/generated/**"
  
  errors:
    invalid_annotation_target: ignore
  
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    - always_declare_return_types
    - always_use_package_imports
    - avoid_print
    - avoid_relative_lib_imports
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_final_locals
    - require_trailing_commas
    - sort_child_properties_last
    - unawaited_futures
    - use_key_in_widget_constructors
```

### 2. launch.json (VSCode)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Dev - Android",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["--flavor", "dev", "--dart-define=FLAVOR=dev"]
    },
    {
      "name": "Dev - iOS",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["--flavor", "dev", "--dart-define=FLAVOR=dev"]
    },
    {
      "name": "Prod - Android",
      "request": "launch",
      "type": "dart",
      "program": "lib/main.dart",
      "args": ["--flavor", "prod", "--dart-define=FLAVOR=prod"]
    }
  ]
}
```

---

## 🎨 Theme Setup

### 1. Core Theme Structure

```dart
// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF6750A4),
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF6750A4),
      brightness: Brightness.dark,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );
}
```

### 2. App Colors

```dart
// lib/core/theme/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary
  static const Color primary = Color(0xFF6750A4);
  static const Color primaryContainer = Color(0xFFEADDFF);
  
  // Secondary
  static const Color secondary = Color(0xFF625B71);
  static const Color secondaryContainer = Color(0xFFE8DEF8);
  
  // Error
  static const Color error = Color(0xFFB3261E);
  static const Color errorContainer = Color(0xFFF9DEDC);
  
  // Success
  static const Color success = Color(0xFF198754);
  
  // Warning
  static const Color warning = Color(0xFFFFC107);
  
  // Neutral
  static const Color surface = Color(0xFFFFFBFE);
  static const Color onSurface = Color(0xFF1C1B1F);
}
```

---

## 📝 Constants Setup

### 1. API Constants

```dart
// lib/core/constants/api_constants.dart
class ApiConstants {
  // gRPC Server
  static const String grpcHost = String.fromEnvironment(
    'GRPC_HOST',
    defaultValue: 'localhost',
  );
  
  static const int grpcPort = int.fromEnvironment(
    'GRPC_PORT',
    defaultValue: 50051,
  );
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration requestTimeout = Duration(seconds: 60);
  
  // Retry
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 2);
}
```

### 2. Storage Constants

```dart
// lib/core/constants/storage_constants.dart
class StorageConstants {
  // Hive Boxes
  static const String userBox = 'user_box';
  static const String questionsBox = 'questions_box';
  static const String examsBox = 'exams_box';
  static const String cacheBox = 'cache_box';
  
  // Secure Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  
  // SharedPreferences Keys
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language';
  static const String firstRunKey = 'first_run';
}
```

---

## 🚀 Entry Point Setup

### main.dart

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/di/injection.dart';
import 'core/theme/app_theme.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Initialize DI
  await configureDependencies();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NyNus Exam Bank',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const Scaffold(
        body: Center(
          child: Text('Flutter App Setup Complete!'),
        ),
      ),
    );
  }
}
```

---

## ✅ Verification Steps

1. **Run Flutter Doctor**
   ```bash
   flutter doctor -v
   ```

2. **Check Dependencies**
   ```bash
   flutter pub get
   flutter pub outdated
   ```

3. **Run Code Generation**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Run Analyzer**
   ```bash
   flutter analyze
   ```

5. **Format Code**
   ```bash
   dart format lib/
   ```

6. **Run App**
   ```bash
   flutter run
   ```

---

## 📚 Next Steps

After completing this setup:
1. ✅ Move to [02-grpc-setup.md](02-grpc-setup.md) for gRPC integration
2. Read [architecture.md](architecture.md) for detailed architecture guide
3. Review [style-guide.md](style-guide.md) for coding standards

---

## 🐛 Common Issues

### Issue: Flutter SDK version mismatch
**Solution**: Update Flutter SDK
```bash
flutter upgrade
```

### Issue: Pub get fails
**Solution**: Clear cache
```bash
flutter pub cache repair
flutter clean
flutter pub get
```

### Issue: Build runner errors
**Solution**: Delete generated files
```bash
flutter pub run build_runner clean
flutter pub run build_runner build --delete-conflicting-outputs
```

---

**Status**: ✅ Completed - Implementation Done  
**Last Updated**: October 27, 2025  
**Next**: [02-grpc-setup.md](02-grpc-setup.md)

---

## 📝 Implementation Notes

### Completed Tasks Summary

1. **Project Structure** ✅
   - Created Flutter mobile app in `apps/mobile/`
   - Implemented clean architecture folder structure
   - Setup all core directories: constants, errors, network, storage, theme, utils, di

2. **Configuration Files** ✅
   - `pubspec.yaml` - All dependencies configured
   - `analysis_options.yaml` - Strict linting rules enabled
   - `.vscode/launch.json` - Dev and prod launch configurations
   - `.vscode/extensions.json` - Recommended extensions
   - `.gitignore` - Properly configured for Flutter

3. **Core Implementation** ✅
   - **Theme System**: `app_theme.dart`, `app_colors.dart` with Material 3
   - **Constants**: API and Storage constants
   - **Error Handling**: Custom failures and exceptions
   - **DI Setup**: Injectable/GetIt configuration
   - **Logging**: AppLogger utility with pretty printing
   - **Barrel Files**: Created for all core modules

4. **Entry Point** ✅
   - `main.dart` - Complete app initialization with Hive and DI
   - Sample HomePage with Material 3 design
   - Widget test included

5. **Additional Files** ✅
   - `README.md` - Comprehensive documentation
   - `scripts/generate.sh` & `generate.ps1` - Code generation scripts
   - `.metadata` - Flutter project metadata
   - Test structure setup

### Project Structure Created

```
apps/mobile/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart
│   │   │   ├── storage_constants.dart
│   │   │   └── constants.dart (barrel)
│   │   ├── errors/
│   │   │   ├── exceptions.dart
│   │   │   ├── failures.dart
│   │   │   └── errors.dart (barrel)
│   │   ├── di/
│   │   │   ├── injection.dart
│   │   │   ├── injection.config.dart
│   │   │   └── di.dart (barrel)
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── app_colors.dart
│   │   │   └── theme.dart (barrel)
│   │   └── utils/
│   │       ├── logger.dart
│   │       └── utils.dart (barrel)
│   ├── features/ (ready for feature modules)
│   ├── shared/ (ready for shared components)
│   ├── generated/ (for code generation)
│   └── main.dart
├── test/
│   └── widget_test.dart
├── assets/
│   └── .gitkeep
├── scripts/
│   ├── generate.sh
│   └── generate.ps1
├── .vscode/
│   ├── launch.json
│   └── extensions.json
├── pubspec.yaml
├── analysis_options.yaml
├── .gitignore
├── .metadata
└── README.md
```

### Next Steps

To continue development:
1. Run `flutter pub get` to install dependencies
2. Run `flutter pub run build_runner build --delete-conflicting-outputs` for code generation
3. Proceed to [02-grpc-setup.md](02-grpc-setup.md) for gRPC integration
