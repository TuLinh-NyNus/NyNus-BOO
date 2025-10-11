# 📚 NyNus Exam Bank System - Complete API Documentation
**Version**: 1.0.0  
**Last Updated**: 2025-10-09  
**Base URL**: `http://localhost:8080`

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [HTTP REST APIs](#http-rest-apis)
4. [gRPC-only APIs](#grpc-only-apis)
5. [Common Types](#common-types)
6. [Error Handling](#error-handling)

---

## 🎯 Overview

### API Architecture
NyNus backend sử dụng **hybrid architecture**:
- **gRPC** (port 50051): Primary protocol cho internal services
- **HTTP/gRPC-Gateway** (port 8080): REST API cho một số services
- **gRPC-Web** (port 8080): Browser-compatible gRPC

### Service Distribution
```
Total Services: 14
├─ With HTTP Routes:    5 services (36%)
│  ├─ ProfileService
│  ├─ ContactService
│  ├─ NewsletterService
│  ├─ AdminService
│  └─ NotificationService
│
└─ gRPC-only:          9 services (64%)
   ├─ UserService
   ├─ QuestionService
   ├─ ExamService
   ├─ QuestionFilterService
   ├─ BlogService
   ├─ ImportService
   ├─ MapCodeService
   ├─ SearchService
   └─ TikzCompilerService
```

### Access Methods
| Method | Port | Protocol | Use Case |
|--------|------|----------|----------|
| **HTTP REST** | 8080 | HTTP/1.1 | Public endpoints, Admin dashboard |
| **gRPC-Web** | 8080 | HTTP/1.1 + gRPC-Web | Frontend ↔ Backend |
| **Pure gRPC** | 50051 | HTTP/2 + gRPC | Service ↔ Service |

---

## 🔐 Authentication

### Authentication Methods
1. **JWT Token**: Access token + Refresh token
2. **Google OAuth**: Google ID token
3. **Session Token**: Stateful session management

### Headers
```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

### Token Flow
```
1. Login → Access Token (15 min) + Refresh Token (7 days)
2. Use Access Token for API calls
3. When expired → Use Refresh Token to get new Access Token
4. Refresh Token rotation for security
```

---

## 🌐 HTTP REST APIs

### 1. ProfileService (7 endpoints)

#### 1.1 Get Profile
```http
GET /api/v1/profile
Authorization: Bearer <token>
```

**Response**:
```json
{
  "response": {
    "code": 0,
    "message": "Success"
  },
  "profile": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "avatar": "https://...",
    "bio": "Student at...",
    "phone": "+84...",
    "address": "...",
    "school": "...",
    "date_of_birth": "2000-01-01",
    "gender": "male",
    "role": "STUDENT",
    "level": 10,
    "status": "ACTIVE",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 1.2 Update Profile
```http
PUT /api/v1/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "first_name": "John",
  "last_name": "Doe",
  "avatar": "https://...",
  "bio": "Updated bio",
  "phone": "+84...",
  "address": "...",
  "school": "...",
  "date_of_birth": "2000-01-01",
  "gender": "male"
}
```

#### 1.3 Get Sessions
```http
GET /api/v1/profile/sessions
Authorization: Bearer <token>
```

**Response**:
```json
{
  "response": {
    "code": 0,
    "message": "Success"
  },
  "sessions": [
    {
      "id": "session-123",
      "user_id": "user-123",
      "session_token": "...",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "device_fingerprint": "...",
      "location": "Hanoi, Vietnam",
      "is_active": true,
      "last_activity": "2024-01-01T00:00:00Z",
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "active_count": 2,
  "max_allowed": 5
}
```

#### 1.4 Terminate Session
```http
DELETE /api/v1/profile/sessions/{session_id}
Authorization: Bearer <token>
```

#### 1.5 Terminate All Sessions
```http
DELETE /api/v1/profile/sessions/all
Authorization: Bearer <token>
Content-Type: application/json

{
  "except_current": true
}
```

#### 1.6 Get Preferences
```http
GET /api/v1/profile/preferences
Authorization: Bearer <token>
```

**Response**:
```json
{
  "response": {
    "code": 0,
    "message": "Success"
  },
  "preferences": {
    "email_notifications": true,
    "push_notifications": true,
    "sms_notifications": false,
    "auto_play_videos": true,
    "default_video_quality": "720p",
    "playback_speed": 1.0,
    "profile_visibility": "PUBLIC",
    "show_online_status": true,
    "allow_direct_messages": true,
    "timezone": "Asia/Ho_Chi_Minh",
    "language": "vi",
    "date_format": "DD/MM/YYYY",
    "time_format": "24h",
    "theme": "light",
    "font_size": "medium",
    "high_contrast": false,
    "reduced_motion": false,
    "screen_reader_mode": false,
    "keyboard_shortcuts": true,
    "two_factor_enabled": false,
    "login_alerts": true,
    "marketing_emails": false,
    "product_updates": true,
    "security_alerts": true,
    "weekly_digest": true
  }
}
```

#### 1.7 Update Preferences
```http
PUT /api/v1/profile/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "email_notifications": false
  }
}
```

---

### 2. ContactService (5 endpoints)

#### 2.1 Submit Contact Form (Public)
```http
POST /api/v1/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about...",
  "message": "I have a question...",
  "phone": "+84..."
}
```

**Response**:
```json
{
  "response": {
    "code": 0,
    "message": "Contact form submitted successfully"
  },
  "submission": {
    "id": "contact-123",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question about...",
    "message": "I have a question...",
    "phone": "+84...",
    "status": "pending",
    "submission_id": "SUB-2024-001",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2.2 List Contacts (Admin)
```http
GET /api/v1/admin/contacts?page=1&limit=20&status=pending&search=john
Authorization: Bearer <admin_token>
```

#### 2.3 Get Contact (Admin)
```http
GET /api/v1/admin/contacts/{id}
Authorization: Bearer <admin_token>
```

#### 2.4 Update Contact Status (Admin)
```http
PUT /api/v1/admin/contacts/{id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "read"
}
```

#### 2.5 Delete Contact (Admin)
```http
DELETE /api/v1/admin/contacts/{id}
Authorization: Bearer <admin_token>
```

---

### 3. NewsletterService (6 endpoints)

#### 3.1 Subscribe (Public)
```http
POST /api/v1/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "tags": ["student", "math"],
  "metadata": {
    "source": "website",
    "campaign": "2024-spring"
  }
}
```

#### 3.2 Unsubscribe (Public)
```http
POST /api/v1/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "reason": "Too many emails"
}
```

#### 3.3 List Subscriptions (Admin)
```http
GET /api/v1/admin/newsletter/subscriptions?page=1&limit=20&status=active
Authorization: Bearer <admin_token>
```

#### 3.4 Get Subscription (Admin)
```http
GET /api/v1/admin/newsletter/subscriptions/{email}
Authorization: Bearer <admin_token>
```

#### 3.5 Update Subscription Tags (Admin)
```http
PUT /api/v1/admin/newsletter/subscriptions/{email}/tags
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "tags": ["student", "physics", "grade-11"]
}
```

#### 3.6 Delete Subscription (Admin)
```http
DELETE /api/v1/admin/newsletter/subscriptions/{id}
Authorization: Bearer <admin_token>
```

---

### 4. AdminService (8 endpoints)

#### 4.1 List Users
```http
GET /api/v1/admin/users?page=1&limit=20&role=STUDENT&status=ACTIVE
Authorization: Bearer <admin_token>
```

#### 4.2 Update User Role
```http
PUT /api/v1/admin/users/{user_id}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "new_role": "TEACHER",
  "level": 5
}
```

#### 4.3 Update User Level
```http
PUT /api/v1/admin/users/{user_id}/level
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "new_level": 11
}
```

#### 4.4 Update User Status
```http
PUT /api/v1/admin/users/{user_id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "new_status": "SUSPENDED",
  "reason": "Violation of terms"
}
```

#### 4.5 Get Audit Logs
```http
GET /api/v1/admin/audit-logs?page=1&limit=50&user_id=user-123&action=login
Authorization: Bearer <admin_token>
```

#### 4.6 Get Resource Access
```http
GET /api/v1/admin/resource-access?page=1&limit=50
Authorization: Bearer <admin_token>
```

#### 4.7 Get Security Alerts
```http
GET /api/v1/admin/security-alerts?page=1&limit=20&severity=high
Authorization: Bearer <admin_token>
```

#### 4.8 Get System Stats
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "response": {
    "code": 0,
    "message": "Success"
  },
  "stats": {
    "total_users": 1000,
    "active_users": 850,
    "total_sessions": 1200,
    "active_sessions": 300,
    "users_by_role": {
      "STUDENT": 800,
      "TEACHER": 150,
      "ADMIN": 50
    },
    "users_by_status": {
      "ACTIVE": 850,
      "INACTIVE": 100,
      "SUSPENDED": 50
    },
    "suspicious_activities": 5
  }
}
```

