# INNOVATE Phase - Backend Integration Architecture Design
**Date**: 2025-01-19  
**Phase**: INNOVATE (IN_PROGRESS)  
**Augment Context Engine Calls**: 25/30 (target)

---

## Executive Summary

This document explores multiple architectural approaches for converting 4 teacher pages from mock data to real backend integration. Based on research findings, we propose a phased implementation strategy that prioritizes analytics integration while deferring library system implementation.

---

## Problem Statement

### Current State
- ✅ 4 teacher pages implemented with mock data (analytics, materials, students, exams, courses)
- ✅ Analytics backend services exist (DashboardService, AnalyticsService, MonitoringService)
- ❌ Library/Materials backend NOT IMPLEMENTED
- ❌ Teacher-specific filtering NOT AVAILABLE in analytics services
- ❌ Course system NOT FULLY IMPLEMENTED (only course_enrollments table exists)

### Target State
- ✅ Real backend integration with gRPC services
- ✅ Teacher-specific data filtering
- ✅ Seed data for testing
- ✅ Error handling and loading states
- ✅ Cache management with TanStack Query

---

## Architectural Options

### Option 1: Full Implementation (All Pages + Library System)
**Scope**: Implement all 4 pages + create LibraryService from scratch

**Pros**:
- Complete feature parity with design
- No technical debt
- Materials page fully functional

**Cons**:
- ❌ **BLOCKING**: Requires 2-3 weeks for LibraryService implementation
- ❌ High complexity (database migrations + proto + backend + frontend)
- ❌ Delays other pages integration

**Estimated Time**: 80-100 hours (6-8 weeks)

**Verdict**: ❌ **REJECTED** - Too time-consuming, blocks progress

---

### Option 2: Phased Implementation (Analytics First, Library Later)
**Scope**: Implement 3 pages now (analytics, students, exams), defer materials page

**Phase 1 - Analytics Integration** (20-25 hours):
1. Enhance analytics services with teacher-specific filtering
2. Implement Students page with course_enrollments data
3. Implement Exams page with exam repository
4. Implement Analytics page with dashboard service
5. Create seed data for testing

**Phase 2 - Library System** (40-50 hours, future sprint):
1. Create library database migrations
2. Create library.proto definitions
3. Implement LibraryService backend
4. Implement Materials page frontend

**Pros**:
- ✅ Quick wins with 3 pages (75% completion)
- ✅ Unblocks teacher dashboard functionality
- ✅ Allows testing and feedback early
- ✅ Defers complex library system to dedicated sprint

**Cons**:
- ⚠️ Materials page remains mock (acceptable for MVP)
- ⚠️ Requires clear communication about phased delivery

**Estimated Time**: 20-25 hours (Phase 1 only)

**Verdict**: ✅ **RECOMMENDED** - Balanced approach, quick value delivery

---

### Option 3: Minimal Integration (Analytics Only)
**Scope**: Only implement Analytics page, keep others as mock

**Pros**:
- ✅ Fastest implementation (8-10 hours)
- ✅ Proves integration pattern

**Cons**:
- ❌ Limited value (only 1 page)
- ❌ Doesn't address student/exam management needs

**Estimated Time**: 8-10 hours

**Verdict**: ❌ **REJECTED** - Too limited scope

---

## Recommended Architecture: Option 2 (Phased Implementation)

### Phase 1: Analytics Integration (CURRENT SPRINT)

#### 1.1 Backend Enhancements

**A. Teacher-Specific Analytics Service**
**Location**: `apps/backend/internal/service/system/analytics/teacher_analytics_service.go`

```go
type TeacherAnalyticsService struct {
    dashboardService *DashboardService
    analyticsService *AnalyticsService
    examRepo         *repository.ExamRepository
    enrollmentRepo   *repository.EnrollmentRepository
    logger           *logrus.Logger
}

// GetTeacherDashboard returns dashboard data filtered by teacher
func (s *TeacherAnalyticsService) GetTeacherDashboard(ctx context.Context, teacherID string) (*TeacherDashboardData, error) {
    // Get teacher's exams
    exams, _, err := s.examRepo.FindByCreator(ctx, teacherID, nil)
    if err != nil {
        return nil, err
    }
    
    // Get students enrolled in teacher's courses
    students, err := s.getTeacherStudents(ctx, teacherID)
    if err != nil {
        return nil, err
    }
    
    // Aggregate analytics for teacher's exams
    analytics, err := s.aggregateTeacherAnalytics(ctx, exams)
    if err != nil {
        return nil, err
    }
    
    return &TeacherDashboardData{
        TotalExams:      len(exams),
        TotalStudents:   len(students),
        AverageScore:    analytics.AverageScore,
        PassRate:        analytics.PassRate,
        ActiveStudents:  analytics.ActiveStudents,
        CompletionRate:  analytics.CompletionRate,
    }, nil
}
```

