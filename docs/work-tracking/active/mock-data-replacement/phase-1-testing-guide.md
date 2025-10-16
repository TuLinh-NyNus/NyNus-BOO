# Phase 1 Testing Guide - Users Mock Data Replacement

## Mục tiêu
Verify rằng admin user management pages đã chuyển từ mock data sang real gRPC data thành công.

## Prerequisites

### 1. Database Seeding
```bash
# Start database
make db-up

# Run migrations
make migrate

# Seed realistic user data (100+ users)
make seed
```

**Expected Output:**
```
🌱 Seeding default data...
👥 Seeding default users...
   ✅ Created user: admin@exambank.com (ADMIN)
   ✅ Created user: teacher@exambank.com (TEACHER)
   ✅ Created user: tutor@exambank.com (TUTOR)
   ✅ Created user: student@exambank.com (STUDENT)
   ✅ Created user: demo.student@exambank.com (STUDENT)
👥 Seeding realistic users...
   ✅ Inserted users 1-20
   ✅ Inserted users 21-40
   ...
   ✅ Inserted users 81-100
✅ Successfully seeded 100 realistic users
✅ Default data seeding completed
```

### 2. Backend Running
```bash
# Start backend gRPC server
cd apps/backend
make dev
```

**Expected Output:**
```
🚀 Starting gRPC server on :50051
🌐 Starting HTTP gateway on :8080
✅ Server started successfully
```

### 3. Frontend Running
```bash
# Start frontend Next.js app
cd apps/frontend
pnpm dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

## Test Cases

### Test 1: User List Page Load
**URL:** `http://localhost:3000/3141592654/admin/users`

**Steps:**
1. Navigate to admin users page
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page

**Expected Results:**
- ✅ Page loads without errors
- ✅ User list displays with real data (not mock)
- ✅ Network tab shows gRPC call to `AdminService.listUsers`
- ✅ No console errors
- ✅ Users have realistic Vietnamese names (Nguyễn Văn A, Trần Thị B, etc.)
- ✅ Pagination shows correct total count (100+ users)

**Verification:**
```javascript
// In browser console
console.log('Total users:', document.querySelector('[data-total-users]')?.textContent);
// Should show: "100+" or actual count from database
```

### Test 2: Pagination
**Steps:**
1. On user list page
2. Click "Next Page" button
3. Observe network requests
4. Click "Previous Page" button

**Expected Results:**
- ✅ Page changes correctly
- ✅ New gRPC call to `AdminService.listUsers` with updated page number
- ✅ User list updates with new data
- ✅ No duplicate users across pages
- ✅ Pagination controls update correctly (page 1/10, 2/10, etc.)

### Test 3: Filtering by Role
**Steps:**
1. On user list page
2. Open filter panel
3. Select "STUDENT" role filter
4. Click "Apply Filters"

**Expected Results:**
- ✅ gRPC call with `filter.role = USER_ROLE_STUDENT`
- ✅ Only students displayed in list
- ✅ Total count updates to show filtered count
- ✅ All displayed users have role badge "Student"

### Test 4: Filtering by Status
**Steps:**
1. Open filter panel
2. Select "ACTIVE" status filter
3. Click "Apply Filters"

**Expected Results:**
- ✅ gRPC call with `filter.status = USER_STATUS_ACTIVE`
- ✅ Only active users displayed
- ✅ All displayed users have status badge "Active" (green)

### Test 5: Search Functionality
**Steps:**
1. Type "Nguyễn" in search box
2. Wait for debounce (300ms)
3. Observe results

**Expected Results:**
- ✅ gRPC call with `filter.search_query = "Nguyễn"`
- ✅ Only users with "Nguyễn" in name/email displayed
- ✅ Search is case-insensitive
- ✅ Results update in real-time

### Test 6: User Detail Page
**URL:** `http://localhost:3000/3141592654/admin/users/[user-id]`

**Steps:**
1. Click on any user in the list
2. Navigate to user detail page
3. Observe network requests

**Expected Results:**
- ✅ gRPC call to `AdminService.getUser` with user_id
- ✅ User details display correctly:
  - Name, email, role, status
  - Level, avatar
  - Email verified status
  - Active status
- ✅ No console errors
- ✅ Edit form populated with user data

### Test 7: User Stats Loading
**Steps:**
1. On user list page
2. Observe stats cards at top of page

**Expected Results:**
- ✅ gRPC call to `AdminService.getSystemStats`
- ✅ Stats display correctly:
  - Total Users: 100+
  - Active Users: ~90
  - Role distribution (Admin: 10, Teacher: 20, Tutor: 10, Student: 60)
  - Total Sessions, Active Sessions
- ✅ No "0" values (unless actually 0)

### Test 8: No Mock Data Fallback
**Steps:**
1. Search browser console for "mock"
2. Search network tab for "mock"
3. Check page source for mock imports

**Expected Results:**
- ✅ No console logs mentioning "mock data"
- ✅ No "Đang sử dụng dữ liệu mẫu (Mock Data)" toast
- ✅ No imports from `@/lib/mockdata` in page source
- ✅ All data comes from gRPC calls

## Network Request Verification

### AdminService.listUsers Request
```json
{
  "pagination": {
    "page": 1,
    "limit": 25
  },
  "filter": {
    "role": "USER_ROLE_STUDENT",
    "status": "USER_STATUS_ACTIVE",
    "search_query": "Nguyễn"
  }
}
```

### AdminService.listUsers Response
```json
{
  "success": true,
  "users": [
    {
      "id": "01JKXXX...",
      "email": "student1@nynus.edu.vn",
      "first_name": "Nguyễn",
      "last_name": "Văn A",
      "role": "USER_ROLE_STUDENT",
      "level": 5,
      "username": "student_001",
      "avatar": "/avatars/student-001.svg",
      "status": "USER_STATUS_ACTIVE",
      "email_verified": true,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total_count": 60,
    "total_pages": 3
  }
}
```

## Common Issues & Solutions

### Issue 1: "Failed to load users" Error
**Cause:** Backend not running or database not seeded

**Solution:**
```bash
# Check backend is running
curl http://localhost:8080/health

# Check database has users
make db-shell
SELECT COUNT(*) FROM users;
\q

# Re-seed if needed
make seed
```

### Issue 2: Empty User List
**Cause:** Database not seeded or migration not run

**Solution:**
```bash
make migrate
make seed
```

### Issue 3: gRPC Connection Error
**Cause:** Backend not running or wrong port

**Solution:**
```bash
# Check backend logs
cd apps/backend
make dev

# Verify gRPC port
netstat -an | grep 50051
```

### Issue 4: Type Errors in Console
**Cause:** Protobuf types mismatch

**Solution:**
```bash
# Regenerate protobuf code
cd packages/proto
buf generate

# Restart frontend
cd apps/frontend
pnpm dev
```

## Success Criteria

Phase 1 is considered successful if:

- ✅ All 8 test cases pass
- ✅ No mock data imports in user management pages
- ✅ All data comes from gRPC AdminService
- ✅ Pagination works correctly
- ✅ Filtering works correctly
- ✅ Search works correctly
- ✅ User detail page works correctly
- ✅ No console errors
- ✅ No "mock data" toast messages

## Next Steps

After Phase 1 completion:
- **Phase 2:** Add ProfileService integration for nested objects (profile, stats)
- **Phase 3:** Implement backend aggregation for user stats
- **Phase 4:** Remove all mock data files
- **Phase 5:** Update documentation