---

### 5. NotificationService (6 endpoints)

#### 5.1 Get Notifications
```http
GET /api/v1/notifications?page=1&limit=20&unread_only=true
Authorization: Bearer <token>
```

#### 5.2 Get Notification
```http
GET /api/v1/notifications/{id}
Authorization: Bearer <token>
```

#### 5.3 Mark as Read
```http
PUT /api/v1/notifications/{id}/read
Authorization: Bearer <token>
```

#### 5.4 Mark All as Read
```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>
```

#### 5.5 Delete Notification
```http
DELETE /api/v1/notifications/{id}
Authorization: Bearer <token>
```

#### 5.6 Delete All Notifications
```http
DELETE /api/v1/notifications/all
Authorization: Bearer <token>
```

---

## 🔧 gRPC-only APIs

### 1. UserService (13 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `Login(LoginRequest) → LoginResponse`
2. `GoogleLogin(GoogleLoginRequest) → LoginResponse`
3. `RefreshToken(RefreshTokenRequest) → RefreshTokenResponse`
4. `VerifyEmail(VerifyEmailRequest) → VerifyEmailResponse`
5. `SendVerificationEmail(SendVerificationEmailRequest) → SendVerificationEmailResponse`
6. `ForgotPassword(ForgotPasswordRequest) → ForgotPasswordResponse`
7. `ResetPassword(ResetPasswordRequest) → ResetPasswordResponse`
8. `Register(RegisterRequest) → RegisterResponse`
9. `GetUser(GetUserRequest) → GetUserResponse`
10. `ListUsers(ListUsersRequest) → ListUsersResponse`
11. `GetStudentList(GetStudentListRequest) → GetStudentListResponse`
12. `GetCurrentUser(GetCurrentUserRequest) → GetUserResponse`
13. `UpdateUser(UpdateUserRequest) → UpdateUserResponse`

