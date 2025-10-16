# Frontend Component Dependencies Map
**Date**: 2025-01-19  
**Status**: RESEARCH Phase 3 - Frontend Analysis  
**Methodology**: RIPER-5 RESEARCH Mode

## Executive Summary

### Component Analysis Results
- **Total Components Analyzed**: 50+ React components and pages
- **Using Mock Data**: 15 components (30%)
- **Migrated to Real Data**: 35+ components (70%)
- **Pending Migration**: 5 components (MockQuestionsService)
- **Intentional Mock**: 10 components (Books/FAQs/Courses/Homepage)

### Dependency Categories
1. **✅ MIGRATED** - Using real gRPC services (35+ components)
2. **⚠️ PENDING** - Need migration (5 components)
3. **❌ KEEP MOCK** - Intentional mock data (10 components)

---

## 1. Admin Pages Dependencies

### 1.1 Dashboard & Analytics (✅ MIGRATED)

#### `apps/frontend/src/app/3141592654/admin/page.tsx`
**Status**: ✅ **MIGRATED** (Phase 6)

**Dependencies**:
- ✅ `AdminService.getSystemStats()` - Real gRPC call
- ✅ `useDashboardData()` hook - Real data fetching
- ✅ `ConnectedAdminDashboard` component - Real-time updates

**Mock Data Removed**:
- ❌ `mockDashboardMetrics` (removed)
- ❌ `mockSystemStatus` (removed)
- ❌ `mockRecentActivities` (removed)

**Backend Service**: AdminGRPCService
**Database Tables**: users, exam_attempts, course_enrollments

---

#### `apps/frontend/src/app/3141592654/admin/analytics/page.tsx`
**Status**: ✅ **MIGRATED**

**Dependencies**:
- ✅ `AdminService.getSystemStats()` - Real analytics data
- ✅ Real-time metrics calculation

**Backend Service**: AdminGRPCService

---

### 1.2 User Management (✅ MIGRATED)

#### `apps/frontend/src/app/3141592654/admin/users/page.tsx`
**Status**: ✅ **MIGRATED** (Phase 4-5)

**Dependencies**:
- ✅ `AdminService.listUsers()` - Real user data with pagination
- ✅ Advanced filtering (role, status, level, risk score)
- ✅ Real-time user statistics

**Mock Data Removed**:
- ❌ `mockUsers` (250 mock users removed)
- ❌ `getMockUsersResponse()` (removed)
- ❌ `getMockUserStats()` (removed)

**Backend Service**: AdminGRPCService
**Database Tables**: users, user_sessions, oauth_accounts

---

### 1.3 Question Management (⚠️ PARTIAL MIGRATION)

#### `apps/frontend/src/app/3141592654/admin/questions/page.tsx`
**Status**: ✅ **MIGRATED**

**Dependencies**:
- ✅ `QuestionFilterService.listQuestionsByFilter()` - Real question listing
- ✅ Advanced filtering and search

**Backend Service**: QuestionFilterGRPCService

---

#### `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`
**Status**: ⚠️ **PENDING MIGRATION** (HIGH PRIORITY)

**Dependencies**:
- ⚠️ `MockQuestionsService.createQuestion()` - **MOCK**
- ⚠️ `MockQuestionsService.parseLatex()` - **MOCK**
- ⚠️ `MockQuestionsService.uploadImage()` - **MOCK**

**Action Required**:
- Implement `QuestionGRPCService.CreateQuestion()`
- Migrate to real gRPC call
- Remove mock service dependency

**Backend Service**: QuestionGRPCService (missing method)
**Estimated Effort**: 3-4 hours

---

#### `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx`
**Status**: ⚠️ **PENDING MIGRATION** (HIGH PRIORITY)

**Dependencies**:
- ⚠️ `MockQuestionsService.getQuestion()` - **MOCK**
- ⚠️ `MockQuestionsService.updateQuestion()` - **MOCK**

**Action Required**:
- Implement `QuestionGRPCService.UpdateQuestion()`
- Migrate to real gRPC call

**Estimated Effort**: 2-3 hours

---

#### `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx`
**Status**: ⚠️ **PENDING MIGRATION** (HIGH PRIORITY)

**Dependencies**:
- ⚠️ `MockQuestionsService.importQuestions()` - **MOCK**
- ⚠️ `MockQuestionsService.parseLatexFile()` - **MOCK**

**Action Required**:
- Implement `QuestionGRPCService.ImportQuestions()`
- Implement LaTeX parsing service
- Migrate to real gRPC call

**Estimated Effort**: 4-5 hours

---

#### `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx`
**Status**: ⚠️ **PENDING MIGRATION** (HIGH PRIORITY)

