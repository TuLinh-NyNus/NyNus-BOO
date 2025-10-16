# Manual Testing Checklist - Mock Data Replacement

**Created**: 2025-01-19  
**Phase**: 9 - Final Verification  
**Purpose**: Hướng dẫn manual testing cho 4 pages đã migrate từ mock data sang real gRPC data

---

## 🎯 Testing Objectives

Verify rằng tất cả 4 pages đã migrate hoạt động đúng với real data từ Docker database:
1. ✅ Data loads correctly from backend
2. ✅ No console errors
3. ✅ Filtering và pagination work properly
4. ✅ Loading states display correctly
5. ✅ Error handling works as expected

---

## 📋 Pre-Testing Setup

### 1. Verify Docker Services Running

```bash
# Check Docker containers status
docker ps

# Expected output:
# - PostgreSQL on port 5433
# - Backend Go server on ports 50051 (gRPC) and 8080 (HTTP/gRPC-Web)
```

**Checklist**:
- [ ] PostgreSQL container running
- [ ] Backend Go server running on port 50051
- [ ] Backend HTTP/gRPC-Web gateway running on port 8080

### 2. Verify Frontend Running

```bash
# Check frontend server
# Should be running on port 3000
```

**Checklist**:
- [ ] Frontend Next.js running on port 3000
- [ ] No build errors in terminal
- [ ] Webpack mode (not Turbopack due to known issue)

### 3. Verify Database Seeded

```bash
# Check database has seed data
# Should have 158 users seeded
```

**Checklist**:
- [ ] Database migrations applied (14 migrations)
- [ ] Seed data loaded (158 users)
- [ ] Audit logs exist in database

---

## 🧪 Test Cases

### Test Case 1: Analytics Dashboard Page

**URL**: `http://localhost:3000/3141592654/admin/analytics`

**Prerequisites**:
- [ ] Logged in as admin user
- [ ] Backend server running
- [ ] Database has analytics data

#### Test Steps:

**1.1 Page Load**
- [ ] Navigate to `/3141592654/admin/analytics`
- [ ] Verify loading spinner displays initially
- [ ] Verify page loads without errors
- [ ] Check browser console for errors (should be none)

**Expected Result**:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Loading spinner disappears after data loads

**1.2 Data Display**
- [ ] Verify "Tổng quan hệ thống" section displays
- [ ] Verify metrics cards show real numbers (not mock data)
- [ ] Verify charts render with real data
- [ ] Verify data matches database records

**Expected Result**:
- ✅ All metrics display real data from database
- ✅ Charts render correctly
- ✅ Numbers are realistic (not hardcoded mock values)

**1.3 Date Range Filtering**
- [ ] Click "7 ngày" filter
- [ ] Verify data updates
- [ ] Click "30 ngày" filter
- [ ] Verify data updates
- [ ] Click "90 ngày" filter
- [ ] Verify data updates
- [ ] Click "12 tháng" filter
- [ ] Verify data updates

**Expected Result**:
- ✅ Data updates when filter changes
- ✅ Loading state shows during data fetch
- ✅ Charts re-render with filtered data
- ✅ No console errors

**1.4 Error Handling**
- [ ] Stop backend server
- [ ] Refresh page
- [ ] Verify error message displays in Vietnamese
- [ ] Restart backend server
- [ ] Refresh page
- [ ] Verify data loads correctly

**Expected Result**:
- ✅ Error message displays when backend unavailable
- ✅ Error message in Vietnamese
- ✅ Page recovers when backend restarts

---

### Test Case 2: Dashboard Stats Component

**URL**: `http://localhost:3000/3141592654/admin`

**Prerequisites**:
- [ ] Logged in as admin user
- [ ] Backend server running

#### Test Steps:

**2.1 Stats Cards Display**
- [ ] Navigate to `/3141592654/admin`
- [ ] Verify 4 stats cards display:
  - Tổng người dùng
  - Tổng câu hỏi
  - Tổng bài thi
  - Tổng khóa học
- [ ] Verify numbers are real (not mock data)
- [ ] Verify loading states show initially

**Expected Result**:
- ✅ All 4 stats cards display
- ✅ Numbers match database records
- ✅ Loading skeletons show before data loads

**2.2 Real-time Updates**
- [ ] Note current user count
- [ ] Create new user in database (via backend API or Prisma Studio)
- [ ] Refresh dashboard page
- [ ] Verify user count increased by 1

