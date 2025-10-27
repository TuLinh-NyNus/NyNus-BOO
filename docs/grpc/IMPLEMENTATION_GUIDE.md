# gRPC Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing new gRPC services in NyNus Exam Bank System.

---

## Adding a New Service

### Step 1: Define Proto File

Create new proto file in `packages/proto/v1/`:

```protobuf
// packages/proto/v1/my_service.proto
syntax = "proto3";

package v1;

import "common/common.proto";
import "google/protobuf/timestamp.proto";

// Service definition
service MyService {
  rpc MyMethod(MyRequest) returns (MyResponse);
  rpc ListItems(ListItemsRequest) returns (ListItemsResponse);
}

// Request messages
message MyRequest {
  string id = 1;
  string name = 2;
}

message ListItemsRequest {
  common.PaginationRequest pagination = 1;
  MyFilter filter = 2;
}

// Response messages
message MyResponse {
  common.Response response = 1;
  MyData data = 2;
}

message ListItemsResponse {
  common.Response response = 1;
  repeated MyData items = 2;
  common.PaginationResponse pagination = 3;
}

// Data messages
message MyData {
  string id = 1;
  string name = 2;
  string description = 3;
  google.protobuf.Timestamp created_at = 4;
}

message MyFilter {
  string name = 1;
  bool is_active = 2;
}
```

**Best Practices**:
- Use `common.Response` in all response messages
- Use `common.PaginationRequest/Response` for list operations
- Use `google.protobuf.Timestamp` for timestamps
- Follow naming conventions (PascalCase for messages, snake_case for fields)

---

### Step 2: Generate Code

**Generate Go code**:
```bash
cd packages/proto
buf generate --template buf.gen.yaml
```

**Generate TypeScript code**:
```bash
buf generate --template buf.gen.ts.yaml
```

**Verify generated files**:
```bash
# Go
ls apps/backend/pkg/proto/v1/my_service.pb.go
ls apps/backend/pkg/proto/v1/my_service_grpc.pb.go

# TypeScript
ls apps/frontend/src/generated/v1/my_service_pb.ts
ls apps/frontend/src/generated/v1/MyServiceClientPb.ts
```

---

### Step 3: Implement Backend Service

Create service implementation in `apps/backend/internal/grpc/`:

