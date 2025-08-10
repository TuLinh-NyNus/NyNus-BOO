# Mockdata Refactoring Checklist
**Date**: January 15, 2025  
**Version**: 1.0.0  
**Methodology**: RIPER-5  
**Status**: PLAN Phase

## 🎯 Mục tiêu tái cấu trúc

### **Vấn đề cần giải quyết:**
- [x] Trùng lặp interface/type definitions (AdminUser, AdminQuestion, etc.)
- [x] Cấu trúc thư mục không tối ưu (32 files → 19 files)
- [x] File index.ts quá dài (443 lines)
- [x] Dependency relationships phức tạp
- [x] Một số file không được sử dụng

### **Kết quả mong đợi:**
- [ ] Giảm 40% số file (32 → 19 files)
- [ ] Loại bỏ hoàn toàn duplicate definitions
- [ ] Cải thiện developer experience
- [ ] Tối ưu bundle size
- [ ] Cấu trúc thư mục logic theo chức năng

## 📋 PHASE 1: PREPARATION (2 hours)

### **1.1 Backup & Safety (30 mins)**
- [ ] Tạo backup branch: `git checkout -b backup/mockdata-before-refactor`
- [ ] Commit current state: `git add . && git commit -m "Backup: Before mockdata refactor"`
- [ ] Tạo working branch: `git checkout -b refactor/mockdata-restructure`
- [ ] Verify current build: `pnpm build`
- [ ] Run tests: `pnpm test`

### **1.2 Dependency Analysis (30 mins)**
- [ ] Tạo dependency map của tất cả imports từ lib/mockdata
- [ ] Xác định files được sử dụng nhiều nhất
- [ ] Liệt kê files có thể xóa an toàn:
  - [ ] `database-types.ts` - không có import
  - [ ] `resource-access.ts` - ít sử dụng
- [ ] Xác định circular dependencies

### **1.3 Type Consolidation Planning (60 mins)**
- [ ] Map duplicate interfaces:
  - [ ] AdminUser (types.ts) vs AdminUser (admin-header.ts)
  - [ ] AdminQuestion vs EnhancedQuestion
  - [ ] AdminCourse vs MockCourse
  - [ ] AdminNotification vs SystemNotification
- [ ] Quyết định interface nào giữ lại
- [ ] Plan merge strategy cho mỗi duplicate

## 📋 PHASE 2: CORE RESTRUCTURE (4 hours)

### **2.1 Create Core Directory (1 hour)**
- [ ] Tạo `lib/mockdata/core/` directory
- [ ] **2.1.1** Tạo `core/types.ts` - Consolidated core types
  - [ ] Merge AdminUser interfaces
  - [ ] Merge Question-related interfaces
  - [ ] Merge Course-related interfaces
  - [ ] Merge Notification interfaces
  - [ ] Add proper JSDoc comments
- [ ] **2.1.2** Tạo `core/constants.ts` - All constants
  - [ ] Move MOCK_DATA_CONSTANTS từ core-types.ts
  - [ ] Add other scattered constants
- [ ] **2.1.3** Tạo `core/utils.ts` - Utility functions
  - [ ] Move MockDataUtils từ utils.ts
  - [ ] Add helper functions

### **2.2 Create Admin Directory (1.5 hours)**
- [ ] Tạo `lib/mockdata/admin/` directory
- [ ] **2.2.1** Tạo `admin/users.ts`
  - [ ] Move content từ users.ts
  - [ ] Move user-related functions từ user-management.ts
  - [ ] Update imports to use core/types.ts
- [ ] **2.2.2** Tạo `admin/dashboard.ts`
  - [ ] Move content từ admin-dashboard.ts
  - [ ] Consolidate dashboard-related data
- [ ] **2.2.3** Tạo `admin/navigation.ts`
  - [ ] Merge admin-sidebar.ts và admin-header.ts
  - [ ] Consolidate navigation data
- [ ] **2.2.4** Tạo `admin/security.ts`
  - [ ] Move content từ security.ts
  - [ ] Move auth-related data từ auth-enhanced.ts
- [ ] **2.2.5** Tạo `admin/roles.ts`
  - [ ] Move content từ admin-roles.ts
  - [ ] Merge role-management.ts if exists

### **2.3 Create Content Directory (1 hour)**
- [ ] Tạo `lib/mockdata/content/` directory
- [ ] **2.3.1** Tạo `content/questions.ts`
  - [ ] Merge questions.ts và questions-enhanced.ts
  - [ ] Consolidate question interfaces
  - [ ] Remove duplicate helper functions
- [ ] **2.3.2** Tạo `content/courses.ts`
  - [ ] Merge courses.ts và course-details.ts
  - [ ] Keep courses-types.ts separate for now
