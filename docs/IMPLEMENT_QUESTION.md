# Question Management System - OpenSearch Architecture
**Version**: 3.0.0 - Production Specification
**Last Modified**: July 23, 2025
**Status**: Production Ready

## 📋 Tổng quan hệ thống

Hệ thống quản lý câu hỏi NyNus với **OpenSearch integration** cho enhanced Vietnamese search capabilities. Tập trung vào **hiệu suất lọc dữ liệu**, **kiến trúc mở rộng**, và **tìm kiếm tiếng Việt tối ưu**. Hỗ trợ LaTeX, phân loại thông minh và tìm kiếm nhanh với specialized Vietnamese plugins.

## � **OpenSearch Vietnamese Search Engine**

NyNus sử dụng **OpenSearch** làm search engine chính với specialized Vietnamese plugins cho education domain. Hệ thống đạt 95%+ accuracy trong tìm kiếm tiếng Việt và hỗ trợ 10,000+ concurrent users với <200ms response time.

### **Key Features**
- **Specialized Vietnamese plugins**: opensearch-analysis-vietnamese, analysis-icu, analysis-phonetic
- **Education domain optimization**: 350+ comprehensive synonyms cho môn học Việt Nam
- **Enterprise performance**: <200ms response time, 10K+ concurrent users
- **Advanced features**: Phonetic matching, accent handling, typo tolerance

## 🎯 Yêu cầu chức năng

### Chức năng cốt lõi
1. **Lưu trữ câu hỏi**: LaTeX content, 5 loại câu hỏi (MC, TF, SA, ES, MA)
2. **Hệ thống phân loại**: Theo lớp, môn, chương, mức độ, dạng bài
3. **Lọc nhanh**: Tìm kiếm theo nhiều tiêu chí kết hợp
4. **Tìm kiếm toàn văn Vietnamese**: Trong nội dung câu hỏi với OpenSearch
5. **Theo dõi sử dụng**: Thống kê độ phổ biến
6. **Hỗ trợ media**: Hình ảnh từ Google Drive và TikZ compilation

### Yêu cầu hiệu suất
- **Thời gian phản hồi**: <200ms (consistent), <500ms (complex queries)
- **Vietnamese search accuracy**: 95%+ (enterprise-grade với specialized Vietnamese plugins)
- **Người dùng đồng thời**: 10,000+ concurrent users (enterprise-scale performance)
- **Quy mô**: 350,000 questions (hiện tại) → 1,500,000+ questions (OpenSearch capacity)
- **Tất cả operations**: Optimized performance với enterprise-grade reliability

## 🏗 Nguyên tắc thiết kế

1. **Tối ưu hiệu suất**: Tách bảng QuestionCode để tăng tốc lọc
2. **Chỉ mục thông minh**: Index cho các pattern truy vấn phổ biến
3. **Tính toàn vẹn**: Foreign key relationships chuẩn
4. **Khả năng mở rộng**: Thiết kế cho tương lai

## 📊 Database Schema

### 1. QuestionCode Model - Bảng phân loại tối ưu
```prisma
model QuestionCode {
  code      String      @id @db.VarChar(7)  // "0P1VH1" - Primary key
  format    CodeFormat                      // ID5 hoặc ID6
  grade     String      @db.Char(1)         // Lớp (0-9, A, B, C)
  subject   String      @db.Char(1)         // Môn học (P=Toán, L=Vật lý, H=Hóa học...)
  chapter   String      @db.Char(1)         // Chương (1-9)
  lesson    String      @db.Char(1)         // Bài học (1-9, A-Z)
  form      String?     @db.Char(1)         // Dạng bài (1-9, chỉ ID6)
  level     String      @db.Char(1)         // Mức độ (N,H,V,C,T,M)

  // Relations
  questions Question[]                      // Một code có nhiều câu hỏi

  // Indexes tối ưu cho filtering
  @@index([grade])                          // Lọc theo lớp
  @@index([grade, subject])                 // Lớp + môn (70% queries)
  @@index([grade, subject, chapter])        // Lớp + môn + chương (50%)
  @@index([grade, level])                   // Lớp + mức độ (60%)
  @@index([grade, subject, level])          // Lớp + môn + mức độ (40%)
  @@index([grade, subject, chapter, level]) // Full filtering (20%)
}

enum CodeFormat {
  ID5  // [XXXXX] - 5 ký tự
  ID6  // [XXXXX-X] - 7 ký tự
}
```

### 2. Question Model - Bảng câu hỏi chính
```prisma
model Question {
  id              String         @id @default(cuid())
  rawContent      String         @db.Text        // LaTeX gốc từ user
  content         String         @db.Text        // Nội dung đã xử lý
  subcount        String?        @db.VarChar(10) // [XX.N] format
  type            QuestionType                   // MC, TF, SA, ES, MA
  source          String?        @db.Text        // Nguồn câu hỏi
  
  // Dữ liệu câu hỏi
  answers         Json?                          // Danh sách đáp án
  correctAnswer   Json?                          // Đáp án đúng
  solution        String?        @db.Text        // Lời giải chi tiết
  
  // Metadata
  tag             String[]       @default([])    // Tags tự do
  usageCount      Int            @default(0)     // Số lần sử dụng
  creator         String         @default("ADMIN") // Người tạo
  status          QuestionStatus @default(ACTIVE) // Trạng thái
  feedback        Int            @default(0)     // Điểm feedback

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  // Foreign Key Relationship
  questionCode    QuestionCode   @relation(fields: [questionCodeId], references: [code])
  questionCodeId  String         @db.VarChar(7)  // FK đến QuestionCode
  
  // Relations
  questionImages  QuestionImage[]
  questionTags    QuestionTag[]
  feedbacks       QuestionFeedback[]

  // Indexes tối ưu
  @@index([questionCodeId])  // Join với QuestionCode
  @@index([type])            // Lọc theo loại câu hỏi
  @@index([status])          // Lọc theo trạng thái
  @@index([usageCount])      // Sắp xếp theo độ phổ biến
  @@index([creator])         // Lọc theo người tạo
  @@fulltext([content])      // Tìm kiếm toàn văn
}

enum QuestionType {
  MC  // Multiple Choice - Trắc nghiệm 1 đáp án
  TF  // True/False - Đúng/Sai nhiều đáp án
  SA  // Short Answer - Trả lời ngắn
  ES  // Essay - Tự luận
  MA  // Matching - Ghép đôi (phát triển sau)
}

enum QuestionStatus {
  ACTIVE      // Đang sử dụng - Chỉ ACTIVE mới public cho users
  PENDING     // Chờ duyệt - ADMIN review và approve
  INACTIVE    // Tạm ngưng - ADMIN quản lý
  ARCHIVED    // Đã lưu trữ - ADMIN quản lý
}
```

### 3. Supporting Models - Bảng hỗ trợ