**Example (gRPC-Web)**:
```typescript
import { UserServiceClient } from '@/proto/user_grpc_web_pb';
import { LoginRequest } from '@/proto/user_pb';

const client = new UserServiceClient('http://localhost:8080');
const request = new LoginRequest();
request.setEmail('user@example.com');
request.setPassword('password123');

client.login(request, {}, (err, response) => {
  if (err) {
    console.error('Login failed:', err);
  } else {
    const { accessToken, user } = response.toObject();
    console.log('Login success:', user);
  }
});
```

---

### 2. QuestionService (9 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `CreateQuestion(CreateQuestionRequest) → CreateQuestionResponse`
2. `GetQuestion(GetQuestionRequest) → GetQuestionResponse`
3. `UpdateQuestion(UpdateQuestionRequest) → UpdateQuestionResponse`
4. `DeleteQuestion(DeleteQuestionRequest) → DeleteQuestionResponse`
5. `ListQuestions(ListQuestionsRequest) → ListQuestionsResponse`
6. `ImportQuestions(ImportQuestionsRequest) → ImportQuestionsResponse`
7. `ParseLatexQuestion(ParseLatexQuestionRequest) → ParseLatexQuestionResponse`
8. `CreateQuestionFromLatex(CreateQuestionFromLatexRequest) → CreateQuestionFromLatexResponse`
9. `ImportLatex(ImportLatexRequest) → ImportLatexResponse`

---

