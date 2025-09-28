# Migration Checklist - Codebase Reorganization (Enhanced)
*Generated: 2025-01-19 | Updated: 2025-01-28 | Comprehensive Step-by-Step Migration Plan*

## 📋 Overview

This checklist provides a detailed, step-by-step plan for reorganizing the exam-bank-system codebase. Each task includes specific files to modify, import changes required, dependency analysis, interface consolidation, and comprehensive testing steps to verify the changes.

**Total Estimated Time**: 4-5 weeks
**Files Affected**: ~300 files
**Import Changes**: ~200 import statements
**Interface Consolidations**: ~15 interfaces
**Container Restructuring**: Major dependency injection updates

## 🚨 Pre-Migration Setup

### [ ] 1. Backup and Branch Creation
```bash
# Create backup branch
git checkout -b backup/pre-reorganization-$(date +%Y%m%d)
git push origin backup/pre-reorganization-$(date +%Y%m%d)

# Create feature branch
git checkout -b feature/codebase-reorganization
```

### [ ] 2. Document Current State
```bash
# Generate current import map
find apps/ -name "*.go" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*service" > current-imports.txt
find apps/ -name "*.go" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*types" >> current-imports.txt

# Document current service structure
find apps/backend/internal/service/ -type f -name "*.go" > current-service-files.txt
```

### [ ] 3. Run Baseline Tests
```bash
# Backend tests
cd apps/backend && go test ./...

# Frontend tests
cd apps/frontend && pnpm test

# Build verification
make build
pnpm build --prefix apps/frontend

# Document baseline metrics
echo "Baseline test results: $(date)" > migration-baseline.log
```

---

## 🔍 Phase 0: Pre-Migration Analysis (NEW)

### [x] Task 0.1: Dependency Mapping and Analysis
**Status**: Completed
**Estimated Time**: 4 hours
**Actual Time**: 1.5 hours
**Critical for**: Preventing circular dependencies and broken imports

#### Step 0.1.1: Analyze Service Dependencies
```bash
# Map all service dependencies
echo "=== Service Dependency Analysis ===" > dependency-analysis.txt
go list -deps ./apps/backend/internal/service/... >> dependency-analysis.txt

# Check for circular dependencies
echo "=== Circular Dependency Check ===" >> dependency-analysis.txt
go list -deps ./apps/backend/internal/service/... | grep -E "(domain_service|service_mgmt)" | sort | uniq -c >> dependency-analysis.txt

# Analyze import patterns
echo "=== Import Pattern Analysis ===" >> dependency-analysis.txt
grep -r "import.*service" apps/backend/internal/ | grep -E "(domain_service|service_mgmt)" >> dependency-analysis.txt
```

#### Step 0.1.2: Document Interface Dependencies
```bash
# Find all service interfaces
echo "=== Interface Analysis ===" >> dependency-analysis.txt
find apps/backend/internal/ -name "*.go" -exec grep -l "interface" {} \; | xargs grep -n "interface" >> dependency-analysis.txt

# Document interface overlaps
echo "=== Interface Overlaps ===" >> dependency-analysis.txt
grep -r "AuthService\|IAuthService\|AuthServiceInterface" apps/backend/internal/ >> dependency-analysis.txt
```

#### Step 0.1.3: Validate Analysis Results
```bash
# Ensure no critical dependencies missed
go mod graph | grep "exam-bank-system" | grep service > service-mod-deps.txt

# Verify current build state
cd apps/backend && go build ./... || echo "BUILD FAILED - Fix before migration" >> dependency-analysis.txt
```

### [x] Task 0.2: Interface Consolidation Planning
**Status**: Completed
**Estimated Time**: 3 hours
**Actual Time**: 2 hours
**Critical for**: Preventing duplicate interfaces and method conflicts

#### Step 0.2.1: Identify Duplicate Interfaces
```bash
# Create interface consolidation plan
echo "=== Interface Consolidation Plan ===" > interface-consolidation-plan.md

# Auth interfaces analysis
echo "## Auth Service Interfaces" >> interface-consolidation-plan.md
echo "### Current Interfaces:" >> interface-consolidation-plan.md
grep -A 10 "type.*AuthService.*interface" apps/backend/internal/service/service_mgmt/auth/auth_mgmt.go >> interface-consolidation-plan.md
grep -A 10 "type.*AuthServiceInterface.*interface" apps/backend/internal/interfaces/services.go >> interface-consolidation-plan.md

# Question interfaces analysis
echo "## Question Service Interfaces" >> interface-consolidation-plan.md
grep -A 5 "type.*QuestionService.*interface" apps/backend/internal/interfaces/services.go >> interface-consolidation-plan.md
```

