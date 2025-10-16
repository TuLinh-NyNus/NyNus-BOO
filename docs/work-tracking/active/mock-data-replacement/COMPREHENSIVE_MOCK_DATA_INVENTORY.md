# Comprehensive Mock Data Inventory & Classification
**Date**: 2025-01-19  
**Status**: RESEARCH Phase 1 - Complete Analysis  
**Methodology**: RIPER-5 RESEARCH Mode

## Executive Summary

### Phát hiện chính
- **50+ mock data files** trong `apps/frontend/src/lib/mockdata/`
- **5 files** sử dụng `MockQuestionsService` (pending migration)
- **10 gRPC services** registered trong backend (7 production-ready, 3 partial)
- **30+ React components** sử dụng mock data
- **Intentional mock data** (Books, FAQs, Courses, Homepage) - KEEP AS IS

### Backend Status
✅ **Backend Infrastructure**: Hoàn chỉnh
- 10 gRPC services registered
- PostgreSQL database với Prisma ORM
- Complete repository layer
- Migration scripts ready

### Migration Status từ Previous Phases
✅ **Đã migrate thành công**:
- Users module → AdminService.listUsers()
- Questions module → QuestionFilterService
- Analytics module → AdminService.getSystemStats()
- Sessions module → Real gRPC calls
- Audit logs → AdminService.getAuditLogs()

⚠️ **Pending Migration**:
- MockQuestionsService (5 files)
- Exam service (partial implementation)
- Notification service (partial implementation)

❌ **Keep as Mock** (No backend support):
- Books system
- FAQs system
- Forum system
- Courses system (partial - only enrollment tracking)
- Homepage content

---

## 1. Frontend Mock Data Inventory

### 1.1 Core Mock Data Modules

#### Users Module (`apps/frontend/src/lib/mockdata/users/`)
**Status**: ✅ **MIGRATED** (Phase 4-5)

**Files**:
- `admin-users.ts` - 250 mock users (replaced by AdminService.listUsers())
- `student-users.ts` - Mock student data
- `instructor-users.ts` - Mock instructor data
- `generate-large-dataset.ts` - Generator for test data

**Migration Status**: Đã migrate sang real gRPC calls
**Backend Support**: ✅ EnhancedUserGRPCService
**Database**: ✅ `users` table

---

#### Questions Module (`apps/frontend/src/lib/mockdata/questions/`)
**Status**: ⚠️ **PARTIAL MIGRATION**

**Files**:
- `multiple-choice.ts` - Mock multiple choice questions
- `enhanced-questions.ts` - Enhanced question data
- `question-codes.ts` - Question classification codes
- `essay-questions.ts` - Essay type questions
- `short-answer.ts` - Short answer questions
- `true-false.ts` - True/false questions

**Migration Status**: 
- ✅ Question filtering → QuestionFilterService
- ⚠️ Question CRUD → MockQuestionsService (5 files still using)

**Backend Support**: 
- ✅ QuestionGRPCService (partial - missing 4 methods)
- ✅ QuestionFilterGRPCService (complete)

**Database**: ✅ `question`, `question_code`, `question_tag`, `question_image`, `question_feedback` tables

**Pending Files**:
1. `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`
2. `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx`
3. `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx`
4. `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx`
5. `apps/frontend/src/services/mock/questions.ts`

---

#### Analytics Module (`apps/frontend/src/lib/mockdata/analytics/`)
**Status**: ✅ **MIGRATED** (Phase 6)

**Files**:
- `analytics.ts` - System metrics, revenue data

**Migration Status**: Replaced with AdminService.getSystemStats()
**Backend Support**: ✅ AdminGRPCService
**Database**: ✅ `users`, `exam_attempts`, `course_enrollments` tables

---

#### Sessions Module (`apps/frontend/src/lib/mockdata/sessions.ts`)
**Status**: ✅ **MIGRATED**

**Migration Status**: Using real gRPC calls
**Backend Support**: ✅ SessionService
**Database**: ✅ `user_sessions` table

---

#### Notifications Module (`apps/frontend/src/lib/mockdata/notifications.ts`)
**Status**: ⚠️ **PARTIAL - KEEP AS MOCK**

**Files**:
- `notifications.ts` - System notifications
- `admin/notifications.ts` - Admin notifications

**Reason**: Backend NotificationService chỉ support user notifications, không có admin system notifications
**Backend Support**: ⚠️ NotificationGRPCService (user notifications only)
**Database**: ✅ `notifications` table (user notifications)

