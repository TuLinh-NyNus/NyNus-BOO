# Protocol Buffers - gRPC API Definitions Agent Guide
*Hướng dẫn cho AI agents làm việc với Protocol Buffer definitions*

## 📋 Tổng quan Protocol Buffers

**NyNus Proto Package** chứa tất cả định nghĩa API cho gRPC communication giữa frontend và backend.

### Thông tin kỹ thuật
- **Version**: Protocol Buffers v3
- **Tools**: buf, protoc, protoc-gen-go, protoc-gen-grpc-web
- **Languages**: Go (backend), TypeScript (frontend)
- **Services**: 8 gRPC services chính

## 🏗️ Cấu trúc Proto Package

```
packages/proto/
├── v1/                          # API version 1
│   ├── user.proto              # User authentication & management
│   ├── question.proto          # Question management
│   ├── question_filter.proto   # Advanced question filtering
│   ├── admin.proto             # Admin operations
│   ├── profile.proto           # User profile management
│   ├── contact.proto           # Contact form handling
│   ├── newsletter.proto        # Newsletter subscription
│   └── notification.proto      # Notification system
├── common/                     # Shared definitions
│   └── common.proto           # Common types, enums, responses
├── google/                     # Google API imports
│   └── api/                   # HTTP annotations
├── buf.yaml                   # Buf configuration
├── buf.gen.yaml              # Code generation config
└── gen/                      # Generated code (auto-generated)
    ├── go/                   # Generated Go code
    └── ts/                   # Generated TypeScript code
```

## 🚀 Code Generation Commands

### Generate All Code
```bash
# From project root
make proto                     # Generate Go code for backend

# Generate TypeScript code for frontend
./scripts/development/gen-proto-web.ps1
```

### Manual Generation
```bash
# Go code generation
buf generate --template buf.gen.yaml

# TypeScript/JavaScript generation (manual)
protoc --plugin=protoc-gen-grpc-web=./tools/protoc-gen-grpc-web.exe \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./apps/frontend/src/generated \
  --proto_path=./packages/proto \
  ./packages/proto/v1/*.proto ./packages/proto/common/*.proto
```

## 📋 Service Definitions

### 1. UserService (v1/user.proto)

**Chức năng**: Authentication, user management, session handling

```protobuf
service UserService {
  // Authentication
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc GoogleLogin(GoogleLoginRequest) returns (LoginResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  
  // User Management
  rpc GetUserProfile(GetUserProfileRequest) returns (GetUserProfileResponse);
  rpc UpdateUserProfile(UpdateUserProfileRequest) returns (UpdateUserProfileResponse);
  rpc ChangePassword(ChangePasswordRequest) returns (ChangePasswordResponse);
  rpc DeleteAccount(DeleteAccountRequest) returns (DeleteAccountResponse);
  rpc GetUserSessions(GetUserSessionsRequest) returns (GetUserSessionsResponse);
}
```

**Key Messages**:
- `LoginRequest/Response` - Email/password authentication
- `RegisterRequest/Response` - User registration
- `RefreshTokenRequest/Response` - Token refresh flow
- `UserProfile` - User profile information

### 2. QuestionService (v1/question.proto)

**Chức năng**: Question CRUD operations, LaTeX handling

```protobuf
service QuestionService {
  rpc CreateQuestion(CreateQuestionRequest) returns (CreateQuestionResponse);
  rpc GetQuestion(GetQuestionRequest) returns (GetQuestionResponse);
  rpc UpdateQuestion(UpdateQuestionRequest) returns (UpdateQuestionResponse);
  rpc DeleteQuestion(DeleteQuestionRequest) returns (DeleteQuestionResponse);
  rpc ListQuestions(ListQuestionsRequest) returns (ListQuestionsResponse);
  rpc BulkCreateQuestions(BulkCreateQuestionsRequest) returns (BulkCreateQuestionsResponse);
}
```

