# Migration Guide - REST to gRPC

## Overview

This guide helps migrate existing REST API endpoints to gRPC in NyNus Exam Bank System.

---

## Why Migrate to gRPC?

### Benefits

**Performance**:
- ✅ Binary serialization (Protocol Buffers) vs JSON
- ✅ HTTP/2 multiplexing vs HTTP/1.1
- ✅ Smaller payload size (60-80% reduction)
- ✅ Lower latency

**Type Safety**:
- ✅ Strongly typed contracts (proto definitions)
- ✅ Auto-generated client/server code
- ✅ Compile-time type checking

**Developer Experience**:
- ✅ Single source of truth (proto files)
- ✅ Automatic code generation
- ✅ Built-in documentation

**Streaming**:
- ✅ Server streaming for real-time updates
- ✅ Client streaming for file uploads
- ✅ Bi-directional streaming

---

## Migration Strategy

### Phase 1: Dual Support (Recommended)

Run both REST and gRPC in parallel:

```
┌─────────────────────────────────────────┐
│           Frontend                       │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  REST Client │  │ gRPC Client  │    │
│  └──────┬───────┘  └──────┬───────┘    │
│         │                  │             │
└─────────┼──────────────────┼─────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────┐
│           Backend                        │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ REST Handler │  │ gRPC Service │    │
│  └──────┬───────┘  └──────┬───────┘    │
│         │                  │             │
│         └──────────┬───────┘             │
│                    ▼                     │
│           Business Logic                 │
└─────────────────────────────────────────┘
```

**Advantages**:
- Zero downtime migration
- Gradual rollout
- Easy rollback
- A/B testing

**Timeline**: 2-4 weeks per service

---

### Phase 2: gRPC Only

After migration is complete and stable:

```
┌─────────────────────────────────────────┐
│           Frontend                       │
│                                          │
│         ┌──────────────┐                │
│         │ gRPC Client  │                │
│         └──────┬───────┘                │
│                │                         │
└────────────────┼─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           Backend                        │
│                                          │
│         ┌──────────────┐                │
│         │ gRPC Service │                │
│         └──────┬───────┘                │
│                ▼                         │
│         Business Logic                   │
└─────────────────────────────────────────┘
```

**Timeline**: After 2-4 weeks of stable dual support

---

## Step-by-Step Migration

### Step 1: Analyze Existing REST API

**Document current endpoints**:

```typescript
// Example: User Authentication REST API
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/logout
```

**Document request/response formats**:

```typescript
// POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "STUDENT"
    }
  }
}
```

---

### Step 2: Design Proto Definitions

**Convert REST endpoints to gRPC RPCs**:

```protobuf
// packages/proto/v1/user.proto
service UserService {
  // POST /api/auth/login → Login RPC
  rpc Login(LoginRequest) returns (LoginResponse);
  
  // POST /api/auth/register → Register RPC
  rpc Register(RegisterRequest) returns (RegisterResponse);
  
  // POST /api/auth/refresh → RefreshToken RPC
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  
  // GET /api/auth/me → GetUser RPC
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message LoginResponse {
  common.Response response = 1;
  string access_token = 2;
  string refresh_token = 3;
  User user = 4;
}
```

**Mapping Guidelines**:
- `POST /api/resource` → `Create<Resource>` RPC
- `GET /api/resource/:id` → `Get<Resource>` RPC
- `GET /api/resources` → `List<Resources>` RPC
- `PUT /api/resource/:id` → `Update<Resource>` RPC
- `DELETE /api/resource/:id` → `Delete<Resource>` RPC

---

### Step 3: Implement gRPC Service

**Extract business logic to shared layer**:

```go
// Before: REST handler with embedded logic
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    json.NewDecoder(r.Body).Decode(&req)
    
    // Business logic embedded in handler
    user, err := h.userRepo.FindByEmail(req.Email)
    if err != nil {
        http.Error(w, "User not found", 404)
        return
    }
    
    if !bcrypt.CompareHashAndPassword(user.Password, req.Password) {
        http.Error(w, "Invalid password", 401)
        return
    }
    
    token, _ := h.jwtService.GenerateToken(user)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token": token,
        "user":  user,
    })
}

// After: Shared business logic
type AuthService struct {
    userRepo   repository.IUserRepository
    jwtService *auth.JWTService
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*User, string, error) {
    user, err := s.userRepo.FindByEmail(ctx, email)
    if err != nil {
        return nil, "", ErrUserNotFound
    }
    
    if !bcrypt.CompareHashAndPassword(user.Password, password) {
        return nil, "", ErrInvalidPassword
    }
    
    token, err := s.jwtService.GenerateToken(user)
    if err != nil {
        return nil, "", err
    }
    
    return user, token, nil
}

// REST handler (thin wrapper)
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    json.NewDecoder(r.Body).Decode(&req)
    
    user, token, err := h.authService.Login(r.Context(), req.Email, req.Password)
    if err != nil {
        http.Error(w, err.Error(), 401)
        return
    }
    
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token": token,
        "user":  user,
    })
}

// gRPC service (thin wrapper)
func (s *UserServiceServer) Login(ctx context.Context, req *v1.LoginRequest) (*v1.LoginResponse, error) {
    user, token, err := s.authService.Login(ctx, req.Email, req.Password)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, err.Error())
    }
    
    return &v1.LoginResponse{
        Response: &common.Response{Success: true},
        AccessToken: token,
        User: convertUserToProto(user),
    }, nil
}
```

