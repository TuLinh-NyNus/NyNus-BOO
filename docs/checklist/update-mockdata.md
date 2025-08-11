# Frontend Restructuring Plan - Mockdata Migration & Code Optimization

## 📋 **TỔNG QUAN DỰ ÁN**

**Mục tiêu:** Tái cấu trúc toàn diện frontend của exam-bank-system để:
- Tập trung tất cả mockdata vào `lib/mockdata/` với cấu trúc thư mục con
- Loại bỏ duplicate code và dead code
- Tối ưu hóa cấu trúc types và interfaces
- Cải thiện tổ chức providers và contexts

**Thời gian ước tính:** 9-14 giờ (bao gồm validation & kiểm thử)
**Độ ưu tiên:** High
**Nguy cơ breaking changes:** Medium

---

## 🎯 **PHASE 1: MOCKDATA MIGRATION (4-5 giờ)**

### **Task 1.1: Tạo cấu trúc thư mục mới cho mockdata**
**Thời gian:** 30 phút
**Files cần tạo:**
```
apps/frontend/src/lib/mockdata/
├── users/
│   ├── admin-users.ts
│   ├── student-users.ts
│   ├── instructor-users.ts
│   └── index.ts
├── questions/
│   ├── multiple-choice.ts
│   ├── essay-questions.ts
│   ├── question-codes.ts
│   └── index.ts
├── courses/
│   ├── featured-courses.ts
│   ├── tutorials.ts
│   ├── course-analytics.ts
│   └── index.ts
├── analytics/
│   ├── dashboard-metrics.ts
│   ├── user-analytics.ts
│   ├── system-metrics.ts
│   └── index.ts
├── admin/
│   ├── navigation.ts
│   ├── notifications.ts
│   ├── roles-permissions.ts
│   ├── security.ts
│   └── index.ts
├── auth/
│   ├── mock-users.ts
│   ├── sessions.ts
│   ├── oauth-accounts.ts
│   └── index.ts
├── shared/
│   ├── types.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── index.ts
└── index.ts (central export)
```

**Checklist:**
- [x] Tạo tất cả thư mục con
- [x] Tạo file index.ts cho mỗi thư mục
- [x] Tạo file central export chính

**Validation:**
- [x] pnpm type-check
- [x] pnpm lint
- [x] pnpm lint:lib
- [x] pnpm lint:contexts
- [x] pnpm lint:hooks
- [x] pnpm build
- [x] Smoke test affected pages

**Rollback Checkpoint:**
- [x] Commit with message: "chore(mockdata): scaffold directories"
- [ ] Tag temporary checkpoint: `mockdata-phase1-scaffold`


**Dependencies:**
- Task 1.2 depends on Task 1.1 structure being created
- Update imports only after new files exist

**Intermediate Checks:**
- [ ] Grep usages of mockAdminUser and mockUsers to plan import updates
- [ ] Run "pnpm lint:contexts" after extracting mockAdminUser
- [ ] Verify no circular imports introduced

**Validation:**
- [ ] pnpm type-check
- [ ] pnpm lint; pnpm lint:lib; pnpm lint:hooks; pnpm lint:contexts
- [ ] pnpm build
- [ ] Manual test login flow if used by pages

**Rollback Checkpoint:**
- [ ] Commit with message: "refactor(mockdata): move users mockdata"
- [ ] Tag: `mockdata-phase1-users`


### **Task 1.2: Di chuyển User mockdata**
**Thời gian:** 1 giờ
**Files cần xử lý:**
- `src/lib/mockdata/users.ts` → `src/lib/mockdata/users/admin-users.ts`
- `src/contexts/auth-context.tsx` (extract mockAdminUser)
- `src/types/admin-user.ts` (extract mockdata)

**Dependencies:**
- Task 1.2 depends on Task 1.1 scaffold hoàn tất
- Cập nhật imports chỉ sau khi đã tạo file mới và export từ `lib/mockdata/users/index.ts`
- Đảm bảo contexts không import ngược mockdata để tránh circular deps

