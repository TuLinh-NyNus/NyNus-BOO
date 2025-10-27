# Root Cause Analysis - Dashboard Hang Issue

## 🔍 Executive Summary

**Issue**: Dashboard bị treo sau khi login với admin account  
**Root Cause**: Version mismatch giữa Backend và Frontend protobuf libraries  
**Impact**: Frontend không thể deserialize gRPC responses từ backend

## 📊 Detailed Analysis

### 1. Error Message
```
TypeError: reader.readStringRequireUtf8 is not a function
```

### 2. Investigation Flow

#### Frontend Logs
```
[AuthService] Getting current user...
[AuthService] Failed to get current user
[AuthService] gRPC Error occurred
[AuthContext] Failed to fetch current user
  → error: "Error when deserializing response data; error: TypeError: reader.readStringRequireUtf8 is not a function"
[AuthContext] Unexpected error, clearing auth state
```

#### Network Analysis
- ✅ Login request: 200 OK
- ✅ Session cookie set correctly
- ✅ GetCurrentUser request: 200 OK (backend returns valid data)
- ❌ Frontend deserialization fails

### 3. Code Analysis

#### Backend (`apps/backend/internal/grpc/user_service_enhanced.go`)
```go
func (s *EnhancedUserServiceServer) GetCurrentUser(ctx context.Context, req *v1.GetCurrentUserRequest) (*v1.GetUserResponse, error) {
    // Get user from repository
    user, err := s.userRepo.GetByID(ctx, userID)
    
    return &v1.GetUserResponse{
        Response: &common.Response{
            Success: true,
            Message: MsgUserRetrievedSuccess,
        },
        User: ConvertUserToProto(user), // ← Converts to protobuf User
    }, nil
}
```

#### Frontend (`apps/frontend/src/services/grpc/auth.service.ts`)
```typescript
static async getCurrentUser(): Promise<GetUserResponse> {
    const request = new GetUserRequest();
    const client = getUserServiceClient();
    const response = await client.getCurrentUser(request, getAuthMetadata());
    // ↑ Deserialization fails here
    return response;
}
```

### 4. Version Mismatch Discovery

#### Backend (`go.mod`)
```
google.golang.org/protobuf v1.36.8  // Latest version (December 2024)
```

#### Frontend (`package.json`)
```json
"google-protobuf": "^3.21.2"  // Older version (2022)
```

**Version Gap**: ~2 years of protobuf development

### 5. Why This Causes The Error

1. **Backend protobuf v1.36.8** generates wire format that includes new optimizations
2. **Frontend google-protobuf 3.21.2** tries to deserialize using older methods
3. Method `readStringRequireUtf8` was introduced in newer protobuf versions
4. Frontend's protobuf runtime doesn't have this method → **TypeError**

### 6. Additional Findings

#### Frontend Has Mixed Implementation
```typescript
// apps/frontend/src/services/api/auth.api.ts - Line 204
// Comment: "Some builds have first_name/last_name, others have name"
```
This suggests previous proto generation issues and workarounds.

#### CSRF Already Disabled for GetCurrentUser
```go
// apps/backend/internal/middleware/csrf_interceptor.go
"/v1.UserService/GetCurrentUser": true,  // Skip CSRF validation
```
Backend already tried to fix timing issues by disabling CSRF for this endpoint.

## 🔧 Solution Options

### Option 1: Upgrade Frontend Protobuf (Recommended)
```bash
cd apps/frontend
pnpm remove google-protobuf @improbable-eng/grpc-web
pnpm add google-protobuf@latest @improbable-eng/grpc-web@latest
pnpm run proto:generate  # Regenerate all proto stubs
```

**Pros**: 
- Fixes root cause
- Better performance
- Future compatibility

**Cons**:
- May require code updates
- Testing needed

### Option 2: Downgrade Backend Protobuf
```go
// go.mod
google.golang.org/protobuf v1.28.1  // Match frontend era
```

**Pros**:
- Quick fix
- No frontend changes

**Cons**:
- Loses security updates
- Not recommended

### Option 3: Use JSON Gateway Instead of gRPC-Web
```typescript
// Use HTTP gateway with JSON instead of binary proto
const response = await fetch('/api/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Pros**:
- No proto issues
- Simpler debugging

**Cons**:
- Performance overhead
- Need to update all API calls

## 🎯 Recommended Fix Process

1. **Immediate Workaround** (for testing)
   ```typescript
   // In auth-context-grpc.tsx catch block
   if (error.message?.includes('readStringRequireUtf8')) {
     // Use NextAuth session data as fallback
     if (session?.user) {
       const fallbackUser = mapSessionToUser(session.user);
       setUser(fallbackUser);
       return;
     }
   }
   ```

2. **Proper Fix**
   ```bash
   # 1. Update frontend dependencies
   cd apps/frontend
   pnpm add google-protobuf@3.21.4 # Latest 3.x version
   
   # 2. Regenerate proto stubs with matching version
   cd packages/proto
   ./scripts/gen-proto-web.ps1
   
   # 3. Test thoroughly
   pnpm test:proto
   ```

3. **Backend Logs to Check**
   ```bash
   # Check if backend actually sends correct data
   docker logs exam-bank-backend 2>&1 | grep GetCurrentUser
   ```

## 📝 Lessons Learned

1. **Version Compatibility**: Always ensure protobuf versions match between services
2. **Error Handling**: Deserialization errors need special handling
3. **Monitoring**: Add version checks in health endpoints
4. **CI/CD**: Add proto compatibility tests

## ✅ Verification Steps

After fix:
1. Clear browser cache and cookies
2. Login with admin10@nynus.edu.vn
3. Check network tab: GetCurrentUser should return 200
4. Check console: No deserialization errors
5. Dashboard should load with user data

---

**Date**: October 26, 2024  
**Author**: AI Assistant  
**Status**: Root cause identified, fix pending
