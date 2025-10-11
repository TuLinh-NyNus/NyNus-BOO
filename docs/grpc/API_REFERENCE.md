# API Reference - gRPC Services

## Overview

This document provides complete API reference for all gRPC services in NyNus Exam Bank System.

**Service Status Legend**:
- ✅ Fully implemented and tested
- ⚠️ Partially implemented
- ❌ Proto only, no implementation

---

## 1. UserService ✅

**Proto File**: `packages/proto/v1/user.proto`  
**Backend**: `apps/backend/internal/grpc/user_service_enhanced.go`  
**Frontend**: `apps/frontend/src/services/grpc/auth.service.ts`

### 1.1 Login

**RPC**: `Login(LoginRequest) returns (LoginResponse)`

**Description**: Authenticates user with email and password

**Auth Required**: No (public endpoint)

**Rate Limit**: 1 request per 10 seconds (burst: 3)

**Request**:
```protobuf
message LoginRequest {
  string email = 1;       // User email address
  string password = 2;    // User password (plain text, will be hashed)
}
```

**Response**:
```protobuf
message LoginResponse {
  common.Response response = 1;
  string access_token = 2;   // JWT access token (15 min expiry)
  string refresh_token = 3;  // JWT refresh token (7 days expiry)
  User user = 4;             // User information
}
```

**Example (TypeScript)**:
```typescript
import { AuthService } from '@/services/grpc/auth.service';

try {
  const response = await AuthService.login('user@example.com', 'password123');
  console.log('Access Token:', response.getAccessToken());
  console.log('User:', response.getUser().toObject());
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Error Codes**:
- `INVALID_ARGUMENT` (3): Invalid email or password format
- `UNAUTHENTICATED` (16): Invalid credentials
- `PERMISSION_DENIED` (7): Account locked or suspended
- `RESOURCE_EXHAUSTED` (8): Rate limit exceeded

---

### 1.2 GoogleLogin

**RPC**: `GoogleLogin(GoogleLoginRequest) returns (LoginResponse)`

**Description**: Authenticates user with Google OAuth

**Auth Required**: No (public endpoint)

**Rate Limit**: 1 request per 10 seconds (burst: 3)

**Request**:
```protobuf
message GoogleLoginRequest {
  string id_token = 1;    // Google ID token from OAuth flow
}
```

**Response**: Same as `LoginResponse`

**Example (TypeScript)**:
```typescript
// After Google OAuth flow
const googleIdToken = await getGoogleIdToken();

const response = await AuthService.googleLogin(googleIdToken);
console.log('User:', response.getUser().toObject());
```

**Error Codes**:
- `UNAUTHENTICATED` (16): Invalid Google token
- `INTERNAL` (13): Failed to create user account

---

### 1.3 Register

**RPC**: `Register(RegisterRequest) returns (RegisterResponse)`

**Description**: Creates new user account

**Auth Required**: No (public endpoint)

**Rate Limit**: 1 request per minute (burst: 1)

**Request**:
```protobuf
message RegisterRequest {
  string email = 1;
  string password = 2;
  string first_name = 3;
  string last_name = 4;
  string username = 5;     // Optional, auto-generated if not provided
}
```

**Response**:
```protobuf
message RegisterResponse {
  common.Response response = 1;
  User user = 2;
  string verification_token = 3;  // Email verification token
}
```

**Example (TypeScript)**:
```typescript
const response = await AuthService.register({
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe'
});

console.log('User created:', response.getUser().toObject());
console.log('Verification token:', response.getVerificationToken());
```

**Error Codes**:
- `INVALID_ARGUMENT` (3): Invalid input (weak password, invalid email)
- `ALREADY_EXISTS` (6): Email already registered
- `RESOURCE_EXHAUSTED` (8): Rate limit exceeded

---

### 1.4 RefreshToken

**RPC**: `RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse)`

**Description**: Obtains new access token using refresh token

**Auth Required**: No (uses refresh token)

**Rate Limit**: Default (5 req/s)

**Request**:
```protobuf
message RefreshTokenRequest {
  string refresh_token = 1;
}
```

**Response**:
```protobuf
message RefreshTokenResponse {
  common.Response response = 1;
  string access_token = 2;   // New access token
  string refresh_token = 3;  // New refresh token (token rotation)
}
```

**Example (TypeScript)**:
```typescript
const refreshToken = localStorage.getItem('nynus-refresh-token');

