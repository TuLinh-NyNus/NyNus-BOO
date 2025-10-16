# Mock Data Migration - Master Plan
**Project**: NyNus Exam Bank System  
**Date**: 2025-01-19  
**Version**: 1.0  
**Status**: Ready for Execution  
**Methodology**: RIPER-5 (RESEARCH → INNOVATE → PLAN → EXECUTE → REVIEW)

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Research Findings](#3-research-findings)
4. [Migration Strategy](#4-migration-strategy)
5. [Technical Implementation](#5-technical-implementation)
6. [Risk Management](#6-risk-management)
7. [Timeline & Resources](#7-timeline--resources)
8. [Success Criteria](#8-success-criteria)
9. [Appendices](#9-appendices)

---

## 1. Executive Summary

### 1.1 Tổng Quan Dự Án

**Mục tiêu**: Migration từ mock data sang real implementation trong NyNus Exam Bank System

**Phạm vi**:
- Frontend: Next.js 14, React 18, TypeScript 5.5
- Backend: Go gRPC server, PostgreSQL 15, Prisma ORM
- Communication: gRPC protocol

**Kết quả mong đợi**:
- ✅ 100% critical features sử dụng real data
- ✅ Performance targets đạt được (< 500ms API response)
- ✅ Zero downtime deployment
- ✅ Backward compatibility maintained

---

### 1.2 Phát Hiện Chính

**Mock Data Inventory**:
- **50+ mock data files** analyzed
- **70% đã migrate** (35+ components using real gRPC)
- **10% pending migration** (5 components - MockQuestionsService)
- **20% intentional mock** (10+ components - Books/FAQs/Courses/Homepage)

**Backend Infrastructure**:
- **85% ready** (7/10 services production-ready)
- **3 partial services** (Questions, Exams, Notifications)
- **18 database tables** implemented
- **5 tables missing** (Books, FAQs, Forum, Courses, Settings)

**Critical Path**:
- **MockQuestionsService** (12-18 giờ) - 🔴 CRITICAL
- **ExamService Protobuf** (4-6 giờ) - 🟡 HIGH
- **Questions Search** (1-2 giờ) - 🟡 HIGH

---

### 1.3 Khuyến Nghị

**Sprint 1** (1-2 tuần): MockQuestionsService migration
- Implement 4 missing gRPC methods
- Migrate 5 frontend files
- Remove mock service
- **Priority**: 🔴 CRITICAL (Blocking admin question management)

**Sprint 2** (3-5 ngày): ExamService + Search
- Complete protobuf conversion
- Migrate search page
- **Priority**: 🟡 HIGH (Partial functionality works)

**Sprint 3** (Optional): Admin Notifications
- Create AdminNotificationService
- **Priority**: 🟢 MEDIUM (Admin feature, not critical)

**Keep as Mock**: Books, FAQs, Forum, Courses, Homepage, UI Config, WebSocket
- **Priority**: ⚪ LOW (No backend support or intentional static content)

---

## 2. Project Overview

### 2.1 Background

NyNus Exam Bank System hiện đang sử dụng mock data cho một số features trong quá trình development. Để chuẩn bị cho production, cần migrate tất cả mock data sang real implementation với backend gRPC services.

### 2.2 Objectives

**Primary Objectives**:
1. Migrate MockQuestionsService sang real QuestionGRPCService
2. Complete ExamService protobuf conversion
3. Migrate Questions Search page sang real data

**Secondary Objectives**:
4. Admin Notifications (optional)
5. Document intentional mock data (Books/FAQs/Courses)

**Non-Objectives**:
- Implement backend for Books/FAQs/Forum/Courses systems
- Change UI/UX
- Add new features

### 2.3 Scope

**In Scope**:
- Backend: Implement 4 missing QuestionGRPCService methods
- Frontend: Migrate 5 files from MockQuestionsService
- Testing: Unit + Integration + E2E tests
- Documentation: Update API docs, code comments

**Out of Scope**:
- Books/FAQs/Forum/Courses backend implementation
- UI/UX redesign
- Performance optimization beyond targets
- New feature development

### 2.4 Stakeholders

**Development Team**:
- Backend Developer (Go, gRPC)
- Frontend Developer (Next.js, TypeScript)
- QA Engineer (Testing)
- DevOps Engineer (Deployment)

**Business Team**:
- Product Owner
- Project Manager
- Admin Users (testing)

---

## 3. Research Findings

### 3.1 Mock Data Inventory

**Detailed Analysis**: See `COMPREHENSIVE_MOCK_DATA_INVENTORY.md`

**Summary**:
- **Frontend Mock Data**: 50+ files in `apps/frontend/src/lib/mockdata/`
- **Mock Services**: 2 services (MockQuestionsService, ExamService mock functions)
- **Backend Status**: 10 gRPC services (7 ready, 3 partial)
- **Component Dependencies**: 50+ React components analyzed

**Classification**:
- ✅ **MIGRATED** (70%): Users, Analytics, Sessions, Audit Logs, MapCode
- ⚠️ **PENDING** (10%): MockQuestionsService (5 files)
- ❌ **KEEP MOCK** (20%): Books, FAQs, Forum, Courses, Homepage, UI Config

---

### 3.2 Backend Readiness

**Detailed Analysis**: See `BACKEND_READINESS_MATRIX.md`

**Service Status**:

| Service | Completeness | Status | Action Required |
|---------|--------------|--------|-----------------|
| EnhancedUserGRPCService | 100% | ✅ READY | None |
| QuestionGRPCService | 40% | ⚠️ PARTIAL | Implement 4 CRUD methods |
| QuestionFilterGRPCService | 100% | ✅ READY | None |
| ExamGRPCService | 80% | ⚠️ PARTIAL | Protobuf conversion |
| ProfileGRPCService | 100% | ✅ READY | None |
| AdminGRPCService | 100% | ✅ READY | None |
| ContactGRPCService | 100% | ✅ READY | None |
| NewsletterGRPCService | 100% | ✅ READY | None |
| NotificationGRPCService | 60% | ⚠️ PARTIAL | Admin notifications (optional) |
| MapCodeGRPCService | 100% | ✅ READY | None |

**Overall Backend Readiness**: **85%**

---

### 3.3 Frontend Dependencies

**Detailed Analysis**: See `FRONTEND_DEPENDENCIES_MAP.md`

**Component Analysis**:
- **Total Components**: 50+
- **Using Real gRPC**: 35+ (70%)
- **Using Mock**: 15 (30%)
  - Pending Migration: 5 (MockQuestionsService)
  - Intentional Mock: 10 (Books/FAQs/Courses/Homepage)

**Dependency Graph**:
```
MockQuestionsService (5 files)
├── create/page.tsx
├── edit/[id]/page.tsx
├── import/page.tsx
├── bulk-edit/page.tsx
└── services/mock/questions.ts
```

---

## 4. Migration Strategy

### 4.1 Phân Loại Mock Data

**Detailed Strategy**: See `PLAN_PHASE_4_MIGRATION_STRATEGY.md`

**Category 1: MIGRATE** (6 modules, 16-24 giờ)
1. MockQuestionsService (12-18 giờ) - 🔴 CRITICAL
2. ExamService Protobuf (4-6 giờ) - 🟡 HIGH
3. Questions Search (1-2 giờ) - 🟡 HIGH

**Category 2: KEEP** (7 modules, no action)
4. Books System - ⚪ LOW (no backend)
5. FAQs System - ⚪ LOW (no backend)
6. Forum System - ⚪ LOW (no backend)
7. Courses System - 🟡 MEDIUM (partial backend, future)
8. Homepage Content - ⚪ LOW (marketing)
9. UI Configuration - ⚪ LOW (static config)
10. WebSocket Provider - ⚪ LOW (future feature)

**Category 3: IMPLEMENT_BACKEND_FIRST** (0 modules)
- No modules require backend implementation first

---

### 4.2 Sprint Planning

**Sprint 1: Critical Path** (1-2 tuần, 12-18 giờ)
- **Objective**: Unblock admin question management
- **Deliverables**:
  - [ ] QuestionGRPCService với 4 CRUD methods
  - [ ] 5 frontend files migrated
  - [ ] MockQuestionsService removed
  - [ ] Unit + Integration tests (≥ 90% coverage)
  - [ ] Documentation updated

**Sprint 2: High Priority** (3-5 ngày, 5-8 giờ)
- **Objective**: Complete exam system và search
- **Deliverables**:
  - [ ] ExamService using real gRPC data
  - [ ] Mock functions removed
  - [ ] Search page using real data
  - [ ] Tests updated

**Sprint 3: Optional** (1-2 tuần, 12-16 giờ)
- **Objective**: Admin notifications (if business requires)
- **Deliverables**:
  - [ ] AdminNotificationService (optional)
  - [ ] admin_notifications table (optional)
  - [ ] Header notifications functional (optional)

---

### 4.3 Acceptance Criteria

**Sprint 1 Acceptance Criteria**:

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
- [ ] Error messages user-friendly (Vietnamese)

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

## 5. Technical Implementation

### 5.1 Backend Implementation

**Detailed Specs**: See `PLAN_PHASE_5_TECHNICAL_IMPLEMENTATION.md`

**QuestionGRPCService Methods**:

**1. CreateQuestion**
- Input validation
- Answer validation (at least one correct)
- Image handling
- Tag handling
- Audit logging
- Error handling

**2. UpdateQuestion**
- Permission check (creator or admin)
- Optimistic locking
- Partial updates
- Audit logging

**3. DeleteQuestion**
- Soft delete
- Cascade check (exam usage)
- Force delete option
- Audit logging

**4. ImportQuestions**
- LaTeX parsing
- Bulk validation
- Bulk insert (chunked)
- Error reporting
- Audit logging

**Database Changes**:
- No schema changes (tables exist)
- Add performance indexes
- Add constraints

---

### 5.2 Frontend Implementation

**Service Layer**:
- Add `createQuestion()` method
- Add `updateQuestion()` method
- Add `deleteQuestion()` method
- Add `importQuestions()` method

**Component Updates**:
- Update create page
- Update edit page
- Update import page
- Update bulk-edit page
- Remove MockQuestionsService

**Protobuf Conversion**:
- Convert exam types
- Convert exam attempt types
- Convert exam result types
- Remove mock functions

---

### 5.3 Testing Strategy

**Unit Tests**:
- Backend: ≥ 90% coverage
- Frontend: ≥ 80% coverage
- Test all CRUD operations
- Test validation logic
- Test error handling

**Integration Tests**:
- Test complete CRUD flow
- Test LaTeX import
- Test bulk operations
- Test permission checks

**E2E Tests**:
- Test admin question management workflow
- Test exam taking workflow
- Test search functionality

**Performance Tests**:
- Load testing (10,000+ questions)
- Concurrent users (100+)
- Stress testing (1000+ req/s)

---

## 6. Risk Management

### 6.1 Risk Matrix

**Detailed Assessment**: See `PLAN_PHASE_6_RISK_ASSESSMENT.md`

| Risk | Severity | Probability | Mitigation | Residual |
|------|----------|-------------|------------|----------|
| Breaking Changes | 🔴 HIGH | 🟡 MEDIUM | Feature flags, gradual rollout | 🟢 LOW |
| LaTeX Parsing | 🟡 MEDIUM | 🔴 HIGH | Library, validation, fallback | 🟢 LOW |
| Performance | 🟡 MEDIUM | 🟡 MEDIUM | Indexing, caching, pagination | 🟢 LOW |
| Data Integrity | 🔴 HIGH | 🟢 LOW | Transactions, validation | 🟢 LOW |
| Timeline Delays | 🟡 MEDIUM | 🟡 MEDIUM | Phased approach, buffer | 🟢 LOW |
| Testing Gaps | 🟡 MEDIUM | 🟡 MEDIUM | Coverage requirements, TDD | 🟢 LOW |
| User Impact | 🔴 HIGH | 🟢 LOW | Zero UI changes, rollback | 🟢 LOW |

**Overall Risk Level**: 🟢 **LOW** (after mitigations)

---

### 6.2 Mitigation Strategies

**Feature Flags**:
```typescript
NEXT_PUBLIC_USE_MOCK_QUESTIONS=false // Production
NEXT_PUBLIC_USE_MOCK_QUESTIONS=true  // Fallback
```

**Gradual Rollout**:
- Phase 1: Deploy backend, frontend using mock
- Phase 2: Enable for admin users only
- Phase 3: Enable for all users
- Phase 4: Remove mock code

**Rollback Procedure** (< 5 minutes):
1. Set `NEXT_PUBLIC_USE_MOCK_QUESTIONS=true`
2. Redeploy frontend
3. Verify functionality
4. Investigate issues

---

### 6.3 Monitoring & Alerts

**Key Metrics**:
- API response time (p50, p95, p99)
- Error rate (%)
- Database query time
- Cache hit rate
- Throughput (req/s)

**Alert Thresholds**:
- **Critical**: Error rate > 10%, Response time > 2s
- **Warning**: Error rate > 5%, Response time > 1s

**Monitoring Tools**:
- Application: Prometheus + Grafana
- Logs: ELK Stack
- Tracing: Jaeger
- Alerts: PagerDuty / Slack

---

## 7. Timeline & Resources

### 7.1 Timeline

**Sprint 1** (1-2 tuần):
- Week 1: Backend implementation (8-12 giờ)
  - Day 1-2: CreateQuestion & UpdateQuestion (4-6 giờ)
  - Day 3: DeleteQuestion (1-2 giờ)
  - Day 4-5: ImportQuestions (3-4 giờ)
- Week 2: Frontend migration (4-6 giờ)
  - Day 1: Create & Edit pages (2 giờ)
  - Day 2: Import & Bulk-edit pages (2-3 giờ)
  - Day 3: Cleanup & Testing (1 giờ)

**Sprint 2** (3-5 ngày):
- Day 1-2: ExamService protobuf (4-6 giờ)
- Day 1: Questions search (1-2 giờ)

**Sprint 3** (Optional, 1-2 tuần):
- Week 1: Backend AdminNotificationService (8-10 giờ)
- Week 2: Frontend migration (4-6 giờ)

**Total Timeline**: 2-3 tuần (without Sprint 3)

---

### 7.2 Resource Requirements

**Team**:
- 1 Backend Developer (Go, gRPC) - Full-time Sprint 1, Part-time Sprint 2
- 1 Frontend Developer (Next.js, TypeScript) - Full-time Sprint 1-2
- 1 QA Engineer - Part-time Sprint 1-2
- 1 DevOps Engineer - Part-time (deployment)

**Infrastructure**:
- Development environment
- Staging environment
- Production environment
- CI/CD pipeline
- Monitoring tools

**Tools**:
- Git (version control)
- GitHub/GitLab (code review)
- Jira/Linear (project management)
- Slack (communication)
- Postman (API testing)

---

### 7.3 Budget

**Development Effort**:
- Sprint 1: 12-18 giờ × hourly rate
- Sprint 2: 5-8 giờ × hourly rate
- Sprint 3: 12-16 giờ × hourly rate (optional)

**Infrastructure**:
- No additional infrastructure costs
- Existing servers sufficient

**Total Estimated Cost**: Based on team hourly rates

---

## 8. Success Criteria

### 8.1 Technical Success Criteria

**Functionality**:
- [ ] All 4 QuestionGRPCService methods working
- [ ] All 5 frontend files migrated
- [ ] MockQuestionsService removed
- [ ] ExamService using real data
- [ ] Search using real data

**Performance**:
- [ ] API response time < 500ms (p95)
- [ ] Database query time < 300ms
- [ ] Cache hit rate > 80%
- [ ] Zero downtime deployment

**Quality**:
- [ ] Unit test coverage ≥ 90% (backend)
- [ ] Unit test coverage ≥ 80% (frontend)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] No critical bugs

**Security**:
- [ ] Input validation complete
- [ ] Permission checks working
- [ ] Audit logging functional
- [ ] No SQL injection vulnerabilities

---

### 8.2 Business Success Criteria

**User Experience**:
- [ ] Zero UI changes (seamless transition)
- [ ] No user complaints
- [ ] Feature availability 99.9%
- [ ] Support tickets < 5

**Operational**:
- [ ] Deployment successful
- [ ] Rollback plan tested
- [ ] Documentation complete
- [ ] Team trained

**Timeline**:
- [ ] Sprint 1 completed in 1-2 tuần
- [ ] Sprint 2 completed in 3-5 ngày
- [ ] No major delays

---

### 8.3 Acceptance Sign-off

**Development Team**:
- [ ] Backend Developer sign-off
- [ ] Frontend Developer sign-off
- [ ] QA Engineer sign-off
- [ ] DevOps Engineer sign-off

**Business Team**:
- [ ] Product Owner sign-off
- [ ] Project Manager sign-off
- [ ] Admin Users testing sign-off

---

## 9. Appendices

### 9.1 Related Documents

1. **COMPREHENSIVE_MOCK_DATA_INVENTORY.md** - Mock data inventory
2. **BACKEND_READINESS_MATRIX.md** - Backend infrastructure analysis
3. **FRONTEND_DEPENDENCIES_MAP.md** - Component dependencies
4. **RESEARCH_PHASES_SUMMARY.md** - Research findings summary
5. **PLAN_PHASE_4_MIGRATION_STRATEGY.md** - Migration strategy
6. **PLAN_PHASE_5_TECHNICAL_IMPLEMENTATION.md** - Technical specs
7. **PLAN_PHASE_6_RISK_ASSESSMENT.md** - Risk management

### 9.2 Code Examples

See `PLAN_PHASE_5_TECHNICAL_IMPLEMENTATION.md` for:
- Backend gRPC service implementation
- Frontend service layer updates
- Component refactoring examples
- Testing examples

### 9.3 Database Schema

**Existing Tables** (no changes needed):
- `question` - Question content
- `question_code` - Classification
- `question_image` - Images
- `question_tag` - Tags
- `question_feedback` - Feedback

**Indexes to Add**:
```sql
CREATE INDEX idx_question_content_search ON question USING gin(to_tsvector('english', content));
CREATE INDEX idx_question_type_difficulty ON question(type, difficulty);
CREATE INDEX idx_question_subject_grade ON question(subject, grade);
```

### 9.4 API Documentation

**QuestionGRPCService API**:
- `CreateQuestion(CreateQuestionRequest) → CreateQuestionResponse`
- `UpdateQuestion(UpdateQuestionRequest) → UpdateQuestionResponse`
- `DeleteQuestion(DeleteQuestionRequest) → DeleteQuestionResponse`
- `ImportQuestions(ImportQuestionsRequest) → ImportQuestionsResponse`

See protobuf definitions in `packages/proto/question.proto`

### 9.5 Glossary

- **Mock Data**: Fake data used for development/testing
- **Real Implementation**: Production-ready implementation with backend
- **gRPC**: Google Remote Procedure Call protocol
- **Protobuf**: Protocol Buffers (data serialization)
- **Feature Flag**: Toggle to enable/disable features
- **Rollback**: Revert to previous version
- **Soft Delete**: Mark as deleted without removing from database

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-19  
**Status**: ✅ Ready for Execution  
**Next Steps**: Begin Sprint 1 - MockQuestionsService Migration

---

**Approval**:
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Project Manager
- [ ] QA Lead