```prisma
// Hình ảnh đính kèm câu hỏi
model QuestionImage {
  id          String      @id @default(cuid())
  questionId  String
  imageType   ImageType   // QUESTION hoặc SOLUTION
  imagePath   String?     @db.Text    // Local path (temporary)
  driveUrl    String?     @db.Text    // Google Drive URL
  driveFileId String?     @db.VarChar(100) // Google Drive file ID
  status      ImageStatus @default(PENDING) // Upload status
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  question    Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@index([questionId])
  @@index([status])       // Index for status filtering
}

// Tags tự do cho câu hỏi
model QuestionTag {
  id         String   @id @default(cuid())
  questionId String
  tagName    String   @db.VarChar(100)
  createdAt  DateTime @default(now())
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@unique([questionId, tagName])
  @@index([tagName])
}

// Feedback từ người dùng
model QuestionFeedback {
  id           String       @id @default(cuid())
  questionId   String
  userId       String?      // Tùy chọn
  feedbackType FeedbackType
  content      String?      @db.Text
  rating       Int?         // 1-5 sao
  createdAt    DateTime     @default(now())
  
  question     Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@index([questionId])
}

enum ImageType {
  QUESTION  // Hình trong đề bài
  SOLUTION  // Hình trong lời giải
}

enum ImageStatus {
  PENDING     // Chưa upload
  UPLOADING   // Đang upload
  UPLOADED    // Đã upload thành công
  FAILED      // Upload thất bại
}

enum FeedbackType {
  LIKE        // Thích
  DISLIKE     // Không thích
  REPORT      // Báo cáo lỗi
  SUGGESTION  // Góp ý
}
```

## � LaTeX Question Formats

### Định dạng câu hỏi cơ bản

#### 1. Multiple Choice (MC) - Trắc nghiệm 1 phương án đúng
```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
    [TL.100022]  % subcount
    Lời dẫn câu hỏi
    \choice   % Có thể: \choice[1], \choice[2], \choice[4]
    {đáp án 1}               % Đáp án sai
    {đáp án 2}               % Đáp án sai
    {\True đáp án 3}         % Đáp án đúng
    {đáp án 4}               % Đáp án sai
    Lời dẫn bổ sung (nếu có)
    \loigiai{
        Lời giải của câu hỏi
    }
\end{ex}
```

#### 2. True/False (TF) - Trắc nghiệm nhiều phương án đúng
```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
    [TL.100022]
    Lời dẫn câu hỏi
    \choiceTF   % Có thể: \choiceTF[t], \choiceTFt, \choiceTF[1]
    {\True đáp án 1}         % Đáp án đúng
    {đáp án 2}               % Đáp án sai
    {\True đáp án 3}         % Đáp án đúng
    {đáp án 4}               % Đáp án sai
    \loigiai{
        Lời giải của câu hỏi
    }
\end{ex}
```

#### 3. Short Answer (SA) - Trắc nghiệm trả lời ngắn
```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
    [TL.100022]
    Lời dẫn câu hỏi
    \shortans{'đáp án'}      % hoặc \shortans[oly]{'đáp án'}
    \loigiai{
        Lời giải của câu hỏi
    }
\end{ex}
```

#### 4. Essay (ES) - Câu hỏi tự luận
```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
    [TL.100022]
    Nội dung câu hỏi tự luận
    \loigiai{
        Lời giải của câu hỏi
    }
\end{ex}
```

#### 5. Matching (MA) - Câu hỏi ghép đôi
```latex
\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
    [TL.100022]
    Nội dung câu hỏi ghép đôi
    \matching
    {Cột A - Item 1}
    {Cột A - Item 2}
    {Cột B - Match 1}
    {Cột B - Match 2}
    \loigiai{
        Lời giải của câu hỏi
    }
\end{ex}
```

### Định dạng câu hỏi có hình ảnh

#### Layout 1 cột - Hình ảnh ở giữa
```latex
\begin{ex}%[metadata]
    [XX.Y] %subcount
    Nội dung câu hỏi...
    \begin{center}
        Phần hình ảnh (tikzpicture hoặc includegraphics)
    \end{center}
    \choice[1]  % Đáp án cho MC
    {Đáp án 1}
    {Đáp án 2}
    {\True Đáp án đúng}
    {Đáp án 4}
    \loigiai{
        Phần giải...
    }
\end{ex}
```

#### Layout 2 cột - Sử dụng immini
```latex
\begin{ex}%[metadata]
    [XX.Y] %subcount
    \immini[thm]  %[thm] có thể không có
    {Nội dung câu hỏi...
        \choice[1]
        {Đáp án 1}
        {Đáp án 2}
        {\True Đáp án đúng}
        {Đáp án 4}}
    {Phần hình ảnh (tikzpicture hoặc includegraphics)}
    \loigiai{
        Phần giải...
    }
\end{ex}
```

## �🔧 Hướng dẫn triển khai

### 1. Tạo Database Schema
```bash
# Tạo database schema với Prisma
pnpx prisma migrate dev --name init-question-system

# Generate Prisma client
pnpx prisma generate
```

### 2. Google Drive API Setup
```bash
# Install Google APIs
pnpm add googleapis google-auth-library

# Environment variables cần thiết
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-root-folder-id
```

### 3. Google Drive Folder Structure
Dựa trên MapCode hierarchy từ `apps/web/DATA/template/MapCode.md`:
```
Google Drive/NyNus-Images/
├── 0/                          # Lớp 10
│   └── P/                      # 10-NGÂN HÀNG CHÍNH
│       └── 1/                  # Mệnh đề và tập hợp
│           └── 1/              # Mệnh đề
│               └── 1/          # Xác định mệnh đề, mệnh đề chứa biến
│                   └── N/      # Nhận biết (Level cuối cùng)
│                       ├── TL100022-QUES.webp
│                       ├── TL100022-QUES-1.webp
│                       └── TL100022-SOL.webp
└── 1/                          # Lớp 11
    └── P/                      # 11-NGÂN HÀNG CHÍNH
        └── 1/                  # HS lượng giác và phương trình lượng giác
            └── 1/              # Góc lượng giác
                └── 1/          # Câu hỏi lý thuyết
                    └── V/      # VD (Vận dụng)
                        └── ...
```

### 4. Image Processing Strategy
**Option B: Local Cache + Upload (Recommended)**
```
LaTeX → Compile TikZ → WebP → Save Local → Upload to Drive → Update DB → Delete Local
```

**Image Naming Convention:**
- `{subcount}-QUES.webp` - Single question image
- `{subcount}-QUES-1.webp` - Multiple question images
- `{subcount}-SOL.webp` - Single solution image
- `{subcount}-SOL-1.webp` - Multiple solution images

**QuestionImage Status Field:**
```prisma
enum ImageStatus {
  PENDING     // Chưa upload
  UPLOADING   // Đang upload
  UPLOADED    // Đã upload thành công
  FAILED      // Upload thất bại
}
```

### 5. MapCode Management System
**MapCode Versioning Strategy:**
- File format: `.md` (Markdown) cho dễ đọc và parse
- Naming convention: `MapCode-YYYY-MM-DD.md` hoặc custom name
- Storage limit: Tối đa 20 versions, báo ADMIN khi đầy
- Active MapCode: ADMIN chọn version nào làm system-wide default
- Location: `docs/resources/latex/mapcode/`

