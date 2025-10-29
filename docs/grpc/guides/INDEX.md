#  Guides - Hướng Dẫn Thực Tế

Bắt đầu code với gRPC - thêm service, triển khai, migration.

## 📚 Files Trong Mục Này

1. **IMPLEMENTATION_GUIDE.md** (698 dòng)
   - Thêm service mới từ đầu
   - Proto file definition
   - Backend implementation
   - Frontend integration
   - Testing

2. **PROTO_USAGE_GUIDE.md** (839 dòng)
   - Cài đặt tools
   - Backend (Go) usage
   - Frontend (TypeScript) usage
   - Common patterns
   - Error handling

3. **MIGRATION_GUIDE.md**
   - Tại sao migrate sang gRPC
   - Dual support strategy
   - Step-by-step migration
   - Testing & rollout

##  Workflow

**Thêm service mới:**
1. Đọc IMPLEMENTATION_GUIDE.md (bước 1-2: Proto + Generation)
2. Xem ví dụ trong PROTO_USAGE_GUIDE.md
3. Code service backend (Go)
4. Code client frontend (TS)

**Migrate từ REST:**
1. Đọc MIGRATION_GUIDE.md
2. Tham khảo PROTO_USAGE_GUIDE.md

---

Tham khảo: [../reference/](../reference/)
