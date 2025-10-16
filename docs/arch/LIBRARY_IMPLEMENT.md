# 📚 Hướng dẫn Triển khai Hệ thống Thư viện (Library System)
**Tích hợp với Hệ thống Ngân hàng Đề thi - Go gRPC Backend + React Frontend**

## Integration với Hệ thống Hiện tại

### Công nghệ Sử dụng (Tech Stack)
- **Backend**: Go gRPC (tương thích với hệ thống hiện tại)
- **Frontend**: React TypeScript (tương thích với apps/frontend)
- **Database**: PostgreSQL (sử dụng chung database hiện tại)
- **Xác thực**: JWT-based (tích hợp với auth system hiện có)
- **Lưu trữ File**: Google Drive API (mới thêm)

### Tích hợp Hệ thống Người dùng
- **Sử dụng bảng users hiện tại** với hệ thống vai trò (GUEST - Khách, STUDENT - Học sinh, TUTOR - Gia sư, TEACHER - Giáo viên, ADMIN - Quản trị viên)
- **Tích hợp với JWT authentication** đã có
- **Phân quyền dựa trên vai trò và cấp độ** hiện tại (Cấp độ 1-9 cho STUDENT/TUTOR/TEACHER)

## 🗄️ Database Schema Design (PostgreSQL)

### Core Tables

#### 1. Library Items (library_items)
```sql
CREATE TABLE library_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('exam', 'book', 'video')),
    description TEXT,
    file_url TEXT, -- Google Drive file URL
    file_id TEXT, -- Google Drive file ID
    thumbnail_url TEXT,
    file_size BIGINT,
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'approved', 'rejected')),
    uploaded_by TEXT REFERENCES users(id), -- Tích hợp với bảng users hiện tại
    approved_by TEXT REFERENCES users(id), -- Tích hợp với bảng users hiện tại
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### 2. Exam Metadata (exam_metadata)
```sql
CREATE TABLE exam_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    province TEXT,
    school TEXT,
    academic_year TEXT NOT NULL,
    semester TEXT,
    exam_duration INTEGER, -- minutes
    question_count INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    exam_type TEXT NOT NULL, -- 'practice', 'official', 'sample'
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9), -- Level requirement
    target_roles TEXT[] DEFAULT ARRAY['STUDENT'] -- Multiple target roles
);
```

#### 3. Book Metadata (book_metadata)
```sql
CREATE TABLE book_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    book_type TEXT NOT NULL CHECK (book_type IN ('textbook', 'workbook', 'reference')),
    author TEXT,
    publisher TEXT,
    publication_year INTEGER,
    page_count INTEGER,
    isbn TEXT,
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9), -- Level requirement
    target_roles TEXT[] DEFAULT ARRAY['STUDENT', 'TUTOR'] -- Multiple target roles
);
```

#### 4. Video Metadata (video_metadata)
```sql
CREATE TABLE video_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    duration INTEGER, -- seconds
    quality TEXT DEFAULT '720p',
    instructor_name TEXT,
    related_exam_id TEXT REFERENCES library_items(id),
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9), -- Level requirement
    target_roles TEXT[] DEFAULT ARRAY['STUDENT', 'TUTOR', 'TEACHER'] -- Multiple target roles
);
```

#### 5. Tags System (tags & item_tags)
```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_tags (
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, tag_id)
);
```

#### 6. User Interactions (ratings, bookmarks, downloads)
```sql
CREATE TABLE item_ratings (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_item_id, user_id)
);

CREATE TABLE user_bookmarks (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_item_id, user_id)
);

CREATE TABLE download_history (
    id TEXT PRIMARY KEY,
    library_item_id TEXT REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);
