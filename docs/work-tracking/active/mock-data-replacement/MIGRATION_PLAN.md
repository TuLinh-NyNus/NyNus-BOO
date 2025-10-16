# Mock Data Migration Plan - Detailed Implementation Strategy

## Overview

**Objective**: Systematically replace all mock data with real database data via gRPC services.

**Approach**: Module-by-module migration with testing after each module.

**Timeline**: Estimated 20-30 hours total development time.

---

## Phase 2: Module Migration Plans

### Module 1: Users & Authentication (Priority: 🔴 High)

#### Current State
- **Mock Files**: `apps/frontend/src/lib/mockdata/users/admin-users.ts`
- **Mock Data**: 200+ generated users with roles, stats, profiles
- **Components Affected**: 
  - Admin user management pages
  - User profile components
  - Session management

#### Target State
- **gRPC Service**: `AdminService`, `ProfileService`
- **Backend Methods**:
  - `AdminService.ListUsers()` - ✅ Implemented
  - `AdminService.UpdateUserRole()` - ✅ Implemented
  - `AdminService.UpdateUserLevel()` - ✅ Implemented
  - `AdminService.UpdateUserStatus()` - ✅ Implemented
  - `ProfileService.GetProfile()` - ✅ Implemented
  - `ProfileService.GetSessions()` - ✅ Implemented

#### Migration Steps

**Step 1: Update Admin User List Page** (2 hours)
```typescript
// File: apps/frontend/src/app/3141592654/admin/users/page.tsx

// ❌ BEFORE
import { mockUsers, getMockUsersResponse } from '@/lib/mockdata';

const users = mockUsers;

// ✅ AFTER
import { AdminService } from '@/services/grpc/admin.service';

const { data: users } = useQuery({
  queryKey: ['admin-users', page, filters],
  queryFn: async () => {
    const response = await AdminService.listUsers({
      pagination: { page, limit: 20 },
      filter: {
        role: filters.role,
        status: filters.status,
        searchQuery: filters.search
      }
    });
    return response.users;
  }
});
```

**Step 2: Update User Profile Components** (1 hour)
```typescript
// File: apps/frontend/src/components/admin/users/user-profile-card.tsx

// ❌ BEFORE
import { getUserById } from '@/lib/mockdata';

// ✅ AFTER
import { ProfileService } from '@/services/grpc/profile.service';

const { data: profile } = useQuery({
  queryKey: ['user-profile', userId],
  queryFn: () => ProfileService.getProfile(userId)
});
```

**Step 3: Update Session Management** (1 hour)
```typescript
// File: apps/frontend/src/components/admin/users/user-sessions.tsx

// ❌ BEFORE
import { mockUserSessions } from '@/lib/mockdata';

// ✅ AFTER
import { ProfileService } from '@/services/grpc/profile.service';

const { data: sessions } = useQuery({
  queryKey: ['user-sessions', userId],
  queryFn: () => ProfileService.getSessions(userId)
});
```

**Step 4: Testing** (1 hour)
- Test user listing with pagination
- Test user filtering by role, status
- Test user search functionality
- Test session management

**Total Effort**: 5 hours

---

### Module 2: Questions (Priority: 🔴 High)

#### Current State
- **Mock Files**: 
  - `apps/frontend/src/lib/mockdata/questions/multiple-choice.ts`
  - `apps/frontend/src/lib/mockdata/questions/enhanced-questions.ts`
  - `apps/frontend/src/services/mock/questions.ts`

#### Target State
- **gRPC Services**: `QuestionService`, `QuestionFilterService`
- **Backend Methods**: All ✅ Implemented

#### Migration Steps

**Step 1: Replace Mock Questions Service** (3 hours)
```typescript
// File: apps/frontend/src/hooks/use-questions.ts

// ❌ BEFORE
import { MockQuestionsService } from '@/services/mock/questions';

export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => MockQuestionsService.listQuestions(filters)
  });
}

// ✅ AFTER
import { QuestionFilterService } from '@/services/grpc/question-filter.service';

export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => QuestionFilterService.listQuestionsByFilter({
      filter: {
        questionCodeFilter: filters.questionCode,
        metadataFilter: {
          difficulty: filters.difficulty,
          status: filters.status
        }
      },
      pagination: { page: filters.page, limit: filters.limit }
    })
  });
}
```

**Step 2: Update Question Management Pages** (2 hours)
- Admin question list page
- Question detail page
- Question editor

**Step 3: Delete Mock Questions Service** (0.5 hours)
```bash
rm apps/frontend/src/services/mock/questions.ts
```

**Step 4: Testing** (1.5 hours)
- Test question CRUD operations
- Test advanced filtering
- Test search functionality

**Total Effort**: 7 hours

---

### Module 3: Notifications (Priority: 🔴 High)

#### Current State
- **Mock Files**: `apps/frontend/src/lib/mockdata/notifications.ts`

#### Target State
- **gRPC Service**: `NotificationService`
- **Backend Methods**: ✅ Implemented

#### Migration Steps

**Step 1: Update Notification Center** (2 hours)
```typescript
// File: apps/frontend/src/components/features/notifications/notification-center.tsx

// ❌ BEFORE
import { mockSystemNotifications } from '@/lib/mockdata';

// ✅ AFTER
import { NotificationService } from '@/services/grpc/notification.service';

const { data: notifications } = useQuery({
  queryKey: ['notifications', userId],
  queryFn: () => NotificationService.getUserNotifications({
    userId,
    pagination: { page: 1, limit: 50 }
  })
});
```

