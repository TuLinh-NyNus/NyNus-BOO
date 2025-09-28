# 🛠️ NyNus Scripts Directory

Thư mục chứa các scripts hỗ trợ development và build process cho NyNus Exam Bank System.

## 📁 Cấu trúc thư mục

```
scripts/
├── project/               # 🆕 Scripts quản lý dự án
│   ├── quick-start.ps1          # Hybrid mode: Docker DB + Local apps
│   ├── start-project.ps1        # Local development mode
│   ├── stop-project.ps1         # Stop all services
│   └── README.md                # Hướng dẫn project scripts
├── docker/                # 🆕 Scripts Docker management
│   ├── docker-dev.ps1           # Development Docker environment
│   ├── docker-prod.ps1          # Production Docker environment
│   ├── setup-docker.ps1         # Advanced Docker setup
│   └── README.md                # Hướng dẫn Docker scripts
├── development/           # Scripts đang sử dụng cho development
│   ├── gen-proto-web.ps1        # Script chính để generate gRPC-Web code
│   ├── gen-admin-proto.ps1      # Script chuyên biệt cho admin proto
│   └── run-grpcwebproxy.ps1     # Chạy gRPC-Web proxy
├── setup/                 # Scripts setup môi trường
│   ├── install-protoc.ps1       # Cài đặt protoc compiler
│   └── setup-grpc-web.ps1       # Setup gRPC-Web dependencies
├── utilities/             # Scripts tiện ích
│   ├── batch-import.sh          # Batch import data
│   └── status.sh                # Check status
└── README.md             # File này
```

## 🚀 Scripts đang sử dụng

### **🆕 Project Management Scripts**

#### 1. `project/quick-start.ps1`
**Mục đích**: Hybrid development mode - Docker database + Local applications

**Sử dụng**:
```powershell
.\scripts\project\quick-start.ps1        # Start hybrid mode
.\scripts\project\quick-start.ps1 -Stop  # Stop all services
```

#### 2. `project/start-project.ps1`
**Mục đích**: Full local development mode

**Sử dụng**:
```powershell
.\scripts\project\start-project.ps1              # Start all services
.\scripts\project\start-project.ps1 -Backend     # Start only backend
```

#### 3. `project/stop-project.ps1`
**Mục đích**: Stop tất cả running services

### **🆕 Docker Management Scripts**

#### 1. `docker/docker-dev.ps1`
**Mục đích**: Development Docker environment

**Sử dụng**:
```powershell
.\scripts\docker\docker-dev.ps1          # Start development services
.\scripts\docker\docker-dev.ps1 -Build   # Force rebuild
```

#### 2. `docker/docker-prod.ps1`
**Mục đích**: Production Docker environment

#### 3. `docker/setup-docker.ps1`
**Mục đích**: Advanced Docker setup và configuration

### **Development Scripts**

#### 1. `development/gen-proto-web.ps1`
**Mục đích**: Generate TypeScript/JavaScript code từ proto files cho gRPC-Web

**Sử dụng**:
```powershell
.\scripts\development\gen-proto-web.ps1
```

**Chức năng**:
- Tự động cài đặt protoc và protoc-gen-grpc-web nếu chưa có
- Generate JavaScript files từ tất cả proto files
- Generate TypeScript definitions
- Generate gRPC-Web service files
- Tạo index.ts file để export dễ dàng

**Output**: `apps/frontend/src/generated/`

#### 2. `development/gen-admin-proto.ps1`
**Mục đích**: Generate code chỉ cho admin.proto (chuyên biệt)

**Sử dụng**:
```powershell
.\scripts\development\gen-admin-proto.ps1
```

**Chức năng**:
- Generate code chỉ cho admin.proto
- Nhẹ và nhanh hơn khi chỉ cần admin services
- Tự động cài đặt dependencies

#### 3. `development/run-grpcwebproxy.ps1`
**Mục đích**: Chạy gRPC-Web proxy để kết nối frontend với backend