---

### Step 4: Update Frontend

**Before (REST)**:

```typescript
// services/auth.service.ts
export class AuthService {
  static async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }
}
```

**After (gRPC)**:

```typescript
// services/grpc/auth.service.ts
import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';
import { LoginRequest } from '@/generated/v1/user_pb';

const client = new UserServiceClient(process.env.NEXT_PUBLIC_GRPC_URL);

export class AuthService {
  static async login(email: string, password: string) {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);
    
    try {
      const response = await client.login(request, {});
      
      const accessToken = response.getAccessToken();
      localStorage.setItem('token', accessToken);
      
      return response.getUser().toObject();
    } catch (error) {
      throw new Error('Login failed');
    }
  }
}
```

---

### Step 5: Feature Flag for Gradual Rollout

**Backend feature flag**:

```go
// config/config.go
type Config struct {
    EnableGRPC bool `env:"ENABLE_GRPC" default:"true"`
    EnableREST bool `env:"ENABLE_REST" default:"true"`
}

// main.go
if config.EnableREST {
    restServer.Start()
}

if config.EnableGRPC {
    grpcServer.Start()
}
```

**Frontend feature flag**:

```typescript
// lib/config/features.ts
export const FEATURES = {
  USE_GRPC: process.env.NEXT_PUBLIC_USE_GRPC === 'true',
};

// services/auth.service.ts
export class AuthService {
  static async login(email: string, password: string) {
    if (FEATURES.USE_GRPC) {
      return AuthServiceGRPC.login(email, password);
    } else {
      return AuthServiceREST.login(email, password);
    }
  }
}
```

---

### Step 6: Testing

**Test both implementations**:

```typescript
describe('AuthService', () => {
  describe('REST Implementation', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_USE_GRPC = 'false';
    });

    it('should login successfully', async () => {
      const user = await AuthService.login('test@example.com', 'password');
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('gRPC Implementation', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_USE_GRPC = 'true';
    });

    it('should login successfully', async () => {
      const user = await AuthService.login('test@example.com', 'password');
      expect(user.email).toBe('test@example.com');
    });
  });
});
```

---

### Step 7: Monitor and Rollout

**Metrics to track**:
- Response time (REST vs gRPC)
- Error rate
- Payload size
- CPU/Memory usage

**Gradual rollout**:
1. Week 1: 10% traffic to gRPC
2. Week 2: 50% traffic to gRPC
3. Week 3: 90% traffic to gRPC
4. Week 4: 100% traffic to gRPC

**Rollback plan**:
```typescript
// If issues detected, switch back to REST
FEATURES.USE_GRPC = false;
```

---

### Step 8: Deprecate REST API

**After stable gRPC migration**:

1. Add deprecation warnings to REST endpoints
2. Set sunset date (e.g., 3 months)
3. Notify clients
4. Remove REST endpoints

```go
// Add deprecation header
w.Header().Set("Deprecation", "true")
w.Header().Set("Sunset", "2025-06-01")
w.Header().Set("Link", "<https://docs.nynus.edu.vn/grpc>; rel=\"alternate\"")
```

---

## Common Challenges

### Challenge 1: File Uploads

**REST**: Multipart form data
**gRPC**: Client streaming

**Solution**:
```protobuf
service ImportService {
  rpc UploadFile(stream FileChunk) returns (UploadResponse);
}

message FileChunk {
  bytes data = 1;
  string filename = 2;
  int32 chunk_index = 3;
}
```

---

### Challenge 2: Real-time Updates

**REST**: Polling or WebSocket
**gRPC**: Server streaming

**Solution**:
```protobuf
service NotificationService {
  rpc SubscribeToNotifications(SubscribeRequest) returns (stream Notification);
}
```

---

### Challenge 3: Browser Compatibility

**Issue**: Pure gRPC not supported in browsers

**Solution**: Use gRPC-Web with HTTP Gateway

---

## Checklist

### Pre-Migration
- [ ] Document all REST endpoints
- [ ] Identify business logic to extract
- [ ] Design proto definitions
- [ ] Set up feature flags

### Migration
- [ ] Generate proto code
- [ ] Implement gRPC services
- [ ] Create frontend clients
- [ ] Write tests
- [ ] Deploy with dual support

### Post-Migration
- [ ] Monitor metrics
- [ ] Gradual rollout
- [ ] Deprecate REST
- [ ] Remove REST code

---

**Last Updated**: 2025-10-29  
**Version**: 1.0  
**Status**: ✅ Complete

