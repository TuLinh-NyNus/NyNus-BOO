# Troubleshooting Guide - gRPC Implementation

## Common Issues and Solutions

### 1. Connection Issues

#### Issue: "Failed to connect to gRPC server"

**Symptoms**:
```
Error: 14 UNAVAILABLE: failed to connect to all addresses
```

**Possible Causes**:
1. Backend server not running
2. Wrong port configuration
3. Firewall blocking connection

**Solutions**:

**Check if backend is running**:
```bash
# Check if port 8080 (HTTP Gateway) is listening
netstat -an | grep 8080

# Check if port 50051 (gRPC Server) is listening
netstat -an | grep 50051

# On Windows
netstat -an | findstr 8080
netstat -an | findstr 50051
```

**Verify environment variables**:
```typescript
// apps/frontend/src/lib/config/endpoints.ts
console.log('GRPC_URL:', process.env.NEXT_PUBLIC_GRPC_URL);
// Should be: http://localhost:8080 (development)
```

**Start backend server**:
```bash
cd apps/backend
go run cmd/server/main.go
```

---

#### Issue: CORS errors in browser

**Symptoms**:
```
Access to fetch at 'http://localhost:8080/v1.UserService/Login' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Cause**: Frontend origin not in CORS allowed list

**Solution**:

**Check CORS configuration** (`apps/backend/internal/server/http.go`):
```go
allowedOrigins := []string{
    "http://localhost:3000",      // Next.js dev server
    "http://localhost:3001",      // Alternative port
    "https://nynus.edu.vn",       // Production
}
```

**Add your origin if missing**:
```go
allowedOrigins := []string{
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",      // Add your custom port
    "https://nynus.edu.vn",
}
```

**Restart backend server** after changes.

---

### 2. Authentication Issues

#### Issue: "Unauthenticated" error (Code 16)

**Symptoms**:
```
Error: 16 UNAUTHENTICATED: invalid or expired token
```

**Possible Causes**:
1. Missing Authorization header
2. Expired JWT token
3. Invalid token format
4. Token not stored in localStorage

**Solutions**:

**Check token in localStorage**:
```typescript
// Browser console
console.log('Access Token:', localStorage.getItem('nynus-auth-token'));
console.log('Refresh Token:', localStorage.getItem('nynus-refresh-token'));
```

**Verify token is attached to request**:
```typescript
// apps/frontend/src/services/grpc/client.ts
function getAuthMetadata(): grpcWeb.Metadata {
  const md: grpcWeb.Metadata = {};
  
  const token = localStorage.getItem('nynus-auth-token');
  if (token) {
    md['Authorization'] = `Bearer ${token}`;
    console.log('Token attached:', token.substring(0, 20) + '...');
  } else {
    console.warn('No token found in localStorage');
  }
  
  return md;
}
```

**Implement token refresh**:
```typescript
async function makeAuthenticatedRequest<T>(
  requestFn: () => Promise<T>
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if ((error as RpcError).code === 16) { // UNAUTHENTICATED
      // Try to refresh token
      await refreshAccessToken();
      // Retry request
      return await requestFn();
    }
    throw error;
  }
}
```

---

#### Issue: "Permission Denied" error (Code 7)

**Symptoms**:
```
Error: 7 PERMISSION_DENIED: insufficient permissions
```

**Possible Causes**:
1. User role not allowed for endpoint
2. User level too low
3. Resource ownership check failed
4. CSRF token validation failed

**Solutions**:

**Check user role and level**:
```typescript
// Decode JWT token to check claims
function decodeJWT(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('nynus-auth-token');
const payload = decodeJWT(token);
console.log('User Role:', payload.role);
console.log('User Level:', payload.level);
```

**Check endpoint permissions** (`apps/backend/internal/middleware/role_level_interceptor.go`):
```go
// Example: CreateExam requires TEACHER or ADMIN with level >= 2
"/v1.ExamService/CreateExam": {
    AllowedRoles: []common.UserRole{
        common.UserRole_USER_ROLE_ADMIN,
        common.UserRole_USER_ROLE_TEACHER,
    },
    MinLevel: 2,
},
```

**Verify CSRF token**:
```typescript
// Check if CSRF token is present
const csrfToken = AuthHelpers.getCSRFToken();
console.log('CSRF Token:', csrfToken);

// If missing, check NextAuth cookies
console.log('Cookies:', document.cookie);
```

---

### 3. Service Registration Issues

#### Issue: "Service not found" or 404 error

**Symptoms**:
```
Error: 5 NOT_FOUND: unknown service v1.ExamService
```

**Cause**: Service not registered in HTTP Gateway

**Solution**:

**Check HTTP Gateway registration** (`apps/backend/internal/server/http.go`):
```go
// Look for service registration
if err := v1.RegisterExamServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
    return fmt.Errorf("failed to register ExamService: %w", err)
}
```

**If commented out, uncomment**:
```go
// Before (commented out)
// if err := v1.RegisterExamServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
//     return fmt.Errorf("failed to register ExamService: %w", err)
// }