**Dependencies**:
- ⚠️ `MockQuestionsService.bulkUpdate()` - **MOCK**
- ⚠️ `MockQuestionsService.bulkDelete()` - **MOCK**

**Action Required**:
- Implement `QuestionGRPCService.BulkUpdateQuestions()`
- Implement `QuestionGRPCService.BulkDeleteQuestions()`
- Migrate to real gRPC call

**Estimated Effort**: 3-4 hours

---

### 1.4 Audit Logs (✅ MIGRATED)

#### `apps/frontend/src/app/3141592654/admin/audit-logs/page.tsx`
**Status**: ✅ **MIGRATED** (Phase 8)

**Dependencies**:
- ✅ `AdminService.getAuditLogs()` - Real audit data
- ✅ Advanced filtering (action, user, date range)

**Mock Data Removed**:
- ❌ `mockAuditLogs` (removed)
- ❌ `getAuditLogs()` helper (removed)

**Backend Service**: AdminGRPCService
**Database Tables**: audit_logs

---

### 1.5 Content Management (❌ KEEP MOCK)

#### `apps/frontend/src/app/3141592654/admin/books/page.tsx`
**Status**: ❌ **KEEP AS MOCK** (No backend support)

**Dependencies**:
- ❌ `mockBooks` - **INTENTIONAL MOCK**
- ❌ `getMockBooksResponse()` - **INTENTIONAL MOCK**

**Reason**: No backend Books system
**Backend Support**: ❌ No BookService, no books table
**Priority**: 🟢 LOW (static content)

---

#### `apps/frontend/src/app/3141592654/admin/faq/page.tsx`
**Status**: ❌ **KEEP AS MOCK** (No backend support)

**Dependencies**:
- ❌ `mockFAQs` - **INTENTIONAL MOCK**
- ❌ `getMockFAQsResponse()` - **INTENTIONAL MOCK**

**Reason**: No backend FAQs system
**Backend Support**: ❌ No FAQService, no faqs table
**Priority**: 🟢 LOW (static content)

---

#### `apps/frontend/src/app/3141592654/admin/courses/page.tsx`
**Status**: ❌ **KEEP AS MOCK** (Partial backend support)

**Dependencies**:
- ❌ `mockCourses` - **INTENTIONAL MOCK**
- ❌ `getMockCoursesResponse()` - **INTENTIONAL MOCK**

**Reason**: Backend only has course_enrollments table, no course content
**Backend Support**: ⚠️ Partial (enrollment tracking only)
**Priority**: 🟡 MEDIUM (important feature)

---

#### `apps/frontend/src/app/3141592654/admin/notifications/page.tsx`
**Status**: ❌ **KEEP AS MOCK** (Admin notifications)

**Dependencies**:
- ❌ `mockSystemNotifications` - **INTENTIONAL MOCK**
- ❌ `mockNotificationStats` - **INTENTIONAL MOCK**

**Reason**: Backend NotificationService only supports user notifications, not admin system notifications
**Backend Support**: ⚠️ Partial (user notifications only)
**Priority**: 🟢 MEDIUM (admin feature)

---

## 2. Public Pages Dependencies

### 2.1 Homepage (❌ KEEP MOCK)

#### `apps/frontend/src/app/page.tsx`
**Status**: ❌ **KEEP AS MOCK** (Marketing content)

**Dependencies**:
- ❌ `heroData` - **INTENTIONAL MOCK**
- ❌ `featuresData` - **INTENTIONAL MOCK**
- ❌ `aiLearningData` - **INTENTIONAL MOCK**
- ❌ `homepageFAQData` - **INTENTIONAL MOCK**
- ❌ `homepageFeaturedCourses` - **INTENTIONAL MOCK**

**Reason**: Static marketing content
**Priority**: 🟢 LOW (content management future feature)

---

### 2.2 Courses Pages (❌ KEEP MOCK)

#### `apps/frontend/src/app/courses/page.tsx`
**Status**: ❌ **KEEP AS MOCK**

**Dependencies**:
- ❌ `mockFrontendCourses` - **INTENTIONAL MOCK**
- ❌ `getFeaturedCourses()` - **INTENTIONAL MOCK**

**Reason**: No backend course content system
**Priority**: 🟡 MEDIUM

---

#### `apps/frontend/src/app/courses/[slug]/page.tsx`
**Status**: ❌ **KEEP AS MOCK**

**Dependencies**:
- ❌ `getCourseBySlug()` - **INTENTIONAL MOCK**
- ❌ Mock course details with chapters/lessons

**Reason**: No backend course content system
**Priority**: 🟡 MEDIUM

---

### 2.3 FAQ Page (❌ KEEP MOCK)

#### `apps/frontend/src/app/faq/page.tsx`
**Status**: ❌ **KEEP AS MOCK**

