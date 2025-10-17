# Research Findings - Backend Integration for Teacher Pages
**Date**: 2025-01-19  
**Phase**: RESEARCH (COMPLETED)  
**Augment Context Engine Calls**: 20/20

---

## Executive Summary

Comprehensive research completed for converting 4 teacher pages from mock data to real backend integration. Key findings:

✅ **READY**: Analytics services, database schema for analytics, gRPC patterns, seed data patterns  
❌ **MISSING**: Library/Materials service, material database tables, proto definitions for materials  
⚠️ **ACTION REQUIRED**: Create LibraryService gRPC + database migrations before frontend integration

---

## R1: Analytics Backend Services ✅

### Available Services

#### 1. DashboardService
**Location**: `apps/backend/internal/service/system/analytics/dashboard_service.go`

**Methods**:
- `GetDashboardOverview(ctx context.Context) (*DashboardOverview, error)`
  - Returns: totalExams, totalAttempts, activeUsers, performanceMetrics, performanceTrends, topPerformingExams
  - Database: exams, exam_attempts
  - Query: Aggregates scores, pass rates, 30-day trends

**Return Types**:
```go
type DashboardOverview struct {
    TotalExams          int
    TotalAttempts       int
    ActiveUsers         int
    PerformanceMetrics  *PerformanceMetrics
    PerformanceTrends   []*PerformanceTrend
    TopPerformingExams  []*ExamPerformance
}
```

#### 2. AnalyticsService
**Location**: `apps/backend/internal/service/system/analytics/analytics_service.go`

**Methods**:
- `GetExamAnalyticsReport(ctx context.Context, examID string) (*ExamAnalyticsReport, error)`
  - Returns: Comprehensive exam analytics with question insights and recommendations
  - Includes: Statistics, DifficultyAnalysis, TimeAnalysis, PerformanceTrends, QuestionInsights

**Return Types**:
```go
type ExamAnalyticsReport struct {
    ExamID             string
    GeneratedAt        time.Time
    Statistics         *interfaces.ExamStatistics
    DifficultyAnalysis *interfaces.DifficultyAnalysis
    TimeAnalysis       *interfaces.TimeAnalysis
    PerformanceTrends  []*interfaces.PerformanceTrend
    QuestionInsights   []*QuestionInsight
    Recommendations    []string
}
```

#### 3. MonitoringService
**Location**: `apps/backend/internal/service/system/analytics/monitoring_service.go`

**Methods**:
- `GetSystemHealthMetrics(ctx context.Context) (*SystemHealthMetrics, error)`
  - Returns: Real-time system health, active users, active exams, database health
  - Background monitoring loop (30s interval)

### ⚠️ Missing Features

**Teacher-Specific Filtering**:
- ❌ No `teacher_id` parameter in analytics methods
- ❌ Cannot filter analytics by specific teacher's exams
- ❌ Cannot get teacher-specific student performance

**Required Enhancements**:
1. Add `GetTeacherDashboard(ctx context.Context, teacherID string)` method
2. Add `GetTeacherExamAnalytics(ctx context.Context, teacherID string, examID string)` method
3. Add teacher_id filtering to existing queries

---

## R2: Materials/Library Backend System ❌

### Current Status

#### ❌ LibraryService NOT IMPLEMENTED
- **Specification exists**: `docs/arch/LIBRARY_IMPLEMENT.md` (complete spec)
- **Proto definition**: `packages/proto/v1/book.proto` (Book service only)
- **gRPC service**: NOT REGISTERED in container.go or app.go
- **Implementation**: DOES NOT EXIST

#### ✅ GoogleDriveUploader EXISTS (Limited Scope)
**Location**: `apps/backend/internal/service/system/image_processing/google_drive_uploader.go`

**Purpose**: Image uploads for questions only  
**Methods**:
- `UploadImage(ctx, localPath, questionCode, imageType) (*UploadResult, error)`
- `DeleteImage(ctx, fileID) error`
- `GetImageInfo(ctx, fileID) (*drive.File, error)`

**Configuration**:
```go
type DriveConfig struct {
    ClientID        string
    ClientSecret    string
    RefreshToken    string
    RootFolderID    string
    FolderStructure string // MapCode-based: "grade/subject/chapter/lesson/form/level"
}
```

**Limitations**:
- ❌ Only handles images (PNG, JPG, SVG)
- ❌ Does NOT support PDF, videos, documents
- ❌ No material metadata management
- ❌ No access control for materials

#### ❌ Library Database Tables NOT CREATED
**Missing Tables** (from LIBRARY_IMPLEMENT.md):
1. `library_items` - Main library items (exam, book, video)
2. `exam_metadata` - Exam-specific metadata
3. `book_metadata` - Book-specific metadata
4. `video_metadata` - Video-specific metadata (YouTube integration)
5. `item_ratings` - User ratings and reviews
6. `user_bookmarks` - User bookmarks
7. `download_history` - Download tracking

**Migration Files**: NOT FOUND in `apps/backend/internal/database/migrations/`

### Required Implementation

