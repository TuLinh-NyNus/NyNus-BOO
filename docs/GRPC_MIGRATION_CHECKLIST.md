# 📋 **GRPC MIGRATION EXECUTION CHECKLIST**
**Project**: NyNus Exam Bank System - Complete gRPC Migration  
**Start Date**: September 16, 2025  
**Target Completion**: September 20, 2025  

---

## 📅 **PHASE 1: ANALYSIS & INFRASTRUCTURE** 
**Timeline**: Day 1 Morning (2 giờ)  
**Status**: 🟡 Ready to Start  

### **1.1 Complete Frontend Analysis** ⏱️ 45 phút
- [ ] **File Inventory Analysis** 
  - [ ] Create complete list of all HTTP API calls in frontend
  - [ ] Categorize by priority (CRITICAL, HIGH, MEDIUM, LOW)
  - [ ] Map each HTTP call to corresponding gRPC service
  - [ ] Document any missing gRPC services needed

- [ ] **Dependency Graph Creation**
  - [ ] Map component dependencies on HTTP services  
  - [ ] Identify circular dependencies
  - [ ] Create migration sequence to avoid breaking changes
  - [ ] Document components that need simultaneous updates

- [ ] **Breaking Changes Assessment**
  - [ ] Identify components directly using HTTP client
  - [ ] Find components using HTTP-based hooks/contexts
  - [ ] List API contract changes needed
  - [ ] Plan backward compatibility approach (if needed)

- [ ] **Risk Assessment Documentation**
  - [ ] Document high-risk migration areas (auth, core features)
  - [ ] Plan fallback scenarios for critical services
  - [ ] Create rollback checkpoints
  - [ ] Document emergency procedures

### **1.2 gRPC Infrastructure Validation** ⏱️ 45 phút
- [ ] **Proto Generation Verification**
  - [ ] Verify all proto files compile without errors
  - [ ] Check generated TypeScript interfaces are complete
  - [ ] Validate proto field mappings match backend
  - [ ] Test proto generation script works properly

- [ ] **gRPC-Web Connectivity Testing** 
  - [ ] Test basic gRPC-Web connection to backend
  - [ ] Verify gRPC-Web client configuration
  - [ ] Test auth metadata passing works correctly
  - [ ] Validate CORS setup for gRPC-Web

- [ ] **Error Handling Setup**
  - [ ] Create gRPC error to frontend error mapping
  - [ ] Test gRPC error codes propagation
  - [ ] Setup user-friendly error messages
  - [ ] Create error retry logic framework

- [ ] **Metadata Handling Configuration**
  - [ ] Verify JWT token passing in gRPC metadata
  - [ ] Setup request tracing headers
  - [ ] Configure client identification headers
  - [ ] Test authorization metadata handling

### **1.3 Testing Strategy Setup** ⏱️ 30 phút
- [ ] **Testing Environment Preparation**
  - [ ] Setup gRPC testing mocks/stubs
  - [ ] Configure test backend for gRPC calls
  - [ ] Create automated testing scripts
  - [ ] Setup integration test environment

- [ ] **Backup & Branch Strategy**
  - [ ] Create migration feature branch `feature/grpc-migration-complete`
  - [ ] Document current working state (screenshots, tests)
  - [ ] Setup automated backup procedures
  - [ ] Create rollback branch protection

- [ ] **Rollback Planning**
  - [ ] Document steps to revert each phase
  - [ ] Create emergency rollback scripts
  - [ ] Setup health check monitors
  - [ ] Plan communication strategy for issues

---

## 📅 **PHASE 2: CORE SERVICES MIGRATION**
**Timeline**: Day 1 Afternoon + Day 2 Morning (4 giờ)  
**Status**: 🔴 Blocked by Phase 1  

### **2.1 HTTP Client Removal** ⏱️ 1 giờ
**Target**: `src/lib/api/client.ts`

- [ ] **gRPC Client Wrapper Creation**
  - [ ] Create unified gRPC client interface
  - [ ] Implement connection pooling
  - [ ] Add retry logic and timeout handling
  - [ ] Create client factory for different services

- [ ] **HTTP to gRPC Conversion**
  - [ ] Replace all `fetch()` calls with gRPC calls
  - [ ] Convert HTTP request/response to proto messages
  - [ ] Update URL-based routing to service method calls
  - [ ] Handle HTTP-specific features (headers, status codes)

