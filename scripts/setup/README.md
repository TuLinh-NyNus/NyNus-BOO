# 🔧 Setup Scripts

Scripts để setup môi trường development cho NyNus Exam Bank System.

## Scripts có sẵn

### `install-protoc.ps1`
**Mục đích**: Cài đặt Protocol Buffers compiler (protoc) locally

**Sử dụng**:
```powershell
.\scripts\setup\install-protoc.ps1
```

**Chức năng**:
- Download protoc v28.3 cho Windows
- Extract vào `tools/protoc/bin/`
- Không cần admin rights
- Tự động kiểm tra version

### `setup-grpc-web.ps1`
**Mục đích**: Setup gRPC-Web dependencies và tools

**Sử dụng**:
```powershell
.\scripts\setup\setup-grpc-web.ps1
```

**Chức năng**:
- Cài đặt gRPC-Web dependencies trong frontend
- Download protoc-gen-grpc-web plugin
- Tạo generated directory
- Kiểm tra pnpm availability

## Thứ tự setup

1. **Chạy install-protoc.ps1 trước**
2. **Sau đó chạy setup-grpc-web.ps1**
3. **Cuối cùng có thể chạy development scripts**

## Requirements

- **PowerShell** (Windows)
- **pnpm** (package manager)
- **Internet connection** (để download tools)

---
**Last Updated**: 21/09/2025
