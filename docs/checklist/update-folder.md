# 📋 Code Quality Update Checklist
*Tracking progress for codebase improvements based on analysis*

## 🎯 Overview
This checklist tracks the implementation of code quality improvements identified in the comprehensive codebase analysis. Items are prioritized by impact and urgency.

## 🔴 Critical Priority (Must Fix)

### File Size Reduction
- [ ] **auth-context-grpc.tsx** (380 lines → split into 3 files)
  - [ ] Extract auth hooks to `auth-hooks.tsx`
  - [ ] Extract auth utilities to `auth-utils.tsx`
  - [ ] Keep core context in `auth-context.tsx`
- [ ] **user_service_enhanced.go** (679 lines → split by functionality)
  - [ ] Extract OAuth methods to separate service
  - [ ] Extract password reset logic
  - [ ] Extract session management logic
- [ ] **exam.store.ts** (Check if >300 lines, split if needed)
- [ ] **question.store.ts** (Check if >300 lines, split if needed)

### Magic Numbers Extraction
- [ ] **Frontend Constants**
  ```typescript
  // Create: src/lib/constants/auth.ts
  export const AUTH_CONSTANTS = {
    REFRESH_INTERVAL: 20 * 60 * 1000, // 20 minutes
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    MAX_LOGIN_ATTEMPTS: 5,
    SESSION_TIMEOUT: 3600
  } as const;
  ```
- [ ] **Backend Constants**
  ```go
  // Create: internal/constant/auth.go
  const (
    DefaultBcryptCost = 12
    SessionTokenLength = 32
    RefreshTokenExpiry = 7 * 24 * time.Hour
  )
  ```
- [ ] **Database Constants**
  - [ ] Extract pagination limits
  - [ ] Extract timeout values
  - [ ] Extract retry counts

### Function Complexity Reduction
- [ ] **Frontend Functions >20 lines**
  - [ ] `login()` in auth-context-grpc.tsx
  - [ ] `register()` in auth-context-grpc.tsx
  - [ ] Complex store actions in Zustand stores
- [ ] **Backend Functions >20 lines**
  - [ ] `Login()` in user_service_enhanced.go
  - [ ] `Register()` in user_service_enhanced.go
  - [ ] Complex repository methods

## 🟡 High Priority (Next Sprint)

### Naming Conventions Standardization
- [ ] **Frontend Files**
  - [ ] Ensure all component files use kebab-case
  - [ ] Ensure all utility files use kebab-case
  - [ ] Check and fix any snake_case usage
- [ ] **Backend Files**
  - [ ] Ensure all Go files use snake_case
  - [ ] Ensure all functions use camelCase
  - [ ] Standardize struct naming
- [ ] **Comments Language**
  - [ ] Technical comments: English
  - [ ] Business logic comments: Vietnamese
  - [ ] User-facing messages: Vietnamese

### Error Handling Improvements
- [ ] **Frontend Error Boundaries**
  - [ ] Add error boundary for auth components
  - [ ] Add error boundary for question components
  - [ ] Add error boundary for exam components
- [ ] **Backend Error Consistency**
  - [ ] Standardize gRPC error codes
  - [ ] Add proper error wrapping
  - [ ] Improve error messages

### Constants Organization
- [ ] **Create Constants Structure**
  ```
  src/lib/constants/
  ├── auth.ts          # Authentication constants
  ├── validation.ts    # Validation rules
  ├── ui.ts           # UI constants
  ├── api.ts          # API endpoints and timeouts
  └── business.ts     # Business logic constants
  ```
- [ ] **Backend Constants**
  ```
  internal/constant/
  ├── auth.go         # Auth constants
  ├── database.go     # DB constants
  ├── grpc.go         # gRPC constants
  └── business.go     # Business constants
  ```

## 🟢 Medium Priority (Future Improvements)

### Testing Coverage
- [ ] **Unit Tests Target: 80%**
  - [ ] Auth services tests
  - [ ] Repository tests
  - [ ] Utility functions tests
  - [ ] Component tests (critical components)
- [ ] **Integration Tests**
  - [ ] gRPC service integration
  - [ ] Database integration
  - [ ] Frontend-backend integration

### Documentation Improvements
- [ ] **JSDoc for Public APIs**
  - [ ] Add JSDoc to all exported functions
  - [ ] Add JSDoc to all React components
  - [ ] Add JSDoc to all custom hooks
- [ ] **Go Documentation**
  - [ ] Add godoc comments to all public functions
  - [ ] Add package documentation
  - [ ] Add example usage

### Performance Optimization
- [ ] **Frontend Performance**
  - [ ] Add React.memo to expensive components
  - [ ] Optimize bundle size with dynamic imports
  - [ ] Add proper loading states
- [ ] **Backend Performance**
  - [ ] Add database query optimization
  - [ ] Add proper caching strategies
  - [ ] Add connection pooling optimization

## 📊 Progress Tracking

### Completion Status
- **Critical Priority**: 0/12 completed (0%)
- **High Priority**: 0/8 completed (0%)
- **Medium Priority**: 0/6 completed (0%)

### Weekly Goals
- **Week 1**: Complete file size reduction (4 items)
- **Week 2**: Complete magic numbers extraction (3 items)
- **Week 3**: Complete function complexity reduction (5 items)
- **Week 4**: Complete naming conventions (3 items)

## 🔧 Implementation Guidelines

### Before Starting Any Task
1. Create a new branch: `feature/code-quality-[task-name]`
2. Run existing tests to ensure baseline
3. Document changes in commit messages
4. Update this checklist when completed

### Testing Requirements
- All changes must pass existing tests
- New code should include appropriate tests
- Run `pnpm lint` and `pnpm type-check` before committing
- Run `make test` for backend changes

### Review Process
- All critical priority changes require code review
- High priority changes should be reviewed
- Medium priority changes can be self-reviewed

## 📝 Notes
- This checklist is based on comprehensive codebase analysis
- Priority levels may be adjusted based on business needs
- Completion dates should be updated as tasks are finished
- Add new items as they are discovered during implementation

---
**Last Updated**: 2025-01-27
**Next Review**: Weekly during implementation phase
