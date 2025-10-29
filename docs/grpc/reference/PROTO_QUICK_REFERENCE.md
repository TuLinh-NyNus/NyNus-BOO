# Proto Quick Reference - Exam Bank System

**Tài liệu tham khảo nhanh cho Protocol Buffers**

---

## 📊 Service Overview

| Service | RPCs | Status | Priority | Proto File |
|---------|------|--------|----------|------------|
| **UserService** | 8 | ✅ Stable | 🔴 Critical | user.proto |
| **QuestionService** | 13 | ✅ Stable | 🔴 Critical | question.proto |
| **ExamService** | 16 | ⚠️ Partial | 🔴 Critical | exam.proto |
| **AdminService** | 10 | ✅ Stable | 🟡 High | admin.proto |
| **LibraryService** | 15 | ✅ Stable | 🟡 High | library.proto |
| **AnalyticsService** | 3 | ✅ Stable | 🟢 Medium | analytics.proto |
| **BookService** | 6 | ✅ Stable | 🟢 Medium | book.proto |
| **SearchService** | 1 | ⚠️ Limited | 🟢 Medium | search.proto |
| **NotificationService** | 5 | ⚠️ Partial | 🟢 Medium | notification.proto |
| **ProfileService** | 4 | ✅ Stable | 🟢 Medium | profile.proto |
| **ContactService** | 3 | ✅ Stable | 🔵 Low | contact.proto |
| **NewsletterService** | 3 | ✅ Stable | 🔵 Low | newsletter.proto |
| **BlogService** | 8 | ✅ Stable | 🔵 Low | blog.proto |
| **FAQService** | 4 | ✅ Stable | 🔵 Low | faq.proto |
| **TikzService** | 2 | ✅ Stable | 🔵 Low | tikz.proto |
| **ImportService** | 3 | ✅ Stable | 🔵 Low | import.proto |
| **MapCodeService** | 4 | ✅ Stable | 🔵 Low | mapcode.proto |
| **QuestionFilterService** | 4 | ✅ Stable | 🟢 Medium | question_filter.proto |

**Total**: 18 services, 113+ RPCs

---

## 📋 Service Implementation Matrix

| Service | Backend | Frontend | HTTP Gateway | Notes |
|---------|---------|----------|--------------|-------|
| **UserService** | ✅ Full | ✅ Full | ✅ Full | Complete auth + user mgmt |
| **QuestionService** | ✅ Full | ✅ Full | ✅ Full | CRUD + filters + search |
| **ExamService** | ✅ Full | ⚠️ Mock | ✅ Limited | Missing frontend implementation |
| **AdminService** | ✅ Full | ✅ Full | ✅ Full | Complete admin panel |
| **LibraryService** | ✅ Full | ✅ Full | ✅ Full | Content library mgmt |
| **QuestionFilterService** | ✅ Full | ✅ Full | ✅ Full | Advanced filtering |
| **AnalyticsService** | ✅ Full | ✅ Full | ✅ Full | Metrics & reporting |
| **ProfileService** | ✅ Full | ✅ Full | ✅ Full | User profile mgmt |
| **BlogService** | ✅ Full | ✅ Full | ✅ Full | Blog content |
| **BookService** | ✅ Full | ✅ Full | ✅ Full | Book management |
| **ContactService** | ✅ Full | ✅ Full | ✅ Full | Contact forms |
| **NewsletterService** | ✅ Full | ✅ Full | ✅ Full | Newsletter mgmt |
| **NotificationService** | ✅ Full | ⚠️ Mock | ❌ Missing | Backend only, needs frontend impl |
| **MapCodeService** | ✅ Full | ❌ Stub | ⚠️ Partial | WIP feature |
| **SearchService** | ✅ Full | ✅ Full | ✅ Full | OpenSearch integration |
| **FAQService** | ✅ Full | ✅ Full | ✅ Full | FAQ management |
| **TikzService** | ✅ Full | ✅ Full | ✅ Full | Tikz rendering |
| **ImportService** | ✅ Full | ✅ Full | ✅ Full | Bulk import |

