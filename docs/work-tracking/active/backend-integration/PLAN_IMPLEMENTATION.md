# PLAN Phase - Detailed Implementation Plan
**Date**: 2025-01-19  
**Phase**: PLAN (IN_PROGRESS)  
**Augment Context Engine Calls**: 28/30  
**Estimated Time**: 24 hours (3 days)

---

## Implementation Checklist

### Phase 1: Backend Foundation (8 hours)

#### Task 1.1: Create analytics.proto (1 hour)
**File**: `packages/proto/v1/analytics.proto`

**Action**: CREATE NEW FILE

**Content**:
```protobuf
syntax = "proto3";

package v1;

import "google/api/annotations.proto";
import "google/protobuf/timestamp.proto";
import "common/common.proto";

option go_package = "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1";

service AnalyticsService {
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
  
  rpc GetTeacherExams(GetTeacherExamsRequest) returns (GetTeacherExamsResponse) {
    option (google.api.http) = {
      get: "/v1/analytics/teacher/{teacher_id}/exams"
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

message PerformanceTrend {
  string date = 1;
  double average_score = 2;
  double pass_rate = 3;
  int32 attempt_count = 4;
}

message ExamPerformance {
  string exam_id = 1;
  string exam_title = 2;
  int32 attempt_count = 3;
  double average_score = 4;
  double pass_rate = 5;
}

message GetTeacherStudentsRequest {
  string teacher_id = 1;
  int32 page = 2;
  int32 page_size = 3;
}

message GetTeacherStudentsResponse {
  repeated StudentData students = 1;
  int32 total = 2;
  common.Response response = 3;
}

message StudentData {
  string user_id = 1;
  string email = 2;
  string first_name = 3;
  string last_name = 4;
  int32 total_courses = 5;
  int32 total_exam_results = 6;
  double average_score = 7;
  double completion_rate = 8;
  string status = 9;
  google.protobuf.Timestamp last_activity = 10;
}

message GetTeacherExamsRequest {
  string teacher_id = 1;
  string status = 2; // "all", "active", "draft", "archived"
  int32 page = 3;
  int32 page_size = 4;
}

message GetTeacherExamsResponse {
  repeated ExamData exams = 1;
  int32 total = 2;
  common.Response response = 3;
}

message ExamData {
  string id = 1;
  string title = 2;
  string description = 3;
  string subject = 4;
  int32 grade = 5;
  string difficulty = 6;
  string exam_type = 7;
  string status = 8;
  int32 duration_minutes = 9;
  int32 total_points = 10;
  int32 pass_percentage = 11;
  int32 question_count = 12;
  int32 attempt_count = 13;
  double average_score = 14;
  google.protobuf.Timestamp created_at = 15;
  google.protobuf.Timestamp published_at = 16;
}
```

**Verification**:
- [ ] File created at correct location
- [ ] Syntax valid (no proto errors)
- [ ] Imports correct (google/api, google/protobuf, common)
- [ ] go_package option set correctly

---

#### Task 1.2: Generate Proto Code (30 minutes)

**Commands**:
```bash
# From project root
cd packages/proto

# Generate Go code
buf generate --template buf.gen.yaml

# Generate TypeScript code
./scripts/development/gen-proto-web.ps1
```

**Expected Output**:
- `apps/backend/pkg/proto/v1/analytics.pb.go`
- `apps/backend/pkg/proto/v1/analytics_grpc.pb.go`
- `apps/frontend/src/generated/v1/analytics_pb.ts`
- `apps/frontend/src/generated/v1/AnalyticsServiceClientPb.ts`

**Verification**:
- [ ] Go files generated without errors
- [ ] TypeScript files generated without errors
- [ ] No compilation errors in backend
- [ ] No TypeScript errors in frontend

---

#### Task 1.3: Implement TeacherAnalyticsService (3 hours)

**File**: `apps/backend/internal/service/system/analytics/teacher_analytics_service.go`

**Action**: CREATE NEW FILE

**Dependencies**:
- ExamRepository (existing)
- EnrollmentRepository (existing)
- DashboardService (existing)
- AnalyticsService (existing)

**Key Methods**:
1. `GetTeacherDashboard(ctx, teacherID, timeRange) (*TeacherDashboardData, error)`
2. `GetTeacherStudents(ctx, teacherID, page, pageSize) ([]*StudentData, int, error)`
3. `GetTeacherExams(ctx, teacherID, status, page, pageSize) ([]*ExamData, int, error)`

**SQL Queries**:

**GetTeacherDashboard**:
```sql
-- Get teacher's exams count
SELECT COUNT(*) FROM exams WHERE created_by = $1

-- Get students enrolled in teacher's courses
SELECT COUNT(DISTINCT ce.user_id)
FROM course_enrollments ce
WHERE ce.course_id IN (
  SELECT DISTINCT course_id FROM course_enrollments 
  WHERE user_id = $1 -- Assuming teacher is also enrolled as instructor
)

-- Get average score and pass rate for teacher's exams
SELECT 
  COALESCE(AVG(ea.percentage), 0) as average_score,
  COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100 as pass_rate,
  COUNT(DISTINCT ea.user_id) as active_students
FROM exam_attempts ea
JOIN exams e ON ea.exam_id = e.id
WHERE e.created_by = $1 AND ea.status = 'submitted'
  AND ea.submitted_at >= NOW() - INTERVAL '$2 days'

-- Get performance trends (last 30 days)
SELECT 
  DATE(ea.submitted_at) as date,
  AVG(ea.percentage) as average_score,
  COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / COUNT(*) * 100 as pass_rate,
  COUNT(*) as attempt_count
FROM exam_attempts ea
JOIN exams e ON ea.exam_id = e.id
WHERE e.created_by = $1 AND ea.status = 'submitted'
  AND ea.submitted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ea.submitted_at)
ORDER BY date DESC
```

**GetTeacherStudents**:
```sql
SELECT 
  u.id, u.email, u.first_name, u.last_name,
  COUNT(DISTINCT ce.course_id) as total_courses,
  COUNT(DISTINCT ea.id) as total_exam_results,
  COALESCE(AVG(ea.percentage), 0) as average_score,
  COALESCE(AVG(ce.progress), 0) as completion_rate,
  u.status,
  MAX(ea.submitted_at) as last_activity
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
LEFT JOIN exam_attempts ea ON u.id = ea.user_id
WHERE u.role = 'STUDENT'
  AND ce.course_id IN (
    SELECT DISTINCT course_id FROM course_enrollments WHERE user_id = $1
  )
GROUP BY u.id, u.email, u.first_name, u.last_name, u.status
ORDER BY last_activity DESC
LIMIT $2 OFFSET $3
```

**Verification**:
- [ ] Service compiles without errors
- [ ] All methods implemented
- [ ] SQL queries tested manually
- [ ] Error handling implemented
- [ ] Logging added

---

#### Task 1.4: Create gRPC Service Server (2 hours)

**File**: `apps/backend/internal/grpc/analytics_service.go`

**Action**: CREATE NEW FILE

**Pattern**: Follow existing service pattern (exam_service.go, admin_service.go)

**Structure**:
```go
package grpc

import (
    "context"
    v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/system/analytics"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

type AnalyticsServiceServer struct {
    v1.UnimplementedAnalyticsServiceServer
    teacherAnalytics *analytics.TeacherAnalyticsService
}

func NewAnalyticsServiceServer(teacherAnalytics *analytics.TeacherAnalyticsService) *AnalyticsServiceServer {
    return &AnalyticsServiceServer{
        teacherAnalytics: teacherAnalytics,
    }
}

func (s *AnalyticsServiceServer) GetTeacherDashboard(ctx context.Context, req *v1.GetTeacherDashboardRequest) (*v1.GetTeacherDashboardResponse, error) {
    // Get user from context for authorization
    userID, err := middleware.GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
    }
    
    // Verify teacher owns the data (or is admin)
    if req.GetTeacherId() != userID {
        // Check if user is admin
        userRole, err := middleware.GetUserRoleFromContext(ctx)
        if err != nil || userRole != "ADMIN" {
            return nil, status.Errorf(codes.PermissionDenied, "access denied")
        }
    }
    
    // Get dashboard data
    data, err := s.teacherAnalytics.GetTeacherDashboard(ctx, req.GetTeacherId(), req.GetTimeRange())
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get teacher dashboard: %v", err)
    }
    
    return &v1.GetTeacherDashboardResponse{
        Data: data,
        Response: &common.Response{
            Success: true,
            Message: "Dashboard data retrieved successfully",
        },
    }, nil
}
```

**Verification**:
- [ ] Server implements all RPC methods
- [ ] Authorization checks implemented
- [ ] Error handling with proper gRPC codes
- [ ] Response mapping correct

---

#### Task 1.5: Register Service in Container (30 minutes)

**File**: `apps/backend/internal/container/container.go`

**Action**: MODIFY EXISTING FILE

**Changes**:

1. Add field to Container struct:
```go
type Container struct {
    // ... existing fields
    TeacherAnalyticsService *analytics.TeacherAnalyticsService
    AnalyticsGRPCService    *grpc.AnalyticsServiceServer
}
```

2. Initialize in `initServices()`:
```go
func (c *Container) initServices() {
    // ... existing services
    
    // Initialize TeacherAnalyticsService
    c.TeacherAnalyticsService = analytics.NewTeacherAnalyticsService(
        c.ExamRepo,
        c.EnrollmentRepo,
        c.DashboardService,
        c.AnalyticsService,
        c.Logger,
    )
}
```