```

### Integration với Question System
- **Liên kết với Question Management**: Video có thể liên kết với specific questions
- **Shared metadata structure**: Sử dụng cùng cấu trúc phân loại (grade, subject, chapter)
- **Consistent naming convention**: Theo chuẩn đã định trong Question system
- **OpenSearch integration**: Tích hợp với OpenSearch Vietnamese search engine đã có

## 🎯 System Requirements & Rules

### Role-based Access Control (Tích hợp với hệ thống hiện tại)

#### **ADMIN (No Level)**
- **Full system control**: Upload, edit, delete all files
- **Content moderation**: Approve/reject all uploads
- **User management**: Assign permissions to other roles
- **Analytics access**: Full system statistics and reports

#### **TEACHER (Level 1-9)**
- **Content creation**: Upload files (pending admin approval)
- **Full library access**: View and download all approved files
- **Student management**: Track student downloads and usage
- **Level-based content**: Higher level teachers can access more advanced content
- **Level 9 privilege**: Can mentor other teachers

#### **TUTOR (Level 1-9)**
- **Limited upload**: Upload study materials (pending approval)
- **Student support**: Access files for tutoring purposes
- **Level-based access**: Can access content up to their level
- **Study group management**: Create and manage study groups
- **Level 9 privilege**: Can apply to become TEACHER

#### **STUDENT (Level 1-9)**
- **Content consumption**: View and download approved files based on permissions
- **Level progression**: Higher levels unlock more advanced content
- **Interaction features**: Rate, bookmark, and track download history
- **Limited access**: Cannot upload files, level-restricted content

#### **GUEST (No Level)**
- **Preview only**: Limited preview of public content
- **No downloads**: Cannot download any files
- **Registration prompt**: Encouraged to register for full access
- **No interactions**: Cannot rate, bookmark, or track history

### File Naming Convention
**Format**: `[Name]_[Year]_[Subject]_[Type]_[School].pdf`
**Examples**:
- `De_Thi_Giua_Ki_2024_Toan_Official_THPT_Chu_Van_An.pdf`
- `Sach_Bai_Tap_2024_Vat_Li_Workbook_NXB_Giao_Duc.pdf`

### Google Drive Structure
```
/Exam-Bank-Library/
├── Exams/
│   ├── [Subject]/
│   │   ├── [Grade]/
│   │   │   ├── [Province]/
│   │   │   │   └── [School]/
├── Books/
│   ├── [Subject]/
│   │   └── [Grade]/
└── Videos/
    ├── [Subject]/
    │   └── [Grade]/
```

### Access Control Rules (5-Role Hierarchy System)

#### **Hierarchy Access Rules**
```
GUEST < STUDENT < TUTOR < TEACHER < ADMIN
  ↓       ↓        ↓       ↓        ↓
 No     Level    Level   Level    No