**Current Usage**:
- `apps/frontend/src/app/3141592654/admin/notifications/page.tsx` - Admin notifications page

---

### 1.2 Content Management Mock Data

#### Books System (`apps/frontend/src/lib/mockdata/content/books.ts`)
**Status**: ❌ **KEEP AS MOCK** (No backend support)

**Evidence**:
- ❌ No `books` table in database
- ❌ No `BookService` gRPC service
- ❌ No `book.proto` file
- ❌ No `BookRepository` in backend

**Current Usage**:
- `apps/frontend/src/app/3141592654/admin/books/page.tsx` - Admin books management
- Static educational content

**Recommendation**: Keep as mock - Low priority for backend implementation

---

#### FAQs System (`apps/frontend/src/lib/mockdata/content/faq.ts`)
**Status**: ❌ **KEEP AS MOCK** (No backend support)

**Evidence**:
- ❌ No `faqs` table in database
- ❌ No `FAQService` gRPC service
- ❌ No `faq.proto` file

**Current Usage**:
- `apps/frontend/src/app/3141592654/admin/faq/page.tsx` - Admin FAQ management
- `apps/frontend/src/app/faq/page.tsx` - Public FAQ page
- `apps/frontend/src/lib/mockdata/homepage-faq.ts` - Homepage FAQs

**Recommendation**: Keep as mock - Static content

---

#### Forum System (`apps/frontend/src/lib/mockdata/content/forum.ts`)
**Status**: ❌ **KEEP AS MOCK** (No backend support)

**Evidence**:
- ❌ No `forum_posts` table in database
- ❌ No `ForumService` gRPC service

**Recommendation**: Keep as mock - Future feature

---

#### Courses System (`apps/frontend/src/lib/mockdata/courses/`)
**Status**: ⚠️ **PARTIAL BACKEND SUPPORT**

**Files**:
- `featured-courses.ts` - 3 mock courses with full details
- `admin-courses.ts` - Admin course management
- `course-details.ts` - Detailed course content

**Backend Support**: ⚠️ **PARTIAL**
- ✅ `course_enrollments` table exists (enrollment tracking only)
- ❌ No `courses` table (course content)
- ❌ No `CourseService` gRPC service

**Current Usage**:
- `apps/frontend/src/app/courses/page.tsx` - Public courses page
- `apps/frontend/src/app/courses/[slug]/page.tsx` - Course details
- `apps/frontend/src/app/3141592654/admin/courses/page.tsx` - Admin courses

**Recommendation**: Keep as mock until full course system implemented

---

### 1.3 Homepage & UI Mock Data

#### Homepage Content (`apps/frontend/src/lib/mockdata/homepage/`)
**Status**: ❌ **KEEP AS MOCK** (Marketing content)

**Files**:
- `homepage.ts` - Hero data, features, AI learning
- `homepage-faq.ts` - Homepage FAQs
- `homepage-featured-courses.ts` - Featured courses for homepage

**Reason**: Static marketing content, không cần database
**Recommendation**: Keep as mock - Content management system future feature

---

#### Admin UI Mock Data (`apps/frontend/src/lib/mockdata/admin/`)
**Status**: ⚠️ **MIXED**

**Files**:
- `dashboard-metrics.ts` - ✅ MIGRATED (Phase 6)
- `header-navigation.ts` - ❌ KEEP (UI configuration)
- `sidebar-navigation.ts` - ❌ KEEP (UI configuration)
- `roles-permissions.ts` - ❌ KEEP (Static RBAC config)
- `security.ts` - ✅ MIGRATED (Audit logs)
- `level-progression.ts` - ⚠️ PARTIAL (Type definitions kept)
- `mapcode.ts` - ✅ MIGRATED (MapCodeService)

---

### 1.4 Authentication & Security Mock Data

#### Auth Enhanced (`apps/frontend/src/lib/mockdata/auth/`)
**Status**: ✅ **MIGRATED**

**Files**:
- `auth-enhanced.ts` - Enhanced sessions, OAuth accounts
- `sessions.ts` - User sessions
- `resource-access.ts` - Resource access tracking
- `mock-users.ts` - Mock admin user for auth context

**Migration Status**: Using real gRPC calls
**Backend Support**: ✅ EnhancedUserGRPCService, SessionService
**Database**: ✅ `user_sessions`, `oauth_accounts`, `resource_access` tables

---

### 1.5 Utility & Helper Mock Data

#### Settings Module (`apps/frontend/src/lib/mockdata/settings.ts`)
**Status**: ❌ **KEEP AS MOCK**

