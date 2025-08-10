# Google OAuth Setup Guide for NyNus

## Tổng quan

Hướng dẫn này sẽ giúp bạn thiết lập Google OAuth 2.0 cho tính năng "Đăng nhập bằng Google" trong NyNus.

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đảm bảo billing được kích hoạt (cần thiết cho OAuth)

## Bước 2: Enable APIs

1. Trong Google Cloud Console, đi tới **APIs & Services** > **Library**
2. Tìm và enable các APIs sau:
   - **Google+ API** (deprecated nhưng vẫn cần cho NextAuth)
   - **Google People API** (recommended)
   - **Google Identity and Access Management (IAM) API**

## Bước 3: Tạo OAuth 2.0 Credentials

1. Đi tới **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Chọn **Application type**: Web application
4. Đặt tên: "NyNus Web App"
5. Thêm **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

## Bước 4: Cấu hình Environment Variables

1. Copy file `.env.local.example` thành `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Cập nhật `.env.local` với thông tin từ Google Console:
   ```env
   # NextAuth.js Configuration
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

3. Tạo NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Bước 5: Test OAuth Flow

1. Restart development server:
   ```bash
   pnpm run dev
   ```

2. Mở browser và truy cập `http://localhost:3000`
3. Click nút đăng nhập và chọn "Đăng nhập bằng Google"
4. Verify OAuth flow hoạt động đúng

## Bước 6: Production Setup

### Domain Verification
1. Trong Google Cloud Console, đi tới **APIs & Services** > **Domain verification**
2. Thêm domain production của bạn
3. Verify ownership theo hướng dẫn

### OAuth Consent Screen
1. Đi tới **APIs & Services** > **OAuth consent screen**
2. Chọn **External** user type
3. Điền thông tin ứng dụng:
   - App name: "NyNus - Nền tảng học toán"
   - User support email: support@nynus.edu.vn
   - Developer contact: your-email@domain.com

### Production Environment Variables
```env
NEXTAUTH_SECRET=production-secret-key-different-from-dev
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
```

## Troubleshooting

### Lỗi thường gặp:

1. **"redirect_uri_mismatch"**
   - Kiểm tra authorized redirect URIs trong Google Console
   - Đảm bảo URL chính xác: `http://localhost:3000/api/auth/callback/google`

2. **"invalid_client"**
   - Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
   - Đảm bảo không có space thừa trong .env.local

3. **"access_denied"**
   - User từ chối cấp quyền
   - Kiểm tra OAuth consent screen configuration

4. **NextAuth errors**
   - Kiểm tra NEXTAUTH_SECRET được set
   - Verify NEXTAUTH_URL đúng với domain hiện tại

### Debug Mode

Để enable debug mode, thêm vào `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## Security Best Practices

1. **Never commit .env.local** - đã được thêm vào .gitignore
2. **Use different credentials** cho development và production
3. **Regularly rotate secrets** trong production
4. **Monitor OAuth usage** trong Google Cloud Console
5. **Set up proper CORS** cho production domain

## Features Implemented

✅ **UI Components**:
- Google button với icon và styling phù hợp
- Divider "hoặc" giữa form và OAuth
- Loading states và error handling
- Responsive design

✅ **Authentication Flow**:
- NextAuth.js v5 integration
- Google OAuth 2.0 provider
- Session management
- Automatic redirect sau khi đăng nhập

✅ **Error Handling**:
- Network errors
- OAuth permission denied
- Invalid credentials
- User feedback với toast notifications

✅ **Security**:
- CSRF protection
- Secure session storage
- Environment variables protection
- Proper redirect handling

## Next Steps

1. Setup Google Cloud project và credentials
2. Test OAuth flow trong development
3. Deploy và test trong production
4. Monitor usage và performance
5. Implement additional OAuth providers nếu cần (Facebook, GitHub, etc.)