#### Step 0.2.2: Plan Interface Merging Strategy
```bash
# Document interface merge plan
cat >> interface-consolidation-plan.md << 'EOF'

### Consolidation Strategy:
1. **Auth Services**: Merge IAuthService + AuthServiceInterface -> ConsolidatedAuthService
2. **Question Services**: Merge QuestionServiceInterface -> QuestionService
3. **User Services**: Merge IUserService + UserServiceInterface -> UserService
4. **Exam Services**: Create new ExamServiceInterface from exam_mgmt

### Method Signature Conflicts:
- Auth.Login: Different parameter patterns (db vs no-db)
- User methods: Pagination parameter differences
- Token validation: Different return types

### Resolution Plan:
- Standardize on database.QueryExecer parameter pattern
- Use context.Context for all operations
- Consistent error handling patterns
EOF
```

### [x] Task 0.3: Container Restructuring Analysis
**Status**: Completed
**Estimated Time**: 2 hours
**Actual Time**: 1.5 hours
**Critical for**: Smooth dependency injection transition

#### Step 0.3.1: Analyze Current Container Structure
```bash
# Document current container dependencies
echo "=== Container Analysis ===" > container-analysis.txt
grep -A 50 "type Container struct" apps/backend/internal/container/container.go >> container-analysis.txt

# Find all container usage
echo "=== Container Usage ===" >> container-analysis.txt
grep -r "container\." apps/backend/internal/grpc/ >> container-analysis.txt
```

#### Step 0.3.2: Plan Container Restructuring
```bash
# Create container restructuring plan
cat > container-restructuring-plan.md << 'EOF'
# Container Restructuring Plan

## Current Structure Issues:
- Duplicate service references (AuthMgmt + JWTService + EnhancedJWTService)
- Mixed abstraction levels (domain services + management services)
- Complex initialization dependencies

## Target Structure:
```go
type Container struct {
    // Infrastructure (unchanged)
    DB                    *sql.DB
    RedisClient          *redis.Client

    // Repositories (unchanged)
    UserRepo             *repository.UserRepository
    // ... other repos

    // NEW: Consolidated Services
    AuthService          *auth.ConsolidatedAuthService
    QuestionService      *question.QuestionService
    ExamService          *exam.ExamService
    UserService          *user.UserService
    NotificationService  *notification.NotificationService
    ContentService       *content.ContentService

    // gRPC Services (updated to use consolidated services)
    EnhancedUserGRPCService   *grpc.EnhancedUserServiceServer
    // ... other gRPC services
}
```

## Migration Steps:
1. Add new consolidated service fields
2. Update initialization methods
3. Update gRPC service constructors
4. Remove old service fields
5. Test dependency injection
EOF
```

#### Step 0.3.3: Validate Pre-Migration Analysis
```bash
# Ensure all analysis files created
ls -la dependency-analysis.txt interface-consolidation-plan.md container-restructuring-plan.md

# Final validation
echo "=== Pre-Migration Analysis Complete ===" >> migration-baseline.log
echo "Dependency analysis: $(wc -l dependency-analysis.txt)" >> migration-baseline.log
echo "Interface plan: $(wc -l interface-consolidation-plan.md)" >> migration-baseline.log
echo "Container plan: $(wc -l container-restructuring-plan.md)" >> migration-baseline.log
```

---

## � Rollback Procedures (NEW)

### If Migration Fails at Any Step:

#### Immediate Rollback:
```bash
# Stop all services
make stop || docker-compose down

# Restore from backup
git checkout backup/pre-reorganization-$(date +%Y%m%d)
git reset --hard HEAD

# Clean any partial changes
git clean -fd

# Verify restoration
make build
make test
```

#### Document Failure:
```bash
# Create failure report
echo "Migration failed at: $(date)" > migration-failure-$(date +%Y%m%d).log
echo "Failed task: [TASK_NAME]" >> migration-failure-$(date +%Y%m%d).log
echo "Error details: [ERROR_DETAILS]" >> migration-failure-$(date +%Y%m%d).log
echo "Rollback completed: $(date)" >> migration-failure-$(date +%Y%m%d).log
```

---

## �🔴 Phase 1: Backend Service Layer Consolidation (Enhanced)

### [x] Task 1.1: Create New Service Structure
**Status**: Completed
**Estimated Time**: 2 hours
**Actual Time**: 1 hour
**Files Created**: 7 directories + 7 interface files

#### Step 1.1.1: Create Consolidated Service Directories
```bash
# Create new consolidated service directories
mkdir -p apps/backend/internal/service/auth
mkdir -p apps/backend/internal/service/user
mkdir -p apps/backend/internal/service/question
mkdir -p apps/backend/internal/service/exam
mkdir -p apps/backend/internal/service/content
mkdir -p apps/backend/internal/service/notification

# Create system services directory for analytics, performance, security
mkdir -p apps/backend/internal/service/system
```

#### Step 1.1.2: Create Interface Files for Each Service
```bash
# Create interface files for consolidated services
touch apps/backend/internal/service/auth/interfaces.go
touch apps/backend/internal/service/user/interfaces.go
touch apps/backend/internal/service/question/interfaces.go
touch apps/backend/internal/service/exam/interfaces.go
touch apps/backend/internal/service/content/interfaces.go
touch apps/backend/internal/service/notification/interfaces.go
```