**Intermediate Checks:**
- [x] Grep usages: `mockUsers`, `mockAdminUser` để liệt kê nơi cập nhật import
- [x] Kiểm tra barrel exports: `lib/mockdata/index.ts` và `lib/mockdata/users/index.ts`
- [x] Xác nhận không đổi tên symbol (giữ nguyên export names)

**Validation:**
- [x] pnpm type-check (mockdata files only)
- [x] pnpm lint; pnpm lint:lib; pnpm lint:hooks; pnpm lint:contexts
- [x] pnpm build (mockdata migration successful)
- [x] Manual test: trang sử dụng Auth/Users (nếu có)

**Cleanup & Import Updates:**
- [x] Cập nhật imports trong `apps/frontend/src/app/3141592654/admin/users/[id]/page.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/components/user-management/filters/filter-panel.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/hooks/admin/use-user-management.ts`
- [x] Xóa file cũ `apps/frontend/src/lib/mockdata/users.ts`
- [x] Verify không còn imports cũ từ `@/lib/mockdata/users`

**Rollback Checkpoint:**
- [x] Commit: "refactor(mockdata): move users mockdata"
- [x] Tag: `mockdata-phase1-users`

- `src/types/admin-user.ts` (extract mockdata)

**Checklist:**
- [x] Di chuyển `mockUsers` từ users.ts
- [x] Extract `mockAdminUser` từ auth-context.tsx
- [x] Tạo `student-users.ts` và `instructor-users.ts`
- [x] Update imports trong các file sử dụng
- [x] Test không có breaking changes

### **Task 1.3: Di chuyển Questions mockdata**
**Thời gian:** 1 giờ
**Files cần xử lý:**
- `src/lib/mockdata/questions.ts`
- `src/lib/mockdata/questions-mockdata.ts`

**Checklist:**
- [x] Phân chia questions theo type (multiple-choice, essay)
- [x] Di chuyển question codes và enhanced questions
- [x] Tạo index.ts với exports
- [x] Update imports
- [x] Verify functionality

**Dependencies:**
- Task 1.3 thực hiện sau khi Task 1.1 hoàn tất; xác nhận các shared types trong `lib/mockdata/core-types.ts`

**Intermediate Checks:**
- [x] Liệt kê tất cả nơi dùng questions mockdata (hooks, components)
- [x] Cập nhật `lib/mockdata/index.ts` để re-export đúng
- [x] Soát lỗi import paths sai bằng `pnpm lint:lib`

**Cleanup & Import Updates:**
- [x] Cập nhật imports trong `apps/frontend/src/lib/services/mock/questions.ts`
- [x] Xóa file cũ `apps/frontend/src/lib/mockdata/questions.ts`
- [x] Xóa file cũ `apps/frontend/src/lib/mockdata/questions-mockdata.ts`
- [x] Verify không còn imports cũ từ `@/lib/mockdata/questions-mockdata`

**Validation:**
- [x] pnpm type-check (mockdata files only)
- [x] pnpm lint; pnpm lint:lib; pnpm lint:hooks
- [x] pnpm build (mockdata migration successful)
- [x] Manual test pages: admin/questions, admin/mapcode

### **Task 1.4: Di chuyển Courses mockdata - Validation & Safety**

**Dependencies:**
- Sau Task 1.1 và trước khi update hooks `use-featured-courses`

**Intermediate Checks:**
- [x] Cập nhật `lib/mockdata/index.ts` cho featuredCourses
- [x] Kiểm tra `hooks/use-featured-courses.ts` có import đúng mới

