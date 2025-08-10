# 📚 Hướng dẫn Triển khai Hệ thống Thư viện
**Tích hợp với Hệ thống Ngân hàng Đề thi - Go gRPC Backend + React Frontend**

## 🔗 Tích hợp với Hệ thống Hiện tại

### Công nghệ Sử dụng
- **Backend**: Go gRPC (tương thích với hệ thống hiện tại)
- **Frontend**: React TypeScript (tương thích với apps/frontend)
- **Cơ sở dữ liệu**: PostgreSQL (sử dụng chung database hiện tại)
- **Xác thực**: JWT-based (tích hợp với auth system hiện có)
- **Lưu trữ File**: Google Drive API (mới thêm)

### Tích hợp Hệ thống Người dùng
- **Sử dụng bảng users hiện tại** với hệ thống vai trò:
  - GUEST (Khách) - Không có cấp độ
  - STUDENT (Học sinh) - Cấp độ 1-9
  - TUTOR (Gia sư) - Cấp độ 1-9
  - TEACHER (Giáo viên) - Cấp độ 1-9
  - ADMIN (Quản trị viên) - Không có cấp độ
- **Tích hợp với JWT authentication** đã có
- **Phân quyền dựa trên vai trò và cấp độ** hiện tại

## 🗄️ Thiết kế Cơ sở Dữ liệu (PostgreSQL)

### Các Bảng Chính

#### 1. Mục Thư viện (library_items)
```sql
CREATE TABLE library_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                    -- Tên file/tài liệu
    type TEXT NOT NULL CHECK (type IN ('exam', 'book', 'video')), -- Loại: đề thi, sách, video
    description TEXT,                      -- Mô tả
    file_url TEXT,                        -- URL Google Drive
    file_id TEXT,                         -- ID file Google Drive
    thumbnail_url TEXT,                   -- URL ảnh thumbnail
    file_size BIGINT,                     -- Kích thước file (bytes)
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'approved', 'rejected')),
    uploaded_by TEXT REFERENCES users(id), -- Người upload (tích hợp với users hiện tại)
    approved_by TEXT REFERENCES users(id), -- Người duyệt (tích hợp với users hiện tại)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### 2. Metadata Đề thi (exam_metadata)
```sql
CREATE TABLE exam_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,                -- Môn học
    grade TEXT NOT NULL,                  -- Lớp/Khối
    province TEXT,                        -- Tỉnh/Thành phố
    school TEXT,                          -- Trường học
    academic_year TEXT NOT NULL,          -- Năm học
    semester TEXT,                        -- Học kỳ
    exam_duration INTEGER,                -- Thời gian làm bài (phút)
    question_count INTEGER,               -- Số câu hỏi
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')), -- Độ khó
    exam_type TEXT NOT NULL,              -- Loại đề: 'practice', 'official', 'sample'
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9), -- Cấp độ yêu cầu
    target_roles TEXT[] DEFAULT ARRAY['STUDENT'] -- Các vai trò mục tiêu
);
```

#### 3. Metadata Sách (book_metadata)
```sql
CREATE TABLE book_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,                -- Môn học
    grade TEXT NOT NULL,                  -- Lớp/Khối
    book_type TEXT NOT NULL CHECK (book_type IN ('textbook', 'workbook', 'reference')), -- Loại sách
    author TEXT,                          -- Tác giả
    publisher TEXT,                       -- Nhà xuất bản
    publication_year INTEGER,             -- Năm xuất bản
    page_count INTEGER,                   -- Số trang
    isbn TEXT,                           -- Mã ISBN
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT', 'TUTOR']
);
```

#### 4. Metadata Video (video_metadata)
```sql
CREATE TABLE video_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,            -- URL YouTube
    youtube_id TEXT NOT NULL,             -- ID video YouTube
    duration INTEGER,                     -- Thời lượng (giây)
    quality TEXT DEFAULT '720p',          -- Chất lượng video
    instructor_name TEXT,                 -- Tên giảng viên
    related_exam_id TEXT REFERENCES library_items(id), -- Liên kết với đề thi
    subject TEXT NOT NULL,                -- Môn học
    grade TEXT NOT NULL,                  -- Lớp/Khối
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT', 'TUTOR', 'TEACHER']
);
```

#### 5. Hệ thống Tags (tags & item_tags)
```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,            -- Tên tag
    color TEXT DEFAULT '#3B82F6',         -- Màu sắc tag
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_tags (
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, tag_id)
);
```

#### 6. Tương tác Người dùng (ratings, bookmarks, downloads)
```sql
-- Đánh giá
CREATE TABLE item_ratings (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Tích hợp với users hiện tại
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Điểm đánh giá 1-5 sao
    review TEXT,                          -- Nhận xét
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_item_id, user_id)
);