**Phase 1: Database Schema**
1. Create migration `000006_library_system.up.sql`
2. Implement all 7 tables from LIBRARY_IMPLEMENT.md
3. Add indexes for performance (type, status, subject, grade)
4. Add foreign keys to users table

**Phase 2: Proto Definitions**
1. Create `packages/proto/v1/library.proto`
2. Define LibraryService with methods:
   - CreateLibraryItem, UpdateLibraryItem, DeleteLibraryItem
   - ListLibraryItems (with filters: type, subject, grade, status)
   - GetLibraryItem, UploadMaterial, DownloadMaterial
   - RateMaterial, BookmarkMaterial, GetDownloadHistory

**Phase 3: Backend Service**
1. Create `apps/backend/internal/service/library/library_service.go`
2. Implement LibraryRepository
3. Integrate with GoogleDriveUploader for file storage
4. Implement role-based access control
5. Register service in container.go and app.go

**Phase 4: Frontend Integration**
1. Generate gRPC-Web client from proto
2. Create `apps/frontend/src/services/grpc/library.service.ts`
3. Implement type mapping (Proto ↔ TypeScript)
4. Add error handling and loading states

---

## R3: Database Schema for Analytics & Materials ✅

### ✅ Analytics Tables (COMPLETE)

#### exam_attempts
**Location**: `apps/backend/internal/database/migrations/000004_exam_management_system.up.sql`

**Schema**:
```sql
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    status attempt_status DEFAULT 'in_progress',
    
    -- Scoring
    score DECIMAL(5,2),
    total_points INT,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INT,
    
    -- Additional data
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    
    UNIQUE(exam_id, user_id, attempt_number)
);
```

**Indexes**:
- `idx_exam_attempts_exam_id` on exam_id
- `idx_exam_attempts_user_id` on user_id
- `idx_exam_attempts_status` on status

#### exam_results
**Schema**:
```sql
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID UNIQUE NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    -- Statistics
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    
    -- Score breakdown by question type
    score_breakdown JSONB, -- {"MC": 10, "TF": 5, "SA": 8, ...}
    
    -- Performance metrics
    accuracy_percentage DECIMAL(5,2),
    avg_time_per_question DECIMAL(8,2),
    
    -- Feedback
    feedback TEXT,
    grade VARCHAR(2), -- A+, A, B+, B, C, D, F
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### course_enrollments
**Location**: `apps/backend/internal/database/migrations/000003_auth_security_system.up.sql`

**Schema**:
```sql
CREATE TABLE course_enrollments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'EXPIRED')),
    access_level TEXT NOT NULL DEFAULT 'BASIC'
        CHECK (access_level IN ('BASIC', 'PREMIUM', 'FULL')),
    max_downloads INTEGER,
    current_downloads INTEGER NOT NULL DEFAULT 0,
    max_streams INTEGER,
    expires_at TIMESTAMPTZ,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes**:
- `idx_course_enrollments_user_course` UNIQUE on (user_id, course_id)
- `idx_course_enrollments_status` on status

#### performance_metrics
**Schema**:
```sql
CREATE TABLE performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    context JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- `idx_performance_metrics_context` GIN on context
- `idx_performance_metrics_name_time` on (metric_name, recorded_at DESC)

### ❌ Materials Tables (MISSING)

**Status**: NO MIGRATION FILES FOUND

**Required Tables** (from LIBRARY_IMPLEMENT.md):
1. library_items
2. exam_metadata
3. book_metadata
4. video_metadata
5. item_ratings
6. user_bookmarks
7. download_history

**Action Required**: Create migration `000006_library_system.up.sql`

---

## R4: gRPC Service Patterns ✅

### Frontend Service Implementation Pattern

#### 1. Client Initialization
**Location**: `apps/frontend/src/services/grpc/client.ts`

```typescript
import * as grpcWeb from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { AuthHelpers } from '@/lib/utils/auth-helpers';

export const GRPC_WEB_HOST = getGrpcUrl();

export function getAuthMetadata(): grpcWeb.Metadata {
  const metadata: grpcWeb.Metadata = {};
  
  // Add JWT token
  const token = AuthHelpers.getAccessToken();
  if (token) {
    metadata['Authorization'] = `Bearer ${token}`;
  }
  
  // Add CSRF token
  const csrfToken = AuthHelpers.getCsrfToken();
  if (csrfToken) {
    metadata['X-CSRF-Token'] = csrfToken;
  }
  
  return metadata;
}
```

#### 2. Service Client Pattern
**Example**: `apps/frontend/src/services/grpc/exam.service.ts`

```typescript
import { ExamServiceClient } from '@/generated/v1/ExamServiceClientPb';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

const GRPC_ENDPOINT = getGrpcUrl();
const examServiceClient = new ExamServiceClient(GRPC_ENDPOINT);