### 3. ExamService (17 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `CreateExam(CreateExamRequest) → CreateExamResponse`
2. `UpdateExam(UpdateExamRequest) → UpdateExamResponse`
3. `DeleteExam(DeleteExamRequest) → DeleteExamResponse`
4. `GetExam(GetExamRequest) → GetExamResponse`
5. `ListExams(ListExamsRequest) → ListExamsResponse`
6. `PublishExam(PublishExamRequest) → PublishExamResponse`
7. `ArchiveExam(ArchiveExamRequest) → ArchiveExamResponse`
8. `AddQuestionToExam(AddQuestionToExamRequest) → AddQuestionToExamResponse`
9. `RemoveQuestionFromExam(RemoveQuestionFromExamRequest) → RemoveQuestionFromExamResponse`
10. `ReorderExamQuestions(ReorderExamQuestionsRequest) → ReorderExamQuestionsResponse`
11. `GetExamQuestions(GetExamQuestionsRequest) → GetExamQuestionsResponse`
12. `StartExam(StartExamRequest) → StartExamResponse`
13. `SubmitAnswer(SubmitAnswerRequest) → SubmitAnswerResponse`
14. `SubmitExam(SubmitExamRequest) → SubmitExamResponse`
15. `GetExamAttempt(GetExamAttemptRequest) → GetExamAttemptResponse`
16. `ListExamAttempts(ListExamAttemptsRequest) → ListExamAttemptsResponse`
17. `GetExamResults(GetExamResultsRequest) → GetExamResultsResponse`

---

### 4. QuestionFilterService (3 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `ListQuestionsByFilter(ListQuestionsByFilterRequest) → ListQuestionsByFilterResponse`
2. `SearchQuestions(SearchQuestionsRequest) → SearchQuestionsResponse`
3. `GetQuestionsByQuestionCode(GetQuestionsByQuestionCodeRequest) → GetQuestionsByQuestionCodeResponse`

---

### 5. BlogService (10 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `CreatePost(CreatePostRequest) → CreatePostResponse`
2. `UpdatePost(UpdatePostRequest) → UpdatePostResponse`
3. `GetPost(GetPostRequest) → GetPostResponse`
4. `ListPosts(ListPostsRequest) → ListPostsResponse`
5. `SubmitForReview(SubmitForReviewRequest) → SubmitForReviewResponse`
6. `ApprovePost(ApprovePostRequest) → ApprovePostResponse`
7. `PublishPost(PublishPostRequest) → PublishPostResponse`
8. `UnpublishPost(UnpublishPostRequest) → UnpublishPostResponse`
9. `DeletePost(DeletePostRequest) → DeletePostResponse`
10. `GetPostStats(GetPostStatsRequest) → GetPostStatsResponse`

---

### 6. ImportService (4 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `UploadImportFile(stream FileChunk) → UploadImportFileResponse` (Client Streaming)
2. `CreateImportJob(CreateImportJobRequest) → CreateImportJobResponse`
3. `GetImportStatus(GetImportStatusRequest) → GetImportStatusResponse`
4. `ListImportResults(ListImportResultsRequest) → ListImportResultsResponse`

---

### 7. MapCodeService (Multiple RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `CreateVersion(CreateVersionRequest) → CreateVersionResponse`
2. `GetVersions(GetVersionsRequest) → GetVersionsResponse`
3. `GetActiveVersion(GetActiveVersionRequest) → GetActiveVersionResponse`
4. `ActivateVersion(ActivateVersionRequest) → ActivateVersionResponse`
5. `CreateMapping(CreateMappingRequest) → CreateMappingResponse`
6. `GetMapping(GetMappingRequest) → GetMappingResponse`
7. `ListMappings(ListMappingsRequest) → ListMappingsResponse`
8. `UpdateMapping(UpdateMappingRequest) → UpdateMappingResponse`
9. `DeleteMapping(DeleteMappingRequest) → DeleteMappingResponse`

---

### 8. SearchService (1 RPC)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `Search(SearchRequest) → stream SearchHit` (Server Streaming)

---

### 9. TikzCompilerService (2 RPCs)

**Access Method**: gRPC-Web client only

#### RPCs:
1. `CompileTikz(CompileTikzRequest) → CompileTikzResponse`
2. `ListTemplates(ListTikzTemplatesRequest) → ListTikzTemplatesResponse`

---

## 📊 Common Types

### Response Structure
```protobuf
message Response {
  int32 code = 1;        // 0 = success, >0 = error code
  string message = 2;    // Human-readable message
  repeated Any details = 3;  // Additional error details
}
```

