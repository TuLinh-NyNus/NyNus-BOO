# 📚 Kế hoạch Triển khai Hệ thống Blog/Lý thuyết - 100% Completion

**Mục tiêu**: Đạt 100% mục tiêu đề ra trong `IMPLEMENT_LYTHUYET.md` (REVISION 2025-09-18)  
**Chiến lược**: gRPC + Client-side KaTeX + TikZ Cloud Images  
**Timeline**: 45-60 giờ (3-4 tuần)  
**Last Updated**: 2025-10-26

---

## 📊 Tình trạng hiện tại

### ✅ Đã hoàn thành (60%)
- ✅ Proto definitions (blog, tikz, search, import) - 100%
- ✅ Frontend components (theory viewer, editor, navigation) - 80%
- ✅ Build system infrastructure (build-system.ts, mobile-optimizer.ts) - 75%
- ✅ Dependencies (katex, gray-matter, fuse.js, monaco, grpc-web) - 100%
- ✅ Frontend search system - 100%
- ✅ Admin UI components - 80%

### ❌ Chưa hoàn thành (40%)
- ❌ Backend gRPC Services (BlogService, TikzCompilerService, SearchService, ImportService) - 0%
- ❌ Database schema và migrations - 0%
- ❌ TikZ Python microservice - 0%
- ❌ Frontend-Backend integration - 20%
- ❌ Testing & E2E flows - 10%
- ❌ Production deployment setup - 0%

---

## 🎯 PHASE 1: Database & Backend Foundation (12-15 giờ)

### 1.1 Database Schema Design (3-4 giờ)

**File**: `apps/backend/internal/database/migrations/XXX_create_blog_system.sql`

#### Tables to create:
```sql
-- Core blog tables
- [ ] posts (id, slug, type, status, author_id, title, category_id, hero_asset_id, math_enabled, published_at, created_at, updated_at)
- [ ] post_versions (id, post_id, version, markdown, macros_json, word_count, created_by, created_at, change_note)
- [ ] post_reviews (id, post_id, reviewer_id, status, comment, decided_at)
- [ ] categories (id, slug, name, parent_id, description, display_order)
- [ ] tags (id, slug, name, usage_count)
- [ ] post_tags (post_id, tag_id)

-- Asset management
- [ ] assets (id, kind, provider, public_id, url, format, hash, width, height, file_size, metadata_json, created_at)
- [ ] post_assets (post_id, asset_id, usage, display_order)

-- TikZ compilation
- [ ] tikz_templates (id, name, engine, output_format, preamble, timeout_seconds, is_active, created_at, updated_at)
- [ ] tikz_sources (id, template_id, code, code_hash, compiled_asset_id, compile_status, error_log, compiled_at)

-- Import system
- [ ] import_jobs (id, source_type, source_url, upload_asset_id, status, options_json, error_log, created_at, updated_at)
- [ ] import_results (id, import_job_id, post_id, section, status, note)
```

#### Indexes & Constraints:
```sql
- [ ] CREATE UNIQUE INDEX idx_posts_slug ON posts(slug)
- [ ] CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC)
- [ ] CREATE INDEX idx_posts_type_published ON posts(type, published_at DESC)
- [ ] CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC)
- [ ] CREATE UNIQUE INDEX idx_assets_hash ON assets(hash)
- [ ] CREATE UNIQUE INDEX idx_tikz_code_hash ON tikz_sources(code_hash)
- [ ] CREATE INDEX idx_post_versions_post ON post_versions(post_id, version DESC)
```

**Validation**:
```bash
- [ ] Run migration: psql -f migrations/XXX_create_blog_system.sql
- [ ] Verify tables created: \dt in psql
- [ ] Check constraints: \d posts, \d assets, etc.
```

### 1.2 Entity Models (Go) (2-3 giờ)

**Location**: `apps/backend/internal/entity/`

```go
- [ ] blog.go - Post, PostVersion, PostReview structs
- [ ] category.go - Category struct with tree methods
- [ ] tag.go - Tag struct
- [ ] asset.go - Asset struct with cloud provider enum
- [ ] tikz.go - TikzTemplate, TikzSource structs
- [ ] import.go - ImportJob, ImportResult structs
```

