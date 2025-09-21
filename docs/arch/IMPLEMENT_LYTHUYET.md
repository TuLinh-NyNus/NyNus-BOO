# 📚 Hệ thống Lý thuyết - Kế hoạch triển khai
**Phương pháp RIPER-5 cho hệ thống Lý thuyết dựa trên LaTeX**

## 📋 Tổng quan dự án
- Dự án: Tích hợp hệ thống Lý thuyết NyNus
- Kiến trúc: Quản lý nội dung LaTeX dựa trên tệp
- Công nghệ: Next.js 15 + React 19 + TypeScript + KaTeX
- Lưu trữ: Tệp Markdown chứa nội dung LaTeX
- Đối tượng: Khối lớp 3–12, 8 môn học, truy cập công khai
- Thời gian ước tính: 15–20 giờ

---

## 🔁 REVISION 2025-09-18 — Blog + Client-side KaTeX + gRPC-only + TikZ ảnh (cloud)

Dựa trên yêu cầu cập nhật của bạn, thiết kế được điều chỉnh như sau (thay thế chiến lược build-time pre-render cũ):

- Phạm vi: Không chỉ "Lý thuyết" mà còn hỗ trợ "Blog/Article/Math Notes". Nội dung viết bằng Markdown (kèm LaTeX). 
- Render toán: Render KaTeX phía client (không prerender HTML từ server/build). 
- TikZ: Biên dịch trước thành ảnh (SVG/PNG) bằng dịch vụ riêng, lưu trên cloud/CDN; nội dung chỉ nhúng URL ảnh. 
- Giao tiếp: 100% gRPC/gRPC-Web cho các API business; phân phối ảnh qua CDN (file tĩnh, không phải API business). 
- Cross-platform: Loại bỏ ví dụ shell bash đặc thù, dùng Node script/PowerShell hoặc thư viện cross-platform. 

Kiến trúc gRPC đề xuất
- BlogService: CRUD và truy xuất bài viết (Markdown + metadata). Client nhận Markdown thô, parse + sanitize + render KaTeX ở client. 
- TikzCompilerService: Nhận mã TikZ + template_id, biên dịch bằng Tectonic/TeXLive trong container → SVG/PNG, upload cloud, trả về AssetRef (url, hash). Có BatchCompile và cache theo hash. 
- SearchService: Nhận truy vấn và trả về kết quả qua gRPC (có thể server-stream). Backend duy trì chỉ mục.
- ImportService: Nhập liệu DOCX/Google Docs/PDF (upload client-stream hoặc URL), tạo job xử lý, theo dõi trạng thái & kết quả.
- gRPC-Web: Backend Go bọc grpc.Server bằng grpcweb.WrapServer; Frontend dùng grpc-web client (@improbable-eng/grpc-web hoặc grpc-web).

Luồng render phía client (blog & lý thuyết)
1) Client gọi BlogService.GetPost(slug|id) → nhận PostContent { metadata, markdown }. 
2) Parse Markdown ở client → sanitize (isomorphic-dompurify) → auto-render KaTeX (katex/contrib/auto-render). 
3) Ảnh TikZ là URL tới CDN đã compile sẵn (không render TikZ ở client). 
4) Tối ưu: lazy-load nội dung dài, render theo chunk/viewport, debounce auto-render, ưu tiên inline math trước block math. 

Cấu hình KaTeX & MathML phía client
- Dùng KaTeX auto-render với delimiters: $, $$, \\( \\), \\[ \\]
- Cấu hình output: 'htmlAndMathml' để tối ưu accessibility/SEO
- Thứ tự xử lý: parse Markdown → sanitize (DOMPurify) → auto-render KaTeX
- Tối ưu: chia nhỏ nội dung dài (chunking), lazy render theo viewport, ưu tiên inline math để giảm jank

Pipeline TikZ & cache
- Input: TikzSource { template_id, code }. 
- Compile: Tectonic/TeXLive + dvisvgm/pdf2svg trong container runner (CI hoặc backend job). 
- Output: AssetRef { asset_id, url, hash, width, height, format }. Lưu cloud (S3/CDN), set cache-control immutable. 
- Admin UI: gọi CompileTikz → nhận url → chèn vào bài. Nếu lỗi, trả thông tin log, cho phép fallback asset thủ công.