**Dependencies**:
- ❌ `mockFAQs` - **INTENTIONAL MOCK**
- ❌ `getFAQsByCategory()` - **INTENTIONAL MOCK**

**Reason**: No backend FAQs system
**Priority**: 🟢 LOW

---

### 2.4 Questions Search (⚠️ PARTIAL MOCK)

#### `apps/frontend/src/app/questions/search/page.tsx`
**Status**: ⚠️ **PARTIAL MOCK**

**Dependencies**:
- ⚠️ `mockSearchResults` - **TEMPORARY MOCK** (development phase)
- ✅ `QuestionFilterService.searchQuestions()` - Real search available

**Action Required**:
- Replace mock search results with real gRPC call
- Already have backend support

**Estimated Effort**: 1-2 hours

---

## 3. Shared Components Dependencies

### 3.1 Admin Layout Components (⚠️ MIXED)

#### `apps/frontend/src/components/admin/header.tsx`
**Status**: ⚠️ **MIXED**

**Dependencies**:
- ✅ Real user data from auth context
- ❌ `mockNotifications` - **MOCK** (admin notifications)
- ❌ `mockSearchSuggestions` - **MOCK** (UI feature)

**Reason**: Admin notifications not implemented in backend
**Priority**: 🟢 MEDIUM

---

#### `apps/frontend/src/components/admin/sidebar.tsx`
**Status**: ❌ **KEEP AS MOCK** (UI configuration)

**Dependencies**:
- ❌ `mockNavigationSections` - **INTENTIONAL MOCK** (UI config)
- ❌ `mockUserPermissions` - **INTENTIONAL MOCK** (RBAC config)

**Reason**: Static UI configuration, not database-driven
**Priority**: 🟢 LOW

---

### 3.2 Dashboard Components (✅ MIGRATED)

#### `apps/frontend/src/components/admin/dashboard/dashboard-stats.tsx`
**Status**: ✅ **MIGRATED** (Phase 6)

**Dependencies**:
- ✅ `AdminService.getSystemStats()` - Real data
- ✅ Real-time metrics calculation

**Mock Data Removed**:
- ❌ `mockDashboardMetrics` (removed)

---

#### `apps/frontend/src/components/admin/dashboard/connected-dashboard.tsx`
**Status**: ✅ **MIGRATED**

**Dependencies**:
- ✅ `useDashboardData()` hook - Real data fetching
- ✅ Real-time updates

---

### 3.3 WebSocket Provider (❌ KEEP MOCK)

#### `apps/frontend/src/components/admin/providers/mock-websocket-provider.tsx`
**Status**: ❌ **KEEP AS MOCK** (Future feature)

**Purpose**: Simulate WebSocket notifications for admin interface

**Reason**: Real-time WebSocket infrastructure not implemented
**Priority**: 🟢 LOW (future feature)

---

## 4. Services Layer Dependencies

### 4.1 gRPC Services (✅ MIGRATED)

#### `apps/frontend/src/services/grpc/admin.service.ts`
**Status**: ✅ **PRODUCTION-READY**

**Methods**:
- ✅ `listUsers()` - Real gRPC call
- ✅ `getSystemStats()` - Real gRPC call
- ✅ `getAuditLogs()` - Real gRPC call

**Mock Data**: None

---

#### `apps/frontend/src/services/grpc/question-filter.service.ts`
**Status**: ✅ **PRODUCTION-READY**

**Methods**:
- ✅ `listQuestionsByFilter()` - Real gRPC call
- ✅ `searchQuestions()` - Real gRPC call
- ✅ `getQuestionsByQuestionCode()` - Real gRPC call

**Mock Data**: None

---

#### `apps/frontend/src/services/grpc/auth.service.ts`
**Status**: ✅ **PRODUCTION-READY**

**Methods**:
- ✅ `login()` - Real gRPC call
- ✅ `register()` - Real gRPC call
- ✅ `googleLogin()` - Real gRPC call
- ✅ `refreshToken()` - Real gRPC call

**Mock Data**: None

---

### 4.2 Mock Services (⚠️ PENDING REMOVAL)

#### `apps/frontend/src/services/mock/questions.ts`
**Status**: ⚠️ **PENDING REMOVAL** (HIGH PRIORITY)

**Mock Methods**:
- ⚠️ `createQuestion()` - **MOCK**
- ⚠️ `updateQuestion()` - **MOCK**
- ⚠️ `deleteQuestion()` - **MOCK**
- ⚠️ `importQuestions()` - **MOCK**
- ⚠️ `parseLatex()` - **MOCK**
- ⚠️ `uploadImage()` - **MOCK**

**Used By**: 4 admin question pages

**Action Required**:
- Implement missing QuestionGRPCService methods
- Migrate all usages to real gRPC calls
- Remove this file

