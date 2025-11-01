# 📚 Hướng Dẫn Sử Dụng MapCode - Quản Lý Phân Loại Câu Hỏi

**Phiên bản**: 2.0.0  
**Cập nhật**: 2025-01-19  
**Dành cho**: Quản trị viên hệ thống

---

## 🎯 Tổng Quan

**MapCode** là hệ thống phân loại câu hỏi theo cấp độ, chủ đề, chương học, mức độ khó, bài học, và hình thức trắc nghiệm. Giao diện quản lý cho phép bạn:

✅ Upload và quản lý các phiên bản MapCode  
✅ So sánh sự khác biệt giữa các phiên bản  
✅ Xuất dữ liệu sang 3 định dạng (Markdown, JSON, CSV)  
✅ Theo dõi hiệu suất dịch và cache

---

## 🚀 Bắt Đầu Nhanh

### Truy cập Giao Diện MapCode

1. Đăng nhập với tài khoản **Admin**
2. Vào **Quản trị** → **MapCode**
3. Bạn sẽ thấy:
   - 📊 Dashboard Metrics (hiệu suất)
   - 📤 Upload File MapCode mới
   - 📋 Danh sách Versions (phiên bản)
   - 🔄 So Sánh Versions
   - 📥 Export Versions

---

## 📤 **UPLOAD MapCode File Mới**

### Bước 1: Chuẩn Bị File

File MapCode phải đúng định dạng:

```markdown
# MapCode Configuration

## [N] Nhận biết
## [T] Thông hiểu
## [V] Vận dụng
## [C] Vận dụng cao

# Lớp 10 - -[0]
## NGÂN HÀNG CHÍNH - ----[P]
### Mệnh đề - -------[1]
#### Nhận biết - [N]
##### Mệnh đề - [1]

#### Thông hiểu - [T]
##### Tập hợp - [2]
```

**Yêu cầu**:
- ✅ Định dạng `.md` (Markdown)
- ✅ Kích thước < 5MB
- ✅ Bao gồm định nghĩa các level: `[N]`, `[T]`, `[V]`, `[C]`
- ✅ Có cấu trúc phân cấp dùng dấu `-` (Grade, Subject, Chapter, Level, Lesson)

### Bước 2: Upload File

1. Click nút **"Upload MapCode File"**
2. Chọn file `.md` từ máy tính
3. Hệ thống tự động kiểm tra:
   - ✅ Kích thước file
   - ✅ Định dạng Markdown
   - ✅ Các section bắt buộc
   - ✅ Encoding UTF-8

4. **Nếu lỗi**: Sửa file theo hướng dẫn, upload lại

### Bước 3: Nhập Thông Tin Version

| Trường | Bắt buộc | Ví dụ |
|--------|----------|-------|
| **Version ID** | ✅ Có | `v2025-01-19` |
| **Tên hiển thị** | ✅ Có | `MapCode Q1 2025` |
| **Mô tả** | ❌ Không | `Thêm chương mới cho lớp 12` |

**Mẹo**: Click **"Auto"** để tự động sinh ID theo ngày hôm nay

### Bước 4: Kích Hoạt Version

Sau upload thành công:
1. Tìm version vừa upload trong bảng danh sách
2. Click **"Kích hoạt"** để đặt làm version chính
3. Hệ thống tự động:
   - ✅ Clear cache cũ
   - ✅ Pre-cache top 1000 câu hỏi thường dùng
   - ✅ Ghi log sự kiện

---

## 📊 **DASHBOARD METRICS**

Theo dõi hiệu suất MapCode translation:

| Chỉ số | Ý nghĩa | Mục tiêu |
|-------|---------|---------|
| **Tổng số dịch** | Số lần MapCode được dịch | Càng cao càng tốt |
| **Tỉ lệ cache hit** | % dịch từ cache (nhanh) | > 80% |
| **Thời gian trung bình** | Tốc độ dịch trung bình | < 5ms |
| **Lỗi dịch** | Số lỗi xảy ra | 0 tốt nhất |

**Làm mới**: Click nút **"Làm mới"** để cập nhật dữ liệu mới nhất

---

## 🔄 **SO SÁNH HAI VERSIONS**

Xem sự khác biệt giữa các phiên bản:

### Cách sử dụng:

1. **Chọn Version A**: Dropdown đầu tiên
2. **Chọn Version B**: Dropdown thứ hai
3. (Tùy chọn) Click **Hoán đổi** 🔄 để đổi vị trí
4. Click **So sánh**

### Kết quả:

```
✅ Thêm: 15 entries mới
❌ Xóa: 3 entries bị gỡ
🔄 Thay đổi: 8 entries được cập nhật
⏸️ Không thay đổi: 1,234 entries
```

---

## 📥 **XUẤT (EXPORT) VERSIONS**

Tải về dữ liệu MapCode dưới 3 định dạng:

### Format 1: Markdown (.md)

**Dùng cho**: Tài liệu, lưu trữ, chỉnh sửa  
**Cách xuất**: Click **Export** → **Markdown**

