# Component Usage Analysis - Mock Data Dependencies

## Executive Summary

**Phát hiện**: **30+ React components và pages** sử dụng mock data từ `@/lib/mockdata`.

**Phạm vi ảnh hưởng**:
- Admin pages: 15+ pages
- Course pages: 5+ pages  
- Homepage components: 3+ components
- Admin components: 7+ components

---

## Admin Pages Using Mock Data

### 1. Books Management (`apps/frontend/src/app/3141592654/admin/books/page.tsx`)
**Mock Imports**:
```typescript
import { mockBooks } from '@/lib/mockdata';
import { AdminBook } from '@/lib/mockdata/types';
```

**Usage**: Display and manage educational books
**Database Support**: ❌ No database table
**Action**: **Keep as mock** - Static content

---

### 2. Analytics Dashboard (`apps/frontend/src/app/3141592654/admin/analytics/page.tsx`)
**Mock Imports**:
```typescript
import { getAnalyticsOverview, mockSystemMetrics } from '@/lib/mockdata';
```

**Usage**: System analytics, user growth, question usage
**Database Support**: ⚠️ Partial - needs aggregation queries
**Action**: **Implement aggregation queries** in backend

**Required Backend Queries**:
- User growth over time (from `users` table)
- Question usage statistics (from `question` table)
- Exam attempt statistics (from `exam_attempts` table)
- Course enrollment trends (from `course_enrollments` table)

---

### 3. FAQ Management (`apps/frontend/src/app/3141592654/admin/faq/page.tsx`)
**Mock Imports**:
```typescript
import { mockFAQs } from '@/lib/mockdata';
import { AdminFAQ } from '@/lib/mockdata/types';
```

**Usage**: FAQ management interface
**Database Support**: ❌ No database table
**Action**: **Keep as mock** - Static content

---

### 4. Security Page (`apps/frontend/src/app/3141592654/admin/security/page.tsx`)
**Mock Imports**:
```typescript
import { mockSecurityMetrics, mockSecurityEvents, mockAuditLogs } from '@/lib/mockdata';
```

**Usage**: Security monitoring, audit logs, resource access
**Database Support**: ✅ Full support
**Tables**: `audit_logs`, `resource_access`, `account_locks`

**gRPC Service**: `AdminService`
**Methods**:
- `GetAuditLogs()` - ✅ Implemented
- `GetResourceAccess()` - ✅ Implemented
- `GetSecurityAlerts()` - ✅ Implemented

**Action**: **Replace with gRPC calls**

---

### 5. Dashboard Stats (`apps/frontend/src/components/admin/dashboard/dashboard-stats.tsx`)
**Mock Imports**:
```typescript
import { mockAnalytics } from '@/lib/mockdata';
```

**Usage**: Dashboard statistics cards
**Database Support**: ⚠️ Needs aggregation
**Action**: **Implement GetSystemStats** in AdminService

---

## Course Pages Using Mock Data

### 1. Course Detail Page (`apps/frontend/src/app/courses/[slug]/page.tsx`)
**Mock Imports**:
```typescript
import { getChaptersByCourseId, getReviewsByCourseId } from '@/lib/mockdata/courses/course-details';
import { getCourseBySlug } from '@/lib/mockdata';
```

**Usage**: Course information, chapters, reviews
**Database Support**: ⚠️ Partial
- Enrollments: ✅ `course_enrollments` table
- Course content: ❌ No database tables

**Action**: **Mixed approach**
- Enrollments: Use database
- Course content: Keep as mock

---

### 2. Lessons Page (`apps/frontend/src/app/courses/[slug]/lessons/page.tsx`)
**Mock Imports**:
```typescript
import { getChaptersByCourseId } from '@/lib/mockdata/courses/course-details';
import { getCourseBySlug } from '@/lib/mockdata';
```

**Usage**: Course lessons listing
**Database Support**: ❌ No database tables
**Action**: **Keep as mock** - Course content

---

### 3. Lesson Detail Page (`apps/frontend/src/app/courses/[slug]/lessons/[lessonId]/page.tsx`)
**Mock Imports**:
```typescript
import { getChaptersByCourseId, getLessonById } from '@/lib/mockdata/courses/course-details';
```