const response = await AuthService.refreshToken(refreshToken);

// Store new tokens
localStorage.setItem('nynus-auth-token', response.getAccessToken());
localStorage.setItem('nynus-refresh-token', response.getRefreshToken());
```

**Error Codes**:
- `UNAUTHENTICATED` (16): Invalid or expired refresh token

---

### 1.5 VerifyEmail

**RPC**: `VerifyEmail(VerifyEmailRequest) returns (VerifyEmailResponse)`

**Description**: Verifies user email address

**Auth Required**: No (uses verification token)

**Request**:
```protobuf
message VerifyEmailRequest {
  string token = 1;  // Email verification token
}
```

**Response**:
```protobuf
message VerifyEmailResponse {
  common.Response response = 1;
  bool verified = 2;
}
```

**Error Codes**:
- `INVALID_ARGUMENT` (3): Invalid token format
- `NOT_FOUND` (5): Token not found or expired

---

### 1.6 ForgotPassword

**RPC**: `ForgotPassword(ForgotPasswordRequest) returns (ForgotPasswordResponse)`

**Description**: Initiates password reset flow

**Auth Required**: No (public endpoint)

**Rate Limit**: 1 request per minute (burst: 1)

**Request**:
```protobuf
message ForgotPasswordRequest {
  string email = 1;
}
```

**Response**:
```protobuf
message ForgotPasswordResponse {
  common.Response response = 1;
  string reset_token = 2;  // Password reset token (sent via email)
}
```

**Error Codes**:
- `NOT_FOUND` (5): Email not found
- `RESOURCE_EXHAUSTED` (8): Rate limit exceeded

---

### 1.7 ResetPassword

**RPC**: `ResetPassword(ResetPasswordRequest) returns (ResetPasswordResponse)`

**Description**: Resets user password

**Auth Required**: No (uses reset token)

**⚠️ Security Note**: This endpoint is public and lacks CSRF protection

**Request**:
```protobuf
message ResetPasswordRequest {
  string token = 1;         // Password reset token
  string new_password = 2;  // New password
}
```

**Response**:
```protobuf
message ResetPasswordResponse {
  common.Response response = 1;
  bool success = 2;
}
```

**Error Codes**:
- `INVALID_ARGUMENT` (3): Invalid token or weak password
- `NOT_FOUND` (5): Token not found or expired

---

### 1.8 GetUser

**RPC**: `GetUser(GetUserRequest) returns (GetUserResponse)`

**Description**: Retrieves user information

**Auth Required**: Yes

**Request**:
```protobuf
message GetUserRequest {
  string user_id = 1;  // User ID to retrieve (empty = current user)
}
```

**Response**:
```protobuf
message GetUserResponse {
  common.Response response = 1;
  User user = 2;
}
```

**Error Codes**:
- `UNAUTHENTICATED` (16): Not authenticated
- `NOT_FOUND` (5): User not found
- `PERMISSION_DENIED` (7): Cannot access other user's data

---

### 1.9 ListUsers

**RPC**: `ListUsers(ListUsersRequest) returns (ListUsersResponse)`

**Description**: Lists all users (Admin only)

**Auth Required**: Yes (ADMIN role)

**Request**:
```protobuf
message ListUsersRequest {
  common.PaginationRequest pagination = 1;
  UserFilter filter = 2;  // Optional filter
}