```markdown
# MapCode Configuration - v2025-01-19

## Version Details
- **Version ID**: `v2025-01-19`
- **Name**: `Q1 2025 Update`
- **Created By**: `admin10@nynus.edu.vn`

## Grades
- `0`: Lớp 10
- `1`: Lớp 11
- `2`: Lớp 12

## Levels
- `N`: Nhận biết
- `T`: Thông hiểu
...
```

### Format 2: JSON (.json)

**Dùng cho**: API integration, backend processing  
**Cách xuất**: Click **Export** → **JSON**

```json
{
  "version": "v2025-01-19",
  "name": "Q1 2025 Update",
  "grades": {
    "0": "Lớp 10",
    "1": "Lớp 11"
  },
  "levels": {
    "N": "Nhận biết",
    "T": "Thông hiểu"
  }
}
```

### Format 3: CSV (.csv)

**Dùng cho**: Excel, spreadsheet, data analysis  
**Cách xuất**: Click **Export** → **CSV**

```csv
Type,Code,Description
Grade,0,Lớp 10
Grade,1,Lớp 11
Level,N,Nhận biết
Level,T,Thông hiểu
```

---

## ⚙️ **QUẢN LÝ VERSIONS**

### Danh Sách Versions

Hiển thị tất cả các phiên bản MapCode:

| Cột | Ý nghĩa |
|-----|---------|
| **Version** | ID phiên bản (v2025-01-19) |
| **Tên** | Tên hiển thị + mô tả |
| **Trạng thái** | Active (xanh) / Inactive (xám) |
| **Người tạo** | Email người upload |
| **Ngày tạo** | Ngày upload |
| **Thao tác** | Export, Delete, Activate |

### Hành Động

#### 1. Kích Hoạt Version

```
Click [Kích hoạt] trên version inactve
↓
Version trở thành active (xanh)
↓
Cache được clear tự động
↓
Top 1000 câu thường dùng được pre-cache
```

#### 2. Xuất Version

```
Click [Export] → Chọn định dạng
↓
File được tải về (ví dụ: MapCode-2025-01-19.md)
```

#### 3. Xóa Version

```
Click [🗑️] trên version inactve
↓
Xác nhận xóa
↓
Version bị xóa vĩnh viễn
```

**⚠️ Lưu ý**: Chỉ xóa được version **inactive**. Version active phải chuyển sang version khác trước.

---

## 🎓 **HIỂU VỀ MAPCODE FORMAT**

### Cấu Trúc ID5 (5 ký tự)

```
0 P 1 N 1
│ │ │ │ │
│ │ │ │ └─ Bài học (Lesson): 1
│ │ │ └─── Mức độ (Level): N (Nhận biết)
│ │ └───── Chương (Chapter): 1
│ └─────── Chủ đề (Subject): P
└───────── Lớp (Grade): 0
```

**Ví dụ**: `0P1N1` = Lớp 10 - Đại số - Chương 1 - Nhận biết - Bài 1

### Cấu Trúc ID6 (7 ký tự)

```
0 P 1 N 1 - 2
│ │ │ │ │   │
(ID5)      └─ Hình thức (Form): 2
```

**Ví dụ**: `0P1N1-2` = (ID5 trên) - Hình thức 2 (Điền khuyết)

### Các Giá Trị Có Sẵn

**Lớp (Grade)**: `0`, `1`, `2`  
**Chủ đề (Subject)**: `P`, `H`, `D`, ...  
**Chương (Chapter)**: `1`, `2`, `3`, ...  
**Mức độ (Level)**: `N` (Nhận biết), `T` (Thông hiểu), `V` (Vận dụng), `C` (Vận dụng cao)  
**Bài học (Lesson)**: `1`, `2`, `3`, ...  
**Hình thức (Form)**: `1`, `2`, `3`, ... (ID6 only)

---

## 🆘 **GIẢI QUYẾT SỰ CỐ**

### Lỗi: "File quá lớn (max 5MB)"

**Nguyên nhân**: File MapCode vượt 5MB  
**Giải pháp**:
1. Xóa bớt nội dung không cần thiết
2. Hoặc tách file thành nhiều phần nhỏ
3. Upload lại

### Lỗi: "File phải có định dạng .md"

**Nguyên nhân**: File không phải Markdown  
**Giải pháp**:
1. Đổi tên file thành `.md`
2. Hoặc mở file bằng text editor, save as `.md`

### Lỗi: "Thiếu section bắt buộc"

**Nguyên nhân**: File không có định dạng level chuẩn  
**Giải pháp**: Thêm vào file:
```markdown
## [N] Nhận biết
## [T] Thông hiểu
## [V] Vận dụng
## [C] Vận dụng cao
```

### Cache không clear sau khi đổi version

**Nguyên nhân**: Có thể do lỗi tạm thời  
**Giải pháp**:
1. Chờ 30 giây
2. Refresh trang
3. Nếu vẫn lỗi: Contact admin

---

## 📞 **LIÊN HỆ & HỖ TRỢ**

- **Email**: admin@nynus.edu.vn
- **Slack**: #mapcode-support
- **Giờ hỗ trợ**: 8:00 - 18:00 (Thứ 2 - Thứ 6)

---

**Chúc bạn sử dụng MapCode hiệu quả! 🎉**