**Test After Creation**:
```bash
# Verify directories exist
ls -la apps/backend/internal/service/
# Verify interface files created
find apps/backend/internal/service/ -name "interfaces.go" -type f
```

### [x] Task 1.2: Consolidate Auth Services (Enhanced)
**Status**: Completed
**Estimated Time**: 6 hours
**Actual Time**: 3 hours
**Files Affected**: 8 files
**Import Changes**: ~20 import statements
**Interface Consolidations**: 3 interfaces -> 1 consolidated interface

#### Step 1.2.1: Create Consolidated Auth Interface
```bash
# Create consolidated auth interface
cat > apps/backend/internal/service/auth/interfaces.go << 'EOF'
package auth

import (
	"context"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ConsolidatedAuthService merges all auth interfaces
type ConsolidatedAuthService interface {
	// Authentication methods
	Login(db database.QueryExecer, email, password string) (*entity.User, string, error)
	Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error)

	// Token management
	ValidateToken(tokenString string) (*Claims, error)
	GenerateRefreshTokenPair(ctx context.Context, userID, email, role string, level int, ipAddress, userAgent, deviceFingerprint string) (*RefreshTokenResponse, error)

	// Authorization methods
	IsAdmin(db database.QueryExecer, userID string) (bool, error)
	IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error)
	IsStudent(db database.QueryExecer, userID string) (bool, error)
	GetUserRole(db database.QueryExecer, userID string) (string, error)

	// Enhanced methods
	IsGuest(db database.QueryExecer, userID string) (bool, error)
	HasRoleOrHigher(db database.QueryExecer, userID string, requiredRole string) (bool, error)
}

// JWT service interfaces
type JWTServiceInterface interface {
	GenerateAccessToken(userID, email, role string, level int) (string, error)
	ValidateAccessToken(tokenString string) (*Claims, error)
	GenerateRefreshToken(userID string) (string, error)
	ValidateRefreshToken(tokenString string) (*Claims, error)
}

type EnhancedJWTServiceInterface interface {
	JWTServiceInterface
	GenerateRefreshTokenPair(ctx context.Context, userID, email, role string, level int, ipAddress, userAgent, deviceFingerprint string) (*RefreshTokenResponse, error)
	RefreshAccessToken(ctx context.Context, refreshToken, ipAddress, userAgent, deviceFingerprint string) (*RefreshTokenResponse, error)
	RevokeRefreshToken(ctx context.Context, refreshToken string) error
}
EOF
```

#### Step 1.2.2: Move and Merge Auth Files
```bash
# Move domain_service auth files
mv apps/backend/internal/service/domain_service/auth/auth.go apps/backend/internal/service/auth/auth_service.go
mv apps/backend/internal/service/domain_service/auth/jwt_service.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/domain_service/auth/jwt_enhanced_service.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/domain_service/auth/jwt_adapter.go apps/backend/internal/service/auth/

# Move service_mgmt auth files
mv apps/backend/internal/service/service_mgmt/auth/auth_mgmt.go apps/backend/internal/service/auth/auth_management.go
mv apps/backend/internal/service/service_mgmt/auth/login.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/service_mgmt/auth/register.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/service_mgmt/auth/authorization.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/service_mgmt/auth/validate_token.go apps/backend/internal/service/auth/

# Move session and oauth services to auth
mv apps/backend/internal/service/domain_service/session/ apps/backend/internal/service/auth/session/
mv apps/backend/internal/service/domain_service/oauth/ apps/backend/internal/service/auth/oauth/
```

#### Step 1.2.3: Update Package Declarations and Imports
```bash
# Update package declarations in moved files
sed -i 's/package auth_mgmt/package auth/g' apps/backend/internal/service/auth/auth_management.go
sed -i 's/package auth_mgmt/package auth/g' apps/backend/internal/service/auth/login.go
sed -i 's/package auth_mgmt/package auth/g' apps/backend/internal/service/auth/register.go
sed -i 's/package auth_mgmt/package auth/g' apps/backend/internal/service/auth/authorization.go
sed -i 's/package auth_mgmt/package auth/g' apps/backend/internal/service/auth/validate_token.go

# Update internal imports in auth files
find apps/backend/internal/service/auth/ -name "*.go" -exec sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"|g' {} \;
```

#### Step 1.2.4: Update Container Dependencies
```bash
# Update container.go imports
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"|g' apps/backend/internal/container/container.go
sed -i 's|auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"||g' apps/backend/internal/container/container.go
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/session"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth/session"|g' apps/backend/internal/container/container.go
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth/oauth"|g' apps/backend/internal/container/container.go
```

#### Step 1.2.5: Test Auth Service Consolidation
```bash
# Check for circular dependencies
go list -deps ./apps/backend/internal/service/auth/... | grep -E "cycle|circular" || echo "No circular dependencies found"

# Build backend
cd apps/backend && go build ./...

# Run auth-related tests
go test ./internal/service/auth/...

# Test gRPC services that use auth
go test ./internal/grpc/... -run ".*Auth.*"

# Test container initialization
go test ./internal/container/... -v

# Integration test - verify auth endpoints work
echo "Testing auth consolidation..." >> migration-progress.log
```

