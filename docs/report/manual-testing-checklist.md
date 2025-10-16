# Checklist Kiểm Tra Manual UI/UX - NyNus Exam Bank System
**Ngày tạo:** 13/10/2025  
**Mục đích:** Hướng dẫn kiểm tra chi tiết UI/UX, responsive, và Vietnamese support

---

## 🎯 Hướng Dẫn Sử Dụng Checklist

### Cách Đánh Dấu
- `[ ]` - Chưa kiểm tra
- `[x]` - Đã kiểm tra - OK
- `[!]` - Đã kiểm tra - Có vấn đề (ghi chú bên dưới)
- `[-]` - Không áp dụng

### Breakpoints Cần Test
- **Mobile Small:** 375px (iPhone SE)
- **Mobile Large:** 414px (iPhone Pro Max)
- **Tablet:** 768px (iPad)
- **Desktop Small:** 1024px (Laptop)
- **Desktop Medium:** 1280px (Desktop)
- **Desktop Large:** 1920px (Full HD)

---

## 📱 1. HOMEPAGE (/) - Trang Chủ

### 1.1 Layout & Structure
- [ ] Header hiển thị đầy đủ (logo, navigation, auth buttons)
- [ ] Hero section hiển thị rõ ràng
- [ ] Footer hiển thị đầy đủ thông tin
- [ ] Spacing giữa các sections hợp lý
- [ ] Không có content bị overflow

### 1.2 Responsive Design
#### Mobile (375px)
- [ ] Navigation collapse thành hamburger menu
- [ ] Hero text size phù hợp
- [ ] Buttons đủ lớn để tap (min 44x44px)
- [ ] Images scale đúng
- [ ] Không có horizontal scroll

#### Tablet (768px)
- [ ] Layout chuyển sang 2 columns (nếu có)
- [ ] Navigation hiển thị đầy đủ hoặc partial
- [ ] Images và text cân đối

#### Desktop (1280px+)
- [ ] Full navigation bar
- [ ] Content centered với max-width hợp lý
- [ ] Không có khoảng trống lớn bất thường

### 1.3 Typography
- [ ] Font chữ rõ ràng, dễ đọc
- [ ] Heading hierarchy rõ ràng (h1 > h2 > h3)
- [ ] Line height phù hợp (1.5-1.8 cho body text)
- [ ] Tiếng Việt có dấu hiển thị đúng
- [ ] Không có font fallback xấu

### 1.4 Colors & Contrast
- [ ] Color scheme nhất quán
- [ ] Contrast ratio đạt WCAG AA (4.5:1 cho text)
- [ ] Links có màu khác biệt rõ ràng
- [ ] Buttons có màu nổi bật

### 1.5 Interactive Elements
- [ ] Hover states hoạt động (desktop)
- [ ] Active states rõ ràng
- [ ] Focus indicators visible (keyboard navigation)
- [ ] Buttons có cursor pointer
- [ ] Links có underline hoặc màu khác biệt

### 1.6 Performance & Loading
- [ ] Images load nhanh
- [ ] Không có layout shift (CLS)
- [ ] Loading states hiển thị (nếu có async content)
- [ ] Smooth scrolling

### 1.7 Vietnamese Support
- [ ] Tất cả text tiếng Việt hiển thị đúng dấu
- [ ] Không có ký tự bị thay thế bằng "?"
- [ ] Font support đầy đủ ký tự đặc biệt (ă, â, ê, ô, ơ, ư, đ)
- [ ] Text wrapping đúng với tiếng Việt

---

## 🔐 2. LOGIN PAGE (/login)

### 2.1 Form Layout
- [ ] Form centered và dễ nhìn
- [ ] Logo/branding hiển thị
- [ ] Title rõ ràng
- [ ] Input fields đủ lớn
- [ ] Labels rõ ràng

### 2.2 Form Fields
- [ ] Email input có type="email"
- [ ] Password input có type="password"
- [ ] Show/hide password button hoạt động
- [ ] Placeholder text hợp lý
- [ ] Required fields có indicator (*)

