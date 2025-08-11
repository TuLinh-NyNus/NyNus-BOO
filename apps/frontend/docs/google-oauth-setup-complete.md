# 🔐 Google OAuth Setup - Complete Guide

## ✅ Vấn đề đã được giải quyết

**Lỗi trước đó**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Nguyên nhân**: Thiếu API route handler cho NextAuth.js

**Giải pháp đã thực hiện**:
1. ✅ Tạo file `src/app/api/auth/[...nextauth]/route.ts`
2. ✅ Cập nhật cấu hình NextAuth.js để handle missing credentials
3. ✅ Tạm thời disable Google OAuth để tránh lỗi
4. ✅ Tạo trang test để verify NextAuth.js hoạt động

## 🚀 Để enable Google OAuth

### Bước 1: Tạo Google OAuth Credentials

1. **Truy cập Google Cloud Console**:
   - Đi tới: https://console.cloud.google.com/
   - Đăng nhập với tài khoản Google

2. **Tạo hoặc chọn Project**:
   - Tạo project mới hoặc chọn project hiện có
   - Tên project: `nynus-auth` (hoặc tên bạn muốn)

3. **Enable APIs**:
   - Vào "APIs & Services" > "Library"
   - Tìm và enable "Google+ API" hoặc "Google People API"

4. **Tạo OAuth 2.0 Credentials**:
   - Vào "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "NyNus Web App"

5. **Cấu hình Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. **Copy credentials**:
   - Client ID: `123456789-abcdef.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abcdef123456`

### Bước 2: Cập nhật Environment Variables

Mở file `apps/frontend/.env.local` và uncomment + cập nhật:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=nynus-secret-key-development-only-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

### Bước 3: Test Authentication

1. **Restart development server**:
   ```bash
   cd apps/frontend
   pnpm dev
   ```

2. **Truy cập test page**:
   - http://localhost:3000/test-auth

3. **Test Google Sign In**:
   - Button "Sign In with Google" sẽ được enable
   - Click để test authentication flow

## 🔧 Files đã được tạo/sửa

### 1. API Route Handler
**File**: `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from "@/lib/auth";

// Export handlers cho NextAuth.js API routes
export const { GET, POST } = handlers;
```

### 2. Auth Configuration (Updated)
**File**: `src/lib/auth.ts`
- ✅ Conditional Google provider loading
- ✅ Graceful handling khi missing credentials

### 3. Test Page
**File**: `src/app/test-auth/page.tsx`
- ✅ Test authentication status
- ✅ Display session data
- ✅ Sign in/out functionality

## 🎯 Next Steps

1. **Setup Google OAuth credentials** (theo hướng dẫn trên)
2. **Test authentication flow**
3. **Integrate với existing auth context**
4. **Add role-based access control**

## 🐛 Troubleshooting

### Lỗi "Invalid redirect URI"
- Đảm bảo redirect URI chính xác: `http://localhost:3000/api/auth/callback/google`
- Không có trailing slash

### Lỗi "Client ID not found"
- Kiểm tra GOOGLE_CLIENT_ID trong .env.local
- Restart development server sau khi thay đổi env

### Lỗi "Access blocked"
- Thêm test users trong Google Cloud Console
- Hoặc publish app để public access

## 📝 Production Considerations

1. **NEXTAUTH_URL**: Thay đổi thành domain production
2. **NEXTAUTH_SECRET**: Generate secret mạnh cho production
3. **Google OAuth**: Thêm production domain vào authorized URIs
4. **HTTPS**: Bắt buộc cho production

---

**Status**: ✅ NextAuth.js đã hoạt động, sẵn sàng cho Google OAuth setup