Cấu hình template TikZ & định dạng ảnh
- Định dạng ảnh linh hoạt (WEBP/PNG/JPG/SVG) nhưng do template quyết định (output_format cố định theo template)
- Không truyền options định dạng từ client; template chứa engine, preamble, output_format
- API không đặt giới hạn độ dài input hay timeout; nếu cần sẽ kiểm soát ở tầng triển khai/service
- Cloudinary: upload server-side, trả về url/public_id; cache theo hash(template_id + code + phiên bản template)

Tham chiếu proto chính thức
- packages/proto/v1/tikz.proto — TikzCompilerService (CompileTikz, ListTemplates)
- packages/proto/v1/blog.proto — BlogService (CRUD, duyệt, publish)
- packages/proto/v1/search.proto — SearchService (Search streaming)
- packages/proto/v1/import.proto — ImportService (UploadImportFile streaming, CreateImportJob)

Kế hoạch triển khai (rút gọn)
- Phase 1: Proto & backend
  - Tạo packages/proto/v1/blog.proto, tikz.proto, search.proto theo skeleton bên dưới; sinh code go + ts. 
  - Implement service skeleton (Go gRPC), bật grpc-web. 
- Phase 2: Frontend reader (client KaTeX)
  - Component parse Markdown + sanitize + KaTeX auto-render; mobile-first viewer; navigation. 
  - gRPC client (grpc-web) để gọi BlogService/SearchService. 
- Phase 3: Admin UI
  - Editor (Monaco) + preview client KaTeX; TikZ compile UI (gRPC TikzCompilerService). 
- Phase 4: Search (gRPC)
  - SearchService với chỉ mục phía server; client hiển thị realtime via server-stream/unary.

Testing cập nhật
- KaTeX client correctness, time-to-first-math; virtualization của nội dung dài; 
- gRPC-Web e2e (Create/Get/Update/List), Search streaming; 
- TikZ asset validity (kích thước, caching, CORS, integrity).

