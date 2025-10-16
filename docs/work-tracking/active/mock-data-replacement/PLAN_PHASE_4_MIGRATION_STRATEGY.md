# PLAN Phase 4: Migration Strategy & Prioritization
**Date**: 2025-01-19  
**Status**: PLAN Phase 4 - Migration Strategy  
**Methodology**: RIPER-5 PLAN Mode

## Executive Summary

### Chiến Lược Migration
Dựa trên RESEARCH findings, chúng ta phân loại mock data thành 3 categories chính và định nghĩa migration roadmap với 3 sprints.

### Tổng Quan Phân Loại
- **MIGRATE**: 6 modules (16-24 giờ effort)
- **KEEP**: 7 modules (intentional mock - no action)
- **IMPLEMENT_BACKEND_FIRST**: 0 modules (backend đã sẵn sàng)

### Timeline Tổng Thể
- **Sprint 1** (Critical): 12-18 giờ (1-2 tuần)
- **Sprint 2** (High Priority): 4-6 giờ (3-5 ngày)
- **Sprint 3** (Optional): 12-16 giờ (1-2 tuần)

---

## 1. Phân Loại Mock Data

### 1.1 Category: MIGRATE (Có Backend Support)

#### Module 1: MockQuestionsService
**Status**: ⚠️ **PENDING MIGRATION**  
**Priority**: 🔴 **CRITICAL**

**Lý do migrate**:
- Backend QuestionGRPCService đã có repository layer hoàn chỉnh
- Database schema đầy đủ (question, question_code, question_image, question_tag)
- Chỉ thiếu 4 gRPC methods: CreateQuestion, UpdateQuestion, DeleteQuestion, ImportQuestions
- Blocking 5 admin pages quan trọng

**Files cần migrate**:
1. `apps/frontend/src/app/3141592654/admin/questions/create/page.tsx`
2. `apps/frontend/src/app/3141592654/admin/questions/edit/[id]/page.tsx`
3. `apps/frontend/src/app/3141592654/admin/questions/import/page.tsx`
4. `apps/frontend/src/app/3141592654/admin/questions/bulk-edit/page.tsx`
5. `apps/frontend/src/services/mock/questions.ts`

**Backend work required**:
- Implement `CreateQuestion()` method
- Implement `UpdateQuestion()` method
- Implement `DeleteQuestion()` method
- Implement `ImportQuestions()` method (with LaTeX parsing)

**Frontend work required**:
- Update create page to use `QuestionService.createQuestion()`
- Update edit page to use `QuestionService.updateQuestion()`
- Update import page to use `QuestionService.importQuestions()`
- Update bulk-edit page to use `QuestionService.bulkUpdate()` and `bulkDelete()`
- Remove `MockQuestionsService` file

**Effort Estimate**:
- Backend: 8-12 giờ
  - CreateQuestion: 2-3 giờ
  - UpdateQuestion: 2-3 giờ
  - DeleteQuestion: 1-2 giờ
  - ImportQuestions: 3-4 giờ (LaTeX parsing complex)
- Frontend: 4-6 giờ
  - Create page: 1 giờ
  - Edit page: 1 giờ
  - Import page: 1-2 giờ
  - Bulk-edit page: 1-2 giờ
  - Testing: 1 giờ
- **Total**: 12-18 giờ

**Acceptance Criteria**:
- [ ] Backend: All 4 gRPC methods implemented và tested
- [ ] Frontend: All 5 files migrated to real gRPC calls
- [ ] MockQuestionsService file removed
- [ ] Unit tests coverage ≥ 90%
- [ ] Integration tests pass
- [ ] Manual testing: Create, edit, delete, import questions successfully
- [ ] No console errors or warnings
- [ ] Performance: API response < 500ms

**Blocker**: ✅ **YES** (Admin không thể quản lý questions)

---

#### Module 2: ExamService Mock Functions
**Status**: ⚠️ **PARTIAL IMPLEMENTATION**  
**Priority**: 🟡 **HIGH**

**Lý do migrate**:
- Backend ExamGRPCService đã implemented
- Database schema đầy đủ (exams, exam_questions, exam_attempts, exam_results)
- Chỉ cần protobuf type conversion trong frontend
- Basic functionality đã hoạt động