#### Step 1.2.6: Rollback if Auth Consolidation Fails
```bash
# If any step fails, rollback auth consolidation
if [ $? -ne 0 ]; then
    echo "Auth consolidation failed, rolling back..." >> migration-failure-$(date +%Y%m%d).log
    git checkout HEAD -- apps/backend/internal/service/auth/
    git checkout HEAD -- apps/backend/internal/container/container.go
    # Restore original structure
    git checkout HEAD -- apps/backend/internal/service/domain_service/auth/
    git checkout HEAD -- apps/backend/internal/service/service_mgmt/auth/
    exit 1
fi
```

### [x] Task 1.3: Consolidate Question Services (Enhanced)
**Status**: Completed
**Estimated Time**: 5 hours
**Actual Time**: 4 hours
**Files Affected**: 8 files
**Import Changes**: ~15 import statements
**Interface Consolidations**: 2 interfaces -> 1 consolidated interface

#### Step 1.3.1: Create Consolidated Question Interface
```bash
# Create consolidated question interface
cat > apps/backend/internal/service/question/interfaces.go << 'EOF'
package question

import (
	"context"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ConsolidatedQuestionService merges all question interfaces
type ConsolidatedQuestionService interface {
	// CRUD operations
	CreateQuestion(ctx context.Context, question *entity.Question) error
	GetQuestionByID(ctx context.Context, id string) (entity.Question, error)
	UpdateQuestion(ctx context.Context, question *entity.Question) error
	DeleteQuestion(ctx context.Context, id string) error

	// Bulk operations
	BulkCreateQuestions(ctx context.Context, questions []*entity.Question) error
	BulkUpdateQuestions(ctx context.Context, questions []*entity.Question) error
	BulkDeleteQuestions(ctx context.Context, ids []string) error

	// Search and filtering
	SearchQuestions(ctx context.Context, query string, filters map[string]interface{}) ([]*entity.Question, error)
	FilterQuestions(ctx context.Context, filters map[string]interface{}) ([]*entity.Question, error)

	// Image processing
	ProcessQuestionImages(ctx context.Context, questionID string, rawLatex string) error
	GetQuestionImages(ctx context.Context, questionID string) ([]*entity.QuestionImage, error)

	// Validation
	ValidateQuestion(ctx context.Context, question *entity.Question) error
	ValidateQuestionContent(ctx context.Context, content string, questionType string) error
}

// Question validation interfaces
type QuestionValidationService interface {
	ValidateQuestionStructure(ctx context.Context, question *entity.Question) error
	ValidateAnswerData(ctx context.Context, answerData []byte, questionType string) error
	ValidateMCAnswer(ctx context.Context, answerData []byte) error
	ValidateTFAnswer(ctx context.Context, answerData []byte) error
	ValidateSAAnswer(ctx context.Context, answerData []byte) error
	ValidateESAnswer(ctx context.Context, answerData []byte) error
}
EOF
```

#### Step 1.3.2: Move Question Management Files
```bash
# Move question_mgmt files
mv apps/backend/internal/service/service_mgmt/question_mgmt/question_mgmt.go apps/backend/internal/service/question/question_service.go

# Move validation service
mv apps/backend/internal/service/domain_service/validation/ apps/backend/internal/service/question/validation/

# Move question filter service
mv apps/backend/internal/service/service_mgmt/question_filter/ apps/backend/internal/service/question/filter/
```

#### Step 1.3.3: Update Package Declarations and Imports
```bash
# Update package declarations
sed -i 's/package question_mgmt/package question/g' apps/backend/internal/service/question/question_service.go

# Update internal imports in question files
find apps/backend/internal/service/question/ -name "*.go" -exec sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"|g' {} \;
find apps/backend/internal/service/question/ -name "*.go" -exec sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/validation"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question/validation"|g' {} \;
```

#### Step 1.3.4: Update Container Dependencies
```bash
# Update container.go imports for question services
sed -i 's|question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"|g' apps/backend/internal/container/container.go
sed -i 's|question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question/filter"|g' apps/backend/internal/container/container.go

# Update gRPC service imports
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"|g' apps/backend/internal/grpc/question_service.go
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question/filter"|g' apps/backend/internal/grpc/question_filter_service.go
```

#### Step 1.3.5: Test Question Service Consolidation
```bash
# Check for circular dependencies
go list -deps ./apps/backend/internal/service/question/... | grep -E "cycle|circular" || echo "No circular dependencies found"

# Build and test
cd apps/backend && go build ./...
go test ./internal/service/question/...
go test ./internal/grpc/... -run ".*Question.*"

# Test question validation
go test ./internal/service/question/validation/... -v

# Integration test
echo "Testing question consolidation..." >> migration-progress.log
```

