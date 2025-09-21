# 🛠️ NyNus Scripts Directory

Thư mục chứa các scripts hỗ trợ development và build process cho NyNus Exam Bank System.

## 📁 Cấu trúc thư mục

```
scripts/
├── development/           # Scripts đang sử dụng cho development
│   ├── gen-proto-web.ps1        # Script chính để generate gRPC-Web code
│   ├── gen-admin-proto.ps1      # Script chuyên biệt cho admin proto
│   └── run-grpcwebproxy.ps1     # Chạy gRPC-Web proxy
├── setup/                 # Scripts setup môi trường
│   ├── install-protoc.ps1       # Cài đặt protoc compiler
│   └── setup-grpc-web.ps1       # Setup gRPC-Web dependencies
├── database/              # Scripts database
│   ├── setup-db.sh              # Setup database
│   ├── setup-simple-db.sh       # Setup simple database
│   └── gen-db.sh                # Generate database
├── testing/               # Scripts testing
│   ├── test.sh                  # Chạy tests
│   └── test-apis.sh             # Test APIs
├── utilities/             # Scripts tiện ích
│   ├── batch-import.sh          # Batch import data
│   ├── clean.sh                 # Clean project
│   └── status.sh                # Check status
├── deprecated/            # Scripts cũ không còn sử dụng
│   ├── README.md                # Hướng dẫn deprecated scripts
│   ├── [protobuf scripts]       # Scripts protobuf cũ
│   └── [bash scripts]           # Scripts bash cũ
└── README.md             # File này
```

## 🚀 Scripts đang sử dụng

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

### **Database Scripts**

#### 1. `database/setup-db.sh`
**Mục đích**: Setup database cho development

**Sử dụng**:
```bash
./scripts/database/setup-db.sh
```

#### 2. `database/setup-simple-db.sh`
**Mục đích**: Setup simple database configuration

**Sử dụng**:
```bash
./scripts/database/setup-simple-db.sh
```

### **Testing Scripts**

#### 1. `testing/test.sh`
**Mục đích**: Chạy tất cả tests

**Sử dụng**:
```bash
./scripts/testing/test.sh
```

#### 2. `testing/test-apis.sh`
**Mục đích**: Test API endpoints

**Sử dụng**:
```bash
./scripts/testing/test-apis.sh
```

### **Utility Scripts**

#### 1. `utilities/batch-import.sh`
**Mục đích**: Batch import data vào system

**Sử dụng**:
```bash
./scripts/utilities/batch-import.sh
```

#### 2. `utilities/clean.sh`
**Mục đích**: Clean project files và cache

**Sử dụng**:
```bash
./scripts/utilities/clean.sh
```

#### 3. `utilities/status.sh`
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
| **Setup database** | `database/setup-db.sh` | Khởi tạo database |
| **Chạy tests** | `testing/test.sh` | Kiểm tra code quality |
| **Clean project** | `utilities/clean.sh` | Dọn dẹp files tạm |
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