**MapCode Structure Example:**
```markdown
# MapCode Configuration v2024-12-20

## Level Mapping (Fixed)
- N: Nhận biết
- H: Thông hiểu
- V: Vận dụng
- C: Vận dụng cao
- T: VIP
- M: Note

## Grade Mapping
- 0: Lớp 10
- 1: Lớp 11
- 2: Lớp 12

## Subject Mapping
- P: Toán học (10-NGÂN HÀNG CHÍNH, 11-NGÂN HÀNG CHÍNH)
- L: Vật lý
- H: Hóa học
```

### 6. Resource Management Structure
**Complete folder structure cho resources:**
```
docs/resources/latex/
├── mapcode/
│   ├── v2024-12-20/
│   │   ├── MapCode-2024-12-20.md
│   │   └── changelog.md
│   ├── v2024-11-15/
│   │   ├── MapCode-2024-11-15.md
│   │   └── changelog.md
│   └── current/
│       └── active-mapcode.md → symlink to latest
├── templates/
│   ├── image-compilation/
│   │   ├── tikz-template.tex
│   │   ├── compile-tikz.sh
│   │   └── webp-convert.sh
│   ├── exam-generation/
│   │   ├── exam-template.tex
│   │   ├── question-template.tex
│   │   └── answer-sheet-template.tex
│   └── parsing/
│       ├── bracket-parser-config.json
│       └── content-cleaning-rules.json
└── documentation/
    ├── mapcode-guide.md
    ├── template-usage.md
    └── compilation-guide.md
```

### 7. Các tính năng cần phát triển

#### A. LaTeX Parser System với Bracket Handling
- **Mục đích**: Parse nội dung LaTeX thành structured data theo 5 loại câu hỏi (MC/TF/SA/ES/MA)
- **Input**: Raw LaTeX từ file hoặc user input trong format `\begin{ex}...\end{ex}`
- **Bracket Parser**: Xử lý dấu ngoặc lồng nhau thay vì regex
- **Output**: Question object với đầy đủ fields đã định nghĩa
- **Hỗ trợ**: 2 layout (1 cột và 2 cột với `\immini[thm]{}{}`)

##### Các loại câu hỏi được hỗ trợ:
1. **MC (Multiple Choice)**: Trắc nghiệm 1 phương án đúng - có `\choice`
2. **TF (True/False)**: Trắc nghiệm nhiều phương án đúng - có `\choiceTF`
3. **SA (Short Answer)**: Trắc nghiệm trả lời ngắn - có `\shortans`
4. **MA (Matching)**: Câu hỏi ghép đôi - có `\matching`
5. **ES (Essay)**: Câu hỏi tự luận - không có answer commands

##### Logic trích xuất chính:
- **questionCode**: Từ pattern `%[XXXXX]` hoặc `%[XXXXX-X]` (ID5/ID6) thường nằm cùng hàng với \begin{ex}
- **subcount**: Từ pattern `[XX.N]` (VD: `[TL.100022]`) thường nằm dưới 1 hàng so với \begin{ex}
- **source**: Từ pattern `[Nguồn: "..."]`
- **type**: Dựa trên presence của `\choice` là MC, `\choiceTF` là TF, `\shortans` là SA, `\matching` là MA, nếu không có 4 cái trên là ES
- **content**: Loại bỏ metadata, answers, images, \loigiai{...} giữ lại nội dung câu hỏi (7 bước cleaning)
- **answers**: JSON field - MC/TF: array options, SA/ES/MA: null
- **correctAnswer**: JSON field - MC: single string, TF: array strings, SA: string, ES/MA: null
- **images**: Detect và process cả existing cloud images và TikZ compilation
- **solution**: Từ `\loigiai{...}`


#### B. Image Processing Pipeline
- **TikZ Compilation**: LaTeX → WebP conversion với local cache
- **Google Drive Integration**: Upload images với folder structure theo MapCode
- **Image Status Tracking**: PENDING → UPLOADING → UPLOADED/FAILED
- **Retry Mechanism**: Auto-retry failed uploads
- **Naming Convention**: `{subcount}-{QUES|SOL}-{index}.webp`

#### C. Question Management Interface
- **Admin Dashboard**: Quản lý câu hỏi với filtering, search, pagination
- **Question Form**: Input LaTeX, preview parsed data, manual editing với image preview
- **Bulk Import**: Upload file LaTeX, batch processing với error handling
- **Statistics**: Analytics theo questionCode parameters
- **MapCode Management**: Version control, active selection, storage warning

#### D. Error Handling Strategy
- **Parse Errors**: Status PENDING cho questions thiếu required fields
- **Image Upload Failures**: Local cache + retry mechanism
- **Validation Errors**: Detailed error messages với suggestions
- **Bulk Import Errors**: Partial success với error report

#### E. Status Workflow Management
- **ACTIVE**: Chỉ ACTIVE questions được public cho users
- **PENDING**: ADMIN review, edit và approve thành ACTIVE
- **INACTIVE/ARCHIVED**: ADMIN full control, không public
- **Auto-retry**: ADMIN có thể trigger parse lại cho PENDING questions
- **Permission**: Chỉ ADMIN có quyền quản lý tất cả status

## 🏷️ QuestionCode & MapCode System

### QuestionCode Format
- **ID5**: `%[XXXXX]` - 5 ký tự (VD: `%[2H5V3]`)
- **ID6**: `%[XXXXX-X]` - 7 ký tự (VD: `%[2H5V3-2]`)
- **Ký tự hợp lệ**: [0-9] và [A-Z]

### Cấu trúc tham số QuestionCode
```
ID5: [Tham số 1][Tham số 2][Tham số 3][Tham số 4][Tham số 5]
ID6: [Tham số 1][Tham số 2][Tham số 3][Tham số 4][Tham số 5]-[Tham số 6]

Tham số 1: Lớp (grade)     - VD: 0=Lớp 10, 1=Lớp 11, 2=Lớp 12
Tham số 2: Môn (subject)   - VD: P=Toán, L=Vật lý, H=Hóa học
Tham số 3: Chương (chapter) - VD: 1,2,3...
Tham số 4: Mức độ (level)   - N,H,V,C,T,M (cố định)
Tham số 5: Bài (lesson)     - VD: 1,2,3...
Tham số 6: Dạng (form)      - VD: 1,2,3... (chỉ ID6)

Note: Trong Google Drive folder structure, Level sẽ được đặt ở cuối cùng
QuestionCode: "0P1N1-1" → Folder: 0/P/1/1/1/N/
```

### Cấu hình mức độ (Level) - Dùng chung
```
[N] Nhận biết
[H] Thông hiểu
[V] Vận dụng
[C] Vận dụng cao
[T] VIP
[M] Note
```

### QuestionCode Relationship (Updated)
- **One-to-Many**: 1 QuestionCode → Nhiều Questions
- **Unique Code**: QuestionCode.code là Primary Key
- **Shared Classification**: Nhiều questions có thể cùng questionCode
- **Auto-creation**: Tự động tạo QuestionCode record khi parse LaTeX