- [ ] **Error Mapping Implementation**
  - [ ] Map HTTP status codes to gRPC status codes
  - [ ] Convert HTTP error responses to gRPC errors
  - [ ] Maintain backward compatible error interface
  - [ ] Add proper error context and stack traces

- [ ] **Authentication Metadata**
  - [ ] Move JWT tokens from HTTP headers to gRPC metadata
  - [ ] Implement automatic token refresh for gRPC
  - [ ] Handle token expiration in gRPC calls
  - [ ] Setup secure token storage and passing

- [ ] **Timeout & Deadline Management**
  - [ ] Convert HTTP timeout to gRPC deadline
  - [ ] Implement per-method timeout configuration
  - [ ] Handle deadline exceeded errors
  - [ ] Setup cancellation token support

### **2.2 Auth Service Migration** ⏱️ 1.5 giờ
**Target**: `src/lib/services/api/auth.api.ts` + `src/contexts/auth-context-grpc.tsx`

- [ ] **gRPC Auth Service Verification**
  - [ ] Verify all auth methods exist in gRPC service
  - [ ] Test login, logout, refresh token via gRPC
  - [ ] Validate Google OAuth flow via gRPC
  - [ ] Check user profile operations via gRPC

- [ ] **HTTP Fallback Removal**
  - [ ] Remove all HTTP auth API calls
  - [ ] Replace axios/fetch with gRPC client calls
  - [ ] Update error handling to gRPC error format
  - [ ] Remove HTTP-specific auth utilities

- [ ] **Token Management Update**
  - [ ] Update token storage to work with gRPC
  - [ ] Implement gRPC metadata token injection
  - [ ] Update token refresh logic for gRPC
  - [ ] Handle token expiration in gRPC context

- [ ] **Google OAuth Flow Migration**
  - [ ] Ensure Google OAuth uses gRPC backend calls
  - [ ] Update OAuth callback to use gRPC
  - [ ] Verify Google profile sync via gRPC
  - [ ] Test OAuth error handling

- [ ] **Session Management via gRPC**
  - [ ] Convert session operations to gRPC calls
  - [ ] Update session listing to use gRPC
  - [ ] Implement session termination via gRPC
  - [ ] Test multi-device session limits via gRPC

- [ ] **Auth Error Handling**
  - [ ] Map auth errors to gRPC error codes
  - [ ] Update error messages for gRPC errors
  - [ ] Implement proper auth error recovery
  - [ ] Test error scenarios (network, invalid tokens)

### **2.3 User Management Migration** ⏱️ 1 giờ
**Target**: Admin user operations, profile management

- [ ] **Admin User CRUD via gRPC**
  - [ ] Convert user creation to gRPC admin service
  - [ ] Update user editing to use gRPC calls
  - [ ] Implement user deletion via gRPC
  - [ ] Convert user listing to gRPC with filters

- [ ] **Profile Operations Migration**
  - [ ] Update profile viewing to gRPC profile service
  - [ ] Convert profile updates to gRPC calls
  - [ ] Implement avatar upload via gRPC (if needed)
  - [ ] Test profile validation via gRPC

- [ ] **Role Management via gRPC**
  - [ ] Convert role updates to gRPC admin service
  - [ ] Update level management via gRPC
  - [ ] Implement permission checks via gRPC
  - [ ] Test role hierarchy via gRPC

- [ ] **Session Operations via gRPC**
  - [ ] Update session management to gRPC calls
  - [ ] Convert session termination to gRPC
  - [ ] Implement session monitoring via gRPC
  - [ ] Test session limits enforcement

### **2.4 Integration Testing** ⏱️ 30 phút
- [ ] **Auth Flow Testing**
  - [ ] Test complete login flow via gRPC
  - [ ] Verify logout and session cleanup
  - [ ] Test token refresh mechanism
  - [ ] Validate Google OAuth integration

- [ ] **User Operations Testing**
  - [ ] Test user profile CRUD operations
  - [ ] Verify admin user management
  - [ ] Test role and level changes
  - [ ] Validate session management

- [ ] **Error Scenario Testing**
  - [ ] Test network failure handling
  - [ ] Verify auth error scenarios
  - [ ] Test timeout and retry logic
  - [ ] Validate error user experience

---

## 📅 **PHASE 3: FEATURE SERVICES MIGRATION**
**Timeline**: Day 2 Afternoon (4 giờ)  
**Status**: 🔴 Blocked by Phase 2  

