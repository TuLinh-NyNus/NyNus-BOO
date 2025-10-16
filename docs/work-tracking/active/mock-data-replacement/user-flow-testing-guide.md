# User Authentication and Management Flow Testing Guide

## Mục tiêu
Test toàn bộ user authentication và management flow để verify rằng:
1. Login flow hoạt động với seeded users
2. User list pagination/filtering hoạt động
3. User details display correctly
4. User profile updates work
5. Role-based access control works
6. Không còn mock data nào được sử dụng

## Prerequisites

### 1. Database Seeded
```bash
# Verify database has seeded users
make db-shell
SELECT COUNT(*) FROM users;
-- Should return: 105 (5 default + 100 realistic)

SELECT role, COUNT(*) FROM users GROUP BY role;
-- Should show:
-- ADMIN: 10
-- TEACHER: 20
-- TUTOR: 10
-- STUDENT: 60
-- (Plus 5 default users)

\q
```

### 2. Backend Running
```bash
cd apps/backend
make dev

# Verify gRPC server is running
curl http://localhost:8080/health
# Should return: {"status":"ok"}
```

### 3. Frontend Running
```bash
cd apps/frontend
pnpm dev

# Verify frontend is running
curl http://localhost:3000
# Should return HTML
```

## Test Flow

### Test 1: Login with Seeded Users

#### Test 1.1: Login as Admin
**URL:** `http://localhost:3000/login`

**Credentials:**
- Email: `admin@exambank.com`
- Password: `admin123`

**Steps:**
1. Navigate to login page
2. Enter admin credentials
3. Click "Đăng nhập"
4. Observe network requests

**Expected Results:**
- ✅ gRPC call to `AuthService.login`
- ✅ JWT token received and stored in localStorage
- ✅ Redirect to admin dashboard `/3141592654/admin`
- ✅ No console errors
- ✅ User info displayed in header (Admin NyNus)

**Verification:**
```javascript
// In browser console
localStorage.getItem('nynus-auth-token');
// Should return: JWT token string
```

#### Test 1.2: Login as Teacher
**Credentials:**
- Email: `teacher1@nynus.edu.vn`
- Password: `NyNus@2025`

**Expected Results:**
- ✅ Login successful
- ✅ Redirect to teacher dashboard (if exists) or homepage
- ✅ Teacher role badge displayed

#### Test 1.3: Login as Student
**Credentials:**
- Email: `student1@nynus.edu.vn`
- Password: `NyNus@2025`

**Expected Results:**
- ✅ Login successful
- ✅ Redirect to student dashboard or homepage
- ✅ Student role badge displayed

#### Test 1.4: Invalid Credentials
**Credentials:**
- Email: `invalid@example.com`
- Password: `wrongpassword`

**Expected Results:**
- ✅ Login fails with error message
- ✅ Error toast: "Thông tin đăng nhập không chính xác"
- ✅ No redirect
- ✅ No token stored

### Test 2: User List Management (Admin Only)

**Prerequisites:** Logged in as admin

**URL:** `http://localhost:3000/3141592654/admin/users`

#### Test 2.1: View User List
**Steps:**
1. Navigate to admin users page
2. Observe user list

**Expected Results:**
- ✅ User list displays with real data
- ✅ Shows 25 users per page (default pagination)
- ✅ Total count shows 100+ users
- ✅ Users have realistic Vietnamese names
- ✅ Role badges display correctly (Admin, Teacher, Tutor, Student)
- ✅ Status badges display correctly (Active, Inactive, Suspended)
- ✅ No "mock data" indicators

#### Test 2.2: Pagination
**Steps:**
1. Click "Next Page" button
2. Observe page change
3. Click "Previous Page" button

**Expected Results:**
- ✅ Page number updates (1 → 2 → 1)
- ✅ User list updates with new data
- ✅ No duplicate users across pages
- ✅ gRPC call with updated page parameter
- ✅ Pagination controls update correctly

#### Test 2.3: Filter by Role
**Steps:**
1. Open filter panel
2. Select "STUDENT" role
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only students displayed
- ✅ Total count updates to ~60
- ✅ All users have "Student" role badge
- ✅ gRPC call with `filter.role = USER_ROLE_STUDENT`

#### Test 2.4: Filter by Status
**Steps:**
1. Select "ACTIVE" status filter
2. Click "Apply Filters"

**Expected Results:**
- ✅ Only active users displayed
- ✅ All users have green "Active" status badge
- ✅ gRPC call with `filter.status = USER_STATUS_ACTIVE`

#### Test 2.5: Search Users
**Steps:**
1. Type "Nguyễn" in search box
2. Wait for debounce (300ms)

**Expected Results:**
- ✅ Only users with "Nguyễn" in name/email displayed
- ✅ Search is case-insensitive
- ✅ gRPC call with `filter.search_query = "Nguyễn"`
- ✅ Results update in real-time

#### Test 2.6: Combined Filters
**Steps:**
1. Select "STUDENT" role
2. Select "ACTIVE" status
3. Type "Nguyễn" in search
4. Click "Apply Filters"

**Expected Results:**
- ✅ Only active students with "Nguyễn" in name displayed
- ✅ All filters applied correctly
- ✅ gRPC call with all filter parameters

