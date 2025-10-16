# Manual Testing Plan - Mock Data Replacement
**Task**: Replace Mock Data with Docker Database Data  
**Phase**: Phase 5 - Testing và Validation  
**Created**: 2025-01-19  
**Status**: Ready for Testing

---

## 📋 Overview

Sau khi hoàn thành Phase 4 (Replace Mock Data với Real Data), document này cung cấp hướng dẫn chi tiết để manual testing các trang đã được thay thế mock data bằng real gRPC calls.

### ✅ Completed Changes Summary

**Backend (Go)**:
- ✅ Created `SystemAnalyticsRepository` with analytics queries
- ✅ Enhanced `AdminService.GetSystemStats()` with real database queries
- ✅ Added `AdminService.GetAnalytics()` method with date range filtering
- ✅ Updated Protocol Buffers with analytics messages
- ✅ Verified Go build successful

**Frontend (TypeScript/React)**:
- ✅ Updated `AdminService` gRPC wrapper with `getAnalytics()` method
- ✅ Replaced mock data in Analytics Dashboard page
- ✅ Replaced mock data in Dashboard Stats component
- ✅ Replaced mock data in Security page
- ✅ Fixed 6 TypeScript type errors
- ✅ Added loading states and error handling

### ⚠️ Known Issues

**Protobuf Generation Issue**:
- PowerShell script `gen-proto-web.ps1` has syntax error
- Frontend protobuf missing `GetAnalyticsRequest` and `GetAnalyticsResponse`
- Temporarily using mock response in `AdminService.getAnalytics()` method
- **Impact**: Analytics Dashboard will show mock data until protobuf is regenerated

---

## 🚀 Pre-Testing Setup

### Step 1: Start Docker PostgreSQL Database

```powershell
# Navigate to docker compose directory
cd docker/compose

# Start only PostgreSQL service
docker-compose up -d postgres

# Verify PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL health
docker-compose logs postgres | Select-String "ready to accept connections"
```

**Expected Output**:
```
NAME                  IMAGE                 STATUS         PORTS
exam_bank_postgres    postgres:15-alpine    Up (healthy)   0.0.0.0:5432->5432/tcp
```

### Step 2: Run Database Migrations

```powershell
# Navigate to backend directory
cd ../../apps/backend

# Run Prisma migrations
pnpm prisma migrate deploy

# Verify migrations applied
pnpm prisma migrate status
```

**Expected Output**:
```
✓ All migrations have been applied
```

### Step 3: Seed Database with Test Data

```powershell
# Still in apps/backend directory
# Run database seeding
go run cmd/main.go seed

# Or use the seed script
pnpm run seed
```

**Expected Output**:
```
✓ Seeding users...
✓ Seeding questions...
✓ Seeding courses...
✓ Seeding exam attempts...
✓ Database seeded successfully
```

### Step 4: Start Backend Server

```powershell
# Still in apps/backend directory
# Build and run backend
go run cmd/main.go

# Or use the dev script
pnpm run dev
```

**Expected Output**:
```
✓ Database connected successfully
✓ gRPC server listening on :50051
✓ HTTP gateway listening on :8080
✓ Server started successfully
```

**Verify Backend Health**:
```powershell
# Test HTTP gateway
curl http://localhost:8080/health

# Expected: {"status":"ok"}
```

### Step 5: Start Frontend Server

```powershell
# Open new terminal
# Navigate to frontend directory
cd apps/frontend

# Start Next.js dev server
pnpm dev
```

**Expected Output**:
```
✓ Ready on http://localhost:3000
✓ Compiled successfully
```

---

## 🧪 Test Cases

### Test Suite 1: Analytics Dashboard Page

**URL**: `http://localhost:3000/3141592654/admin/analytics`

#### Test Case 1.1: Page Load and Initial Data Display

**Steps**:
1. Navigate to analytics dashboard URL
2. Observe loading state
3. Wait for data to load

**Expected Results**:
- ✅ Loading spinner displays with message "Đang tải dữ liệu analytics..."
- ✅ Loading state disappears after data loads
- ✅ Overview metrics cards display with real data
- ✅ Charts render with data points
- ✅ No console errors in browser DevTools

**Verification**:
```javascript
// Open Browser DevTools Console
// Check for successful gRPC call
// Should see: "AdminService.getAnalytics - Using mock data - protobuf not yet regenerated"
```

**Screenshots Checklist**:
- [ ] Loading state screenshot
- [ ] Fully loaded page with data
- [ ] Browser DevTools Console (no errors)
- [ ] Browser DevTools Network tab (gRPC calls)

#### Test Case 1.2: Date Range Filtering

**Steps**:
1. Click on "7 ngày qua" time option
2. Observe data refresh
3. Repeat for "30 ngày qua", "90 ngày qua", "12 tháng qua"

**Expected Results**:
- ✅ Loading state shows during data fetch
- ✅ Data updates based on selected time range
- ✅ gRPC call includes correct date range parameters
- ✅ Charts update with new data