**B. Course-Student Relationship Queries**
**Location**: `apps/backend/internal/repository/enrollment.go` (ALREADY EXISTS)

```go
// GetStudentsByCourse gets all students enrolled in a course
func (r *enrollmentRepository) GetStudentsByCourse(ctx context.Context, courseID string) ([]*Enrollment, error) {
    query := `
        SELECT id, user_id, course_id, status, access_level,
               max_downloads, current_downloads, max_streams,
               expires_at, progress, enrolled_at, updated_at
        FROM course_enrollments
        WHERE course_id = $1 AND status = 'ACTIVE'
        ORDER BY enrolled_at DESC
    `
    // ... implementation
}
```

**C. Proto Definitions Enhancement**
**Location**: `packages/proto/v1/analytics.proto` (NEW FILE)

```protobuf
syntax = "proto3";

package v1;

import "google/api/annotations.proto";
import "google/protobuf/timestamp.proto";
import "common/common.proto";

option go_package = "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1";

service AnalyticsService {
  // Teacher-specific analytics
  rpc GetTeacherDashboard(GetTeacherDashboardRequest) returns (GetTeacherDashboardResponse) {
    option (google.api.http) = {
      get: "/v1/analytics/teacher/{teacher_id}/dashboard"
    };
  }
  
  rpc GetTeacherStudents(GetTeacherStudentsRequest) returns (GetTeacherStudentsResponse) {
    option (google.api.http) = {
      get: "/v1/analytics/teacher/{teacher_id}/students"
    };
  }
  
  rpc GetTeacherExamAnalytics(GetTeacherExamAnalyticsRequest) returns (GetTeacherExamAnalyticsResponse) {
    option (google.api.http) = {
      get: "/v1/analytics/teacher/{teacher_id}/exams/{exam_id}"
    };
  }
}

message GetTeacherDashboardRequest {
  string teacher_id = 1;
  string time_range = 2; // "7d", "30d", "90d", "1y"
}

message GetTeacherDashboardResponse {
  TeacherDashboardData data = 1;
  common.Response response = 2;
}

message TeacherDashboardData {
  int32 total_exams = 1;
  int32 total_students = 2;
  double average_score = 3;
  double pass_rate = 4;
  int32 active_students = 5;
  double completion_rate = 6;
  repeated PerformanceTrend trends = 7;
  repeated ExamPerformance top_exams = 8;
}
```

#### 1.2 Frontend Integration

**A. gRPC Service Wrapper**
**Location**: `apps/frontend/src/services/grpc/analytics.service.ts` (NEW FILE)

```typescript
import { AnalyticsServiceClient } from '@/generated/v1/AnalyticsServiceClientPb';
import { GetTeacherDashboardRequest } from '@/generated/v1/analytics_pb';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

const GRPC_ENDPOINT = getGrpcUrl();
const analyticsServiceClient = new AnalyticsServiceClient(GRPC_ENDPOINT);

export const AnalyticsService = {
  getTeacherDashboard: async (teacherId: string, timeRange: string = '30d') => {
    try {
      const request = new GetTeacherDashboardRequest();
      request.setTeacherId(teacherId);
      request.setTimeRange(timeRange);
      
      const response = await analyticsServiceClient.getTeacherDashboard(request, getAuthMetadata());
      const data = response.getData();
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      return mapTeacherDashboardFromPb(data);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }
};
```

**B. TanStack Query Hooks**
**Location**: `apps/frontend/src/hooks/teacher/use-teacher-analytics.ts` (NEW FILE)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/grpc/analytics.service';

export const TEACHER_ANALYTICS_QUERY_KEYS = {
  all: ['teacher-analytics'] as const,
  dashboard: (teacherId: string, timeRange: string) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'dashboard', teacherId, timeRange] as const,
  students: (teacherId: string) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'students', teacherId] as const,
};