export const ExamService = {
  listExams: async (filters?: ExamFilters): Promise<{ exams: Exam[], total: number }> => {
    try {
      const request = new ListExamsRequest();
      // Set filters...
      
      const response = await examServiceClient.listExams(request, getAuthMetadata());
      const exams = response.getExamsList().map(mapExamFromPb);
      
      return {
        exams,
        total: response.getPagination()?.getTotalCount() || 0
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }
};
```

#### 3. Type Mapping Pattern

**Proto → TypeScript**:
```typescript
function mapExamFromPb(pbExam: PbExam): Exam {
  const examObj = pbExam.toObject();
  
  return {
    id: examObj.id,
    title: examObj.title,
    description: examObj.description,
    examType: mapExamTypeFromPb(examObj.examType),
    status: mapExamStatusFromPb(examObj.status),
    difficulty: mapDifficultyFromPb(examObj.difficulty),
    tags: examObj.tagsList || [],
    // ... other fields
  };
}
```

**TypeScript → Proto**:
```typescript
function mapExamTypeToPb(type: ExamType): PbExamType {
  switch (type) {
    case ExamType.GENERATED: return PbExamType.EXAM_TYPE_GENERATED;
    case ExamType.OFFICIAL: return PbExamType.EXAM_TYPE_OFFICIAL;
    default: return PbExamType.EXAM_TYPE_UNSPECIFIED;
  }
}
```

#### 4. Error Handling Pattern

```typescript
function handleGrpcError(error: RpcError): string {
  const code = error.code;
  const message = error.message;
  
  switch (code) {
    case grpcWeb.StatusCode.UNAUTHENTICATED:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case grpcWeb.StatusCode.PERMISSION_DENIED:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case grpcWeb.StatusCode.NOT_FOUND:
      return 'Không tìm thấy dữ liệu.';
    default:
      return message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
}
```

---

## R5: Seed Data Patterns ✅

### Prisma Seed Script
**Location**: `apps/frontend/prisma/seed.ts`

**Pattern**:
```typescript
const password = await hashPassword('Abd8stbcs!');

// Create users
const admin = await prisma.users.create({
  data: {
    id: generateId(),
    email: 'admin1@nynus.com',
    password_hash: password,
    first_name: 'Nguyễn',
    last_name: 'Công Tú',
    username: 'admin.congtu1',
    role: 'ADMIN',
    status: 'ACTIVE',
    email_verified: true,
    bio: 'Quản trị viên hệ thống NyNus - 1',
    phone: '0901234561',
    school: 'Trường THPT Chuyên Lê Hồng Phong',
  }
});
```

**Data Volumes**:
- 3 Admin users
- 4 Teacher users
- 100 Student users
- Question codes (ID5 and ID6 format)
- Questions (MC, TF, SA, ES types)
- Exams with exam_questions junction

### SQL Seed Script
**Location**: `docker/database/init-scripts/03-seed-custom-users.sql`

**Pattern**:
```sql
INSERT INTO users (id, email, password_hash, first_name, last_name, username, role, level, status, email_verified, bio, phone, school, last_login_at, last_login_ip, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'admin1@nynus.com', '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe', 'Nguyễn', 'Công Tú', 'admin.congtu1', 'ADMIN', NULL, 'ACTIVE', true, 'Quản trị viên hệ thống NyNus - 1', '0901234561', 'Trường THPT Chuyên Lê Hồng Phong', NOW(), '192.168.1.1', NOW(), NOW());
```

**Password**: `Abd8stbcs!` (bcrypt hashed)

---

## R6-R7: Teacher Pages Mock Implementation ✅

### Common Patterns

#### 1. Mock Data Structures
```typescript
interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  totalCourses: number;
  totalExamResults: number;
  averageScore: number;
  completionRate: number;
  status: 'active' | 'inactive';
  lastActivity: Date;
}
```

#### 2. Filters State
```typescript
const [filters, setFilters] = useState({
  search: '',
  status: 'all',
  subject: 'all',
  grade: 'all'
});
```

#### 3. View Modes
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
```

#### 4. UI Components
- Shadcn UI: Card, Button, Input, Select, Badge
- Framer Motion: Animations with stagger effects
- Lucide Icons: Consistent icon usage

---

## Summary & Next Steps

### ✅ Ready for Integration
1. Analytics backend services (with teacher-specific enhancements needed)
2. Database schema for analytics
3. gRPC service patterns well-established
4. Seed data patterns available
5. Teacher pages UI ready

### ❌ Blocking Issues
1. **LibraryService NOT IMPLEMENTED** - Required for Materials page
2. **Material database tables MISSING** - Required for data persistence
3. **Proto definitions incomplete** - Need library.proto

### 📋 Recommended Implementation Order

**Phase 1: Library System Foundation** (BLOCKING)
1. Create database migration for library tables
2. Create library.proto with service definitions
3. Implement LibraryService backend
4. Register service in container and app

**Phase 2: Analytics Enhancements**
1. Add teacher-specific filtering to analytics services
2. Create teacher dashboard endpoint
3. Add course-student relationship queries

**Phase 3: Frontend Integration**
1. Generate gRPC-Web clients
2. Create frontend service wrappers
3. Replace mock data with real API calls
4. Add loading states and error handling

**Phase 4: Seed Data**
1. Create seed data for library items
2. Create seed data for course enrollments
3. Create seed data for exam attempts

---

**Research Phase Completed**: 2025-01-19  
**Total Augment Context Engine Calls**: 20/20  
**Next Phase**: INNOVATE - Design Integration Architecture