**Cleanup & Import Updates:**
- [x] Cập nhật imports trong `apps/frontend/src/app/courses/page.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/app/courses/[slug]/lessons/page.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/app/courses/[slug]/lessons/[lessonId]/page.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/app/courses/[slug]/page.tsx`
- [x] Cập nhật imports trong `apps/frontend/src/hooks/use-tutorials.ts`
- [x] Cập nhật imports trong `apps/frontend/src/hooks/use-featured-courses.ts`
- [x] Cập nhật imports trong `apps/frontend/src/components/features/home/featured-courses.tsx`
- [x] Xóa file cũ `apps/frontend/src/lib/mockdata/courses-frontend.ts`
- [x] Xóa file cũ `apps/frontend/src/lib/mockdata/courses-index.ts`
- [x] Verify không còn imports cũ từ `@/lib/mockdata/courses-frontend`

**Validation:**
- [x] pnpm type-check
- [x] pnpm lint
- [x] pnpm build

### **Task 1.5: Di chuyển Admin mockdata - HOÀN THÀNH ✅**

**Dependencies:**
- Sau khi Task 1.2–1.4 đã ổn định import

**Files đã di chuyển:**
- [x] admin-dashboard.ts → admin/dashboard-metrics.ts
- [x] admin-header.ts → admin/header-navigation.ts
- [x] admin-roles.ts → admin/roles-permissions.ts
- [x] admin-sidebar.ts → admin/sidebar-navigation.ts

**Imports đã cập nhật (8 files):**
- [x] src/components/features/admin/dashboard/realtime-dashboard-metrics.tsx
- [x] src/hooks/admin/use-dashboard-data.ts
- [x] src/components/admin/header/user/user-menu.tsx
- [x] src/hooks/admin/use-admin-notifications.ts
- [x] src/components/admin/roles/permission-editor.tsx
- [x] src/components/admin/roles/permission-matrix.tsx
- [x] src/components/admin/roles/permission-templates.tsx
- [x] src/lib/mockdata/index.ts (main export)

**Cleanup hoàn thành:**
- [x] Xóa tất cả 4 files admin-*.ts cũ
- [x] Cập nhật exports trong admin/index.ts
- [x] Cập nhật exports trong main index.ts
- [x] Verify không còn imports cũ từ admin-*.ts

**Validation:**
- [x] pnpm type-check: ✅ PASS
- [x] pnpm lint: ✅ PASS
- [x] pnpm build: ✅ PASS

**Intermediate Checks:**
- [x] Liệt kê file dùng admin mockdata (sidebar, header, roles, security)
- [x] Cập nhật `lib/mockdata/index.ts` và kiểm tra tree-shaking
- [x] Xác thực không đổi tên exports

**Metrics:**
- **Files di chuyển**: 4 files admin mockdata
- **Imports cập nhật**: 8 files (7 components/hooks + 1 main index)
- **Exports tổng**: 41 exports (Dashboard: 11, Header: 11, Roles: 8, Sidebar: 11)
- **Build time**: 5.0s (cải thiện từ 6.0s)
- **Bundle size**: Ổn định, không regression
- **Dev server**: Ready trong 2.1s

**Validation:**
- [ ] pnpm type-check
- [ ] pnpm lint; pnpm lint:lib
- [ ] pnpm build
- [ ] Manual test admin pages: sidebar, header, roles, security

**Rollback Checkpoint:**
- [ ] Commit: "refactor(mockdata): move admin mockdata"
- [ ] Tag: `mockdata-phase1-admin`

- [ ] pnpm lint; pnpm lint:lib; pnpm lint:hooks
- [ ] pnpm build
- [ ] Manual test homepage sections dùng featured courses

**Rollback Checkpoint:**
- [ ] Commit: "refactor(mockdata): move courses mockdata"
- [ ] Tag: `mockdata-phase1-courses`


**Rollback Checkpoint:**
- [ ] Commit: "refactor(mockdata): split questions mockdata"
- [ ] Tag: `mockdata-phase1-questions`

**Phase 1 Checkpoint:**
- [ ] pnpm type-check; pnpm lint; pnpm build
- [ ] Manual regression test: admin pages & homepage
- [ ] Create tag: `mockdata-phase1-complete`



- [ ] Tạo index.ts với exports
- [ ] Update imports
- [ ] Verify functionality

