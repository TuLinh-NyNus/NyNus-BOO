# Phase 6: Cleanup Mock Data Files - Detailed Plan

**Created**: 2025-01-19  
**Status**: 🔄 IN PROGRESS  
**Estimated Time**: 4-6 hours

---

## 📋 Executive Summary

**Objective**: Remove obsolete mock data files that have been replaced with real gRPC calls in Phase 4.

**Scope**: 
- Identify mock data files replaced in Phase 4
- Verify no remaining dependencies
- Remove obsolete files safely
- Update imports if needed
- Verify build success

**Files to Analyze**: 50+ mock data files in `apps/frontend/src/lib/mockdata/`

---

## 🎯 Phase 6 Subtasks

### Subtask 6.1: Analyze Mock Data Usage (1 hour)

**Objective**: Identify which mock data files are still in use vs obsolete

**Actions**:
1. Search for all imports from `@/lib/mockdata` in codebase
2. Cross-reference with Phase 4 replacements
3. Create list of safe-to-delete files
4. Create list of files still in use

**Deliverable**: `MOCK_DATA_USAGE_REPORT.md`

---

### Subtask 6.2: Verify Analytics Mock Data (30 minutes)

**Objective**: Confirm analytics mock data can be removed

**Files to Check**:
- `apps/frontend/src/lib/mockdata/analytics/analytics.ts`
- `apps/frontend/src/lib/mockdata/analytics/index.ts`

**Verification**:
- ✅ Analytics Dashboard page uses `AdminService.getAnalytics()` (with mock workaround)
- ✅ Dashboard Stats uses `AdminService.getSystemStats()`
- ⚠️ Keep type exports: `SecurityMetrics`, `SecurityEvent` (still used in security page)

**Decision**: 
- **KEEP** `analytics.ts` temporarily (protobuf issue)
- **REMOVE** unused helper functions: `getAnalyticsOverview()`, `getUserGrowthData()`, etc.

---

### Subtask 6.3: Verify Admin Mock Data (30 minutes)

**Objective**: Confirm admin mock data can be removed

**Files to Check**:
- `apps/frontend/src/lib/mockdata/admin/security.ts` - Security metrics and events
- `apps/frontend/src/lib/mockdata/admin/dashboard-metrics.ts` - Dashboard stats

**Verification**:
- ✅ Security page uses `AdminService.getAuditLogs()` and `AdminService.getSecurityAlerts()`
- ✅ Dashboard Stats uses `AdminService.getSystemStats()`
- ⚠️ Keep type exports: `SecurityMetrics`, `SecurityEvent`, `AuditLog`, `AuditStats`

**Decision**:
- **KEEP** type definitions (imported by security page)
- **REMOVE** mock data constants: `mockSecurityMetrics`, `mockSecurityEvents`, `mockAuditStats`
- **REMOVE** helper functions: `getSecurityMetrics()`, `getSecurityEvents()`, `getAuditLogs()`

---

### Subtask 6.4: Identify Files Still in Use (1 hour)

**Objective**: Verify which mock files are still actively used

**Files to Keep** (Static Content):
1. **Homepage Mock Data** - Marketing content
   - `homepage.ts`, `homepage-faq.ts`, `homepage-featured-courses.ts`
   - `testimonials.ts`

2. **Content Mock Data** - No database tables
   - `content/books.ts`
   - `content/faq.ts`
   - `content/forum.ts`

3. **Navigation Mock Data** - UI configuration
   - `admin/sidebar-navigation.ts`
   - `admin/header-navigation.ts`

4. **RBAC Mock Data** - Static configuration
   - `admin/roles-permissions.ts`

5. **Courses Mock Data** - No database schema yet
   - `courses/` directory (all files)

6. **Auth Mock Data** - Used by auth context
   - `auth/mock-users.ts` (mockAdminUser for dev)

**Files to Remove** (Replaced with Real Data):
1. **Analytics Mock Data** - Replaced with gRPC
   - Helper functions in `analytics/analytics.ts`

2. **Security Mock Data** - Replaced with gRPC
   - Mock constants in `admin/security.ts`

3. **Dashboard Mock Data** - Replaced with gRPC
   - Mock constants in `admin/dashboard-metrics.ts`

---

### Subtask 6.5: Remove Obsolete Mock Data (1 hour)

**Objective**: Safely remove mock data that has been replaced

