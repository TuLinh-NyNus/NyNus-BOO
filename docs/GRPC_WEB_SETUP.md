# 🚀 gRPC-Web Integration Setup Guide

## 📋 Overview
Hướng dẫn setup và test gRPC-Web integration cho Exam Bank System.

## ✅ Những gì đã hoàn thành

### Backend
- ✅ gRPC services (UserService, ProfileService, AdminService)
- ✅ gRPC-Gateway HTTP server (`server/http.go`)
- ✅ CORS configuration
- ✅ Google OAuth service implementation
- ✅ JWT service với refresh token
- ✅ User Repository với full database queries

### Frontend
- ✅ gRPC-Web client configuration (`services/grpc/client.ts`)
- ✅ Auth service client (`services/grpc/auth.service.ts`)
- ✅ Auth context với gRPC integration (`contexts/auth-context-grpc.tsx`)
- ✅ NextAuth tích hợp với backend gRPC
- ✅ Scripts để generate TypeScript code

## 🛠️ Setup Instructions

### 1. Cài đặt Dependencies

#### Backend
```bash
cd apps/backend
go mod tidy
go get github.com/grpc-ecosystem/grpc-gateway/v2
go get github.com/rs/cors
```

#### Frontend
```bash
cd apps/frontend
pnpm add grpc-web google-protobuf @improbable-eng/grpc-web
pnpm add -D @types/google-protobuf
```

### 2. Generate Proto Code

#### Windows (PowerShell)
```powershell
# Setup tools (chỉ cần chạy 1 lần)
cd tools/scripts
./setup-grpc-web.ps1

# Generate TypeScript code
./gen-proto-web.ps1
```

#### Linux/Mac
```bash
# Generate proto code
make proto
```

### 3. Environment Configuration

Update `.env` file:
```env
# Backend
GRPC_PORT=50051
HTTP_PORT=8080

# Frontend
NEXT_PUBLIC_GRPC_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Google OAuth (cần setup sau)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 4. Start Services

#### Backend
```bash
cd apps/backend
go run cmd/main.go
```

Backend sẽ start:
- gRPC server on port 50051
- HTTP/gRPC-Gateway server on port 8080

#### Frontend
```bash
cd apps/frontend
pnpm dev
```

Frontend sẽ chạy trên http://localhost:3000

## 🧪 Testing

### 1. Test gRPC Connection
```javascript
// Trong browser console tại localhost:3000
import { AuthService } from '@/services/grpc/auth.service';

// Test get current user (cần login trước)
AuthService.getCurrentUser()
  .then(response => console.log('User:', response))
  .catch(error => console.error('Error:', error));
```

### 2. Test Login Flow
```javascript
// Test login với email/password
AuthService.login('test@example.com', 'password123')
  .then(response => {
    console.log('Login success:', response);
    console.log('Access Token:', response.getAccessToken());
  })
  .catch(error => console.error('Login failed:', error));
```

### 3. Test Google OAuth
1. Click "Đăng nhập bằng Google" button
2. Complete Google authentication
3. Backend sẽ nhận ID token và tạo user session

## 📁 File Structure

```
exam-bank-system/
├── apps/
│   ├── backend/
│   │   ├── internal/
│   │   │   ├── server/
│   │   │   │   └── http.go          # gRPC-Gateway server
│   │   │   ├── grpc/
│   │   │   │   ├── user_service.go  # gRPC service implementation
│   │   │   │   └── ...
│   │   │   └── service/
│   │   │       └── domain_service/
│   │   │           ├── oauth/       # OAuth service
│   │   │           └── auth/        # JWT service
│   │   └── pkg/proto/               # Generated Go proto code
│   │
│   └── frontend/
│       ├── src/
│       │   ├── services/grpc/       # gRPC-Web clients
│       │   │   ├── client.ts        # Base configuration
│       │   │   └── auth.service.ts  # Auth service client
│       │   ├── contexts/
│       │   │   └── auth-context-grpc.tsx  # Auth context with gRPC
│       │   ├── lib/
│       │   │   └── auth.ts          # NextAuth config
│       │   └── generated/           # Generated TypeScript proto code
│       └── ...
│
├── packages/proto/                  # Proto definitions
│   ├── common/common.proto
│   └── v1/
│       ├── user.proto
│       ├── profile.proto
│       └── ...
│
└── tools/scripts/
    ├── gen-proto.sh                 # Linux/Mac proto generation
    ├── gen-proto-web.ps1           # Windows proto generation
    └── setup-grpc-web.ps1          # Windows setup script
```

## 🔍 Troubleshooting

### Error: "Cannot connect to server"
- Kiểm tra backend đang chạy trên port 8080
- Kiểm tra CORS configuration trong `server/http.go`
- Verify NEXT_PUBLIC_GRPC_URL trong `.env`

### Error: "Invalid token"
- Kiểm tra JWT_ACCESS_SECRET và JWT_REFRESH_SECRET
- Clear localStorage và login lại
- Kiểm tra token expiry time

### Error: "Proto files not found"
- Chạy generate proto scripts
- Kiểm tra folder `apps/frontend/src/generated` tồn tại
- Verify protoc và protoc-gen-grpc-web đã cài đặt

## 📝 Next Steps

### Cần hoàn thành:
1. **Setup Google OAuth Credentials**
   - Tạo project trên Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Update `.env` với real credentials

2. **Implement Missing Features**
   - Email verification flow
   - Password reset functionality
   - Account locking mechanism

3. **Testing**
   - Unit tests cho gRPC services
   - Integration tests cho auth flow
   - E2E tests với Playwright/Cypress

4. **Production Setup**
   - TLS/SSL configuration
   - Load balancing
   - Rate limiting
   - Monitoring và logging

## 📚 Resources

- [gRPC-Web Documentation](https://github.com/grpc/grpc-web)
- [gRPC-Gateway Documentation](https://grpc-ecosystem.github.io/grpc-gateway/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Protocol Buffers Documentation](https://developers.google.com/protocol-buffers)

## 🤝 Support

Nếu gặp vấn đề, vui lòng:
1. Check troubleshooting section
2. Review error logs trong console
3. Verify all dependencies installed
4. Ensure all services running correctly

---
Updated: 14/09/2025 - gRPC-Web Integration Complete ✅