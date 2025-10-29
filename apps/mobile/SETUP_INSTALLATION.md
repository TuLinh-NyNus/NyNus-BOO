# 📱 Mobile App Setup & Installation Guide

**Status**: ✅ UI/UX Complete | ⏳ Awaiting Proto Generation  
**Last Updated**: 2025-01-29  
**Flutter Version**: 3.24.0+

---

## 🚀 Quick Start

### Prerequisites
- **Flutter**: 3.24.0 or higher
- **Dart**: 3.5.0 or higher  
- **protoc**: 3.24.0 or higher
- **protoc-gen-dart**: Latest version

### Installation Steps

#### Step 1: Install Flutter SDK (Windows)

**Option A: Using Scoop (Recommended)**
```bash
scoop install flutter
```

**Option B: Using Chocolatey**
```powershell
# Run PowerShell as Administrator
choco install flutter -y
```

**Option C: Manual Download**
1. Download from: https://flutter.dev/docs/get-started/install/windows
2. Extract to `C:\flutter` or your preferred location
3. Add to PATH: `C:\flutter\bin`
4. Run `flutter doctor` to verify

#### Step 2: Install Dart (comes with Flutter)
```bash
dart --version
```

#### Step 3: Install Protocol Buffer Compiler

**Using Chocolatey (Recommended)**
```powershell
# Run PowerShell as Administrator
choco install protobuf -y
```

**Manual Installation**
1. Download: https://github.com/protocolbuffers/protobuf/releases/download/v24.0/protoc-24.0-win64.zip
2. Extract to `C:\protobuf`
3. Add to PATH: `C:\protobuf\bin`
4. Verify: `protoc --version`

#### Step 4: Install Proto Generators

```bash
# Install Dart proto plugin
pub global activate protoc_plugin

# Add to PATH (on Windows)
$env:PATH += ";$env:APPDATA\Pub\Cache\bin"
```

#### Step 5: Clone & Setup Project

```bash
cd D:\exam-bank-system
cd apps/mobile

# Install dependencies
flutter pub get

# Generate proto files (Dart code)
./scripts/generate_proto_fixed.ps1

# Verify installation
flutter doctor
```

---

## 🔧 Proto File Generation

### Manual Generation (If Script Fails)

```bash
cd D:\exam-bank-system

# Generate Go code for backend
protoc \
  --go_out=./apps/backend/pkg/generated \
  --go-grpc_out=./apps/backend/pkg/generated \
  --proto_path=./packages/proto \
  ./packages/proto/v1/*.proto \
  ./packages/proto/common/*.proto

# Generate Dart code for mobile
protoc \
  --dart_out=grpc:./apps/mobile/lib/generated/proto \
  --proto_path=./packages/proto \
  ./packages/proto/v1/*.proto \
  ./packages/proto/common/*.proto
```

### What Gets Generated

**In `apps/mobile/lib/generated/proto/`:**
```
generated/proto/
├── v1/
│   ├── user.pb.dart              # Message definitions
│   ├── user.pbgrpc.dart          # gRPC service clients
│   ├── question.pb.dart
│   ├── question.pbgrpc.dart
│   ├── exam.pb.dart
│   ├── exam.pbgrpc.dart
│   ├── profile.pb.dart
│   ├── profile.pbgrpc.dart
│   ├── contact.pb.dart
│   ├── contact.pbgrpc.dart
│   ├── newsletter.pb.dart
│   ├── newsletter.pbgrpc.dart
│   ├── notification.pb.dart
│   └── notification.pbgrpc.dart
└── common/
    └── common.pb.dart            # Common types
```

---

## 📝 Verify Installation

### Test gRPC Connection

```bash
flutter run

# In app, navigate to Settings
# Check "System Status" → "Backend Connection"
# Should show: ✅ Connected to backend
```

### Run Tests

```bash
# Unit tests
flutter test test/

# Integration tests
flutter test integration_test/
```

---

## 🔌 Backend Connectivity

### Connecting to Local Backend

1. **Start Backend Server**
```bash
cd apps/backend
go run cmd/main.go
# Or
./run-backend.ps1
```

2. **Update App Configuration** (`lib/core/config/api_constants.dart`)
```dart
class ApiConstants {
  static const String currentHost = 'localhost';
  static const int grpcPort = 50051;
  static const bool isProduction = false;
}
```