**Key Messages**:
- `Question` - Question entity with LaTeX content
- `Answer` - Answer options for questions
- `QuestionMetadata` - Question classification data

### 3. QuestionFilterService (v1/question_filter.proto)

**Chức năng**: Advanced question filtering and search

```protobuf
service QuestionFilterService {
  rpc FilterQuestions(FilterQuestionsRequest) returns (FilterQuestionsResponse);
  rpc GetFilterOptions(GetFilterOptionsRequest) returns (GetFilterOptionsResponse);
  rpc SearchQuestions(SearchQuestionsRequest) returns (SearchQuestionsResponse);
  rpc GetQuestionsByCode(GetQuestionsByCodeRequest) returns (GetQuestionsByCodeResponse);
}
```

**Key Messages**:
- `QuestionFilter` - Complex filtering criteria
- `QuestionCodeFilter` - Filter by question codes (ID5/ID6)
- `DateRangeFilter` - Time-based filtering
- `MetadataFilter` - Filter by question metadata

### 4. AdminService (v1/admin.proto)

**Chức năng**: Admin operations, user management, system monitoring

```protobuf
service AdminService {
  rpc GetUsers(GetUsersRequest) returns (GetUsersResponse);
  rpc UpdateUserRole(UpdateUserRoleRequest) returns (UpdateUserRoleResponse);
  rpc GetSystemStats(GetSystemStatsRequest) returns (GetSystemStatsResponse);
  rpc GetAuditLogs(GetAuditLogsRequest) returns (GetAuditLogsResponse);
  rpc ManageContent(ManageContentRequest) returns (ManageContentResponse);
}
```

### 5. Other Services

#### ProfileService (v1/profile.proto)
- User profile management
- Preferences and settings

#### ContactService (v1/contact.proto)
- Contact form submissions
- Support ticket management

#### NewsletterService (v1/newsletter.proto)
- Newsletter subscriptions
- Email campaign management

#### NotificationService (v1/notification.proto)
- Push notifications
- Email notifications
- In-app notifications

## 🔧 Common Types (common/common.proto)

### Enums
```protobuf
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;
  USER_ROLE_GUEST = 1;
  USER_ROLE_STUDENT = 2;
  USER_ROLE_TUTOR = 3;
  USER_ROLE_TEACHER = 4;
  USER_ROLE_ADMIN = 5;
}

enum QuestionType {
  QUESTION_TYPE_UNSPECIFIED = 0;
  QUESTION_TYPE_MULTIPLE_CHOICE = 1;
  QUESTION_TYPE_TRUE_FALSE = 2;
  QUESTION_TYPE_SHORT_ANSWER = 3;
  QUESTION_TYPE_ESSAY = 4;
  QUESTION_TYPE_CODING = 5;
}

enum DifficultyLevel {
  DIFFICULTY_LEVEL_UNSPECIFIED = 0;
  DIFFICULTY_LEVEL_EASY = 1;
  DIFFICULTY_LEVEL_MEDIUM = 2;
  DIFFICULTY_LEVEL_HARD = 3;
  DIFFICULTY_LEVEL_EXPERT = 4;
}
```

### Response Wrapper
```protobuf
message Response {
  bool success = 1;
  string message = 2;
  int32 code = 3;
  google.protobuf.Any data = 4;
  repeated string errors = 5;
}
```

### Pagination
```protobuf
message PaginationRequest {
  int32 page = 1;
  int32 page_size = 2;
  string sort_by = 3;
  string sort_order = 4; // "asc" or "desc"
}

message PaginationResponse {
  int32 current_page = 1;
  int32 page_size = 2;
  int32 total_pages = 3;
  int64 total_items = 4;
  bool has_next = 5;
  bool has_previous = 6;
}
```

## 🔧 Configuration Files

### Buf Configuration (buf.yaml)
```yaml
version: v1
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
```