**Expected Result**:
- ✅ Stats update to reflect database changes
- ✅ Numbers are accurate

**2.3 Error Handling**
- [ ] Stop backend server
- [ ] Refresh page
- [ ] Verify error state displays
- [ ] Restart backend server
- [ ] Refresh page
- [ ] Verify stats load correctly

**Expected Result**:
- ✅ Error state displays when backend unavailable
- ✅ Stats recover when backend restarts

---

### Test Case 3: Security Page

**URL**: `http://localhost:3000/3141592654/admin/security`

**Prerequisites**:
- [ ] Logged in as admin user
- [ ] Backend server running
- [ ] Audit logs exist in database

#### Test Steps:

**3.1 Page Load**
- [ ] Navigate to `/3141592654/admin/security`
- [ ] Verify loading state displays
- [ ] Verify page loads without errors
- [ ] Check browser console for errors

**Expected Result**:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Audit logs display

**3.2 Audit Logs Display**
- [ ] Verify audit logs table displays
- [ ] Verify logs show real data from database
- [ ] Verify columns: Action, Resource, User, Status, Timestamp
- [ ] Verify data is sorted by timestamp (newest first)

**Expected Result**:
- ✅ Audit logs table displays correctly
- ✅ Data matches database records
- ✅ Sorting works correctly

**3.3 Filtering**
- [ ] Select "LOGIN" from Action filter
- [ ] Verify only login actions display
- [ ] Select "USER" from Resource filter
- [ ] Verify only user-related actions display
- [ ] Select "Success" from Status filter
- [ ] Verify only successful actions display
- [ ] Clear all filters
- [ ] Verify all logs display again

**Expected Result**:
- ✅ Filters work correctly
- ✅ Data updates when filters change
- ✅ Clear filters restores all data

**3.4 Security Metrics**
- [ ] Verify security metrics cards display:
  - Total Events
  - Failed Attempts
  - Success Rate
  - Active Users
- [ ] Verify metrics calculated from audit logs
- [ ] Verify percentages are accurate

**Expected Result**:
- ✅ Metrics display correctly
- ✅ Calculations are accurate
- ✅ Percentages match audit log data

---

### Test Case 4: Audit Trail Page

**URL**: `http://localhost:3000/3141592654/admin/audit`

**Prerequisites**:
- [ ] Logged in as admin user
- [ ] Backend server running
- [ ] Audit logs exist in database

#### Test Steps:

**4.1 Page Load**
- [ ] Navigate to `/3141592654/admin/audit`
- [ ] Verify loading state displays
- [ ] Verify page loads without errors
- [ ] Check browser console for errors

**Expected Result**:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Audit logs display

**4.2 Audit Logs Table**
- [ ] Verify audit logs table displays
- [ ] Verify columns: Timestamp, User, Action, Resource, Status, Details
- [ ] Verify data is real (not mock)
- [ ] Verify timestamps are recent

**Expected Result**:
- ✅ Table displays correctly
- ✅ Data matches database records
- ✅ Timestamps are accurate

**4.3 Search Functionality**
- [ ] Enter "login" in search box
- [ ] Verify only login-related logs display
- [ ] Clear search
- [ ] Verify all logs display again

**Expected Result**:
- ✅ Search filters logs correctly
- ✅ Clear search restores all data

**4.4 Action Filter**
- [ ] Select "CREATE" from action filter
- [ ] Verify only create actions display
- [ ] Select "UPDATE" from action filter
- [ ] Verify only update actions display
- [ ] Select "All" from action filter
- [ ] Verify all actions display

**Expected Result**:
- ✅ Action filter works correctly
- ✅ Data updates when filter changes

**4.5 Resource Filter**
- [ ] Select "USER" from resource filter
- [ ] Verify only user-related logs display
- [ ] Select "QUESTION" from resource filter
- [ ] Verify only question-related logs display
- [ ] Select "All" from resource filter
- [ ] Verify all resources display

**Expected Result**:
- ✅ Resource filter works correctly
- ✅ Data updates when filter changes

**4.6 Success Status Filter**
- [ ] Select "Success only" checkbox
- [ ] Verify only successful actions display
- [ ] Uncheck "Success only" checkbox
- [ ] Verify all actions display (including failures)

**Expected Result**:
- ✅ Success filter works correctly
- ✅ Data updates when filter changes