**Key features**:
- [ ] Validation tags (validate:"required,min=3,max=100")
- [ ] JSON tags for API responses
- [ ] Helper methods (IsPublished(), CanEdit(), etc.)
- [ ] Enum types (PostType, PostStatus, AssetKind, etc.)

### 1.3 Repository Layer (4-5 giờ)

**Location**: `apps/backend/internal/repository/`

#### PostRepository
```go
- [ ] Create(ctx, post) error
- [ ] Update(ctx, post) error
- [ ] GetByID(ctx, id) (*entity.Post, error)
- [ ] GetBySlug(ctx, slug) (*entity.Post, error)
- [ ] List(ctx, filters, pagination) ([]*entity.Post, int, error)
- [ ] Delete(ctx, id) error
- [ ] UpdateStatus(ctx, id, status) error
```

#### PostVersionRepository
```go
- [ ] CreateVersion(ctx, version) error
- [ ] GetVersion(ctx, postID, versionNum) (*entity.PostVersion, error)
- [ ] ListVersions(ctx, postID) ([]*entity.PostVersion, error)
- [ ] GetCurrentVersion(ctx, postID) (*entity.PostVersion, error)
```

#### AssetRepository
```go
- [ ] Create(ctx, asset) error
- [ ] GetByID(ctx, id) (*entity.Asset, error)
- [ ] GetByHash(ctx, hash) (*entity.Asset, error)
- [ ] LinkToPost(ctx, postID, assetID, usage) error
```

#### TikzRepository
```go
- [ ] GetTemplate(ctx, id) (*entity.TikzTemplate, error)
- [ ] ListTemplates(ctx) ([]*entity.TikzTemplate, error)
- [ ] CreateSource(ctx, source) error
- [ ] GetSourceByHash(ctx, hash) (*entity.TikzSource, error)
- [ ] UpdateCompileStatus(ctx, id, status, assetID, errorLog) error
```

**Testing**:
```bash
- [ ] Unit tests for each repository
- [ ] Test với mock DB connection
- [ ] Test error cases (not found, duplicate, etc.)
```

### 1.4 Service Layer (3-4 giờ)

**Location**: `apps/backend/internal/service/blog/`

#### BlogService
```go
- [ ] CreatePost(ctx, input) (*entity.Post, error)
- [ ] UpdatePost(ctx, id, input) (*entity.Post, error)
- [ ] GetPost(ctx, id) (*entity.Post, *entity.PostVersion, error)
- [ ] ListPosts(ctx, filters, pagination) ([]*entity.Post, int, error)
- [ ] SubmitForReview(ctx, postID, userID) error
- [ ] ApprovePost(ctx, postID, reviewerID, comment) error
- [ ] PublishPost(ctx, postID, scheduleAt) error
- [ ] UnpublishPost(ctx, postID) error
- [ ] DeletePost(ctx, postID) error
```

**Business logic**:
- [ ] Slug validation (ASCII only, no special chars)
- [ ] Status transition validation (DRAFT → PENDING → APPROVED → PUBLISHED)
- [ ] Permission checks (author can edit own posts, admin can edit all)
- [ ] Version creation on update
- [ ] Asset validation before publish

---

## 🎯 PHASE 2: gRPC Services Implementation (15-18 giờ)

### 2.1 BlogService gRPC (5-6 giờ)

**File**: `apps/backend/internal/grpc/blog_service.go`

```go
type BlogServiceServer struct {
    v1.UnimplementedBlogServiceServer
    blogService *blog.BlogService
    authService auth.IAuthService
    logger      *logrus.Entry
}

// CRUD Operations
- [ ] CreatePost(ctx, req) (*v1.CreatePostResponse, error)
- [ ] UpdatePost(ctx, req) (*v1.UpdatePostResponse, error)
- [ ] GetPost(ctx, req) (*v1.GetPostResponse, error)
- [ ] ListPosts(ctx, req) (*v1.ListPostsResponse, error)
- [ ] DeletePost(ctx, req) (*v1.DeletePostResponse, error)

// Moderation Flow
- [ ] SubmitForReview(ctx, req) (*v1.SubmitForReviewResponse, error)
- [ ] ApprovePost(ctx, req) (*v1.ApprovePostResponse, error)
- [ ] PublishPost(ctx, req) (*v1.PublishPostResponse, error)
- [ ] UnpublishPost(ctx, req) (*v1.UnpublishPostResponse, error)
```

