# 🔧 Service Implementation Uncomment Guide

**Purpose**: After proto generation, uncomment service implementations  
**Estimated Time**: 10-15 minutes

---

## 📋 Files to Update (13 files)

### 1. Core Service Clients (5 files)

#### File: `lib/core/network/clients/user_service_client.dart`
**Line**: ~3-4
**Action**: 
1. Uncomment: `import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';`
2. Remove entire placeholder class at bottom
3. Uncomment the full `UserServiceClientWrapper` class (~80 lines)

**Look for**:
```dart
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';

/// Wrapper for UserService gRPC client
/// 
/// This will be uncommented after proto files are generated:
/// 
/// class UserServiceClientWrapper extends BaseServiceClient<UserServiceClient> {
```

**Result**: Active service client với methods like `login()`, `register()`, `getCurrentUser()`

---

#### File: `lib/core/network/clients/question_service_client.dart`
**Action**: Same pattern - uncomment imports and class implementations

#### File: `lib/core/network/clients/exam_service_client.dart`
**Action**: Same pattern

#### File: `lib/core/network/clients/library_service_client.dart`
**Action**: Same pattern

#### File: `lib/core/network/clients/analytics_service_client.dart`
**Action**: Same pattern

---

### 2. Auth Module (2 files)

#### File: `lib/features/auth/data/datasources/auth_remote_datasource.dart`
**Lines**: ~3-5, ~40-120
**Action**:
1. Uncomment proto import
2. Uncomment client initialization in constructor
3. Uncomment all method implementations

**Look for**:
```dart
// Note: Import will be available after proto generation
// import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  // Uncomment after proto generation
  // late final UserServiceClient _client;
  
  AuthRemoteDataSourceImpl() {
    // _client = UserServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<dynamic> login({
    required String email,
    required String password,
  }) async {
    // Uncomment after proto generation
    // final request = LoginRequest()
    //   ..email = email
    //   ..password = password;
```

**Result**: Active gRPC calls to backend

---

#### File: `lib/features/auth/data/models/user_model.dart`
**Lines**: ~3-4, ~30-100
**Action**:
1. Uncomment proto import
2. Uncomment `fromProto()` factory
3. Uncomment `toProto()` method
4. Uncomment mapping methods

---

### 3. Questions Module (2 files)

#### File: `lib/features/questions/data/datasources/question_remote_datasource.dart`
**Action**: Uncomment proto imports and implementations

#### File: `lib/features/questions/data/models/question_model.dart`
**Action**: Uncomment proto mappings

---

### 4. Exams Module (2 files)

#### File: `lib/features/exams/data/datasources/exam_remote_datasource.dart`
**Action**: Uncomment proto imports and implementations

#### File: `lib/features/exams/data/models/exam_model.dart`
**Action**: Uncomment proto mappings

---

### 5. Library Module (1 file)

#### File: `lib/features/library/data/datasources/library_remote_datasource.dart`
**Action**: Uncomment proto imports and implementations

---

### 6. Theory Module (1 file)

#### File: `lib/features/theory/data/datasources/theory_remote_datasource.dart`
**Action**: Uncomment proto imports and implementations

---

## 🔍 Search Pattern

Use your IDE's search feature to find all occurrences of:

1. **Find**: `// Note: Import will be available after proto generation`
2. **Find**: `// Uncomment after proto generation`
3. **Find**: `// This will be uncommented after proto files are generated`
4. **Find**: `throw UnimplementedError('Proto files not generated yet');`

---

## ✅ Verification After Uncommenting

### 1. Check Imports
All proto imports should work:
```dart
import 'package:mobile/generated/proto/v1/user.pbgrpc.dart';
import 'package:mobile/generated/proto/v1/question.pbgrpc.dart';
import 'package:mobile/generated/proto/v1/exam.pbgrpc.dart';
// etc.
```

### 2. Run Analyzer
```bash
flutter analyze
```

Should show no errors related to missing proto files.

### 3. Run Tests
```bash
flutter test
```

Should pass (or show actual logic errors, not import errors).

---

## 📝 Common Issues

### Issue: Import errors after uncommenting
**Solution**: Make sure proto files were generated successfully in `lib/generated/proto/v1/`

### Issue: Method signature doesn't match
**Solution**: Proto definitions may have changed. Check generated `.pbgrpc.dart` files for correct signatures.

### Issue: Enum mapping errors
**Solution**: Check generated `.pbenum.dart` files for correct enum names.

---

## 🎯 Quick Checklist

After uncommenting all code:

- [ ] All imports working (no red underlines)
- [ ] No `UnimplementedError` exceptions remaining in data sources
- [ ] All service clients have active implementations
- [ ] All models have `fromProto()` and `toProto()` methods
- [ ] `flutter analyze` passes
- [ ] `flutter test` runs
- [ ] App compiles: `flutter run`

---

## 📊 Expected Changes

**Files Modified**: 13  
**Lines Uncommented**: ~1,500 lines  
**Placeholders Removed**: ~13 placeholder implementations  
**Active Services**: 5 gRPC service clients  
**Proto Messages**: 50+ message types available  

---

**After completing these steps, your app will be fully functional with backend integration!** 🚀

**Last Updated**: October 27, 2025

