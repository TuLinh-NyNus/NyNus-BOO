# Phase 7: Real Analytics Data Testing Guide

## Executive Summary

**Purpose**: Comprehensive guide for testing analytics dashboard with real data from Docker PostgreSQL database  
**Date**: 2025-01-19  
**Prerequisites**: Phase 7 Subtasks 7.1-7.4 completed (protobuf generation fixed, mock data removed)

## Testing Environment Setup

### Step 1: Start Docker Database (5 minutes)

```powershell
# Navigate to project root
cd d:\exam-bank-system

# Start PostgreSQL container
docker-compose -f docker/compose/docker-compose.yml up -d postgres

# Wait for database to be ready (check health)
docker-compose -f docker/compose/docker-compose.yml ps postgres

# Expected output:
# NAME                  STATUS              PORTS
# exam_bank_postgres    Up (healthy)        0.0.0.0:5432->5432/tcp
```

**Verification**:
```powershell
# Test database connection
docker exec -it exam_bank_postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT version();"

# Should show: PostgreSQL 15.x
```

### Step 2: Seed Database with Test Data (3 minutes)

```powershell
# Run Prisma seed script
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.seed.yml run --rm seed

# Expected output:
# 📦 Installing dependencies...
# ⚙️  Generating Prisma Client...
# 🌱 Running database seed...
# ✅ Seed completed successfully!
```

**What gets seeded**:
- **Users**: 3 admins, 4 teachers, 100 students
- **Questions**: Sample questions with different difficulties
- **Exams**: Sample exams with attempts
- **Sessions**: User sessions and activity logs
- **Notifications**: Sample notifications

**Verification**:
```powershell
# Check seeded data
docker exec -it exam_bank_postgres psql -U exam_bank_user -d exam_bank_db

# Run queries:
SELECT COUNT(*) FROM users;           -- Should show ~107 users
SELECT COUNT(*) FROM questions;       -- Should show sample questions
SELECT COUNT(*) FROM exam_attempts;   -- Should show sample attempts
\q
```

### Step 3: Start Backend Go Server (2 minutes)

```powershell
# Navigate to backend directory
cd apps/backend

# Install Go dependencies (first time only)
go mod download

# Start gRPC server
go run cmd/main.go

# Expected output:
# 🚀 Starting NyNus Exam Bank System...
# ✅ Environment variables loaded from .env file
# ✅ Configuration loaded successfully
# ✅ Connected to PostgreSQL: exam_bank_user@localhost:5432/exam_bank_db
# 🔄 Running database migrations...
# ✅ Migrations completed
# 🌱 Seeding default data...
# ✅ Default data seeded
# 🌐 HTTP Gateway + gRPC-Web enabled on port 8080
# 🚀 Starting gRPC server on port 50051...
```

**Verification**:
```powershell
# Test gRPC server health (in new terminal)
curl http://localhost:8080/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-19T..."}
```

### Step 4: Start Frontend Next.js Server (2 minutes)

```powershell
# Navigate to frontend directory (in new terminal)
cd apps/frontend

# Install dependencies (first time only)
pnpm install

# Start development server
pnpm dev

# Expected output:
# ▲ Next.js 15.4.7
# - Local:        http://localhost:3000
# - Environments: .env.local
# ✓ Ready in 2.5s
```

**Verification**:
```powershell
# Open browser
start http://localhost:3000

# Should see NyNus homepage
```

## Testing Checklist

### Test 1: Analytics Dashboard Page Load (5 minutes)

**URL**: `http://localhost:3000/3141592654/admin/analytics`

**Steps**:
1. Navigate to analytics dashboard
2. Observe loading state (spinner should appear)
3. Wait for data to load (should take 1-3 seconds)
4. Verify no errors in browser console

**Expected Results**:
- ✅ Page loads without errors
- ✅ Loading spinner displays during data fetch
- ✅ Data loads from backend (check Network tab)
- ✅ No console errors