**Files cần migrate**:
1. `apps/frontend/src/services/grpc/exam.service.ts` (remove mock functions)

**Mock functions cần remove**:
- `createMockExam()`
- `createMockExamAttempt()`
- `createMockExamResult()`

**Frontend work required**:
- Complete protobuf type conversion
- Remove mock functions
- Update exam pages to use real gRPC responses
- Test real data flow

**Effort Estimate**:
- Frontend: 4-6 giờ
  - Protobuf conversion: 2-3 giờ
  - Remove mock functions: 1 giờ
  - Testing: 1-2 giờ
- **Total**: 4-6 giờ

**Acceptance Criteria**:
- [ ] Protobuf types correctly converted
- [ ] Mock functions removed
- [ ] Exam pages using real gRPC data
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing: Create exam, take exam, view results successfully
- [ ] Performance: API response < 500ms

**Blocker**: ❌ **NO** (Basic functionality hoạt động)

---

#### Module 3: Questions Search Page
**Status**: ⚠️ **PARTIAL MOCK**  
**Priority**: 🟡 **HIGH**

**Lý do migrate**:
- Backend QuestionFilterService đã production-ready
- `searchQuestions()` method đã available
- Chỉ cần replace mock search results

**Files cần migrate**:
1. `apps/frontend/src/app/questions/search/page.tsx`

**Frontend work required**:
- Replace `mockSearchResults` with `QuestionFilterService.searchQuestions()`
- Update search UI to handle real pagination
- Test search functionality

**Effort Estimate**:
- Frontend: 1-2 giờ
  - Replace mock data: 0.5 giờ
  - Update UI: 0.5 giờ
  - Testing: 0.5-1 giờ
- **Total**: 1-2 giờ

**Acceptance Criteria**:
- [ ] Search using real gRPC call
- [ ] Pagination works correctly
- [ ] Search filters work
- [ ] Performance: Search response < 300ms

**Blocker**: ❌ **NO** (Low impact)

---

#### Module 4: Admin Header Notifications
**Status**: ⚠️ **PARTIAL MOCK**  
**Priority**: 🟢 **MEDIUM**

**Lý do migrate** (optional):
- Backend NotificationService chỉ support user notifications
- Admin system notifications khác user notifications
- Cần implement AdminNotificationService nếu muốn migrate

**Files affected**:
1. `apps/frontend/src/components/admin/header.tsx`
2. `apps/frontend/src/app/3141592654/admin/notifications/page.tsx`

**Backend work required** (if migrate):
- Create `AdminNotificationService` gRPC service
- Add `admin_notifications` table
- Implement broadcast/alert functionality
- Implement notification management

**Frontend work required** (if migrate):
- Update header to use `AdminNotificationService`
- Update notifications page
- Remove mock data

**Effort Estimate** (if migrate):
- Backend: 8-10 giờ
  - Service implementation: 4-5 giờ
  - Database migration: 1 giờ
  - Testing: 3-4 giờ
- Frontend: 4-6 giờ
  - Header update: 2 giờ
  - Notifications page: 2 giờ
  - Testing: 1-2 giờ
- **Total**: 12-16 giờ

**Acceptance Criteria** (if migrate):
- [ ] AdminNotificationService implemented
- [ ] admin_notifications table created
- [ ] Header shows real notifications
- [ ] Notifications page functional
- [ ] Real-time updates work

**Blocker**: ❌ **NO** (Admin feature, not critical)

**Recommendation**: **KEEP AS MOCK** (Sprint 3 - Optional)

---

### 1.2 Category: KEEP (Intentional Mock)

#### Module 5: Books System
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- ❌ No `books` table in database
- ❌ No `BookService` gRPC service
- ❌ No `book.proto` file
- ❌ No `BookRepository` in backend
- Static educational content
- Low business priority

**Files using mock**:
- `apps/frontend/src/app/3141592654/admin/books/page.tsx`
- `apps/frontend/src/lib/mockdata/content/books.ts`

**Effort to implement** (if needed in future):
- Backend: 20-24 giờ (service + database + repository)
- Frontend: 8-10 giờ (pages + components)
- **Total**: 28-34 giờ

