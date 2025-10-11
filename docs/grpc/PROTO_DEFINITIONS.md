# Protocol Buffer Definitions Reference

## Overview

This document provides complete reference for all Protocol Buffer definitions in NyNus Exam Bank System.

**Proto Files Location**: `packages/proto/`

**Generated Code**:
- **Go**: `apps/backend/pkg/proto/v1/*.pb.go`
- **TypeScript**: `apps/frontend/src/generated/v1/*_pb.ts`

---

## Common Types (`common/common.proto`)

### Enums

#### UserRole

**Description**: User role hierarchy for authorization

```protobuf
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;  // Default/unknown
  USER_ROLE_GUEST = 1;         // Guest user (limited access)
  USER_ROLE_STUDENT = 2;       // Student (can take exams)
  USER_ROLE_TUTOR = 3;         // Tutor (can create questions)
  USER_ROLE_TEACHER = 4;       // Teacher (can create exams)
  USER_ROLE_ADMIN = 5;         // Admin (full access)
}
```

**Hierarchy**: `ADMIN (5) > TEACHER (4) > TUTOR (3) > STUDENT (2) > GUEST (1)`

**Usage**:
- Authorization checks in RoleLevelInterceptor
- Content access control
- Feature gating

---

#### UserStatus

**Description**: User account status

```protobuf
enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;
  USER_STATUS_ACTIVE = 1;       // Active account
  USER_STATUS_INACTIVE = 2;     // Temporarily inactive
  USER_STATUS_SUSPENDED = 3;    // Suspended by admin
  USER_STATUS_BANNED = 4;       // Permanently banned
}
```

**Usage**:
- Account state management
- Login validation
- Admin user management

---

#### QuestionType

**Description**: Type of question

```protobuf
enum QuestionType {
  QUESTION_TYPE_UNSPECIFIED = 0;
  QUESTION_TYPE_MULTIPLE_CHOICE = 1;  // MC - Single correct answer
  QUESTION_TYPE_TRUE_FALSE = 2;       // TF - True/False
  QUESTION_TYPE_SHORT_ANSWER = 3;     // SA - Short text answer
  QUESTION_TYPE_ESSAY = 4;            // ES - Long text answer
  QUESTION_TYPE_MULTIPLE_ANSWER = 5;  // MA - Multiple correct answers
}
```

**Usage**:
- Question rendering
- Answer validation
- Grading logic

---

#### DifficultyLevel

**Description**: Question difficulty level

```protobuf
enum DifficultyLevel {
  DIFFICULTY_LEVEL_UNSPECIFIED = 0;
  DIFFICULTY_LEVEL_EASY = 1;
  DIFFICULTY_LEVEL_MEDIUM = 2;
  DIFFICULTY_LEVEL_HARD = 3;
  DIFFICULTY_LEVEL_EXPERT = 4;
}
```

**Usage**:
- Question filtering
- Exam difficulty balancing
- Student level matching

---

#### QuestionStatus

**Description**: Question publication status

```protobuf
enum QuestionStatus {
  QUESTION_STATUS_UNSPECIFIED = 0;
  QUESTION_STATUS_DRAFT = 1;      // Draft, not published
  QUESTION_STATUS_PUBLISHED = 2;  // Published, available for use
  QUESTION_STATUS_ARCHIVED = 3;   // Archived, not available
}
```

---

### Common Messages

#### Response

**Description**: Standard response wrapper for all RPCs

```protobuf
message Response {
  bool success = 1;           // Operation success status
  string message = 2;         // Human-readable message
  repeated string errors = 3; // Error messages (if any)
}
```

**Usage**: Included in all response messages

**Example**:
```json
{
  "success": true,
  "message": "User created successfully",
  "errors": []
}
```

---

#### PaginationRequest

**Description**: Pagination parameters for list operations

```protobuf
message PaginationRequest {
  int32 page = 1;       // Page number (1-based)
  int32 page_size = 2;  // Items per page (default: 20, max: 100)
  string sort_by = 3;   // Field to sort by
  bool ascending = 4;   // Sort order (true = ascending, false = descending)
}
```

**Example**:
```json
{
  "page": 1,
  "pageSize": 20,
  "sortBy": "created_at",
  "ascending": false
}
```

---

#### PaginationResponse

**Description**: Pagination metadata in responses

```protobuf
message PaginationResponse {
  int32 total_items = 1;   // Total number of items
  int32 total_pages = 2;   // Total number of pages
  int32 current_page = 3;  // Current page number
  int32 page_size = 4;     // Items per page
  bool has_next = 5;       // Has next page
  bool has_previous = 6;   // Has previous page
}
```

