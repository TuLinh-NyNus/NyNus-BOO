# ⚙️ Workflow Sinh Code Protocol Buffers

**Hướng dẫn sinh code Go + TypeScript từ `.proto` files**

---

## 📋 Mục Lục

1. [Chuẩn Bị](#chuẩn-bị)
2. [Workflow Nhanh](#workflow-nhanh-nếu-đã-cài-đặt)
3. [Chi Tiết Các Bước](#chi-tiết-các-bước)
4. [Troubleshooting](#troubleshooting)

---

## 🎯 Chuẩn Bị

### **1. Cài Đặt Tools (Lần Đầu)**

#### **Go tools:**
```powershell
# Cài Buf CLI
go install github.com/bufbuild/buf/cmd/buf@latest

# Cài protoc plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest
```

#### **TypeScript tools:**
```powershell
# Chạy setup script
.\scripts\setup\setup-grpc-web.ps1
```

#### **Verify installation:**
```powershell
buf --version
protoc-gen-go --version
# Tất cả phải > 0
```

---

## 🚀 Workflow Nhanh (Nếu Đã Cài Đặt)

### **Quy trình 2 bước sau khi modify `.proto`:**

```powershell
# Bước 1: Sinh Go code
cd packages/proto
buf generate --template buf.gen.yaml

# Bước 2: Sinh TypeScript code
buf generate --template buf.gen.frontend.yaml

# Bước 3: Tidy dependencies
cd ../../
go mod tidy
cd apps/frontend
pnpm install
```

**Xong!** ✅

---

## 📖 Chi Tiết Các Bước

### **BƯỚC 1: Modify `.proto` Files**

**Nơi cần sửa:**
```
packages/proto/
├── common/
│   └── common.proto          ← Common types
└── v1/
    ├── user.proto            ← Modify ở đây
    ├── question.proto
    ├── exam.proto
    └── ... (18 services)
```

**Ví dụ thêm RPC mới:**
```protobuf
// packages/proto/v1/user.proto

service UserService {
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc MyNewRPC(MyRequest) returns (MyResponse);  ← Thêm dòng này
}

message MyRequest {
  string email = 1;
}

message MyResponse {
  common.Response response = 1;
}
```

---

### **BƯỚC 2: Validate Proto Files**

```powershell
cd packages/proto

# Validate syntax
buf lint

# Check for breaking changes
buf breaking --against '.git#branch=main'
```

**Nếu lỗi:** Fix `.proto` file trước khi generate

---

### **BƯỚC 3: Sinh Go Code (Backend)**

```powershell
cd packages/proto

# Generate Go protobuf + gRPC + gateway
buf generate --template buf.gen.yaml
```

**Output được tạo ở:**
```
apps/backend/pkg/proto/v1/
├── user.pb.go
├── user_grpc.pb.go
└── ...
```

**Verify:**
```powershell
ls apps/backend/pkg/proto/v1/*.pb.go
# Phải thấy user.pb.go, user_grpc.pb.go, etc.
```

---

### **BƯỚC 4: Sinh TypeScript Code (Frontend)**

```powershell
cd packages/proto

# Generate TypeScript + gRPC-Web
buf generate --template buf.gen.frontend.yaml
```

**Output được tạo ở:**
```
apps/frontend/src/generated/v1/
├── user_pb.ts
├── user_grpc_web_pb.ts
└── ...
```

**Verify:**
```powershell
ls apps/frontend/src/generated/v1/*_pb.ts
# Phải thấy user_pb.ts, user_grpc_web_pb.ts, etc.
```

---

### **BƯỚC 5: Update Dependencies**

```powershell
# Go dependencies
go mod tidy

# TypeScript dependencies
cd apps/frontend
pnpm install
```

---

### **BƯỚC 6: Build & Test**

```powershell
# Test Go build
cd apps/backend
go build ./...

# Test TypeScript build
cd apps/frontend
pnpm build
```

**Nếu lỗi:** Xem [Troubleshooting](#troubleshooting)

---

## 🛠️ Troubleshooting

### **❌ "buf: command not found"**
**Fix:**
```powershell
go install github.com/bufbuild/buf/cmd/buf@latest
# Thêm $GOPATH/bin vào PATH
```

### **❌ "protoc-gen-go: command not found"**
**Fix:**
```powershell
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
```

### **❌ "No such file or directory: buf.gen.frontend.yaml"**
**Kiểm tra:**
```powershell
ls packages/proto/buf.gen*.yaml
# Phải thấy: buf.gen.yaml, buf.gen.frontend.yaml
```

### **❌ TypeScript import errors**
**Nguyên nhân:** Generated files chưa tạo

**Fix:**
```powershell
cd packages/proto
buf generate --template buf.gen.frontend.yaml
cd ../../apps/frontend
pnpm install
```

### **❌ Go build fails sau generate**
**Nguyên nhân:** go.mod chưa tidy

**Fix:**
```powershell
cd apps/backend
go mod tidy
go build ./...
```

### **❌ Breaking change detected**
**Nguyên nhân:** Modify `.proto` cách khác (delete field, rename enum, etc.)

**Fix:**
```powershell
cd packages/proto

# Xem chi tiết breaking change
buf breaking --against '.git#branch=main'

# Nếu intentional: revert hoặc create v2 API
```

---

## 📝 Workflow Diagram

```
Modify .proto
    ↓
buf lint (validate)
    ↓
buf breaking (check compatibility)
    ↓
buf generate (Go code)
    ↓
buf generate (TypeScript code)
    ↓
go mod tidy
    ↓
pnpm install
    ↓
go build
    ↓
pnpm build
    ↓
✅ Done!
```

---

## ⚡ Quick Commands

```powershell
# Check syntax
buf lint packages/proto

# Generate tất cả
cd packages/proto && buf generate && buf generate --template buf.gen.frontend.yaml

# Tidy
go mod tidy

# Build backend
cd apps/backend && go build ./...

# Build frontend
cd apps/frontend && pnpm build
```

---

## 🎯 Key Files Reference

| File | Mục đích |
|------|---------|
| `packages/proto/buf.yaml` | Lint rules |
| `packages/proto/buf.gen.yaml` | Go generation config |
| `packages/proto/buf.gen.frontend.yaml` | TypeScript generation config |
| `packages/proto/v1/*.proto` | Service definitions |
| `packages/proto/common/common.proto` | Common types |

---

## 📚 Xem Thêm

- [guides/IMPLEMENTATION_GUIDE.md](../guides/IMPLEMENTATION_GUIDE.md) - Thêm service mới
- [reference/TOOLING_VERSIONS.md](../reference/TOOLING_VERSIONS.md) - Tool versions
- [advanced/TROUBLESHOOTING.md](../advanced/TROUBLESHOOTING.md) - Troubleshooting chung

---

**Last Updated**: 2025-10-29  
**Status**: ✅ Simplified & Ready