Level   1-9      1-9     1-9     Level
```

#### **Vertical Access (Role-based)**
- **ADMIN**: Access to all content regardless of level
- **TEACHER**: Access to TUTOR, STUDENT content + own level content
- **TUTOR**: Access to STUDENT content + own level content
- **STUDENT**: Access to own level content only
- **GUEST**: Preview access only

#### **Horizontal Access (Level-based within same role)**
- **Higher level users** can access lower level content
- **Same level**: Full access
- **Lower level**: Cannot access higher level content

#### **Content Access Matrix**
```
Role/Level    | GUEST | STUDENT 1-9 | TUTOR 1-9 | TEACHER 1-9 | ADMIN
------------- |-------|-------------|-----------|-------------|-------
GUEST Content |   ✅   |      ✅      |     ✅     |      ✅      |   ✅
STUDENT L1-9  |   ❌   |   Level≥X   |     ✅     |      ✅      |   ✅
TUTOR L1-9    |   ❌   |      ❌      |  Level≥X  |      ✅      |   ✅
TEACHER L1-9  |   ❌   |      ❌      |     ❌     |   Level≥X   |   ✅
ADMIN Content |   ❌   |      ❌      |     ❌     |      ❌      |   ✅
```

### Content Approval Workflow
1. **TEACHER/TUTOR Upload** → Status: `pending`
2. **ADMIN Review** → Status: `approved` or `rejected`
3. **Auto-notification** to uploader about approval status
4. **Public Access** only for approved items
5. **Level Assignment**: ADMIN assigns appropriate level for content

### Role Progression System (Tích hợp với hệ thống hiện tại)
#### **Advancement Requirements**
- **STUDENT → TUTOR**: Reach Level 9 + Complete mentor training + ADMIN approval
- **TUTOR → TEACHER**: Reach Level 9 + Teaching certification + Peer review + ADMIN approval
- **TEACHER → ADMIN**: Special appointment only

#### **Level Progression Criteria**
- **STUDENT**: Course completion rate, exam scores, participation points
- **TUTOR**: Student feedback ratings, mentoring hours, success rate
- **TEACHER**: Course quality metrics, student outcomes, peer evaluations

## 🎨 UI/UX Specifications

### Grid Layout Design
- **Card-based grid** with responsive columns (1-4 columns based on screen size)
- **Card components** include:
  - Thumbnail/preview image
  - Title and description
  - Metadata badges (subject, grade, type)
  - Rating stars display
  - Bookmark icon
  - Download count
  - File size and format

### Filter Panel (Left Sidebar)
- **Content Type**: Exam, Book, Video (checkbox)
- **Subject**: Dropdown with search
- **Grade/Class**: Multi-select dropdown
- **Province**: Dropdown with search
- **Academic Year**: Range slider
- **Difficulty**: Easy, Medium, Hard (for exams)
- **File Type**: PDF, DOC, MP4, etc.
- **Tags**: Tag cloud with search
- **Rating**: Star rating filter (4+ stars, 3+ stars, etc.)

### Search & Sort Features
- **Global search bar** with autocomplete
- **Sort options**: 
  - Newest first
  - Oldest first
  - Highest rated
  - Most downloaded
  - Alphabetical
- **Advanced search** with multiple criteria

### File Preview System
- **PDF Preview**: Embedded PDF viewer (first 3 pages)
- **Video Preview**: YouTube thumbnail with play button
- **Book Preview**: Cover image and table of contents
- **Quick info modal** with metadata display

## 🔧 Technical Implementation Guidelines

### Backend Architecture (Go gRPC)
- **Service Structure**:
  - `LibraryService` (main gRPC service)
  - `FileUploadService` (Google Drive integration)
  - `MetadataService` (exam/book/video metadata)
  - `PermissionService` (access control)

### Frontend Architecture (React TypeScript)
- **Component Structure** (apps/frontend/src/components/library/):
  - `LibraryPage` (main container)
  - `FilterPanel` (left sidebar)
  - `SearchBar` (top section với OpenSearch integration)
  - `ItemGrid` (main content area)
  - `ItemCard` (individual item display)
  - `PreviewModal` (file preview)
  - `UploadModal` (teacher upload form)

### State Management
- **Global State**: User authentication (existing JWT system), permissions
- **Local State**: Filters, search query, pagination
- **API State**: Library items, user interactions

### API Endpoints (gRPC Services)
- **LibraryService** (apps/backend/internal/grpc/library_service.go):
  - `ListItems(filters, pagination)`
  - `GetItem(id)`
  - `UploadItem(metadata, file)`
  - `ApproveItem(id, status)`
  - `RateItem(id, rating, review)`
  - `BookmarkItem(id)`
  - `DownloadItem(id)`
  - `SearchItems(query, filters)` (OpenSearch integration)

### Google Drive Integration
- **Upload Process**: 
  1. Frontend uploads to temporary storage
  2. Backend processes and uploads to Google Drive
  3. Store Google Drive file ID and URL
  4. Generate thumbnail for preview

- **Download Process**:
  1. Check user permissions
  2. Log download activity
  3. Generate temporary download link
  4. Redirect to Google Drive file

### Performance Considerations
- **Pagination**: 20 items per page
- **Lazy Loading**: Images and thumbnails
- **Caching**: Frequently accessed metadata
- **CDN**: Thumbnail and preview images

## 📊 Analytics & Tracking

### User Behavior Tracking
- Download frequency by content type
- Most popular subjects and grades
- User engagement metrics (time spent, interactions)
- Search query analytics

### Content Performance
- Most downloaded items
- Highest rated content
- Upload approval rates
- Geographic distribution of content usage

## 🏷️ Tag System Implementation

### Auto-Generated Tags
- **Subject-based**: `#toan-hoc`, `#vat-li`, `#hoa-hoc`
- **Difficulty-based**: `#de`, `#trung-binh`, `#kho`
- **Type-based**: `#de-thi-thu`, `#de-chinh-thuc`, `#sach-giao-khoa`