**Sử dụng**:
```powershell
.\scripts\development\run-grpcwebproxy.ps1
```

### **Setup Scripts**

#### 1. `setup/install-protoc.ps1`
**Mục đích**: Cài đặt Protocol Buffers compiler (protoc)

**Sử dụng**:
```powershell
.\scripts\setup\install-protoc.ps1
```

#### 2. `setup/setup-grpc-web.ps1`
**Mục đích**: Setup gRPC-Web dependencies và tools

**Sử dụng**:
```powershell
.\scripts\setup\setup-grpc-web.ps1
```

### **Utility Scripts**

#### 1. `utilities/batch-import.sh`
**Mục đích**: Batch import data vào system

**Sử dụng**:
```bash
./scripts/utilities/batch-import.sh
```

#### 2. `utilities/status.sh`
**Mục đích**: Kiểm tra status của services

**Sử dụng**:
```bash
./scripts/utilities/status.sh
```

## 📋 Hướng dẫn sử dụng

### Khi nào sử dụng script nào?

| Tình huống | Script sử dụng | Lý do |
|------------|----------------|-------|
| **Development thông thường** | `development/gen-proto-web.ps1` | Generate tất cả proto files |
| **Chỉ làm việc với admin** | `development/gen-admin-proto.ps1` | Nhanh hơn, chỉ admin proto |
| **Setup môi trường mới** | `setup/install-protoc.ps1` | Cài đặt protoc compiler |
| **Setup gRPC-Web** | `setup/setup-grpc-web.ps1` | Cài đặt gRPC-Web dependencies |
| **Setup database** | `make db-up` | Khởi tạo database với Docker |
| **Chạy tests** | `make test` | Kiểm tra code quality |
| **Clean project** | `make clean` | Dọn dẹp files tạm |
| **Import CSV data** | `utilities/batch-import.sh` | Import bulk data |
| **Check system status** | `utilities/status.sh` | Kiểm tra services health |
| **CI/CD pipeline** | `development/gen-proto-web.ps1` | Build complete cho production |

### Yêu cầu hệ thống

- **PowerShell** (Windows)
- **pnpm** (package manager)
- **Internet connection** (để download protoc nếu cần)

### Troubleshooting

**Lỗi "protoc not found"**:
- Script sẽ tự động download protoc
- Nếu vẫn lỗi, kiểm tra internet connection

**Lỗi "permission denied"**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Lỗi "pnpm not found"**:
```powershell
npm install -g pnpm
```

## 🗂️ Scripts deprecated

Các scripts trong thư mục `deprecated/` không còn được sử dụng:

- `gen-proto-web-clean.ps1` - Trùng lặp với gen-proto-web.ps1
- `generate-proto-frontend.ps1` - Trùng lặp với gen-proto-web.ps1  
- `gen-proto-simple.ps1` - Không đầy đủ tính năng
- `generate-proto-ts.ps1` - Cũ, không còn maintain
- `generate-proto-ts.sh` - Bash version cũ

**⚠️ Lưu ý**: Các scripts deprecated được giữ lại để tham khảo, không nên sử dụng trong development.

## 🔄 Workflow thông thường

1. **Thay đổi proto files** trong `packages/proto/`
2. **Chạy script generate**:
   ```powershell
   .\scripts\development\gen-proto-web.ps1
   ```
3. **Kiểm tra generated files** trong `apps/frontend/src/generated/`
4. **Import và sử dụng** trong TypeScript code:
   ```typescript
   import { UserServiceClient } from '@/generated';
   ```

## 📞 Hỗ trợ

Nếu gặp vấn đề với scripts, hãy:
1. Kiểm tra requirements đã đủ chưa
2. Xem troubleshooting section
3. Liên hệ team development

---
**Last Updated**: 21/09/2025  
**Maintained by**: NyNus Development Team