### Pagination
```protobuf
message PaginationRequest {
  int32 page = 1;        // Page number (1-based)
  int32 limit = 2;       // Items per page (default: 20, max: 100)
  string sort_by = 3;    // Field to sort by
  string sort_order = 4; // "asc" or "desc"
}

message PaginationResponse {
  int32 total = 1;       // Total items
  int32 page = 2;        // Current page
  int32 limit = 3;       // Items per page
  int32 total_pages = 4; // Total pages
  bool has_next = 5;     // Has next page
  bool has_prev = 6;     // Has previous page
}
```

### User Roles
```protobuf
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;
  USER_ROLE_STUDENT = 1;
  USER_ROLE_TUTOR = 2;
  USER_ROLE_TEACHER = 3;
  USER_ROLE_ADMIN = 4;
}
```

### User Status
```protobuf
enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;
  USER_STATUS_ACTIVE = 1;
  USER_STATUS_INACTIVE = 2;
  USER_STATUS_SUSPENDED = 3;
  USER_STATUS_BANNED = 4;
}
```

### Question Types
```protobuf
enum QuestionType {
  QUESTION_TYPE_UNSPECIFIED = 0;
  QUESTION_TYPE_MC = 1;  // Multiple Choice
  QUESTION_TYPE_TF = 2;  // True/False
  QUESTION_TYPE_SA = 3;  // Short Answer
  QUESTION_TYPE_ES = 4;  // Essay
  QUESTION_TYPE_MA = 5;  // Multiple Answer
}
```

### Question Status
```protobuf
enum QuestionStatus {
  QUESTION_STATUS_UNSPECIFIED = 0;
  QUESTION_STATUS_ACTIVE = 1;
  QUESTION_STATUS_PENDING = 2;
  QUESTION_STATUS_INACTIVE = 3;
  QUESTION_STATUS_ARCHIVED = 4;
}
```

### Difficulty Levels
```protobuf
enum DifficultyLevel {
  DIFFICULTY_LEVEL_UNSPECIFIED = 0;
  DIFFICULTY_LEVEL_EASY = 1;
  DIFFICULTY_LEVEL_MEDIUM = 2;
  DIFFICULTY_LEVEL_HARD = 3;
  DIFFICULTY_LEVEL_EXPERT = 4;
}
```

---

## ⚠️ Error Handling

### Error Codes
| Code | Name | Description |
|------|------|-------------|
| 0 | OK | Success |
| 1 | CANCELLED | Operation cancelled |
| 2 | UNKNOWN | Unknown error |
| 3 | INVALID_ARGUMENT | Invalid argument |
| 4 | DEADLINE_EXCEEDED | Deadline exceeded |
| 5 | NOT_FOUND | Resource not found |
| 6 | ALREADY_EXISTS | Resource already exists |
| 7 | PERMISSION_DENIED | Permission denied |
| 8 | RESOURCE_EXHAUSTED | Resource exhausted |
| 9 | FAILED_PRECONDITION | Failed precondition |
| 10 | ABORTED | Operation aborted |
| 11 | OUT_OF_RANGE | Out of range |
| 12 | UNIMPLEMENTED | Not implemented |
| 13 | INTERNAL | Internal error |
| 14 | UNAVAILABLE | Service unavailable |
| 15 | DATA_LOSS | Data loss |
| 16 | UNAUTHENTICATED | Not authenticated |

### Error Response Examples

#### 401 Unauthorized
```json
{
  "code": 16,
  "message": "authorization token is not provided",
  "details": []
}
```

#### 404 Not Found
```json
{
  "code": 5,
  "message": "Not Found",
  "details": []
}
```

#### 403 Permission Denied
```json
{
  "code": 7,
  "message": "Permission denied: Admin role required",
  "details": []
}
```

#### 400 Invalid Argument
```json
{
  "code": 3,
  "message": "Invalid email format",
  "details": [
    {
      "field": "email",
      "error": "must be a valid email address"
    }
  ]
}
```

---

## 📝 API Usage Examples

### Example 1: Login Flow (gRPC-Web)
```typescript
import { UserServiceClient } from '@/proto/user_grpc_web_pb';
import { LoginRequest } from '@/proto/user_pb';

// 1. Create client
const client = new UserServiceClient('http://localhost:8080');

// 2. Create request
const request = new LoginRequest();
request.setEmail('user@example.com');
request.setPassword('password123');

// 3. Call service
client.login(request, {}, (err, response) => {
  if (err) {
    console.error('Login failed:', err);
    return;
  }

  const data = response.toObject();

  // 4. Store tokens
  localStorage.setItem('access_token', data.accessToken);
  localStorage.setItem('refresh_token', data.refreshToken);

  // 5. Store user info
  console.log('User:', data.user);
});
```

