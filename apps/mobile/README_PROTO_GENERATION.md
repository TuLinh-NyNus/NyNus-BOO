# 📝 Proto File Generation Guide

Quick guide for generating Dart code from Protocol Buffer files.

---

## 📋 Prerequisites

### 1. Install Protocol Buffer Compiler

**macOS:**
```bash
brew install protobuf
```

**Windows:**
1. Download from https://github.com/protocolbuffers/protobuf/releases
2. Extract `protoc.exe` to a folder
3. Add folder to PATH

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y protobuf-compiler
```

**Verify:**
```bash
protoc --version
# Should show: libprotoc 3.x.x or higher
```

### 2. Install Dart Protoc Plugin

```bash
# Install globally
dart pub global activate protoc_plugin
```

**Add to PATH:**

**Windows:**
Add to PATH: `%USERPROFILE%\AppData\Local\Pub\Cache\bin`

**Unix/Mac:**
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

### Windows (PowerShell)

```powershell
cd apps\mobile
.\scripts\generate_proto.ps1
```

### Unix/Mac

```bash
cd apps/mobile
chmod +x scripts/generate_proto.sh
./scripts/generate_proto.sh
```

---

## ✅ Expected Output

```
========================================
Protocol Buffer Generation for Dart
========================================
Protoc version: libprotoc 3.21.12
Output directory: lib/generated/proto

Cleaning old generated files...
Found 15 proto files

Generating code for auth.proto...
  ✓ Success
Generating code for user.proto...
  ✓ Success
Generating code for question.proto...
  ✓ Success
...

========================================
Generation Summary:
  Success: 15
  Failed:  0
========================================
Generated 60 Dart files

Formatting generated code...
✓ Code formatted

✓ All done!
========================================
```

---

## 📁 Generated Files

After generation, you'll have:

```
lib/generated/proto/
└── v1/
    ├── auth.pb.dart           # Message classes
    ├── auth.pbenum.dart       # Enums
    ├── auth.pbgrpc.dart       # gRPC service clients
    ├── auth.pbjson.dart       # JSON serialization
    ├── user.pb.dart
    ├── user.pbenum.dart
    ├── user.pbgrpc.dart
    ├── user.pbjson.dart
    ├── question.pb.dart
    ├── question.pbgrpc.dart
    └── ... (60+ files total)
```

---

## 🔧 After Generation

### 1. Verify Generation

```bash
ls -la lib/generated/proto/v1/  # Unix/Mac
dir lib\generated\proto\v1\     # Windows

# Should see many *.pb.dart, *.pbgrpc.dart files
```

### 2. Uncomment Service Implementations

Open these files and uncomment the actual implementations:
- `lib/core/network/clients/user_service_client.dart`
- `lib/core/network/clients/question_service_client.dart`
- `lib/core/network/clients/exam_service_client.dart`
- `lib/core/network/clients/library_service_client.dart`
- `lib/core/network/clients/analytics_service_client.dart`

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

## 🐛 Troubleshooting

### Error: protoc not found

**Solution:**
- Install protoc (see Prerequisites)
- Add to PATH
- Restart terminal

### Error: protoc-gen-dart not found

**Solution:**
```bash
dart pub global activate protoc_plugin
export PATH="$PATH:$HOME/.pub-cache/bin"  # Unix/Mac
# Or add to PATH on Windows
```

### Error: Cannot find proto files

**Solution:**
- Check that `../../packages/proto/v1/` exists
- Verify proto files are in the correct location
- Run from `apps/mobile/` directory

### Error: Permission denied (Unix/Mac)

**Solution:**
```bash
chmod +x scripts/generate_proto.sh
```

### Generated files have errors

**Solution:**
```bash
# Clean and regenerate
rm -rf lib/generated/proto
./scripts/generate_proto.sh

# Then
flutter pub get
flutter analyze
```

---

## 📝 Manual Generation

If scripts don't work, generate manually:

```bash
cd apps/mobile

# Create output directory
mkdir -p lib/generated/proto

# Generate for each proto file
protoc \
  --dart_out=grpc:lib/generated/proto \
  --proto_path=../../packages/proto \
  --proto_path=../../packages \
  v1/auth.proto

protoc \
  --dart_out=grpc:lib/generated/proto \
  --proto_path=../../packages/proto \
  --proto_path=../../packages \
  v1/user.proto

# ... repeat for all proto files

# Format generated code
dart format lib/generated/proto
```

---

## 🔄 Re-generation

When proto files are updated:

1. Run the generation script again
2. No need to clean first (script does it)
3. Check git diff to see what changed
4. Update service clients if method signatures changed
5. Run tests

```bash
./scripts/generate_proto.sh  # or .ps1
flutter test
```

---

## 📦 CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example: GitHub Actions
- name: Install protoc
  run: |
    sudo apt-get update
    sudo apt-get install -y protobuf-compiler
    
- name: Install protoc-gen-dart
  run: dart pub global activate protoc_plugin
  
- name: Generate proto files
  run: |
    cd apps/mobile
    ./scripts/generate_proto.sh
    
- name: Verify generation
  run: |
    cd apps/mobile
    flutter analyze
    flutter test
```

---

## 💡 Tips

1. **Git ignore**: Generated files are gitignored (`*.g.dart`, `*.freezed.dart`)
2. **Generate on change**: Run generation whenever proto files update
3. **Check errors**: Always run `flutter analyze` after generation
4. **Format code**: Scripts auto-format, but you can run `dart format` manually
5. **Test after**: Run tests to ensure nothing broke

---

## 📚 Resources

- [Protocol Buffers Docs](https://developers.google.com/protocol-buffers)
- [gRPC Dart](https://grpc.io/docs/languages/dart/)
- [protoc-gen-dart](https://pub.dev/packages/protoc_plugin)

---

**Last Updated**: October 27, 2025