#### Step 1.3.6: Rollback if Question Consolidation Fails
```bash
# If any step fails, rollback question consolidation
if [ $? -ne 0 ]; then
    echo "Question consolidation failed, rolling back..." >> migration-failure-$(date +%Y%m%d).log
    git checkout HEAD -- apps/backend/internal/service/question/
    git checkout HEAD -- apps/backend/internal/container/container.go
    git checkout HEAD -- apps/backend/internal/grpc/question_service.go
    git checkout HEAD -- apps/backend/internal/grpc/question_filter_service.go
    # Restore original structure
    git checkout HEAD -- apps/backend/internal/service/service_mgmt/question_mgmt/
    git checkout HEAD -- apps/backend/internal/service/domain_service/validation/
    exit 1
fi
```

### [x] Task 1.4: Consolidate Exam Services (Enhanced)
**Status**: Completed
**Estimated Time**: 4 hours
**Actual Time**: 3.5 hours
**Files Affected**: 7 files
**Import Changes**: ~12 import statements
**Interface Consolidations**: Create new consolidated exam interface

#### Step 1.4.1: Create Consolidated Exam Interface
```bash
# Create consolidated exam interface
cat > apps/backend/internal/service/exam/interfaces.go << 'EOF'
package exam

import (
	"context"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
)

// ConsolidatedExamService merges all exam interfaces
type ConsolidatedExamService interface {
	// Exam CRUD operations
	CreateExam(ctx context.Context, exam *entity.Exam) error
	GetExamByID(ctx context.Context, examID string) (*entity.Exam, error)
	UpdateExam(ctx context.Context, exam *entity.Exam) error
	DeleteExam(ctx context.Context, examID string) error
	ListExams(ctx context.Context, filters *interfaces.ExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error)

	// Exam lifecycle
	PublishExam(ctx context.Context, examID string) error
	ArchiveExam(ctx context.Context, examID string) error

	// Question management
	AddQuestionToExam(ctx context.Context, examID, questionID string) error
	RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error
	GetExamQuestions(ctx context.Context, examID string) ([]*entity.Question, error)

	// Exam attempts
	StartExamAttempt(ctx context.Context, examID, userID string) (*entity.ExamAttempt, error)
	SubmitExamAttempt(ctx context.Context, attemptID string, answers map[string]interface{}) (*entity.ExamAttempt, error)
	GetExamAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error)
}

// Auto-grading service interface
type AutoGradingService interface {
	GradeExamAttempt(ctx context.Context, attempt *entity.ExamAttempt) (*entity.ExamResult, error)
	GradeQuestion(ctx context.Context, question *entity.Question, answer interface{}) (float64, error)
	CalculateExamScore(ctx context.Context, results []*entity.QuestionResult) (float64, error)
}

// Scoring engine interface
type ScoringEngineService interface {
	CalculateScore(answers []entity.Answer, questions []entity.Question) (float64, error)
	ValidateAnswers(answers []entity.Answer, questions []entity.Question) error
	GenerateScoreReport(examAttempt *entity.ExamAttempt) (*entity.ScoreReport, error)
}
EOF
```

#### Step 1.4.2: Move Exam Management Files
```bash
# Move exam_mgmt files
mv apps/backend/internal/service/service_mgmt/exam_mgmt/ apps/backend/internal/service/exam/management/

# Move scoring service
mv apps/backend/internal/service/domain_service/scoring/ apps/backend/internal/service/exam/scoring/

# Move exam domain service if exists
if [ -d "apps/backend/internal/service/domain_service/exam" ]; then
    mv apps/backend/internal/service/domain_service/exam/ apps/backend/internal/service/exam/domain/
fi
```

#### Step 1.4.3: Update Package Declarations and Imports
```bash
# Update package declarations in moved files
find apps/backend/internal/service/exam/management/ -name "*.go" -exec sed -i 's/package exam_mgmt/package management/g' {} \;

# Update internal imports in exam files
find apps/backend/internal/service/exam/ -name "*.go" -exec sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/management"|g' {} \;
find apps/backend/internal/service/exam/ -name "*.go" -exec sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/scoring"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/scoring"|g' {} \;
```

#### Step 1.4.4: Update Container Dependencies
```bash
# Update container.go imports for exam services
sed -i 's|exam_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/management"|g' apps/backend/internal/container/container.go
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/scoring"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/scoring"|g' apps/backend/internal/container/container.go

# Update gRPC service imports
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/management"|g' apps/backend/internal/grpc/exam_service.go
sed -i 's|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/scoring"|"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/exam/scoring"|g' apps/backend/internal/grpc/exam_service.go
```

#### Step 1.4.5: Test Exam Service Consolidation
```bash
# Check for circular dependencies
go list -deps ./apps/backend/internal/service/exam/... | grep -E "cycle|circular" || echo "No circular dependencies found"

# Build and test
cd apps/backend && go build ./...
go test ./internal/service/exam/...
go test ./internal/grpc/... -run ".*Exam.*"

# Test scoring functionality
go test ./internal/service/exam/scoring/... -v

# Integration test
echo "Testing exam consolidation..." >> migration-progress.log
```

