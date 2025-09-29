# NyNus Codebase Cleanup Checklist
**Dựa trên**: `docs/report/cleanup.md`  
**Tổng công việc**: 3,150+ lines code reduction  
**Thời gian ước tính**: 3 weeks  
**Ngày tạo**: 2025-01-19

---

## 📋 **PHASE 1: CRITICAL CLEANUP** (1-2 days)
**Target**: 1,450+ lines removed

### **1.1 Remove MockData Duplication** ✅ **573 lines**
- [ ] **Step 1**: Backup current files
  ```bash
  cp apps/frontend/src/lib/mockdata/utils.ts apps/frontend/src/lib/mockdata/utils.ts.backup
  cp apps/frontend/src/lib/mockdata/shared/utils.ts apps/frontend/src/lib/mockdata/shared/utils.ts.backup
  ```

- [ ] **Step 2**: Verify files are identical
  ```bash
  diff apps/frontend/src/lib/mockdata/utils.ts apps/frontend/src/lib/mockdata/shared/utils.ts
  # Should show no differences
  ```

- [ ] **Step 3**: Find all imports of shared/utils.ts
  ```bash
  grep -r "from.*shared/utils" apps/frontend/src/
  grep -r "import.*shared/utils" apps/frontend/src/
  ```

- [ ] **Step 4**: Update imports to main utils.ts
  ```typescript
  // Replace all instances of:
  import { ... } from '@/lib/mockdata/shared/utils';
  // With:
  import { ... } from '@/lib/mockdata/utils';
  ```

- [ ] **Step 5**: Delete duplicate file
  ```bash
  rm apps/frontend/src/lib/mockdata/shared/utils.ts
  ```

- [ ] **Step 6**: Verify no broken imports
  ```bash
  cd apps/frontend && pnpm type-check
  cd apps/frontend && pnpm lint
  ```

### **1.2 Centralize Hardcoded URLs** ✅ **85+ lines**
- [ ] **Step 1**: Create centralized config file
  ```bash
  touch apps/frontend/src/lib/config/endpoints.ts
  ```

- [ ] **Step 2**: Define URL constants
  ```typescript
  // apps/frontend/src/lib/config/endpoints.ts
  export const API_ENDPOINTS = {
    GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  } as const;
  ```

- [ ] **Step 3**: Find all hardcoded URLs
  ```bash
  grep -r "http://localhost:8080" apps/frontend/src/
  grep -r "localhost:8080" apps/frontend/src/
  ```

- [ ] **Step 4**: Replace hardcoded URLs in these files:
  - [ ] `apps/frontend/src/services/grpc/client.ts:8`
  - [ ] `apps/frontend/src/services/grpc/admin.service.ts:27`
  - [ ] `apps/frontend/src/services/grpc/contact.service.ts:23`
  - [ ] `apps/frontend/src/services/grpc/auth.service.ts:34`
  - [ ] `apps/frontend/src/lib/performance/production-config.ts:109`

- [ ] **Step 5**: Update imports in affected files
  ```typescript
  import { API_ENDPOINTS } from '@/lib/config/endpoints';
  // Replace: 'http://localhost:8080'
  // With: API_ENDPOINTS.GRPC_URL
  ```

- [ ] **Step 6**: Verify all services work
  ```bash
  cd apps/frontend && pnpm type-check
  cd apps/frontend && pnpm build
  ```

### **1.3 Consolidate Store Patterns** ✅ **132 lines**
- [ ] **Step 1**: Create shared store utilities
  ```bash
  touch apps/frontend/src/lib/stores/shared/store-patterns.ts
  ```

- [ ] **Step 2**: Extract common patterns
  ```typescript
  // SelectionState pattern (44 lines)
  export interface SelectionState<T> {
    selectedItems: T[];
    selectAll: boolean;
    // ... rest of pattern
  }
  
  // CacheEntry pattern (44 lines)
  export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    // ... rest of pattern
  }
  
  // Pagination pattern (44 lines)
  export interface PaginationState {
    currentPage: number;
    pageSize: number;
    // ... rest of pattern
  }
  ```