---

## UserService (`v1/user.proto`)

### Messages

#### User

**Description**: User entity

```protobuf
message User {
  string id = 1;                    // UUID
  string email = 2;                 // Unique email
  string first_name = 3;
  string last_name = 4;
  common.UserRole role = 5;         // User role
  bool is_active = 6;               // Active status
  int32 level = 7;                  // Level (1-9) for STUDENT/TUTOR/TEACHER
  string username = 8;              // Unique username
  string avatar = 9;                // Avatar URL
  common.UserStatus status = 10;    // Account status
  bool email_verified = 11;         // Email verification status
  string google_id = 12;            // Google OAuth ID (optional)
  google.protobuf.Timestamp created_at = 13;
  google.protobuf.Timestamp updated_at = 14;
}
```

**Field Notes**:
- `id`: UUID v4 format
- `email`: Must be unique, validated format
- `level`: Only applicable for STUDENT/TUTOR/TEACHER roles (1-9)
- `google_id`: Set when user registers via Google OAuth

---

#### LoginRequest

```protobuf
message LoginRequest {
  string email = 1;     // User email
  string password = 2;  // Plain text password (hashed on server)
}
```

---

#### LoginResponse

```protobuf
message LoginResponse {
  common.Response response = 1;
  string access_token = 2;   // JWT access token (15 min)
  string refresh_token = 3;  // JWT refresh token (7 days)
  User user = 4;             // User information
}
```

---

#### GoogleLoginRequest

```protobuf
message GoogleLoginRequest {
  string id_token = 1;  // Google ID token from OAuth flow
}
```

---

#### RegisterRequest

```protobuf
message RegisterRequest {
  string email = 1;
  string password = 2;      // Min 8 chars, must contain uppercase, lowercase, number
  string first_name = 3;
  string last_name = 4;
  string username = 5;      // Optional, auto-generated if not provided
}
```

---

#### RegisterResponse

```protobuf
message RegisterResponse {
  common.Response response = 1;
  User user = 2;
  string verification_token = 3;  // Email verification token
}
```

---

## QuestionService (`v1/question.proto`)

### Messages

#### Question

**Description**: Question entity

```protobuf
message Question {
  string id = 1;                        // UUID
  string raw_content = 2;               // Original LaTeX content
  string content = 3;                   // Processed/cleaned content
  string subcount = 4;                  // Question code [XX.N] format
  common.QuestionType type = 5;         // Question type
  string source = 6;                    // Source (textbook, exam, etc.)
  oneof answer_data {
    AnswerList structured_answers = 7;  // Structured answers
    string json_answers = 8;            // JSON string for complex answers
  }
  repeated string tags = 9;             // Tags for categorization
  common.DifficultyLevel difficulty = 10;
  string category = 11;                 // Category (Math, Physics, etc.)
  string created_by = 12;               // User ID of creator
  common.QuestionStatus status = 13;
  google.protobuf.Timestamp created_at = 14;
  google.protobuf.Timestamp updated_at = 15;
}
```

**Field Notes**:
- `raw_content`: Original LaTeX from user input
- `content`: Cleaned and processed for display
- `subcount`: Format `[XX.N]` where XX is chapter/section, N is question number
- `answer_data`: Use `structured_answers` for MC/TF/MA, `json_answers` for complex types

---

#### Answer

**Description**: Answer option for multiple choice questions

```protobuf
message Answer {
  string id = 1;            // Answer ID
  string content = 2;       // Answer text
  bool is_correct = 3;      // Correct answer flag
  string explanation = 4;   // Explanation (optional)
  int32 order = 5;          // Display order
}
```

---

#### AnswerList

**Description**: List of answers

```protobuf
message AnswerList {
  repeated Answer answers = 1;
}
```

---

#### CreateQuestionRequest