### **3.1 Questions API Migration** ⏱️ 2 giờ
**Target**: `src/lib/services/api/questions.api.ts`

- [ ] **gRPC Question Services Integration**
  - [ ] Replace HTTP question CRUD with gRPC calls
  - [ ] Use existing gRPC question service properly
  - [ ] Update question creation to gRPC calls
  - [ ] Convert question updates to gRPC

- [ ] **Filter Operations via gRPC**
  - [ ] Use gRPC question-filter service for filtering
  - [ ] Convert complex filter criteria to proto messages
  - [ ] Update pagination to gRPC style
  - [ ] Test filter combinations via gRPC

- [ ] **Search Functionality via gRPC** 
  - [ ] Replace search HTTP calls with gRPC search
  - [ ] Update search results processing
  - [ ] Implement search highlighting via gRPC
  - [ ] Test search performance and accuracy

- [ ] **CRUD Operations Migration**
  - [ ] Convert question creation to gRPC
  - [ ] Update question editing via gRPC
  - [ ] Implement question deletion via gRPC
  - [ ] Test bulk operations via gRPC

- [ ] **File Upload Handling**
  - [ ] Implement file uploads via gRPC (streaming or base64)
  - [ ] Update image handling for questions
  - [ ] Test file upload progress and errors
  - [ ] Validate file upload security

- [ ] **Pagination & Sorting**
  - [ ] Convert HTTP pagination to gRPC pagination
  - [ ] Update sorting parameters for gRPC
  - [ ] Implement cursor-based pagination if needed
  - [ ] Test large dataset handling

### **3.2 Admin Services Migration** ⏱️ 1 giờ
**Target**: `src/lib/services/api/admin.api.ts`

- [ ] **User Management via gRPC Admin Service**
  - [ ] Convert admin user operations to gRPC
  - [ ] Update user statistics via gRPC
  - [ ] Implement user bulk operations via gRPC
  - [ ] Test admin permissions via gRPC

- [ ] **System Monitoring via gRPC**
  - [ ] Replace system stats HTTP calls with gRPC
  - [ ] Update health checks to use gRPC
  - [ ] Implement metrics collection via gRPC
  - [ ] Test monitoring dashboard updates

- [ ] **Audit Logs via gRPC**
  - [ ] Convert audit log retrieval to gRPC
  - [ ] Update audit log filtering via gRPC
  - [ ] Implement audit log export via gRPC
  - [ ] Test audit log performance

- [ ] **Security Operations via gRPC**
  - [ ] Update security alerts to use gRPC
  - [ ] Implement security actions via gRPC
  - [ ] Convert security monitoring to gRPC
  - [ ] Test security response procedures

### **3.3 Public Services Migration** ⏱️ 1 giờ
**Target**: `src/lib/services/public/questions.service.ts`

- [ ] **Public Question Access via gRPC**
  - [ ] Convert public question APIs to gRPC
  - [ ] Update anonymous access handling
  - [ ] Implement public search via gRPC
  - [ ] Test public API rate limiting

- [ ] **Anonymous Operations**
  - [ ] Setup no-auth gRPC calls for public access
  - [ ] Update public question browsing
  - [ ] Implement public statistics via gRPC
  - [ ] Test anonymous user experience

- [ ] **Public Search Functionality**
  - [ ] Convert public search to gRPC calls
  - [ ] Update search results for public users
  - [ ] Implement search suggestions via gRPC
  - [ ] Test public search performance

---

## 📅 **PHASE 4: COMPONENT LAYER UPDATES**
**Timeline**: Day 3 Morning (3 giờ)  
**Status**: 🔴 Blocked by Phase 3  

### **4.1 Hooks & Context Updates** ⏱️ 1.5 giờ

- [ ] **Auth Hooks Migration**
  - [ ] Update useAuth to use pure gRPC
  - [ ] Convert useUser to gRPC calls
  - [ ] Update useSession to gRPC session service
  - [ ] Test hook state management

- [ ] **Admin Hooks Migration**
  - [ ] Update `use-admin-user-management.ts` to gRPC
  - [ ] Convert admin dashboard hooks to gRPC
  - [ ] Update admin statistics hooks
  - [ ] Test admin hook error handling

