# 📋 **GRPC MIGRATION PLAN - COMPREHENSIVE**
**Project**: NyNus Exam Bank System  
**Goal**: Migrate từ HTTP/REST API sang Pure gRPC/gRPC-Web Communication  
**Created**: September 16, 2025  
**Estimated Duration**: 15-20 giờ  
**Priority**: HIGH - Compliance with gRPC-only requirements  

---

## 🎯 **OVERVIEW & OBJECTIVES**

### **Current State Analysis**
- ✅ **Backend**: Đã migrate xong (proto files cleaned, no HTTP annotations)
- ✅ **Documentation**: Đã cập nhật sang gRPC terminology
- ⚠️ **Frontend**: Mix of HTTP + gRPC (60% gRPC, 40% HTTP còn lại)

### **Target State**
- 🎯 **100% gRPC Communication** - Zero HTTP API calls
- 🎯 **Unified Service Layer** - Chỉ gRPC services
- 🎯 **Type Safety** - Proto-driven development
- 🎯 **Performance** - Binary protocol, multiplexing
- 🎯 **Maintainability** - Single communication pattern

---

## 📊 **DETAILED IMPACT ANALYSIS**

### **Files Requiring Migration** (From grep analysis)

#### **🔴 CRITICAL - Core Services (Priority 1)**
```
src/lib/api/client.ts                           // HTTP client core - 15 API_BASE_URL refs
src/lib/services/api/auth.api.ts               // Auth HTTP calls - gRPC wrapper needed  
src/contexts/auth-context-grpc.tsx             // Auth context - verify pure gRPC
src/services/grpc/client.ts                    // gRPC client - ensure no HTTP fallback
```

#### **🟡 HIGH - Feature Services (Priority 2)**
```
src/lib/services/api/questions.api.ts         // Questions HTTP/gRPC mix - 4 refs
src/lib/services/api/admin.api.ts             // Admin HTTP calls
src/services/grpc/auth.service.ts             // Auth gRPC - verify no HTTP
src/services/grpc/question.service.ts         // Question gRPC - verify complete
src/services/grpc/question-filter.service.ts  // Filter gRPC - verify complete  
src/services/grpc/admin.service.ts            // Admin gRPC - verify complete
```

#### **🟢 MEDIUM - Components & Utils (Priority 3)**
```
src/lib/services/public/questions.service.ts  // Public service - 3 HTTP refs
src/hooks/admin/use-admin-user-management.ts  // Admin hooks - 1 ref
src/lib/services/api/mappers/               // HTTP mappers - convert to gRPC
src/lib/analytics.ts                          // Analytics - 1 HTTP ref
src/app/api/contact/route.ts                  // Contact form - keep as Next.js API?
```

#### **🔵 LOW - UI Components (Priority 4)**
```
// 20+ component files with occasional HTTP refs
// Most are for static content, external links, or non-API calls
// Review and migrate if needed
```

### **Dependencies Map**
```
Auth Context → Auth Service → gRPC Client → Backend gRPC
     ↓              ↓              ↓
UI Components → Feature Services → Proto Messages
     ↓              ↓              ↓  
   Hooks → Public Services → Error Handling
```

---

## 🗓️ **DETAILED EXECUTION PLAN**

### **📅 PHASE 1: Analysis & Infrastructure (2 giờ)**
**Timeline**: Day 1 Morning  
**Risk**: LOW  

#### **1.1 Complete Frontend Analysis** ⏱️ 45 phút
- [ ] **Audit tất cả HTTP calls** - Tạo complete inventory
- [ ] **Map dependencies** - Tạo service dependency graph  
- [ ] **Identify breaking changes** - Components nào sẽ bị ảnh hưởng
- [ ] **Risk assessment** - Các fallback scenarios

#### **1.2 gRPC Infrastructure Validation** ⏱️ 45 phút  
- [ ] **Verify proto generation** - Ensure all protos generate correctly
- [ ] **Test gRPC-Web connectivity** - Backend connectivity check
- [ ] **Error handling setup** - gRPC error codes mapping
- [ ] **Metadata handling** - Auth tokens, tracing headers

#### **1.3 Testing Strategy Setup** ⏱️ 30 phút
- [ ] **Test environment prep** - gRPC testing tools
- [ ] **Backup current state** - Git branch protection
- [ ] **Rollback plan** - Emergency rollback procedures

---

### **📅 PHASE 2: Core Services Migration (4 giờ)**
**Timeline**: Day 1 Afternoon + Day 2 Morning  
**Risk**: HIGH - Core functionality  