```protobuf
message CreateQuestionRequest {
  string raw_content = 1;
  string content = 2;
  string subcount = 3;
  common.QuestionType type = 4;
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

---

#### CreateQuestionResponse

```protobuf
message CreateQuestionResponse {
  common.Response response = 1;
  Question question = 2;
}
```

---

#### ParseLatexQuestionRequest

```protobuf
message ParseLatexQuestionRequest {
  string latex_content = 1;  // LaTeX content to parse
}
```

---

#### ParseLatexQuestionResponse

```protobuf
message ParseLatexQuestionResponse {
  common.Response response = 1;
  repeated Question questions = 2;  // Parsed questions
}
```

---

## ExamService (`v1/exam.proto`)

### Messages

#### Exam

**Description**: Exam entity

```protobuf
message Exam {
  string id = 1;
  string title = 2;
  string description = 3;
  repeated string question_ids = 4;     // Question IDs in exam
  int32 duration_minutes = 5;           // Exam duration
  google.protobuf.Timestamp start_time = 6;
  google.protobuf.Timestamp end_time = 7;
  string created_by = 8;
  bool is_published = 9;
  google.protobuf.Timestamp created_at = 10;
  google.protobuf.Timestamp updated_at = 11;
}
```

---

#### ExamAttempt

**Description**: User's exam attempt

```protobuf
message ExamAttempt {
  string id = 1;
  string exam_id = 2;
  string user_id = 3;
  google.protobuf.Timestamp started_at = 4;
  google.protobuf.Timestamp submitted_at = 5;
  repeated ExamAnswer answers = 6;
  float score = 7;                      // Calculated score
  bool is_graded = 8;
}
```

---

#### ExamAnswer

**Description**: User's answer to exam question

```protobuf
message ExamAnswer {
  string question_id = 1;
  oneof answer {
    string text_answer = 2;             // For SA, ES
    repeated string selected_ids = 3;   // For MC, MA
    bool boolean_answer = 4;            // For TF
  }
  bool is_correct = 5;                  // Set after grading
  float points = 6;                     // Points earned
}
```

---

## AdminService (`v1/admin.proto`)

### Messages

#### AuditLog

**Description**: Audit log entry

```protobuf
message AuditLog {
  string id = 1;
  string user_id = 2;
  string action = 3;                    // Action performed
  string resource_type = 4;             // Resource type (User, Question, etc.)
  string resource_id = 5;               // Resource ID
  string ip_address = 6;
  string user_agent = 7;
  google.protobuf.Timestamp timestamp = 8;
  string details = 9;                   // JSON details
}
```

---

#### SystemStats

**Description**: System statistics

```protobuf
message SystemStats {
  int32 total_users = 1;
  int32 active_users = 2;
  int32 total_questions = 3;
  int32 total_exams = 4;
  int32 total_attempts = 5;
  google.protobuf.Timestamp last_updated = 6;
}
```

---

## Code Generation

### Go Code Generation

**Command**:
```bash
cd packages/proto
buf generate --template buf.gen.yaml
```

**Output**: `apps/backend/pkg/proto/v1/*.pb.go`

**Usage in Go**:
```go
import (
    v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

user := &v1.User{
    Email:     "user@example.com",
    FirstName: "John",
    LastName:  "Doe",
    Role:      common.UserRole_USER_ROLE_STUDENT,
    Level:     3,
}
```

---

### TypeScript Code Generation

**Command**:
```bash
cd packages/proto
buf generate --template buf.gen.ts.yaml
```

**Output**: `apps/frontend/src/generated/v1/*_pb.ts`

**Usage in TypeScript**:
```typescript
import { User } from '@/generated/v1/user_pb';
import { UserRole } from '@/generated/common/common_pb';

const user = new User();
user.setEmail('user@example.com');
user.setFirstName('John');
user.setLastName('Doe');
user.setRole(UserRole.USER_ROLE_STUDENT);
user.setLevel(3);
```

---

## ProfileService (`v1/profile.proto`)

### Messages

#### UserProfile

```protobuf
message UserProfile {
  string user_id = 1;
  string bio = 2;
  string phone = 3;
  string address = 4;
  map<string, string> preferences = 5;
}
```

---

## ContactService (`v1/contact.proto`)

### Messages

#### ContactForm

```protobuf
message ContactForm {
  string id = 1;
  string name = 2;
  string email = 3;
  string subject = 4;
  string message = 5;
  string status = 6;  // PENDING, REPLIED, CLOSED
  google.protobuf.Timestamp created_at = 7;
}
```

---

## NewsletterService (`v1/newsletter.proto`)

### Messages

#### NewsletterSubscription

```protobuf
message NewsletterSubscription {
  string id = 1;
  string email = 2;
  bool is_active = 3;
  repeated string tags = 4;
  google.protobuf.Timestamp subscribed_at = 5;
}
```

---

## NotificationService (`v1/notification.proto`)

### Messages

#### Notification

```protobuf
message Notification {
  string id = 1;
  string user_id = 2;
  string title = 3;
  string message = 4;
  string type = 5;  // INFO, WARNING, ERROR, SUCCESS
  bool is_read = 6;
  google.protobuf.Timestamp created_at = 7;
}
```

---

## MapCodeService (`v1/mapcode.proto`)

### Messages

#### QuestionCodeMapping

```protobuf
message QuestionCodeMapping {
  string question_code = 1;  // [XX.N] format
  string question_id = 2;    // UUID
  google.protobuf.Timestamp created_at = 3;
}
```

---

## QuestionFilterService (`v1/question_filter.proto`)

### Messages

#### QuestionFilter

```protobuf
message QuestionFilter {
  common.QuestionType type = 1;
  common.DifficultyLevel difficulty = 2;
  string category = 3;
  repeated string tags = 4;
  common.QuestionStatus status = 5;
  string creator = 6;
  google.protobuf.Timestamp created_after = 7;
  google.protobuf.Timestamp created_before = 8;
}
```

---

## BlogService (`v1/blog.proto`) - Proto Only ❌

### Messages

#### BlogPost

```protobuf
message BlogPost {
  string id = 1;
  string title = 2;
  string content = 3;
  string author_id = 4;
  bool is_published = 5;
  repeated string tags = 6;
  google.protobuf.Timestamp created_at = 7;
  google.protobuf.Timestamp published_at = 8;
}
```

**Status**: Proto defined but no backend implementation

---

## SearchService (`v1/search.proto`) - Proto Only ❌

### Messages

#### SearchRequest

```protobuf
message SearchRequest {
  string query = 1;
  int32 limit = 2;
}
```

#### SearchHit (Server Streaming)

```protobuf
message SearchHit {
  string id = 1;
  string type = 2;  // question, exam, blog
  string title = 3;
  float score = 4;
}
```

**Status**: Proto defined but no backend implementation
**Note**: QuestionFilterService already provides search functionality

---

## ImportService (`v1/import.proto`) - Proto Only ❌

### Messages

#### FileChunk (Client Streaming)

```protobuf
message FileChunk {
  bytes data = 1;
  string filename = 2;
  int32 chunk_index = 3;
}
```

**Status**: Proto defined but no backend implementation
**Note**: QuestionService has ImportQuestions method

---

## TikzCompilerService (`v1/tikz.proto`) - Proto Only ❌

### Messages

#### CompileTikzRequest

```protobuf
message CompileTikzRequest {
  string tikz_code = 1;
  string template_id = 2;
}
```

#### CompileTikzResponse

```protobuf
message CompileTikzResponse {
  common.Response response = 1;
  string image_url = 2;
  string format = 3;  // png, svg, pdf
}
```

**Status**: Proto defined but no backend implementation

---

## Service Summary

### Production-Ready Services (7)
1. ✅ UserService
2. ✅ QuestionService
3. ✅ QuestionFilterService
4. ✅ AdminService
5. ✅ ProfileService
6. ✅ ContactService
7. ✅ NewsletterService

### Partially Implemented (3)
8. ⚠️ ExamService (backend ready, frontend mock, HTTP Gateway commented)
9. ⚠️ NotificationService (backend ready, frontend mock, HTTP Gateway missing)
10. ⚠️ MapCodeService (backend ready, frontend stub, HTTP Gateway commented)

### Proto Only (4)
11. ❌ BlogService
12. ❌ SearchService
13. ❌ ImportService
14. ❌ TikzCompilerService

---

## Code Generation

### Go Code Generation

**Command**:
```bash
cd packages/proto
buf generate --template buf.gen.yaml
```

**Output**: `apps/backend/pkg/proto/v1/*.pb.go`

**Usage in Go**:
```go
import (
    v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

user := &v1.User{
    Email:     "user@example.com",
    FirstName: "John",
    LastName:  "Doe",
    Role:      common.UserRole_USER_ROLE_STUDENT,
    Level:     3,
}
```

---

### TypeScript Code Generation

**Command**:
```bash
cd packages/proto
buf generate --template buf.gen.ts.yaml
```

**Output**: `apps/frontend/src/generated/v1/*_pb.ts`

**Usage in TypeScript**:
```typescript
import { User } from '@/generated/v1/user_pb';
import { UserRole } from '@/generated/common/common_pb';

const user = new User();
user.setEmail('user@example.com');
user.setFirstName('John');
user.setLastName('Doe');
user.setRole(UserRole.USER_ROLE_STUDENT);
user.setLevel(3);
```

---

**Last Updated**: 2025-01-19
**Version**: 1.1.0 - Complete Proto Definitions for All 14 Services

