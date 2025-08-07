# Checklist UI Migration - Trang Chủ (Homepage)
*Chuyển đổi giao diện từ dự án cũ sang dự án mới*

## 📋 Tổng quan
**Mục tiêu**: Chuyển đổi hoàn toàn trang chủ từ `temp/web/src/app` sang `apps/frontend/src/app` với giao diện giống 100%

**Nguyên tắc**:
- Giao diện phải giống 100% chính xác
- Thay thế tất cả API calls bằng mockdata
- Sử dụng index.ts để import/export gọn gàng
- Đảm bảo không có lỗi TypeScript

---

## 🎯 Phase 1: Phân tích và Chuẩn bị

### 1.1 Phân tích Components Trang Chủ
- [x] **Đọc và phân tích** `temp/web/src/app/page.tsx`
  - [x] Xác định 5 components chính: Hero, Features, AILearning, FeaturedCourses, FAQ
  - [x] Phân tích metadata và SEO: "NyNus - Nền tảng học tập toán học tương tác với AI"
  - [x] Xác định dependencies và imports: Next.js Metadata, 5 home feature components

### 1.2 Phân tích Components Home Features
- [x] **Hero Component** (`temp/web/src/components/features/home/hero.tsx`)
  - [x] Đọc toàn bộ code và UI structure: Hero section với background gradients, CTA buttons, video modal
  - [x] Xác định props, state, và logic: isVideoModalOpen state, shouldReduceMotion, scrollToNextSection()
  - [x] Xác định API calls cần thay thế bằng mockdata: Hardcoded "+1.200 học sinh đã đăng ký"
  - [x] Xác định UI components dependencies: framer-motion, lucide-react icons, next/link

- [x] **Features Component** (`temp/web/src/components/features/home/features.tsx`)
  - [x] Đọc toàn bộ code và UI structure: Grid 4 cột feature cards với tooltips
  - [x] Xác định props, state, và logic: FeatureCard component, Tooltip component với hover state
  - [x] Xác định API calls cần thay thế bằng mockdata: Hardcoded 4 features data
  - [x] Xác định UI components dependencies: framer-motion, lucide-react icons, next/link

- [x] **AILearning Component** (`temp/web/src/components/features/home/ai-learning.tsx`)
  - [x] Đọc toàn bộ code và UI structure: 2 cột content + dashboard mockup với analytics
  - [x] Xác định props, state, và logic: Không có props/state, hardcoded dashboard data
  - [x] Xác định API calls cần thay thế bằng mockdata: Student profile, analytics, learning roadmap
  - [x] Xác định UI components dependencies: lucide-react icons, next/link

- [x] **FeaturedCourses Component** (`temp/web/src/components/features/home/featured-courses.tsx`)
  - [x] Đọc toàn bộ code và UI structure: Horizontal scrollable course cards với navigation
  - [x] Xác định props, state, và logic: Scroll states, useFeaturedCourses hook, CourseCard component
  - [x] Xác định API calls cần thay thế bằng mockdata: useFeaturedCourses(6) hook + fallback mockCourses
  - [x] Xác định UI components dependencies: lucide-react, next/link, Skeleton components, custom hook

- [x] **FAQ Component** (`temp/web/src/components/features/home/faq.tsx`)
  - [x] Đọc toàn bộ code và UI structure: Accordion-style FAQ items với CTA button
  - [x] Xác định props, state, và logic: openIndex state, toggleFAQ(), FAQItem component
  - [x] Xác định API calls cần thay thế bằng mockdata: Hardcoded faqData array (5 items)
  - [x] Xác định UI components dependencies: lucide-react icons, React useState

### 1.3 Phân tích Dependencies
- [x] **UI Components** cần thiết từ `temp/web/src/components/ui/`
  - [x] Liệt kê tất cả UI components được sử dụng: Skeleton components cho loading states
  - [x] Kiểm tra xem đã có trong dự án mới chưa: ✅ Tất cả UI components đã có sẵn
  - [x] Xác định components cần tạo mới: ❌ Không cần tạo mới UI components

- [x] **Layout Components** cần thiết
  - [x] Navbar, Footer, MainLayout: ❌ Chưa có, cần tạo mới
  - [x] FloatingCTA và các layout components khác: ❌ Chưa có, cần tạo mới

