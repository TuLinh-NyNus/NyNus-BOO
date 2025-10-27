# Proto Usage Guide - Exam Bank System

**Hướng dẫn sử dụng Protocol Buffers trong dự án**

---

## 📑 Mục Lục

1. [Quick Start](#quick-start)
2. [Backend (Go) Usage](#backend-go-usage)
3. [Frontend (TypeScript) Usage](#frontend-typescript-usage)
4. [Common Patterns](#common-patterns)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Cài Đặt Tools

```powershell
# 1. Install Buf
go install github.com/bufbuild/buf/cmd/buf@latest

# 2. Install protoc-gen-go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# 3. Install protoc-gen-go-grpc
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# 4. Install grpc-gateway
go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest

# 5. Verify installation
buf --version
protoc-gen-go --version
```

### Generate Code

```powershell
# Generate Go code (backend)
cd packages/proto
buf generate --template buf.gen.yaml

# Generate TypeScript code (frontend)
buf generate --template buf.gen.frontend.yaml

# Or use project scripts
cd ../..
./scripts/development/gen-proto-web.ps1
```

---

## Backend (Go) Usage

### 1. Import Generated Code

```go
import (
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
    "exam-bank-system/apps/backend/pkg/proto/common"
)
```

### 2. Implement Service Interface

```go
package service

import (
    "context"
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

type UserServiceServer struct {
    pb.UnimplementedUserServiceServer
    db *database.DB
}

// Implement Login RPC
func (s *UserServiceServer) Login(
    ctx context.Context, 
    req *pb.LoginRequest,
) (*pb.LoginResponse, error) {
    // 1. Validate request
    if req.Email == "" || req.Password == "" {
        return nil, status.Error(codes.InvalidArgument, "email and password required")
    }
    
    // 2. Business logic
    user, err := s.db.AuthenticateUser(ctx, req.Email, req.Password)
    if err != nil {
        return &pb.LoginResponse{
            Response: &common.Response{
                Success: false,
                Message: "Invalid credentials",
                Errors:  []string{err.Error()},
            },
        }, nil
    }
    
    // 3. Generate tokens
    accessToken, err := s.generateAccessToken(user)
    if err != nil {
        return nil, status.Error(codes.Internal, "failed to generate token")
    }
    
    // 4. Return response
    return &pb.LoginResponse{
        Response: &common.Response{
            Success: true,
            Message: "Login successful",
        },
        AccessToken: accessToken,
        User: &pb.User{
            Id:        user.ID,
            Email:     user.Email,
            FirstName: user.FirstName,
            LastName:  user.LastName,
            Role:      common.UserRole(user.Role),
        },
    }, nil
}
```

### 3. Register Service

```go
package server

import (
    "google.golang.org/grpc"
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
)

func RegisterServices(grpcServer *grpc.Server) {
    // Register gRPC services
    pb.RegisterUserServiceServer(grpcServer, NewUserService())
    pb.RegisterQuestionServiceServer(grpcServer, NewQuestionService())
    pb.RegisterExamServiceServer(grpcServer, NewExamService())
    pb.RegisterAdminServiceServer(grpcServer, NewAdminService())
}
```

### 4. Setup gRPC Gateway

```go
package gateway

import (
    "context"
    "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
    "google.golang.org/grpc"
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
)

func RegisterGatewayHandlers(
    ctx context.Context,
    mux *runtime.ServeMux,
    grpcEndpoint string,
) error {
    opts := []grpc.DialOption{grpc.WithInsecure()}
    
    // Register HTTP handlers
    if err := pb.RegisterUserServiceHandlerFromEndpoint(
        ctx, mux, grpcEndpoint, opts,
    ); err != nil {
        return err
    }
    
    if err := pb.RegisterAdminServiceHandlerFromEndpoint(
        ctx, mux, grpcEndpoint, opts,
    ); err != nil {
        return err
    }
    
    return nil
}
```

### 5. Working with Enums

```go
// Convert string to enum
func parseUserRole(roleStr string) common.UserRole {
    switch strings.ToUpper(roleStr) {
    case "ADMIN":
        return common.UserRole_USER_ROLE_ADMIN
    case "TEACHER":
        return common.UserRole_USER_ROLE_TEACHER
    case "STUDENT":
        return common.UserRole_USER_ROLE_STUDENT
    default:
        return common.UserRole_USER_ROLE_UNSPECIFIED
    }
}

// Convert enum to string
func userRoleToString(role common.UserRole) string {
    return strings.TrimPrefix(role.String(), "USER_ROLE_")
}
```

### 6. Working with Timestamps

```go
import (
    "google.golang.org/protobuf/types/known/timestamppb"
    "time"
)

// Create timestamp
func createQuestion(content string) *pb.Question {
    now := time.Now()
    return &pb.Question{
        Content:   content,
        CreatedAt: timestamppb.New(now),
        UpdatedAt: timestamppb.New(now),
    }
}

// Parse timestamp
func getCreatedTime(q *pb.Question) time.Time {
    if q.CreatedAt != nil {
        return q.CreatedAt.AsTime()
    }
    return time.Time{}
}
```

### 7. Working with Oneof

```go
// Set structured answers
func createMultipleChoiceQuestion() *pb.Question {
    return &pb.Question{
        Type: common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE,
        AnswerData: &pb.Question_StructuredAnswers{
            StructuredAnswers: &pb.AnswerList{
                Answers: []*pb.Answer{
                    {Id: "A", Content: "Answer A", IsCorrect: true},
                    {Id: "B", Content: "Answer B", IsCorrect: false},
                    {Id: "C", Content: "Answer C", IsCorrect: false},
                    {Id: "D", Content: "Answer D", IsCorrect: false},
                },
            },
        },
    }
}

// Check which answer format
func processAnswers(q *pb.Question) {
    switch answers := q.AnswerData.(type) {
    case *pb.Question_StructuredAnswers:
        // Handle structured answers
        for _, ans := range answers.StructuredAnswers.Answers {
            fmt.Printf("Answer %s: %s\n", ans.Id, ans.Content)
        }
    case *pb.Question_JsonAnswers:
        // Handle JSON answers
        var jsonAnswers map[string]interface{}
        json.Unmarshal([]byte(answers.JsonAnswers), &jsonAnswers)
    }
}
```

---

## Frontend (TypeScript) Usage

### 1. Import Generated Code

```typescript
import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';
import { 
    LoginRequest, 
    LoginResponse,
    User 
} from '@/generated/v1/user_pb';
import { UserRole } from '@/generated/common/common_pb';
```

### 2. Create gRPC-Web Client

```typescript
// lib/grpc-client.ts
import { grpc } from '@improbable-eng/grpc-web';

const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';

// Create client instance
export const userClient = new UserServiceClient(GRPC_ENDPOINT);
export const questionClient = new QuestionServiceClient(GRPC_ENDPOINT);
export const examClient = new ExamServiceClient(GRPC_ENDPOINT);
```

### 3. Make RPC Calls

```typescript
// services/auth.service.ts
import { userClient } from '@/lib/grpc-client';
import { LoginRequest, LoginResponse } from '@/generated/v1/user_pb';

export async function login(email: string, password: string): Promise<LoginResponse> {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);
    
    return new Promise((resolve, reject) => {
        userClient.login(request, (err, response) => {
            if (err) {
                reject(err);
                return;
            }
            if (!response) {
                reject(new Error('No response'));
                return;
            }
            resolve(response);
        });
    });
}

// With metadata (for authentication)
export async function getUser(userId: string, token: string): Promise<User> {
    const request = new GetUserRequest();
    request.setId(userId);
    
    const metadata = new grpc.Metadata();
    metadata.set('authorization', `Bearer ${token}`);
    
    return new Promise((resolve, reject) => {
        userClient.getUser(request, metadata, (err, response) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(response.getUser()!);
        });
    });
}
```

### 4. React Hook Pattern

```typescript
// hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { User } from '@/generated/v1/user_pb';
import { login as loginService } from '@/services/auth.service';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await loginService(email, password);
            
            if (response.getResponse()?.getSuccess()) {
                const user = response.getUser();
                setUser(user || null);
                
                // Store tokens
                localStorage.setItem('accessToken', response.getAccessToken());
                localStorage.setItem('refreshToken', response.getRefreshToken());
                
                return user;
            } else {
                throw new Error(
                    response.getResponse()?.getMessage() || 'Login failed'
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    return { user, loading, error, login };
}
```

### 5. Working with Enums

```typescript
import { UserRole } from '@/generated/common/common_pb';

// Check enum value
function isAdmin(user: User): boolean {
    return user.getRole() === UserRole.USER_ROLE_ADMIN;
}

// Convert enum to string
function roleToString(role: UserRole): string {
    switch (role) {
        case UserRole.USER_ROLE_ADMIN:
            return 'Admin';
        case UserRole.USER_ROLE_TEACHER:
            return 'Teacher';
        case UserRole.USER_ROLE_STUDENT:
            return 'Student';
        default:
            return 'Unknown';
    }
}
```

### 6. Working with Lists

```typescript
import { Question, Answer } from '@/generated/v1/question_pb';

function createQuestion(): Question {
    const question = new Question();
    question.setContent('What is 2+2?');
    question.setType(QuestionType.QUESTION_TYPE_MULTIPLE_CHOICE);
    
    // Add answers
    const answers = [
        createAnswer('A', '2', false),
        createAnswer('B', '3', false),
        createAnswer('C', '4', true),
        createAnswer('D', '5', false),
    ];
    
    const answerList = new AnswerList();
    answerList.setAnswersList(answers);
    question.setStructuredAnswers(answerList);
    
    return question;
}

function createAnswer(id: string, content: string, isCorrect: boolean): Answer {
    const answer = new Answer();
    answer.setId(id);
    answer.setContent(content);
    answer.setIsCorrect(isCorrect);
    return answer;
}
```

### 7. Working with Timestamps

```typescript
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

// Create timestamp
function setCreatedAt(question: Question): void {
    const now = new Date();
    const timestamp = new Timestamp();
    timestamp.setSeconds(Math.floor(now.getTime() / 1000));
    timestamp.setNanos((now.getTime() % 1000) * 1000000);
    question.setCreatedAt(timestamp);
}

// Parse timestamp
function getCreatedDate(question: Question): Date {
    const timestamp = question.getCreatedAt();
    if (!timestamp) return new Date();
    
    return new Date(
        timestamp.getSeconds() * 1000 + 
        timestamp.getNanos() / 1000000
    );
}

// Format timestamp
function formatCreatedAt(question: Question): string {
    const date = getCreatedDate(question);
    return date.toLocaleString('vi-VN');
}
```

---

## Common Patterns

### 1. Response Wrapper Pattern

**Backend:**
```go
func successResponse(message string) *common.Response {
    return &common.Response{
        Success: true,
        Message: message,
        Errors:  []string{},
    }
}

func errorResponse(message string, errors ...string) *common.Response {
    return &common.Response{
        Success: false,
        Message: message,
        Errors:  errors,
    }
}
```

**Frontend:**
```typescript
function handleResponse<T>(
    response: { getResponse(): Response | undefined },
    onSuccess: () => T,
): T {
    const resp = response.getResponse();
    
    if (!resp?.getSuccess()) {
        throw new Error(
            resp?.getMessage() || 'Operation failed'
        );
    }
    
    return onSuccess();
}

// Usage
const user = handleResponse(loginResponse, () => 
    loginResponse.getUser()
);
```

### 2. Pagination Pattern

**Backend:**
```go
func paginateResults(
    req *common.PaginationRequest,
    totalCount int,
) *common.PaginationResponse {
    page := req.Page
    limit := req.Limit
    
    if page < 1 {
        page = 1
    }
    if limit < 1 {
        limit = 10
    }
    
    totalPages := int32((totalCount + int(limit) - 1) / int(limit))
    
    return &common.PaginationResponse{
        Page:       page,
        Limit:      limit,
        TotalCount: int32(totalCount),
        TotalPages: totalPages,
    }
}
```

**Frontend:**
```typescript
interface PaginationState {
    page: number;
    limit: number;
    totalPages: number;
}

function usePagination(initialLimit = 10) {
    const [state, setState] = useState<PaginationState>({
        page: 1,
        limit: initialLimit,
        totalPages: 0,
    });
    
    const handleResponse = (resp: PaginationResponse) => {
        setState({
            page: resp.getPage(),
            limit: resp.getLimit(),
            totalPages: resp.getTotalPages(),
        });
    };
    
    const nextPage = () => {
        if (state.page < state.totalPages) {
            setState(s => ({ ...s, page: s.page + 1 }));
        }
    };
    
    const prevPage = () => {
        if (state.page > 1) {
            setState(s => ({ ...s, page: s.page - 1 }));
        }
    };
    
    return { ...state, handleResponse, nextPage, prevPage };
}
```

### 3. Authentication Interceptor

**Backend (Go):**
```go
import (
    "context"
    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/metadata"
    "google.golang.org/grpc/status"
)

func AuthInterceptor(
    ctx context.Context,
    req interface{},
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (interface{}, error) {
    // Skip auth for public endpoints
    if isPublicEndpoint(info.FullMethod) {
        return handler(ctx, req)
    }
    
    // Extract token from metadata
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.Unauthenticated, "missing metadata")
    }
    
    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }
    
    // Validate token
    token := strings.TrimPrefix(tokens[0], "Bearer ")
    userID, err := validateToken(token)
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    
    // Add user ID to context
    ctx = context.WithValue(ctx, "userID", userID)
    
    return handler(ctx, req)
}
```

**Frontend (TypeScript):**
```typescript
import { grpc } from '@improbable-eng/grpc-web';

export function createAuthMetadata(): grpc.Metadata {
    const metadata = new grpc.Metadata();
    
    const token = localStorage.getItem('accessToken');
    if (token) {
        metadata.set('authorization', `Bearer ${token}`);
    }
    
    return metadata;
}

// Use in all authenticated requests
export async function getAuthenticatedUser() {
    const request = new GetCurrentUserRequest();
    const metadata = createAuthMetadata();
    
    return new Promise((resolve, reject) => {
        userClient.getCurrentUser(request, metadata, (err, response) => {
            if (err) reject(err);
            else resolve(response);
        });
    });
}
```

---

## Error Handling

### Backend Error Codes

```go
import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

// Standard error responses
var (
    ErrInvalidArgument = status.Error(codes.InvalidArgument, "invalid argument")
    ErrNotFound        = status.Error(codes.NotFound, "resource not found")
    ErrAlreadyExists   = status.Error(codes.AlreadyExists, "resource already exists")
    ErrPermissionDenied = status.Error(codes.PermissionDenied, "permission denied")
    ErrUnauthenticated = status.Error(codes.Unauthenticated, "unauthenticated")
    ErrInternal        = status.Error(codes.Internal, "internal server error")
)

// Custom error with details
func newValidationError(field, message string) error {
    st := status.New(codes.InvalidArgument, "validation error")
    st, _ = st.WithDetails(&pb.ValidationError{
        Field:   field,
        Message: message,
    })
    return st.Err()
}
```

### Frontend Error Handling

```typescript
import { grpc } from '@improbable-eng/grpc-web';

export class GrpcError extends Error {
    code: grpc.Code;
    
    constructor(code: grpc.Code, message: string) {
        super(message);
        this.code = code;
        this.name = 'GrpcError';
    }
    
    isUnauthenticated(): boolean {
        return this.code === grpc.Code.Unauthenticated;
    }
    
    isNotFound(): boolean {
        return this.code === grpc.Code.NotFound;
    }
    
    isPermissionDenied(): boolean {
        return this.code === grpc.Code.PermissionDenied;
    }
}

// Error handler wrapper
export async function handleGrpcCall<T>(
    call: () => Promise<T>
): Promise<T> {
    try {
        return await call();
    } catch (err: any) {
        if (err.code) {
            throw new GrpcError(err.code, err.message);
        }
        throw err;
    }
}

// Usage in React component
function MyComponent() {
    const handleLogin = async () => {
        try {
            await handleGrpcCall(() => login(email, password));
        } catch (err) {
            if (err instanceof GrpcError) {
                if (err.isUnauthenticated()) {
                    toast.error('Invalid credentials');
                } else {
                    toast.error('Login failed: ' + err.message);
                }
            }
        }
    };
}
```

---

## Testing

### Backend Testing

```go
package service_test

import (
    "context"
    "testing"
    pb "exam-bank-system/apps/backend/pkg/proto/v1"
    "github.com/stretchr/testify/assert"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func TestUserService_Login(t *testing.T) {
    service := NewUserService(mockDB)
    
    tests := []struct {
        name    string
        req     *pb.LoginRequest
        wantErr bool
        errCode codes.Code
    }{
        {
            name: "valid login",
            req: &pb.LoginRequest{
                Email:    "test@example.com",
                Password: "password123",
            },
            wantErr: false,
        },
        {
            name: "missing email",
            req: &pb.LoginRequest{
                Password: "password123",
            },
            wantErr: true,
            errCode: codes.InvalidArgument,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            resp, err := service.Login(context.Background(), tt.req)
            
            if tt.wantErr {
                assert.Error(t, err)
                st, ok := status.FromError(err)
                assert.True(t, ok)
                assert.Equal(t, tt.errCode, st.Code())
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, resp)
                assert.True(t, resp.Response.Success)
            }
        })
    }
}
```

### Frontend Testing

```typescript
import { login } from '@/services/auth.service';
import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';

jest.mock('@/lib/grpc-client');

describe('AuthService', () => {
    it('should login successfully', async () => {
        const mockResponse = new LoginResponse();
        mockResponse.setAccessToken('test-token');
        mockResponse.getResponse()?.setSuccess(true);
        
        (UserServiceClient.prototype.login as jest.Mock)
            .mockImplementation((req, callback) => {
                callback(null, mockResponse);
            });
        
        const result = await login('test@example.com', 'password');
        
        expect(result.getAccessToken()).toBe('test-token');
        expect(result.getResponse()?.getSuccess()).toBe(true);
    });
    
    it('should handle login error', async () => {
        const error = new Error('Invalid credentials');
        
        (UserServiceClient.prototype.login as jest.Mock)
            .mockImplementation((req, callback) => {
                callback(error, null);
            });
        
        await expect(
            login('test@example.com', 'wrong-password')
        ).rejects.toThrow('Invalid credentials');
    });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Code Generation Fails

**Problem:** `buf generate` fails with import errors

**Solution:**
```bash
# Clear buf cache
buf mod clear-cache

# Update dependencies
buf mod update

# Regenerate
buf generate
```

#### 2. Import Path Issues (Go)

**Problem:** Cannot import generated code

**Solution:**
```bash
# Ensure go.mod has correct module path
go mod edit -module=exam-bank-system

# Update dependencies
go mod tidy

# Regenerate with correct path
buf generate
```

#### 3. gRPC-Web Connection Issues

**Problem:** Frontend cannot connect to backend

**Solution:**
```typescript
// Check CORS configuration in backend
// Ensure gRPC-Web proxy is running
// Verify endpoint URL

const client = new UserServiceClient(
    process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
    null,
    { debug: true }  // Enable debug logging
);
```

#### 4. Timestamp Conversion Issues

**Problem:** Timestamp fields not serializing correctly

**Solution:**
```go
import "google.golang.org/protobuf/types/known/timestamppb"

// Always use timestamppb.New()
timestamp := timestamppb.New(time.Now())

// Check for nil before accessing
if msg.CreatedAt != nil {
    time := msg.CreatedAt.AsTime()
}
```

---

## Best Practices Summary

### ✅ DO

1. **Always use Response wrapper** for consistent error handling
2. **Validate input** before processing
3. **Use enums** instead of strings for fixed values
4. **Add context** to all RPC calls
5. **Handle nil fields** when using optional/oneof
6. **Use timestamppb** for all timestamp fields
7. **Implement retries** for transient failures
8. **Log all errors** with proper context

### ❌ DON'T

1. **Don't skip error handling**
2. **Don't use magic numbers** - use enums
3. **Don't ignore UNSPECIFIED** enum values
4. **Don't hardcode** service endpoints
5. **Don't share secrets** in proto messages
6. **Don't create huge messages** - split if >50 fields
7. **Don't break backward compatibility** without versioning
8. **Don't forget to regenerate** after proto changes

---

**Document Version**: 1.0  
**Last Updated**: 26/10/2025  
**Status**: ✅ Complete