#### **2.1 HTTP Client Removal** ⏱️ 1 giờ
**Target**: `src/lib/api/client.ts`
- [ ] **Create gRPC client wrapper** - Unified interface
- [ ] **Replace fetch calls** - Convert to gRPC calls
- [ ] **Error mapping** - HTTP errors → gRPC errors  
- [ ] **Auth metadata** - JWT token in gRPC metadata
- [ ] **Timeout handling** - gRPC deadline management

#### **2.2 Auth Service Migration** ⏱️ 1.5 giờ
**Target**: `src/lib/services/api/auth.api.ts` + `src/contexts/auth-context-grpc.tsx`
- [ ] **Verify gRPC Auth Service** - Complete implementation check
- [ ] **Remove HTTP fallbacks** - Pure gRPC auth calls
- [ ] **Token management** - gRPC metadata handling
- [ ] **Google OAuth flow** - Ensure gRPC-only
- [ ] **Session management** - gRPC session calls
- [ ] **Error handling** - Auth error mapping

#### **2.3 User Management** ⏱️ 1 giờ  
**Target**: Admin user operations, profile management
- [ ] **Admin user CRUD** - Convert to gRPC calls
- [ ] **Profile operations** - gRPC profile service  
- [ ] **Role management** - gRPC admin service
- [ ] **Session operations** - gRPC session service

#### **2.4 Integration Testing** ⏱️ 30 phút
- [ ] **Auth flow testing** - Login/logout/refresh
- [ ] **User operations** - CRUD operations
- [ ] **Error scenarios** - Network failures, auth errors

---

### **📅 PHASE 3: Feature Services Migration (4 giờ)**
**Timeline**: Day 2 Afternoon  
**Risk**: MEDIUM - Feature functionality  

#### **3.1 Questions API Migration** ⏱️ 2 giờ
**Target**: `src/lib/services/api/questions.api.ts`
- [ ] **Replace HTTP calls** - Use existing gRPC question services
- [ ] **Filter operations** - gRPC question-filter service
- [ ] **Search functionality** - gRPC search calls
- [ ] **CRUD operations** - gRPC question management
- [ ] **File uploads** - gRPC streaming or base64
- [ ] **Pagination** - gRPC pagination handling

#### **3.2 Admin Services** ⏱️ 1 giờ
**Target**: `src/lib/services/api/admin.api.ts`  
- [ ] **User management** - gRPC admin service
- [ ] **System monitoring** - gRPC system stats
- [ ] **Audit logs** - gRPC audit service
- [ ] **Security operations** - gRPC security service

#### **3.3 Public Services** ⏱️ 1 giờ
**Target**: `src/lib/services/public/questions.service.ts`
- [ ] **Public question access** - gRPC public endpoints
- [ ] **Anonymous operations** - No-auth gRPC calls
- [ ] **Search functionality** - Public search via gRPC

---

### **📅 PHASE 4: Component Layer Updates (3 giờ)**
**Timeline**: Day 3 Morning  
**Risk**: MEDIUM - UI functionality  

#### **4.1 Hooks & Context Updates** ⏱️ 1.5 giờ
- [ ] **Auth hooks** - Update to use pure gRPC
- [ ] **Admin hooks** - `use-admin-user-management.ts` 
- [ ] **Question hooks** - Data fetching hooks
- [ ] **Error handling hooks** - gRPC error handling

#### **4.2 Component Updates** ⏱️ 1.5 giờ  
- [ ] **Auth components** - Login, register, profile
- [ ] **Admin components** - User management, dashboard
- [ ] **Question components** - Browse, search, detail
- [ ] **Form components** - gRPC form submission

---

### **📅 PHASE 5: Cleanup & Optimization (2 giờ)**
**Timeline**: Day 3 Afternoon  
**Risk**: LOW - Cleanup  

#### **5.1 HTTP Remnants Cleanup** ⏱️ 1 giờ
- [ ] **Remove unused HTTP utilities** - client.ts, HTTP mappers
- [ ] **Clean dependencies** - Remove HTTP-related packages
- [ ] **Update imports** - Remove HTTP service imports
- [ ] **Dead code removal** - Unused HTTP functions

#### **5.2 Performance Optimization** ⏱️ 1 giờ
- [ ] **gRPC connection pooling** - Optimize connections  
- [ ] **Proto message optimization** - Reduce payload size
- [ ] **Streaming optimization** - Long-running operations
- [ ] **Error retry logic** - gRPC retry mechanisms

---

### **📅 PHASE 6: Testing & Quality Assurance (3 giờ)**
**Timeline**: Day 4  
**Risk**: CRITICAL - Quality gate  