- [ ] **Question Hooks Migration**
  - [ ] Update question data fetching hooks to gRPC
  - [ ] Convert question search hooks to gRPC
  - [ ] Update question form hooks for gRPC
  - [ ] Test question hook performance

- [ ] **Error Handling Hooks**
  - [ ] Create gRPC error handling hooks
  - [ ] Update error display hooks for gRPC errors
  - [ ] Implement error recovery hooks
  - [ ] Test error scenarios with hooks

### **4.2 Component Updates** ⏱️ 1.5 giờ

- [ ] **Auth Components Migration**
  - [ ] Update login components to use gRPC auth
  - [ ] Convert register components to gRPC
  - [ ] Update profile components for gRPC
  - [ ] Test auth component flows

- [ ] **Admin Components Migration**
  - [ ] Update user management components
  - [ ] Convert admin dashboard to gRPC
  - [ ] Update admin forms for gRPC submission
  - [ ] Test admin component functionality

- [ ] **Question Components Migration**
  - [ ] Update question browse components
  - [ ] Convert question search components
  - [ ] Update question detail components
  - [ ] Test question component interactions

- [ ] **Form Components Migration**
  - [ ] Update forms to use gRPC submission
  - [ ] Convert form validation to gRPC
  - [ ] Update form error handling
  - [ ] Test form submission flows

---

## 📅 **PHASE 5: CLEANUP & OPTIMIZATION**
**Timeline**: Day 3 Afternoon (2 giờ)  
**Status**: 🔴 Blocked by Phase 4  

### **5.1 HTTP Remnants Cleanup** ⏱️ 1 giờ

- [ ] **Remove Unused HTTP Utilities**
  - [ ] Delete `src/lib/api/client.ts` completely
  - [ ] Remove HTTP mapper files
  - [ ] Delete unused HTTP service files
  - [ ] Clean up HTTP utility functions

- [ ] **Clean Dependencies**
  - [ ] Remove axios or fetch-related packages (if any)
  - [ ] Remove HTTP-specific libraries
  - [ ] Update package.json dependencies
  - [ ] Run dependency cleanup script

- [ ] **Update Imports**
  - [ ] Remove all HTTP service imports
  - [ ] Update imports to use gRPC services
  - [ ] Fix broken import statements
  - [ ] Verify no unused imports remain

- [ ] **Dead Code Removal**
  - [ ] Remove unused HTTP functions
  - [ ] Delete HTTP error handling code
  - [ ] Remove HTTP request/response types
  - [ ] Clean up HTTP-specific constants

### **5.2 Performance Optimization** ⏱️ 1 giờ

- [ ] **gRPC Connection Pooling**
  - [ ] Optimize gRPC client connection management
  - [ ] Implement connection pooling if needed
  - [ ] Setup connection health checks
  - [ ] Test connection performance

- [ ] **Proto Message Optimization**
  - [ ] Review proto message sizes
  - [ ] Optimize large message handling
  - [ ] Implement message compression if needed
  - [ ] Test message serialization performance

- [ ] **Streaming Optimization**
  - [ ] Implement gRPC streaming for long operations
  - [ ] Optimize real-time data updates
  - [ ] Setup bidirectional streaming if needed
  - [ ] Test streaming performance

- [ ] **Error Retry Logic**
  - [ ] Implement smart retry mechanisms
  - [ ] Setup exponential backoff for retries
  - [ ] Handle different error types appropriately
  - [ ] Test retry behavior under load

---

## 📅 **PHASE 6: TESTING & QUALITY ASSURANCE**
**Timeline**: Day 4 Morning (3 giờ)  
**Status**: 🔴 Blocked by Phase 5  

### **6.1 Comprehensive Testing** ⏱️ 2 giờ

- [ ] **Unit Tests**
  - [ ] Write tests for gRPC service layer
  - [ ] Update existing HTTP tests to gRPC
  - [ ] Test error handling scenarios
  - [ ] Verify mock gRPC services work

- [ ] **Integration Tests**
  - [ ] Test full auth flow end-to-end
  - [ ] Verify question management workflows
  - [ ] Test admin operations
  - [ ] Validate public API access

- [ ] **E2E Tests**
  - [ ] Test complete user journeys
  - [ ] Verify cross-component interactions
  - [ ] Test error recovery scenarios
  - [ ] Validate performance under load

- [ ] **Performance Tests**
  - [ ] Measure gRPC vs HTTP performance
  - [ ] Test concurrent user scenarios
  - [ ] Validate response times meet requirements
  - [ ] Check memory usage and cleanup