export function useTeacherDashboard(teacherId: string, timeRange: string = '30d') {
  return useQuery({
    queryKey: TEACHER_ANALYTICS_QUERY_KEYS.dashboard(teacherId, timeRange),
    queryFn: () => AnalyticsService.getTeacherDashboard(teacherId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

**C. Page Integration**
**Location**: `apps/frontend/src/app/teacher/analytics/page.tsx` (MODIFY EXISTING)

```typescript
export default function TeacherAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Replace mock data with real API call
  const { data: dashboardData, isLoading, error, refetch } = useTeacherDashboard(
    user?.id || '',
    timeRange
  );
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }
  
  const stats = dashboardData || DEFAULT_STATS;
  
  // Rest of component remains same, using real data instead of mock
}
```

#### 1.3 Seed Data Strategy

**A. Prisma Seed Enhancement**
**Location**: `apps/frontend/prisma/seed-teacher-data.ts` (NEW FILE)

```typescript
async function seedTeacherData() {
  // Get teacher users
  const teachers = await prisma.users.findMany({
    where: { role: 'TEACHER' }
  });
  
  // Create course enrollments for each teacher
  for (const teacher of teachers) {
    // Create 3-5 courses per teacher
    const courseCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < courseCount; i++) {
      const courseId = `course-${teacher.id}-${i}`;
      
      // Enroll 10-30 students per course
      const studentCount = Math.floor(Math.random() * 21) + 10;
      const students = await prisma.users.findMany({
        where: { role: 'STUDENT' },
        take: studentCount
      });
      
      for (const student of students) {
        await prisma.course_enrollments.create({
          data: {
            id: generateId(),
            user_id: student.id,
            course_id: courseId,
            status: 'ACTIVE',
            access_level: 'BASIC',
            progress: Math.floor(Math.random() * 100),
            enrolled_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    }
    
    // Create exam attempts for teacher's exams
    const teacherExams = await prisma.exams.findMany({
      where: { created_by: teacher.id }
    });
    
    for (const exam of teacherExams) {
      // Create 20-50 attempts per exam
      const attemptCount = Math.floor(Math.random() * 31) + 20;
      
      for (let i = 0; i < attemptCount; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const score = Math.random() * 100;
        const passed = score >= exam.pass_percentage;
        
        await prisma.exam_attempts.create({
          data: {
            id: generateId(),
            exam_id: exam.id,
            user_id: student.id,
            attempt_number: 1,
            status: 'submitted',
            score: score,
            total_points: exam.total_points,
            percentage: score,
            passed: passed,
            started_at: new Date(),
            submitted_at: new Date(),
            time_spent_seconds: Math.floor(Math.random() * 3600) + 1800
          }
        });
      }
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Backend Foundation (8 hours)
1. ✅ Create `analytics.proto` with teacher-specific methods
2. ✅ Implement `TeacherAnalyticsService` in Go
3. ✅ Add teacher filtering to existing analytics queries
4. ✅ Register service in container and app
5. ✅ Generate proto code (Go + TypeScript)

### Phase 2: Frontend Integration (8 hours)
1. ✅ Create `analytics.service.ts` gRPC wrapper
2. ✅ Create TanStack Query hooks (`use-teacher-analytics.ts`)
3. ✅ Update Analytics page to use real data
4. ✅ Update Students page to use course_enrollments
5. ✅ Update Exams page to use exam repository

### Phase 3: Seed Data & Testing (4 hours)
1. ✅ Create seed script for teacher data
2. ✅ Run seed and verify data
3. ✅ Test all 3 pages with real data
4. ✅ Fix bugs and edge cases

### Phase 4: Error Handling & Polish (4 hours)
1. ✅ Add loading states
2. ✅ Add error boundaries
3. ✅ Add retry logic
4. ✅ Add cache invalidation

**Total Phase 1 Estimate**: 24 hours (3 days)

---

## Materials Page Strategy (Deferred to Phase 2)

### Temporary Solution
- Keep Materials page with mock data
- Add banner: "Tính năng đang phát triển - Dữ liệu mẫu"
- Disable upload/delete actions
- Show realistic mock data for demonstration

### Future Implementation (Phase 2)
- Create library database migrations (8 hours)
- Create library.proto (4 hours)
- Implement LibraryService backend (16 hours)
- Implement Materials page frontend (8 hours)
- **Total**: 36 hours (5 days)

---

## Risk Mitigation

### Risk 1: Teacher-specific filtering breaks existing analytics
**Mitigation**: Create separate service, don't modify existing DashboardService

### Risk 2: Course system incomplete
**Mitigation**: Use course_enrollments table only, don't require full course CRUD

### Risk 3: Seed data generation too slow
**Mitigation**: Use SQL seed scripts instead of Prisma for bulk inserts

### Risk 4: gRPC proto changes break existing clients
**Mitigation**: Create new analytics.proto, don't modify existing protos

---

## Success Criteria

### Phase 1 Completion
- ✅ 3 teacher pages (analytics, students, exams) use real backend data
- ✅ Teacher can see their own exams, students, and analytics
- ✅ Seed data provides realistic test environment
- ✅ Error handling and loading states work correctly
- ✅ Cache management with TanStack Query

### Phase 2 Completion (Future)
- ✅ Materials page uses real LibraryService
- ✅ File upload to Google Drive works
- ✅ Role-based access control for materials
- ✅ Download tracking and quota management

---

**Next Steps**: Proceed to PLAN phase with Option 2 (Phased Implementation)