```go
// apps/backend/internal/grpc/my_service.go
package grpc

import (
    "context"
    "time"

    v1 "exam-bank-system/apps/backend/pkg/proto/v1"
    "exam-bank-system/apps/backend/pkg/proto/common"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
    "google.golang.org/protobuf/types/known/timestamppb"
)

// MyServiceServer implements v1.MyServiceServer
type MyServiceServer struct {
    v1.UnimplementedMyServiceServer
    // Dependencies
    myRepo    repository.IMyRepository
    logger    *log.Logger
}

// NewMyServiceServer creates new MyServiceServer instance
func NewMyServiceServer(
    myRepo repository.IMyRepository,
    logger *log.Logger,
) *MyServiceServer {
    return &MyServiceServer{
        myRepo: myRepo,
        logger: logger,
    }
}

// MyMethod implements the MyMethod RPC
func (s *MyServiceServer) MyMethod(ctx context.Context, req *v1.MyRequest) (*v1.MyResponse, error) {
    // 1. Validate request
    if req.Id == "" {
        return nil, status.Errorf(codes.InvalidArgument, "id is required")
    }

    if req.Name == "" {
        return nil, status.Errorf(codes.InvalidArgument, "name is required")
    }

    // 2. Get user from context (if auth required)
    userID, err := GetUserIDFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // 3. Check permissions (if needed)
    userRole, err := GetUserRoleFromContext(ctx)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get user role")
    }

    if userRole != common.UserRole_USER_ROLE_ADMIN {
        return nil, status.Errorf(codes.PermissionDenied, "admin access required")
    }

    // 4. Business logic
    data, err := s.myRepo.FindByID(ctx, req.Id)
    if err != nil {
        s.logger.Printf("Failed to find item: %v", err)
        return nil, status.Errorf(codes.NotFound, "item not found")
    }

    // Update data
    data.Name = req.Name
    data.UpdatedAt = time.Now()

    if err := s.myRepo.Update(ctx, data); err != nil {
        s.logger.Printf("Failed to update item: %v", err)
        return nil, status.Errorf(codes.Internal, "failed to update item")
    }

    // 5. Return response
    return &v1.MyResponse{
        Response: &common.Response{
            Success: true,
            Message: "Item updated successfully",
        },
        Data: &v1.MyData{
            Id:          data.ID,
            Name:        data.Name,
            Description: data.Description,
            CreatedAt:   timestamppb.New(data.CreatedAt),
        },
    }, nil
}

// ListItems implements the ListItems RPC
func (s *MyServiceServer) ListItems(ctx context.Context, req *v1.ListItemsRequest) (*v1.ListItemsResponse, error) {
    // 1. Validate pagination
    page := req.Pagination.Page
    if page < 1 {
        page = 1
    }

    pageSize := req.Pagination.PageSize
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }

    // 2. Build filter
    filter := repository.MyFilter{
        Name:     req.Filter.Name,
        IsActive: req.Filter.IsActive,
    }

    // 3. Query database
    items, total, err := s.myRepo.List(ctx, filter, page, pageSize)
    if err != nil {
        s.logger.Printf("Failed to list items: %v", err)
        return nil, status.Errorf(codes.Internal, "failed to list items")
    }

    // 4. Convert to proto messages
    protoItems := make([]*v1.MyData, len(items))
    for i, item := range items {
        protoItems[i] = &v1.MyData{
            Id:          item.ID,
            Name:        item.Name,
            Description: item.Description,
            CreatedAt:   timestamppb.New(item.CreatedAt),
        }
    }

    // 5. Calculate pagination
    totalPages := (total + int64(pageSize) - 1) / int64(pageSize)

    return &v1.ListItemsResponse{
        Response: &common.Response{
            Success: true,
            Message: "Items retrieved successfully",
        },
        Items: protoItems,
        Pagination: &common.PaginationResponse{
            TotalItems:   int32(total),
            TotalPages:   int32(totalPages),
            CurrentPage:  page,
            PageSize:     pageSize,
            HasNext:      page < int32(totalPages),
            HasPrevious:  page > 1,
        },
    }, nil
}
```

**Best Practices**:
- Always validate input
- Use `status.Errorf()` with appropriate gRPC codes
- Log errors for debugging
- Extract user info from context for auth
- Return meaningful error messages
- Use `timestamppb.New()` for timestamps

---

### Step 4: Register Service in gRPC Server

Edit `apps/backend/internal/app/app.go`:

```go
func (a *App) initGRPCServer() error {
    // ... existing code ...

    // Register MyService
    myService := grpc.NewMyServiceServer(
        a.container.GetMyRepository(),
        a.logger,
    )
    v1.RegisterMyServiceServer(a.grpcServer, myService)

    return nil
}
```

---

### Step 5: Register Service in HTTP Gateway

Edit `apps/backend/internal/server/http.go`:

```go
func (s *HTTPServer) registerServices(ctx context.Context, endpoint string, opts []grpc.DialOption) error {
    // ... existing registrations ...

    // Register MyService
    if err := v1.RegisterMyServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
        return fmt.Errorf("failed to register MyService: %w", err)
    }

    return nil
}
```

---

### Step 6: Create Frontend Service Wrapper

Create service wrapper in `apps/frontend/src/services/grpc/`:

```typescript
// apps/frontend/src/services/grpc/my-service.service.ts
import { MyServiceClient } from '@/generated/v1/MyServiceClientPb';
import { 
  MyRequest, 
  MyResponse,
  ListItemsRequest,
  ListItemsResponse,
  MyFilter
} from '@/generated/v1/my_service_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { handleGrpcError } from '@/lib/grpc/error-handler';

const GRPC_ENDPOINT = getGrpcUrl();
const myServiceClient = new MyServiceClient(GRPC_ENDPOINT);

// Get auth metadata
function getAuthMetadata(): { [key: string]: string } {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      return { 'authorization': `Bearer ${token}` };
    }
  }
  return {};
}

export class MyService {
  /**
   * Call MyMethod RPC
   */
  static async myMethod(id: string, name: string): Promise<MyResponse> {
    const request = new MyRequest();
    request.setId(id);
    request.setName(name);

    try {
      const response = await myServiceClient.myMethod(request, getAuthMetadata());
      return response;
    } catch (error) {
      throw handleGrpcError(error as RpcError);
    }
  }

  /**
   * List items with pagination and filtering
   */
  static async listItems(
    page: number = 1,
    pageSize: number = 20,
    filter?: { name?: string; isActive?: boolean }
  ): Promise<ListItemsResponse> {
    const request = new ListItemsRequest();

    // Set pagination
    const pagination = new PaginationRequest();
    pagination.setPage(page);
    pagination.setPageSize(pageSize);
    request.setPagination(pagination);

    // Set filter (if provided)
    if (filter) {
      const myFilter = new MyFilter();
      if (filter.name) myFilter.setName(filter.name);
      if (filter.isActive !== undefined) myFilter.setIsActive(filter.isActive);
      request.setFilter(myFilter);
    }

    try {
      const response = await myServiceClient.listItems(request, getAuthMetadata());
      return response;
    } catch (error) {
      throw handleGrpcError(error as RpcError);
    }
  }
}
```

---

### Step 7: Add Tests

**Backend Unit Tests** (`apps/backend/internal/grpc/my_service_test.go`):

```go
package grpc_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    v1 "exam-bank-system/apps/backend/pkg/proto/v1"
    "exam-bank-system/apps/backend/internal/grpc"
)

func TestMyService_MyMethod(t *testing.T) {
    // Arrange
    mockRepo := new(MockMyRepository)
    service := grpc.NewMyServiceServer(mockRepo, log.New())

    req := &v1.MyRequest{
        Id:   "test-id",
        Name: "test-name",
    }

    mockRepo.On("FindByID", mock.Anything, "test-id").Return(&MyData{
        ID:   "test-id",
        Name: "old-name",
    }, nil)

    mockRepo.On("Update", mock.Anything, mock.Anything).Return(nil)

    // Act
    resp, err := service.MyMethod(context.Background(), req)

    // Assert
    assert.NoError(t, err)
    assert.True(t, resp.Response.Success)
    assert.Equal(t, "test-name", resp.Data.Name)
    mockRepo.AssertExpectations(t)
}
```

**Frontend Tests** (`apps/frontend/src/services/grpc/my-service.service.test.ts`):

```typescript
import { MyService } from './my-service.service';

describe('MyService', () => {
  it('should call myMethod successfully', async () => {
    const response = await MyService.myMethod('test-id', 'test-name');
    
    expect(response.getResponse().getSuccess()).toBe(true);
    expect(response.getData().getName()).toBe('test-name');
  });

  it('should handle errors', async () => {
    await expect(MyService.myMethod('', '')).rejects.toThrow();
  });
});
```

---

## Common Patterns

### Pagination Pattern

```go
func (s *MyServiceServer) ListItems(ctx context.Context, req *v1.ListItemsRequest) (*v1.ListItemsResponse, error) {
    // Validate and set defaults
    page := req.Pagination.Page
    if page < 1 {
        page = 1
    }

    pageSize := req.Pagination.PageSize
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }

    // Query with pagination
    items, total, err := s.repo.List(ctx, filter, page, pageSize)

    // Calculate pagination metadata
    totalPages := (total + int64(pageSize) - 1) / int64(pageSize)

    return &v1.ListItemsResponse{
        Items: items,
        Pagination: &common.PaginationResponse{
            TotalItems:   int32(total),
            TotalPages:   int32(totalPages),
            CurrentPage:  page,
            PageSize:     pageSize,
            HasNext:      page < int32(totalPages),
            HasPrevious:  page > 1,
        },
    }, nil
}
```

---

## Streaming Patterns

### Server Streaming Pattern

**Use Case**: Real-time updates, large data sets

**Proto Definition**:
```protobuf
service NotificationService {
  rpc SubscribeToNotifications(SubscribeRequest) returns (stream Notification);
}
```