message UserFilter {
  common.UserRole role = 1;
  common.UserStatus status = 2;
  bool email_verified = 3;
}
```

**Response**:
```protobuf
message ListUsersResponse {
  common.Response response = 1;
  repeated User users = 2;
  common.PaginationResponse pagination = 3;
}
```

**Error Codes**:
- `UNAUTHENTICATED` (16): Not authenticated
- `PERMISSION_DENIED` (7): Not admin

---

### 1.10 UpdateUser

**RPC**: `UpdateUser(UpdateUserRequest) returns (UpdateUserResponse)`

**Description**: Updates user information

**Auth Required**: Yes (own profile or ADMIN)

**Request**:
```protobuf
message UpdateUserRequest {
  string user_id = 1;
  string first_name = 2;
  string last_name = 3;
  string username = 4;
  string avatar = 5;
}
```

**Response**:
```protobuf
message UpdateUserResponse {
  common.Response response = 1;
  User user = 2;
}
```

**Error Codes**:
- `UNAUTHENTICATED` (16): Not authenticated
- `PERMISSION_DENIED` (7): Cannot update other user's profile
- `ALREADY_EXISTS` (6): Username already taken

---

## 2. QuestionService ✅

**Proto File**: `packages/proto/v1/question.proto`  
**Backend**: `apps/backend/internal/grpc/question_service.go`  
**Frontend**: `apps/frontend/src/services/grpc/question.service.ts`

### 2.1 CreateQuestion

**RPC**: `CreateQuestion(CreateQuestionRequest) returns (CreateQuestionResponse)`

**Description**: Creates new question

**Auth Required**: Yes (TEACHER or ADMIN)

**Request**:
```protobuf
message CreateQuestionRequest {
  string raw_content = 1;           // LaTeX content
  string content = 2;               // Processed content
  string subcount = 3;              // [XX.N] format
  common.QuestionType type = 4;     // MC, TF, SA, ES, MA
  string source = 5;
  oneof answer_data {
    AnswerList structured_answers = 6;
    string json_answers = 7;
  }
  repeated string tags = 8;
  common.DifficultyLevel difficulty = 9;
  string category = 10;
}
```

**Response**:
```protobuf
message CreateQuestionResponse {
  common.Response response = 1;
  Question question = 2;
}
```

**Example (TypeScript)**:
```typescript
const response = await QuestionService.createQuestion({
  rawContent: '\\text{What is } 2 + 2?',
  content: 'What is 2 + 2?',
  subcount: '[01.1]',
  type: QuestionType.MULTIPLE_CHOICE,
  source: 'Math Textbook',
  structuredAnswers: {
    answers: [
      { content: '3', isCorrect: false },
      { content: '4', isCorrect: true },
      { content: '5', isCorrect: false },
    ]
  },
  tags: ['math', 'arithmetic'],
  difficulty: DifficultyLevel.EASY,
  category: 'Mathematics'
});
```

**Error Codes**:
- `INVALID_ARGUMENT` (3): Invalid question data
- `PERMISSION_DENIED` (7): Not authorized to create questions

---

### 2.2 ParseLatexQuestion

**RPC**: `ParseLatexQuestion(ParseLatexQuestionRequest) returns (ParseLatexQuestionResponse)`

**Description**: Parses LaTeX content into structured question

**Auth Required**: Yes

**Request**:
```protobuf
message ParseLatexQuestionRequest {
  string latex_content = 1;
}
```

**Response**:
```protobuf
message ParseLatexQuestionResponse {
  common.Response response = 1;
  repeated Question questions = 2;  // Parsed questions
}
```

**Example (TypeScript)**:
```typescript
const latexContent = `
\\begin{question}
What is the capital of France?
\\begin{choices}
\\choice Paris
\\choice London
\\choice Berlin
\\end{choices}
\\end{question}
`;

const response = await QuestionService.parseLatex(latexContent);
console.log('Parsed questions:', response.getQuestionsList());
```

---

## 3. QuestionFilterService ✅

**Proto File**: `packages/proto/v1/question_filter.proto`
**Backend**: `apps/backend/internal/grpc/question_filter_service.go`
**Frontend**: `apps/frontend/src/services/grpc/question-filter.service.ts`

### 3.1 ListQuestionsByFilter

**RPC**: `ListQuestionsByFilter(ListQuestionsByFilterRequest) returns (ListQuestionsByFilterResponse)`

**Description**: Advanced filtering for questions

**Auth Required**: Yes

**Request**:
```protobuf
message ListQuestionsByFilterRequest {
  common.PaginationRequest pagination = 1;
  QuestionFilter filter = 2;
}