Thông số kỹ thuật cập nhật (điểm nhấn)
- Proto: packages/proto/v1/blog.proto, tikz.proto, search.proto. 
- Frontend: apps/frontend/src/components/blog/*, theory/* (viewer, nav, search). 
- Ảnh TikZ: lưu cloud. Dev local có thể dùng public/assets/tikz/ chỉ để thử nghiệm (không sản xuất). 
- Vẫn dùng pnpm/pnpx; đảm bảo pnpm type-check và pnpm lint trước khi merge/deploy.

Ví dụ proto (rút gọn)

```proto
syntax = "proto3";
package v1;
option go_package = "github.com/AnhPhan49/exam-bank-system/packages/proto/v1;v1";

enum PostType { POST_TYPE_UNSPECIFIED = 0; POST_TYPE_ARTICLE = 1; POST_TYPE_THEORY = 2; POST_TYPE_MATH_NOTE = 3; }
message PostMetadata { string id=1; string slug=2; string title=3; repeated string tags=4; string category=5; PostType type=6; string author_id=7; int64 created_at=8; int64 updated_at=9; string hero_image_url=10; bool math_enabled=11; }
message PostContent { PostMetadata meta=1; string markdown=2; }
message GetPostRequest { oneof key { string id=1; string slug=2; } }
message GetPostResponse { PostContent content=1; }
service BlogService { rpc GetPost(GetPostRequest) returns (GetPostResponse); }
```

```proto
syntax = "proto3";
package v1;
option go_package = "github.com/AnhPhan49/exam-bank-system/packages/proto/v1;v1";
message TikzSource { string template_id=1; string code=2; }
message AssetRef { string asset_id=1; string url=2; string hash=3; int32 width=4; int32 height=5; string format=6; }
message CompileTikzRequest { TikzSource source=1; }
message CompileTikzResponse { AssetRef asset=1; }
service TikzCompilerService { rpc CompileTikz(CompileTikzRequest) returns (CompileTikzResponse); }
```

```proto
syntax = "proto3";
package v1;
option go_package = "github.com/AnhPhan49/exam-bank-system/packages/proto/v1;v1";
message SearchRequest { string query=1; string category=2; repeated string tags=3; int32 limit=4; }
message SearchHit { string id=1; string slug=2; string title=3; string snippet=4; PostType type=5; float score=6; }
service SearchService { rpc Search(SearchRequest) returns (stream SearchHit); }
```

Ghi chú về sections cũ
- Các phần INNOVATE/PLAN/EXECUTE/TESTING/Technical Specifications/Next Steps… ở bên dưới được đánh dấu LEGACY và giữ lại làm tham chiếu. Vui lòng ưu tiên nội dung trong mục REVISION này khi triển khai.

---

## 🔍 NGHIÊN CỨU - Phân tích codebase & thách thức kỹ thuật

### Phân tích hệ thống hiện tại
```
exam-bank-system/
├── apps/frontend/                 # Next.js 15.4.5 + React 19
│   ├── src/app/                  # App Router structure
│   ├── src/components/           # Shadcn UI components
│   ├── src/styles/               # Tailwind + theme system
│   └── package.json              # KaTeX already installed
├── apps/backend/                 # Go gRPC (separate concern)
└── docs/                         # Documentation
```

**✅ Tài nguyên sẵn có:**
- KaTeX 0.16.22 (LaTeX math rendering)
- Tailwind CSS 4.1.11 (responsive design)
- Shadcn UI components (consistent design)
- Admin system pattern (`/3141592654/admin`)
- Theme system (light/dark modes)

**🚨 Thách thức kỹ thuật:**

### 1. Thách thức biên dịch LaTeX
```typescript
// Current: KaTeX (limited LaTeX subset)
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Challenge: Full LaTeX + TikZ support
// - KaTeX: Fast but limited (no TikZ, limited packages)
// - MathJax: Slower but more complete
// - Server-side compilation: Complex but most powerful
```

### 2. Thách thức hiển thị TikZ
**Phương án A: Dựng sẵn (pre-render)**
```bash
# Server-side compilation
pdflatex diagram.tex → PDF → pdf2svg → SVG
# Pros: Perfect rendering, fast loading
# Cons: Build complexity, responsive issues
```

**Phương án B: Thư viện JavaScript**
```typescript
// TikZJax or similar
import { TikZJax } from 'tikzjax';
// Pros: Dynamic rendering, responsive
// Cons: Limited TikZ features, performance
```

**Phương án C: Kết hợp**
```typescript
// Cache + on-demand rendering
const renderTikZ = async (code: string) => {
  const cached = await getCachedSVG(code);
  if (cached) return cached;
  return await renderAndCache(code);
};
```

### 3. Thách thức cấu trúc nội dung
```
content/theory/
├── TOÁN/
│   ├── LỚP-3/
│   │   ├── CHƯƠNG-1/
│   │   │   ├── bài-1-số-tự-nhiên.md
│   │   │   └── bài-2-phép-cộng.md
│   │   └── CHƯƠNG-2/
│   ├── LỚP-4/
│   └── ...
├── LÝ/
├── HÓA/
└── ...
```

---

## 💡 ĐỔI MỚI 

### **🚀 REVISED STRATEGY: Build-Time Pre-Rendering + Mobile-First**

**Based on codebase analysis và high-traffic requirements:**

#### **Option 1: Build-Time Pre-Rendering (RECOMMENDED for High Traffic)**
```typescript
// Pre-compile tất cả LaTeX content at build time
interface BuildTimeRenderer {
  preRenderAllContent: () => Promise<void>;
  generateStaticHTML: (content: string) => Promise<string>;
  optimizeForMobile: (html: string) => string;
  generateResponsiveImages: (tikz: string) => Promise<ImageSet>;
}

// ✅ Pros: Instant loading, perfect mobile performance, high traffic ready
// ✅ Pros: Leverage existing LaTeX infrastructure
// ⚠️ Cons: Admin upload 1 lần (matches requirement!)
```

#### **Option 2: Hybrid Cache + Existing KaTeX (Fallback)**
```typescript
// Leverage existing LaTeX system với enhanced caching
interface HybridRenderer {
  useExistingKaTeX: () => LaTeXRenderer; // From existing codebase
  enhanceMobileRendering: () => void;
  addProgressiveLoading: () => void;
}

// ✅ Pros: Use existing infrastructure, faster implementation
// ⚠️ Cons: Runtime rendering load for high traffic
```

### **🎯 CHOSEN ARCHITECTURE: Build-Time Pre-Rendering**

**Why this approach for NyNus Theory System:**
1. **High Traffic Ready**: Pre-rendered = instant loading
2. **Mobile-First**: Optimized responsive images và layouts
3. **Admin Workflow**: Upload 1 lần → build → deploy (perfect fit!)
4. **Complex LaTeX**: Full support cho TikZ và advanced math
5. **Leverage Existing**: Use current LaTeX components as base

```typescript
// Build-Time Pre-Rendering System
export class TheoryBuildSystem {
  private existingLatexRenderer: LaTeXRenderer; // Use existing from codebase
  private mobileOptimizer: MobileOptimizer;
  private contentProcessor: ContentProcessor;

  async buildAllTheoryContent(): Promise<void> {
    // 1. Scan all theory markdown files
    const theoryFiles = await this.scanTheoryFiles();

    // 2. Pre-render each file với existing LaTeX system
    for (const file of theoryFiles) {
      const rendered = await this.preRenderFile(file);
      const mobileOptimized = await this.mobileOptimizer.optimize(rendered);
      await this.savePreRendered(file.path, mobileOptimized);
    }

    // 3. Generate navigation index và search index
    await this.generateNavigationIndex();
    await this.generateSearchIndex();
  }

  async preRenderFile(file: TheoryFile): Promise<RenderedContent> {
    // Leverage existing LaTeX infrastructure
    const content = await this.existingLatexRenderer.renderContent(file.markdown);

    // Add mobile-specific optimizations
    const responsive = await this.makeResponsive(content);

    return {
      html: responsive,
      metadata: file.metadata,
      navigation: this.generateNavigation(file)
    };
  }
}
```

### **🏗️ Mobile-First Architecture**

```typescript
// Mobile-optimized content system
interface MobileTheoryContent {
  metadata: {
    subject: Subject;
    grade: number;
    chapter: number;
    lesson: number;
    title: string;
    description: string;
    keywords: string[];
    mobileOptimized: boolean;
    renderTime: number; // Pre-render performance tracking
  };
  content: {
    html: string;           // Pre-rendered HTML
    mobileHtml: string;     // Mobile-optimized version
    images: ResponsiveImageSet; // Multiple sizes for responsive
    searchText: string;     // Extracted text for search
  };
  navigation: {
    prev?: string;
    next?: string;
    parent: string;
    breadcrumbs: BreadcrumbItem[];
  };
  performance: {
    buildTime: number;
    fileSize: number;
    mobileScore: number;
  };
}

// Build-time generated indexes
interface PreBuiltIndexes {
  subjects: Record<Subject, GradeContent[]>;
  searchIndex: SearchableContent[];      // Pre-built search index
  navigationTree: NavigationNode[];      // Pre-built navigation
  mobileManifest: MobileManifest;        // Mobile-specific metadata
}
```

---

## 📋 KẾ HOẠCH [CŨ] - Triển khai Mobile-First dựa trên dựng sẵn (đã được thay thế bởi REVISION 2025-09-18)

### **🎯 REVISED PHASES - Build-Time Optimization Focus**

### Phase 1: Build System Infrastructure (3-4 hours)

#### 1.1 Content Structure Setup
```bash
# Create optimized content structure
mkdir -p content/theory/{TOÁN,LÝ,HÓA,SINH,VĂN,ANH,SỬ,ĐỊA}
mkdir -p content/theory/TOÁN/LỚP-{3..12}
mkdir -p public/theory-built/        # Pre-rendered content
mkdir -p public/theory-images/       # Responsive images
# ... repeat for all subjects
```

#### 1.2 Enhanced Build System (Leverage Existing LaTeX)
```typescript
// File: src/lib/theory/build-system.ts
export class TheoryBuildSystem {
  // Use existing LaTeX infrastructure
  private latexRenderer = new LaTeXRenderer(); // From existing codebase
  private mobileOptimizer = new MobileOptimizer();

  async buildTheorySystem(): Promise<void> {
    console.log('🚀 Building Theory System...');

    // 1. Scan và validate all theory files
    const theoryFiles = await this.scanAndValidateFiles();

    // 2. Pre-render với existing LaTeX system
    const rendered = await this.preRenderAllContent(theoryFiles);

    // 3. Mobile optimization
    const mobileOptimized = await this.optimizeForMobile(rendered);

    // 4. Generate indexes và navigation
    await this.generateStaticAssets(mobileOptimized);

    console.log('✅ Theory System built successfully!');
  }
}
```

#### 1.3 Mobile-First Content Processor
```typescript
// File: src/lib/theory/mobile-optimizer.ts
export class MobileOptimizer {
  async optimizeContent(html: string): Promise<MobileOptimizedContent> {
    // 1. Responsive LaTeX scaling
    const responsiveLatex = this.makeLatexResponsive(html);

    // 2. Image optimization cho TikZ diagrams
    const optimizedImages = await this.optimizeTikZImages(responsiveLatex);

    // 3. Touch-friendly navigation
    const touchOptimized = this.addTouchNavigation(optimizedImages);

    // 4. Performance optimization
    const performanceOptimized = this.optimizePerformance(touchOptimized);

    return performanceOptimized;
  }
}
```

### Phase 2: Admin Build Interface (4-5 hours)

#### 2.1 Build-Trigger Admin Interface
```typescript
// File: src/components/admin/theory-build-manager.tsx
export function TheoryBuildManager() {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [buildProgress, setBuildProgress] = useState(0);

  return (
    <div className="space-y-6">
      {/* Content Upload Area */}
      <ContentUploadZone
        onFilesUploaded={handleContentUpload}
        acceptedTypes={['.md', '.tex']}
      />

      {/* Build Controls */}
      <BuildControls
        onStartBuild={triggerBuild}
        buildStatus={buildStatus}
        progress={buildProgress}
      />

      {/* Mobile Preview */}
      <MobilePreviewPanel />

      {/* Performance Metrics */}
      <BuildMetrics />
    </div>
  );
}
```

#### 2.2 Enhanced LaTeX Editor với Build Preview
```typescript
// File: src/components/admin/theory-editor.tsx
export function TheoryEditor({ filePath }: TheoryEditorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen">
      {/* Monaco Editor */}
      <MonacoEditor
        language="markdown"
        value={content}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
          lineNumbers: 'on',
        }}
      />

      {/* Desktop Preview */}
      <LaTeXPreview content={content} mode="desktop" />

      {/* Mobile Preview */}
      <LaTeXPreview content={content} mode="mobile" />
    </div>
  );
}
```

### Phase 3: Mobile-First Student Interface (3-4 hours)

#### 3.1 Pre-Rendered Content Viewer (Mobile-First)
```typescript
// File: src/components/theory/mobile-theory-viewer.tsx
export function MobileTheoryViewer({ contentPath }: MobileTheoryViewerProps) {
  const [preRenderedContent, setPreRenderedContent] = useState<PreRenderedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load pre-rendered content (instant loading!)
    loadPreRenderedContent(contentPath).then(content => {
      setPreRenderedContent(content);
      setIsLoading(false);
    });
  }, [contentPath]);

  if (isLoading) return <TheoryContentSkeleton />;

  return (
    <article className="theory-content mobile-optimized">
      {/* Mobile-optimized responsive content */}
      <div
        className="prose prose-sm sm:prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: preRenderedContent?.mobileHtml }}
      />

      {/* Touch-friendly navigation */}
      <MobileNavigationControls content={preRenderedContent} />
    </article>
  );
}
```

#### 3.2 Touch-Optimized Navigation System
```typescript
// File: src/components/theory/mobile-navigation.tsx
export function MobileTheoryNavigation({ currentPath }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mobile-theory-nav">
      {/* Collapsible breadcrumbs for mobile */}
      <CollapsibleBreadcrumbs path={currentPath} />

      {/* Touch-friendly subject selector */}
      <TouchSubjectSelector />

      {/* Swipeable chapter navigation */}
      <SwipeableChapterList />

      {/* Bottom navigation bar */}
      <BottomNavigationBar
        onPrevious={goToPrevious}
        onNext={goToNext}
        onMenu={() => setIsMenuOpen(true)}
      />
    </nav>
  );
}
```

### Phase 4: Pre-Built Search System (2-3 hours)

#### 4.1 Build-Time Search Index Generation
```typescript
// File: src/lib/search/build-time-search.ts
export class BuildTimeSearchIndexer {
  async generateSearchIndex(preRenderedContent: PreRenderedContent[]): Promise<SearchIndex> {
    const searchIndex: SearchIndex = {
      documents: [],
      mathFormulas: [],
      subjects: {},
      grades: {},
      keywords: {}
    };

    for (const content of preRenderedContent) {
      // Extract searchable text từ pre-rendered HTML
      const searchableText = this.extractSearchableText(content.html);

      // Index LaTeX formulas separately
      const mathFormulas = this.extractMathFormulas(content.html);

      // Build subject/grade indexes
      this.indexByMetadata(content.metadata, searchIndex);

      searchIndex.documents.push({
        id: content.path,
        title: content.metadata.title,
        content: searchableText,
        subject: content.metadata.subject,
        grade: content.metadata.grade,
        keywords: content.metadata.keywords,
        mathFormulas
      });
    }

    return searchIndex;
  }
}
```

#### 4.2 Instant Search với Pre-Built Index
```typescript
// File: src/lib/search/instant-search.ts
export class InstantTheorySearch {
  private preBuiltIndex: SearchIndex;