- [x] **Shared Components** cần thiết
  - [x] Error handling components: ✅ Đã có sẵn
  - [x] File upload components: ❌ Không cần cho homepage
  - [x] Lazy loading components: ❌ Không cần cho homepage

### 1.4 Chuẩn bị Mockdata
- [x] **Tạo mockdata structure** trong `apps/frontend/src/lib/mockdata/`
  - [x] `homepage.ts` - Data cho trang chủ: ✅ Đã có sẵn
  - [x] `courses.ts` - Data cho featured courses: ✅ Đã có sẵn
  - [x] `features.ts` - Data cho features section: ❌ Cần tạo mới hoặc thêm vào homepage.ts
  - [x] `faq.ts` - Data cho FAQ section: ✅ Đã có sẵn
  - [x] `testimonials.ts` - Data cho testimonials (nếu có): ❌ Không cần

---

## 🚀 Phase 2: Implementation

### 2.1 Tạo Mockdata Files
- [x] **Tạo** `apps/frontend/src/lib/mockdata/homepage.ts`
  - [x] Hero section data (title, subtitle, CTA buttons)
  - [x] Features section data (4 features với icons, colors)
  - [x] AI Learning section data (dashboard, analytics, roadmap)
  - [x] TypeScript interfaces cho tất cả data

- [x] **Tạo** `apps/frontend/src/lib/mockdata/featured-courses.ts`
  - [x] Featured courses data (5 courses)
  - [x] Course properties: title, description, level, students, duration, rating, color
  - [x] getGradient helper function

- [x] **Kiểm tra** `apps/frontend/src/lib/mockdata/courses.ts`
  - [x] File đã có data đầy đủ nhưng phức tạp cho admin
  - [x] Tạo featured-courses.ts riêng cho homepage

- [x] **Tạo** `apps/frontend/src/lib/mockdata/homepage-faq.ts`
  - [x] FAQ questions và answers (5 items)
  - [x] Đơn giản hóa từ faq.ts phức tạp
  - [x] Interface HomepageFAQ

- [x] **Cập nhật** `apps/frontend/src/lib/mockdata/index.ts`
  - [x] Export homepage mockdata modules
  - [x] Export featured-courses data
  - [x] Export homepage-faq data

### 2.2 Tạo Home Components
- [x] **Tạo** `apps/frontend/src/components/features/home/hero.tsx`
  - [x] Copy structure từ dự án cũ (278 lines)
  - [x] Thay thế hardcoded data bằng heroData mockdata
  - [x] Đảm bảo UI giống 100% (background gradients, CTA buttons, video modal, dashboard mockup)
  - [x] Add TypeScript types và proper imports
  - [x] Responsive design với framer-motion animations

- [x] **Tạo** `apps/frontend/src/components/features/home/features.tsx`
  - [x] Copy structure từ dự án cũ (171 lines)
  - [x] Thay thế hardcoded features bằng featuresData mockdata
  - [x] Đảm bảo UI giống 100% (grid 4 cột, tooltips, decorative circles)
  - [x] Add TypeScript types và icon mapping
  - [x] Responsive design với proper animations

- [x] **Tạo** `apps/frontend/src/components/features/home/ai-learning.tsx`
  - [x] Copy structure từ dự án cũ (195 lines)
  - [x] Thay thế hardcoded data bằng aiLearningData mockdata
  - [x] Đảm bảo UI giống 100% (2 cột content + dashboard với analytics chart và learning roadmap)
  - [x] Add TypeScript types và icon mapping
  - [x] Wave decorations và floating notification card

- [x] **Tạo** `apps/frontend/src/components/features/home/featured-courses.tsx`
  - [x] Copy structure từ dự án cũ (193 lines)
  - [x] Thay thế useFeaturedCourses hook bằng featuredCourses mockdata
  - [x] Đảm bảo UI giống 100% (horizontal scrollable course cards với navigation)
  - [x] Add TypeScript types và loading skeletons
  - [x] Error handling và responsive design

