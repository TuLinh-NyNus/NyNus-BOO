# ✅ Installation & Setup Checklist

Complete checklist để setup và chạy NyNus Exam Bank Mobile App.

---

## 📦 Part 1: Install Prerequisites

### ✅ Task 1.1: Install Flutter SDK

- [ ] Download Flutter SDK from https://flutter.dev/docs/get-started/install
- [ ] Extract to appropriate location:
  - Windows: `C:\flutter`
  - Mac: `~/development/flutter`
  - Linux: `~/flutter`
- [ ] Add to PATH:
  - Windows: Add `C:\flutter\bin` to System PATH
  - Mac/Linux: Add to `.bashrc` or `.zshrc`
- [ ] Restart terminal/IDE
- [ ] Verify: `flutter --version`
- [ ] Run: `flutter doctor -v`
- [ ] Fix any issues shown by flutter doctor

### ✅ Task 1.2: Install Dart Protoc Plugin

- [ ] Run: `dart pub global activate protoc_plugin`
- [ ] Add Dart pub global bin to PATH:
  - Windows: `%USERPROFILE%\AppData\Local\Pub\Cache\bin`
  - Mac/Linux: `~/.pub-cache/bin`
- [ ] Restart terminal
- [ ] Verify: `protoc-gen-dart --version` (or `where protoc-gen-dart`)

### ✅ Task 1.3: Verify Protoc

- [ ] Already installed ✅ at: `C:\Users\tu120\AppData\Local\Microsoft\WinGet\Packages\Google.Protobuf_Microsoft.Winget.Source_8wekyb3d8bbwe\bin\protoc.exe`
- [ ] Verify: `protoc --version`
- [ ] Should show: libprotoc 3.x.x or higher

---

## 🔨 Part 2: Setup Project

### ✅ Task 2.1: Install Flutter Dependencies

```bash
cd apps/mobile
flutter pub get
```

Expected: ~40 dependencies installed

### ✅ Task 2.2: Verify Project Structure

- [ ] Confirm `packages/proto/v1/` exists
- [ ] Confirm 18 proto files present
- [ ] Confirm `scripts/generate_proto.ps1` exists

---

## 🎯 Part 3: Generate Proto Files

### ✅ Task 3.1: Run Proto Generation

**Windows:**
```powershell
cd apps\mobile
.\scripts\generate_proto.ps1
```

**Expected output:**
```
========================================
Protocol Buffer Generation for Dart
========================================
Found 18 proto files

Generating code for auth.proto...
  ✓ Success
...
Generated 72 Dart files
✓ All done!
```

### ✅ Task 3.2: Verify Generation

- [ ] Check `lib/generated/proto/v1/` exists
- [ ] Count files: Should have 60-80 `.dart` files
- [ ] Check for `.pb.dart`, `.pbgrpc.dart`, `.pbenum.dart`, `.pbjson.dart` files
- [ ] No error messages in generation output

---

## 📝 Part 4: Uncomment Service Code

### ✅ Task 4.1: Core Service Clients (5 files)

- [ ] `lib/core/network/clients/user_service_client.dart`
  - Uncomment import
  - Remove placeholder class
  - Uncomment full implementation
  
- [ ] `lib/core/network/clients/question_service_client.dart`
  - Same as above
  
- [ ] `lib/core/network/clients/exam_service_client.dart`
  - Same as above
  
- [ ] `lib/core/network/clients/library_service_client.dart`
  - Same as above
  
- [ ] `lib/core/network/clients/analytics_service_client.dart`
  - Same as above

### ✅ Task 4.2: Auth Module (2 files)

- [ ] `lib/features/auth/data/datasources/auth_remote_datasource.dart`
  - Uncomment proto import
  - Uncomment client initialization
  - Uncomment all method implementations
  
- [ ] `lib/features/auth/data/models/user_model.dart`
  - Uncomment proto import
  - Uncomment `fromProto()` factory
  - Uncomment `toProto()` method
  - Uncomment mapping functions

