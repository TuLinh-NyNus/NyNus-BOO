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
├── import/                # 🆕 Scripts import dữ liệu
│   └── import-questions-from-csv.ts  # Import questions từ CSV
├── exam/                  # 🆕 Scripts quản lý exams
│   └── create-10-exams.ts       # Tạo 10 exams mẫu
├── database/              # 🆕 Scripts database management
│   └── start-prisma-studio.ps1  # Start Prisma Studio locally
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

### **🆕 Import Scripts**

#### 1. `import/import-questions-from-csv.ts`
**Mục đích**: Import questions từ CSV file vào database

**Sử dụng**:
```powershell
cd apps/frontend
$env:DATABASE_URL="postgresql://exam_bank_user:exam_bank_password@localhost:5433/exam_bank_db?schema=public&sslmode=disable"
pnpx tsx ../../scripts/import/import-questions-from-csv.ts
```

**Chức năng**:
- Đọc questions từ `docs/question_new_fixed.csv`
- Tự động tạo subcount (TL.1, TL.2, ..., TL.n)
- Tạo question_codes nếu chưa tồn tại
- Batch insert 100 questions mỗi lần
- Hỗ trợ 4 loại câu hỏi: MC, TF, SA, ES

**Kết quả gần nhất**:
- 2,793 questions imported
- 702 question codes created
- Phân loại: MC (1,529), SA (705), TF (450), ES (109)

### **🆕 Exam Scripts**

#### 1. `exam/create-10-exams.ts`
**Mục đích**: Tạo 10 exams với cấu trúc đa dạng từ questions đã import

**Sử dụng**:
```powershell
cd apps/frontend
$env:DATABASE_URL="postgresql://exam_bank_user:exam_bank_password@localhost:5433/exam_bank_db?schema=public&sslmode=disable"
pnpx tsx ../../scripts/exam/create-10-exams.ts
```

**Chức năng**:
- Tạo 10 exams với cấu trúc khác nhau
- Tự động tính total_points dựa trên question types
- Phân bổ questions theo difficulty và type
- Hỗ trợ exam_type: generated, official

**Exams được tạo**:
1. Đề thi tổng hợp Toán 10 - Học kỳ 1 (50 câu, 70 điểm, 90 phút)
2. Kiểm tra 15 phút - Toán 10 Chương 1 (15 câu, 15 điểm, 15 phút)
3. Đề thi học sinh giỏi Toán 10 (35 câu, 65 điểm, 120 phút)
4. Đề thi giữa kỳ 1 - Toán 10 (30 câu, 35 điểm, 60 phút)
5. Đề thi cuối kỳ 1 - Toán 10 (38 câu, 52 điểm, 90 phút)
6. Đề luyện tập Toán 10 - Chương 2 (30 câu, 35 điểm, 45 phút)
7. Đề thi thử THPT Quốc gia - Toán (50 câu, 60 điểm, 90 phút)
8. Kiểm tra 45 phút - Toán 10 Chương 3 (25 câu, 30 điểm, 45 phút)
9. Đề ôn tập học kỳ 2 - Toán 10 (50 câu, 60 điểm, 90 phút)
10. Đề thi Olympic Toán 10 (25 câu, 85 điểm, 150 phút)

**Kết quả gần nhất**:
- 10 exams created
- 348 questions used

### **🆕 Database Scripts**

#### 1. `database/start-prisma-studio.ps1`
**Mục đích**: Start Prisma Studio locally (thay vì Docker)

**Sử dụng**:
```powershell
# Start Prisma Studio
.\scripts\database\start-prisma-studio.ps1

# Stop Prisma Studio
.\scripts\database\start-prisma-studio.ps1 -Stop
```

**Chức năng**:
- Kiểm tra PostgreSQL container đang chạy
- Start Prisma Studio local tại port 5555
- Tự động mở browser
- Kết nối đến database: localhost:5433

**Ưu điểm so với Docker**:
- Không cần install dependencies mỗi lần restart
- Start nhanh hơn (< 10 giây)
- Dễ debug và monitor

**URL**: http://localhost:5555

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