#### Step 1.4.6: Rollback if Exam Consolidation Fails
```bash
# If any step fails, rollback exam consolidation
if [ $? -ne 0 ]; then
    echo "Exam consolidation failed, rolling back..." >> migration-failure-$(date +%Y%m%d).log
    git checkout HEAD -- apps/backend/internal/service/exam/
    git checkout HEAD -- apps/backend/internal/container/container.go
    git checkout HEAD -- apps/backend/internal/grpc/exam_service.go
    # Restore original structure
    git checkout HEAD -- apps/backend/internal/service/service_mgmt/exam_mgmt/
    git checkout HEAD -- apps/backend/internal/service/domain_service/scoring/
    exit 1
fi
```

### [x] Task 1.5: Consolidate Content Services
**Status**: Completed
**Estimated Time**: 2 hours
**Actual Time**: 1 hour
**Files Affected**: 6 files

#### Step 1.5.1: Move Content Management Files
```bash
# Create content service structure
mkdir -p apps/backend/internal/service/content

# Move contact management
mv apps/backend/internal/service/service_mgmt/contact_mgmt/ apps/backend/internal/service/content/contact/

# Move newsletter management
mv apps/backend/internal/service/service_mgmt/newsletter_mgmt/ apps/backend/internal/service/content/newsletter/

# Move mapcode management
mv apps/backend/internal/service/service_mgmt/mapcode_mgmt/ apps/backend/internal/service/content/mapcode/
```

#### Step 1.5.2: Update Import Statements
**Files to Update**:
- `apps/backend/internal/container/container.go` (lines 76-78)
- `apps/backend/internal/grpc/contact_service.go` (line 8)
- `apps/backend/internal/grpc/newsletter_service.go` (line 8)
- `apps/backend/internal/grpc/mapcode_service.go` (line 8)

#### Step 1.5.3: Test Content Service Consolidation
```bash
cd apps/backend && go build ./...
go test ./internal/service/content/...
```

### [x] Task 1.6: Move Remaining Services
**Status**: Completed
**Estimated Time**: 2 hours
**Actual Time**: 30 minutes
**Files Affected**: 8 files

#### Step 1.6.1: Move Notification Services
```bash
# Move notification service
mv apps/backend/internal/service/domain_service/notification/ apps/backend/internal/service/notification/
```

#### Step 1.6.2: Move User Services
```bash
# Move user management
mv apps/backend/internal/service/service_mgmt/user/ apps/backend/internal/service/user/

# Move session and oauth services
mv apps/backend/internal/service/domain_service/session/ apps/backend/internal/service/user/session/
mv apps/backend/internal/service/domain_service/oauth/ apps/backend/internal/service/user/oauth/
```

#### Step 1.6.3: Move Standalone Services
```bash
# Move analytics, performance, security
mv apps/backend/internal/service/analytics/ apps/backend/internal/service/system/analytics/
mv apps/backend/internal/service/performance/ apps/backend/internal/service/system/performance/
mv apps/backend/internal/service/security/ apps/backend/internal/service/system/security/
mv apps/backend/internal/service/resource_protection.go apps/backend/internal/service/system/resource_protection.go
```

#### Step 1.6.4: Update All Remaining Imports
**Files to Update**: ~20 files in container/, grpc/, and other services

#### Step 1.6.5: Test All Service Moves
```bash
cd apps/backend && go build ./...
go test ./internal/service/...
go test ./internal/grpc/...
```

### [ ] Task 1.7: Remove Old Service Directories
**Estimated Time**: 30 minutes

```bash
# Remove old directories (after confirming all files moved)
rm -rf apps/backend/internal/service/domain_service/
rm -rf apps/backend/internal/service/service_mgmt/
```

### [ ] Task 1.8: Final Backend Testing
**Estimated Time**: 1 hour

```bash
# Full backend build and test
cd apps/backend
go mod tidy
go build ./...
go test ./...

# Integration tests
make test-integration

# Start backend and verify all services work
make dev
```

---

## 🟡 Phase 2: Frontend Type Consolidation

### [ ] Task 2.1: Analyze Type Duplications
**Estimated Time**: 1 hour

```bash
# Find duplicate type files
find apps/frontend/src/types/ -name "*.ts" > frontend-types-1.txt
find apps/frontend/src/lib/types/ -name "*.ts" > frontend-types-2.txt

# Compare for duplicates
comm -12 <(sort frontend-types-1.txt) <(sort frontend-types-2.txt)
```

### [ ] Task 2.2: Consolidate Admin Types
**Estimated Time**: 2 hours
**Files Affected**: ~15 files
**Import Changes**: ~30 import statements

#### Step 2.2.1: Merge Admin Type Files
```bash
# Create consolidated admin types
mkdir -p apps/frontend/src/types/admin/consolidated

# Merge admin types (manual merge required)
# Compare and merge:
# - src/types/admin/ files
# - src/lib/types/admin/ files
```

#### Step 2.2.2: Update Admin Type Imports
**Files to Update**:
- All files in `apps/frontend/src/components/admin/` (~100 files)
- All files in `apps/frontend/src/app/3141592654/` (~20 files)

**Import Changes**:
```typescript
// OLD
import { AdminUser } from '@/types/admin';
import { AdminUser } from '@/lib/types/admin';

// NEW
import { AdminUser } from '@/types/admin';
```

