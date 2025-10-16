# Nested Objects Testing Guide

## 📋 Overview
Testing guide để verify AdminUser.stats và AdminUser.profile được hiển thị correctly sau khi implement nested objects solution.

## ✅ Prerequisites

### 1. Backend Running
```bash
# Start backend server
cd apps/backend
go run cmd/main.go
```

### 2. Frontend Running
```bash
# Start frontend dev server
cd apps/frontend
pnpm dev
```

### 3. Database Seeded
```bash
# Ensure realistic users are seeded
cd apps/backend
go run cmd/main.go seed
```

---

## 🧪 Test Cases

### Test Case 1: User List Page - Stats Display

**Location**: `apps/frontend/src/app/3141592654/admin/users/page.tsx`

**Steps**:
1. Navigate to `/3141592654/admin/users`
2. Login as admin user
3. Observe user list table

**Expected Results**:
- ✅ User list loads successfully
- ✅ No console errors
- ✅ Stats columns display (if implemented in table)
- ✅ No "undefined" or "null" values

**Actual Results** (To be filled during testing):
- [ ] User list loads: ___
- [ ] Console errors: ___
- [ ] Stats display: ___

---

### Test Case 2: User Detail Modal - Stats Section

**Location**: `apps/frontend/src/components/admin/users/modals/user-detail-modal.tsx` (Lines 769-820)

**Steps**:
1. Navigate to `/3141592654/admin/users`
2. Click on any user row to open detail modal
3. Scroll to "Thống kê học tập" section

**Expected Results**:
- ✅ Modal opens successfully
- ✅ Stats section is visible
- ✅ **Tổng bài kiểm tra**: Shows number (not 0 or N/A)
- ✅ **Tổng khóa học**: Shows number (not 0 or N/A)
- ✅ **Tổng bài học**: Shows number (not 0 or N/A)
- ✅ **Điểm trung bình**: Shows number or N/A (acceptable if no exams)
- ✅ **Tỷ lệ hoàn thành**: Shows percentage bar (if profile.completionRate exists)

**Current Behavior** (Before Fix):
- ❌ All stats show 0
- ❌ Average score shows "N/A"
- ❌ Completion rate bar not displayed

**Expected Behavior** (After Fix):
- ✅ Stats show actual values from database
- ✅ If no data exists, shows 0 (acceptable)
- ✅ Completion rate bar displays if > 0

**Actual Results** (To be filled during testing):
- [ ] Total exam results: ___
- [ ] Total courses: ___
- [ ] Total lessons: ___
- [ ] Average score: ___
- [ ] Completion rate: ___

---

### Test Case 3: User Detail Page - Stats Card

**Location**: `apps/frontend/src/app/3141592654/admin/users/[id]/page.tsx` (Lines 340-375)

**Steps**:
1. Navigate to `/3141592654/admin/users/[user-id]`
2. Observe "Thống kê" card on the right side

**Expected Results**:
- ✅ Stats card is visible
- ✅ **Khóa học đã tạo**: Shows number (not 0)
- ✅ **Tổng bài học**: Shows number (not 0)
- ✅ **Kết quả thi**: Shows number (not 0)
- ✅ **Tỷ lệ hoàn thành**: Shows percentage (not 0%)

**Current Behavior** (Before Fix):
- ❌ All stats show 0
- ❌ Completion rate shows 0%

**Expected Behavior** (After Fix):
- ✅ Stats show actual values from database
- ✅ If no data exists, shows 0 (acceptable)

**Actual Results** (To be filled during testing):
- [ ] Courses created: ___
- [ ] Total lessons: ___
- [ ] Exam results: ___
- [ ] Completion rate: ___

---

### Test Case 4: Profile Data Display

**Location**: User detail modal - Profile section

**Steps**:
1. Open user detail modal
2. Scroll to "Thông tin cá nhân" section

**Expected Results**:
- ✅ **Tiểu sử (Bio)**: Shows user bio (if exists)
- ✅ **Số điện thoại**: Shows phone number (if exists)
- ✅ **Địa chỉ**: Shows address (if exists)
- ✅ **Trường học**: Shows school (if exists)

**Current Behavior** (Before Fix):
- ❌ All profile fields empty or undefined

**Expected Behavior** (After Fix):
- ✅ Profile fields show data from users table
- ✅ Empty fields show placeholder or "Chưa cập nhật"

**Actual Results** (To be filled during testing):
- [ ] Bio displayed: ___
- [ ] Phone displayed: ___
- [ ] Address displayed: ___
- [ ] School displayed: ___

---

### Test Case 5: Different User Roles

**Steps**:
1. Test with ADMIN user
2. Test with TEACHER user
3. Test with STUDENT user
4. Test with TUTOR user