**Estimated Effort**: 12-16 hours total

---

#### `apps/frontend/src/services/grpc/exam.service.ts`
**Status**: ⚠️ **PARTIAL MOCK**

**Mock Functions**:
- ⚠️ `createMockExam()` - **TEMPORARY MOCK**
- ⚠️ `createMockExamAttempt()` - **TEMPORARY MOCK**
- ⚠️ `createMockExamResult()` - **TEMPORARY MOCK**

**Action Required**:
- Complete protobuf type conversion
- Remove mock functions
- Use real gRPC responses

**Estimated Effort**: 4-6 hours

---

## 5. Dependency Graph

### 5.1 Migration Order (Based on Dependencies)

**Priority 1 - CRITICAL** (Blocking admin features):
```
MockQuestionsService (5 files)
├── create/page.tsx
├── edit/[id]/page.tsx
├── import/page.tsx
├── bulk-edit/page.tsx
└── services/mock/questions.ts
```

**Priority 2 - HIGH** (Partial functionality):
```
ExamService (protobuf conversion)
├── exam.service.ts (mock functions)
└── Exam-related pages
```

**Priority 3 - MEDIUM** (Admin features):
```
Admin Notifications (optional)
├── admin/notifications/page.tsx
└── mockSystemNotifications
```

**Priority 4 - LOW** (Static content):
```
Books/FAQs/Courses/Homepage (keep as mock)
├── admin/books/page.tsx
├── admin/faq/page.tsx
├── admin/courses/page.tsx
├── courses/page.tsx
├── faq/page.tsx
└── page.tsx (homepage)
```

---

### 5.2 Impact Analysis

**High Impact** (Blocking critical features):
- MockQuestionsService → 5 admin pages affected
- Affects question creation, editing, import, bulk operations
- **Blocker**: Yes (admin cannot manage questions)

**Medium Impact** (Partial functionality):
- ExamService mock → Exam pages using temporary data
- **Blocker**: No (basic functionality works)

**Low Impact** (Non-critical features):
- Admin notifications → Admin feature only
- Books/FAQs/Courses → Static content
- **Blocker**: No (intentional mock)

---

## 6. Component Migration Summary

### 6.1 By Status

**✅ MIGRATED** (35+ components):
- Dashboard & Analytics (3 components)
- User Management (2 components)
- Question Listing (1 component)
- Audit Logs (1 component)
- Auth & Profile (5+ components)
- Services Layer (10+ services)

**⚠️ PENDING MIGRATION** (5 components):
- Question Create page
- Question Edit page
- Question Import page
- Question Bulk Edit page
- MockQuestionsService

**❌ KEEP AS MOCK** (10 components):
- Books Management
- FAQs Management
- Courses Management
- Admin Notifications
- Homepage
- Public Courses pages
- Public FAQ page
- Sidebar Navigation
- WebSocket Provider

---

### 6.2 By Priority

**🔴 CRITICAL** (Must migrate):
- MockQuestionsService (5 files)
- Estimated effort: 12-16 hours

**🟡 HIGH** (Should migrate):
- ExamService protobuf conversion
- Estimated effort: 4-6 hours

**🟢 MEDIUM** (Optional):
- Admin Notifications
- Estimated effort: 12-16 hours

**⚪ LOW** (Keep as mock):
- Books/FAQs/Courses/Homepage
- No migration needed

---

## 7. Recommendations

### Immediate Actions (Sprint 1)
1. ✅ Implement QuestionGRPCService CRUD methods
   - CreateQuestion(), UpdateQuestion(), DeleteQuestion(), ImportQuestions()
   - Priority: 🔴 CRITICAL
   - Effort: 8-12 hours (backend)

2. ✅ Migrate 5 frontend files from MockQuestionsService
   - Update all question management pages
   - Remove MockQuestionsService
   - Priority: 🔴 CRITICAL
   - Effort: 4-6 hours (frontend)

3. ✅ Complete ExamService protobuf conversion
   - Remove mock functions
   - Test real gRPC integration
   - Priority: 🟡 HIGH
   - Effort: 4-6 hours

### Future Enhancements (Sprint 2+)
4. ⚠️ Admin Notification System (if needed)
   - Create AdminNotificationService
   - Migrate admin notifications page
   - Priority: 🟢 MEDIUM
   - Effort: 12-16 hours

5. ⚪ Books/FAQs/Courses/Homepage (optional)
   - Keep as mock unless business requires
   - Priority: 🟢 LOW

---

**Report Generated**: 2025-01-19  
**Methodology**: RIPER-5 RESEARCH Mode  
**Status**: ✅ RESEARCH Phase 3 Complete  
**Next**: PLAN Phase 4 - Migration Strategy & Prioritization