**Browser DevTools Verification**:
```javascript
// Open DevTools (F12) → Network tab
// Filter: "analytics"
// Should see:
// Request URL: http://localhost:8080/v1.AdminService/GetAnalytics
// Request Method: POST
// Status: 200 OK
// Response: {success: true, analytics: {...}}
```

### Test 2: Date Range Filtering (10 minutes)

**Test Cases**:

| Date Range | Expected Behavior |
|------------|-------------------|
| **7 ngày qua** | Shows data from last 7 days |
| **30 ngày qua** | Shows data from last 30 days (default) |
| **90 ngày qua** | Shows data from last 90 days |
| **12 tháng qua** | Shows data from last 12 months |

**Steps for Each Test Case**:
1. Select date range from dropdown
2. Observe loading state
3. Verify gRPC call in Network tab
4. Check data updates correctly

**Verification**:
```javascript
// DevTools → Network → GetAnalytics request
// Check Request Payload:
{
  "start_date": "2025-01-12T00:00:00.000Z",  // 7 days ago
  "end_date": "2025-01-19T23:59:59.999Z"     // today
}

// Check Response:
{
  "success": true,
  "analytics": {
    "user_growth": [...],  // Data points within date range
    "question_stats": {...},
    "exam_stats": {...}
  }
}
```

### Test 3: Overview Metrics Display (5 minutes)

**Metrics to Verify**:

| Metric | Source | Expected Value |
|--------|--------|----------------|
| **Người dùng** | `user_growth` sum | ~107 (from seed data) |
| **Câu hỏi** | `question_stats.total_questions` | Sample count |
| **Bài thi** | `exam_stats.total_attempts` | Sample count |
| **Tỷ lệ đạt** | `exam_stats.pass_rate` | Percentage (0-100) |

**Steps**:
1. Check each metric card displays correct data
2. Verify trend indicators (↑ or ↓)
3. Check timeframe labels match selected range

**Expected Results**:
- ✅ All metrics display real numbers (not 0 or mock data)
- ✅ Trend indicators show (may be static if no historical data)
- ✅ Timeframe labels correct ("7 ngày qua", "30 ngày qua", etc.)

### Test 4: Charts Rendering (5 minutes)

**Charts to Verify**:

1. **User Growth Chart** (Line chart)
   - X-axis: Dates
   - Y-axis: User count
   - Data: `analytics.user_growth` array

2. **Question Usage Chart** (Bar chart)
   - Shows top questions by usage
   - Data: `analytics.question_stats.top_questions`

3. **Exam Performance Chart** (Area chart)
   - Shows exam attempts over time
   - Data: `analytics.exam_stats`

**Steps**:
1. Scroll to charts section
2. Verify charts render (not placeholder text)
3. Check data points match backend response
4. Test chart interactions (hover, zoom if available)

**Expected Results**:
- ✅ Charts display real data (not "Biểu đồ sẽ được hiển thị ở đây")
- ✅ Data points match backend response
- ✅ Charts are interactive (tooltips on hover)

### Test 5: Error Handling (10 minutes)

**Test Case 1: Backend Unavailable**

**Steps**:
1. Stop backend server (`Ctrl+C` in backend terminal)
2. Refresh analytics page
3. Observe error handling

**Expected Results**:
- ✅ Error message displays in Vietnamese
- ✅ Toast notification shows: "Lỗi tải dữ liệu"
- ✅ No crash or blank page
- ✅ Retry button available (if implemented)

**Test Case 2: Invalid Date Range**

**Steps**:
1. Modify date range in DevTools console:
   ```javascript
   // Simulate invalid date range
   fetch('http://localhost:8080/v1.AdminService/GetAnalytics', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       start_date: 'invalid-date',
       end_date: '2025-01-19T00:00:00Z'
     })
   })
   ```
2. Observe error handling

**Expected Results**:
- ✅ Backend returns error response
- ✅ Frontend displays error message
- ✅ Page doesn't crash

### Test 6: Performance Testing (5 minutes)

**Metrics to Measure**:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Initial Load Time** | < 2s | DevTools → Performance tab |
| **gRPC Call Time** | < 500ms | DevTools → Network tab |
| **Chart Render Time** | < 1s | Visual observation |
| **Date Range Switch** | < 1s | Visual observation |