**Verification**:
```javascript
// In Browser DevTools Console, check:
// getDateRange() function calculates correct start_date and end_date
// AdminService.getAnalytics() called with correct parameters
```

**Screenshots Checklist**:
- [ ] 7 days data view
- [ ] 30 days data view
- [ ] 90 days data view
- [ ] 12 months data view

#### Test Case 1.3: Error Handling

**Steps**:
1. Stop backend server (`Ctrl+C` in backend terminal)
2. Refresh analytics dashboard page
3. Observe error handling

**Expected Results**:
- ✅ Error toast notification displays
- ✅ Error message in Vietnamese: "Không thể tải dữ liệu analytics"
- ✅ Page shows error state (not blank)
- ✅ Console shows error details

**Screenshots Checklist**:
- [ ] Error toast notification
- [ ] Error state UI
- [ ] Console error message

---

### Test Suite 2: Dashboard Stats Component

**URL**: `http://localhost:3000/3141592654/admin`

#### Test Case 2.1: System Stats Display

**Steps**:
1. Navigate to admin dashboard
2. Observe stats cards in dashboard

**Expected Results**:
- ✅ "Tổng người dùng" card shows real count from database
- ✅ "Người dùng hoạt động" card shows active users count
- ✅ "Tổng phiên làm việc" card shows sessions count
- ✅ "Phiên đang hoạt động" card shows active sessions
- ✅ Trend indicators show (e.g., "+12 hôm nay")

**Verification**:
```javascript
// In Browser DevTools Console:
// Check AdminService.getSystemStats() response
// Verify stats object contains: total_users, active_users, total_sessions, active_sessions
```

**Screenshots Checklist**:
- [ ] Dashboard with all stats cards
- [ ] DevTools Console showing getSystemStats() response
- [ ] DevTools Network tab showing gRPC call

#### Test Case 2.2: Loading State

**Steps**:
1. Hard refresh page (`Ctrl+Shift+R`)
2. Observe loading behavior

**Expected Results**:
- ✅ Stats cards show loading skeleton or spinner
- ✅ Loading state disappears after data loads
- ✅ No flash of incorrect data

**Screenshots Checklist**:
- [ ] Loading state screenshot

#### Test Case 2.3: Error Handling

**Steps**:
1. Stop backend server
2. Refresh dashboard page

**Expected Results**:
- ✅ Error toast displays: "Lỗi tải dữ liệu"
- ✅ Error message: "Không thể tải dữ liệu thống kê"
- ✅ Stats cards show error state or fallback values

**Screenshots Checklist**:
- [ ] Error toast notification
- [ ] Error state in stats cards

---

### Test Suite 3: Security Page

**URL**: `http://localhost:3000/3141592654/admin/security`

#### Test Case 3.1: Audit Logs Display

**Steps**:
1. Navigate to security page
2. Observe audit logs section

**Expected Results**:
- ✅ Audit logs table displays with real data from database
- ✅ Each log entry shows: event type, severity, description, IP address, timestamp
- ✅ Logs are sorted by most recent first
- ✅ Severity badges display correct colors (Critical=red, High=orange, Medium=yellow, Low=green)

**Verification**:
```javascript
// In Browser DevTools Console:
// Check AdminService.getAuditLogs() response
// Verify logs array contains audit log entries
```

**Screenshots Checklist**:
- [ ] Audit logs table with data
- [ ] DevTools showing getAuditLogs() response

#### Test Case 3.2: Security Alerts Display

**Steps**:
1. Observe security alerts section
2. Check for unresolved alerts

**Expected Results**:
- ✅ Security alerts display from `AdminService.getSecurityAlerts()`
- ✅ Unresolved alerts highlighted
- ✅ Alert count matches backend data

**Verification**:
```javascript
// Check AdminService.getSecurityAlerts() response
// Verify alerts array and unresolved_only filter
```

**Screenshots Checklist**:
- [ ] Security alerts section
- [ ] DevTools showing getSecurityAlerts() response

#### Test Case 3.3: Security Metrics Calculation

**Steps**:
1. Observe security metrics cards
2. Verify calculations

**Expected Results**:
- ✅ Total events count matches audit logs count
- ✅ Critical events count correct
- ✅ High severity events count correct
- ✅ Risk score calculated based on severity distribution

**Screenshots Checklist**:
- [ ] Security metrics cards

---

## 🔍 Browser DevTools Verification

### Network Tab Checks

**For each page, verify**:
1. Open DevTools → Network tab
2. Filter by "grpc" or "admin"
3. Check for gRPC calls:
   - `AdminService.getAnalytics()` (Analytics page)
   - `AdminService.getSystemStats()` (Dashboard)
   - `AdminService.getAuditLogs()` (Security page)
   - `AdminService.getSecurityAlerts()` (Security page)

**Expected**:
- ✅ Status: 200 OK
- ✅ Response contains data (not empty)
- ✅ Request headers include authentication token
- ✅ Response time < 500ms