**Legend:**
- ✅ **Full**: Fully implemented and tested
- ⚠️ **Mock**: Mock implementation (for testing)
- ⚠️ **Partial**: Partially implemented
- ❌ **Stub**: Not yet implemented
- ❌ **Missing**: Not available

---

## 🔑 Common Enums

### UserRole
```protobuf
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;  // Always check for this
  USER_ROLE_GUEST = 1;        // Public access
  USER_ROLE_STUDENT = 2;      // Basic user
  USER_ROLE_TUTOR = 3;        // Content creator
  USER_ROLE_TEACHER = 4;      // Advanced creator
  USER_ROLE_ADMIN = 5;        // Full access
}
```

### QuestionType
```protobuf
enum QuestionType {
  QUESTION_TYPE_UNSPECIFIED = 0;
  QUESTION_TYPE_MULTIPLE_CHOICE = 1;  // MC - Single answer
  QUESTION_TYPE_TRUE_FALSE = 2;       // TF - Multiple answers
  QUESTION_TYPE_SHORT_ANSWER = 3;     // SA - Text answer
  QUESTION_TYPE_ESSAY = 4;            // ES - Long text
  QUESTION_TYPE_MATCHING = 5;         // MA - Match pairs
}
```

### QuestionStatus
```protobuf
enum QuestionStatus {
  QUESTION_STATUS_UNSPECIFIED = 0;
  QUESTION_STATUS_ACTIVE = 1;      // Published, usable
  QUESTION_STATUS_PENDING = 2;     // Awaiting review
  QUESTION_STATUS_INACTIVE = 3;    // Temporarily disabled
  QUESTION_STATUS_ARCHIVED = 4;    // No longer used
}
```

### DifficultyLevel
```protobuf
enum DifficultyLevel {
  DIFFICULTY_LEVEL_UNSPECIFIED = 0;
  DIFFICULTY_LEVEL_EASY = 1;       // Beginner
  DIFFICULTY_LEVEL_MEDIUM = 2;     // Intermediate
  DIFFICULTY_LEVEL_HARD = 3;       // Advanced
  DIFFICULTY_LEVEL_EXPERT = 4;     // Expert
}
```

---

## 📦 Core Messages

### Response Wrapper
```protobuf
message Response {
  bool success = 1;        // Operation succeeded?
  string message = 2;      // Human-readable message
  repeated string errors = 3;  // Error details
}
```

**Usage:**
```go
// Backend (Go)
response := &common.Response{
    Success: true,
    Message: "Operation completed",
    Errors:  []string{},
}
```

```typescript
// Frontend (TypeScript)
if (response.getResponse()?.getSuccess()) {
    console.log(response.getResponse()?.getMessage());
}
```

### Pagination
```protobuf
message PaginationRequest {
  int32 page = 1;          // Page number (1-indexed)
  int32 limit = 2;         // Items per page
  string sort_by = 3;      // Field to sort by
  string sort_order = 4;   // "asc" or "desc"
}

message PaginationResponse {
  int32 page = 1;
  int32 limit = 2;
  int32 total_count = 3;
  int32 total_pages = 4;
}
```

---

## 🚀 Quick Commands

### Generate Code

```powershell
# Backend (Go)
cd packages/proto
buf generate --template buf.gen.yaml

# Frontend (TypeScript)
buf generate --template buf.gen.frontend.yaml

# Or use project scripts
.\scripts\development\gen-proto-web.ps1
```

### Lint & Validate

```powershell
# Lint proto files
buf lint

# Check for breaking changes
buf breaking --against '.git#branch=main'

# Format proto files
buf format -w
```

### Update Dependencies

```powershell
# Update buf dependencies
buf mod update

# Clear cache
buf mod clear-cache
```

---

## 💻 Code Snippets

### Backend (Go)