#### **6.1 Comprehensive Testing** ⏱️ 2 giờ
- [ ] **Unit tests** - Service layer tests
- [ ] **Integration tests** - Full flow testing
- [ ] **E2E tests** - User journey tests
- [ ] **Performance tests** - Load testing
- [ ] **Error scenario tests** - Failure handling

#### **6.2 Quality Verification** ⏱️ 1 giờ
- [ ] **Type checking** - `pnpm type-check`
- [ ] **Linting** - `pnpm lint`
- [ ] **Build verification** - `pnpm build`
- [ ] **Runtime testing** - Manual verification

---

### **📅 PHASE 7: Documentation & Deployment (1 giờ)**
**Timeline**: Day 4 Afternoon  
**Risk**: LOW - Final steps  

#### **7.1 Documentation Updates** ⏱️ 30 phút
- [ ] **Migration guide** - How others can migrate
- [ ] **Developer docs** - gRPC usage patterns
- [ ] **API documentation** - gRPC service docs
- [ ] **Troubleshooting guide** - Common issues

#### **7.2 Deployment & Monitoring** ⏱️ 30 phút  
- [ ] **Production deployment** - Deploy changes
- [ ] **Monitoring setup** - gRPC metrics
- [ ] **Performance monitoring** - Response times
- [ ] **Error monitoring** - gRPC error rates

---

## 🛡️ **RISK MITIGATION STRATEGIES**

### **High Risk Areas**
1. **Auth System** - Critical for user access
   - *Mitigation*: Thorough testing, staged rollout
2. **Question Services** - Core business functionality
   - *Mitigation*: Feature flags, gradual migration  
3. **Admin Operations** - System management
   - *Mitigation*: Backup procedures, admin access preservation

### **Rollback Plan**
1. **Git branch protection** - Easy revert
2. **Feature flags** - Quick disable of gRPC
3. **Health checks** - Monitor system health
4. **Emergency procedures** - Quick restore plan

### **Performance Monitoring**
1. **gRPC metrics** - Response times, error rates
2. **User experience** - Frontend performance
3. **Backend load** - Server resource usage
4. **Network efficiency** - Bandwidth utilization

---

## 📋 **SUCCESS CRITERIA**

### **Functional Requirements** 
- [ ] ✅ Zero HTTP API calls in frontend code
- [ ] ✅ All features work with gRPC-only
- [ ] ✅ Auth flow completely gRPC-based  
- [ ] ✅ Admin functions work properly
- [ ] ✅ Question management operational

### **Technical Requirements**
- [ ] ✅ Build passes without HTTP dependencies
- [ ] ✅ Type checking passes
- [ ] ✅ Linting passes with no HTTP references  
- [ ] ✅ Tests pass with gRPC mocks
- [ ] ✅ Performance meets or exceeds HTTP baseline

### **Quality Requirements** 
- [ ] ✅ Error handling comprehensive
- [ ] ✅ User experience maintained
- [ ] ✅ Documentation complete
- [ ] ✅ Code maintainability improved
- [ ] ✅ Security not compromised

---

## 🚀 **EXECUTION GUIDELINES**

### **Development Practices**
1. **Branch Strategy**: `feature/grpc-migration-complete`
2. **Commit Strategy**: Small, atomic commits per service  
3. **Testing**: Test each service before moving to next
4. **Documentation**: Update docs as you go

### **Communication Protocol** 
1. **Daily standups** - Progress updates
2. **Blocker escalation** - Quick resolution
3. **Code reviews** - Quality assurance  
4. **Stakeholder updates** - Regular communication

### **Quality Gates**
1. **Phase completion** - Cannot proceed without passing tests
2. **Code review approval** - Required for critical changes
3. **Performance verification** - Must maintain performance
4. **Security review** - No security regressions

---

## 📊 **RESOURCE REQUIREMENTS**

### **Development Time**
- **Total**: 15-20 giờ
- **Critical Path**: Auth + Questions services  
- **Parallel Work**: Documentation + Testing
- **Contingency**: +25% for unexpected issues

### **Technical Resources**
- **Backend gRPC services** - Must be ready and tested
- **Proto definitions** - Complete and validated
- **Testing environment** - gRPC testing setup
- **Monitoring tools** - gRPC performance monitoring

### **Human Resources**
- **Lead Developer**: Full-time on migration
- **Backend Developer**: Support for gRPC issues  
- **QA Engineer**: Testing support
- **DevOps**: Deployment and monitoring support

---

**📝 Status**: READY TO EXECUTE  
**📅 Next Action**: Begin Phase 1 - Complete frontend analysis  
**⏰ ETA**: 4 days (with buffer)  

---

*This plan ensures systematic, risk-managed migration to pure gRPC communication while maintaining system stability and performance.*