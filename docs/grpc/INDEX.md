# 📚 gRPC Documentation - INDEX

**NyNus Exam Bank System - Tài liệu gRPC Tập Trung**

---

## 🎯 Bắt Đầu Nhanh

Bạn là?

### 👤 **Người mới** → 📖 [**Bắt đầu ở đây**](./basics/README.md)
- Tìm hiểu gRPC là gì
- Kiến trúc hệ thống
- Các khái niệm cơ bản

### 💻 **Developer muốn code** → 🛠️ [**Hướng dẫn thực thi**](./guides/README.md)
- Thêm service mới
- Triển khai backend/frontend
- Migration từ REST

### 🔍 **Cần tham khảo nhanh** → 📋 [**Tham khảo**](./reference/README.md)
- API reference
- Quick reference
- Service status
- Tất cả services

### 🔐 **Về bảo mật & token** → 🛡️ [**Bảo mật**](./security/README.md)
- JWT token management
- Authentication flow
- Authorization & roles

### ⚙️ **Cài đặt & sinh code** → ⚡ [**Triển khai**](./implementation/README.md)
- Cách sinh code
- Cài đặt tools
- Validation

### 🐛 **Gặp lỗi** → 🆘 [**Khắc phục sự cố**](./advanced/TROUBLESHOOTING.md)
- Common issues
- Debugging
- Troubleshooting guide

---

## 📁 Cấu Trúc Thư Mục

```
docs/grpc/
│
├── 📖 basics/                    # Khái niệm cơ bản
│   ├── README.md                # Khái quát gRPC + Quick Start
│   └── GRPC_ARCHITECTURE.md     # Kiến trúc hệ thống chi tiết
│
├── 🛠️ guides/                     # Hướng dẫn thực tế
│   ├── README.md                # Index hướng dẫn
│   ├── IMPLEMENTATION_GUIDE.md   # Thêm service mới
│   ├── PROTO_USAGE_GUIDE.md     # Cách dùng Protocol Buffers
│   └── MIGRATION_GUIDE.md       # REST → gRPC
│
├── 📋 reference/                 # Tham khảo nhanh
│   ├── README.md                # Index tham khảo
│   ├── PROTO_QUICK_REFERENCE.md # Cheat sheet
│   ├── PROTO_SYSTEM_ANALYSIS.md # Phân tích 18 services
│   ├── API_REFERENCE.md         # Tất cả API
│   └── TOOLING_VERSIONS.md      # Versions & setup
│
├── 🛡️ security/                  # Bảo mật
│   ├── README.md                # Index bảo mật
│   ├── SECURITY.md              # Tổng quan bảo mật
│   ├── jwt-token-management-phase2.md
│   └── jwt-token-management-phase3-plan.md
│
├── ⚙️ implementation/             # Kỹ thuật triển khai
│   ├── README.md                # Index triển khai
│   └── GENERATION_WORKFLOW.md   # Sinh code Protocol Buffers
│
├── 🆘 advanced/                  # Nâng cao
│   ├── README.md                # Index nâng cao
│   └── TROUBLESHOOTING.md       # Khắc phục sự cố
│
├── 📦 archive/                   # Lưu trữ (deprecated)
│   ├── 2025-01-historical/
│   └── 2025-10-deprecated/
│
└── INDEX.md                      # TẬP TRUNG ← BẠN ĐANG ĐỌC

```

---

## 🚀 Workflow Phổ Biến

### **Workflow 1: Tôi là newbie**
1. Đọc [basics/README.md](./basics/README.md) - Khái quát
2. Đọc [basics/GRPC_ARCHITECTURE.md](./basics/GRPC_ARCHITECTURE.md) - Kiến trúc
3. Chọn một guide phù hợp từ [guides/](./guides/README.md)

### **Workflow 2: Thêm service mới**
1. Đọc [guides/IMPLEMENTATION_GUIDE.md](./guides/IMPLEMENTATION_GUIDE.md)
2. Tham khảo [reference/PROTO_QUICK_REFERENCE.md](./reference/PROTO_QUICK_REFERENCE.md)
3. Chạy [implementation/GENERATION_WORKFLOW.md](./implementation/GENERATION_WORKFLOW.md)
4. Kiểm tra [reference/API_REFERENCE.md](./reference/API_REFERENCE.md)