-- Bookmark/Yêu thích
CREATE TABLE user_bookmarks (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Tích hợp với users hiện tại
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_item_id, user_id)
);

-- Lịch sử tải xuống
CREATE TABLE download_history (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Tích hợp với users hiện tại
    downloaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,                      -- Địa chỉ IP
    user_agent TEXT                       -- Thông tin trình duyệt
);
```

### Tích hợp với Hệ thống Question
- **Liên kết với Question Management**: Video có thể liên kết với câu hỏi cụ thể
- **Cấu trúc metadata chung**: Sử dụng cùng cấu trúc phân loại (grade, subject, chapter)
- **Quy ước đặt tên nhất quán**: Theo chuẩn đã định trong Question system
- **Tích hợp OpenSearch**: Tích hợp với OpenSearch Vietnamese search engine đã có

## 🎯 Yêu cầu Hệ thống và Quy tắc

### Kiểm soát Truy cập Dựa trên Vai trò (Tích hợp với hệ thống hiện tại)

#### **ADMIN (Quản trị viên - Không có cấp độ)**
- **Toàn quyền hệ thống**: Upload, chỉnh sửa, xóa tất cả files
- **Kiểm duyệt nội dung**: Duyệt/từ chối tất cả uploads
- **Quản lý người dùng**: Phân quyền cho các vai trò khác
- **Truy cập phân tích**: Thống kê và báo cáo toàn hệ thống

#### **TEACHER (Giáo viên - Cấp độ 1-9)**
- **Tạo nội dung**: Upload files (chờ admin duyệt)
- **Truy cập thư viện đầy đủ**: Xem và tải tất cả files đã duyệt
- **Quản lý học sinh**: Theo dõi downloads và sử dụng của học sinh
- **Nội dung theo cấp độ**: Giáo viên cấp cao hơn truy cập nội dung nâng cao hơn
- **Đặc quyền cấp 9**: Có thể hướng dẫn giáo viên khác

#### **TUTOR (Gia sư - Cấp độ 1-9)**
- **Upload hạn chế**: Upload tài liệu học tập (chờ duyệt)
- **Hỗ trợ học sinh**: Truy cập files để dạy kèm
- **Truy cập theo cấp độ**: Có thể truy cập nội dung đến cấp độ của mình
- **Quản lý nhóm học**: Tạo và quản lý nhóm học tập
- **Đặc quyền cấp 9**: Có thể apply thành TEACHER

#### **STUDENT (Học sinh - Cấp độ 1-9)**
- **Tiêu thụ nội dung**: Xem và tải files đã duyệt theo quyền hạn
- **Tiến bộ cấp độ**: Cấp độ cao hơn mở khóa nội dung nâng cao hơn
- **Tính năng tương tác**: Đánh giá, bookmark, theo dõi lịch sử tải
- **Truy cập hạn chế**: Không thể upload files, bị hạn chế nội dung theo cấp độ

#### **GUEST (Khách - Không có cấp độ)**
- **Chỉ xem trước**: Xem trước hạn chế nội dung công khai
- **Không tải xuống**: Không thể tải bất kỳ file nào
- **Nhắc nhở đăng ký**: Khuyến khích đăng ký để truy cập đầy đủ
- **Không tương tác**: Không thể đánh giá, bookmark hoặc theo dõi lịch sử

## 📋 Quy ước Đặt tên File
**Định dạng**: `[Tên]_[Năm]_[Môn]_[Loại]_[Trường].pdf`
**Ví dụ**:
- `De_Thi_Giua_Ki_2024_Toan_Official_THPT_Chu_Van_An.pdf`
- `Sach_Bai_Tap_2024_Vat_Li_Workbook_NXB_Giao_Duc.pdf`

## 📁 Cấu trúc Google Drive
```
/Exam-Bank-Library/
├── Exams/                    # Đề thi
│   ├── [Môn học]/
│   │   ├── [Lớp]/
│   │   │   ├── [Tỉnh]/
│   │   │   │   └── [Trường]/
├── Books/                    # Sách
│   ├── [Môn học]/
│   │   └── [Lớp]/
└── Videos/                   # Video
    ├── [Môn học]/
    │   └── [Lớp]/