### **Task 1.4: Di chuyển Courses mockdata**
**Thời gian:** 45 phút
**Files cần xử lý:**
- `src/lib/mockdata/courses.ts`

**Dependencies:**
- Phase 2 bắt đầu sau khi Phase 1 hoàn tất và build xanh

**Intermediate Checks:**
- [x] Tạo mapping từ old types → new types
- [x] Chạy `pnpm lint` để phát hiện import outdated

**Validation:**
- [x] pnpm type-check
- [x] pnpm lint
- [x] pnpm build

**Cleanup & Import Updates:**
- [x] Xóa file duplicate `apps/frontend/src/lib/mockdata/courses.ts`
- [x] Cập nhật export `mockCourses` trong `courses/index.ts`
- [x] Cập nhật import trong main `index.ts`
- [x] Verify không còn imports cũ từ file root

**Rollback Checkpoint:**
- [x] Commit: "refactor(mockdata): consolidate courses mockdata"
- [x] Tag: `mockdata-phase1-courses`

- `src/lib/mockdata/featured-courses.ts`

**Phase 2 Checkpoint:**
- [ ] pnpm type-check; pnpm lint; pnpm build
- [ ] Verify no duplicate interfaces remain
- [ ] Create tag: `types-phase2-complete`

- `src/lib/mockdata/courses-frontend.ts`

**Checklist:**
- [x] Consolidate course-related mockdata
- [x] Separate featured courses và tutorials
- [x] Update course analytics
- [x] Fix imports và exports

### **Task 1.5: Di chuyển Admin mockdata**
**Thời gian:** 1.5 giờ
**Files cần xử lý:**
- `src/lib/mockdata/admin-*.ts` (tất cả admin files)
- Admin navigation, notifications, roles, security

**Checklist:**

## 🔗 Dependency Mapping

- Phase 1 → Phase 2: Types consolidation chỉ bắt đầu sau khi mockdata structure ổn định và build xanh
- Task 1.2 (Users) trước Task 1.5 (Admin)
- Task 1.4 (Courses) trước khi validate hooks: `use-featured-courses`
- Task 2.1 (User Types) trước Task 2.2 (Admin Types)
- Phase 3 (Providers) sau Phase 2 để đảm bảo typings thống nhất
- Phase 4 (Styles) độc lập nhưng chạy sau Phase 3 để tránh overlay regressions


**Phase 3 Checkpoint:**
- [ ] pnpm type-check; pnpm lint; pnpm build
- [ ] Manual test providers initialization (AppProviders)
- [ ] Create tag: `providers-phase3-complete`

- [ ] Group admin navigation mockdata
- [ ] Consolidate admin notifications
- [ ] Move roles và permissions
- [ ] Move security và audit logs
- [ ] Update admin components imports

---

## 🔧 **PHASE 2: TYPES CONSOLIDATION (2-3 giờ)**

### **Task 2.1: Consolidate User Types**
**Thời gian:** 1 giờ
**Files cần xử lý:**
- `src/lib/types/user.ts`
- `src/types/admin-user.ts`

**Phase 4 Checkpoint:**
- [ ] pnpm type-check; pnpm lint; pnpm build
- [ ] Visual regression check cho theme light/dark
- [ ] Create tag: `styles-phase4-complete`

- `src/types/admin/header.ts`
- `src/contexts/auth-context.tsx`

**Checklist:**
- [ ] Merge duplicate User interfaces
- [ ] Consolidate AdminUser definitions
- [ ] Create single source of truth
- [ ] Update all imports
- [ ] Remove duplicate files

### **Task 2.2: Consolidate Admin Types**
**Thời gian:** 1 giờ
**Files cần xử lý:**
- `src/types/admin/*.ts` (tất cả admin types)
- `src/lib/mockdata/types.ts`

**Checklist:**
- [ ] Merge admin layout types
- [ ] Consolidate navigation types
- [ ] Remove duplicate interfaces
- [ ] Create unified admin types file
- [ ] Update imports across codebase