**Example:**
```
QuestionCode: "0P1VH1" (1 record)
├── Question 1: "Tính đạo hàm của x²"
├── Question 2: "Tính đạo hàm của x³"
└── Question 3: "Tính đạo hàm của sin(x)"
```

### MapCode Hierarchy Example (From MapCode.md)
```
-[0] Lớp 10                                    (grade)
----[P] 10-NGÂN HÀNG CHÍNH                     (subject)
-------[1] Mệnh đề và tập hợp                  (chapter)
----------[1] Mệnh đề                          (lesson)
-------------[1] Xác định mệnh đề, mệnh đề chứa biến  (form)

QuestionCode "0P1N1-1" → Folder: 0/P/1/1/1/N/
```

### Subcount Format
```
Format: [XX.N]
- XX: 2 ký tự in hoa [A-Z] (VD: TL = Tú Linh)
- N: Số thứ tự (có thể nhiều chữ số)
- Example: [TL.100022]
- Uniqueness: Global unique, chỉ ADMIN được tạo subcount
- Purpose: Định danh duy nhất cho mỗi question, dùng để tìm lại khi cần
```

## 🔍 Content Extraction Process

### Quy trình trích xuất Content (7 bước chi tiết)
1. **Lấy nội dung từ ex environment**:
   - Extract toàn bộ trong `\begin{ex}...\end{ex}`
   - Preserve line breaks và structure

2. **Loại bỏ metadata patterns**:
   - questionCode: `%[XXXXX]` hoặc `%[XXXXX-X]`
   - source: `%[Nguồn: "..."]`
   - subcount: `[XX.N]` format

3. **Xử lý layout commands**:
   - 2-column layout: `\immini[thm]{content1}{content2}` → keep content1 only
   - Center environments: `\begin{center}...\end{center}` → remove entirely

4. **Loại bỏ hình ảnh commands**:
   - TikZ pictures: `\begin{tikzpicture}...\end{tikzpicture}`
   - Include graphics: `\includegraphics[options]{filename}`
   - Image containers: `\begin{center}...\end{center}` containing images

5. **Loại bỏ answer commands**:
   - MC: `\choice[options]{answer1}{answer2}{answer3}{answer4}`
   - TF: `\choiceTF[options]{statement1}{statement2}{statement3}{statement4}`
   - SA: `\shortans[options]{'answer'}`
   - MA: `\matching{item1}{item2}{match1}{match2}`

6. **Loại bỏ solution section**:
   - Remove entire `\loigiai{...}` blocks với bracket-aware parsing

7. **Normalize whitespace**:
   - Trim leading/trailing whitespace
   - Replace multiple spaces với single space
   - Remove empty lines
   - Preserve paragraph breaks

### Answer Extraction Rules

#### Multiple Choice (MC)
- **Answers**: Tất cả `{...}` trong `\choice`
- **Correct**: Chỉ `{\True ...}` (1 đáp án đúng duy nhất)

#### True/False (TF)
- **Answers**: Tất cả `{...}` trong `\choiceTF`
- **Correct**: Tất cả `{\True ...}` (có thể 0, 1 hoặc nhiều đáp án đúng)

#### Short Answer (SA)
- **Answers**: null (không có options)
- **Correct**: Nội dung trong `\shortans{'...'}`

#### Essay (ES)
- **Answers**: null
- **Correct**: null (không có đáp án cố định)

#### Matching (MA)
- **Answers**: null (complex matching logic, implement later)
- **Correct**: null (complex matching logic, implement later)

### Type Detection Logic
```
Priority order:
1. Có \choiceTF → TF
2. Có \choice (không phải \choiceTF) → MC
3. Có \shortans → SA
4. Có \matching → MA
5. Không có 4 cái trên → ES
```

#### B. Question Management API
- **CRUD Operations**: Create, Read, Update, Delete câu hỏi
- **Bulk Import**: Import hàng loạt từ LaTeX files
- **Filtering System**: Lọc theo grade, subject, chapter, level
- **Search Engine**: Full-text search trong content

#### C. Media Processing
- **Image Extraction**: Trích xuất hình ảnh từ LaTeX
- **Google Drive Upload**: Upload images lên Google Drive với folder structure
- **TikZ Compilation**: Server-side LaTeX compilation với 50s timeout
- **WebP Conversion**: Convert images sang WebP format cho optimization

#### D. Admin Dashboard
- **Question Browser**: Duyệt và quản lý câu hỏi với pagination
- **LaTeX Input**: Interface nhập LaTeX với preview
- **Question Editor**: Chỉnh sửa từng field của câu hỏi
- **Bulk Import**: Upload file LaTeX hàng loạt
- **Statistics**: Thống kê theo questionCode parameters
- **Quality Control**: Review, approve, reject câu hỏi
- **MapCode Management**: Quản lý mapping questionCode → meaning

## 🔍 Question Filtering System

### Lọc theo QuestionCode Parameters
- **grade (Lớp)**: 3,4,5,6,7,8,9,0,1,2...
- **subject (Môn)**: P,L,H,T,S...
- **chapter (Chương)**: 1,2,3,4,5...
- **level (Mức độ)**: N,H,V,C,T,M
- **lesson (Bài)**: 1,2,3,A,B,C...
- **form (Dạng)**: 1,2,3... (chỉ ID6)

### Lọc theo Metadata
- **type**: MC, TF, SA, ES, MA
- **subcount**: Tìm theo mã subcount
- **tags**: Lọc theo tags tự do
- **creator**: Lọc theo người tạo
- **status**: ACTIVE, PENDING, INACTIVE, ARCHIVED
- **usageCount**: Sắp xếp theo độ phổ biến

### Advanced Search
- **Full-text search**: Tìm kiếm trong content câu hỏi
- **Tag-based search**: Tìm kiếm theo tags
- **Type filters**: Lọc theo loại câu hỏi
- **Metadata filters**: Kết hợp với questionCode filters
- **Date range**: Lọc theo thời gian tạo/cập nhật
- **Has images**: Lọc câu hỏi có/không có hình ảnh
- **Has solution**: Lọc câu hỏi có/không có lời giải
- **Has answers**: Lọc câu hỏi có/không có đáp án
- **Has feedback**: Lọc câu hỏi có/không có feedback

## 🗺️ MapCode Translation System

### Mục đích
- Chuyển đổi questionCode parameters thành ý nghĩa dễ hiểu
- VD: `2H5V3-2` → "Lớp 12 - Hình học - Chương 5 - Vận dụng - Bài 3 - Dạng 2"

### Implementation Strategy
- **Level mapping**: Hard-coded (N→Nhận biết, H→Thông hiểu...)
- **Other parameters**: Lookup từ MapCode hierarchy tree
- **Caching**: Cache mapping results để tăng performance
- **Fallback**: Hiển thị raw code nếu không tìm thấy mapping

### 3. Performance Optimization

#### Database Indexing
- Composite indexes cho filtering patterns phổ biến
- Full-text search indexes cho content
- Partitioning theo grade hoặc subject (nếu cần)

#### Caching Strategy
- Redis cache cho frequently accessed questions (đã setup)
- Google Drive cho images (không cần CDN)
- Query result caching cho complex filters