**Converters** (`apps/backend/internal/grpc/blog_converters.go`):
```go
- [ ] entityToProtoPost(entity.Post) *v1.PostMetadata
- [ ] entityToProtoContent(entity.Post, entity.PostVersion) *v1.PostContent
- [ ] protoToEntityPost(*v1.PostContent) (*entity.Post, *entity.PostVersion)
```

**Interceptors**:
```go
- [ ] AdminOnlyInterceptor - check role=ADMIN for moderation RPCs
- [ ] OwnerOrAdminInterceptor - author can edit own posts
- [ ] RateLimitInterceptor - prevent spam
```

**Testing**:
```bash
- [ ] grpcurl test từ command line
- [ ] Integration tests với mock DB
- [ ] E2E flow: Create → Review → Approve → Publish
```

### 2.2 SearchService gRPC (3-4 giờ)

**File**: `apps/backend/internal/grpc/blog_search_service.go`

```go
type SearchServiceServer struct {
    v1.UnimplementedSearchServiceServer
    searchIndex *search.Index
    logger      *logrus.Entry
}

- [ ] Search(req, stream) error // Server streaming
```

**Search Index** (`apps/backend/internal/service/blog/search/`):
```go
- [ ] BuildIndex(posts) error
- [ ] Search(query, filters) ([]*SearchHit, error)
- [ ] AddPost(post) error
- [ ] UpdatePost(post) error
- [ ] RemovePost(id) error
```

**Features**:
- [ ] Vietnamese text normalization (remove accents option)
- [ ] Full-text search trong markdown
- [ ] Filter by category, type, tags
- [ ] Score và rank results
- [ ] Generate snippet với highlight
- [ ] Streaming results (chunk 10-20 results)

### 2.3 ImportService gRPC (4-5 giờ)

**File**: `apps/backend/internal/grpc/import_service.go`

```go
- [ ] UploadImportFile(stream) (*v1.UploadImportFileResponse, error) // Client streaming
- [ ] CreateImportJob(ctx, req) (*v1.CreateImportJobResponse, error)
- [ ] GetImportStatus(ctx, req) (*v1.GetImportStatusResponse, error)
- [ ] ListImportResults(ctx, req) (*v1.ListImportResultsResponse, error)
```

**Background Worker** (`apps/backend/internal/service/blog/import/`):
```go
- [ ] ProcessImportJob(jobID) error
- [ ] ProcessDOCX(file, options) ([]*entity.Post, error) // Use pandoc/mammoth
- [ ] ProcessPDF(file, options) ([]*entity.Post, error) // Use pdfplumber
- [ ] ProcessGoogleDocs(url, options) ([]*entity.Post, error)
- [ ] SplitByHeadings(markdown, level) []string
```

**Job Queue**:
- [ ] Use Go channels hoặc Redis queue
- [ ] Concurrent processing (max 5 jobs)
- [ ] Progress tracking
- [ ] Error handling và retry

### 2.4 TikZ Compiler Python Microservice (3-4 giờ)

**Setup**: New Python service

**Structure**:
```
apps/tikz-compiler/
├── Dockerfile
├── requirements.txt
├── server.py (gRPC server)
├── compiler.py (core logic)
├── cloudinary_uploader.py
└── settings.py
```

**requirements.txt**:
```txt
grpcio
grpcio-tools
cloudinary
Pillow
```

**Dockerfile**:
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y \
    texlive-full \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