**Recommendation**: **KEEP AS MOCK** (No action)

---

#### Module 6: FAQs System
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- ❌ No `faqs` table in database
- ❌ No `FAQService` gRPC service
- Static content
- Low business priority

**Files using mock**:
- `apps/frontend/src/app/3141592654/admin/faq/page.tsx`
- `apps/frontend/src/app/faq/page.tsx`
- `apps/frontend/src/lib/mockdata/content/faq.ts`
- `apps/frontend/src/lib/mockdata/homepage-faq.ts`

**Effort to implement** (if needed in future):
- Backend: 12-16 giờ
- Frontend: 6-8 giờ
- **Total**: 18-24 giờ

**Recommendation**: **KEEP AS MOCK** (No action)

---

#### Module 7: Forum System
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- ❌ No `forum_posts` table
- ❌ No `ForumService` gRPC service
- Future feature
- Low business priority

**Files using mock**:
- `apps/frontend/src/lib/mockdata/content/forum.ts`

**Effort to implement** (if needed in future):
- Backend: 24-30 giờ (complex feature)
- Frontend: 12-16 giờ
- **Total**: 36-46 giờ

**Recommendation**: **KEEP AS MOCK** (No action)

---

#### Module 8: Courses System
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: 🟡 **MEDIUM** (Future consideration)

**Lý do keep**:
- ⚠️ Partial backend (chỉ có `course_enrollments` table)
- ❌ No `courses` table (course content)
- ❌ No `CourseService` gRPC service
- Important feature nhưng chưa có full backend

**Files using mock**:
- `apps/frontend/src/app/courses/page.tsx`
- `apps/frontend/src/app/courses/[slug]/page.tsx`
- `apps/frontend/src/app/3141592654/admin/courses/page.tsx`
- `apps/frontend/src/lib/mockdata/courses/`

**Effort to implement** (if needed in future):
- Backend: 30-40 giờ (full course system)
- Frontend: 16-20 giờ
- **Total**: 46-60 giờ

**Recommendation**: **KEEP AS MOCK** (Future sprint)

---

#### Module 9: Homepage Content
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- Static marketing content
- No need for database
- Content management system future feature

