# Checklist Layout Components - Header & Footer
*Tạo layout components cho dự án mới*

## 📋 Tổng quan
**Mục tiêu**: Tạo header (navbar) và footer từ dự án cũ sang dự án mới để hoàn thiện layout

**Nguyên tắc**:
- Copy structure từ dự án cũ
- Thay thế API calls bằng mockdata
- Sử dụng TypeScript strict mode
- Đảm bảo responsive design

---

## 🎯 Phase 1: Phân tích Layout Components

### 1.1 Phân tích MainLayout
- [x] **Đọc** `temp/web/src/components/layout/main-layout.tsx`
  - [x] Xác định structure: Providers → Navbar → children → Footer → FloatingCTA
  - [x] Conditional rendering cho admin pages
  - [x] Dependencies: WishlistProvider, Providers, ScrollToTop

### 1.2 Phân tích Navbar
- [x] **Đọc** `temp/web/src/components/layout/navbar.tsx` (349 lines)
  - [x] Xác định navigation items: KHÓA HỌC, LUYỆN ĐỀ, CÂU HỎI, THẢO LUẬN, NHẮN TIN, THƯ VIỆN
  - [x] Auth integration: useAuth hook, login/register modals, user dropdown
  - [x] Theme toggle, wishlist button, search functionality
  - [x] Dependencies: framer-motion, useAuth, useWishlist, ThemeToggle

### 1.3 Phân tích Footer
- [x] **Đọc** `temp/web/src/components/layout/footer.tsx` (286 lines)
  - [x] Company info: NyNus branding, description, social links (Facebook, Instagram, Youtube, Twitter)
  - [x] Newsletter subscription: email form với animation
  - [x] Language selector: dropdown với 4 languages (vi, en, fr, ja)
  - [x] Footer links: Giới thiệu, Khóa học, Đề thi, etc. + Legal links

### 1.4 Phân tích FloatingCTA
- [x] **Đọc** `temp/web/src/components/layout/floating-cta.tsx` (92 lines)
  - [x] Floating action button: "Bắt đầu học ngay!" CTA
  - [x] Scroll behavior: hiển thị sau 300px scroll, localStorage dismiss
  - [x] Mobile-only display với gradient background

---

## 🚀 Phase 2: Implementation

### 2.1 Tạo Layout Directory
- [x] **Tạo** `apps/frontend/src/components/layout/`
- [x] **Tạo** layout components structure

### 2.2 Tạo Navbar Component
- [x] **Tạo** `apps/frontend/src/components/layout/navbar.tsx` (267 lines)
  - [x] Copy structure từ dự án cũ với 6 navigation items
  - [x] Thay thế auth context bằng mockdata (isAuthenticated = false)
  - [x] Simplified login/register handlers (console.log)
  - [x] Add TypeScript types và responsive mobile menu

### 2.3 Tạo Footer Component
- [x] **Tạo** `apps/frontend/src/components/layout/footer.tsx` (316 lines)
  - [x] Copy structure từ dự án cũ với CTA section, newsletter, links
  - [x] Thay thế newsletter API bằng mockdata (console.log)
  - [x] Add company info: social links, contact info, language selector
  - [x] Add TypeScript types và animations

### 2.4 Tạo FloatingCTA Component
- [x] **Tạo** `apps/frontend/src/components/layout/floating-cta.tsx` (82 lines)
  - [x] Copy structure từ dự án cũ với scroll behavior
  - [x] Simplified CTA actions (link to /auth/register)
  - [x] Add TypeScript types và localStorage dismiss

### 2.5 Tạo MainLayout Component
- [x] **Tạo** `apps/frontend/src/components/layout/main-layout.tsx` (29 lines)
  - [x] Copy structure từ dự án cũ với conditional rendering
  - [x] Simplified providers (removed complex dependencies)
  - [x] Add admin page detection logic
  - [x] Add TypeScript types

### 2.6 Tạo Layout Index
- [x] **Tạo** `apps/frontend/src/components/layout/index.ts`
  - [x] Export tất cả 4 layout components
  - [x] Sử dụng named exports

---

## 🧪 Phase 3: Integration

### 3.1 Cập nhật App Layout
- [x] **Cập nhật** `apps/frontend/src/app/layout.tsx`
  - [x] Import MainLayout từ @/components/layout
  - [x] Wrap children với MainLayout thay vì div
  - [x] Maintain AppProviders wrapper

### 3.2 Dependencies Check
- [x] **Kiểm tra** TypeScript errors
  - [x] Tất cả layout components không có lỗi TypeScript
  - [x] App layout import thành công
  - [x] Không cần tạo thêm dependencies

### 3.3 Test Layout
- [x] **Test** layout integration
  - [x] Development server vẫn chạy thành công
  - [x] Homepage render với navbar và footer
  - [x] Browser test tại http://localhost:3003
  - [x] Layout responsive và hoạt động tốt

---

## 🎯 Success Criteria
- [x] Navbar hiển thị đúng với navigation items (6 items + auth section)
- [x] Footer hiển thị đúng với company info (social links, newsletter, contact)
- [x] Layout responsive trên tất cả devices (mobile menu, responsive grid)
- [x] Không có lỗi TypeScript (all components pass diagnostics)
- [x] Admin pages không hiển thị navbar/footer (conditional rendering)
- [x] Homepage có layout hoàn chỉnh (navbar + content + footer + floating CTA)

---

## 📝 Notes
- Tạm thời simplify auth functionality
- Focus vào UI structure trước
- Có thể mock các complex features
- Đảm bảo TypeScript compliance