WORKDIR /app
CMD ["python", "server.py"]
```

**server.py** (gRPC server):
```python
- [ ] Implement TikzCompilerServiceServicer
- [ ] CompileTikz(request, context)
- [ ] ListTemplates(request, context)
- [ ] Start gRPC server on port 50052
```

**compiler.py**:
```python
- [ ] compile_tikz(template_id, code) -> (image_bytes, format, width, height)
- [ ] check_cache(code_hash) -> asset_ref or None
- [ ] save_cache(code_hash, asset_ref)
- [ ] run_pdflatex(tex_file) -> pdf_file
- [ ] convert_pdf_to_image(pdf_file, format) -> image_file
- [ ] crop_whitespace(image_file)
```

**cloudinary_uploader.py**:
```python
- [ ] upload_image(image_bytes, folder, public_id) -> (url, public_id)
- [ ] Config từ environment (CLOUDINARY_URL)
```

**Integration với Go backend**:
```go
// apps/backend/internal/grpc/tikz_service.go
- [ ] TikzCompilerServiceServer wrapper
- [ ] Call Python service qua gRPC
- [ ] Save asset to DB sau khi compile
- [ ] Return AssetRef to client
```

---

## 🎯 PHASE 3: Frontend Integration (10-12 giờ)

### 3.1 gRPC-Web Client Setup (2 giờ)

**Generate proto code**:
```bash
- [ ] cd packages/proto
- [ ] buf generate --template buf.gen.frontend.yaml
- [ ] Verify generated files: apps/frontend/src/generated/v1/blog_pb.ts
```

**Client wrapper** (`apps/frontend/src/services/blog.service.ts`):
```typescript
- [ ] BlogServiceClient class
- [ ] createPost(content: PostContent) Promise<CreatePostResponse>
- [ ] updatePost(content: PostContent) Promise<UpdatePostResponse>
- [ ] getPost(idOrSlug: string) Promise<GetPostResponse>
- [ ] listPosts(filters, pagination) Promise<ListPostsResponse>
- [ ] submitForReview(postId: string) Promise<void>
- [ ] publishPost(postId: string, scheduleAt?) Promise<void>
```

**Auth interceptor**:
```typescript
- [ ] Add JWT token to metadata
- [ ] Handle 401 và redirect to login
- [ ] Refresh token logic
```

### 3.2 Blog Public Pages (4-5 giờ)

#### Blog Homepage (`apps/frontend/src/app/blog/page.tsx`)
```tsx
- [ ] Server component fetch initial posts
- [ ] PostsGrid component với pagination
- [ ] CategoryFilter sidebar
- [ ] SearchBox (debounced, call SearchService)
- [ ] Mobile-responsive layout
```

#### Post Detail (`apps/frontend/src/app/blog/[slug]/page.tsx`)
```tsx
- [ ] generateStaticParams cho popular posts
- [ ] generateMetadata cho SEO
- [ ] Fetch post qua BlogService.GetPost
- [ ] MarkdownRenderer component:
    - [ ] Parse markdown client-side
    - [ ] Sanitize với DOMPurify
    - [ ] Auto-render KaTeX
    - [ ] Display TikZ images từ URLs
