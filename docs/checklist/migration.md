# Migration Checklist - Codebase Reorganization
*Generated: 2025-01-19 | Detailed Step-by-Step Migration Plan*

## 📋 Overview

This checklist provides a detailed, step-by-step plan for reorganizing the exam-bank-system codebase. Each task includes specific files to modify, import changes required, and testing steps to verify the changes.

**Total Estimated Time**: 3-4 weeks
**Files Affected**: ~300 files
**Import Changes**: ~200 import statements

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
```

---

## 🔴 Phase 1: Backend Service Layer Consolidation

### [ ] Task 1.1: Create New Service Structure
**Estimated Time**: 2 hours
**Files Created**: 6 directories

```bash
# Create new consolidated service directories
mkdir -p apps/backend/internal/service/auth
mkdir -p apps/backend/internal/service/user
mkdir -p apps/backend/internal/service/question
mkdir -p apps/backend/internal/service/exam
mkdir -p apps/backend/internal/service/content
mkdir -p apps/backend/internal/service/notification
```

**Test After Creation**:
```bash
# Verify directories exist
ls -la apps/backend/internal/service/
```

### [ ] Task 1.2: Consolidate Auth Services
**Estimated Time**: 4 hours
**Files Affected**: 5 files
**Import Changes**: ~15 import statements

#### Step 1.2.1: Move and Merge Auth Files
```bash
# Move domain_service auth files
mv apps/backend/internal/service/domain_service/auth/auth.go apps/backend/internal/service/auth/auth_service.go
mv apps/backend/internal/service/domain_service/auth/jwt_service.go apps/backend/internal/service/auth/
mv apps/backend/internal/service/domain_service/auth/jwt_enhanced_service.go apps/backend/internal/service/auth/

# Move service_mgmt auth files
mv apps/backend/internal/service/service_mgmt/auth/auth_mgmt.go apps/backend/internal/service/auth/auth_management.go
mv apps/backend/internal/service/service_mgmt/auth/interfaces.go apps/backend/internal/service/auth/
```

#### Step 1.2.2: Update Import Statements
**Files to Update**:
- `apps/backend/internal/container/container.go` (lines 17, 22, 80-81)
- `apps/backend/internal/grpc/user_service_enhanced.go` (line 18)
- `apps/backend/internal/grpc/admin_service.go` (line 11)

**Import Changes**:
```go
// OLD
import "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
import auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"

// NEW  
import "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
```

#### Step 1.2.3: Test Auth Service Consolidation
```bash
# Build backend
cd apps/backend && go build ./...

# Run auth-related tests
go test ./internal/service/auth/...

# Test gRPC services that use auth
go test ./internal/grpc/... -run ".*Auth.*"
```

### [ ] Task 1.3: Consolidate Question Services
**Estimated Time**: 3 hours
**Files Affected**: 4 files
**Import Changes**: ~10 import statements

#### Step 1.3.1: Move Question Management Files
```bash
# Move question_mgmt files
mv apps/backend/internal/service/service_mgmt/question_mgmt/question_mgmt.go apps/backend/internal/service/question/question_service.go
mv apps/backend/internal/service/service_mgmt/question_mgmt/bulk_operations.go apps/backend/internal/service/question/
mv apps/backend/internal/service/service_mgmt/question_mgmt/image_processing.go apps/backend/internal/service/question/

# Move validation service
mv apps/backend/internal/service/domain_service/validation/ apps/backend/internal/service/question/validation/
```

#### Step 1.3.2: Update Import Statements
**Files to Update**:
- `apps/backend/internal/container/container.go` (line 73)
- `apps/backend/internal/grpc/question_service.go` (line 11)
- `apps/backend/internal/grpc/question_filter_service.go` (line 10)

**Import Changes**:
```go
// OLD
import question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"

// NEW
import "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/question"
```

#### Step 1.3.3: Test Question Service Consolidation
```bash
# Build and test
cd apps/backend && go build ./...
go test ./internal/service/question/...
go test ./internal/grpc/... -run ".*Question.*"
```

### [ ] Task 1.4: Consolidate Exam Services
**Estimated Time**: 3 hours
**Files Affected**: 5 files
**Import Changes**: ~8 import statements

#### Step 1.4.1: Move Exam Management Files
```bash
# Move exam_mgmt files
mv apps/backend/internal/service/service_mgmt/exam_mgmt/ apps/backend/internal/service/exam/

# Move scoring service
mv apps/backend/internal/service/domain_service/scoring/ apps/backend/internal/service/exam/scoring/
```

#### Step 1.4.2: Update Import Statements
**Files to Update**:
- `apps/backend/internal/container/container.go` (lines 75, 79)
- `apps/backend/internal/grpc/exam_service.go` (lines 10-11)

#### Step 1.4.3: Test Exam Service Consolidation
```bash
cd apps/backend && go build ./...
go test ./internal/service/exam/...
go test ./internal/grpc/... -run ".*Exam.*"
```

### [ ] Task 1.5: Consolidate Content Services
**Estimated Time**: 2 hours
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

### [ ] Task 1.6: Move Remaining Services
**Estimated Time**: 2 hours
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

### [ ] Task 4.2: Integration Testing
**Estimated Time**: 1 hour

```bash
# Start all services
make dev &
cd apps/frontend && pnpm dev &

# Test key functionality
# - User authentication
# - Question management
# - Admin operations
# - gRPC communication
```

### [ ] Task 4.3: Performance Verification
**Estimated Time**: 30 minutes

```bash
# Check build times
time make build
time pnpm build --prefix apps/frontend

# Check bundle sizes
cd apps/frontend && pnpm analyze
```

### [ ] Task 4.4: Documentation Updates
**Estimated Time**: 1 hour

```bash
# Update AGENT.md files with new structure
# Update README.md with new organization
# Update development guides
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