message QuestionFilter {
  common.QuestionType type = 1;
  common.DifficultyLevel difficulty = 2;
  string category = 3;
  repeated string tags = 4;
  common.QuestionStatus status = 5;
}
```

**Response**:
```protobuf
message ListQuestionsByFilterResponse {
  common.Response response = 1;
  repeated Question questions = 2;
  common.PaginationResponse pagination = 3;
}
```

**Example (TypeScript)**:
```typescript
const response = await QuestionFilterService.listByFilter({
  pagination: { page: 1, pageSize: 20 },
  filter: {
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.MEDIUM,
    category: 'Mathematics',
    tags: ['algebra', 'equations']
  }
});
```

---

### 3.2 SearchQuestions

**RPC**: `SearchQuestions(SearchQuestionsRequest) returns (SearchQuestionsResponse)`

**Description**: Full-text search using OpenSearch

**Auth Required**: Yes

**Request**:
```protobuf
message SearchQuestionsRequest {
  string query = 1;                    // Search query
  common.PaginationRequest pagination = 2;
}
```

**Response**:
```protobuf
message SearchQuestionsResponse {
  common.Response response = 1;
  repeated Question questions = 2;
  common.PaginationResponse pagination = 3;
  float max_score = 4;                 // Highest relevance score
}
```

---

### 3.3 GetQuestionsByQuestionCode

**RPC**: `GetQuestionsByQuestionCode(GetQuestionsByQuestionCodeRequest) returns (GetQuestionsByQuestionCodeResponse)`

**Description**: Lookup questions by question code

**Auth Required**: Yes

**Request**:
```protobuf
message GetQuestionsByQuestionCodeRequest {
  string question_code = 1;  // Format: [XX.N]
}
```

---

## 4. ExamService ⚠️

**Proto File**: `packages/proto/v1/exam.proto`
**Backend**: `apps/backend/internal/grpc/exam_service.go` ✅
**Frontend**: `apps/frontend/src/services/grpc/exam.service.ts` ⚠️ **MOCK**
**HTTP Gateway**: ❌ **NOT REGISTERED**

### 4.1 CreateExam

**RPC**: `CreateExam(CreateExamRequest) returns (CreateExamResponse)`

**Description**: Creates new exam

**Auth Required**: Yes (TEACHER or ADMIN)

**Request**:
```protobuf
message CreateExamRequest {
  string title = 1;
  string description = 2;
  repeated string question_ids = 3;
  int32 duration_minutes = 4;
  google.protobuf.Timestamp start_time = 5;
  google.protobuf.Timestamp end_time = 6;
}
```

**Response**:
```protobuf
message CreateExamResponse {
  common.Response response = 1;
  Exam exam = 2;
}
```

---

### 4.2 StartExam

**RPC**: `StartExam(StartExamRequest) returns (StartExamResponse)`

**Description**: Starts exam attempt for student

**Auth Required**: Yes (STUDENT or higher)

**Request**:
```protobuf
message StartExamRequest {
  string exam_id = 1;
}
```

**Response**:
```protobuf
message StartExamResponse {
  common.Response response = 1;
  ExamAttempt attempt = 2;
  repeated Question questions = 3;
}
```

---

### 4.3 SubmitExam

**RPC**: `SubmitExam(SubmitExamRequest) returns (SubmitExamResponse)`

**Description**: Submits completed exam

**Auth Required**: Yes

**Request**:
```protobuf
message SubmitExamRequest {
  string attempt_id = 1;
  repeated ExamAnswer answers = 2;
}
```

**Response**:
```protobuf
message SubmitExamResponse {
  common.Response response = 1;
  float score = 2;
  bool is_graded = 3;
}
```

---

## 5. AdminService ✅

**Proto File**: `packages/proto/v1/admin.proto`
**Backend**: `apps/backend/internal/grpc/admin_service.go`
**Frontend**: `apps/frontend/src/services/grpc/admin.service.ts`

### 5.1 ListUsers

**RPC**: `ListUsers(AdminListUsersRequest) returns (AdminListUsersResponse)`

**Description**: Lists all users (Admin only)

**Auth Required**: Yes (ADMIN only)

**Request**:
```protobuf
message AdminListUsersRequest {
  common.PaginationRequest pagination = 1;
  ListUsersFilter filter = 2;
}

