# MapCode Import Script

Script này dùng để import file MapCode.md chính vào database.

## Yêu Cầu

- PostgreSQL database đã chạy
- Go 1.21+
- File `tools/parsing-question/src/parser/MapCode.md` tồn tại

## Cách Sử Dụng

### 1. Cài đặt dependencies

```bash
cd scripts/mapcode
go mod init mapcode-import
go get github.com/lib/pq
```

### 2. Cấu hình database

Mở file `import-mapcode.go` và kiểm tra thông tin kết nối database:

```go
dbHost     = "localhost"
dbPort     = 5432
dbUser     = "postgres"
dbPassword = "postgres"
dbName     = "exam_bank"
```

### 3. Chạy script

```bash
go run import-mapcode.go
```

hoặc build trước:

```bash
go build -o import-mapcode.exe
./import-mapcode.exe
```

## Script Thực Hiện Gì?

1. ✅ Kết nối database
2. ✅ Đọc file MapCode.md từ `tools/parsing-question/src/parser/MapCode.md`
3. ✅ Tạo version folder: `docs/resources/latex/mapcode/v{date}/`
4. ✅ Copy MapCode.md vào version folder
5. ✅ Tạo record trong `mapcode_versions` table
6. ✅ Set version mới làm active
7. ✅ Hiển thị summary

## Output Mẫu

```
🚀 MapCode Import Tool - Starting...
📡 Connecting to database...
✅ Database connected successfully
📖 Reading MapCode.md from: tools/parsing-question/src/parser/MapCode.md
✅ Read 245678 bytes from MapCode.md
📁 Creating version folder: docs/resources/latex/mapcode/v2025-10-26
💾 Writing MapCode to: docs/resources/latex/mapcode/v2025-10-26/MapCode-2025-10-26.md
✅ MapCode file written successfully
💾 Creating version record in database...
✅ Version created successfully with ID: 12345678-1234-1234-1234-123456789012
🔄 Setting version as active...
✅ Version set as active

============================================================
🎉 MapCode Import Completed Successfully!
============================================================
Version ID:   12345678-1234-1234-1234-123456789012
Version:      v2025-10-26
File Path:    docs/resources/latex/mapcode/v2025-10-26/MapCode-2025-10-26.md
Status:       ACTIVE
Lines:        4666
============================================================
```

## Kiểm Tra Sau Import

### 1. Verify trong database

```sql
-- Kiểm tra version đã tạo
SELECT * FROM mapcode_versions ORDER BY created_at DESC LIMIT 1;

-- Kiểm tra active version
SELECT * FROM mapcode_versions WHERE is_active = true;
```

### 2. Test translation qua gRPC

```bash
# Sử dụng grpcurl hoặc gRPC client
grpcurl -plaintext \
  -d '{"question_code": "0P1N1"}' \
  localhost:50051 \
  v1.MapCodeService/TranslateCode
```

### 3. Kiểm tra frontend

- Mở admin panel: `/3141592654/admin/mapcode`
- Verify version mới hiển thị
- Test translation trên UI

## Troubleshooting

### Database connection failed

```
❌ Failed to connect to database: connection refused
```

**Giải pháp**: 
- Kiểm tra PostgreSQL đang chạy
- Verify thông tin kết nối (host, port, user, password, dbname)

### File not found

```
❌ Failed to read MapCode.md: no such file or directory
```

**Giải pháp**:
- Chạy script từ root directory của project
- Verify file tồn tại tại `tools/parsing-question/src/parser/MapCode.md`

### Version already exists

```
❌ Failed to create version record: duplicate key value violates unique constraint
```

**Giải pháp**:
- Version name phải unique
- Script tự động tạo version theo ngày hiện tại
- Nếu đã import hôm nay, xóa version cũ trước hoặc đổi tên version