**Expected Results**:
- ✅ All user roles display stats correctly
- ✅ Stats values differ based on user activity
- ✅ No role-specific errors

**Actual Results** (To be filled during testing):
- [ ] Admin stats: ___
- [ ] Teacher stats: ___
- [ ] Student stats: ___
- [ ] Tutor stats: ___

---

### Test Case 6: Network Request Verification

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "grpc" or "admin"
4. Navigate to user list page
5. Observe network requests

**Expected Results**:
- ✅ AdminService.listUsers() request sent
- ✅ Response includes `stats` and `profile` fields
- ✅ Response status: 200 OK
- ✅ No errors in response

**Verification**:
```javascript
// In browser console, inspect response
// Response should have structure:
{
  "users": [
    {
      "id": "...",
      "email": "...",
      // ... other fields ...
      "stats": {
        "totalExamResults": 0,
        "totalCourses": 0,
        "totalLessons": 0,
        "averageScore": 0,
        "completedCourses": 0,
        "activeSessionsCount": 0
      },
      "profile": {
        "bio": "...",
        "phoneNumber": "...",
        "address": "...",
        "school": "...",
        "completionRate": 0
      }
    }
  ]
}
```

**Actual Results** (To be filled during testing):
- [ ] Request sent: ___
- [ ] Stats in response: ___
- [ ] Profile in response: ___
- [ ] Response status: ___

---

## 🐛 Known Issues & Workarounds

### Issue 1: TypeScript Protobuf Not Regenerated
**Symptom**: Frontend code uses `any` type assertions for stats/profile  
**Impact**: No TypeScript type checking for nested objects  
**Workaround**: Runtime checks with optional chaining (`?.`)  
**Fix**: Regenerate TypeScript protobuf with PowerShell script

### Issue 2: Zero Stats Values
**Symptom**: All stats show 0  
**Cause**: exam_attempts and course_enrollments tables may be empty  
**Workaround**: Acceptable - shows 0 when no data exists  
**Fix**: Seed exam and course data (future task)

### Issue 3: Profile Fields Empty
**Symptom**: Bio, phone, address, school are empty  
**Cause**: Seeded users may not have profile data  
**Workaround**: Update seeder to include profile data  
**Fix**: Update user_seeder.go to populate profile fields

---

## ✅ Success Criteria

### Must Have
- [x] Backend compiles without errors
- [x] Frontend compiles without errors
- [ ] User list page loads without errors
- [ ] User detail modal opens without errors
- [ ] Stats section is visible (even if values are 0)
- [ ] Profile section is visible (even if fields are empty)
- [ ] No console errors related to stats/profile

### Should Have
- [ ] Stats show non-zero values (if data exists)
- [ ] Profile fields show data (if data exists)
- [ ] Network response includes stats and profile
- [ ] TypeScript types are correct (after protobuf regeneration)

### Nice to Have
- [ ] Stats update in real-time
- [ ] Profile data is editable
- [ ] Completion rate bar animates

---

## 📝 Testing Checklist

- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] Database seeded with realistic users
- [ ] Test Case 1: User list page
- [ ] Test Case 2: User detail modal stats
- [ ] Test Case 3: User detail page stats
- [ ] Test Case 4: Profile data display
- [ ] Test Case 5: Different user roles
- [ ] Test Case 6: Network request verification
- [ ] Document actual results
- [ ] Report any bugs found
- [ ] Update task status

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend should log stats/profile queries
# Look for:
# - "Warning: Failed to get user stats"
# - "Warning: Failed to get user profiles"
```

### Check Frontend Console
```javascript
// In browser console, inspect user object
console.log(users[0].stats);
console.log(users[0].profile);
```

### Check Database
```sql
-- Verify users have profile data
SELECT id, email, bio, phone, address, school FROM users LIMIT 5;

-- Check if exam_attempts table exists
SELECT COUNT(*) FROM exam_attempts;

-- Check if course_enrollments table exists
SELECT COUNT(*) FROM course_enrollments;
```

---

## 📊 Test Results Summary

**Date**: ___________  
**Tester**: ___________  
**Environment**: Development

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: User List | ⏳ | |
| TC2: Detail Modal Stats | ⏳ | |
| TC3: Detail Page Stats | ⏳ | |
| TC4: Profile Data | ⏳ | |
| TC5: User Roles | ⏳ | |
| TC6: Network Request | ⏳ | |

**Overall Status**: ⏳ Pending Testing

**Blockers**: None

**Next Steps**: 
1. Run all test cases
2. Document actual results
3. Report bugs if found
4. Update task status to COMPLETE if all tests pass