- [ ] **Step 3**: Update store files to use shared patterns:
  - [ ] `apps/frontend/src/lib/stores/exam.store.ts`
  - [ ] `apps/frontend/src/lib/stores/question.store.ts`
  - [ ] `apps/frontend/src/lib/stores/exam-attempt.store.ts`

- [ ] **Step 4**: Remove duplicate pattern definitions
- [ ] **Step 5**: Verify stores still work
  ```bash
  cd apps/frontend && pnpm type-check
  cd apps/frontend && pnpm test -- --testPathPattern=stores
  ```

### **1.4 Remove Script Duplication** ✅ **300+ lines**
- [ ] **Step 1**: Compare script files
  ```bash
  # Compare PowerShell vs Bash versions
  wc -l apps/backend/scripts/run-tests.ps1  # 355 lines
  wc -l apps/backend/scripts/run-tests.sh   # 211 lines
  ```

- [ ] **Step 2**: Choose primary script (recommend: Bash for cross-platform)
- [ ] **Step 3**: Update documentation to reference chosen script
- [ ] **Step 4**: Remove duplicate script
  ```bash
  # If keeping Bash version:
  rm apps/backend/scripts/run-tests.ps1
  # Or if keeping PowerShell:
  rm apps/backend/scripts/run-tests.sh
  ```

- [ ] **Step 5**: Update Makefile references
  ```bash
  grep -r "run-tests" Makefile
  # Update any references to removed script
  ```

### **1.5 Clean Dead Code** ✅ **160+ lines**
- [ ] **Step 1**: Remove commented dynamic imports
  ```typescript
  // File: apps/frontend/src/components/dynamic-imports.tsx
  // Remove lines 47-57 (commented MathRenderer and AdminDashboard)
  ```

- [ ] **Step 2**: Remove unused preload functions
  ```typescript
  // File: apps/frontend/src/lib/performance/lazy-components.tsx
  // Remove lines 382-385 (commented preload functions)
  ```

- [ ] **Step 3**: Remove unused skeleton components
  ```typescript
  // File: apps/frontend/src/components/ui/skeleton.tsx
  // Remove DashboardCardSkeleton if not used (lines 23-35)
  ```

- [ ] **Step 4**: Remove ESLint temporary rules
  ```javascript
  // File: apps/frontend/eslint.config.mjs
  // Make temporary rules permanent or remove (lines 40-44)
  ```

- [ ] **Step 5**: Verify no broken references
  ```bash
  cd apps/frontend && pnpm type-check
  cd apps/frontend && pnpm lint
  ```

### **1.6 Fix Environment Variables** ✅ **200+ lines**
- [ ] **Step 1**: Consolidate .env files
  ```bash
  # Compare environment files
  diff .env.example apps/backend/.env.example
  ```

- [ ] **Step 2**: Create master .env.example
  ```bash
  # Merge all environment variables into single .env.example
  # Remove duplicate apps/backend/.env.example
  ```

- [ ] **Step 3**: Update Docker configurations
  - [ ] `docker/compose/docker-compose.yml`
  - [ ] `docker/compose/docker-compose.prod.yml`
  - [ ] `scripts/docker/setup-docker.ps1`

- [ ] **Step 4**: Use consistent environment variable names
- [ ] **Step 5**: Test Docker builds
  ```bash
  docker-compose -f docker/compose/docker-compose.yml config
  ```

---

## ✅ **PHASE 1 VERIFICATION CHECKLIST**

### **Build & Type Checking**
- [ ] `cd apps/frontend && pnpm type-check` - No TypeScript errors
- [ ] `cd apps/frontend && pnpm lint` - No linting errors
- [ ] `cd apps/frontend && pnpm build` - Build succeeds
- [ ] `cd apps/backend && make lint` - Backend linting passes

### **Import Verification**
- [ ] Search for broken imports: `grep -r "shared/utils" apps/frontend/src/`
- [ ] Search for hardcoded URLs: `grep -r "localhost:8080" apps/frontend/src/`
- [ ] Verify no unused imports: `cd apps/frontend && pnpm lint:unused-imports`

### **Functionality Testing**
- [ ] Frontend starts: `cd apps/frontend && pnpm dev`
- [ ] Backend starts: `cd apps/backend && make dev`
- [ ] gRPC services respond: Test auth, admin, contact services
- [ ] Store functionality works: Test exam, question, attempt stores