**Step 2: Implement Real-time Updates** (2 hours)
```typescript
// Use smart polling from NotificationService
useEffect(() => {
  const unsubscribe = NotificationService.subscribeToNotifications(
    (notification) => {
      // Handle new notification
      queryClient.invalidateQueries(['notifications']);
    },
    (error) => console.error(error),
    userId
  );
  
  return unsubscribe;
}, [userId]);
```

**Step 3: Testing** (1 hour)
- Test notification listing
- Test mark as read
- Test real-time updates

**Total Effort**: 5 hours

---

### Module 4: Security & Audit Logs (Priority: 🔴 High)

#### Current State
- **Mock Files**: `apps/frontend/src/lib/mockdata/admin/security.ts`

#### Target State
- **gRPC Service**: `AdminService`
- **Backend Methods**: ✅ Implemented

#### Migration Steps

**Step 1: Update Security Page** (2 hours)
```typescript
// File: apps/frontend/src/app/3141592654/admin/security/page.tsx

// ❌ BEFORE
import { mockAuditLogs, mockResourceAccess, mockSecurityEvents } from '@/lib/mockdata';

// ✅ AFTER
import { AdminService } from '@/services/grpc/admin.service';

const { data: auditLogs } = useQuery({
  queryKey: ['audit-logs', filters],
  queryFn: () => AdminService.getAuditLogs({
    pagination: { page, limit: 50 },
    filter: {
      userId: filters.userId,
      action: filters.action,
      startDate: filters.startDate,
      endDate: filters.endDate
    }
  })
});

const { data: resourceAccess } = useQuery({
  queryKey: ['resource-access', filters],
  queryFn: () => AdminService.getResourceAccess({
    pagination: { page, limit: 50 },
    filter: {
      userId: filters.userId,
      resourceType: filters.resourceType,
      minRiskScore: filters.minRiskScore
    }
  })
});
```

**Step 2: Testing** (1 hour)
- Test audit log filtering
- Test resource access monitoring
- Test security alerts

**Total Effort**: 3 hours

---

### Module 5: Analytics (Priority: 🟡 Medium - Needs Backend Work)

#### Current State
- **Mock Files**: `apps/frontend/src/lib/mockdata/analytics/analytics.ts`

#### Target State
- **gRPC Service**: `AdminService` (needs new methods)
- **Backend Methods**: ⚠️ Need to implement

#### Backend Implementation Required

**Step 1: Create Analytics Repository** (3 hours)
```go
// File: apps/backend/internal/repository/analytics_repository.go

type AnalyticsRepository struct {
    db *sql.DB
}

func (r *AnalyticsRepository) GetUserGrowthData(ctx context.Context, startDate, endDate time.Time) ([]UserGrowthPoint, error) {
    query := `
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY date
    `
    // Implementation...
}

func (r *AnalyticsRepository) GetQuestionUsageStats(ctx context.Context) (*QuestionUsageStats, error) {
    query := `
        SELECT 
            COUNT(*) as total_questions,
            SUM(usage_count) as total_usage,
            AVG(usage_count) as average_usage
        FROM question
    `
    // Implementation...
}
```

**Step 2: Add Methods to AdminService** (2 hours)
```go
// File: apps/backend/internal/grpc/admin_service.go

func (s *AdminServiceServer) GetAnalytics(ctx context.Context, req *v1.GetAnalyticsRequest) (*v1.GetAnalyticsResponse, error) {
    userGrowth, err := s.analyticsRepo.GetUserGrowthData(ctx, req.StartDate, req.EndDate)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to get user growth: %v", err)
    }
    
    questionStats, err := s.analyticsRepo.GetQuestionUsageStats(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "Failed to get question stats: %v", err)
    }
    
    return &v1.GetAnalyticsResponse{
        UserGrowth: userGrowth,
        QuestionStats: questionStats,
    }, nil
}
```

**Step 3: Update Frontend** (2 hours)
```typescript
// File: apps/frontend/src/app/3141592654/admin/analytics/page.tsx

const { data: analytics } = useQuery({
  queryKey: ['analytics', dateRange],
  queryFn: () => AdminService.getAnalytics({
    startDate: dateRange.start,
    endDate: dateRange.end
  })
});
```

**Step 4: Testing** (1 hour)

**Total Effort**: 8 hours

---

## Summary

### Total Estimated Effort

| Module | Priority | Effort | Status |
|--------|----------|--------|--------|
| Users & Auth | 🔴 High | 5h | Ready |
| Questions | 🔴 High | 7h | Ready |
| Notifications | 🔴 High | 5h | Ready |
| Security & Audit | 🔴 High | 3h | Ready |
| Analytics | 🟡 Medium | 8h | Needs backend |
| **Total** | | **28h** | |

### Modules to Keep as Mock

| Module | Reason | Files |
|--------|--------|-------|
| Books | No database table | `mockdata/content/books.ts` |
| FAQs | Static content | `mockdata/content/faq.ts` |
| Forum | No database table | `mockdata/content/forum.ts` |
| Courses | No database schema | `mockdata/courses/` |
| Homepage | Marketing content | `mockdata/homepage*.ts` |
| Navigation | UI configuration | `mockdata/admin/sidebar-navigation.ts` |

---

## Next Steps

1. ✅ Phase 1: Analysis Complete
2. ✅ Phase 2: Migration Plan Complete
3. **Phase 3**: Implement missing backend queries (Analytics)
4. **Phase 4**: Execute migration for high-priority modules
5. **Phase 5**: Testing & validation
6. **Phase 6**: Cleanup unused mock files

---

**Generated**: 2025-01-19
**Status**: Migration Plan Complete - Ready for Implementation