### 2.3 Validation
- [ ] Email validation hoạt động
- [ ] Password validation hoạt động
- [ ] Error messages hiển thị rõ ràng
- [ ] Error messages bằng tiếng Việt
- [ ] Inline validation (real-time)

### 2.4 Buttons & Links
- [ ] Login button nổi bật
- [ ] "Quên mật khẩu?" link rõ ràng
- [ ] "Đăng ký" link rõ ràng
- [ ] Social login buttons (nếu có)
- [ ] Button states (normal, hover, active, disabled)

### 2.5 Responsive
#### Mobile (375px)
- [ ] Form width 100% với padding hợp lý
- [ ] Input fields đủ lớn để tap
- [ ] Keyboard không che form
- [ ] Submit button dễ nhấn

#### Desktop (1280px)
- [ ] Form có max-width hợp lý (400-500px)
- [ ] Centered vertically và horizontally
- [ ] Background/illustration (nếu có)

### 2.6 Accessibility
- [ ] Tab order hợp lý
- [ ] Enter key submit form
- [ ] Focus visible trên tất cả elements
- [ ] Screen reader friendly labels

### 2.7 Vietnamese Support
- [ ] Button text: "Đăng nhập" hiển thị đúng
- [ ] Error messages tiếng Việt đúng dấu
- [ ] Placeholder text tiếng Việt

---

## 📝 3. REGISTER PAGE (/register)

### 3.1 Form Layout
- [ ] Multi-step hoặc single page form
- [ ] Progress indicator (nếu multi-step)
- [ ] Form fields organized logically
- [ ] Clear section headings

### 3.2 Form Fields
- [ ] Full name input
- [ ] Email input với validation
- [ ] Password input với strength indicator
- [ ] Confirm password input
- [ ] Terms & conditions checkbox
- [ ] All required fields marked

### 3.3 Password Strength
- [ ] Password strength indicator hiển thị
- [ ] Requirements list rõ ràng (min length, uppercase, etc.)
- [ ] Real-time feedback khi typing
- [ ] Color coding (red/yellow/green)

### 3.4 Validation
- [ ] Email format validation
- [ ] Password match validation
- [ ] Password strength validation
- [ ] Terms acceptance validation
- [ ] Error messages tiếng Việt

### 3.5 Responsive
#### Mobile (375px)
- [ ] Form fields stack vertically
- [ ] Input fields full width
- [ ] Password strength indicator visible
- [ ] Submit button prominent

#### Desktop (1280px)
- [ ] Form max-width hợp lý
- [ ] Two-column layout (nếu có)
- [ ] Side illustration/info (nếu có)

### 3.6 Vietnamese Support
- [ ] "Đăng ký" button text
- [ ] Field labels tiếng Việt
- [ ] Error messages tiếng Việt
- [ ] Terms & conditions tiếng Việt

---

## ❓ 4. QUESTIONS PAGE (/questions)

### 4.1 List Layout
- [ ] Questions list hiển thị rõ ràng
- [ ] Card/list view toggle (nếu có)
- [ ] Pagination hoặc infinite scroll
- [ ] Loading states

### 4.2 Question Cards
- [ ] Title rõ ràng
- [ ] Difficulty indicator
- [ ] Category/tags
- [ ] Stats (views, attempts, etc.)
- [ ] Action buttons (view, practice, etc.)

### 4.3 Filters & Search
- [ ] Search bar prominent
- [ ] Filter options rõ ràng
- [ ] Active filters hiển thị
- [ ] Clear filters button
- [ ] Filter results update real-time

### 4.4 Responsive
#### Mobile (375px)
- [ ] Cards stack vertically
- [ ] Filters collapse/drawer
- [ ] Search bar full width
- [ ] Touch-friendly buttons

#### Tablet (768px)
- [ ] 2-column grid
- [ ] Filters sidebar hoặc top bar
- [ ] Balanced layout

#### Desktop (1280px)
- [ ] 3-column grid hoặc list view
- [ ] Filters sidebar
- [ ] Optimal card size

