# Mock Data Analysis - Complete Mapping

## Executive Summary

**Phát hiện**: Hệ thống NyNus có **50+ mock data files** trong `apps/frontend/src/lib/mockdata/` được sử dụng rộng rãi trong frontend.

**Backend Status**: Backend Go đã có đầy đủ:
- ✅ 8 gRPC services hoạt động
- ✅ Database repositories với PostgreSQL
- ✅ Prisma schema đầy đủ
- ✅ Migration scripts

**Chiến lược**: Thay thế từng module mock data bằng gRPC service calls thực tế.

---

## Mock Data Inventory

### 1. Users Module (`apps/frontend/src/lib/mockdata/users/`)
**Files**:
- `admin-users.ts` - 200+ mock users với roles, stats, profiles
- `student-users.ts` - Mock student data
- `instructor-users.ts` - Mock instructor data
- `generate-large-dataset.ts` - Generator cho test data

**Database Tables**:
- `users` - Main user table
- `user_sessions` - Active sessions
- `user_preferences` - User settings
- `oauth_accounts` - OAuth providers

**gRPC Service**: `UserService` (apps/backend/internal/grpc/user_service_enhanced.go)
**Methods**:
- `ListUsers()` - Get users with pagination & filters
- `GetUser()` - Get single user by ID
- `UpdateUserRole()` - Update user role
- `UpdateUserLevel()` - Update user level
- `UpdateUserStatus()` - Update user status

**Repository**: `apps/backend/internal/repository/user.go`
**Key Methods**:
- `GetByID()`
- `GetByEmail()`
- `GetByRole()`
- `GetUsersByPaging()`
- `Update()`

---

### 2. Questions Module (`apps/frontend/src/lib/mockdata/questions/`)
**Files**:
- `multiple-choice.ts` - Mock MC questions
- `enhanced-questions.ts` - Enhanced question data
- `true-false.ts` - True/False questions
- `question-codes.ts` - Question classification codes

**Database Tables**:
- `question` - Main questions table
- `question_code` - Question classification
- `question_image` - Question images
- `question_tag` - Question tags
- `question_feedback` - User feedback

**gRPC Services**:
1. `QuestionService` (apps/backend/internal/grpc/question_service.go)
   - `CreateQuestion()`
   - `GetQuestion()`
   - `ListQuestions()`
   - `UpdateQuestion()`
   - `DeleteQuestion()`

2. `QuestionFilterService` (apps/backend/internal/grpc/question_filter_service.go)
   - `ListQuestionsByFilter()`
   - `SearchQuestions()`
   - `GetQuestionsByQuestionCode()`

**Repository**: `apps/backend/internal/repository/question_repository.go`
**Key Methods**:
- `Create()`
- `GetByID()`
- `GetAll()`
- `FindWithFilters()`
- `Search()`

---

### 3. Analytics Module (`apps/frontend/src/lib/mockdata/analytics/`)
**Files**:
- `analytics.ts` - System analytics, user growth, question usage

**Database Tables**:
- `exam_attempts` - For exam statistics
- `course_enrollments` - For course statistics
- `users` - For user growth
- `question` - For question usage

**gRPC Service**: `AdminService` (apps/backend/internal/grpc/admin_service.go)
**Methods**:
- `GetSystemStats()` - System-wide statistics
- `GetAuditLogs()` - Audit trail
- `GetResourceAccess()` - Resource access logs

**Note**: Analytics cần implement thêm aggregation queries trong backend

---

### 4. Sessions Module (`apps/frontend/src/lib/mockdata/sessions.ts`)
**Files**:
- `sessions.ts` - User session data

**Database Tables**:
- `user_sessions` - Active user sessions
- `exam_sessions` - Exam session tracking

**gRPC Service**: `ProfileService` (apps/backend/internal/grpc/profile_service.go)
**Methods**:
- `GetSessions()` - Get user sessions
- `TerminateSession()` - Terminate specific session
- `TerminateAllSessions()` - Terminate all sessions

**Repository**: `apps/backend/internal/repository/session.go`
**Key Methods**:
- `CreateSession()`
- `GetByUserID()`
- `GetActiveSessionsByUserID()`
- `TerminateSession()`

---

### 5. Notifications Module (`apps/frontend/src/lib/mockdata/notifications.ts`)
**Files**:
- `notifications.ts` - System notifications

**Database Tables**:
- `notifications` - User notifications