### Console Tab Checks

**For each page, verify**:
1. Open DevTools → Console tab
2. Check for errors or warnings

**Expected**:
- ✅ No red errors (except known protobuf warning)
- ✅ Known warning: "AdminService.getAnalytics - Using mock data - protobuf not yet regenerated"
- ✅ No TypeScript errors
- ✅ No React warnings

---

## 📊 Data Validation

### Verify Real Data vs Mock Data

**Analytics Dashboard**:
- ❌ Currently showing **mock data** (due to protobuf issue)
- ✅ After protobuf fix: Should show real user growth, question stats, exam stats

**Dashboard Stats**:
- ✅ Showing **real data** from `GetSystemStats()`
- Verify numbers match database:
  ```sql
  -- Run in PostgreSQL
  SELECT COUNT(*) FROM users; -- Should match "Tổng người dùng"
  SELECT COUNT(*) FROM users WHERE is_active = true; -- Should match "Người dùng hoạt động"
  SELECT COUNT(*) FROM sessions; -- Should match "Tổng phiên làm việc"
  ```

**Security Page**:
- ✅ Showing **real data** from `GetAuditLogs()` and `GetSecurityAlerts()`
- Verify audit logs match database:
  ```sql
  SELECT COUNT(*) FROM audit_logs WHERE action = 'SECURITY';
  ```

---

## ✅ Testing Completion Checklist

### Pre-Testing
- [ ] Docker PostgreSQL running and healthy
- [ ] Database migrations applied
- [ ] Database seeded with test data
- [ ] Backend server running on :50051 and :8080
- [ ] Frontend server running on :3000

### Analytics Dashboard Testing
- [ ] Page loads successfully
- [ ] Loading state displays
- [ ] Data displays (currently mock)
- [ ] Date range filtering works
- [ ] Error handling works
- [ ] Screenshots captured

### Dashboard Stats Testing
- [ ] Stats cards display real data
- [ ] Loading state works
- [ ] Error handling works
- [ ] Screenshots captured

### Security Page Testing
- [ ] Audit logs display
- [ ] Security alerts display
- [ ] Metrics calculated correctly
- [ ] Error handling works
- [ ] Screenshots captured

### DevTools Verification
- [ ] Network tab shows gRPC calls
- [ ] Console has no critical errors
- [ ] Response times acceptable

### Documentation
- [ ] All screenshots saved to `docs/work-tracking/active/mock-data-replacement/screenshots/`
- [ ] Test results documented
- [ ] Issues logged (if any)

---

## 🐛 Known Issues & Workarounds

### Issue 1: Protobuf Generation Error

**Problem**: `gen-proto-web.ps1` script has syntax error, preventing generation of `GetAnalyticsRequest` and `GetAnalyticsResponse` for frontend.

**Impact**: Analytics Dashboard uses mock data instead of real backend data.

**Workaround**: Temporarily using mock response in `AdminService.getAnalytics()` method.

**Fix Required**:
1. Debug and fix `scripts/development/gen-proto-web.ps1` script
2. Regenerate frontend protobuf: `pnpx @bufbuild/buf generate` in `packages/proto`
3. Uncomment `GetAnalyticsRequest` import in `admin.service.ts`
4. Remove mock response, use real gRPC call

**Priority**: High (blocks real analytics data)

---

## 📝 Test Results Template

```markdown
# Test Results - [Date]

## Tester: [Name]
## Environment: Local Development

### Analytics Dashboard
- [ ] PASS / [ ] FAIL - Page load
- [ ] PASS / [ ] FAIL - Date filtering
- [ ] PASS / [ ] FAIL - Error handling
- Issues: [List any issues]

### Dashboard Stats
- [ ] PASS / [ ] FAIL - Stats display
- [ ] PASS / [ ] FAIL - Loading state
- [ ] PASS / [ ] FAIL - Error handling
- Issues: [List any issues]

### Security Page
- [ ] PASS / [ ] FAIL - Audit logs
- [ ] PASS / [ ] FAIL - Security alerts
- [ ] PASS / [ ] FAIL - Metrics
- Issues: [List any issues]

### Overall Result
- [ ] ALL TESTS PASSED
- [ ] TESTS FAILED - See issues above

### Screenshots
- Saved to: docs/work-tracking/active/mock-data-replacement/screenshots/
- Count: [X] screenshots
```

---

## 🎯 Success Criteria

Testing is considered successful when:

1. ✅ All pages load without errors
2. ✅ Real data displays correctly (except Analytics due to known issue)
3. ✅ Loading states work properly
4. ✅ Error handling displays Vietnamese messages
5. ✅ gRPC calls succeed in DevTools Network tab
6. ✅ No critical console errors
7. ✅ Data matches database queries
8. ✅ All screenshots captured

---

**Next Steps After Testing**:
1. Document test results
2. Fix protobuf generation issue
3. Re-test Analytics Dashboard with real data
4. Proceed to Phase 6: Cleanup Mock Data Files