**Step 1**: Remove unused exports from `analytics/analytics.ts`
```typescript
// REMOVE these exports from analytics.ts:
export function getAnalyticsOverview()
export function getUserGrowthData()
export function getQuestionUsageData()
export function getTopPerformers()
export function getCourseProgressData()
export function getMockAnalyticsResponse()
export function getMockSystemMetricsResponse()
export function getMockRevenueMetricsResponse()

// KEEP these (temporarily for protobuf workaround):
export const mockAnalytics
export const mockSystemMetrics
export const mockRevenueMetrics
```

**Step 2**: Remove unused exports from `admin/security.ts`
```typescript
// REMOVE these exports:
export const mockSecurityMetrics
export const mockSecurityEvents
export const mockAuditStats
export const mockEnhancedAuditLogs
export function getSecurityMetrics()
export function getSecurityEvents()
export function getAuditLogs()
export function getAuditStats()
export const securityMockService

// KEEP these type exports (used by security page):
export interface SecurityMetrics
export interface SecurityEvent
export interface AuditLog
export interface AuditStats
```

**Step 3**: Remove unused exports from `admin/dashboard-metrics.ts`
```typescript
// REMOVE these exports:
export const mockDashboardMetrics
export const mockSystemStatus
export const mockRecentActivities
export const adminDashboardMockService
export function getFormattedDashboardMetrics()
export function getSystemStatusWithLabels()
export function getActivitySeverityColor()

// KEEP these type exports (may be used):
export interface DashboardMetrics
export interface SystemStatus
export interface RecentActivity
```

**Step 4**: Update `index.ts` to remove deleted exports
- Remove exports for deleted functions/constants
- Keep type exports

---

### Subtask 6.6: Update Imports (30 minutes)

**Objective**: Fix any broken imports after cleanup

**Files to Check**:
1. `apps/frontend/src/app/3141592654/admin/audit/page.tsx`
   - Currently imports: `getAuditLogs`, `getAuditStats`
   - **Action**: Replace with gRPC calls to `AdminService`

2. Any other files importing deleted functions

**Search Command**:
```bash
# Search for imports of deleted functions
grep -r "getAnalyticsOverview\|getUserGrowthData\|getSecurityMetrics\|getAuditLogs" apps/frontend/src/
```

---

### Subtask 6.7: Verify Build Success (30 minutes)

**Objective**: Ensure no build errors after cleanup

**Commands**:
```bash
# Type check
pnpm type-check

# Lint check
pnpm lint

# Build check
cd apps/frontend
pnpm build
```

**Expected Result**: 0 errors

---

### Subtask 6.8: Document Cleanup (30 minutes)

**Objective**: Create cleanup report

**Deliverable**: `PHASE_6_CLEANUP_REPORT.md`

**Contents**:
- List of files removed
- List of exports removed
- List of files updated
- Build verification results
- Remaining mock data files (with justification)

---

## 📊 Success Criteria

- [ ] All obsolete mock data exports removed
- [ ] No broken imports
- [ ] `pnpm type-check` passes (0 errors)
- [ ] `pnpm lint` passes (0 errors)
- [ ] Frontend builds successfully
- [ ] Cleanup report documented

---

## ⚠️ Known Issues

### Issue 1: Protobuf Generation
- **Problem**: `gen-proto-web.ps1` script has syntax error
- **Impact**: Cannot generate `GetAnalyticsRequest` for frontend
- **Workaround**: Keep `mockAnalytics` temporarily in `analytics.ts`
- **Resolution**: Fix protobuf script in future task

### Issue 2: Audit Page Still Uses Mock Data
- **File**: `apps/frontend/src/app/3141592654/admin/audit/page.tsx`
- **Current**: Imports `getAuditLogs`, `getAuditStats` from mockdata
- **Action**: Replace with `AdminService.getAuditLogs()` in Subtask 6.6

---

## 🔄 Next Steps After Phase 6

1. **Fix Protobuf Generation**
   - Debug `gen-proto-web.ps1` script
   - Regenerate frontend protobuf
   - Remove `mockAnalytics` workaround

2. **Replace Audit Page Mock Data**
   - Update audit page to use real gRPC calls
   - Remove remaining mock imports

3. **Final Verification**
   - Manual testing of all affected pages
   - Verify no mock data references remain

---

**Phase 6 Status**: 🔄 Ready to Execute  
**Next Action**: Begin Subtask 6.1 - Analyze Mock Data Usage