### Code Generation (buf.gen.yaml)
```yaml
version: v1
plugins:
  - plugin: go
    out: gen/go
    opt: paths=source_relative
  - plugin: go-grpc
    out: gen/go
    opt: paths=source_relative
  - plugin: grpc-gateway
    out: gen/go
    opt: paths=source_relative
```

## 🛠️ Development Workflow

### Adding New Service
1. **Create proto file** in `v1/` directory
2. **Define service** with RPC methods
3. **Define messages** for requests/responses
4. **Generate code** with `make proto`
5. **Implement service** in backend
6. **Create client** in frontend

### Adding New Message Type
1. **Define message** in appropriate proto file
2. **Add validation** if needed
3. **Generate code** with `make proto`
4. **Update related services** that use the message

### Modifying Existing API
1. **Check breaking changes** with `buf breaking`
2. **Update proto definition**
3. **Regenerate code**
4. **Update implementations** in backend/frontend
5. **Test compatibility**

## ⚠️ Common Issues & Solutions

### 1. Code Generation Fails
```bash
# Check protoc installation
protoc --version

# Install required tools
make install-tools

# Clean and regenerate
make proto-clean
make proto
```

### 2. Import Issues
```protobuf
// Correct import paths
import "google/api/annotations.proto";
import "common/common.proto";
import "google/protobuf/timestamp.proto";
```

### 3. TypeScript Generation Issues
```powershell
# Check protoc-gen-grpc-web
ls tools/protoc-gen-grpc-web.exe

# Regenerate TypeScript code
./scripts/development/gen-proto-web.ps1

# Check output
ls apps/frontend/src/generated/
```

### 4. Breaking Changes
```bash
# Check for breaking changes
buf breaking --against '.git#branch=main'

# Lint proto files
buf lint
```

## 📊 Best Practices

### Message Design
```protobuf
// ✅ Good: Clear, descriptive names
message CreateQuestionRequest {
  string content = 1;
  QuestionType type = 2;
  DifficultyLevel difficulty = 3;
  repeated string tags = 4;
}

// ❌ Bad: Unclear names
message CQReq {
  string c = 1;
  int32 t = 2;
}
```

### Field Numbering
```protobuf
// ✅ Good: Sequential numbering, reserve deprecated fields
message User {
  string id = 1;
  string email = 2;
  string name = 3;
  // reserved 4; // deprecated field
  UserRole role = 5;
}
```

### Enum Design
```protobuf
// ✅ Good: Zero value is UNSPECIFIED
enum Status {
  STATUS_UNSPECIFIED = 0;
  STATUS_ACTIVE = 1;
  STATUS_INACTIVE = 2;
}
```

## 🔍 Debugging

### Validation
```bash
# Lint proto files
buf lint

# Check for breaking changes
buf breaking

# Format proto files
buf format -w
```

### Generated Code Inspection
```bash
# Check Go generated code
ls -la gen/go/

# Check TypeScript generated code
ls -la ../../apps/frontend/src/generated/
```

## 📚 Documentation

### Service Documentation
- Each service should have clear comments
- RPC methods should describe their purpose
- Request/Response messages should be documented

### Example Documentation
```protobuf
// UserService provides authentication and user management functionality
service UserService {
  // Login authenticates a user with email and password
  // Returns access token, refresh token, and user profile
  rpc Login(LoginRequest) returns (LoginResponse);
  
  // Register creates a new user account
  // Validates email uniqueness and password strength
  rpc Register(RegisterRequest) returns (RegisterResponse);
}
```

---

**🚀 Quick Development Setup:**
1. Install protoc and buf tools
2. Run `make proto` to generate Go code
3. Run `./scripts/development/gen-proto-web.ps1` for TypeScript
4. Check generated files in `gen/` directories

**🔧 Before Committing:**
1. `buf lint` - Check proto file quality
2. `buf breaking` - Check for breaking changes
3. `make proto` - Ensure Go code generates
4. Test frontend TypeScript generation
