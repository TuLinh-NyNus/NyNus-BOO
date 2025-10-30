# 📝 Checklist Triển Khai Hệ Thống Blog

## 📋 Tổng quan
- **Dự án**: Hệ thống Blog/Lý thuyết NyNus
- **Kiến trúc**: gRPC-only, Client-side KaTeX, TikZ cloud images
- **Tech Stack**: 
  - Backend: Go + gRPC + PostgreSQL
  - Frontend: Next.js 15 + React 19 + TypeScript + KaTeX
  - Storage: Cloudinary (images)
- **Phạm vi**: Blog, Lý thuyết, Math Notes với quy trình duyệt bài

---

## 🗄️ Backend & Database

### Phase 1: Database Schema (4-6 giờ)
- [ ] **Tạo migration cho bảng chính**
  - [ ] `posts` - bài viết (id, slug, type, status, author_id, category_id, hero_asset_id, math_enabled, published_at)
  - [ ] `post_versions` - phiên bản bài (version, title, summary, markdown, macros, word_count, created_by, change_note)
  - [ ] `post_reviews` - lịch sử duyệt (reviewer_id, status, comment, decided_at)
  - [ ] `categories` - danh mục (slug, name, parent_id)
  - [ ] `tags` - thẻ (slug, name)
  - [ ] `post_tags` - liên kết bài-thẻ (N-N)

- [ ] **Tạo migration cho assets & TikZ**
  - [ ] `assets` - tài nguyên (kind, provider='CLOUDINARY', public_id, url, format, hash, width, height)
  - [ ] `post_assets` - liên kết bài-tài nguyên (usage: HERO/INLINE/ATTACHMENT)
  - [ ] `tikz_templates` - mẫu TikZ (name, engine, output_format, preamble, timeout_seconds)
  - [ ] `tikz_sources` - mã TikZ (template_id, code, code_hash, compiled_asset_id, compile_status, error_log)

- [ ] **Tạo migration cho import**
  - [ ] `import_jobs` - job nhập liệu (source_type, status, options_json, error_log)
  - [ ] `import_results` - kết quả import (import_job_id, post_id, section, status, note)

- [ ] **Indexes & Constraints**
  - [ ] Unique index trên `posts.slug`
  - [ ] Index `(status, published_at desc)` cho posts
  - [ ] Index `(type, published_at desc)` cho filter theo loại
  - [ ] Unique index trên `assets.hash` cho dedup
  - [ ] Unique index trên `tikz_sources.code_hash` cho cache

### Phase 2: gRPC Services Implementation (8-10 giờ)

#### BlogService
- [ ] **CRUD Operations**
  - [ ] `CreatePost` - tạo bài nháp (validate slug ASCII, set status=DRAFT)
  - [ ] `UpdatePost` - cập nhật (tạo version mới, giữ version cũ)
  - [ ] `GetPost` - lấy bài theo id/slug (JOIN với current_version)
  - [ ] `ListPosts` - danh sách với filters (category, type, tags, status, pagination)
  - [ ] `DeletePost` - soft delete (status=ARCHIVED)

- [ ] **Moderation Flow** 
  - [ ] `SubmitForReview` - chuyển status DRAFT → PENDING_REVIEW
  - [ ] `ApprovePost` - duyệt bài (status → APPROVED, ghi post_reviews)
  - [ ] `PublishPost` - xuất bản (status → PUBLISHED, set published_at)
  - [ ] `UnpublishPost` - gỡ xuất bản
  - [ ] **Interceptor kiểm tra role ADMIN** cho tất cả RPCs

#### TikzCompilerService (Python microservice)
- [ ] **Core Compiler**
  - [ ] Setup Python service với gRPC server
  - [ ] Container Docker: python:3.11 + texlive + poppler + cloudinary
  - [ ] Port code từ `tools/image/core/tikz_compiler.py`
  - [ ] Mapping template_id → preamble (từ settings.py)

- [ ] **Compile Flow**
  - [ ] `CompileTikz` - nhận template_id + code
  - [ ] Check cache theo hash(template_id + code)
  - [ ] Nếu cache hit: trả AssetRef từ DB
  - [ ] Nếu cache miss:
    - [ ] Compile với pdflatex → PDF
    - [ ] Convert PDF → image (format theo template)
    - [ ] Crop whitespace + padding
    - [ ] Upload Cloudinary, nhận url/public_id
    - [ ] Lưu DB assets + tikz_sources
    - [ ] Trả AssetRef
  - [ ] `ListTemplates` - danh sách template khả dụng

- [ ] **Cloudinary Integration**
  - [ ] Config SDK với api_key/secret từ env
  - [ ] Upload với folder structure: `tikz/{year}/{month}/{hash[0:2]}/`
  - [ ] Set transformation params nếu cần

#### SearchService
- [ ] **Indexing**
  - [ ] Build index từ posts (title, markdown text, tags, category)
  - [ ] Normalize tiếng Việt (bỏ dấu option)
  - [ ] Store index trong memory/Redis