**Files using mock**:
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/lib/mockdata/homepage/`

**Recommendation**: **KEEP AS MOCK** (No action)

---

#### Module 10: UI Configuration
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- Static UI configuration
- Sidebar navigation
- Header navigation
- RBAC permissions config
- No need for database

**Files using mock**:
- `apps/frontend/src/components/admin/sidebar.tsx`
- `apps/frontend/src/lib/mockdata/admin/sidebar-navigation.ts`
- `apps/frontend/src/lib/mockdata/admin/header-navigation.ts`
- `apps/frontend/src/lib/mockdata/admin/roles-permissions.ts`

**Recommendation**: **KEEP AS MOCK** (No action)

---

#### Module 11: WebSocket Provider
**Status**: ❌ **KEEP AS MOCK**  
**Priority**: ⚪ **LOW**

**Lý do keep**:
- Real-time WebSocket infrastructure chưa implemented
- Mock provider for development
- Future feature

**Files using mock**:
- `apps/frontend/src/components/admin/providers/mock-websocket-provider.tsx`

**Recommendation**: **KEEP AS MOCK** (No action)

---

### 1.3 Category: IMPLEMENT_BACKEND_FIRST

**Kết luận**: ❌ **NO MODULES**

Tất cả modules cần migrate đều đã có backend support (QuestionService, ExamService, QuestionFilterService). Không có module nào cần implement backend trước.

---

## 2. Migration Priority Matrix

### 2.1 Priority Ranking

| Priority | Module | Effort (giờ) | Blocker | Sprint |
|----------|--------|--------------|---------|--------|
| 🔴 CRITICAL | MockQuestionsService | 12-18 | Yes | Sprint 1 |
| 🟡 HIGH | ExamService Protobuf | 4-6 | No | Sprint 2 |
| 🟡 HIGH | Questions Search | 1-2 | No | Sprint 2 |
| 🟢 MEDIUM | Admin Notifications | 12-16 | No | Sprint 3 (Optional) |
| ⚪ LOW | Books System | 28-34 | No | Keep Mock |
| ⚪ LOW | FAQs System | 18-24 | No | Keep Mock |
| ⚪ LOW | Forum System | 36-46 | No | Keep Mock |
| 🟡 MEDIUM | Courses System | 46-60 | No | Keep Mock (Future) |
| ⚪ LOW | Homepage Content | N/A | No | Keep Mock |
| ⚪ LOW | UI Configuration | N/A | No | Keep Mock |
| ⚪ LOW | WebSocket Provider | N/A | No | Keep Mock |

---

### 2.2 Sprint Planning

#### Sprint 1: Critical Path (1-2 tuần)
**Objective**: Unblock admin question management

**Modules**:
1. MockQuestionsService migration (12-18 giờ)

**Deliverables**:
- [ ] QuestionGRPCService với 4 CRUD methods
- [ ] 5 frontend files migrated
- [ ] MockQuestionsService removed
- [ ] Unit + Integration tests
- [ ] Documentation updated

**Success Criteria**:
- Admin có thể create, edit, delete, import questions
- All tests pass
- No breaking changes
- Performance acceptable (< 500ms)

**Timeline**: 1-2 tuần (depending on team size)

---

#### Sprint 2: High Priority (3-5 ngày)
**Objective**: Complete exam system và search functionality

**Modules**:
1. ExamService protobuf conversion (4-6 giờ)
2. Questions search page (1-2 giờ)

**Deliverables**:
- [ ] ExamService using real gRPC data
- [ ] Mock functions removed
- [ ] Search page using real data
- [ ] Tests updated

**Success Criteria**:
- Exam system fully functional
- Search works with real data
- All tests pass
- Performance acceptable

**Timeline**: 3-5 ngày

---

#### Sprint 3: Optional Enhancements (1-2 tuần)
**Objective**: Admin notifications (if business requires)

**Modules**:
1. Admin Notifications (12-16 giờ) - **OPTIONAL**

**Deliverables** (if implemented):
- [ ] AdminNotificationService
- [ ] admin_notifications table
- [ ] Header notifications functional
- [ ] Notifications page functional

**Success Criteria**:
- Real-time notifications work
- All tests pass
- Performance acceptable

**Timeline**: 1-2 tuần (if needed)

**Recommendation**: **SKIP** (Keep as mock unless business requires)

---

## 3. Detailed Migration Roadmap

### 3.1 Sprint 1 Breakdown (MockQuestionsService)

#### Week 1: Backend Implementation (8-12 giờ)

**Day 1-2: CreateQuestion & UpdateQuestion** (4-6 giờ)
- [ ] Implement `CreateQuestion()` gRPC method
- [ ] Implement `UpdateQuestion()` gRPC method
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Write integration tests

**Day 3: DeleteQuestion** (1-2 giờ)
- [ ] Implement `DeleteQuestion()` gRPC method
- [ ] Add soft delete logic
- [ ] Add cascade delete for related data
- [ ] Write tests

**Day 4-5: ImportQuestions** (3-4 giờ)
- [ ] Implement `ImportQuestions()` gRPC method
- [ ] Implement LaTeX parsing service
- [ ] Add bulk insert optimization
- [ ] Add error handling for invalid LaTeX
- [ ] Write tests

---

#### Week 2: Frontend Migration (4-6 giờ)

**Day 1: Create & Edit Pages** (2 giờ)
- [ ] Update create page to use `QuestionService.createQuestion()`
- [ ] Update edit page to use `QuestionService.updateQuestion()`
- [ ] Update form validation
- [ ] Test create/edit flows

**Day 2: Import & Bulk-Edit Pages** (2-3 giờ)
- [ ] Update import page to use `QuestionService.importQuestions()`
- [ ] Update bulk-edit page to use `QuestionService.bulkUpdate()`
- [ ] Add progress indicators
- [ ] Test import/bulk-edit flows

**Day 3: Cleanup & Testing** (1 giờ)
- [ ] Remove `MockQuestionsService` file
- [ ] Update imports across codebase
- [ ] Run full test suite
- [ ] Manual testing
- [ ] Update documentation

---

### 3.2 Sprint 2 Breakdown (ExamService + Search)

#### Week 1: ExamService Protobuf (4-6 giờ)

**Day 1-2: Protobuf Conversion** (2-3 giờ)
- [ ] Convert exam types to protobuf
- [ ] Convert exam attempt types
- [ ] Convert exam result types
- [ ] Update type imports

**Day 2-3: Remove Mock Functions** (1-2 giờ)
- [ ] Remove `createMockExam()`
- [ ] Remove `createMockExamAttempt()`
- [ ] Remove `createMockExamResult()`
- [ ] Update exam pages to use real data

**Day 3: Testing** (1 giờ)
- [ ] Test exam creation flow
- [ ] Test exam taking flow
- [ ] Test results display
- [ ] Update tests

---

#### Week 1: Questions Search (1-2 giờ)

**Day 1: Search Migration** (1-2 giờ)
- [ ] Replace `mockSearchResults` with real gRPC call
- [ ] Update pagination logic
- [ ] Test search functionality
- [ ] Update tests

---

### 3.3 Sprint 3 Breakdown (Admin Notifications - Optional)

**Recommendation**: **SKIP** this sprint unless business explicitly requires admin notifications

If implemented:
- Week 1: Backend (8-10 giờ)
- Week 2: Frontend (4-6 giờ)

---

## 4. Acceptance Criteria Summary

### 4.1 Sprint 1 Acceptance Criteria

**Backend**:
- [ ] All 4 QuestionGRPCService methods implemented
- [ ] Input validation complete
- [ ] Error handling robust
- [ ] Unit tests coverage ≥ 90%
- [ ] Integration tests pass
- [ ] API documentation updated

**Frontend**:
- [ ] All 5 files migrated to real gRPC
- [ ] MockQuestionsService removed
- [ ] No console errors
- [ ] UI/UX unchanged
- [ ] Form validation works
- [ ] Error messages user-friendly

**Performance**:
- [ ] CreateQuestion: < 500ms
- [ ] UpdateQuestion: < 500ms
- [ ] DeleteQuestion: < 300ms
- [ ] ImportQuestions: < 2s per 10 questions

**Testing**:
- [ ] Unit tests pass (≥ 90% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing complete

---

### 4.2 Sprint 2 Acceptance Criteria

**ExamService**:
- [ ] Protobuf types converted
- [ ] Mock functions removed
- [ ] Exam pages functional
- [ ] Tests updated and pass

**Questions Search**:
- [ ] Search using real gRPC
- [ ] Pagination works
- [ ] Filters work
- [ ] Performance < 300ms

---

## 5. Risk Mitigation

### 5.1 Sprint 1 Risks

**Risk 1: LaTeX parsing complexity**
- **Mitigation**: Use existing LaTeX parser library, add comprehensive error handling
- **Fallback**: Manual question entry if LaTeX parsing fails

**Risk 2: Breaking changes in question CRUD**
- **Mitigation**: Feature flag for gradual rollout, comprehensive testing
- **Fallback**: Rollback to mock if critical issues

**Risk 3: Performance degradation**
- **Mitigation**: Database indexing, query optimization, caching
- **Fallback**: Pagination, lazy loading

---

### 5.2 Sprint 2 Risks

**Risk 1: Protobuf type mismatch**
- **Mitigation**: Thorough type checking, TypeScript strict mode
- **Fallback**: Temporary type casting if needed

**Risk 2: Search performance**
- **Mitigation**: Full-text search indexing, query optimization
- **Fallback**: Pagination, result limiting

---

## 6. Timeline Summary

| Sprint | Duration | Effort (giờ) | Modules |
|--------|----------|--------------|---------|
| Sprint 1 | 1-2 tuần | 12-18 | MockQuestionsService |
| Sprint 2 | 3-5 ngày | 5-8 | ExamService + Search |
| Sprint 3 | Optional | 12-16 | Admin Notifications |
| **Total** | **2-3 tuần** | **17-26 giờ** | **3 modules** |

**Keep as Mock**: 7 modules (Books, FAQs, Forum, Courses, Homepage, UI Config, WebSocket)

---

**Report Generated**: 2025-01-19  
**Methodology**: RIPER-5 PLAN Mode  
**Status**: ✅ PLAN Phase 4 Complete  
**Next**: PLAN Phase 5 - Technical Implementation Plan