**Backend Implementation**:
```go
func (s *NotificationServiceServer) SubscribeToNotifications(
    req *v1.SubscribeRequest,
    stream v1.NotificationService_SubscribeToNotificationsServer,
) error {
    userID, err := GetUserIDFromContext(stream.Context())
    if err != nil {
        return status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // Create notification channel
    notifChan := make(chan *v1.Notification)
    defer close(notifChan)

    // Subscribe to notification events
    s.notificationHub.Subscribe(userID, notifChan)
    defer s.notificationHub.Unsubscribe(userID)

    // Stream notifications
    for {
        select {
        case notif := <-notifChan:
            if err := stream.Send(notif); err != nil {
                return err
            }
        case <-stream.Context().Done():
            return stream.Context().Err()
        }
    }
}
```

**Frontend Implementation (gRPC-Web)**:
```typescript
const request = new SubscribeRequest();
request.setUserId(userId);

const stream = notificationServiceClient.subscribeToNotifications(
  request,
  getAuthMetadata()
);

stream.on('data', (notification: Notification) => {
  console.log('New notification:', notification.toObject());
  // Update UI
});

stream.on('error', (error: RpcError) => {
  console.error('Stream error:', error);
});

stream.on('end', () => {
  console.log('Stream ended');
});

// Cancel stream
stream.cancel();
```

---

### Client Streaming Pattern

**Use Case**: File uploads, batch operations

**Proto Definition**:
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

**Backend Implementation**:
```go
func (s *ImportServiceServer) UploadFile(
    stream v1.ImportService_UploadFileServer,
) error {
    var filename string
    var fileData []byte

    for {
        chunk, err := stream.Recv()
        if err == io.EOF {
            // All chunks received
            break
        }
        if err != nil {
            return status.Errorf(codes.Internal, "failed to receive chunk: %v", err)
        }

        if filename == "" {
            filename = chunk.Filename
        }

        fileData = append(fileData, chunk.Data...)
    }

    // Process file
    result, err := s.processFile(filename, fileData)
    if err != nil {
        return status.Errorf(codes.Internal, "failed to process file: %v", err)
    }

    return stream.SendAndClose(&v1.UploadResponse{
        Response: &common.Response{Success: true},
        FileId:   result.ID,
    })
}
```

**Frontend Implementation**:
```typescript
// Note: Client streaming NOT supported in gRPC-Web
// Alternative: Use chunked unary RPCs

async function uploadFileInChunks(file: File) {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const request = new UploadChunkRequest();
    request.setFilename(file.name);
    request.setChunkIndex(i);
    request.setData(await chunk.arrayBuffer());

    await importServiceClient.uploadChunk(request, getAuthMetadata());
  }

  // Finalize upload
  const finalizeRequest = new FinalizeUploadRequest();
  finalizeRequest.setFilename(file.name);
  const response = await importServiceClient.finalizeUpload(
    finalizeRequest,
    getAuthMetadata()
  );

  return response;
}
```

---

### Bi-directional Streaming Pattern

**Use Case**: Chat, real-time collaboration

**Proto Definition**:
```protobuf
service ChatService {
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}
```

**Backend Implementation**:
```go
func (s *ChatServiceServer) Chat(
    stream v1.ChatService_ChatServer,
) error {
    userID, err := GetUserIDFromContext(stream.Context())
    if err != nil {
        return status.Errorf(codes.Unauthenticated, "user not authenticated")
    }

    // Create channels
    sendChan := make(chan *v1.ChatMessage)
    defer close(sendChan)

    // Goroutine to send messages
    go func() {
        for msg := range sendChan {
            if err := stream.Send(msg); err != nil {
                return
            }
        }
    }()

    // Receive messages
    for {
        msg, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }

        // Broadcast to other users
        s.chatHub.Broadcast(msg, sendChan)
    }
}
```

**Frontend Implementation**:
```typescript
// Note: Bi-directional streaming NOT supported in gRPC-Web
// Alternative: Use WebSocket or separate server/client streams
```

---

## Error Handling Best Practices

### Backend Error Handling