- [ ] **2.3.3** Tạo `content/materials.ts`
  - [ ] Move books.ts content
  - [ ] Move faq.ts content
  - [ ] Move forum.ts content

### **2.4 Create System Directory (30 mins)**
- [ ] Tạo `lib/mockdata/system/` directory
- [ ] **2.4.1** Move analytics.ts → `system/analytics.ts`
- [ ] **2.4.2** Move sessions.ts → `system/sessions.ts`
- [ ] **2.4.3** Move notifications.ts → `system/notifications.ts`
- [ ] **2.4.4** Move settings.ts → `system/settings.ts`

## 📋 PHASE 3: FRONTEND SEPARATION (1.5 hours)

### **3.1 Create Frontend Directory (1 hour)**
- [ ] Tạo `lib/mockdata/frontend/` directory
- [ ] **3.1.1** Tạo `frontend/homepage.ts`
  - [ ] Move homepage.ts content
  - [ ] Move homepage-faq.ts content
- [ ] **3.1.2** Tạo `frontend/courses.ts`
  - [ ] Move courses-frontend.ts content
  - [ ] Move courses-index.ts content
- [ ] **3.1.3** Tạo `frontend/featured.ts`
  - [ ] Move featured-courses.ts content

### **3.2 Keep Shared Types (30 mins)**
- [ ] Keep `courses-types.ts` at root level (shared between admin & frontend)
- [ ] Update imports in courses-types.ts to use core/types.ts

## 📋 PHASE 4: UPDATE IMPORTS (3 hours)

### **4.1 Update Internal Imports (1 hour)**
- [ ] Update imports trong các file mới tạo
- [ ] Ensure all imports point to correct new locations
- [ ] Remove unused imports

### **4.2 Create New Index File (1 hour)**
- [ ] **4.2.1** Tạo `index.ts` mới với structure:
  ```typescript
  // Core exports
  export * from './core/types';
  export * from './core/constants';
  export * from './core/utils';
  
  // Admin exports
  export * from './admin/users';
  export * from './admin/dashboard';
  // ... etc
  ```
- [ ] Ensure backward compatibility
- [ ] Keep default export structure

### **4.3 Update External Imports (1 hour)**
- [ ] Find all files importing from `@/lib/mockdata/*`
- [ ] Update import paths to use new structure
- [ ] Test each updated import

## 📋 PHASE 5: CLEANUP & OPTIMIZATION (2 hours)

### **5.1 Remove Old Files (30 mins)**
- [ ] Delete old files sau khi verify imports work:
  - [ ] `users.ts` (moved to admin/users.ts)
  - [ ] `admin-dashboard.ts` (moved to admin/dashboard.ts)
  - [ ] `admin-sidebar.ts` (merged to admin/navigation.ts)
  - [ ] `admin-header.ts` (merged to admin/navigation.ts)
  - [ ] `questions.ts` (merged to content/questions.ts)
  - [ ] `questions-enhanced.ts` (merged to content/questions.ts)
  - [ ] `courses.ts` (moved to content/courses.ts)
  - [ ] `course-details.ts` (merged to content/courses.ts)
  - [ ] `books.ts` (moved to content/materials.ts)
  - [ ] `faq.ts` (moved to content/materials.ts)
  - [ ] `forum.ts` (moved to content/materials.ts)
  - [ ] `auth-enhanced.ts` (moved to admin/security.ts)
  - [ ] `security.ts` (moved to admin/security.ts)
  - [ ] `admin-roles.ts` (moved to admin/roles.ts)
  - [ ] `analytics.ts` (moved to system/analytics.ts)
  - [ ] `sessions.ts` (moved to system/sessions.ts)
  - [ ] `notifications.ts` (moved to system/notifications.ts)
  - [ ] `settings.ts` (moved to system/settings.ts)
  - [ ] `homepage.ts` (moved to frontend/homepage.ts)
  - [ ] `homepage-faq.ts` (merged to frontend/homepage.ts)
  - [ ] `featured-courses.ts` (moved to frontend/featured.ts)
  - [ ] `courses-frontend.ts` (moved to frontend/courses.ts)
  - [ ] `courses-index.ts` (merged to frontend/courses.ts)

### **5.2 Remove Unused Files (30 mins)**
- [ ] Delete files không được sử dụng:
  - [ ] `database-types.ts` (if confirmed unused)
  - [ ] `resource-access.ts` (if confirmed unused)
  - [ ] `role-management.ts` (if merged to admin/roles.ts)

### **5.3 Optimize Exports (1 hour)**
- [ ] Review và optimize export statements
- [ ] Remove duplicate exports
- [ ] Ensure tree-shaking friendly exports
- [ ] Add proper TypeScript module declarations

