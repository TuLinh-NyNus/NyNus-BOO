# 🗂️ Deprecated Scripts

Thư mục này chứa các scripts không còn được sử dụng trong NyNus Exam Bank System.

## ⚠️ Cảnh báo

**KHÔNG SỬ DỤNG** các scripts trong thư mục này cho development. Chúng được giữ lại chỉ để tham khảo và backup.

## 📋 Danh sách Scripts Deprecated

### 1. `gen-proto-web-clean.ps1`
- **Lý do deprecated**: Trùng lặp chức năng với `development/gen-proto-web.ps1`
- **Thay thế bằng**: `development/gen-proto-web.ps1`
- **Ngày deprecated**: 21/09/2025

### 2. `generate-proto-frontend.ps1`
- **Lý do deprecated**: Trùng lặp chức năng với `development/gen-proto-web.ps1`
- **Thay thế bằng**: `development/gen-proto-web.ps1`
- **Ngày deprecated**: 21/09/2025

### 3. `gen-proto-simple.ps1`
- **Lý do deprecated**: Không đầy đủ tính năng, thiếu TypeScript definitions
- **Thay thế bằng**: `development/gen-proto-web.ps1`
- **Ngày deprecated**: 21/09/2025

### 4. `generate-proto-ts.ps1`
- **Lý do deprecated**: Cũ, không còn được maintain, logic không tối ưu
- **Thay thế bằng**: `development/gen-proto-web.ps1`
- **Ngày deprecated**: 21/09/2025

### 5. `generate-proto-ts.sh`
- **Lý do deprecated**: Bash script cũ, không phù hợp với Windows development environment
- **Thay thế bằng**: `development/gen-proto-web.ps1`
- **Ngày deprecated**: 21/09/2025

## 🔄 Migration Guide

Nếu bạn đang sử dụng script cũ, hãy chuyển sang script mới:

| Script cũ | Script mới | Command |
|-----------|------------|---------|
| `gen-proto-web-clean.ps1` | `gen-proto-web.ps1` | `.\scripts\development\gen-proto-web.ps1` |
| `generate-proto-frontend.ps1` | `gen-proto-web.ps1` | `.\scripts\development\gen-proto-web.ps1` |
| `gen-proto-simple.ps1` | `gen-proto-web.ps1` | `.\scripts\development\gen-proto-web.ps1` |
| `generate-proto-ts.ps1` | `gen-proto-web.ps1` | `.\scripts\development\gen-proto-web.ps1` |
| `generate-proto-ts.sh` | `gen-proto-web.ps1` | `.\scripts\development\gen-proto-web.ps1` |

## 🗑️ Kế hoạch xóa

Các scripts này sẽ được xóa hoàn toàn trong tương lai:

- **Phase 1** (Tháng 10/2025): Thông báo deprecation
- **Phase 2** (Tháng 11/2025): Di chuyển vào deprecated/
- **Phase 3** (Tháng 12/2025): Xóa hoàn toàn

## 📞 Hỗ trợ

Nếu bạn cần hỗ trợ migration hoặc có câu hỏi về scripts deprecated:
- Liên hệ NyNus Development Team
- Xem hướng dẫn trong `scripts/README.md`

---
**Created**: 21/09/2025  
**Last Updated**: 21/09/2025