  constructor(searchIndex: SearchIndex) {
    this.preBuiltIndex = searchIndex;
  }

  searchInstant(query: string): SearchResult[] {
    // Instant search trong pre-built index (no server calls!)
    const results = this.preBuiltIndex.documents
      .filter(doc => this.matchesQuery(doc, query))
      .map(doc => this.formatSearchResult(doc, query))
      .sort((a, b) => b.relevance - a.relevance);

    return results.slice(0, 20); // Top 20 results
  }

  searchBySubject(subject: Subject, grade?: number): SearchResult[] {
    return this.preBuiltIndex.subjects[subject]
      ?.filter(doc => !grade || doc.grade === grade) || [];
  }
}
```

---

## 🚀 THỰC THI

### Step 1: Setup Build-Time Infrastructure
```bash
# Install build-time dependencies
cd apps/frontend
pnpm add gray-matter fuse.js sharp @types/sharp
pnpm add monaco-editor @monaco-editor/react
pnpm add -D @types/katex concurrently

# Create build scripts
echo "Building theory system..." > scripts/build-theory.js
```

### Step 2: Create Build System Core
```typescript
// src/lib/theory/build-system.ts - Main build orchestrator
// src/lib/theory/content-processor.ts - Content processing
// src/lib/theory/mobile-optimizer.ts - Mobile optimization
// src/lib/theory/search-indexer.ts - Search index generation
// src/types/theory.ts - TypeScript interfaces
```

### Step 3: Build Admin Build Interface
```typescript
// src/app/3141592654/admin/theory/page.tsx - Build management page
// src/components/admin/theory-build-manager.tsx - Build controls
// src/components/admin/content-upload-zone.tsx - File upload
// src/components/admin/build-progress.tsx - Progress tracking
```

### Step 4: Build Mobile-First Student Interface
```typescript
// src/app/theory/page.tsx - Theory homepage (mobile-first)
// src/app/theory/[...path]/page.tsx - Pre-rendered content pages
// src/components/theory/mobile-theory-viewer.tsx - Mobile viewer
// src/components/theory/mobile-navigation.tsx - Touch navigation
```

### Step 5: Implement Pre-Built Search
```typescript
// src/lib/search/instant-search.ts - Client-side search
// src/components/theory/search-interface.tsx - Search UI
// public/theory-search-index.json - Pre-built search index
```

### Step 6: Build Process Integration
```bash
# Add to package.json scripts
"build:theory": "node scripts/build-theory.js",
"dev:theory": "concurrently \"pnpm dev\" \"pnpm build:theory --watch\"",
"deploy:theory": "pnpm build:theory && pnpm build"
```

---

## 🧪 KIỂM THỬ 

### Build System Tests
```typescript
// __tests__/build-system.test.ts
describe('Theory Build System', () => {
  test('builds all theory content successfully', async () => {
    const buildSystem = new TheoryBuildSystem();
    const result = await buildSystem.buildTheorySystem();

    expect(result.success).toBe(true);
    expect(result.processedFiles).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  test('generates mobile-optimized content', async () => {
    const mobileOptimizer = new MobileOptimizer();
    const optimized = await mobileOptimizer.optimizeContent(sampleLatexContent);

    expect(optimized.mobileHtml).toBeDefined();
    expect(optimized.performance.mobileScore).toBeGreaterThan(90);
  });
});
```

### Performance & Load Tests
```typescript
// __tests__/performance.test.ts
describe('High-Traffic Performance', () => {
  test('pre-rendered content loads instantly', async () => {
    const start = Date.now();
    const content = await loadPreRenderedContent('TOÁN/LỚP-10/CHƯƠNG-1/bài-1');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(50); // < 50ms for pre-rendered content
    expect(content.html).toBeDefined();
  });

  test('handles 1000 concurrent requests', async () => {
    const promises = Array(1000).fill(0).map(() =>
      loadPreRenderedContent('TOÁN/LỚP-10/CHƯƠNG-1/bài-1')
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(1000);
    expect(results.every(r => r.html)).toBe(true);
  });
});
```

### Mobile Optimization Tests
```typescript
// __tests__/mobile-optimization.test.ts
describe('Mobile-First Optimization', () => {
  test('LaTeX formulas scale properly on mobile', () => {
    const mobileViewer = render(<MobileTheoryViewer contentPath="test-path" />);
    const latexElements = mobileViewer.getAllByClassName('katex');

    latexElements.forEach(element => {
      expect(element).toHaveStyle('max-width: 100%');
      expect(element).toHaveStyle('overflow-x: auto');
    });
  });

  test('touch navigation works correctly', async () => {
    const { getByTestId } = render(<MobileTheoryNavigation currentPath="test" />);
    const nextButton = getByTestId('next-button');

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/theory/next-lesson');
    });
  });
});
```

---

## 📊 Thông số kỹ thuật 
### Build-Time Optimized File Structure
```
apps/frontend/src/
├── app/
│   ├── theory/                          # Mobile-first student pages
│   │   ├── page.tsx                    # Theory homepage (mobile-first)
│   │   └── [...path]/page.tsx          # Pre-rendered content pages
│   └── 3141592654/admin/theory/        # Build management interface
│       ├── page.tsx                    # Build dashboard
│       ├── upload/page.tsx             # Content upload
│       └── preview/page.tsx            # Mobile preview
├── components/
│   ├── theory/                         # Mobile-optimized components
│   │   ├── mobile-theory-viewer.tsx    # Pre-rendered content viewer
│   │   ├── mobile-navigation.tsx       # Touch navigation
│   │   └── search-interface.tsx        # Instant search
│   └── admin/theory/                   # Build management components
│       ├── theory-build-manager.tsx    # Build orchestration
│       ├── content-upload-zone.tsx     # File upload
│       └── build-progress.tsx          # Progress tracking
├── lib/
│   ├── theory/                         # Build system core
│   │   ├── build-system.ts            # Main build orchestrator
│   │   ├── mobile-optimizer.ts        # Mobile optimization
│   │   └── search-indexer.ts          # Search index generation
│   ├── latex/                          # Enhanced LaTeX (existing)
│   └── search/                         # Pre-built search
└── types/
    └── theory.ts                       # Build-optimized types

content/theory/                          # Source content
├── TOÁN/LỚP-3/CHƯƠNG-1/bài-1.md
├── LÝ/LỚP-10/CHƯƠNG-2/bài-3.md
└── ...

public/theory-built/                     # Pre-rendered output
├── TOÁN/LỚP-3/CHƯƠNG-1/bài-1.html     # Mobile-optimized HTML
├── search-index.json                   # Pre-built search index
└── navigation-tree.json                # Pre-built navigation
```

### Enhanced Dependencies for Build System
```json
{
  "dependencies": {
    "gray-matter": "^4.0.3",           // Markdown frontmatter
    "fuse.js": "^7.0.0",               // Client-side search
    "sharp": "^0.33.0",                // Image optimization
    "monaco-editor": "^0.45.0",        // Code editor
    "@monaco-editor/react": "^4.6.0"   // React integration
  },
  "devDependencies": {
    "@types/katex": "^0.16.7",         // KaTeX types
    "@types/sharp": "^0.32.0",         // Sharp types
    "concurrently": "^8.2.0"           // Parallel scripts
  },
  "scripts": {
    "build:theory": "node scripts/build-theory.js",
    "dev:theory": "concurrently \"pnpm dev\" \"pnpm build:theory --watch\"",
    "deploy:theory": "pnpm build:theory && pnpm build"
  }
}
```

---

## 🎯 Bước tiếp theo 

### **🚀 Immediate Actions Required:**

1. **✅ CONFIRMED: Build-Time Pre-Rendering Strategy**
   - Perfect fit cho admin upload 1 lần requirement
   - Optimal cho high-traffic và mobile-first
   - Leverage existing LaTeX infrastructure

2. **📁 Content Analysis Needed:**
   - Provide sample LaTeX files từ public/content (if available)
   - Estimate content volume (số files, complexity level)
   - Confirm TikZ diagram complexity

3. **🎯 Implementation Priority:**
   - **Phase 1**: Build system infrastructure (3-4h)
   - **Phase 2**: Admin build interface (4-5h)
   - **Phase 3**: Mobile-first student interface (3-4h)
   - **Phase 4**: Pre-built search system (2-3h)

### **🔧 Technical Decisions Made:**

✅ **LaTeX Strategy**: Enhanced KaTeX + build-time optimization
✅ **Mobile Strategy**: Mobile-first responsive design
✅ **Performance**: Pre-rendering cho instant loading
✅ **Search**: Build-time index generation
✅ **Admin Workflow**: Upload → Build → Deploy

### **📋 Ready to Execute:**

**Bạn có muốn bắt đầu implementation ngay với Phase 1?**

- Tôi sẽ tạo build system infrastructure
- Leverage existing LaTeX components từ codebase
- Focus vào mobile-first optimization
- Implement admin build interface

**Hoặc bạn muốn thảo luận thêm về technical approach?** 🚀

---

## 📈 Kết quả kỳ vọng 

### **Performance Targets Achieved:**
- **Page Load**: < 100ms (pre-rendered content)
- **Mobile Score**: 95+ Lighthouse performance
- **Concurrent Users**: 1000+ simultaneous access
- **Build Time**: < 5 minutes for full content set

### **User Experience Goals:**
- **Mobile-First**: Perfect touch navigation
- **Instant Search**: < 50ms search response
- **Responsive LaTeX**: Auto-scaling formulas
- **Admin Efficiency**: One-click build và deploy

**Implementation plan is optimized và ready for execution!** ✨

---

## 🔧 RÀ SOÁT - Checklist triển khai

### Pre-Implementation Checklist
- [ ] Analyze main.tex file complexity
- [ ] Choose TikZ rendering strategy
- [ ] Confirm content structure requirements
- [ ] Set up development environment

### Phase 1: Core Infrastructure ✅
- [ ] Create content directory structure
- [ ] Implement LaTeX rendering system
- [ ] Build content parser
- [ ] Set up TypeScript interfaces
- [ ] Create basic navigation system

### Phase 2: Admin Interface ✅
- [ ] Monaco Editor integration
- [ ] LaTeX syntax highlighting
- [ ] Live preview functionality
- [ ] File management system
- [ ] Content CRUD operations

### Phase 3: Student Interface ✅
- [ ] Theory viewer component
- [ ] Responsive LaTeX rendering
- [ ] Breadcrumb navigation
- [ ] Subject/grade navigation
- [ ] Mobile optimization

### Phase 4: Search & Discovery ✅
- [ ] Full-text search implementation
- [ ] LaTeX formula search
- [ ] Search UI components
- [ ] Performance optimization
- [ ] Search result highlighting

### Quality Assurance ✅
- [ ] Unit tests for LaTeX rendering
- [ ] Integration tests for content system
- [ ] Performance benchmarks
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness testing

### Deployment Checklist ✅
- [ ] Build optimization
- [ ] Content validation
- [ ] Error handling
- [ ] SEO optimization
- [ ] Analytics integration

---

## 📈 Chỉ số thành công 

### Performance Targets
- **LaTeX Math Rendering**: < 100ms per formula
- **TikZ Diagram Rendering**: < 2s per diagram
- **Page Load Time**: < 1s for theory pages
- **Search Response**: < 500ms for queries
- **Mobile Performance**: 90+ Lighthouse score

### User Experience Goals
- **Intuitive Navigation**: Easy subject/grade browsing
- **Readable Content**: Optimal typography and spacing
- **Responsive Design**: Perfect on all device sizes
- **Fast Search**: Instant content discovery
- **Admin Efficiency**: Quick content creation/editing

### Technical Quality Standards
- **Code Coverage**: 85%+ for core functionality
- **TypeScript Strict**: Zero any types
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO Optimization**: Proper meta tags and structure
- **Error Handling**: Graceful fallbacks for LaTeX errors

---

## 🚨 Giảm thiểu rủi ro 

### LaTeX Rendering Risks
**Risk**: Complex LaTeX fails to render
**Mitigation**: Fallback to plain text + error logging

**Risk**: TikZ diagrams break layout
**Mitigation**: Container constraints + responsive scaling

### Performance Risks
**Risk**: Large LaTeX content slows page load
**Mitigation**: Lazy loading + content chunking

**Risk**: Search becomes slow with large content
**Mitigation**: Indexed search + pagination

### Content Management Risks
**Risk**: Admin accidentally deletes content
**Mitigation**: Soft delete + backup system

**Risk**: Invalid LaTeX breaks rendering
**Mitigation**: Validation + preview before save

---