message ListUsersFilter {
  common.UserRole role = 1;
  common.UserStatus status = 2;
  int32 level = 3;
  bool email_verified = 4;
  string search_query = 5;
}
```

---

### 5.2 UpdateUserRole

**RPC**: `UpdateUserRole(UpdateUserRoleRequest) returns (UpdateUserRoleResponse)`

**Description**: Updates user role

**Auth Required**: Yes (ADMIN only)

**Request**:
```protobuf
message UpdateUserRoleRequest {
  string user_id = 1;
  common.UserRole new_role = 2;
}
```

---

### 5.3 GetAuditLogs

**RPC**: `GetAuditLogs(GetAuditLogsRequest) returns (GetAuditLogsResponse)`

**Description**: Retrieves audit logs

**Auth Required**: Yes (ADMIN only)

**Request**:
```protobuf
message GetAuditLogsRequest {
  common.PaginationRequest pagination = 1;
  string user_id = 2;           // Optional filter
  string action = 3;            // Optional filter
  string resource_type = 4;     // Optional filter
}
```

---

## 6. ProfileService ✅

**Proto File**: `packages/proto/v1/profile.proto`
**Backend**: `apps/backend/internal/grpc/profile_service.go`
**Frontend**: `apps/frontend/src/services/grpc/profile.service.ts`

### 6.1 GetProfile

**RPC**: `GetProfile(GetProfileRequest) returns (GetProfileResponse)`

**Description**: Retrieves user profile

**Auth Required**: Yes

---

### 6.2 UpdateProfile

**RPC**: `UpdateProfile(UpdateProfileRequest) returns (UpdateProfileResponse)`

**Description**: Updates user profile

**Auth Required**: Yes

---

### 6.3 GetSessions

**RPC**: `GetSessions(GetSessionsRequest) returns (GetSessionsResponse)`

**Description**: Lists active sessions

**Auth Required**: Yes

---

### 6.4 TerminateSession

**RPC**: `TerminateSession(TerminateSessionRequest) returns (TerminateSessionResponse)`

**Description**: Terminates specific session

**Auth Required**: Yes

---

## 7. ContactService ✅

**Proto File**: `packages/proto/v1/contact.proto`
**Backend**: `apps/backend/internal/grpc/contact_service.go`
**Frontend**: `apps/frontend/src/services/grpc/contact.service.ts`

### 7.1 SubmitContactForm

**RPC**: `SubmitContactForm(SubmitContactFormRequest) returns (SubmitContactFormResponse)`

**Description**: Submits contact form

**Auth Required**: No (public endpoint)

---

## 8. NewsletterService ✅

**Proto File**: `packages/proto/v1/newsletter.proto`
**Backend**: `apps/backend/internal/grpc/newsletter_service.go`
**Frontend**: `apps/frontend/src/services/grpc/newsletter.service.ts`

### 8.1 Subscribe

**RPC**: `Subscribe(SubscribeRequest) returns (SubscribeResponse)`

**Description**: Subscribes to newsletter

**Auth Required**: No (public endpoint)

---

## 9. NotificationService ⚠️

**Proto File**: `packages/proto/v1/notification.proto`
**Backend**: `apps/backend/internal/grpc/notification_service.go` ✅
**Frontend**: `apps/frontend/src/services/grpc/notification.service.ts` ⚠️ **MOCK**
**HTTP Gateway**: ❌ **NOT REGISTERED**

### 9.1 GetNotifications

**RPC**: `GetNotifications(GetNotificationsRequest) returns (GetNotificationsResponse)`

**Description**: Retrieves user notifications

**Auth Required**: Yes

---

### 9.2 SubscribeToNotifications (Streaming)

**RPC**: `SubscribeToNotifications(SubscribeRequest) returns (stream Notification)`

**Description**: Real-time notification stream

**Auth Required**: Yes

**Note**: Server streaming RPC

---

## 10. MapCodeService ❌

**Proto File**: `packages/proto/v1/mapcode.proto`
**Backend**: `apps/backend/internal/grpc/mapcode_service.go` ✅
**Frontend**: ❌ **STUB ONLY**
**HTTP Gateway**: ❌ **NOT REGISTERED**

### 10.1 GetQuestionByCode

**RPC**: `GetQuestionByCode(GetQuestionByCodeRequest) returns (GetQuestionByCodeResponse)`

**Description**: Maps question code to question ID

**Auth Required**: Yes

---

## 11-14. Proto-Only Services ❌

### 11. BlogService ❌
**Status**: Proto defined, no implementation

### 12. SearchService ❌
**Status**: Proto defined, no implementation
**Note**: QuestionFilterService already provides search

### 13. ImportService ❌
**Status**: Proto defined, no implementation
**Note**: QuestionService has ImportQuestions method

### 14. TikzCompilerService ❌
**Status**: Proto defined, no implementation

---

**Last Updated**: 2025-01-19
**Version**: 1.1.0 - Complete API Reference