- [ ] **Search RPC**
  - [ ] `Search` - streaming results
  - [ ] Filter theo category/type/tags
  - [ ] Score và sort theo relevance
  - [ ] Generate snippet với highlight

#### ImportService  
- [ ] **File Processing**
  - [ ] `UploadImportFile` - client-stream nhận DOCX/PDF
  - [ ] Store temp file hoặc upload Cloudinary
  - [ ] `CreateImportJob` - tạo job với options
  - [ ] Background worker:
    - [ ] DOCX → Markdown (pandoc/mammoth)
    - [ ] PDF → text/Markdown (pdfplumber/OCR)
    - [ ] Google Docs → fetch via API/export URL
    - [ ] Split theo headings nếu cấu hình
    - [ ] Create posts với status=DRAFT
  - [ ] `GetImportStatus` - trạng thái job
  - [ ] `ListImportResults` - danh sách bài được tạo

### Phase 3: Authentication & Authorization (3-4 giờ)
- [ ] **JWT/Session Management**
  - [ ] Interceptor kiểm tra token cho protected RPCs
  - [ ] Extract user_id, role từ claims
  - [ ] Validate role=ADMIN cho BlogService operations

- [ ] **Rate Limiting**
  - [ ] Rate limit cho TikzCompilerService
  - [ ] Throttle ImportService uploads
  - [ ] DDoS protection cho Search

### Phase 4: Testing & Deployment (4-5 giờ)
- [ ] **Unit Tests**
  - [ ] Test CRUD operations
  - [ ] Test moderation flow
  - [ ] Test TikZ cache logic
  - [ ] Test search normalization

- [ ] **Integration Tests**
  - [ ] E2E flow: Create → Review → Publish
  - [ ] TikZ compile với nhiều templates
  - [ ] Import file thực tế

- [ ] **Deployment**
  - [ ] Dockerfile cho Go service
  - [ ] Dockerfile cho Python TikZ service
  - [ ] docker-compose với PostgreSQL
  - [ ] Environment configs (dev/staging/prod)

---

## 💻 Frontend

### Phase 1: Setup & Core Components (4-5 giờ)

- [ ] **Project Structure**
  - [ ] Tạo folders: `src/app/blog/`, `src/app/theory/`, `src/app/admin/blog/`
  - [ ] Types: `src/types/blog.ts`, `src/types/tikz.ts`
  - [ ] Services: `src/services/blog.service.ts`, `src/services/tikz.service.ts`
  - [ ] Hooks: `src/hooks/useBlog.ts`, `src/hooks/useKatex.ts`

- [ ] **gRPC-Web Client Setup**
  - [ ] Generate TypeScript từ proto files
  - [ ] Setup grpc-web client với interceptors
  - [ ] Auth interceptor thêm token
  - [ ] Error handling wrapper

- [ ] **KaTeX Configuration**
  - [ ] Install katex, @types/katex
  - [ ] Config auto-render với delimiters: $, $$, \\(, \\), \\[, \\]
  - [ ] Set output: 'htmlAndMathml' cho SEO/accessibility
  - [ ] Create `ClientMathRenderer` component

### Phase 2: Public Blog Interface (6-8 giờ)

- [ ] **Blog Homepage** (`/blog`)
  - [ ] List posts với pagination
  - [ ] Filter theo category/tags
  - [ ] Search box (gọi SearchService)
  - [ ] Card components cho post preview
  - [ ] Mobile-first responsive design

- [ ] **Post Detail Page** (`/blog/[slug]`)
  - [ ] Fetch markdown qua BlogService.GetPost
  - [ ] Parse Markdown client-side
  - [ ] Sanitize với DOMPurify
  - [ ] Render KaTeX với auto-render
  - [ ] Display TikZ images từ Cloudinary URLs
  - [ ] TOC (Table of Contents) generation
  - [ ] Share buttons
  - [ ] Related posts

- [ ] **Theory Section** (`/theory`)
  - [ ] Navigation theo môn học/lớp
  - [ ] Breadcrumb navigation
  - [ ] Mobile swipe navigation
  - [ ] Progress tracking

- [ ] **Search Interface**
  - [ ] Real-time search với debounce
  - [ ] Display streaming results
  - [ ] Highlight matched terms
  - [ ] Filter sidebar

### Phase 3: Admin Interface (8-10 giờ)

- [ ] **Admin Dashboard** (`/admin/blog`)
  - [ ] Statistics cards (total posts, pending review, etc.)
  - [ ] Recent activity
  - [ ] Quick actions

- [ ] **Post Management** (`/admin/blog/posts`)
  - [ ] DataTable với posts list
  - [ ] Status badges
  - [ ] Bulk actions
  - [ ] Quick edit/delete

- [ ] **Post Editor** (`/admin/blog/editor`)
  - [ ] Monaco Editor cho Markdown
  - [ ] Split view: Editor | Preview
  - [ ] Live KaTeX preview
  - [ ] Metadata form (title, slug, category, tags)
  - [ ] Save draft auto-save
  - [ ] Submit for review button