- [ ] TOC (Table of Contents) generation
- [ ] Share buttons, Related posts
```

**MarkdownRenderer** (`apps/frontend/src/components/blog/markdown-renderer.tsx`):
```typescript
- [ ] Parse markdown (marked hoặc remark)
- [ ] Sanitize HTML (isomorphic-dompurify)
- [ ] Render KaTeX: katex/contrib/auto-render
- [ ] Handle code blocks (syntax highlighting)
- [ ] Lazy load images
- [ ] Mobile-optimized layout
```

### 3.3 Admin Blog Interface (4-5 giờ)

#### Post Editor (`apps/frontend/src/app/3141592654/admin/blog/editor/[id]/page.tsx`)
```tsx
- [ ] Monaco Editor cho Markdown
- [ ] Split layout: Editor | Preview
- [ ] Live KaTeX preview
- [ ] Metadata form (title, slug, category, tags)
- [ ] Auto-save draft (debounce 5s)
- [ ] Submit/Publish buttons
- [ ] Version history dropdown
```

**Use existing components**:
- ✅ `components/admin/theory/theory-editor.tsx` - reuse Monaco setup
- ✅ `components/common/latex/latex-content.tsx` - reuse LaTeX preview

#### TikZ Compiler UI (`apps/frontend/src/app/3141592654/admin/blog/tikz/page.tsx`)
```tsx
- [ ] Template selector (fetch từ TikzCompilerService.ListTemplates)
- [ ] Code editor (Monaco với LaTeX syntax)
- [ ] Compile button → call CompileTikz
- [ ] Preview compiled image
- [ ] Copy markdown snippet button
- [ ] Compilation history table
```

#### Import Tool (`apps/frontend/src/app/3141592654/admin/blog/import/page.tsx`)
```tsx
- [ ] File uploader (drag & drop)
- [ ] Source type selector (DOCX/PDF/Google Docs URL)
- [ ] Options config (split by heading, category mapping)
- [ ] Upload progress bar (client streaming)
- [ ] Job status polling
- [ ] Results table với links to created posts
```

---

## 🎯 PHASE 4: Testing & Quality Assurance (6-8 giờ)

### 4.1 Backend Tests (3-4 giờ)

#### Unit Tests
```go
// apps/backend/internal/service/blog/blog_service_test.go
- [ ] TestCreatePost
- [ ] TestUpdatePost_CreatesNewVersion
- [ ] TestSubmitForReview_ValidatesStatus
- [ ] TestPublishPost_RequiresApproval
- [ ] TestSlugValidation
```

#### Integration Tests
```go
// apps/backend/internal/grpc/blog_service_test.go
- [ ] TestCreatePost_E2E
- [ ] TestModerationFlow_E2E
- [ ] TestSearchPosts_StreamingResults
- [ ] TestImportDOCX_E2E
```

**Run tests**:
```bash
cd apps/backend
go test ./internal/service/blog/... -v
go test ./internal/grpc/... -v
```

### 4.2 Frontend Tests (2-3 giờ)

#### Component Tests
```typescript
// __tests__/components/blog/markdown-renderer.test.tsx
- [ ] Test KaTeX rendering
- [ ] Test sanitization
- [ ] Test TikZ image display
- [ ] Test code highlighting
```

#### E2E Tests (Playwright)
```typescript
// playwright/e2e/blog.spec.ts
- [ ] test('Browse blog posts', async ({ page }) => {})
- [ ] test('Read post với LaTeX', async ({ page }) => {})
- [ ] test('Search posts', async ({ page }) => {})
- [ ] test('Admin create post', async ({ page }) => {})
- [ ] test('TikZ compile flow', async ({ page }) => {})
```

**Run tests**:
```bash
cd apps/frontend
pnpm test:e2e
pnpm test:coverage
```

### 4.3 Performance Testing (1-2 giờ)

```bash
- [ ] Lighthouse audit (target: score > 90)
- [ ] Time to first math < 500ms
- [ ] Search response < 200ms
- [ ] Bundle size analysis (target: < 500KB main bundle)
- [ ] Load test với k6 (1000 concurrent users)
```

---

## 🎯 PHASE 5: Deployment & Production (6-8 giờ)

### 5.1 Docker Setup (3-4 giờ)

**docker-compose.yml** (update existing):
```yaml
services:
  postgres: # existing
  
  backend: # existing, add blog routes
  
  tikz-compiler:
    build: ./apps/tikz-compiler
    ports:
      - "50052:50052"
    environment:
      - CLOUDINARY_URL=${CLOUDINARY_URL}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
  
  redis: # for search index
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**Environment variables**:
```bash
- [ ] CLOUDINARY_URL
- [ ] TIKZ_COMPILER_URL=tikz-compiler:50052
- [ ] REDIS_URL=redis:6379
```

### 5.2 CI/CD Pipeline (2-3 giờ)

**GitHub Actions** (`.github/workflows/blog-ci.yml`):
```yaml
- [ ] Proto compilation check
- [ ] Backend tests
- [ ] Frontend tests
- [ ] Build Docker images
- [ ] Push to registry
- [ ] Deploy to staging
```

### 5.3 Monitoring (1-2 giờ)

```bash
- [ ] Health check endpoints (/health, /ready)
- [ ] Prometheus metrics (request count, latency, errors)
- [ ] Grafana dashboards
- [ ] Error tracking (Sentry integration)
- [ ] Performance monitoring (New Relic/DataDog)
```

---

## 📊 Timeline & Dependencies

### Week 1: Backend Foundation
- **Days 1-2**: Database schema, entities, repositories (12-15 giờ)
- **Days 3-5**: gRPC services (BlogService, SearchService) (8-10 giờ)
- **Deliverable**: Working CRUD APIs, can create/read posts

### Week 2: Advanced Backend + Python Service
- **Days 1-2**: ImportService + background worker (4-5 giờ)
- **Days 3-4**: TikZ Python microservice (3-4 giờ)
- **Day 5**: Integration và testing (3 giờ)
- **Deliverable**: Full backend với TikZ compilation working