### **Workflow 3: Gặp lỗi**
1. Tìm lỗi trong [advanced/TROUBLESHOOTING.md](./advanced/TROUBLESHOOTING.md)
2. Kiểm tra [security/SECURITY.md](./security/SECURITY.md) (nếu auth-related)
3. Tham khảo [reference/TOOLING_VERSIONS.md](./reference/TOOLING_VERSIONS.md)

### **Workflow 4: Cần info chi tiết về service**
1. Tìm trong [reference/PROTO_SYSTEM_ANALYSIS.md](./reference/PROTO_SYSTEM_ANALYSIS.md)
2. Kiểm tra [reference/API_REFERENCE.md](./reference/API_REFERENCE.md)
3. Xem ví dụ trong [guides/PROTO_USAGE_GUIDE.md](./guides/PROTO_USAGE_GUIDE.md)

---

## 📊 File Statistics

| Thư mục | Files | Tổng dòng | Mục đích |
|---------|-------|----------|---------|
| **basics/** | 2 | ~620 | Khái niệm + kiến trúc |
| **guides/** | 3 | ~2,235 | Hướng dẫn thực tế |
| **reference/** | 4 | ~1,700 | Tham khảo chi tiết |
| **security/** | 3 | ~1,500 | Bảo mật + token |
| **implementation/** | 1 | ~95 | Sinh code workflow |
| **advanced/** | 1 | ~300 | Troubleshooting |
| **archive/** | 5 | - | Lưu trữ (deprecated) |

**Tổng**: 19 files (active 14) × 6,450+ dòng

---

## 🎯 Tìm Nhanh

### Muốn biết về...

| Chủ đề | File | Thư mục |
|--------|------|--------|
| **Bắt đầu lập trình** | IMPLEMENTATION_GUIDE.md | guides/ |
| **Lỗi gì thì fix sao** | TROUBLESHOOTING.md | advanced/ |
| **API có gì** | API_REFERENCE.md | reference/ |
| **Cheat sheet nhanh** | PROTO_QUICK_REFERENCE.md | reference/ |
| **Cài đặt tools** | TOOLING_VERSIONS.md | reference/ |
| **Sinh code proto** | GENERATION_WORKFLOW.md | implementation/ |
| **JWT token** | security/SECURITY.md | security/ |
| **Kiến trúc hệ thống** | GRPC_ARCHITECTURE.md | basics/ |
| **Ví dụ code** | PROTO_USAGE_GUIDE.md | guides/ |
| **18 services nào** | PROTO_SYSTEM_ANALYSIS.md | reference/ |

---

## 📞 Cần Giúp Đỡ?

1. **Không biết bắt đầu từ đâu** → Đọc [basics/README.md](./basics/README.md)
2. **Cần code nhanh** → Tham khảo [guides/IMPLEMENTATION_GUIDE.md](./guides/IMPLEMENTATION_GUIDE.md)
3. **Muốn copy-paste code** → Xem [reference/PROTO_QUICK_REFERENCE.md](./reference/PROTO_QUICK_REFERENCE.md)
4. **Có lỗi** → Vào [advanced/TROUBLESHOOTING.md](./advanced/TROUBLESHOOTING.md)
5. **Muốn hiểu sâu** → Học [basics/GRPC_ARCHITECTURE.md](./basics/GRPC_ARCHITECTURE.md)

---

## ✅ Cách Sử Dụng

Tất cả các files đều **independently readable** - bạn có thể:
- 🎯 Đi thẳng vào file bạn cần
- 🔗 Click link để navigate
- 📖 Đọc từ đầu đến cuối
- 💾 Copy code examples

**Hết việc, đi code tiếp!** 🚀

---

**Last Updated**: 2025-10-29  
**Version**: 1.0 (Restructured)  
**Status**: ✅ Ready to Use

