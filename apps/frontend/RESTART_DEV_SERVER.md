# Hướng dẫn Restart Frontend Dev Server

## ⚠️ QUAN TRỌNG: Phải restart sau khi sửa code

Sau khi sửa code trong **3 files sau**, bạn **PHẢI restart** frontend dev server để code mới được compile và load:

1. `apps/frontend/src/contexts/admin-stats-context.tsx`
2. `apps/frontend/src/hooks/admin/use-admin-sidebar-badges.ts`
3. `apps/frontend/src/hooks/admin/use-admin-notifications.ts`

## 🔄 Cách Restart

### Option 1: Dừng và khởi động lại

1. Nhấn `Ctrl + C` trong terminal đang chạy `pnpm dev`
2. Chạy lại: `pnpm dev`

### Option 2: Sử dụng Script

```powershell
# Từ thư mục root
cd apps/frontend
pnpm dev
```

### Option 3: Kill process và restart

```powershell
# Tìm và kill process Next.js
Get-Process node | Where-Object {$_.Path -like "*exam-bank-system*"} | Stop-Process -Force

# Khởi động lại
cd apps/frontend
pnpm dev
```

## 🧪 Kiểm tra sau khi restart

1. **Mở DevTools Console** (`F12` → Console tab)
2. **Reload trang admin**: `http://localhost:3000/3141592654/admin`
3. **Xem logs**: Bạn sẽ thấy các logs mới:
   ```
   [AdminStatsContext] Mount effect triggered
   [AdminStatsContext] Setting up debounced fetch (500ms delay for React Strict Mode)
   [AdminStatsContext] Executing debounced initial fetch NOW
   [AdminStatsContext] Fetching system stats from backend
   [AdminStatsContext] System stats fetched successfully
   ```

4. **Kiểm tra Network tab**: Chỉ nên có **1 request** đến `GetSystemStats`

5. **Không còn lỗi rate limit** trong console

## 📊 Debug Logs

Các logs mới được thêm để debug:

- ✅ **Mount tracking**: Thấy khi component mount/unmount
- ✅ **Debounce tracking**: Thấy timer được setup và trigger
- ✅ **Fetch tracking**: Thấy khi nào fetch được gọi
- ✅ **React Strict Mode detection**: Thấy khi second render bị skip

## ❌ Nếu vẫn gặp lỗi

### Bước 1: Clear cache

```powershell
# Xóa .next folder
cd apps/frontend
Remove-Item -Recurse -Force .next
pnpm dev
```

### Bước 2: Clear browser cache

- Nhấn `Ctrl + Shift + Delete`
- Chọn "Cached images and files"
- Clear

### Bước 3: Hard reload

- Nhấn `Ctrl + Shift + R` (hoặc `Cmd + Shift + R` trên Mac)
- Hoặc DevTools → Right-click Reload button → "Empty Cache and Hard Reload"

### Bước 4: Kiểm tra rate limit backend

Nếu vẫn gặp rate limit sau khi đã làm tất cả các bước trên, có thể cần tăng rate limit ở backend:

File: `apps/backend/internal/middleware/rate_limit_interceptor.go`

```go
"/v1.AdminService/GetSystemStats": {
    RequestsPerSecond: 50, // Tăng từ 30 lên 50
    Burst:             100, // Tăng từ 50 lên 100
    PerUser:           true,
},
```

Sau đó restart backend:
```powershell
cd apps/backend
go run cmd/server/main.go
```

## ✅ Kết quả mong đợi

- ✅ Không còn lỗi "rate limit exceeded"
- ✅ AdminSidebar load badges thành công
- ✅ Console logs cho thấy chỉ 1 fetch duy nhất
- ✅ Network tab cho thấy 1 request duy nhất đến GetSystemStats
- ✅ Page load nhanh hơn (vì ít requests hơn)

---

**Last Updated**: 2025-10-27  
**Related Files**: 
- `apps/frontend/src/contexts/admin-stats-context.tsx`
- `apps/frontend/src/hooks/admin/use-admin-sidebar-badges.ts`
- `apps/frontend/docs/RATE_LIMIT_FIX.md`

