# Manual Testing Guide - Hydration Fix Verification

## 🎯 Mục đích
Verify rằng fix hydration mismatch trong Select components đã hoạt động đúng.

## 📋 Pre-requisites
- Dev server đang chạy tại `http://localhost:3000`
- Browser đã mở tại route `http://localhost:3000/3141592654/admin`

## ✅ Testing Steps

### Step 1: Kiểm tra Console Errors
1. Mở Chrome DevTools (F12)
2. Chuyển sang tab **Console**
3. Refresh page (Ctrl+R hoặc F5)
4. **Expected Result:**
   - ❌ KHÔNG còn error: `Hydration failed because the server rendered HTML didn't match the client`
   - ❌ KHÔNG còn warning về `data-placeholder` mismatch
   - ✅ Page load thành công không có hydration errors

### Step 2: Kiểm tra Select Components Rendering
1. Quan sát 2 Select dropdowns:
   - "Lọc theo vai trò"
   - "Lọc theo trạng thái"
2. **Expected Result:**
   - ✅ Cả 2 Select đều hiển thị với default value "Tất cả vai trò" và "Tất cả trạng thái"
   - ✅ Không có flash of content (FOUC)
   - ✅ Không có placeholder text hiển thị rồi biến mất

### Step 3: Test Filter Functionality - Role Filter
1. Click vào dropdown "Lọc theo vai trò"
2. Chọn "Tất cả vai trò"
3. Click button "Tìm kiếm"
4. **Expected Result:**
   - ✅ Hiển thị tất cả users (không filter theo role)
   
5. Click vào dropdown "Lọc theo vai trò"
6. Chọn "Admin"
7. Click button "Tìm kiếm"
8. **Expected Result:**
   - ✅ Chỉ hiển thị users có role Admin
   
9. Lặp lại với các roles khác: Teacher, Tutor, Student

### Step 4: Test Filter Functionality - Status Filter
1. Click vào dropdown "Lọc theo trạng thái"
2. Chọn "Tất cả trạng thái"
3. Click button "Tìm kiếm"
4. **Expected Result:**
   - ✅ Hiển thị tất cả users (không filter theo status)
   
5. Click vào dropdown "Lọc theo trạng thái"
6. Chọn "Active"
7. Click button "Tìm kiếm"
8. **Expected Result:**
   - ✅ Chỉ hiển thị users có status Active
   
9. Lặp lại với các statuses khác: Inactive, Suspended

### Step 5: Test Combined Filters
1. Chọn "Lọc theo vai trò" = "Student"
2. Chọn "Lọc theo trạng thái" = "Active"
3. Click button "Tìm kiếm"
4. **Expected Result:**
   - ✅ Chỉ hiển thị users có role Student VÀ status Active

5. Reset về "Tất cả vai trò" và "Tất cả trạng thái"
6. Click button "Tìm kiếm"
7. **Expected Result:**
   - ✅ Hiển thị lại tất cả users

### Step 6: Verify Network Requests
1. Mở Chrome DevTools tab **Network**
2. Filter by "Fetch/XHR"
3. Thực hiện filter với "Tất cả vai trò" và "Tất cả trạng thái"
4. Click "Tìm kiếm"
5. Kiểm tra request payload
6. **Expected Result:**
   - ✅ Request KHÔNG chứa `role` parameter (hoặc role=undefined)
   - ✅ Request KHÔNG chứa `status` parameter (hoặc status=undefined)

7. Thực hiện filter với "Admin" role
8. Click "Tìm kiếm"
9. Kiểm tra request payload
10. **Expected Result:**
    - ✅ Request chứa `role` parameter với giá trị tương ứng Admin role enum

### Step 7: Check React DevTools (Optional)
1. Mở React DevTools
2. Tìm component `ConnectedAdminDashboard`
3. Kiểm tra state:
   - `roleFilter`: Nên là `"all"` khi chọn "Tất cả vai trò"
   - `statusFilter`: Nên là `"all"` khi chọn "Tất cả trạng thái"
4. **Expected Result:**
   - ✅ State values đúng với selection
   - ✅ State update correctly khi thay đổi selection

## 🐛 Troubleshooting

### Nếu vẫn thấy hydration errors:
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Restart dev server:
   ```bash
   cd apps/frontend
   pnpm dev
   ```

### Nếu filter không hoạt động:
1. Kiểm tra Console có errors không
2. Kiểm tra Network tab xem request có được gửi không
3. Verify dev server đang chạy và không có errors

## ✅ Success Criteria

Tất cả các điều kiện sau phải đạt:
- [ ] Không có hydration errors trong Console
- [ ] Select components render correctly với default "all" values
- [ ] "Tất cả vai trò" filter shows all users
- [ ] "Tất cả trạng thái" filter shows all users
- [ ] Specific role filters work correctly
- [ ] Specific status filters work correctly
- [ ] Combined filters work correctly
- [ ] Network requests có correct parameters
- [ ] No TypeScript errors
- [ ] No runtime errors

## 📊 Expected vs Actual

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| No hydration errors | ✅ | ___ | ___ |
| Select default values | "all" | ___ | ___ |
| "Tất cả" filter | Show all | ___ | ___ |
| Specific role filter | Filtered | ___ | ___ |
| Specific status filter | Filtered | ___ | ___ |
| Combined filters | Filtered | ___ | ___ |
| Network request params | Correct | ___ | ___ |

## 📝 Notes

- Fix được implement trong file: `apps/frontend/src/components/admin/dashboard/connected-dashboard.tsx`
- Changes:
  - State initialization: `useState("all")` thay vì `useState(undefined)`
  - Select value props: Handle "all" case explicitly
  - Filter logic: Treat "all" as undefined khi gọi API