#### Create Service
```go
import (
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
    "exam-bank-system/apps/backend/pkg/proto/common"
)

type MyService struct {
    pb.UnimplementedMyServiceServer
}

func (s *MyService) MyRPC(ctx context.Context, req *pb.MyRequest) (*pb.MyResponse, error) {
    return &pb.MyResponse{
        Response: &common.Response{
            Success: true,
            Message: "OK",
        },
    }, nil
}
```

#### Register Service
```go
pb.RegisterMyServiceServer(grpcServer, NewMyService())
```

#### Handle Errors
```go
import "google.golang.org/grpc/status"
import "google.golang.org/grpc/codes"

return nil, status.Error(codes.InvalidArgument, "invalid input")
```

### Frontend (TypeScript)

#### Import
```typescript
import { MyServiceClient } from '@/generated/v1/MyServiceClientPb';
import { MyRequest, MyResponse } from '@/generated/v1/my_pb';
```

#### Create Client
```typescript
const client = new MyServiceClient('http://localhost:8080');
```

#### Make Call
```typescript
const request = new MyRequest();
request.setField('value');

client.myRPC(request, (err, response) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(response.getResponse()?.getMessage());
});
```

#### With Async/Await
```typescript
async function callRPC() {
    return new Promise((resolve, reject) => {
        client.myRPC(request, (err, response) => {
            if (err) reject(err);
            else resolve(response);
        });
    });
}
```

---

## 🔐 Authentication Pattern

### Backend
```go
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    md, _ := metadata.FromIncomingContext(ctx)
    tokens := md.Get("authorization")
    
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }
    
    token := strings.TrimPrefix(tokens[0], "Bearer ")
    userID, err := validateToken(token)
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    
    ctx = context.WithValue(ctx, "userID", userID)
    return handler(ctx, req)
}
```

### Frontend
```typescript
import { grpc } from '@improbable-eng/grpc-web';

const metadata = new grpc.Metadata();
const token = localStorage.getItem('accessToken');
metadata.set('authorization', `Bearer ${token}`);

client.myRPC(request, metadata, callback);
```

---

## 📝 Common Patterns

### 1. Check Enum for UNSPECIFIED
```go
if req.Role == common.UserRole_USER_ROLE_UNSPECIFIED {
    return nil, status.Error(codes.InvalidArgument, "role required")
}
```

### 2. Handle Optional Fields
```go
if req.OptionalField != nil {
    // Field is set
}
```

```typescript
if (message.hasOptionalField()) {
    const value = message.getOptionalField();
}
```

### 3. Work with Timestamps
```go
import "google.golang.org/protobuf/types/known/timestamppb"

msg.CreatedAt = timestamppb.Now()
time := msg.CreatedAt.AsTime()
```

```typescript
const timestamp = new Timestamp();
timestamp.setSeconds(Math.floor(Date.now() / 1000));
message.setCreatedAt(timestamp);
```

### 4. Handle Repeated Fields
```go
for _, item := range req.Items {
    // Process item
}
```

```typescript
const items = message.getItemsList();
items.forEach(item => {
    // Process item
});
```

### 5. Work with Oneof
```go
switch v := msg.Data.(type) {
case *pb.Message_FieldA:
    // Handle FieldA
case *pb.Message_FieldB:
    // Handle FieldB
}
```

```typescript
if (message.hasFieldA()) {
    const value = message.getFieldA();
} else if (message.hasFieldB()) {
    const value = message.getFieldB();
}
```

---

## 🐛 Troubleshooting

### Issue: Code generation fails

**Solution:**
```powershell
buf mod clear-cache
buf mod update
buf generate
```

### Issue: Import errors in Go

**Solution:**
```powershell
go mod tidy
go get -u ./...
```

### Issue: TypeScript types not found

**Solution:**
```powershell
# Regenerate frontend code
buf generate --template buf.gen.frontend.yaml

# Check output directory
ls apps/frontend/src/generated/
```

### Issue: "Permission denied" on proto files