### Example 2: Get Profile (HTTP REST)
```typescript
// Using fetch API
const response = await fetch('http://localhost:8080/api/v1/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Profile:', data.profile);
```

### Example 3: Create Question (gRPC-Web)
```typescript
import { QuestionServiceClient } from '@/proto/question_grpc_web_pb';
import { CreateQuestionRequest } from '@/proto/question_pb';

const client = new QuestionServiceClient('http://localhost:8080');
const request = new CreateQuestionRequest();

request.setRawContent('\\text{What is } 2 + 2?');
request.setContent('What is 2 + 2?');
request.setType(QuestionType.QUESTION_TYPE_MC);
request.setSource('Manual');

// Add metadata
const metadata = {
  'Authorization': `Bearer ${accessToken}`
};

client.createQuestion(request, metadata, (err, response) => {
  if (err) {
    console.error('Create question failed:', err);
    return;
  }

  const question = response.toObject().question;
  console.log('Created question:', question);
});
```

### Example 4: Submit Contact Form (HTTP REST)
```typescript
// Public endpoint - no auth required
const response = await fetch('http://localhost:8080/api/v1/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about pricing',
    message: 'I would like to know...',
    phone: '+84123456789'
  })
});

const data = await response.json();
console.log('Submission:', data.submission);
```

---

## 🔧 Development Tools

### Health Check
```bash
curl http://localhost:8080/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "exam-bank-backend",
  "timestamp": "1759983084"
}
```

### gRPC-Web Testing
Use browser DevTools or gRPC-Web client libraries:
- **Chrome DevTools**: Network tab → Filter by "grpc-web"
- **grpcurl**: Command-line tool for gRPC testing
- **BloomRPC**: GUI client for gRPC testing

### Postman Collection
Import OpenAPI spec from gRPC-Gateway:
```bash
curl http://localhost:8080/openapi.json > nynus-api.json
```

---

## 📚 Additional Resources

### Proto Files Location
```
packages/proto/v1/
├── user.proto
├── question.proto
├── exam.proto
├── profile.proto
├── admin.proto
├── contact.proto
├── newsletter.proto
├── notification.proto
├── blog.proto
├── import.proto
├── mapcode.proto
├── search.proto
├── tikz.proto
└── question_filter.proto
```

### Generated Code Location
```
apps/backend/pkg/proto/v1/     # Go generated code
apps/frontend/src/proto/       # TypeScript generated code
```

### Documentation Links
- **gRPC**: https://grpc.io/
- **gRPC-Web**: https://github.com/grpc/grpc-web
- **gRPC-Gateway**: https://github.com/grpc-ecosystem/grpc-gateway
- **Protocol Buffers**: https://protobuf.dev/

---

## 📊 API Summary

### Total Endpoints
```
HTTP REST Endpoints:  32+
├─ ProfileService:      7 endpoints
├─ ContactService:      5 endpoints
├─ NewsletterService:   6 endpoints
├─ AdminService:        8 endpoints
├─ NotificationService: 6 endpoints
└─ MapCodeService:      ?

gRPC-only RPCs:       60+
├─ UserService:         13 RPCs
├─ QuestionService:     9 RPCs
├─ ExamService:         17 RPCs
├─ QuestionFilterService: 3 RPCs
├─ BlogService:         10 RPCs
├─ ImportService:       4 RPCs
├─ SearchService:       1 RPC
├─ TikzCompilerService: 2 RPCs
└─ MapCodeService:      ?
```

### Authentication Required
- ✅ **All ProfileService endpoints**: Requires user token
- ✅ **All AdminService endpoints**: Requires admin token
- ✅ **Most UserService RPCs**: Requires token (except Login, Register)
- ❌ **ContactService.SubmitContactForm**: Public (no auth)
- ❌ **NewsletterService.Subscribe/Unsubscribe**: Public (no auth)

---

**Documentation Version**: 1.0.0
**Last Updated**: 2025-10-09
**Maintained By**: NyNus Development Team
**Contact**: dev@nynus.edu.vn