**4.7 Audit Stats**
- [ ] Verify audit stats cards display:
  - Total Events
  - Success Rate
  - Failed Attempts
  - Unique Users
- [ ] Verify stats calculated from filtered logs
- [ ] Change filters and verify stats update

**Expected Result**:
- ✅ Stats display correctly
- ✅ Stats update when filters change
- ✅ Calculations are accurate

---

## 🐛 Common Issues and Troubleshooting

### Issue 1: "Failed to fetch" Error

**Symptoms**:
- Error message: "Không thể tải dữ liệu"
- Console error: "Failed to fetch"

**Possible Causes**:
1. Backend server not running
2. Backend server on wrong port
3. CORS issues

**Solutions**:
```bash
# Check backend server status
docker ps

# Restart backend server
cd apps/backend
go run cmd/main.go

# Verify backend URL in frontend
# Should be: http://localhost:8080
```

### Issue 2: Empty Data

**Symptoms**:
- Page loads but shows no data
- No errors in console

**Possible Causes**:
1. Database not seeded
2. No audit logs in database
3. Filters too restrictive

**Solutions**:
```bash
# Check database has data
# Use Prisma Studio or pgAdmin

# Seed database if needed
cd apps/backend
go run cmd/seed/main.go

# Clear all filters on page
```

### Issue 3: TypeScript Errors

**Symptoms**:
- Console errors about undefined properties
- Type errors in browser

**Possible Causes**:
1. Protobuf types not generated
2. Frontend not rebuilt after proto changes

**Solutions**:
```bash
# Regenerate proto files
./scripts/development/gen-proto-web.ps1

# Rebuild frontend
cd apps/frontend
pnpm build
pnpm dev:webpack
```

---

## ✅ Testing Completion Checklist

### Analytics Dashboard
- [ ] Page loads without errors
- [ ] Real data displays correctly
- [ ] Date range filtering works
- [ ] Charts render correctly
- [ ] Error handling works

### Dashboard Stats
- [ ] Stats cards display
- [ ] Numbers are real (not mock)
- [ ] Loading states work
- [ ] Error handling works

### Security Page
- [ ] Audit logs display
- [ ] Filtering works (action, resource, status)
- [ ] Security metrics accurate
- [ ] Error handling works

### Audit Trail Page
- [ ] Audit logs table displays
- [ ] Search functionality works
- [ ] All filters work (action, resource, success)
- [ ] Audit stats accurate
- [ ] Error handling works

### Overall
- [ ] No console errors on any page
- [ ] All pages load within 2 seconds
- [ ] All Vietnamese error messages display correctly
- [ ] All loading states display correctly
- [ ] All filters and search work correctly

---

## 📊 Testing Results Template

**Tester**: _______________  
**Date**: _______________  
**Environment**: Docker (PostgreSQL + Go Backend + Next.js Frontend)

| Test Case | Status | Notes |
|-----------|--------|-------|
| Analytics Dashboard - Page Load | ⬜ Pass / ⬜ Fail | |
| Analytics Dashboard - Data Display | ⬜ Pass / ⬜ Fail | |
| Analytics Dashboard - Filtering | ⬜ Pass / ⬜ Fail | |
| Analytics Dashboard - Error Handling | ⬜ Pass / ⬜ Fail | |
| Dashboard Stats - Display | ⬜ Pass / ⬜ Fail | |
| Dashboard Stats - Real-time Updates | ⬜ Pass / ⬜ Fail | |
| Dashboard Stats - Error Handling | ⬜ Pass / ⬜ Fail | |
| Security Page - Page Load | ⬜ Pass / ⬜ Fail | |
| Security Page - Audit Logs | ⬜ Pass / ⬜ Fail | |
| Security Page - Filtering | ⬜ Pass / ⬜ Fail | |
| Security Page - Metrics | ⬜ Pass / ⬜ Fail | |
| Audit Trail - Page Load | ⬜ Pass / ⬜ Fail | |
| Audit Trail - Table Display | ⬜ Pass / ⬜ Fail | |
| Audit Trail - Search | ⬜ Pass / ⬜ Fail | |
| Audit Trail - Filters | ⬜ Pass / ⬜ Fail | |
| Audit Trail - Stats | ⬜ Pass / ⬜ Fail | |

**Overall Result**: ⬜ All Pass / ⬜ Some Failures

**Issues Found**: _______________________________________________

---

**Document Status**: ✅ Complete  
**Next Step**: Execute manual testing and record results