- [ ] **Error Scenario Tests**
  - [ ] Test network failures
  - [ ] Verify timeout handling
  - [ ] Test malformed data handling
  - [ ] Validate error recovery procedures

### **6.2 Quality Verification** ⏱️ 1 giờ

- [ ] **Type Checking**
  - [ ] Run `pnpm type-check` and fix all errors
  - [ ] Verify proto type definitions are correct
  - [ ] Check gRPC service typing
  - [ ] Validate component prop types

- [ ] **Linting**
  - [ ] Run `pnpm lint` and fix all warnings
  - [ ] Remove HTTP-related ESLint ignores
  - [ ] Update linting rules for gRPC patterns
  - [ ] Verify code style consistency

- [ ] **Build Verification**
  - [ ] Run `pnpm build` successfully
  - [ ] Verify production bundle size
  - [ ] Check for build warnings
  - [ ] Validate generated assets

- [ ] **Runtime Testing**
  - [ ] Manual testing of all major features
  - [ ] Test different user roles and permissions
  - [ ] Verify error messages are user-friendly
  - [ ] Validate UI responsiveness

---

## 📅 **PHASE 7: DOCUMENTATION & DEPLOYMENT**
**Timeline**: Day 4 Afternoon (1 giờ)  
**Status**: 🔴 Blocked by Phase 6  

### **7.1 Documentation Updates** ⏱️ 30 phút

- [ ] **Migration Guide Creation**
  - [ ] Document migration process for future reference
  - [ ] Create troubleshooting guide
  - [ ] Write lessons learned documentation
  - [ ] Update developer onboarding docs

- [ ] **Developer Documentation**
  - [ ] Update gRPC usage patterns
  - [ ] Document service architecture
  - [ ] Create gRPC best practices guide
  - [ ] Update API documentation

- [ ] **Service Documentation**
  - [ ] Document all gRPC services and methods
  - [ ] Update proto file documentation
  - [ ] Create service interaction diagrams
  - [ ] Update system architecture docs

- [ ] **Troubleshooting Guide**
  - [ ] Document common gRPC issues
  - [ ] Create debugging checklist
  - [ ] Update error handling guide
  - [ ] Document performance tuning tips

### **7.2 Deployment & Monitoring** ⏱️ 30 phút

- [ ] **Production Deployment**
  - [ ] Deploy changes to staging environment
  - [ ] Run full integration tests in staging
  - [ ] Deploy to production with monitoring
  - [ ] Verify production functionality

- [ ] **Monitoring Setup**
  - [ ] Setup gRPC performance metrics
  - [ ] Configure error rate monitoring
  - [ ] Setup response time alerts
  - [ ] Create performance dashboards

- [ ] **Performance Monitoring**
  - [ ] Monitor response times post-deployment
  - [ ] Track error rates and success rates
  - [ ] Monitor system resource usage
  - [ ] Setup automated performance alerts

- [ ] **Error Monitoring**
  - [ ] Setup gRPC error tracking
  - [ ] Configure error alerting
  - [ ] Monitor user experience metrics
  - [ ] Create error response procedures

---

## 📊 **SUCCESS METRICS & VALIDATION**

### **Functional Validation**
- [ ] All user authentication works via gRPC only
- [ ] Question management fully functional via gRPC  
- [ ] Admin operations work correctly via gRPC
- [ ] Public APIs accessible via gRPC
- [ ] No HTTP API calls remain in frontend code

### **Technical Validation** 
- [ ] Build passes with zero HTTP dependencies
- [ ] TypeScript compilation successful
- [ ] ESLint passes with no HTTP-related warnings
- [ ] Tests pass with gRPC mocks
- [ ] Performance meets or exceeds HTTP baseline

### **Quality Validation**
- [ ] User experience matches pre-migration quality
- [ ] Error handling is comprehensive and user-friendly
- [ ] Documentation is complete and accurate
- [ ] Code is maintainable and well-structured
- [ ] Security is not compromised

---

**📝 Status**: Ready for Execution  
**🎯 Next Step**: Begin Phase 1.1 - Complete Frontend Analysis  
**📅 Target Completion**: September 20, 2025  
**⚡ Priority**: HIGH - Compliance requirement  

---

*This checklist ensures systematic, quality-focused migration to pure gRPC communication.*