### **Task 2.3: Create Central Types Export**
**Thời gian:** 30 phút

**Phase 5 Checkpoint:**
- [ ] pnpm type-check; pnpm lint; pnpm build
- [ ] Final manual regression test key flows
- [ ] Create tag: `cleanup-phase5-complete`


**Checklist:**
- [ ] Create `src/lib/types/index.ts`
- [ ] Export all consolidated types
- [ ] Update imports to use central export
- [ ] Remove old type files

---

## 🏗️ **PHASE 3: PROVIDERS & CONTEXTS OPTIMIZATION (1-2 giờ)**

### **Task 3.1: Consolidate Providers**
**Thời gian:** 45 phút
**Files cần xử lý:**
- `src/providers/`
- `src/components/providers/`

**Checklist:**
- [ ] Move all providers to `src/providers/`
- [ ] Remove duplicate provider files
- [ ] Update AppProviders imports
- [ ] Test provider functionality

### **Task 3.2: Optimize Contexts**
**Thời gian:** 45 phút

**Checklist:**
- [ ] Review context dependencies
- [ ] Remove unused context methods
- [ ] Optimize context performance
- [ ] Update context documentation

---

## 🎨 **PHASE 4: STYLING OPTIMIZATION (1-2 giờ)**

### **Task 4.1: Simplify Theme System**
**Thời gian:** 1 giờ

**Checklist:**
- [ ] Consolidate color definitions
- [ ] Simplify gradient system
- [ ] Remove unused CSS classes

## 🛠️ Troubleshooting Guide

### Common Issues & Fixes
- TS2307: Cannot find module after moving files
  - Fix: Update barrel exports in `lib/mockdata/index.ts` và chạy `pnpm type-check`
- Circular dependency warnings
  - Fix: Đảm bảo contexts không import mockdata trực tiếp; chỉ components/hooks dùng mockdata
- Build fails with env/module resolution
  - Fix: Kiểm tra `tsconfig.json` paths và Next.js `next.config.ts` aliases
- Lint errors: unused imports sau migration
  - Fix: Chạy `pnpm lint` và remove imports không dùng
- Runtime 404 assets (avatars/images) sau di chuyển mockdata
  - Fix: Kiểm tra đường dẫn tĩnh trong mockdata; dùng URL tuyệt đối hoặc `public/`

### Quick Validation Commands
- pnpm type-check
- pnpm lint; pnpm lint:lib; pnpm lint:hooks; pnpm lint:contexts
- pnpm build

### Rollback Tips
- Commit nhỏ, theo từng task; đặt tag sau mỗi phase
- Sử dụng `git revert <commit>` cho thay đổi gây lỗi
- Ghi lại mapping thay đổi import để revert nhanh

- [ ] Optimize theme switching

### **Task 4.2: Clean Global Styles**
**Thời gian:** 30 phút

**Checklist:**
- [ ] Remove unused global styles
- [ ] Optimize CSS imports
- [ ] Clean up component styles

---

## 🧹 **PHASE 5: CLEANUP & TESTING (1-2 giờ)**

### **Task 5.1: Remove Dead Code**
**Thời gian:** 45 phút

**Checklist:**
- [ ] Remove placeholder hooks
- [ ] Clean up TODO comments
- [ ] Remove unused imports
- [ ] Delete empty files

### **Task 5.2: Update Documentation**
**Thời gian:** 30 phút

**Checklist:**
- [ ] Update README files
- [ ] Document new structure
- [ ] Update import examples

### **Task 5.3: Testing & Verification**
**Thời gian:** 45 phút

**Checklist:**
- [ ] Run TypeScript checks
- [ ] Test build process
- [ ] Verify all imports work
- [ ] Test key functionality
- [ ] Check for runtime errors

---

## ⚠️ **MIGRATION SAFETY CHECKLIST**