**Usage**: Individual lesson content
**Database Support**: ❌ No database tables
**Action**: **Keep as mock** - Course content

---

## Admin Components Using Mock Data

### 1. Permission Templates (`apps/frontend/src/components/admin/roles/permission-templates.tsx`)
**Mock Imports**:
```typescript
import { mockPermissions } from "@/lib/mockdata/admin";
```

**Usage**: RBAC permission templates
**Database Support**: ❌ Static configuration
**Action**: **Keep as mock** - RBAC config

---

### 2. Theory Content Manager (`apps/frontend/src/components/admin/theory/theory-content-manager.tsx`)
**Mock Data**: Inline `MOCK_CONTENT` array
**Usage**: Theory content management
**Database Support**: ❌ No database tables
**Action**: **Keep as mock** - Content management

---

### 3. Content Analytics Dashboard (`apps/frontend/src/components/admin/theory/content-analytics-dashboard.tsx`)
**Mock Data**: Inline `MOCK_METRICS`, `MOCK_PERFORMANCE_DATA`
**Usage**: Content performance analytics
**Database Support**: ❌ No database tables
**Action**: **Keep as mock** - Analytics

---

## Services Using Mock Data

### 1. Mock Questions Service (`apps/frontend/src/services/mock/questions.ts`)
**Purpose**: Mock API service with realistic latency
**Mock Imports**:
```typescript
import { mockEnhancedQuestions, mockQuestionCodes } from '@/lib/mockdata/questions';
```

**Usage**: Temporary service during migration
**Action**: **Delete after migration** - Replace with real QuestionService

---

### 2. Exam Service (`apps/frontend/src/services/grpc/exam.service.ts`)
**Mock Function**: `createMockExam()`
**Purpose**: Generate mock exam data
**Action**: **Remove mock function** after backend implementation complete

---

## Frontend Service Integration Status

### ✅ Production-Ready gRPC Services
1. **AdminService** (`apps/frontend/src/services/grpc/admin.service.ts`)
   - ✅ listUsers()
   - ✅ updateUserRole()
   - ✅ updateUserLevel()
   - ✅ updateUserStatus()
   - ⚠️ getAuditLogs() - Implemented but not used
   - ⚠️ getResourceAccess() - Implemented but not used

2. **ContactService** (`apps/frontend/src/services/grpc/contact.service.ts`)
   - ✅ submitContactForm()
   - ✅ listContacts()
   - ✅ updateContactStatus()

3. **NewsletterService** (`apps/frontend/src/services/grpc/newsletter.service.ts`)
   - ✅ subscribe()
   - ✅ unsubscribe()
   - ✅ listSubscriptions()

4. **ProfileService** (`apps/frontend/src/services/grpc/profile.service.ts`)
   - ✅ getProfile()
   - ✅ updateProfile()
   - ✅ getSessions()
   - ✅ terminateSession()
   - ✅ getPreferences()
   - ✅ updatePreferences()

5. **QuestionService** (`apps/frontend/src/services/grpc/question.service.ts`)
   - ✅ createQuestion()
   - ✅ getQuestion()
   - ✅ listQuestions()
   - ✅ updateQuestion()
   - ✅ deleteQuestion()

6. **QuestionFilterService** (`apps/frontend/src/services/grpc/question-filter.service.ts`)
   - ✅ listQuestionsByFilter()
   - ✅ searchQuestions()
   - ✅ getQuestionsByQuestionCode()

7. **NotificationService** (`apps/frontend/src/services/grpc/notification.service.ts`)
   - ✅ getUserNotifications()
   - ✅ markAsRead()
   - ⚠️ createNotification() - Mock implementation
   - ⚠️ subscribeToNotifications() - Smart polling implementation

---

## Backend Implementation Status

### ✅ Fully Implemented Repositories
1. **UserRepository** (`apps/backend/internal/repository/user.go`)
   - ✅ GetByID(), GetByEmail(), GetByRole()
   - ✅ GetUsersByPaging() - Pagination support
   - ✅ Create(), Update(), Delete()

2. **QuestionRepository** (`apps/backend/internal/repository/question_repository.go`)
   - ✅ GetByID(), GetAll(), GetByIDs()
   - ✅ FindWithFilters() - Advanced filtering
   - ✅ Search() - Text search
   - ✅ Create(), Update(), Delete()