- [x] **Tạo** `apps/frontend/src/components/features/home/faq.tsx`
  - [x] Copy structure từ dự án cũ (107 lines)
  - [x] Thay thế hardcoded faqData bằng homepageFAQData mockdata
  - [x] Đảm bảo UI giống 100% (accordion-style FAQ items với toggle functionality)
  - [x] Add TypeScript types và proper state management
  - [x] Wave decorations và CTA button

### 2.3 Tạo Index Files
- [x] **Tạo** `apps/frontend/src/components/features/home/index.ts`
  - [x] Export tất cả 5 home components: Hero, Features, AILearning, FeaturedCourses, FAQ
  - [x] Sử dụng named exports với default imports
  - [x] Đảm bảo import paths chính xác

- [x] **Tạo** `apps/frontend/src/components/features/index.ts`
  - [x] Export home components từ home/index.ts
  - [x] Chuẩn bị structure cho admin, courses components

- [x] **Tạo** `apps/frontend/src/components/index.ts`
  - [x] Export features components
  - [x] Export UI components
  - [x] Central export file cho tất cả components

### 2.4 Cập nhật Main Page
- [x] **Cập nhật** `apps/frontend/src/app/page.tsx`
  - [x] Import components từ index files: Hero, Features, AILearning, FeaturedCourses, FAQ
  - [x] Copy metadata từ dự án cũ: "NyNus - Nền tảng học tập toán học tương tác với AI"
  - [x] Đảm bảo component order giống nhau: Hero → Features → AILearning → FeaturedCourses → FAQ
  - [x] Simplified page structure với Fragment wrapper

---

## 🧪 Phase 3: Testing và Validation

### 3.1 Component Testing
- [x] **Test từng component riêng lẻ**
  - [x] Hero component renders correctly - No TypeScript errors
  - [x] Features component renders correctly - No TypeScript errors
  - [x] AILearning component renders correctly - No TypeScript errors
  - [x] FeaturedCourses component renders correctly - No TypeScript errors
  - [x] FAQ component renders correctly - No TypeScript errors

### 3.2 Integration Testing
- [x] **Test trang chủ hoàn chỉnh**
  - [x] Tất cả components render đúng thứ tự: Hero → Features → AILearning → FeaturedCourses → FAQ
  - [x] Không có lỗi TypeScript trong homepage components
  - [x] Imports từ index files hoạt động chính xác
  - [x] Metadata SEO được thiết lập đúng

### 3.3 Build và Development Testing
- [x] **Build và Development Server**
  - [x] Build thành công với warnings (ESLint issues từ admin components)
  - [x] Development server chạy thành công trên port 3003
  - [x] Homepage components không có compilation errors
  - [x] Mockdata imports hoạt động chính xác

### 3.4 Visual Testing
- [x] **Browser Testing**
  - [x] Homepage mở thành công tại http://localhost:3003
  - [x] Tất cả 5 components render theo đúng thứ tự
  - [x] Giao diện responsive và animations hoạt động
  - [x] Dark/light mode transitions (nếu có)

---

## 📝 Phase 4: Documentation và Cleanup

### 4.1 Documentation
- [ ] **Cập nhật README**
  - [ ] Document new homepage structure
  - [ ] Document mockdata usage
  - [ ] Document component architecture

### 4.2 Code Quality
- [ ] **Code review**
  - [ ] Kiểm tra TypeScript types
  - [ ] Kiểm tra import/export consistency
  - [ ] Kiểm tra code formatting
  - [ ] Kiểm tra performance

### 4.3 Final Validation
- [ ] **Build test**
  - [ ] `pnpm build` thành công
  - [ ] Không có warnings
  - [ ] Bundle size reasonable

---

## 🎯 Success Criteria
- [x] Giao diện trang chủ giống 100% với dự án cũ
- [x] Tất cả API calls được thay thế bằng mockdata
- [x] Không có lỗi TypeScript hoặc runtime errors trong homepage components
- [x] Responsive design hoạt động tốt trên tất cả devices
- [x] Performance tốt (development server ready in <2s)
- [x] Code structure clean và maintainable với index files

---

## 📋 Notes
- Thực hiện từng component một cách tuần tự
- Test ngay sau khi hoàn thành mỗi component
- Backup code trước khi thay đổi lớn
- Sử dụng Git commits nhỏ và descriptive