3. Initialize in `initGRPCServices()`:
```go
func (c *Container) initGRPCServices() {
    // ... existing services
    
    c.AnalyticsGRPCService = grpc.NewAnalyticsServiceServer(c.TeacherAnalyticsService)
}
```

4. Add getter method:
```go
func (c *Container) GetAnalyticsGRPCService() *grpc.AnalyticsServiceServer {
    return c.AnalyticsGRPCService
}
```

**Verification**:
- [ ] Container compiles without errors
- [ ] Service initialized correctly
- [ ] Getter method added

---

#### Task 1.6: Register Service in App (30 minutes)

**File**: `apps/backend/internal/app/app.go`

**Action**: MODIFY EXISTING FILE

**Changes**:

Add service registration in `initGRPCServer()`:
```go
func (a *App) initGRPCServer() error {
    // ... existing registrations
    
    v1.RegisterAnalyticsServiceServer(a.grpcServer, a.container.GetAnalyticsGRPCService())
    
    return nil
}
```

**Verification**:
- [ ] App compiles without errors
- [ ] Service registered correctly
- [ ] gRPC server starts without errors

---

### Phase 2: Frontend Integration (8 hours)

#### Task 2.1: Create Analytics gRPC Service Wrapper (2 hours)

**File**: `apps/frontend/src/services/grpc/analytics.service.ts`

**Action**: CREATE NEW FILE

**Pattern**: Follow ExamService pattern

**Key Methods**:
- `getTeacherDashboard(teacherId, timeRange)`
- `getTeacherStudents(teacherId, page, pageSize)`
- `getTeacherExams(teacherId, status, page, pageSize)`

**Verification**:
- [ ] Service compiles without TypeScript errors
- [ ] Type mappings correct (Proto ↔ TypeScript)
- [ ] Error handling implemented
- [ ] getAuthMetadata() used correctly

---

#### Task 2.2: Create TanStack Query Hooks (2 hours)

**File**: `apps/frontend/src/hooks/teacher/use-teacher-analytics.ts`

**Action**: CREATE NEW FILE

**Pattern**: Follow use-public-questions.ts pattern

**Query Keys**:
```typescript
export const TEACHER_ANALYTICS_QUERY_KEYS = {
  all: ['teacher-analytics'] as const,
  dashboard: (teacherId: string, timeRange: string) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'dashboard', teacherId, timeRange] as const,
  students: (teacherId: string, page: number) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'students', teacherId, page] as const,
  exams: (teacherId: string, status: string, page: number) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'exams', teacherId, status, page] as const,
};
```

**Hooks**:
- `useTeacherDashboard(teacherId, timeRange)`
- `useTeacherStudents(teacherId, page, pageSize)`
- `useTeacherExams(teacherId, status, page, pageSize)`

**Verification**:
- [ ] Hooks compile without errors
- [ ] Query keys structured correctly
- [ ] Cache configuration correct (staleTime, gcTime)
- [ ] Retry logic implemented

---

#### Task 2.3-2.5: Update Teacher Pages (4 hours)

**Files**:
- `apps/frontend/src/app/teacher/analytics/page.tsx` (MODIFY)
- `apps/frontend/src/app/teacher/students/page.tsx` (MODIFY)
- `apps/frontend/src/app/teacher/exams/page.tsx` (MODIFY)

**Changes**: Replace mock data with real API calls using hooks

**Verification**:
- [ ] Pages compile without errors
- [ ] Loading states work correctly
- [ ] Error handling displays properly
- [ ] Data displays correctly

---

### Phase 3: Seed Data & Testing (4 hours)

#### Task 3.1: Create Seed Script (2 hours)

**File**: `apps/frontend/prisma/seed-teacher-data.ts`

**Action**: CREATE NEW FILE

**Data to Seed**:
- 10-30 students per teacher course
- 20-50 exam attempts per exam
- Realistic scores (60-95 range)
- Time-based data (last 30 days)

**Verification**:
- [ ] Seed script runs without errors
- [ ] Data created in database
- [ ] Relationships correct

---

#### Task 3.2: Test Integration (2 hours)

**Actions**:
1. Run seed script
2. Start backend server
3. Start frontend server
4. Test all 3 pages
5. Verify data displays correctly
6. Test filters and pagination
7. Test error scenarios

**Verification**:
- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] Filters work
- [ ] Pagination works
- [ ] Error handling works

---

### Phase 4: Error Handling & Polish (4 hours)

#### Task 4.1: Add Loading States (1 hour)
#### Task 4.2: Add Error Boundaries (1 hour)
#### Task 4.3: Add Retry Logic (1 hour)
#### Task 4.4: Add Cache Invalidation (1 hour)

---

## Total Estimated Time: 24 hours (3 days)

**Next**: Proceed to EXECUTE phase