**Steps**:
1. Open DevTools → Performance tab
2. Click "Record"
3. Navigate to analytics page
4. Stop recording after page loads
5. Analyze timeline

**Expected Results**:
- ✅ Total load time < 2 seconds
- ✅ gRPC call completes < 500ms
- ✅ No performance warnings in console
- ✅ Smooth animations and transitions

## Troubleshooting

### Issue 1: Database Connection Failed

**Symptoms**:
- Backend logs: `failed to connect to database`
- Frontend shows: "Service temporarily unavailable"

**Solution**:
```powershell
# Check database status
docker-compose -f docker/compose/docker-compose.yml ps postgres

# If not running, start it
docker-compose -f docker/compose/docker-compose.yml up -d postgres

# Wait for health check
docker-compose -f docker/compose/docker-compose.yml ps postgres
```

### Issue 2: gRPC Call Returns Empty Data

**Symptoms**:
- Network tab shows 200 OK
- Response: `{success: true, analytics: null}`

**Solution**:
```powershell
# Check if database has data
docker exec -it exam_bank_postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT COUNT(*) FROM users;"

# If count is 0, re-run seed
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.seed.yml run --rm seed
```

### Issue 3: CORS Errors

**Symptoms**:
- Console error: `Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
```powershell
# Check backend CORS configuration
# In apps/backend/internal/server/http.go, verify CORS headers are set

# Restart backend server
cd apps/backend
go run cmd/main.go
```

### Issue 4: TypeScript Errors

**Symptoms**:
- Frontend build fails
- Error: `Cannot find name 'GetAnalyticsRequest'`

**Solution**:
```powershell
# Regenerate protobuf types
powershell -ExecutionPolicy Bypass -File scripts/development/gen-proto-web.ps1

# Verify types generated
ls apps/frontend/src/generated/v1/admin_pb.d.ts

# Restart frontend
cd apps/frontend
pnpm dev
```

## Success Criteria

### ✅ All Tests Pass

- [ ] Analytics dashboard loads without errors
- [ ] Date range filtering works (7d, 30d, 90d, 12m)
- [ ] Overview metrics display real data
- [ ] Charts render with real data
- [ ] Error handling works correctly
- [ ] Performance meets targets (< 2s load, < 500ms gRPC)

### ✅ No Mock Data References

- [ ] No `mockAnalytics` in console logs
- [ ] No hardcoded test data in UI
- [ ] All data comes from backend gRPC calls

### ✅ Code Quality

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Clean Network tab (no failed requests)
- [ ] Proper loading states

## Next Steps After Testing

1. **If all tests pass**:
   - Mark Subtask 7.5 as COMPLETE
   - Mark Phase 7 as COMPLETE
   - Move to Phase 8 (if applicable)

2. **If tests fail**:
   - Document failures in issue tracker
   - Create fix tasks
   - Re-test after fixes

3. **Performance optimization** (if needed):
   - Add caching for analytics data
   - Implement pagination for large datasets
   - Optimize database queries

## Appendix: Quick Commands Reference

```powershell
# Start all services
docker-compose -f docker/compose/docker-compose.yml up -d postgres
cd apps/backend && go run cmd/main.go &
cd apps/frontend && pnpm dev &

# Stop all services
docker-compose -f docker/compose/docker-compose.yml down
# Kill Go and Node processes manually

# Check service status
docker-compose -f docker/compose/docker-compose.yml ps
curl http://localhost:8080/health
curl http://localhost:3000

# View logs
docker-compose -f docker/compose/docker-compose.yml logs -f postgres
# Backend logs in terminal
# Frontend logs in terminal

# Reset database
docker-compose -f docker/compose/docker-compose.yml down -v
docker-compose -f docker/compose/docker-compose.yml up -d postgres
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.seed.yml run --rm seed
```

---

**Testing Guide Version**: 1.0.0  
**Last Updated**: 2025-01-19  
**Status**: Ready for Manual Testing