#### Vietnamese Full-text Search Strategy
**Implemented: OpenSearch + PostgreSQL Architecture**

## 🔍 **OpenSearch Vietnamese Configuration**

### **Phase 1: OpenSearch Cluster Setup**
```yaml
# docker-compose.opensearch.yml
version: '3.8'
services:
  opensearch-master-1:
    image: opensearchproject/opensearch:2.11.0
    container_name: nynus-opensearch-master-1
    environment:
      - cluster.name=nynus-cluster
      - node.name=master-1
      - node.roles=cluster_manager
      - discovery.seed_hosts=master-1,master-2,master-3
      - cluster.initial_cluster_manager_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms4g -Xmx4g"
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=NyNus2025SecurePassword!
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - opensearch-master-1:/usr/share/opensearch/data
      - ./opensearch/config/opensearch.yml:/usr/share/opensearch/config/opensearch.yml
      - ./opensearch/plugins:/usr/share/opensearch/plugins

  opensearch-data-1:
    image: opensearchproject/opensearch:2.11.0
    container_name: nynus-opensearch-data-1
    environment:
      - cluster.name=nynus-cluster
      - node.name=data-1
      - node.roles=data,ingest
      - discovery.seed_hosts=master-1,master-2,master-3
      - cluster.initial_cluster_manager_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms8g -Xmx8g"
```

### **Phase 2: Vietnamese Plugin Integration**
```bash
#!/bin/bash
# install-vietnamese-plugins.sh

# Install opensearch-analysis-vietnamese plugin
opensearch-plugin install https://github.com/duydo/opensearch-analysis-vietnamese/releases/download/v2.11.0/opensearch-analysis-vietnamese-2.11.0.zip

# Install ICU plugin for Unicode normalization
opensearch-plugin install analysis-icu

# Install phonetic plugin for similar-sounding Vietnamese terms
opensearch-plugin install analysis-phonetic

# Restart OpenSearch
systemctl restart opensearch
```