- [ ] **TikZ Compiler UI** (`/admin/blog/tikz`)
  - [ ] Template selector (fetch từ ListTemplates)
  - [ ] Code editor cho TikZ
  - [ ] Compile button → gọi CompileTikz
  - [ ] Preview compiled image
  - [ ] Copy URL button
  - [ ] History của compiled images

- [ ] **Import Tool** (`/admin/blog/import`)
  - [ ] File uploader (drag & drop)
  - [ ] Source type selector (DOCX/PDF/Google Docs)
  - [ ] Options config (split by heading, etc.)
  - [ ] Progress bar cho upload
  - [ ] Job status monitoring
  - [ ] Results table với links

- [ ] **Review Queue** (`/admin/blog/review`)
  - [ ] List pending posts
  - [ ] Preview với diff highlighting
  - [ ] Approve/Reject với comment
  - [ ] Batch review

### Phase 4: Performance & UX (4-5 giờ)

- [ ] **Optimization**
  - [ ] Lazy loading cho posts list
  - [ ] Virtual scroll cho long content
  - [ ] Image lazy loading với blur placeholder
  - [ ] Code splitting per route
  - [ ] Preload critical fonts (KaTeX)

- [ ] **KaTeX Performance**
  - [ ] Chunk rendering cho nhiều công thức
  - [ ] IntersectionObserver cho viewport rendering
  - [ ] Web Worker cho heavy processing (optional)
  - [ ] Cache rendered formulas

- [ ] **Mobile Experience**
  - [ ] Touch gestures cho navigation
  - [ ] Responsive KaTeX scaling
  - [ ] Bottom sheet cho filters
  - [ ] PWA configuration
  - [ ] Offline reading với cache

- [ ] **Accessibility**
  - [ ] ARIA labels cho navigation
  - [ ] Keyboard shortcuts
  - [ ] Focus management
  - [ ] Screen reader support cho math (MathML)
  - [ ] High contrast mode

### Phase 5: Testing & QA (3-4 giờ)

- [ ] **Component Tests**
  - [ ] Test ClientMathRenderer
  - [ ] Test sanitization
  - [ ] Test search debounce
  - [ ] Test form validation

- [ ] **E2E Tests (Playwright/Cypress)**
  - [ ] User flow: Browse → Read → Search
  - [ ] Admin flow: Create → Edit → Publish
  - [ ] TikZ compile flow
  - [ ] Import flow

- [ ] **Performance Tests**
  - [ ] Lighthouse score > 90
  - [ ] Time to first math < 500ms
  - [ ] Search response < 200ms
  - [ ] Bundle size analysis

---

## 🔧 DevOps & Deployment

### Infrastructure (4-5 giờ)
- [ ] **Docker Setup**
  - [ ] docker-compose.yml với services:
    - [ ] PostgreSQL
    - [ ] Go gRPC server
    - [ ] Python TikZ compiler
    - [ ] Redis (for search index)
  - [ ] Volume mounts
  - [ ] Network configuration

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions/GitLab CI
  - [ ] Proto compilation check
  - [ ] Run tests
  - [ ] Build Docker images
  - [ ] Push to registry

- [ ] **Monitoring**
  - [ ] Health check endpoints
  - [ ] Prometheus metrics
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring

---

## 📊 Ước tính thời gian

### Backend Team
- Database & Migration: 4-6 giờ
- gRPC Services: 8-10 giờ  
- Auth & Security: 3-4 giờ
- Testing: 4-5 giờ
- **Tổng Backend: 19-25 giờ**

### Frontend Team
- Setup & Core: 4-5 giờ
- Public Interface: 6-8 giờ
- Admin Interface: 8-10 giờ
- Performance & UX: 4-5 giờ
- Testing: 3-4 giờ
- **Tổng Frontend: 25-32 giờ**

### DevOps
- Infrastructure: 4-5 giờ
- **Tổng DevOps: 4-5 giờ**

**TỔNG CỘNG: 48-62 giờ**

---

## 🚀 Milestones

### Milestone 1: Core Backend (Week 1)
- Database schema complete
- Basic CRUD APIs working
- TikZ compiler prototype

### Milestone 2: Frontend Foundation (Week 2)  
- Public blog interface
- KaTeX rendering working
- Basic admin CRUD

### Milestone 3: Advanced Features (Week 3)
- Full moderation flow
- Import functionality
- Search implementation

### Milestone 4: Polish & Deploy (Week 4)
- Performance optimization
- Testing complete
- Production deployment

---

## 📝 Notes

- **Ưu tiên**: Phase 1-2 của cả Backend và Frontend có thể làm song song
- **Dependency**: Frontend cần Backend APIs để test integration
- **Risk**: TikZ compiler service có thể phức tạp, cần prototype sớm
- **Quality**: Đảm bảo pnpm type-check và pnpm lint pass trước khi merge