### Test 3: User Detail View

**Prerequisites:** Logged in as admin, on users list page

#### Test 3.1: View User Details
**Steps:**
1. Click on any user in the list
2. Navigate to user detail page

**Expected Results:**
- ✅ User detail page loads
- ✅ gRPC call to `AdminService.getUser`
- ✅ User information displays correctly:
  - Name, email, role, status
  - Level, avatar
  - Email verified status
  - Active status
  - Created/updated dates
- ✅ No console errors
- ✅ No "undefined" or "null" values displayed

#### Test 3.2: View User Profile (if available)
**Steps:**
1. On user detail page
2. Observe profile section

**Expected Results:**
- ✅ Profile fields display (bio, phone, address, school)
- ✅ If fields are undefined, show placeholder or "Not set"
- ✅ No errors when profile data is missing

### Test 4: Update User Profile (Admin)

**Prerequisites:** Logged in as admin, on user detail page

#### Test 4.1: Edit User Information
**Steps:**
1. Click "Edit" button
2. Update first name to "Updated"
3. Update last name to "User"
4. Click "Save"

**Expected Results:**
- ✅ gRPC call to `AdminService.updateUser`
- ✅ Success toast: "Cập nhật thành công"
- ✅ User name updates in UI
- ✅ Changes persist after page refresh

#### Test 4.2: Update User Role
**Steps:**
1. Click "Edit" button
2. Change role from STUDENT to TUTOR
3. Click "Save"

**Expected Results:**
- ✅ gRPC call to `AdminService.updateUserRole`
- ✅ Success toast
- ✅ Role badge updates
- ✅ Changes persist

#### Test 4.3: Update User Status
**Steps:**
1. Click "Edit" button
2. Change status from ACTIVE to INACTIVE
3. Click "Save"

**Expected Results:**
- ✅ gRPC call to `AdminService.updateUserStatus`
- ✅ Success toast
- ✅ Status badge updates to "Inactive" (gray)
- ✅ Changes persist

### Test 5: Role-Based Access Control

#### Test 5.1: Admin Access
**Prerequisites:** Logged in as admin

**Steps:**
1. Navigate to `/3141592654/admin/users`
2. Try to view user list
3. Try to edit user

**Expected Results:**
- ✅ Full access granted
- ✅ Can view all users
- ✅ Can edit users
- ✅ Can delete users (if implemented)

#### Test 5.2: Teacher Access
**Prerequisites:** Logged in as teacher

**Steps:**
1. Try to navigate to `/3141592654/admin/users`

**Expected Results:**
- ✅ Access denied or redirect to homepage
- ✅ Error message: "Bạn không có quyền truy cập"
- ✅ No user list displayed

#### Test 5.3: Student Access
**Prerequisites:** Logged in as student

**Steps:**
1. Try to navigate to `/3141592654/admin/users`

**Expected Results:**
- ✅ Access denied or redirect to homepage
- ✅ Error message displayed
- ✅ No admin features accessible

### Test 6: Verify No Mock Data Usage

#### Test 6.1: Check Network Requests
**Steps:**
1. Open DevTools Network tab
2. Navigate to users page
3. Filter by "grpc" or "api"

**Expected Results:**
- ✅ All requests go to `http://localhost:8080`
- ✅ No requests to mock endpoints
- ✅ All responses are real gRPC data

#### Test 6.2: Check Console Logs
**Steps:**
1. Open DevTools Console
2. Search for "mock"

**Expected Results:**
- ✅ No logs mentioning "mock data"
- ✅ No "Đang sử dụng dữ liệu mẫu" messages
- ✅ No mock-related warnings

#### Test 6.3: Check Page Source
**Steps:**
1. View page source (Ctrl+U)
2. Search for "mockdata"

**Expected Results:**
- ✅ No imports from `@/lib/mockdata`
- ✅ No mock function calls
- ✅ Only gRPC service imports

## Success Criteria

All tests pass if:

- ✅ Login works with all seeded user roles
- ✅ User list displays real data from database
- ✅ Pagination works correctly
- ✅ Filtering works correctly (role, status, search)
- ✅ User detail page displays correctly
- ✅ User updates work (name, role, status)
- ✅ Role-based access control works
- ✅ No mock data is used anywhere
- ✅ No console errors
- ✅ All gRPC calls succeed

## Common Issues & Solutions

### Issue 1: Login Fails
**Cause:** Backend not running or wrong credentials

**Solution:**
```bash
# Check backend
curl http://localhost:8080/health

# Verify user exists
make db-shell
SELECT * FROM users WHERE email = 'admin@exambank.com';
\q
```

### Issue 2: Empty User List
**Cause:** Database not seeded

**Solution:**
```bash
make seed
```

### Issue 3: 403 Forbidden
**Cause:** JWT token expired or invalid

**Solution:**
```javascript
// Clear token and re-login
localStorage.removeItem('nynus-auth-token');
// Navigate to /login
```

### Issue 4: gRPC Connection Error
**Cause:** Backend not running

**Solution:**
```bash
cd apps/backend
make dev
```

## Next Steps

After all tests pass:
1. Document any bugs found
2. Create bug fix tasks
3. Move to next mock data replacement task (Questions)
4. Update documentation