```

## 🔧 Hướng dẫn Triển khai Kỹ thuật

### Kiến trúc Backend (Go gRPC)
- **Cấu trúc Service**:
  - `LibraryService` (gRPC service chính)
  - `FileUploadService` (tích hợp Google Drive)
  - `MetadataService` (metadata đề thi/sách/video)
  - `PermissionService` (kiểm soát truy cập)

### Kiến trúc Frontend (React TypeScript)
- **Cấu trúc Component** (apps/frontend/src/components/library/):
  - `LibraryPage` (container chính)
  - `FilterPanel` (sidebar bộ lọc)
  - `SearchBar` (thanh tìm kiếm với OpenSearch)
  - `ItemGrid` (khu vực nội dung chính)
  - `ItemCard` (hiển thị từng item)
  - `PreviewModal` (xem trước file)
  - `UploadModal` (form upload cho giáo viên)

### API Endpoints (gRPC Services)
- **LibraryService** (apps/backend/internal/grpc/library_service.go):
  - `ListItems(filters, pagination)` - Liệt kê items
  - `GetItem(id)` - Lấy thông tin item
  - `UploadItem(metadata, file)` - Upload item
  - `ApproveItem(id, status)` - Duyệt item
  - `RateItem(id, rating, review)` - Đánh giá item
  - `BookmarkItem(id)` - Bookmark item
  - `DownloadItem(id)` - Tải xuống item
  - `SearchItems(query, filters)` - Tìm kiếm (tích hợp OpenSearch)

## 🚀 Các Giai đoạn Phát triển (Tích hợp với Exam Bank System)

### Giai đoạn 1: Thiết lập Database & Backend (Tuần 1-2)
- **Database migrations**: Tạo các bảng mới trong PostgreSQL hiện tại
- **Thiết lập gRPC service**: Thêm LibraryService vào backend Go
- **Tích hợp xác thực**: Sử dụng JWT middleware hiện có
- **Các thao tác CRUD cơ bản**: Implement repository pattern như UserRepository

### Giai đoạn 2: Tích hợp Google Drive (Tuần 2-3)
- **Thiết lập Google Drive API**: Credentials và cấu trúc thư mục
- **Service upload file**: Go service cho upload/download
- **Trích xuất metadata**: Tự động trích xuất thông tin từ files
- **Xử lý lỗi**: Cơ chế retry và theo dõi trạng thái

### Giai đoạn 3: Phát triển Frontend (Tuần 3-4)
- **React components**: Tích hợp với cấu trúc apps/frontend hiện tại
- **Grid layout và filtering**: Responsive design với Tailwind CSS
- **Chức năng tìm kiếm**: Tích hợp với OpenSearch Vietnamese engine
- **Tương tác người dùng**: Đánh giá, bookmark, theo dõi download

### Giai đoạn 4: Tính năng Nâng cao (Tuần 4-5)
- **Hệ thống xem trước**: PDF viewer, video player, image preview
- **Quy trình duyệt admin**: Teacher upload → Admin approve
- **Dashboard phân tích**: Thống kê sử dụng và metrics hiệu suất
- **Tối ưu OpenSearch**: Vietnamese search với education synonyms

### Giai đoạn 5: Testing & Tối ưu (Tuần 5-6)
- **Tối ưu hiệu suất**: Database indexing, caching
- **Kiểm tra bảo mật**: Kiểm soát truy cập, validation file
- **Cải thiện UI/UX**: Tích hợp phản hồi người dùng
- **Integration testing**: Kiểm tra quy trình end-to-end

## 🔒 Cân nhắc Bảo mật (Tích hợp với hệ thống hiện tại)

### Bảo mật File
- **Quét virus**: Tích hợp với security middleware hiện có
- **Validation access token**: Sử dụng JWT validation hiện có
- **Rate limiting**: Mở rộng rate limiting hiện có cho file operations
- **Lưu trữ file an toàn**: Google Drive với proper access controls

### Quyền riêng tư Người dùng
- **Mã hóa lịch sử download**: Sử dụng cùng encryption standard
- **Bảo vệ dữ liệu cá nhân**: Tuân thủ GDPR như user system hiện tại
- **Audit logs**: Mở rộng existing audit log system
- **Truy cập dựa trên vai trò**: Tích hợp với permission system hiện có

## 📋 Chiến lược Migration

### Database Migration
```sql
-- Thêm vào existing migration files
-- File: packages/database/migrations/000002_library_system.up.sql