### Week 3: Frontend Integration
- **Days 1-2**: gRPC client setup, blog public pages (6-7 giờ)
- **Days 3-5**: Admin interface (editor, TikZ UI, import tool) (8-10 giờ)
- **Deliverable**: Full frontend-backend integration

### Week 4: Testing & Deployment
- **Days 1-2**: Testing (unit, integration, E2E) (6-8 giờ)
- **Days 3-4**: Performance optimization (2-3 giờ)
- **Day 5**: Production deployment (3-4 giờ)
- **Deliverable**: Production-ready system

---

## ✅ Success Criteria (100% Completion)

### Backend (40%)
- [ ] ✅ All database tables created với proper indexes
- [ ] ✅ All repositories implemented với tests
- [ ] ✅ BlogService hoàn chỉnh với moderation flow
- [ ] ✅ SearchService với Vietnamese support
- [ ] ✅ ImportService với DOCX/PDF/Google Docs
- [ ] ✅ TikZ Python service với Cloudinary upload
- [ ] ✅ All gRPC services có interceptors (auth, rate limit)
- [ ] ✅ Unit test coverage > 80%

### Frontend (30%)
- [ ] ✅ Blog public pages (homepage, post detail)
- [ ] ✅ Client-side KaTeX rendering working
- [ ] ✅ Search interface với streaming results
- [ ] ✅ Admin post editor với live preview
- [ ] ✅ TikZ compiler UI functional
- [ ] ✅ Import tool working end-to-end
- [ ] ✅ Mobile-responsive design
- [ ] ✅ E2E tests passing

### Performance (15%)
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ Time to first math < 500ms
- [ ] ✅ Search response < 200ms
- [ ] ✅ Can handle 1000+ concurrent users
- [ ] ✅ Bundle size < 500KB

### DevOps (15%)
- [ ] ✅ Docker compose setup working
- [ ] ✅ CI/CD pipeline functional
- [ ] ✅ Monitoring và alerts configured
- [ ] ✅ Production deployment successful
- [ ] ✅ Backup và disaster recovery plan

---

## 🚨 Risks & Mitigation

### High Priority Risks
1. **TikZ compilation timeout**
   - Mitigation: Set reasonable timeout (30s), queue system, retry logic
   
2. **Cloudinary quota limits**
   - Mitigation: Cache compiled images, cleanup old images, upgrade plan
   
3. **Search performance với large dataset**
   - Mitigation: Use Redis, pagination, index optimization
   
4. **gRPC-Web browser compatibility**
   - Mitigation: Use grpc-web library (proven), fallback to REST if needed

### Medium Priority Risks
1. **Import quality từ DOCX/PDF**
   - Mitigation: Manual review step, validation, improve parsers iteratively
   
2. **KaTeX rendering edge cases**
   - Mitigation: Comprehensive test suite, fallback to plain text

---

## 📝 Notes

### Development Best Practices
- [ ] Luôn chạy `pnpm lint` và `pnpm type-check` trước commit
- [ ] Write tests cùng lúc với code (TDD approach)
- [ ] Code review bởi ít nhất 1 người
- [ ] Update documentation khi thêm features
- [ ] Use conventional commits (feat:, fix:, docs:, etc.)

### Communication
- [ ] Daily standups (15 phút)
- [ ] Weekly demos cho stakeholders
- [ ] Slack channel #blog-system cho realtime discussion
- [ ] Document decisions trong ADR (Architecture Decision Records)

---

## 🎯 Next Steps

### Immediate Actions (Tuần 1)
1. [ ] Review và approve kế hoạch này
2. [ ] Setup project boards (Jira/Linear/GitHub Projects)
3. [ ] Assign tasks to team members
4. [ ] Create database migration file
5. [ ] Setup TikZ Python microservice skeleton

### Team Assignments (đề xuất)
- **Backend Team (2 người)**: Database, repositories, gRPC services
- **Python Team (1 người)**: TikZ compiler microservice
- **Frontend Team (2 người)**: Blog pages, admin interface, integration
- **DevOps Team (1 người)**: Docker, CI/CD, monitoring

---

**Kế hoạch được tạo**: 2025-10-26  
**Ước tính hoàn thành**: 4 tuần (45-60 giờ)  
**Status**: 📋 Ready for execution  
**Target**: 🎯 100% Completion