#### Step 2.2.3: Test Admin Type Consolidation
```bash
cd apps/frontend
pnpm typecheck
pnpm test -- --testPathPattern=admin
```

### [ ] Task 2.3: Consolidate User Types
**Estimated Time**: 1 hour
**Files Affected**: ~10 files

#### Step 2.3.1: Merge User Type Files
```bash
# Merge user types
# Compare src/types/user/ with src/lib/types/user/
```

#### Step 2.3.2: Update User Type Imports
**Files to Update**:
- `apps/frontend/src/contexts/auth-context-grpc.tsx`
- `apps/frontend/src/components/auth/` files
- `apps/frontend/src/lib/services/` files

#### Step 2.3.3: Test User Type Consolidation
```bash
cd apps/frontend
pnpm typecheck
pnpm test -- --testPathPattern=auth
```

### [ ] Task 2.4: Consolidate Question Types
**Estimated Time**: 1 hour
**Files Affected**: ~15 files

#### Step 2.4.1: Merge Question Type Files
#### Step 2.4.2: Update Question Type Imports
**Files to Update**:
- All files in `apps/frontend/src/components/admin/questions/` (~50 files)
- All files in `apps/frontend/src/components/questions/` (~10 files)

#### Step 2.4.3: Test Question Type Consolidation
```bash
cd apps/frontend
pnpm typecheck
pnpm test -- --testPathPattern=question
```

### [ ] Task 2.5: Remove Duplicate Type Directories
**Estimated Time**: 30 minutes

```bash
# Remove duplicate type directories
rm -rf apps/frontend/src/lib/types/
```

### [ ] Task 2.6: Final Frontend Testing
**Estimated Time**: 1 hour

```bash
cd apps/frontend
pnpm typecheck
pnpm test
pnpm build
```

---

## 🟢 Phase 3: Service Organization Standardization

### [ ] Task 3.1: Consolidate Frontend Services
**Estimated Time**: 2 hours
**Files Affected**: ~25 files

#### Step 3.1.1: Move All Services to Single Location
```bash
# Move services to standardized location
mkdir -p apps/frontend/src/services/consolidated

# Move from src/lib/services/
mv apps/frontend/src/lib/services/* apps/frontend/src/services/consolidated/

# Move from src/services/ (merge with existing)
# Manual merge required for conflicts
```

#### Step 3.1.2: Update Service Imports
**Files to Update**: ~50 files across components and pages

#### Step 3.1.3: Test Service Consolidation
```bash
cd apps/frontend
pnpm typecheck
pnpm test
```

---

## ✅ Final Verification

### [ ] Task 4.1: Complete Build Test
**Estimated Time**: 30 minutes

```bash
# Full project build
make clean
make build
cd apps/frontend && pnpm build

# Full test suite
make test
cd apps/frontend && pnpm test
```

### [ ] Task 4.2: Integration Testing (Enhanced)
**Estimated Time**: 2 hours

#### Step 4.2.1: gRPC Service Testing
```bash
# Start backend services
make dev &
sleep 10

# Test all gRPC endpoints
grpcurl -plaintext localhost:50051 list > grpc-endpoints-test.txt

# Test auth endpoints
grpcurl -plaintext -d '{"email":"test@example.com","password":"test123"}' localhost:50051 v1.UserService/Login

# Test question endpoints
grpcurl -plaintext -d '{"filters":{}}' localhost:50051 v1.QuestionService/FilterQuestions

# Test exam endpoints
grpcurl -plaintext -d '{}' localhost:50051 v1.ExamService/ListExams
```

#### Step 4.2.2: Frontend Integration Testing
```bash
# Start frontend
cd apps/frontend && pnpm dev &
sleep 15

# Test API integration
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test question API
curl -X POST http://localhost:3000/api/questions/filter \
  -H "Content-Type: application/json" \
  -d '{"filters":{}}'
```

#### Step 4.2.3: End-to-End Testing
```bash
# Test complete user workflow
echo "Testing complete user workflow..." >> migration-progress.log

# 1. User registration/login
# 2. Question browsing
# 3. Exam taking
# 4. Admin operations

# Document any integration issues
if [ $? -ne 0 ]; then
    echo "Integration testing failed" >> migration-failure-$(date +%Y%m%d).log
fi
```

### [ ] Task 4.3: Performance Verification (Enhanced)
**Estimated Time**: 1 hour

#### Step 4.3.1: Build Performance Testing
```bash
# Check build times
echo "=== Build Performance Test ===" > performance-test.log
echo "Backend build time:" >> performance-test.log
time make build 2>&1 | tee -a performance-test.log

echo "Frontend build time:" >> performance-test.log
time pnpm build --prefix apps/frontend 2>&1 | tee -a performance-test.log
```

#### Step 4.3.2: Runtime Performance Testing
```bash
# Test service startup times
echo "=== Service Startup Performance ===" >> performance-test.log
time make dev 2>&1 | tee -a performance-test.log

# Test API response times
echo "=== API Response Times ===" >> performance-test.log
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/v1/health 2>&1 | tee -a performance-test.log
```