### **Docker Testing**
- [ ] Docker compose validates: `docker-compose config`
- [ ] Environment variables load correctly
- [ ] Services start in Docker environment

---

## 📋 **PHASE 2: HIGH PRIORITY** (Week 1)
**Target**: 725+ lines removed

### **2.1 Centralize Magic Numbers** ✅ **150+ lines**
- [ ] **Step 1**: Create constants file
  ```bash
  touch apps/frontend/src/lib/constants/timeouts.ts
  ```

- [ ] **Step 2**: Define timeout constants
  ```typescript
  export const TIMEOUTS = {
    DEBOUNCE_MS: 300,
    API_TIMEOUT_MS: 5000,
    LONG_TIMEOUT_MS: 30000,
    VALIDATION_TIMEOUT_MS: 5000,
    SEARCH_TIMEOUT_MS: 5000,
  } as const;

  export const LIMITS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MAX_FILE_SIZE_MB: 10,
    MAX_UPLOAD_SIZE_MB: 50,
  } as const;
  ```

- [ ] **Step 3**: Find and replace magic numbers in:
  - [ ] `apps/frontend/src/types/forms/index.ts:253`
  - [ ] `apps/frontend/src/hooks/public/index.ts:306`
  - [ ] `apps/frontend/src/lib/search/index.ts:191`
  - [ ] `apps/frontend/src/types/admin/index.ts:187`
  - [ ] `apps/frontend/src/lib/mockdata/core-types.ts:420`

- [ ] **Step 4**: Update imports
  ```typescript
  import { TIMEOUTS, LIMITS } from '@/lib/constants/timeouts';
  // Replace: 300, 5000, etc.
  // With: TIMEOUTS.DEBOUNCE_MS, TIMEOUTS.API_TIMEOUT_MS
  ```

### **2.2 Fix Port Hardcoding** ✅ **30+ lines**
- [ ] **Step 1**: Update Docker configurations to use env vars
  ```yaml
  # docker/compose/docker-compose.yml
  ports:
    - "${FRONTEND_PORT:-3000}:3000"
    - "${BACKEND_HTTP_PORT:-8080}:8080"
    - "${BACKEND_GRPC_PORT:-50051}:50051"
  ```

- [ ] **Step 2**: Add port variables to .env.example
  ```bash
  FRONTEND_PORT=3000
  BACKEND_HTTP_PORT=8080
  BACKEND_GRPC_PORT=50051
  DB_PORT=5432
  ```

### **2.3 Merge Context Providers** ✅ **150+ lines**
- [ ] **Step 1**: Compare auth context files
  ```bash
  wc -l apps/frontend/src/contexts/auth-context-grpc.tsx      # 358 lines
  wc -l apps/frontend/src/contexts/auth-context-optimized.tsx # 200+ lines
  ```

- [ ] **Step 2**: Identify best features from each version
- [ ] **Step 3**: Merge into single auth context
- [ ] **Step 4**: Update all imports to use merged version
- [ ] **Step 5**: Remove duplicate context file

### **2.4 Unify Validation Schemas** ✅ **200+ lines**
- [ ] **Step 1**: Create shared validation library
  ```bash
  mkdir -p apps/frontend/src/lib/validation/shared
  touch apps/frontend/src/lib/validation/shared/common-schemas.ts
  ```

- [ ] **Step 2**: Extract common validation patterns from:
  - [ ] `apps/frontend/src/lib/validation/auth-schemas.ts`
  - [ ] `apps/frontend/src/lib/validation/question-schemas.ts`
  - [ ] `apps/frontend/src/lib/validation/file-upload-schemas.ts`

- [ ] **Step 3**: Create shared validation utilities
- [ ] **Step 4**: Update schema files to use shared patterns
- [ ] **Step 5**: Remove duplicate validation logic

### **2.5 Clean TODO Comments** ✅ **45+ lines**
- [ ] **Step 1**: List all TODO comments
  ```bash
  grep -r "TODO" apps/frontend/src/ | grep -v node_modules
  grep -r "FIXME" apps/frontend/src/ | grep -v node_modules
  ```