### **Before Starting:**
- [ ] Create backup branch
- [ ] Document current import patterns
- [ ] List all files that import mockdata
- [ ] Verify test coverage

### **During Migration:**
- [ ] Update imports incrementally
- [ ] Test after each major change
- [ ] Keep detailed change log
- [ ] Monitor for TypeScript errors

### **After Completion:**
- [ ] Full application test
- [ ] Performance verification
- [ ] Code review
- [ ] Update team documentation

---

## 📊 **SUCCESS METRICS**

### **Quantitative Goals:**
- [ ] Reduce mockdata files from 20+ to organized structure
- [ ] Eliminate 100% of duplicate type definitions
- [ ] Reduce total lines of code by 15-20%
- [ ] Zero TypeScript errors
- [ ] Zero runtime errors

### **Qualitative Goals:**
- [ ] Improved developer experience
- [ ] Clearer code organization
- [ ] Easier maintenance
- [ ] Better performance
- [ ] Consistent patterns

---

## 🚨 **ROLLBACK PLAN**

**If issues occur:**
1. Stop current migration
2. Revert to backup branch
3. Analyze specific issues
4. Create targeted fix plan
5. Resume with smaller increments

**Emergency contacts:** Development team lead
**Estimated rollback time:** 30 minutes

---

## 📝 **DETAILED IMPLEMENTATION GUIDE**

### **Critical Files Mapping:**

#### **Current Mockdata Locations:**
```
CURRENT → NEW LOCATION
src/lib/mockdata/users.ts → src/lib/mockdata/users/admin-users.ts
src/lib/mockdata/questions.ts → src/lib/mockdata/questions/multiple-choice.ts
src/lib/mockdata/courses.ts → src/lib/mockdata/courses/featured-courses.ts
src/lib/mockdata/analytics.ts → src/lib/mockdata/analytics/dashboard-metrics.ts
src/contexts/auth-context.tsx (mockAdminUser) → src/lib/mockdata/auth/mock-users.ts
```

#### **Import Update Pattern:**
```typescript
// OLD
import { mockUsers } from '@/lib/mockdata/users';
import { mockAdminUser } from '@/contexts/auth-context';

// NEW
import { mockUsers, mockAdminUser } from '@/lib/mockdata/users';
// OR
import { mockUsers } from '@/lib/mockdata/users/admin-users';
import { mockAdminUser } from '@/lib/mockdata/auth/mock-users';
```

#### **Type Consolidation Pattern:**
```typescript
// BEFORE (multiple files)
// src/types/admin-user.ts
interface AdminUser { ... }

// src/lib/mockdata/types.ts
interface AdminUser { ... }

// AFTER (single source)
// src/lib/types/user.ts
export interface User { ... }
export interface AdminUser extends User { ... }
```

### **Phase-by-Phase Commands:**

#### **Phase 1 Commands:**
```bash
# Create directory structure
mkdir -p src/lib/mockdata/{users,questions,courses,analytics,admin,auth,shared}

# Create index files
touch src/lib/mockdata/{users,questions,courses,analytics,admin,auth,shared}/index.ts

# Move files (example)
mv src/lib/mockdata/users.ts src/lib/mockdata/users/admin-users.ts
```

#### **Critical Import Files to Update:**
1. `src/components/admin/header/admin-header.tsx`
2. `src/components/admin/sidebar/admin-sidebar.tsx`
3. `src/hooks/admin/use-admin-*.ts`
4. `src/app/3141592654/admin/*/page.tsx`

### **Testing Commands:**
```bash
# TypeScript check
pnpm type-check

# Build test
pnpm build

# Lint check
pnpm lint

# Component-specific tests
pnpm lint:contexts
pnpm lint:hooks
pnpm lint:lib
```

---

**Created:** December 2024
**Status:** Ready for execution
**Next Review:** After Phase 1 completion
**Estimated Total Time:** 9-14 hours (includes validation & checks)
**Risk Level:** Medium
**Dependencies:** See Dependency Mapping section below