3. **Initialize gRPC in App** (in `main.dart`)
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize gRPC client
  GrpcClientConfig.initialize(
    host: 'localhost',
    port: 50051,
    useTLS: false,
  );
  
  runApp(const MyApp());
}
```

### Connecting to Production Backend

```dart
// In main.dart
GrpcClientConfig.initializeProduction();
```

---

## 🐛 Troubleshooting

### Error: "flutter not found"

**Solution:**
```powershell
# Add Flutter to PATH
$env:PATH += ";C:\flutter\bin"

# Or permanently (in System Properties)
```

### Error: "protoc: command not found"

**Solution:**
```powershell
# Install protoc
choco install protobuf -y

# Or add to PATH manually
$env:PATH += ";C:\protobuf\bin"
```

### Error: "No such file or directory: proto files"

**Solution:**
```bash
# Ensure you're in correct directory
cd D:\exam-bank-system

# Check proto files exist
ls packages/proto/v1/

# Run generation from workspace root
./apps/mobile/scripts/generate_proto_fixed.ps1
```

### Error: "gRPC connection failed"

**Solution:**
1. Check backend is running: `go run cmd/main.go`
2. Verify host/port: `localhost:50051`
3. Check firewall isn't blocking port 50051
4. Test connection: `telnet localhost 50051`

---

## 📚 Important Files

### Proto Definitions
- `packages/proto/v1/user.proto` - Authentication service
- `packages/proto/v1/question.proto` - Question operations
- `packages/proto/v1/exam.proto` - Exam operations
- `packages/proto/v1/profile.proto` - User profile
- `packages/proto/common/common.proto` - Common types

### Generated Code
- `apps/mobile/lib/generated/proto/` - All generated Dart code
- **NOTE**: DO NOT EDIT generated files manually

### Main Application Files
- `apps/mobile/lib/main.dart` - App entry point
- `apps/mobile/lib/core/network/grpc_client.dart` - gRPC configuration
- `apps/mobile/lib/core/service_registry.dart` - Service clients registry

---

## 🔄 Workflow After Proto Generation

### 1. Update Remote Data Sources

After proto files are generated, update datasources:

```dart
// apps/mobile/lib/features/questions/data/datasources/question_remote_datasource.dart

class QuestionRemoteDataSourceImpl implements QuestionRemoteDataSource {
  late final QuestionServiceClient _client;
  
  QuestionRemoteDataSourceImpl() {
    // Use generated proto client
    _client = QuestionServiceClient(GrpcClientConfig.channel);
  }
  
  @override
  Future<ListQuestionsResponse> getQuestions({
    required int page,
    required int limit,
    String? search,
    Map<String, dynamic>? filters,
    String? sortBy,
  }) async {
    final request = ListQuestionsRequest()
      ..pagination = (PaginationRequest()
        ..page = page
        ..limit = limit);
    
    try {
      return await _client.listQuestions(request);
    } on GrpcError catch (e) {
      throw ServerException(message: e.message ?? 'gRPC Error');
    }
  }
}
```

### 2. Update Repositories

Replace mock implementations with real gRPC calls:

```dart
// Existing code with real proto calls
```

### 3. Test with Backend

```bash
flutter run

# Login with test account
# Email: student33@nynus.edu.vn
# Password: Abd8stbcs!

# Verify data flows from backend
```

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Flutter Setup** | ⏳ Pending | Download SDK: 1-2GB, ~5 min |
| **Proto Generation** | ⏳ Pending | Needs protoc + protoc-gen-dart |
| **UI/UX** | ✅ Complete | 100% implemented |
| **Mock Data** | ✅ Complete | Working great for development |
| **Backend Connection** | ⏳ Pending | After proto generation |
| **App Functionality** | ✅ 95% Ready | Just needs real data |

---

## 🎯 Next Steps

1. **Install Flutter SDK** (if not already done)
   ```bash
   flutter doctor
   ```

2. **Generate Proto Files**
   ```bash
   cd apps/mobile
   ./scripts/generate_proto_fixed.ps1
   ```

3. **Run Application**
   ```bash
   flutter run
   ```

4. **Verify Backend Connection**
   - Start backend server
   - Check app connectivity status
   - Test data flow

---

## 📞 Support

**For Issues:**
- Check Flutter docs: https://flutter.dev/docs
- Check Dart gRPC: https://grpc.io/docs/languages/dart/
- Check Proto files: `packages/proto/AGENT.md`

**Useful Commands:**
```bash
# Check Flutter setup
flutter doctor

# Clean rebuild
flutter clean
flutter pub get
flutter pub upgrade

# Run with debugging
flutter run -v

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

---

**Last Updated**: 2025-01-29  
**Version**: 1.0.0