**Solution:**
```powershell
# On Windows
icacls packages\proto /grant Everyone:F /T
```

### Issue: Breaking change detected

**Solution:**
```powershell
# Check what broke
buf breaking --against '.git#branch=main'

# Options:
# 1. Revert the breaking change
# 2. Create new v2 API
# 3. Add backward compatibility layer
```

---

## 📊 Performance Tips

### 1. Message Size Optimization
- ✅ Use `repeated` instead of sending multiple messages
- ✅ Batch operations when possible
- ✅ Use `oneof` for mutually exclusive fields
- ❌ Don't nest too deeply (max 3-4 levels)

### 2. Streaming
```protobuf
// For large result sets
rpc StreamResults(Request) returns (stream Response);

// For real-time updates
rpc Subscribe(SubscribeRequest) returns (stream Event);
```

### 3. Field Numbering
- Reserve 1-15 for frequently used fields (1 byte)
- Use 16+ for less common fields (2 bytes)
- Never reuse field numbers

### 4. Caching
```go
// Backend: Cache parsed messages
var cachedResponse *pb.Response

func getResponse() *pb.Response {
    if cachedResponse == nil {
        cachedResponse = buildResponse()
    }
    return cachedResponse
}
```

---

## 📚 File Locations

```
packages/proto/
├── common/common.proto          ← Shared types
├── v1/
│   ├── user.proto              ← Authentication
│   ├── question.proto          ← Question CRUD
│   ├── exam.proto              ← Exam system
│   ├── admin.proto             ← Admin panel
│   └── ...                     ← 14 more services
└── buf.yaml                    ← Configuration

Generated Code:
├── Backend:  apps/backend/pkg/proto/
└── Frontend: apps/frontend/src/generated/
```

---

## 🔗 Related Documents

- [📖 Full System Analysis](./PROTO_SYSTEM_ANALYSIS.md)
- [📚 Usage Guide](./PROTO_USAGE_GUIDE.md)
- [🏗️ Architecture Diagrams](./GRPC_ARCHITECTURE.md)
- [🌐 Official Docs](https://protobuf.dev/)
- [⚡ Buf Documentation](https://buf.build/docs)

---

## ✅ Development Checklist

### Before Creating New Proto

- [ ] Check if similar service exists
- [ ] Plan message structure
- [ ] Design enums with UNSPECIFIED
- [ ] Consider backward compatibility
- [ ] Plan for pagination if needed
- [ ] Add proper documentation comments

### After Modifying Proto

- [ ] Run `buf lint`
- [ ] Run `buf breaking`
- [ ] Regenerate Go code
- [ ] Regenerate TypeScript code
- [ ] Update tests
- [ ] Update API documentation
- [ ] Test with frontend/backend
- [ ] Commit generated code

### Before Deployment

- [ ] All tests passing
- [ ] No breaking changes (or properly versioned)
- [ ] Documentation updated
- [ ] Migration plan if needed
- [ ] Backward compatibility tested
- [ ] Performance tested

---

## 🎯 Best Practices Summary

### ✅ DO
- Use enums instead of strings
- Always have UNSPECIFIED as 0
- Use Response wrapper consistently
- Add timestamps to entities
- Version your APIs (v1/, v2/)
- Document all public APIs
- Use pagination for lists
- Validate all inputs

### ❌ DON'T
- Don't reuse field numbers
- Don't use magic numbers
- Don't skip error handling
- Don't break backward compatibility
- Don't forget to regenerate code
- Don't commit without linting
- Don't create huge messages
- Don't ignore UNSPECIFIED

---

## 📞 Quick Help

**Command Help:**
```powershell
buf --help
buf generate --help
buf lint --help
buf breaking --help
```

**Get Service Info:**
```powershell
buf ls-files
buf ls-breaking-rules
```

**Debug Mode:**
```powershell
buf generate --debug
```

---

**Last Updated**: 2025-10-29  
**Version**: 1.0  
**Status**: ✅ Current