### 4.5 Performance
- [ ] Images lazy load
- [ ] Smooth scrolling
- [ ] No layout shift
- [ ] Fast filter/search response

### 4.6 Vietnamese Support
- [ ] Question titles tiếng Việt
- [ ] Filter labels tiếng Việt
- [ ] Category names tiếng Việt
- [ ] Search placeholder tiếng Việt

---

## ℹ️ 5. ABOUT PAGE (/about)

### 5.1 Content Layout
- [ ] Hero section
- [ ] Mission/vision section
- [ ] Team section (nếu có)
- [ ] Timeline/history (nếu có)
- [ ] Contact CTA

### 5.2 Typography
- [ ] Heading hierarchy rõ ràng
- [ ] Body text readable (16px+)
- [ ] Line height comfortable (1.6-1.8)
- [ ] Paragraph spacing

### 5.3 Images & Media
- [ ] Team photos (nếu có)
- [ ] Company photos
- [ ] Images optimized
- [ ] Alt text present

### 5.4 Responsive
#### Mobile (375px)
- [ ] Single column layout
- [ ] Images full width
- [ ] Text readable
- [ ] Sections stack nicely

#### Desktop (1280px)
- [ ] Multi-column sections
- [ ] Images và text balanced
- [ ] Max-width cho readability

### 5.5 Vietnamese Support
- [ ] All content tiếng Việt
- [ ] Proper grammar và spelling
- [ ] Cultural appropriateness

---

## 🎨 6. GENERAL UI/UX CHECKS (Áp dụng cho tất cả pages)

### 6.1 Navigation
- [ ] Logo links về homepage
- [ ] Active page highlighted
- [ ] Dropdown menus hoạt động
- [ ] Mobile menu smooth animation
- [ ] Breadcrumbs (nếu có)

### 6.2 Footer
- [ ] Links hoạt động
- [ ] Social media icons
- [ ] Copyright info
- [ ] Contact info
- [ ] Sitemap links

### 6.3 Loading States
- [ ] Skeleton screens hoặc spinners
- [ ] Progress indicators
- [ ] Disabled states khi loading
- [ ] Error states

### 6.4 Error Handling
- [ ] 404 page design
- [ ] Error messages user-friendly
- [ ] Retry options
- [ ] Help/support links

### 6.5 Accessibility
- [ ] Keyboard navigation toàn bộ site
- [ ] Skip to content link
- [ ] ARIA labels
- [ ] Alt text cho images
- [ ] Color contrast đạt chuẩn

### 6.6 Performance
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.8s

---

## 📊 7. TESTING TOOLS & METHODS

### Browser DevTools
```
1. Mở DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test các breakpoints:
   - 375px (Mobile S)
   - 414px (Mobile L)
   - 768px (Tablet)
   - 1024px (Laptop)
   - 1280px (Desktop)
   - 1920px (Full HD)
4. Check Console cho errors
5. Check Network tab cho performance
```

### Lighthouse Audit
```
1. Mở DevTools > Lighthouse tab
2. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
3. Generate report
4. Review scores và recommendations
```

### Manual Testing
```
1. Click tất cả links
2. Submit tất cả forms
3. Test keyboard navigation (Tab, Enter, Esc)
4. Test với screen reader (NVDA/JAWS)
5. Test trên real devices (nếu có)
```

---

## 📝 GHI CHÚ VÀ PHÁT HIỆN

### Vấn Đề Tìm Thấy
_(Ghi chú các vấn đề phát hiện trong quá trình testing)_

#### Homepage (/)
- 

#### Login (/login)
- 

#### Register (/register)
- 

#### Questions (/questions)
- 

#### About (/about)
- 

### Đề Xuất Cải Thiện
_(Ghi chú các đề xuất để cải thiện UI/UX)_

1. 
2. 
3. 

---

**Trạng thái:** Checklist sẵn sàng để sử dụng  
**Cập nhật lần cuối:** 13/10/2025 22:10:00