### ✅ Task 4.3: Questions Module (2 files)

- [ ] `lib/features/questions/data/datasources/question_remote_datasource.dart`
- [ ] `lib/features/questions/data/models/question_model.dart`

### ✅ Task 4.4: Exams Module (2 files)

- [ ] `lib/features/exams/data/datasources/exam_remote_datasource.dart`
- [ ] `lib/features/exams/data/models/exam_model.dart`

### ✅ Task 4.5: Library Module (1 file)

- [ ] `lib/features/library/data/datasources/library_remote_datasource.dart`

### ✅ Task 4.6: Theory Module (1 file)

- [ ] `lib/features/theory/data/datasources/theory_remote_datasource.dart`

**Total**: 13 files to uncomment

---

## 🧪 Part 5: Testing & Verification

### ✅ Task 5.1: Code Analysis

```bash
flutter analyze
```

Expected: No errors, maybe some warnings

### ✅ Task 5.2: Run Tests

```bash
flutter test
```

Expected: Tests pass (some may be skipped if backend not running)

### ✅ Task 5.3: Build Check

```bash
flutter build apk --debug --flavor development
```

Expected: Build succeeds

---

## 🚀 Part 6: Run Application

### ✅ Task 6.1: Start App

```bash
flutter run --flavor development --dart-define=ENVIRONMENT=development
```

### ✅ Task 6.2: Verify Features

- [ ] App starts without crashes
- [ ] Login screen appears
- [ ] Can navigate between tabs
- [ ] Can view questions (if backend running)
- [ ] Can take exams (if backend running)
- [ ] Offline mode works
- [ ] Settings save correctly

---

## 🔥 Part 7: Optional - Firebase Setup

### ✅ Task 7.1: Firebase Project

- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Add Android app
- [ ] Download `google-services.json`
- [ ] Place in `android/app/`
- [ ] Add iOS app
- [ ] Download `GoogleService-Info.plist`
- [ ] Place in `ios/Runner/`

### ✅ Task 7.2: Enable Firebase Services

- [ ] Enable Authentication
- [ ] Enable Cloud Messaging
- [ ] Enable Analytics
- [ ] Enable Crashlytics
- [ ] Enable Performance Monitoring
- [ ] Enable Remote Config

---

## 🎯 Final Verification

### All Green Checkmarks ✅

- [ ] Flutter SDK installed and in PATH
- [ ] protoc-gen-dart installed and in PATH
- [ ] Flutter dependencies installed
- [ ] Proto files generated (60-80 files)
- [ ] Service code uncommented (13 files)
- [ ] Code analysis passes
- [ ] Tests run successfully
- [ ] App builds without errors
- [ ] App runs on emulator/device

---

## 📊 Progress Tracking

**Current Status**: 
- Code: ✅ 100% Complete (204 files)
- Proto Generation: ⏳ Awaiting Flutter SDK
- Service Activation: ⏳ After proto generation
- Testing: ⏳ After service activation
- Deployment: ⏳ After testing

**Next Milestone**: Install Flutter SDK

---

## 💡 Quick Commands Reference

```bash
# After Flutter SDK is installed:

# 1. Install dependencies
cd apps/mobile
flutter pub get

# 2. Generate proto files
.\scripts\generate_proto.ps1  # Windows
./scripts/generate_proto.sh   # Unix/Mac

# 3. Verify generation
ls lib/generated/proto/v1/    # Unix/Mac
dir lib\generated\proto\v1\   # Windows

# 4. Uncomment code (manual - use this guide)

# 5. Run code generation
flutter pub run build_runner build --delete-conflicting-outputs

# 6. Analyze
flutter analyze

# 7. Test
flutter test

# 8. Run
flutter run
```

---

**Use this checklist to track your progress through setup!**

Mark each task with [x] as you complete it.

**Last Updated**: October 27, 2025