**Reason**: System settings configuration, low priority
**Backend Support**: ❌ No SettingsService

---

#### Level Progression (`apps/frontend/src/lib/mockdata/level-progression.ts`)
**Status**: ⚠️ **TYPE DEFINITIONS ONLY**

**Migration Status**: Functions removed, types kept
**Backend Support**: ✅ Partial (user level in users table)

---

#### User Management (`apps/frontend/src/lib/mockdata/user-management.ts`)
**Status**: ❌ **KEEP AS MOCK**

**Files**: Bulk operations, promotion requests, user activities
**Reason**: Advanced admin features, future implementation

---

## 2. Mock Services Inventory

### 2.1 MockQuestionsService (`apps/frontend/src/services/mock/questions.ts`)
**Status**: ⚠️ **PENDING MIGRATION** (HIGH PRIORITY)

**Usage**: 5 files
1. `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`
2. `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx`
3. `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx`
4. `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx`
5. `apps/frontend/src/services/mock/questions.ts` (service definition)

**Backend Support**: ⚠️ QuestionGRPCService (missing 4 methods)
**Missing Methods**:
- `CreateQuestion()`
- `UpdateQuestion()`
- `DeleteQuestion()`
- `ImportQuestions()`

**Action Required**: Implement missing backend methods

---

### 2.2 ExamService (`apps/frontend/src/services/grpc/exam.service.ts`)
**Status**: ⚠️ **PARTIAL IMPLEMENTATION**

**Mock Functions**:
- `createMockExam()` - Temporary mock exam generator
- `createMockExamAttempt()` - Mock attempt generator
- `createMockExamResult()` - Mock result generator

**Backend Support**: ✅ ExamGRPCService (basic implementation)
**Database**: ✅ `exams`, `exam_questions`, `exam_attempts`, `exam_answers`, `exam_results` tables

**Issue**: Frontend using mock data until protobuf conversion implemented
**Action Required**: Complete protobuf type conversion

---

### 2.3 MockWebSocketProvider (`apps/frontend/src/components/admin/providers/mock-websocket-provider.tsx`)
**Status**: ❌ **KEEP AS MOCK**

**Purpose**: Simulate WebSocket notifications for admin interface
**Reason**: Real-time notifications future feature
**Recommendation**: Keep until WebSocket infrastructure ready

---

## 3. Backend Infrastructure Analysis

### 3.1 Registered gRPC Services (from `apps/backend/internal/container/container.go`)

| Service | Status | Implementation | Database Support |
|---------|--------|----------------|------------------|
| EnhancedUserGRPCService | ✅ READY | Complete | ✅ users, user_sessions, oauth_accounts |
| QuestionGRPCService | ⚠️ PARTIAL | Missing 4 methods | ✅ question, question_code, question_tag |
| QuestionFilterGRPCService | ✅ READY | Complete | ✅ question tables |
| ExamGRPCService | ⚠️ PARTIAL | Basic implementation | ✅ exams, exam_attempts, exam_results |
| ProfileGRPCService | ✅ READY | Complete | ✅ users, user_preferences |
| AdminGRPCService | ✅ READY | Complete | ✅ audit_logs, resource_access, system_analytics |
| ContactGRPCService | ✅ READY | Complete | ✅ contact_submissions |
| NewsletterGRPCService | ✅ READY | Complete | ✅ newsletter_subscriptions |
| NotificationGRPCService | ⚠️ PARTIAL | User notifications only | ✅ notifications |
| MapCodeGRPCService | ✅ READY | Complete | ✅ question_code, mapcode_versions |

**Summary**:
- ✅ **7 Production-Ready Services**
- ⚠️ **3 Partial Services** (Questions, Exams, Notifications)
- ❌ **0 Missing Services** (all registered)

---

### 3.2 Database Schema Coverage

**Complete Tables** (có backend support):
- ✅ `users` - User management
- ✅ `user_sessions` - Session tracking
- ✅ `oauth_accounts` - OAuth integration
- ✅ `question` - Question content
- ✅ `question_code` - Question classification
- ✅ `question_tag` - Question tagging
- ✅ `question_image` - Question images
- ✅ `question_feedback` - User feedback
- ✅ `exams` - Exam management
- ✅ `exam_attempts` - Exam attempts
- ✅ `exam_results` - Exam results
- ✅ `audit_logs` - Audit logging
- ✅ `resource_access` - Resource tracking
- ✅ `contact_submissions` - Contact forms
- ✅ `newsletter_subscriptions` - Newsletter
- ✅ `notifications` - User notifications
- ✅ `course_enrollments` - Course enrollment tracking