3. **SessionRepository** (`apps/backend/internal/repository/session.go`)
   - ✅ CreateSession()
   - ✅ GetByUserID(), GetActiveSessionsByUserID()
   - ✅ TerminateSession()

4. **NotificationRepository** (`apps/backend/internal/repository/notification.go`)
   - ✅ GetByUserID(), GetUnreadByUserID()
   - ✅ MarkAsRead(), Delete()
   - ✅ DeleteExpired()

5. **AuditLogRepository** (`apps/backend/internal/repository/audit_log.go`)
   - ✅ Create(), GetByUserID()
   - ✅ GetByAction(), GetByDateRange()

6. **ResourceAccessRepository** (`apps/backend/internal/repository/resource_access.go`)
   - ✅ Create(), GetByUserID()
   - ✅ GetHighRiskAccess()

---

### ⚠️ Missing Backend Implementations

#### 1. Analytics Aggregation Queries
**Location**: Need to create `apps/backend/internal/repository/analytics_repository.go`

**Required Methods**:
```go
// User analytics
GetUserGrowthData(ctx context.Context, startDate, endDate time.Time) ([]UserGrowthPoint, error)
GetActiveUsersCount(ctx context.Context) (int, error)

// Question analytics
GetQuestionUsageData(ctx context.Context) ([]QuestionUsagePoint, error)
GetQuestionsByDifficulty(ctx context.Context) (map[string]int, error)

// Exam analytics
GetExamAttemptStats(ctx context.Context) (*ExamStats, error)
GetAverageScores(ctx context.Context) (float64, error)

// Course analytics
GetCourseEnrollmentTrends(ctx context.Context) ([]EnrollmentPoint, error)
```

#### 2. System Stats Aggregation
**Location**: `apps/backend/internal/grpc/admin_service.go`

**Current Status**: `GetSystemStats()` returns zero values (TODO comment)

**Required Implementation**:
```go
func (s *AdminServiceServer) GetSystemStats(ctx context.Context, req *v1.GetSystemStatsRequest) (*v1.GetSystemStatsResponse, error) {
    // TODO: Implement actual stats aggregation
    stats := &v1.SystemStats{
        TotalUsers: s.userRepo.Count(ctx),
        ActiveUsers: s.userRepo.CountActive(ctx),
        TotalQuestions: s.questionRepo.Count(ctx),
        TotalExams: s.examRepo.Count(ctx),
        TotalAttempts: s.examRepo.CountAttempts(ctx),
    }
    return &v1.GetSystemStatsResponse{Stats: stats}, nil
}
```

---

## Migration Priority Matrix

### 🔴 High Priority - Replace Immediately
| Component | Mock Data | gRPC Service | Status |
|-----------|-----------|--------------|--------|
| Security Page | audit_logs, resource_access | AdminService | ✅ Ready |
| User Management | mockUsers | AdminService | ✅ Ready |
| Notifications | mockNotifications | NotificationService | ✅ Ready |
| Sessions | mockSessions | ProfileService | ✅ Ready |

### 🟡 Medium Priority - Needs Backend Work
| Component | Mock Data | Backend Work | Estimated Effort |
|-----------|-----------|--------------|------------------|
| Analytics Dashboard | mockAnalytics | Aggregation queries | 4-6 hours |
| Dashboard Stats | mockSystemMetrics | GetSystemStats() | 2-3 hours |
| Question Stats | mockQuestionStats | Statistics queries | 3-4 hours |

### 🟢 Low Priority - Keep as Mock
| Component | Mock Data | Reason |
|-----------|-----------|--------|
| Books Management | mockBooks | No database table |
| FAQ Management | mockFAQs | Static content |
| Course Content | mockCourses | No database schema |
| Homepage | heroData, featuresData | Marketing content |
| Navigation | mockNavigation | UI configuration |

---

## Next Steps

1. ✅ **Phase 1 Complete**: Analysis done
2. **Phase 2**: Create detailed migration plan for each module
3. **Phase 3**: Implement missing backend queries
4. **Phase 4**: Replace mock data with gRPC calls
5. **Phase 5**: Testing & validation
6. **Phase 6**: Cleanup unused mock files

---

**Generated**: 2025-01-19
**Status**: Component Analysis Complete