- [ ] **Step 2**: Categorize TODOs:
  - [ ] **Remove**: TODOs for non-existent components
  - [ ] **Implement**: Critical TODOs for production
  - [ ] **Document**: TODOs that need tracking

- [ ] **Step 3**: Remove component creation TODOs:
  ```typescript
  // Remove from lazy-components.tsx:
  // TODO: Enable when components are created
  // userManagement: () => import('@/components/admin/user-management').catch(() => null),
  ```

### **2.6 Consolidate Docker Configs** ✅ **100+ lines**
- [ ] **Step 1**: Use Docker Compose override pattern
  ```bash
  # Keep docker-compose.yml as base
  # Create docker-compose.override.yml for development
  # Keep docker-compose.prod.yml for production
  ```

- [ ] **Step 2**: Remove duplicate service definitions
- [ ] **Step 3**: Use environment variable substitution
- [ ] **Step 4**: Test all Docker configurations

### **2.7 Optimize Test Configs** ✅ **50+ lines**
- [ ] **Step 1**: Use Jest projects configuration
  ```javascript
  // jest.config.js
  module.exports = {
    projects: [
      {
        displayName: 'unit',
        testMatch: ['<rootDir>/src/tests/unit/**/*.test.{js,ts,tsx}'],
        // unit test specific config
      },
      {
        displayName: 'integration',
        testMatch: ['<rootDir>/src/tests/integration/**/*.test.{js,ts,tsx}'],
        // integration test specific config
      }
    ]
  };
  ```

- [ ] **Step 2**: Remove duplicate jest.integration.config.js
- [ ] **Step 3**: Update package.json test scripts

---

## 📋 **PHASE 3: MEDIUM PRIORITY** (Week 2-3)
**Target**: 715+ lines removed

### **3.1 Standardize File Naming** ✅ **65+ lines**
- [ ] **Step 1**: Audit file naming inconsistencies
  ```bash
  find apps/frontend -name "*.mjs" -o -name "*.js" -o -name "*.ts" | grep -E "(config|script)"
  ```

- [ ] **Step 2**: Standardize config file extensions
  - [ ] Convert `.mjs` to `.js` where appropriate
  - [ ] Ensure consistent naming convention

- [ ] **Step 3**: Update import statements after renaming

### **3.2 Fix Component Naming** ✅ **200+ lines**
- [ ] **Step 1**: Establish naming convention
  ```bash
  # Components: PascalCase.tsx
  # Hooks: use-kebab-case.ts
  # Utils: kebab-case.ts
  # Types: kebab-case.types.ts
  ```

- [ ] **Step 2**: Rename inconsistent files
- [ ] **Step 3**: Update all imports after renaming
- [ ] **Step 4**: Update documentation

### **3.3 Optimize Imports** ✅ **150+ lines**
- [ ] **Step 1**: Find unused imports
  ```bash
  cd apps/frontend && pnpm lint:unused-imports
  ```

- [ ] **Step 2**: Remove unused imports automatically
- [ ] **Step 3**: Organize import statements consistently

---

## ✅ **FINAL VERIFICATION CHECKLIST**

### **Complete Build Testing**
- [ ] `cd apps/frontend && pnpm clean && pnpm install`
- [ ] `cd apps/frontend && pnpm type-check`
- [ ] `cd apps/frontend && pnpm lint`
- [ ] `cd apps/frontend && pnpm build`
- [ ] `cd apps/frontend && pnpm test`

### **Backend Integration**
- [ ] `cd apps/backend && make clean && make deps`
- [ ] `cd apps/backend && make lint`
- [ ] `cd apps/backend && make test`
- [ ] `cd apps/backend && make build`

### **Docker Environment**
- [ ] `docker-compose -f docker/compose/docker-compose.yml up --build`
- [ ] All services start successfully
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8080
- [ ] gRPC services respond correctly

### **Production Readiness**
- [ ] Environment variables properly configured
- [ ] No hardcoded values in production build
- [ ] All TODO comments resolved or documented
- [ ] Documentation updated
- [ ] Team review completed

---

**Final Status**: ⏳ Ready to Start
**Total Lines to Remove**: 3,150+
**Estimated Total Time**: 3 weeks
**Risk Level**: Low-Medium
**Success Criteria**: All tests pass, no broken functionality, cleaner codebase