### User-Generated Tags
- **Popularity-based**: Based on user interaction frequency
- **Admin-curated**: Special tags for featured content
- **Trending**: Tags that are currently popular

### Tag Management Rules
- Maximum 10 tags per item
- Tag validation and moderation
- Merge similar tags automatically
- Archive unused tags after 6 months

## 🚀 Development Phases (Tích hợp với Exam Bank System)

### Phase 1: Database & Backend Setup (Week 1-2)
- **Database migrations**: Tạo tables mới trong PostgreSQL hiện tại
- **gRPC service setup**: Thêm LibraryService vào backend Go
- **Authentication integration**: Sử dụng JWT middleware hiện có
- **Basic CRUD operations**: Implement repository pattern như UserRepository

### Phase 2: Google Drive Integration (Week 2-3)
- **Google Drive API setup**: Credentials và folder structure
- **File upload service**: Go service cho upload/download
- **Metadata extraction**: Tự động extract thông tin từ files
- **Error handling**: Retry mechanism và status tracking

### Phase 3: Frontend Development (Week 3-4)
- **React components**: Tích hợp với cấu trúc apps/frontend hiện tại
- **Grid layout và filtering**: Responsive design với Tailwind CSS
- **Search functionality**: Tích hợp với OpenSearch Vietnamese engine
- **User interactions**: Rating, bookmark, download tracking

### Phase 4: Advanced Features (Week 4-5)
- **Preview system**: PDF viewer, video player, image preview
- **Admin approval workflow**: Teacher upload → Admin approve
- **Analytics dashboard**: Usage statistics và performance metrics
- **OpenSearch optimization**: Vietnamese search với education synonyms

### Phase 5: Testing & Optimization (Week 5-6)
- **Performance optimization**: Database indexing, caching
- **Security testing**: Access control, file validation
- **UI/UX improvements**: User feedback integration
- **Integration testing**: End-to-end workflow testing

## 📝 Content Guidelines

### Upload Requirements
- **File Size Limits**: 
  - PDFs: Max 50MB
  - Videos: YouTube links only
  - Images: Max 10MB

- **Quality Standards**:
  - Clear, readable content
  - Proper metadata completion
  - Appropriate file naming
  - Virus-free files

### Content Moderation
- Automated checks for file integrity
- Manual review for content appropriateness
- Duplicate detection and prevention
- Copyright compliance verification

## 🔒 Security Considerations (Tích hợp với hệ thống hiện tại)

### File Security
- **Virus scanning**: Integrate với existing security middleware
- **Access token validation**: Sử dụng JWT validation hiện có
- **Rate limiting**: Extend existing rate limiting cho file operations
- **Secure file storage**: Google Drive với proper access controls

### User Privacy
- **Download history encryption**: Sử dụng cùng encryption standard
- **Personal data protection**: Tuân thủ GDPR như user system hiện tại
- **Audit logs**: Extend existing audit log system
- **Role-based access**: Tích hợp với permission system hiện có

## 📋 Migration Strategy

### Database Migration
```sql
-- Add to existing migration files
-- File: packages/database/migrations/000002_library_system.up.sql

-- Create library tables
CREATE TABLE library_items (...);
CREATE TABLE exam_metadata (...);
-- ... other tables

-- Add indexes for performance
CREATE INDEX idx_library_items_type ON library_items(type);
CREATE INDEX idx_library_items_status ON library_items(upload_status);
-- ... other indexes
```

### Code Integration Points
- **Backend**: apps/backend/internal/service/library_mgmt/
- **Frontend**: apps/frontend/src/components/library/
- **Shared**: Extend existing proto files cho gRPC
- **Database**: Extend existing repository pattern

## 🎯 Success Metrics

### Performance Targets
- **File upload**: <30s for files up to 50MB
- **Search response**: <200ms (tích hợp với OpenSearch)
- **Download initiation**: <2s
- **Page load**: <1s for library grid view

### User Experience Goals
- **Upload success rate**: >95%
- **Search accuracy**: >90% (Vietnamese content)
- **User satisfaction**: >4.5/5 stars
- **Admin approval time**: <24 hours average

---

**Note**: This document serves as the complete specification for Library system implementation integrated with the existing Exam Bank System. All development should follow these guidelines and maintain compatibility with current architecture.