```go
func (s *MyServiceServer) MyMethod(ctx context.Context, req *v1.MyRequest) (*v1.MyResponse, error) {
    // 1. Validation errors
    if req.Id == "" {
        return nil, status.Errorf(codes.InvalidArgument, "id is required")
    }

    // 2. Not found errors
    data, err := s.repo.FindByID(ctx, req.Id)
    if err != nil {
        if errors.Is(err, repository.ErrNotFound) {
            return nil, status.Errorf(codes.NotFound, "item not found: %s", req.Id)
        }
        // 3. Internal errors (log details, return generic message)
        s.logger.Printf("Failed to find item: %v", err)
        return nil, status.Errorf(codes.Internal, "failed to retrieve item")
    }

    // 4. Permission errors
    if !s.hasPermission(ctx, data) {
        return nil, status.Errorf(codes.PermissionDenied, "insufficient permissions")
    }

    // 5. Business logic errors
    if err := s.validateBusinessRules(data); err != nil {
        return nil, status.Errorf(codes.FailedPrecondition, err.Error())
    }

    return &v1.MyResponse{
        Response: &common.Response{Success: true},
        Data:     data,
    }, nil
}
```

### Frontend Error Handling

```typescript
import { RpcError } from 'grpc-web';

export function handleGrpcError(error: RpcError): Error {
  const code = error.code;
  const message = error.message;

  switch (code) {
    case 3: // INVALID_ARGUMENT
      return new Error(`Dữ liệu không hợp lệ: ${message}`);

    case 5: // NOT_FOUND
      return new Error(`Không tìm thấy: ${message}`);

    case 7: // PERMISSION_DENIED
      return new Error('Bạn không có quyền thực hiện thao tác này');

    case 16: // UNAUTHENTICATED
      // Redirect to login
      window.location.href = '/login';
      return new Error('Vui lòng đăng nhập');

    case 8: // RESOURCE_EXHAUSTED
      return new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau');

    case 14: // UNAVAILABLE
      return new Error('Dịch vụ tạm thời không khả dụng');

    default:
      return new Error(`Lỗi hệ thống: ${message}`);
  }
}
```

---

## Testing Patterns

### Backend Unit Tests

```go
func TestMyService_MyMethod(t *testing.T) {
    // Arrange
    mockRepo := new(MockMyRepository)
    service := grpc.NewMyServiceServer(mockRepo, log.New())

    req := &v1.MyRequest{Id: "test-id"}
    ctx := context.Background()

    mockRepo.On("FindByID", ctx, "test-id").Return(&MyData{
        ID:   "test-id",
        Name: "test-name",
    }, nil)

    // Act
    resp, err := service.MyMethod(ctx, req)

    // Assert
    assert.NoError(t, err)
    assert.True(t, resp.Response.Success)
    assert.Equal(t, "test-name", resp.Data.Name)
    mockRepo.AssertExpectations(t)
}

func TestMyService_MyMethod_NotFound(t *testing.T) {
    // Arrange
    mockRepo := new(MockMyRepository)
    service := grpc.NewMyServiceServer(mockRepo, log.New())

    req := &v1.MyRequest{Id: "invalid-id"}
    ctx := context.Background()

    mockRepo.On("FindByID", ctx, "invalid-id").Return(nil, repository.ErrNotFound)

    // Act
    resp, err := service.MyMethod(ctx, req)

    // Assert
    assert.Error(t, err)
    assert.Nil(t, resp)
    assert.Equal(t, codes.NotFound, status.Code(err))
}
```

### Frontend Integration Tests

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should call myMethod successfully', async () => {
    const response = await service.myMethod('test-id');

    expect(response.getResponse().getSuccess()).toBe(true);
    expect(response.getData().getName()).toBe('test-name');
  });

  it('should handle not found error', async () => {
    await expect(service.myMethod('invalid-id')).rejects.toThrow('Không tìm thấy');
  });

  it('should handle permission denied error', async () => {
    await expect(service.myMethod('forbidden-id')).rejects.toThrow('không có quyền');
  });
});
```

---

**Last Updated**: 2025-01-19
**Version**: 1.1.0 - Added Streaming Patterns and Advanced Error Handling
