# 📝 Proto Generation Guide - Step by Step

**Current Status**: Proto files chưa được generate  
**Action Required**: Follow steps below để generate gRPC client code

---

## ✅ Prerequisites Checklist

### 1. Install Flutter & Dart

**Check if installed:**
```bash
flutter --version
dart --version
```

**If not installed:**
- Download Flutter SDK: https://flutter.dev/docs/get-started/install
- Add to PATH:
  - Windows: `C:\flutter\bin`
  - Mac/Linux: Add to `.bashrc` or `.zshrc`

### 2. Install Protocol Buffer Compiler

**Check if installed:**
```bash
protoc --version
# Should show: libprotoc 3.x.x or higher
```

**If not installed:**

**Windows:**
```powershell
# Using winget
winget install Google.Protobuf

# Or download manually from:
# https://github.com/protocolbuffers/protobuf/releases
# Extract and add to PATH
```

**macOS:**
```bash
brew install protobuf
```

**Linux:**
```bash
sudo apt-get install protobuf-compiler
```

### 3. Install Dart Protoc Plugin

```bash
dart pub global activate protoc_plugin
```

**Add to PATH:**

**Windows:**
Add to PATH: `%USERPROFILE%\AppData\Local\Pub\Cache\bin`

**Mac/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$PATH:$HOME/.pub-cache/bin"
```

**Verify:**
```bash
which protoc-gen-dart  # Unix/Mac
where protoc-gen-dart  # Windows
```

---

## 🚀 Generate Proto Files

### Option 1: Using Script (Recommended)

**Windows:**
```powershell
cd apps/mobile
.\scripts\generate_proto.ps1
```

**Unix/Mac:**
```bash
cd apps/mobile
chmod +x scripts/generate_proto.sh
./scripts/generate_proto.sh
```

### Option 2: Manual Generation

**Windows:**
```powershell
cd apps/mobile

# Create output directory
New-Item -ItemType Directory -Path "lib\generated\proto" -Force

# Generate for each proto file
$protoFiles = Get-ChildItem -Path "..\..\packages\proto\v1" -Filter "*.proto"

foreach ($file in $protoFiles) {
    Write-Host "Generating: $($file.Name)"
    
    protoc `
        --dart_out=grpc:lib\generated\proto `
        --proto_path=..\..\packages\proto `
        --proto_path=..\..\packages `
        "v1\$($file.Name)"
}

# Format generated code
dart format lib\generated\proto
```

**Unix/Mac:**
```bash
cd apps/mobile

# Create output directory
mkdir -p lib/generated/proto

# Generate for each proto file
for proto_file in ../../packages/proto/v1/*.proto; do
    filename=$(basename "$proto_file")
    echo "Generating: $filename"
    
    protoc \
        --dart_out=grpc:lib/generated/proto \
        --proto_path=../../packages/proto \
        --proto_path=../../packages \
        v1/$filename
done

# Format generated code
dart format lib/generated/proto
```

---

## 📋 Expected Output

After successful generation, you should have:

```
lib/generated/proto/
└── v1/
    ├── auth.pb.dart
    ├── auth.pbenum.dart
    ├── auth.pbgrpc.dart
    ├── auth.pbjson.dart
    ├── user.pb.dart
    ├── user.pbenum.dart
    ├── user.pbgrpc.dart
    ├── user.pbjson.dart
    ├── question.pb.dart
    ├── question.pbgrpc.dart
    ├── exam.pb.dart
    ├── exam.pbgrpc.dart
    ├── library.pb.dart
    ├── library.pbgrpc.dart
    ├── blog.pb.dart
    ├── blog.pbgrpc.dart
    └── ... (60+ files total)
```

**File Types:**
- `.pb.dart` - Message classes
- `.pbenum.dart` - Enum definitions
- `.pbgrpc.dart` - gRPC service clients
- `.pbjson.dart` - JSON serialization

---

## 🔧 Troubleshooting

### Error: protoc not found
**Solution**: Install protoc and add to PATH (see Prerequisites)

### Error: protoc-gen-dart not found
**Solution**:
```bash
dart pub global activate protoc_plugin
# Then add to PATH: ~/.pub-cache/bin or %USERPROFILE%\AppData\Local\Pub\Cache\bin
```

### Error: Cannot find proto files
**Solution**: Make sure you're in `apps/mobile` directory and `packages/proto/v1` exists

### Error: Permission denied (Unix/Mac)
**Solution**:
```bash
chmod +x scripts/generate_proto.sh
```

### Generated files have errors
**Solution**:
```bash
# Clean and regenerate
rm -rf lib/generated/proto  # Unix/Mac
Remove-Item -Path "lib\generated\proto" -Recurse -Force  # Windows

# Then run generation again
./scripts/generate_proto.sh
```

---

## ✅ After Generation

### 1. Verify Generated Files
```bash
ls -la lib/generated/proto/v1/  # Unix/Mac
dir lib\generated\proto\v1\     # Windows

# Should see many *.pb.dart, *.pbgrpc.dart files
```

### 2. Uncomment Service Implementations

**Files to update:**

**Core Network:**
- `lib/core/network/clients/user_service_client.dart`
- `lib/core/network/clients/question_service_client.dart`
- `lib/core/network/clients/exam_service_client.dart`
- `lib/core/network/clients/library_service_client.dart`
- `lib/core/network/clients/analytics_service_client.dart`

**Auth Data Sources:**
- `lib/features/auth/data/datasources/auth_remote_datasource.dart`
- `lib/features/auth/data/models/user_model.dart`

**Questions Data Sources:**
- `lib/features/questions/data/datasources/question_remote_datasource.dart`
- `lib/features/questions/data/models/question_model.dart`

**Exams Data Sources:**
- `lib/features/exams/data/datasources/exam_remote_datasource.dart`
- `lib/features/exams/data/models/exam_model.dart`

**Library Data Sources:**
- `lib/features/library/data/datasources/library_remote_datasource.dart`

**Theory Data Sources:**
- `lib/features/theory/data/datasources/theory_remote_datasource.dart`

**Instructions:** Look for comments like:
```dart
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';

// Uncomment this after proto generation:
// class UserServiceClientWrapper extends BaseServiceClient<UserServiceClient> {
//   ...
// }
```

Remove the comments and activate the code!

### 3. Run Flutter Pub Get
```bash
flutter pub get
```

### 4. Check for Errors
```bash
flutter analyze
```

### 5. Run Tests
```bash
flutter test
```

---

## 📊 Generation Statistics

After generation, you should have approximately:
- **60-80 generated Dart files**
- **~15,000-20,000 lines** of generated code
- **All gRPC service clients** ready to use
- **All message types** available
- **All enums** defined

---

## 🎯 Next Steps After Generation

1. ✅ Uncomment all service implementations
2. ✅ Run `flutter pub get`
3. ✅ Run `flutter analyze` (fix any issues)
4. ✅ Run `flutter test`
5. ✅ Test app: `flutter run`
6. 🚀 Ready for production!

---

## 📞 Need Help?

If you encounter issues:
1. Check `README_PROTO_GENERATION.md` for detailed guide
2. Verify all prerequisites are installed
3. Make sure you're in correct directory
4. Check proto files exist in `packages/proto/v1/`

---

**Status**: Waiting for proto generation  
**Next**: Run generation script → Uncomment code → Test → Deploy!