**Missing Tables** (no backend support):
- ❌ `books` - Books system
- ❌ `faqs` - FAQs system
- ❌ `forum_posts` - Forum system
- ❌ `courses` - Course content (only enrollments exist)
- ❌ `settings` - System settings

---

## 4. Component Dependencies Analysis

### 4.1 Admin Pages Using Mock Data

**Migrated Successfully** (using real gRPC):
- ✅ `apps/frontend/src/app/3141592654/admin/page.tsx` - Dashboard (AdminService)
- ✅ `apps/frontend/src/app/3141592654/admin/users/page.tsx` - Users (AdminService)
- ✅ `apps/frontend/src/app/3141592654/admin/analytics/page.tsx` - Analytics (AdminService)
- ✅ `apps/frontend/src/app/3141592654/admin/audit-logs/page.tsx` - Audit logs (AdminService)

**Pending Migration**:
- ⚠️ `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx` - MockQuestionsService
- ⚠️ `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx` - MockQuestionsService
- ⚠️ `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx` - MockQuestionsService
- ⚠️ `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx` - MockQuestionsService

**Keep as Mock** (intentional):
- ❌ `apps/frontend/src/app/3141592654/admin/books/page.tsx` - Books mock data
- ❌ `apps/frontend/src/app/3141592654/admin/faq/page.tsx` - FAQs mock data
- ❌ `apps/frontend/src/app/3141592654/admin/courses/page.tsx` - Courses mock data
- ❌ `apps/frontend/src/app/3141592654/admin/notifications/page.tsx` - System notifications mock

---

### 4.2 Public Pages Using Mock Data

**Keep as Mock** (marketing/static content):
- ❌ `apps/frontend/src/app/page.tsx` - Homepage (hero, features, FAQs)
- ❌ `apps/frontend/src/app/courses/page.tsx` - Courses listing
- ❌ `apps/frontend/src/app/courses/[slug]/page.tsx` - Course details
- ❌ `apps/frontend/src/app/faq/page.tsx` - Public FAQs
- ❌ `apps/frontend/src/app/questions/search/page.tsx` - Mock search results

---

## 5. Classification Summary

### 5.1 By Migration Status

**✅ MIGRATED** (30+ files):
- Users module
- Analytics module
- Sessions module
- Audit logs module
- MapCode module
- Dashboard metrics

**⚠️ PENDING MIGRATION** (5 files):
- MockQuestionsService (HIGH PRIORITY)
- Exam service protobuf conversion
- Notification service (admin notifications)

**❌ KEEP AS MOCK** (20+ files):
- Books system (no backend)
- FAQs system (no backend)
- Forum system (no backend)
- Courses system (partial backend)
- Homepage content (marketing)
- UI configuration (sidebar, header)
- Settings (low priority)

### 5.2 By Priority

**🔴 CRITICAL** (Immediate action):
- MockQuestionsService migration (5 files)

**🟡 HIGH** (Next sprint):
- Exam service protobuf conversion
- Complete QuestionGRPCService (4 missing methods)

**🟢 MEDIUM** (Future):
- Admin system notifications
- Settings management
- User management advanced features

**⚪ LOW** (Optional):
- Books system backend
- FAQs system backend
- Forum system backend
- Full course system

---

## 6. Next Steps

### Immediate Actions (PLAN Phase)
1. ✅ Complete RESEARCH Phase 1 - Mock Data Inventory
2. ⏭️ RESEARCH Phase 2 - Backend Infrastructure Analysis
3. ⏭️ RESEARCH Phase 3 - Frontend Component Dependencies Mapping
4. ⏭️ PLAN Phase 4 - Migration Strategy & Prioritization
5. ⏭️ PLAN Phase 5 - Technical Implementation Plan
6. ⏭️ PLAN Phase 6 - Risk Assessment & Mitigation

### Migration Priorities
1. **Phase 1**: MockQuestionsService → QuestionGRPCService (5 files)
2. **Phase 2**: Exam service protobuf conversion
3. **Phase 3**: Admin notifications (if needed)
4. **Phase 4**: Settings management (if needed)

---

**Report Generated**: 2025-01-19  
**Methodology**: RIPER-5 RESEARCH Mode  
**Augment Context Engine Calls**: 10+  
**Files Analyzed**: 100+  
**Status**: ✅ RESEARCH Phase 1 Complete