// After (uncommented)
if err := v1.RegisterExamServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
    return fmt.Errorf("failed to register ExamService: %w", err)
}
```

**Restart backend server** after changes.

**Verify service is registered**:
```bash
# List all registered services
grpcurl -plaintext localhost:50051 list

# Should show:
# v1.UserService
# v1.QuestionService
# v1.ExamService
# ...
```

---

### 4. Code Generation Issues

#### Issue: Generated code not found

**Symptoms**:
```
Error: Cannot find module '@/generated/v1/UserServiceClientPb'
```

**Cause**: Code generation not run after proto changes

**Solution**:

**Generate Go code**:
```bash
cd packages/proto
buf generate --template buf.gen.yaml
```

**Generate TypeScript code**:
```bash
cd packages/proto
buf generate --template buf.gen.ts.yaml
```

**Verify generated files exist**:
```bash
# Go code
ls apps/backend/pkg/proto/v1/*.pb.go

# TypeScript code
ls apps/frontend/src/generated/v1/*_pb.ts
```

**If buf command fails**:
```bash
# Install buf CLI
# macOS
brew install bufbuild/buf/buf

# Windows
# Download from https://github.com/bufbuild/buf/releases

# Linux
curl -sSL "https://github.com/bufbuild/buf/releases/download/v1.28.1/buf-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/buf
chmod +x /usr/local/bin/buf
```

---

### 5. Rate Limiting Issues

#### Issue: "Rate limit exceeded" error (Code 8)

**Symptoms**:
```
Error: 8 RESOURCE_EXHAUSTED: rate limit exceeded
```

**Cause**: Too many requests in short time period

**Solution**:

**Check rate limit configuration** (`apps/backend/internal/middleware/rate_limit_interceptor.go`):
```go
"/v1.UserService/Login": {
    RequestsPerSecond: 0.1,   // 1 request per 10 seconds
    Burst:             3,      // Allow burst of 3 requests
    PerUser:           false,
},
```

**Wait before retrying**:
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if ((error as RpcError).code === 8 && i < maxRetries - 1) {
        // Wait with exponential backoff
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Adjust rate limits for development** (if needed):
```go
// Increase limits for development
"/v1.UserService/Login": {
    RequestsPerSecond: 1,     // 1 request per second
    Burst:             10,    // Allow burst of 10 requests
    PerUser:           false,
},
```

---

### 6. Streaming Issues

#### Issue: Streaming RPC not working

**Symptoms**:
```
Error: Streaming not supported in gRPC-Web
```

**Cause**: gRPC-Web has limited streaming support

**Limitations**:
- ✅ Server streaming: Supported
- ❌ Client streaming: Not supported in browser
- ❌ Bi-directional streaming: Not supported in browser

**Solutions**:

**For server streaming** (works in gRPC-Web):
```typescript
const request = new SearchRequest();
request.setQuery('math');

const stream = searchServiceClient.search(request, getAuthMetadata());

stream.on('data', (response: SearchHit) => {
  console.log('Received:', response.toObject());
});

stream.on('error', (error: RpcError) => {
  console.error('Stream error:', error);
});

stream.on('end', () => {
  console.log('Stream ended');
});
```

**For client/bi-directional streaming** (use alternative):
- Option 1: Use REST API for file uploads
- Option 2: Use WebSocket for bi-directional communication
- Option 3: Use chunked unary RPCs

---

### 7. Development vs Production Issues

#### Issue: Works in development but not in production

**Common Causes**:
1. Environment variables not set
2. CORS configuration missing production domain
3. HTTPS required in production
4. CSRF protection enabled in production

**Solutions**:

**Check environment variables**:
```bash
# Production .env
NEXT_PUBLIC_GRPC_URL=https://api.nynus.edu.vn
NEXT_PUBLIC_API_URL=https://api.nynus.edu.vn
```

**Update CORS for production**:
```go
allowedOrigins := []string{
    "http://localhost:3000",      // Development
    "https://nynus.edu.vn",       // Production
    "https://www.nynus.edu.vn",   // Production www
}
```

**Enable HTTPS in production**:
```go
// Use TLS credentials for gRPC server
creds, err := credentials.NewServerTLSFromFile("cert.pem", "key.pem")
if err != nil {
    log.Fatalf("Failed to load TLS credentials: %v", err)
}

grpcServer := grpc.NewServer(
    grpc.Creds(creds),
    // ... other options
)
```

**Verify CSRF is enabled**:
```go
// Production should have CSRF enabled
csrfInterceptor := middleware.NewCSRFInterceptor(true) // enabled = true
```

---

## Debugging Tools

### 1. grpcurl

**Install**:
```bash
# macOS
brew install grpcurl

# Windows
# Download from https://github.com/fullstorydev/grpcurl/releases
```

**Usage**:
```bash
# List all services
grpcurl -plaintext localhost:50051 list

# List service methods
grpcurl -plaintext localhost:50051 list v1.UserService

# Describe method
grpcurl -plaintext localhost:50051 describe v1.UserService.Login

# Call method
grpcurl -plaintext -d '{"email":"test@example.com","password":"password123"}' \
  localhost:50051 v1.UserService/Login
```

### 2. Browser DevTools

**Network Tab**:
- Check request headers (Authorization, X-CSRF-Token)
- Check response status codes
- Inspect request/response payloads

**Console**:
```typescript
// Enable gRPC-Web debug logging
localStorage.setItem('grpc-web-debug', 'true');
```

### 3. Backend Logging

**Enable debug logging**:
```go
// apps/backend/cmd/server/main.go
log.SetLevel(log.DebugLevel)
```

**Add custom logging**:
```go
log.Printf("[DEBUG] Request: %+v", req)
log.Printf("[DEBUG] User ID: %s, Role: %s", userID, userRole)
```

---

## Best Practices

### 1. Error Handling

**Always handle errors gracefully**:
```typescript
try {
  const response = await userService.login(email, password);
  // Success
} catch (error) {
  const grpcError = error as RpcError;
  
  switch (grpcError.code) {
    case 3: // INVALID_ARGUMENT
      showError('Dữ liệu không hợp lệ');
      break;
    case 7: // PERMISSION_DENIED
      showError('Bạn không có quyền thực hiện thao tác này');
      break;
    case 16: // UNAUTHENTICATED
      // Try to refresh token
      await refreshAccessToken();
      // Retry
      break;
    default:
      showError('Đã xảy ra lỗi. Vui lòng thử lại.');
  }
}
```

### 2. Logging

**Log important events**:
```typescript
console.log('[AUTH] Login attempt:', email);
console.log('[AUTH] Login successful:', user.id);
console.error('[AUTH] Login failed:', error.message);
```

### 3. Testing

**Test with different scenarios**:
- Valid credentials
- Invalid credentials
- Expired tokens
- Missing permissions
- Rate limit exceeded

---

**Last Updated**: 2025-01-19  
**Version**: 1.0.0