### **Phase 3: Advanced Vietnamese Analyzers**
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "vietnamese_education": {
          "type": "custom",
          "tokenizer": "vi_tokenizer",
          "filter": [
            "lowercase",
            "icu_folding",
            "vietnamese_stop",
            "education_synonym",
            "math_symbol_filter"
          ]
        },
        "vietnamese_search": {
          "type": "custom",
          "tokenizer": "vi_tokenizer",
          "filter": [
            "lowercase",
            "icu_folding",
            "vietnamese_stop"
          ]
        },
        "vietnamese_phonetic": {
          "type": "custom",
          "tokenizer": "vi_tokenizer",
          "filter": [
            "lowercase",
            "icu_folding",
            "vietnamese_phonetic_filter"
          ]
        }
      },
      "tokenizer": {
        "vi_tokenizer": {
          "type": "vi_tokenizer"
        }
      },
      "filter": {
        "vietnamese_stop": {
          "type": "stop",
          "stopwords": [
            // Vietnamese stop words
            "và", "của", "trong", "với", "cho", "từ", "đến", "về", "theo",
            "như", "được", "có", "là", "một", "các", "này", "đó", "những",
            "khi", "nếu", "mà", "để", "sẽ", "đã", "bị", "bởi", "tại",
            // English stop words
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
            "for", "of", "with", "by", "from", "up", "about", "into"
          ]
        },
        "education_synonym": {
          "type": "synonym",
          "synonyms": [
            // Mathematics (Toán học)
            "toán,toan,math,mathematics,số học,so hoc",
            "giải,giai,solve,solution,lời giải,loi giai",
            "tính,tinh,calculate,compute,tính toán,tinh toan",
            "phương trình,phuong trinh,equation",
            "đạo hàm,dao ham,derivative",
            "tích phân,tich phan,integral",
            "giới hạn,gioi han,limit",
            "hình học,hinh hoc,geometry",
            "lượng giác,luong giac,trigonometry",

            // Physics (Vật lý)
            "vật lý,vat ly,physics,lý,ly",
            "lực,luc,force",
            "vận tốc,van toc,velocity,speed",
            "gia tốc,gia toc,acceleration",
            "năng lượng,nang luong,energy",
            "công suất,cong suat,power",

            // Chemistry (Hóa học)
            "hóa học,hoa hoc,chemistry,hóa,hoa",
            "phản ứng,phan ung,reaction",
            "nguyên tố,nguyen to,element",
            "hợp chất,hop chat,compound",
            "dung dịch,dung dich,solution",

            // Biology (Sinh học)
            "sinh học,sinh hoc,biology,sinh",
            "tế bào,te bao,cell",
            "gen,gene,genetic",
            "DNA,ADN",
            "protein,protit",

            // Literature (Văn học)
            "văn học,van hoc,literature,văn,van",
            "thơ,tho,poetry,poem",
            "truyện,truyen,story,novel",
            "tác giả,tac gia,author,writer",

            // Learning terms
            "học,hoc,study,learning,learn",
            "bài,bai,lesson,exercise,problem",
            "tập,tap,practice,drill,exercise",
            "kiểm tra,kiem tra,test,exam,check",
            "thi,exam,test,examination",
            "ôn,on,review,revision",
            "luyện,luyen,practice,drill",

            // Difficulty levels
            "dễ,de,easy,simple,cơ bản,co ban",
            "khó,kho,hard,difficult,nâng cao,nang cao",
            "trung bình,trung binh,medium,average,moderate",

            // Grade levels
            "lớp,lop,grade,class",
            "cấp,cap,level,grade",
            "10,mười,muoi,ten,tenth",
            "11,mười một,muoi mot,eleven,eleventh",
            "12,mười hai,muoi hai,twelve,twelfth",

            // Question types
            "trắc nghiệm,trac nghiem,multiple choice,MC",
            "tự luận,tu luan,essay,written,ES",
            "đúng sai,dung sai,true false,TF",
            "điền khuyết,dien khuyet,fill blank,short answer,SA"
          ]
        },
        "vietnamese_phonetic_filter": {
          "type": "phonetic",
          "encoder": "double_metaphone",
          "replace": false
        },
        "math_symbol_filter": {
          "type": "pattern_replace",
          "pattern": "([+\\-*/=<>≤≥≠∞∑∏∫])",
          "replacement": " $1 "
        }
      }
    }
  }
}
```

### **Phase 4: OpenSearch Index Mapping**
```json
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "content": {
        "type": "text",
        "analyzer": "vietnamese_education",
        "search_analyzer": "vietnamese_search",
        "fields": {
          "keyword": {"type": "keyword"},
          "suggest": {
            "type": "completion",
            "analyzer": "vietnamese_education"
          }
        }
      },
      "rawContent": {
        "type": "text",
        "analyzer": "vietnamese_education"
      },
      "type": {"type": "keyword"},
      "status": {"type": "keyword"},
      "questionCodeId": {"type": "keyword"},
      "creator": {"type": "keyword"},
      "grade": {"type": "keyword"},
      "subject": {"type": "keyword"},
      "chapter": {"type": "keyword"},
      "level": {"type": "keyword"},
      "usageCount": {"type": "integer"},
      "createdAt": {"type": "date"},
      "updatedAt": {"type": "date"},
      "tags": {"type": "keyword"},
      "solution": {
        "type": "text",
        "analyzer": "vietnamese_education"
      }
    }
  }
}
```

### **Phase 5: Real-time Sync Architecture**
```typescript
// Clean architecture: PostgreSQL (primary) + OpenSearch (search index)
class OpenSearchSyncService {
  async syncQuestionToSearch(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { questionCode: true, questionTags: true }
    });

    if (question) {
      await this.opensearch.index({
        index: 'questions_v1',
        id: question.id,
        body: {
          id: question.id,
          content: question.content,
          rawContent: question.rawContent,
          type: question.type,
          status: question.status,
          questionCodeId: question.questionCodeId,
          creator: question.creator,
          usageCount: question.usageCount,
          createdAt: question.createdAt.toISOString(),
          updatedAt: question.updatedAt.toISOString(),
          tags: question.questionTags.map(t => t.tagName),
          solution: question.solution,

          // Additional searchable fields from questionCode
          grade: question.questionCode.grade,
          subject: question.questionCode.subject,
          chapter: question.questionCode.chapter,
          level: question.questionCode.level,
          lesson: question.questionCode.lesson,
          form: question.questionCode.form
        }
      });
    }
  }
}
```

### **Phase 6: Enhanced Performance Targets**
- **Search speed**: <200ms for simple queries (consistent performance)
- **Vietnamese accuracy**: 95%+ với accents, typos, và phonetic matching
- **Concurrent users**: 10,000+ simultaneous searches
- **Document scale**: 1.5M+ questions supported
- **Index size**: Optimized với compression
- **Memory usage**: Scalable với cluster architecture



### 4. Security & Validation

#### Input Validation
- Sanitize LaTeX input để tránh XSS
- Validate questionCode format
- File type validation cho uploads

#### Access Control & Permission System
- **Current System**: 5 roles (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
- **Permission Strategy**:
  - **ADMIN**: Full control + customize permissions cho other roles
  - **Other Roles**: Configurable permissions via Admin Management Page
  - **Default Permissions**:
    - TEACHER: QUESTION_READ, QUESTION_WRITE
    - TUTOR: QUESTION_READ, QUESTION_WRITE
    - STUDENT: QUESTION_READ only
    - GUEST: No question permissions
- **Current Status**: Chưa implement Question Management permissions
- **Admin Customization**: ADMIN có thể tùy biến quyền cho từng role
- **Audit logs**: Track sensitive operations

## 📋 Roadmap phát triển - Revised Version

### Phase 1: Database Foundation (Tuần 1-2)
- [ ] **Database Schema**: Question, QuestionCode, supporting models (KHÔNG có MapCode table)
- [ ] **Basic APIs**: Question CRUD operations
- [ ] **Admin Layout**: Authentication và routing structure
- [ ] **Component Structure**: Setup feature-based component architecture

### Phase 2: Advanced LaTeX Parser (Tuần 2-4)
- [ ] **Bracket-aware Parser**: Xử lý dấu ngoặc lồng nhau thay vì regex
- [ ] **Enhanced Type Detection**: MC/TF/SA/MA/ES với logic chính xác
- [ ] **Content Extraction**: Loại bỏ metadata, answers, images, \loigiai{}
- [ ] **Multi-answer Support**: Hỗ trợ nhiều đáp án đúng cho TF
- [ ] **Position-aware Parsing**: questionCode (cùng hàng), subcount (dưới 1 hàng)

### Phase 3: Component Development (Tuần 3-4)
- [ ] **Form Components**: QuestionForm, LaTeXInput, ParsedDataPreview
- [ ] **Display Components**: QuestionCard, QuestionTable, Badge components
- [ ] **Filter Components**: Multi-criteria filtering interface
- [ ] **Management Components**: Question list, bulk operations
- [ ] **Index.ts Structure**: Comprehensive exports cho từng feature

### Phase 4: User-specific MapCode System (Tuần 4-5)
- [ ] **MapCode Configuration**: Per-user customizable mapping (không lưu DB)
- [ ] **Translation Service**: QuestionCode → meaningful text
- [ ] **Configuration Interface**: UI để user tùy biến MapCode
- [ ] **Fallback Handling**: Display raw code khi không có mapping

### Phase 5: Question Management Interface (Tuần 5-6)
- [ ] **Question Form**: Auto-extraction với error handling
- [ ] **Question List**: Pagination, sorting, filtering
- [ ] **Advanced Filtering**: Multi-criteria với QuestionCode parameters
- [ ] **Bulk Operations**: Import/export, mass edit
- [ ] **Preview System**: LaTeX rendering và question preview

### Phase 6: OpenSearch Advanced Search & Features (Tuần 6-7)
- [ ] **OpenSearch Production Optimization**: Enhanced Vietnamese search capabilities
  - [ ] **Phase 0**: Production environment setup (2h)
  - [ ] **Phase 1**: Vietnamese plugin optimization (3h)
  - [ ] **Phase 2**: Advanced search features implementation (8h)
  - [ ] **Phase 3**: Performance tuning & monitoring (5h)
- [ ] **Vietnamese Plugin Integration**: opensearch-analysis-vietnamese, analysis-icu, analysis-phonetic
- [ ] **Advanced Search API**: Enhanced Vietnamese search với 350+ education domain synonyms
- [ ] **Real-time Sync**: PostgreSQL → OpenSearch sync service với fallback mechanisms
- [ ] **Search Features**: Phonetic matching, accent handling, typo tolerance
- [ ] **Image Processing**: Detect và extract images từ LaTeX
- [ ] **Statistics Dashboard**: Analytics theo questionCode parameters
- [ ] **Quality Control**: Review, approve, reject workflow

### Phase 7: Production Ready (Tuần 7-8)
- [ ] **Performance Optimization**: Query optimization, caching
- [ ] **Error Handling**: Comprehensive error handling và validation
- [ ] **Testing**: Unit, integration, E2E tests
- [ ] **Documentation**: API docs, user guides

## ⚠️ Lưu ý quan trọng trong phát triển

### LaTeX Parser - Critical Notes
- **Bracket Handling**: LaTeX có nhiều dấu ngoặc lồng nhau `{...{...}...}`, KHÔNG dùng regex
- **State Machine**: Cần xây dựng bracket parser với state tracking
- **Position Awareness**:
  - questionCode: Cùng hàng với `\begin{ex}`
  - subcount: Dưới 1 hàng so với `\begin{ex}`
- **Type Detection Priority**:
  1. `\choiceTF` → TF
  2. `\choice` (không phải `\choiceTF`) → MC
  3. `\shortans` → SA
  4. `\matching` → MA
  5. Không có 4 cái trên → ES

### Answer Storage Logic - Critical Notes
- **MC**: `answers: ["A", "B", "C", "D"]`, `correctAnswer: "C"` (single)
- **TF**: `answers: ["Statement 1", "Statement 2"]`, `correctAnswer: ["Statement 1"]` (multiple)
- **SA**: `answers: null`, `correctAnswer: "Short answer"` (direct)
- **ES/MA**: `answers: null`, `correctAnswer: null` (no fixed answer)

### Component Architecture - Critical Notes
- **Feature-based Structure**: `components/feature/question/[function]/`
- **Index.ts Required**: Mỗi thư mục con phải có index.ts với exports
- **No App-level Components**: Components phải ở thư mục components, không chung với app
- **Inheritance Pattern**: Sử dụng index.ts để kế thừa và export

### MapCode System - Critical Notes
- **No Database Table**: MapCode KHÔNG lưu trong database
- **Current**: System-wide MapCode configuration (ADMIN quản lý)
- **Future**: Mỗi TEACHER có thể có MapCode configuration riêng
- **Customizable Parameters**: Tất cả parameters có thể tùy biến (kể cả Level)
- **Fallback Strategy**: Hiển thị raw code khi không có mapping

### Image Processing - Critical Notes
- **Google Drive API**: Cần setup credentials và folder structure
- **TikZ Compilation**: Server-side compilation với LaTeX compiler (đã có)
- **Compilation Timeout**: 50 seconds cho TikZ compilation
- **WebP Format**: Output format cho optimized file size
- **Local Cache**: Save local → Upload → Delete local strategy
- **Status Tracking**: QuestionImage.status field cho upload state
- **Naming Convention**: `{subcount}-{QUES|SOL}-{index}.webp`
- **Auto Folder Creation**: Folders tự động tạo theo MapCode structure

### Database Design - Critical Notes
- **QuestionCode Relationship**: One-to-Many (1 code → nhiều questions)
- **Performance Indexes**: Composite indexes cho filtering patterns
- **No MapCode Table**: MapCode lưu trong .md files, user-specific
- **Image Storage**: Separate QuestionImage table, không dùng JSON
- **Answer Storage**: JSON fields trong Question table

### Content Extraction - Critical Notes
- **Multi-step Process**: 7 bước loại bỏ metadata → content
- **Layout Handling**: Xử lý cả 1 cột và 2 cột (`\immini`)
- **Image Detection**: Detect nhưng không extract (để sau)
- **Solution Removal**: Loại bỏ `\loigiai{...}` khỏi content
- **Multi-answer Support**: TF có thể có nhiều đáp án đúng

### MapCode Management - Critical Notes
- **File Format**: .md (Markdown) cho dễ đọc và parse
- **Versioning**: Tối đa 20 versions, naming `MapCode-YYYY-MM-DD.md`
- **Active Selection**: ADMIN chọn version nào làm system-wide
- **Future Enhancement**: TEACHER có thể có MapCode config riêng
- **Storage Location**: `docs/resources/latex/mapcode/`
- **No Data Migration**: Khi MapCode thay đổi, dùng subcount để tìm lại, không cần data migration

### Development Priorities
1. **Google Drive API Setup**: Cần setup trước khi implement image processing
2. **Bracket Parser Logic**: Quan trọng nhất, cần liên hệ để làm lại nhiều lần
3. **Component Structure**: Setup đúng từ đầu để tránh refactor
4. **OpenSearch Setup**: Vietnamese search với 350+ education domain synonyms và advanced plugins
5. **Image Processing Pipeline**: TikZ compilation + upload workflow
6. **MapCode Management**: Version control và active selection
7. **Permission System**: ADMIN customizable role permissions
8. **Error Handling**: PENDING status cho parse failures
9. **Performance**: Filtering phải nhanh với large dataset

## 🔍 **OpenSearch Implementation Details**

### Production Docker Setup
```yaml
# docker/opensearch/docker-compose.production.yml
version: '3.8'
services:
  # OpenSearch Master Nodes (3 nodes for HA)
  opensearch-master-1:
    image: opensearchproject/opensearch:2.11.0
    container_name: nynus-opensearch-master-1
    environment:
      - cluster.name=nynus-production-cluster
      - node.name=master-1
      - node.roles=cluster_manager
      - discovery.seed_hosts=master-1,master-2,master-3
      - cluster.initial_cluster_manager_nodes=master-1,master-2,master-3
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms4g -Xmx4g"
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=NyNus2025SecurePassword!
    ports:
      - "9200:9200"
      - "9600:9600"
    volumes:
      - opensearch-master-1-data:/usr/share/opensearch/data
      - ./config/opensearch.production.yml:/usr/share/opensearch/config/opensearch.yml
      - ./plugins:/usr/share/opensearch/plugins
    networks:
      - nynus-network

  # OpenSearch Data Nodes (3 nodes for scalability)
  opensearch-data-1:
    image: opensearchproject/opensearch:2.11.0
    container_name: nynus-opensearch-data-1
    environment:
      - cluster.name=nynus-production-cluster
      - node.name=data-1
      - node.roles=data,ingest
      - "OPENSEARCH_JAVA_OPTS=-Xms8g -Xmx8g"
    volumes:
      - opensearch-data-1-data:/usr/share/opensearch/data
    networks:
      - nynus-network