-- Tạo các bảng library
CREATE TABLE library_items (...);
CREATE TABLE exam_metadata (...);
-- ... các bảng khác

-- Thêm indexes cho hiệu suất
CREATE INDEX idx_library_items_type ON library_items(type);
CREATE INDEX idx_library_items_status ON library_items(upload_status);
-- ... các indexes khác
```

### Các điểm Tích hợp Code
- **Backend**: apps/backend/internal/service/library_mgmt/
- **Frontend**: apps/frontend/src/components/library/
- **Shared**: Mở rộng existing proto files cho gRPC
- **Database**: Mở rộng existing repository pattern

## 🎯 Metrics Thành công

### Mục tiêu Hiệu suất
- **Upload file**: <30s cho files đến 50MB
- **Phản hồi tìm kiếm**: <200ms (tích hợp với OpenSearch)
- **Khởi tạo download**: <2s
- **Tải trang**: <1s cho library grid view

### Mục tiêu Trải nghiệm Người dùng
- **Tỷ lệ upload thành công**: >95%
- **Độ chính xác tìm kiếm**: >90% (nội dung tiếng Việt)
- **Hài lòng người dùng**: >4.5/5 sao
- **Thời gian duyệt admin**: <24 giờ trung bình

## 📊 Hệ thống Phân tích và Theo dõi

### Theo dõi Hành vi Người dùng
- Tần suất download theo loại nội dung
- Môn học và lớp phổ biến nhất
- Metrics tương tác người dùng (thời gian spent, interactions)
- Phân tích search query

### Hiệu suất Nội dung
- Items được download nhiều nhất
- Nội dung được đánh giá cao nhất
- Tỷ lệ duyệt upload
- Phân bố địa lý của việc sử dụng nội dung

## 🏷️ Hệ thống Tag

### Auto-Generated Tags
- **Dựa trên môn học**: `#toan-hoc`, `#vat-li`, `#hoa-hoc`
- **Dựa trên độ khó**: `#de`, `#trung-binh`, `#kho`
- **Dựa trên loại**: `#de-thi-thu`, `#de-chinh-thuc`, `#sach-giao-khoa`

### User-Generated Tags
- **Dựa trên độ phổ biến**: Dựa trên tần suất tương tác người dùng
- **Admin-curated**: Tags đặc biệt cho nội dung featured
- **Trending**: Tags đang phổ biến hiện tại

### Quy tắc Quản lý Tag
- Tối đa 10 tags mỗi item
- Validation và moderation tag
- Tự động merge các tags tương tự
- Archive các tags không sử dụng sau 6 tháng

---

**Ghi chú**: Tài liệu này là đặc tả hoàn chỉnh cho việc triển khai hệ thống Library tích hợp với Hệ thống Ngân hàng Đề thi hiện tại. Tất cả phát triển phải tuân theo các hướng dẫn này và duy trì tương thích với kiến trúc hiện tại.