## 📋 PHASE 6: TESTING & VALIDATION (2 hours)

### **6.1 Build & Type Check (30 mins)**
- [ ] Run TypeScript check: `pnpm type-check`
- [ ] Fix any TypeScript errors
- [ ] Run build: `pnpm build`
- [ ] Ensure no build errors

### **6.2 Runtime Testing (1 hour)**
- [ ] Test admin pages:
  - [ ] `/3141592654/admin/dashboard` - dashboard data loads
  - [ ] `/3141592654/admin/users` - user data loads
  - [ ] `/3141592654/admin/questions` - question data loads
  - [ ] `/3141592654/admin/analytics` - analytics data loads
- [ ] Test frontend pages:
  - [ ] `/` - homepage data loads
  - [ ] `/courses` - courses data loads
  - [ ] `/courses/[slug]` - course details load
- [ ] Test import statements in browser console

### **6.3 Performance Testing (30 mins)**
- [ ] Check bundle size before/after
- [ ] Verify tree-shaking works correctly
- [ ] Test import performance
- [ ] Check for memory leaks

## 📋 PHASE 7: DOCUMENTATION & REVIEW (1 hour)

### **7.1 Update Documentation (30 mins)**
- [ ] Update README.md if exists
- [ ] Add migration guide for developers
- [ ] Document new structure in comments
- [ ] Update any relevant docs

### **7.2 Code Review Checklist (30 mins)**
- [ ] **Structure Review:**
  - [ ] All files in correct directories
  - [ ] Naming conventions consistent
  - [ ] No circular dependencies
- [ ] **Type Safety Review:**
  - [ ] No `any` types introduced
  - [ ] All interfaces properly exported
  - [ ] Type imports/exports correct
- [ ] **Performance Review:**
  - [ ] No unnecessary re-exports
  - [ ] Tree-shaking friendly
  - [ ] Bundle size optimized
- [ ] **Backward Compatibility:**
  - [ ] All existing imports still work
  - [ ] No breaking changes for consumers
  - [ ] Default exports maintained

## 📋 PHASE 8: FINALIZATION (30 mins)

### **8.1 Final Verification (15 mins)**
- [ ] Run full test suite: `pnpm test`
- [ ] Run linting: `pnpm lint`
- [ ] Check for any console errors
- [ ] Verify all pages load correctly

### **8.2 Git Operations (15 mins)**
- [ ] Stage all changes: `git add .`
- [ ] Commit with descriptive message:
  ```bash
  git commit -m "refactor(mockdata): Restructure mockdata directory

  - Consolidate duplicate interfaces and types
  - Organize files by functionality (admin, content, system, frontend)
  - Reduce file count from 32 to 19 files
  - Improve tree-shaking and bundle size
  - Maintain backward compatibility

  BREAKING CHANGES: None - all imports remain compatible"
  ```
- [ ] Create PR for review

## 📊 Success Metrics

### **Before Refactor:**
- **Files**: 32 files
- **Lines in index.ts**: 443 lines
- **Duplicate interfaces**: 8+ duplicates
- **Bundle size**: [To be measured]

### **After Refactor (Target):**
- **Files**: 19 files (-40%)
- **Lines in index.ts**: <200 lines (-55%)
- **Duplicate interfaces**: 0 duplicates (-100%)
- **Bundle size**: [Expected 10-15% reduction]

## 🚨 Risk Mitigation

### **High Risk Items:**
- [ ] **Import path changes** - Mitigated by maintaining backward compatibility
- [ ] **Type conflicts** - Mitigated by careful interface merging
- [ ] **Runtime errors** - Mitigated by thorough testing

### **Rollback Plan:**
- [ ] Keep backup branch: `backup/mockdata-before-refactor`
- [ ] Document all changes for easy rollback
- [ ] Test rollback procedure before starting

## 📝 Notes & Decisions

### **Key Decisions Made:**
1. **Phương án 1** (functional grouping) chosen over domain grouping
2. **Backward compatibility** maintained - no breaking changes
3. **courses-types.ts** kept separate as shared between admin/frontend
4. **Progressive migration** - can be done in phases if needed

### **Files to Keep Separate:**
- `courses-types.ts` - Shared between admin and frontend
- `mapcode.ts` - Specialized functionality
- `level-progression.ts` - Specialized functionality
- `user-management.ts` - Large file, keep separate for now

### **Future Improvements:**
- [ ] Consider further consolidation of courses-types.ts
- [ ] Evaluate splitting large files if they grow
- [ ] Add automated tests for mockdata integrity
- [ ] Consider generating types from actual API schemas

---

**Total Estimated Time**: 12 hours
**Priority**: High
**Complexity**: Medium
**Risk Level**: Low (with proper testing)