volumes:
  opensearch-master-1-data:
  opensearch-data-1-data:

networks:
  nynus-network:
    driver: bridge
```

### Service Implementation
```typescript
// packages/search/src/opensearch.service.ts
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService {
  private client = new Client({
    node: process.env.OPENSEARCH_URL || 'https://localhost:9200',
    auth: {
      username: process.env.OPENSEARCH_USERNAME || 'admin',
      password: process.env.OPENSEARCH_PASSWORD || 'NyNus2025SecurePassword!'
    },
    ssl: { rejectUnauthorized: false }
  });

  async setupQuestionIndex() {
    await this.client.indices.create({
      index: 'questions_v1',
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 2,
          analysis: {
            analyzer: {
              vietnamese_education: {
                type: 'custom',
                tokenizer: 'vi_tokenizer',
                filter: ['lowercase', 'icu_folding', 'vietnamese_stop', 'education_synonym']
              }
            },
            filter: {
              vietnamese_stop: {
                type: 'stop',
                stopwords: [
                  'và', 'của', 'trong', 'với', 'cho', 'từ', 'đến', 'về', 'theo',
                  'như', 'được', 'có', 'là', 'một', 'các', 'này', 'đó', 'những'
                ]
              },
              education_synonym: {
                type: 'synonym',
                synonyms: [
                  'toán,toan,math,mathematics,số học',
                  'văn,van,literature,ngữ văn',
                  'lý,ly,physics,vật lý',
                  'hóa,hoa,chemistry,hóa học',
                  'sinh,biology,sinh học',
                  'học,hoc,study,learning',
                  'bài,bai,lesson,exercise',
                  'tập,tap,practice,drill',
                  'kiểm tra,kiem tra,test,exam',
                  'dễ,de,easy,simple,cơ bản',
                  'khó,kho,hard,difficult,nâng cao'
                ]
              }
            }
          }
        },
        mappings: {
          properties: {
            content: {
              type: 'text',
              analyzer: 'vietnamese_education',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion', analyzer: 'vietnamese_education' }
              }
            },
            rawContent: { type: 'text', analyzer: 'vietnamese_education' },
            type: { type: 'keyword' },
            status: { type: 'keyword' },
            grade: { type: 'keyword' },
            subject: { type: 'keyword' },
            usageCount: { type: 'integer' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
  }

  async searchQuestions(query: string, filters: SearchFilters = {}) {
    return await this.client.search({
      index: 'questions_v1',
      body: {
        query: {
          bool: {
            must: [{
              multi_match: {
                query,
                fields: ['content^3', 'rawContent^2', 'solution^1.5'],
                analyzer: 'vietnamese_education',
                fuzziness: 'AUTO'
              }
            }],
            filter: this.buildFilters(filters)
          }
        },
        highlight: { fields: { content: {} } },
        sort: [{ _score: { order: 'desc' } }, { usageCount: { order: 'desc' } }],
        size: filters.limit || 20,
        from: filters.offset || 0
      }
    });
  }

  private buildFilters(filters: SearchFilters) {
    const filterClauses = [];
    if (filters.type) filterClauses.push({ term: { type: filters.type } });
    if (filters.status) filterClauses.push({ term: { status: filters.status } });
    if (filters.grade) filterClauses.push({ term: { grade: filters.grade } });
    if (filters.subject) filterClauses.push({ term: { subject: filters.subject } });
    return filterClauses;
  }
}
```

### Real-time Sync Implementation
```typescript
// packages/search/src/services/opensearch-sync.service.ts
@Injectable()
export class OpenSearchSyncService {
  constructor(
    private prisma: PrismaService,
    private opensearch: OpenSearchService,
    private logger: Logger
  ) {}

  async syncQuestionToSearch(questionId: string) {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
        include: {
          questionCode: true,
          questionTags: true
        }
      });

      if (question && question.status === 'ACTIVE') {
        await this.opensearch.addDocument('questions_v1', {
          id: question.id,
          content: question.content,
          rawContent: question.rawContent,
          type: question.type,
          status: question.status,
          questionCodeId: question.questionCodeId,
          creator: question.creator,
          usageCount: question.usageCount,
          createdAt: question.createdAt.toISOString(),
          updatedAt: question.updatedAt.toISOString(),
          tags: question.questionTags.map(t => t.tagName),
          solution: question.solution,

          // Additional searchable fields từ questionCode
          grade: question.questionCode.grade,
          subject: question.questionCode.subject,
          chapter: question.questionCode.chapter,
          level: question.questionCode.level,
          lesson: question.questionCode.lesson,
          form: question.questionCode.form
        });

        this.logger.log(`✅ Synced question ${questionId} to OpenSearch`);
      } else if (question?.status !== 'ACTIVE') {
        // Remove từ search index nếu không active
        await this.opensearch.deleteDocument('questions_v1', questionId);
        this.logger.log(`🗑️ Removed question ${questionId} from OpenSearch (status: ${question?.status})`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to sync question ${questionId}:`, error);
      throw error;
    }
  }

  async bulkSyncQuestions(questionIds: string[]) {
    const batchSize = 100;
    for (let i = 0; i < questionIds.length; i += batchSize) {
      const batch = questionIds.slice(i, i + batchSize);
      await Promise.all(batch.map(id => this.syncQuestionToSearch(id)));
    }
  }
}
```

### OpenSearch Performance Monitoring
```typescript
// Enhanced performance targets and monitoring for OpenSearch
interface OpenSearchPerformanceMetrics {
  searchTime: number;        // Target: <200ms (consistent)
  complexSearchTime: number; // Target: <500ms (complex queries)
  indexSize: number;         // Optimized với compression
  memoryUsage: number;       // Scalable với cluster architecture
  accuracyScore: number;     // Target: 95%+ Vietnamese accuracy
  concurrentUsers: number;   // Target: 10,000+ simultaneous
  clusterHealth: string;     // Target: Green status
  documentCount: number;     // Support: 1.5M+ questions
}

// Performance monitoring service
class OpenSearchMonitoringService {
  async getPerformanceMetrics(): Promise<OpenSearchPerformanceMetrics> {
    const clusterStats = await this.opensearch.cluster.stats();
    const indexStats = await this.opensearch.indices.stats({ index: 'questions_v1' });

    return {
      searchTime: await this.measureSearchTime(),
      complexSearchTime: await this.measureComplexSearchTime(),
      indexSize: indexStats.body.indices.questions_v1.total.store.size_in_bytes,
      memoryUsage: clusterStats.body.nodes.jvm.mem.heap_used_in_bytes,
      accuracyScore: await this.measureVietnameseAccuracy(),
      concurrentUsers: await this.getCurrentConcurrentUsers(),
      clusterHealth: (await this.opensearch.cluster.health()).body.status,
      documentCount: indexStats.body.indices.questions_v1.total.docs.count
    };
  }

  private async measureVietnameseAccuracy(): Promise<number> {
    const testQueries = [
      'toán học', 'đạo hàm', 'phương trình', 'giải bài tập',
      'tích phân', 'hình học', 'vật lý', 'hóa học'
    ];

    let totalAccuracy = 0;
    for (const query of testQueries) {
      const accuracy = await this.testQueryAccuracy(query);
      totalAccuracy += accuracy;
    }

    return totalAccuracy / testQueries.length;
  }
}
```

## 🔧 **OpenSearch Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Cluster Health Issues**
```bash
# Check cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Check node status
curl -X GET "localhost:9200/_cat/nodes?v"

# Check shard allocation
curl -X GET "localhost:9200/_cat/shards?v"

# Fix unassigned shards
curl -X POST "localhost:9200/_cluster/reroute?retry_failed=true"
```

#### **2. Vietnamese Plugin Issues**
```bash
# Verify plugin installation
curl -X GET "localhost:9200/_cat/plugins?v"

# Test Vietnamese analyzer
curl -X POST "localhost:9200/_analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzer": "vietnamese_education",
    "text": "Tính đạo hàm của hàm số f(x) = x² + 2x + 1"
  }'

# Reinstall plugins if needed
opensearch-plugin remove analysis-vietnamese
opensearch-plugin install analysis-vietnamese
systemctl restart opensearch
```

#### **3. Search Performance Issues**
```bash
# Check slow queries
curl -X GET "localhost:9200/_cat/indices?v&s=search.query_time_in_millis:desc"

# Monitor search performance
curl -X GET "localhost:9200/_nodes/stats/indices/search"

# Optimize index
curl -X POST "localhost:9200/questions_v1/_forcemerge?max_num_segments=1"
```

#### **4. Memory Issues**
```bash
# Check memory usage
curl -X GET "localhost:9200/_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,ram.percent,ram.current,ram.max"

# Adjust heap size in docker-compose.yml
OPENSEARCH_JAVA_OPTS: "-Xms8g -Xmx8g"

# Clear cache if needed
curl -X POST "localhost:9200/_cache/clear"
```





---

**Document Version**: 3.0.0 - Production Specification
**Last Updated**: July 23, 2025
**Status**: Production Ready
**Next Review**: Quarterly Review (October 2025)

*Technical specification cho NyNus Question Management System với OpenSearch Vietnamese search engine. Comprehensive education domain optimization với 95%+ Vietnamese accuracy và enterprise-scale performance.*