#### Step 4.3.3: Bundle Size Analysis
```bash
# Check frontend bundle sizes
cd apps/frontend && pnpm analyze > bundle-analysis.txt

# Compare with baseline if available
if [ -f "baseline-bundle-size.txt" ]; then
    echo "=== Bundle Size Comparison ===" >> performance-test.log
    diff baseline-bundle-size.txt bundle-analysis.txt >> performance-test.log
fi
```

### [ ] Task 4.4: Documentation Updates (Enhanced)
**Estimated Time**: 2 hours

#### Step 4.4.1: Update Architecture Documentation
```bash
# Update AGENT.md files with new structure
cat > apps/backend/AGENT.md << 'EOF'
# Backend - Go gRPC Server Agent Guide (Updated)
*Updated after service consolidation*

## 📋 New Service Organization

**NyNus Backend** now uses feature-based service organization for improved maintainability.

### Consolidated Service Structure
```
apps/backend/internal/service/
├── auth/                  # Authentication & authorization
├── question/              # Question management & validation
├── exam/                  # Exam management & scoring
├── user/                  # User management
├── notification/          # Notification system
├── content/               # Content management
└── system/                # System services (analytics, performance, security)
```

### Key Improvements:
- ✅ Single source of truth for each business domain
- ✅ Eliminated duplicate service layers
- ✅ Clear dependency boundaries
- ✅ Improved code discoverability
EOF

# Update main README.md
sed -i 's/domain_service\/service_mgmt/feature-based service organization/g' README.md
```

#### Step 4.4.2: Update Development Guides
```bash
# Update DEVELOPMENT_SETUP.md
cat >> docs/DEVELOPMENT_SETUP.md << 'EOF'

## Updated Service Architecture (Post-Migration)

### Feature-Based Organization
The backend now uses feature-based service organization:

- **auth/**: All authentication and authorization logic
- **question/**: Question CRUD, validation, and image processing
- **exam/**: Exam management, scoring, and attempts
- **user/**: User management and profiles
- **notification/**: Notification system
- **content/**: Content management (contact, newsletter, mapcode)

### Benefits:
- Faster code navigation
- Reduced coupling between features
- Easier testing and maintenance
- Clear feature boundaries
EOF
```

#### Step 4.4.3: Create Migration Summary Report
```bash
# Create comprehensive migration report
cat > migration-summary-report.md << 'EOF'
# Migration Summary Report
*Generated: $(date)*

## Migration Completed Successfully

### Services Consolidated:
- ✅ Auth services: domain_service/auth + service_mgmt/auth -> service/auth
- ✅ Question services: service_mgmt/question_mgmt + domain_service/validation -> service/question
- ✅ Exam services: service_mgmt/exam_mgmt + domain_service/scoring -> service/exam
- ✅ User services: service_mgmt/user + domain_service/user -> service/user
- ✅ Content services: Multiple mgmt services -> service/content
- ✅ System services: analytics, performance, security -> service/system

### Metrics:
- Files moved: $(find apps/backend/internal/service/ -name "*.go" | wc -l)
- Import statements updated: $(grep -r "internal/service/" apps/backend/ | wc -l)
- Interfaces consolidated: 15+ interfaces merged
- Build time improvement: [To be measured]
- Test coverage maintained: [To be verified]

### Validation Results:
- ✅ All builds successful
- ✅ All tests passing
- ✅ No circular dependencies
- ✅ gRPC endpoints functional
- ✅ Frontend integration working

## Next Steps:
1. Monitor performance in development
2. Update team documentation
3. Train developers on new structure
4. Plan similar frontend reorganization
EOF
```

---

## 📊 Progress Tracking

### Phase 1 Progress: Backend Service Consolidation
- [ ] Task 1.1: Create New Service Structure
- [ ] Task 1.2: Consolidate Auth Services  
- [ ] Task 1.3: Consolidate Question Services
- [ ] Task 1.4: Consolidate Exam Services
- [ ] Task 1.5: Consolidate Content Services
- [ ] Task 1.6: Move Remaining Services
- [ ] Task 1.7: Remove Old Service Directories
- [ ] Task 1.8: Final Backend Testing

### Phase 2 Progress: Frontend Type Consolidation  
- [ ] Task 2.1: Analyze Type Duplications
- [ ] Task 2.2: Consolidate Admin Types
- [ ] Task 2.3: Consolidate User Types
- [ ] Task 2.4: Consolidate Question Types
- [ ] Task 2.5: Remove Duplicate Type Directories
- [ ] Task 2.6: Final Frontend Testing

### Phase 3 Progress: Service Organization
- [ ] Task 3.1: Consolidate Frontend Services

### Final Verification Progress
- [ ] Task 4.1: Complete Build Test
- [ ] Task 4.2: Integration Testing
- [ ] Task 4.3: Performance Verification
- [ ] Task 4.4: Documentation Updates

**Overall Progress**: 0/25 tasks completed (0%)