**gRPC Service**: `NotificationService` (apps/backend/internal/grpc/notification_service.go)
**Methods**:
- `GetNotifications()` - Get user notifications
- `MarkAsRead()` - Mark notification as read
- `DeleteNotification()` - Delete notification

**Repository**: `apps/backend/internal/repository/notification.go`
**Key Methods**:
- `GetByUserID()`
- `GetUnreadByUserID()`
- `MarkAsRead()`
- `Delete()`

---

### 6. Content Module (`apps/frontend/src/lib/mockdata/content/`)
**Files**:
- `books.ts` - Educational books
- `faq.ts` - FAQ data
- `forum.ts` - Forum posts

**Database Tables**: ❌ **NOT IN DATABASE**
**Status**: **Static content - Keep as mock data**
**Reason**: Books, FAQs, Forums không có trong database schema hiện tại

**Action**: Giữ nguyên mock data cho content module

---

### 7. Courses Module (`apps/frontend/src/lib/mockdata/courses/`)
**Files**:
- `featured-courses.ts` - Course listings
- `course-details.ts` - Course details, chapters, lessons

**Database Tables**:
- `course_enrollments` - User course enrollments

**Status**: **Partial database support**
**Note**: Course content (chapters, lessons) không có trong database
**Action**: 
- Enrollments: Use database
- Course content: Keep mock data

---

### 8. Admin Module (`apps/frontend/src/lib/mockdata/admin/`)
**Files**:
- `dashboard-metrics.ts` - Dashboard statistics
- `header-navigation.ts` - Admin header data
- `sidebar-navigation.ts` - Admin sidebar menu
- `roles-permissions.ts` - RBAC data
- `mapcode.ts` - MapCode versions

**Database Tables**:
- `audit_logs` - Audit trail
- `resource_access` - Resource access logs
- `mapcode_versions` - MapCode versions

**gRPC Service**: `AdminService`
**Methods**:
- `ListUsers()` - User management
- `GetAuditLogs()` - Audit logs
- `GetResourceAccess()` - Resource access
- `GetSecurityAlerts()` - Security alerts

**Status**: **Mixed**
- Dashboard metrics: Needs aggregation queries
- Navigation: Static - keep as mock
- Roles/Permissions: Static - keep as mock
- MapCode: Use database

---

### 9. Auth Module (`apps/frontend/src/lib/mockdata/auth/`)
**Files**:
- `mock-users.ts` - Auth user data
- `auth-enhanced.ts` - Enhanced auth data (sessions, OAuth, audit logs)

**Database Tables**:
- `users` - User accounts
- `user_sessions` - Active sessions
- `oauth_accounts` - OAuth providers
- `refresh_tokens` - JWT refresh tokens
- `audit_logs` - Audit trail

**gRPC Services**:
- `UserService` - Authentication
- `ProfileService` - User profile & sessions

**Status**: ✅ **Fully supported by database**

---

### 10. Homepage Module (`apps/frontend/src/lib/mockdata/homepage*.ts`)
**Files**:
- `homepage.ts` - Hero, features, AI learning data
- `homepage-faq.ts` - Homepage FAQs
- `homepage-featured-courses.ts` - Featured courses
- `testimonials.ts` - User testimonials

**Database Tables**: ❌ **NOT IN DATABASE**
**Status**: **Static marketing content**
**Action**: **Keep as mock data** - This is static content

---

## Priority Mapping

### 🔴 High Priority - Replace with Database
1. **Users** - Full gRPC support
2. **Questions** - Full gRPC support
3. **Auth/Sessions** - Full gRPC support
4. **Notifications** - Full gRPC support

### 🟡 Medium Priority - Partial Support
5. **Analytics** - Needs aggregation queries
6. **Course Enrollments** - Database support available
7. **Admin Dashboard** - Needs aggregation queries

### 🟢 Low Priority - Keep as Mock
8. **Content (Books, FAQs, Forum)** - No database tables
9. **Homepage** - Static marketing content
10. **Navigation/Menus** - Static UI data
11. **Roles/Permissions** - Static RBAC config

---

## Next Steps

1. ✅ **Phase 1 Complete**: Mock data analysis done
2. **Phase 2**: Create detailed migration plan for each high-priority module
3. **Phase 3**: Implement missing backend queries (analytics aggregations)
4. **Phase 4**: Replace mock data with gRPC calls
5. **Phase 5**: Testing & validation
6. **Phase 6**: Cleanup unused mock files

---

**Generated**: 2025-01-19
**Status**: Analysis Complete - Ready for Phase 2

