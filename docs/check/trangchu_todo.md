# TODO: Nâng cấp Homepage NyNus lên 10/10
**Ngày tạo**: 09/01/2025  
**Mục tiêu**: Nâng điểm UX/UI từ 7.2/10 lên 10/10  
**Dựa trên**: docs/check/trangchu.md  

---

## 🎯 **SPRINT 1: CRITICAL + HIGH PRIORITY** (Tuần 1)
**Mục tiêu**: Đạt 8.8-9.2/10

### **A. FIRST IMPRESSION & CLARITY**

#### ✅ **A1. Chuẩn hóa CTA và thông điệp**
**File**: `apps/frontend/src/lib/mockdata/homepage.ts`
```typescript
// THAY ĐỔI:
heroData.ctaButtons.primary.text: "NÂNG CẤP PRO MIỄN PHÍ" 
→ "BẮT ĐẦU HỌC MIỄN PHÍ"

heroData.subtitle: "Dễ dàng - Chính Xác - Thuận tiện"
→ "Nền tảng học toán trực tuyến được cá nhân hóa bởi AI"

heroData.stats.studentsText: "Chưa có ai đăng kí hết, đăng kí để làm chuột bạch nhé!"
→ "Hơn 1,200 học viên đã trải nghiệm học tập cùng NyNus"
```

#### ✅ **A2. Giảm tải above-the-fold**
**File**: `apps/frontend/src/components/features/home/hero.tsx`
- Giảm số lượng stars từ 50 → 25
- Giảm opacity waves từ 0.8/0.6/0.7/0.5/0.6 → 0.4/0.3/0.4/0.2/0.3
- Ẩn complex UI mockup trên mobile (< 768px)
- Tăng spacing giữa headline/subheadline/CTA

### **B. VISUAL DESIGN & HIERARCHY**

#### ✅ **B1. Contrast và overlay**
**File**: `apps/frontend/src/components/features/home/hero.tsx`
```typescript
// THÊM overlay cho text area:
<div className="absolute inset-0 bg-black/20 z-5"></div>

// Hoặc text-shadow mạnh hơn:
style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
```

#### ✅ **B2. Grid và spacing**
- Container max-width: 1200px
- Line-length cho paragraph: max-w-2xl (672px)
- Heading scale: H1(4xl) > H2(3xl) > H3(2xl)

### **C. NAVIGATION & IA**

#### ✅ **C1. Active state cho Navbar**
**File**: `apps/frontend/src/components/layout/navbar.tsx`
```typescript
// THÊM:
const pathname = usePathname();

// Trong nav items:
className={`... ${pathname === item.href ? 'text-white font-bold' : 'text-white/90'}`}
aria-current={pathname === item.href ? 'page' : undefined}
```

#### ✅ **C2. Focus-visible cho navigation**
**File**: `apps/frontend/src/components/layout/navbar.tsx`
```css
/* THÊM CSS: */
.focus-visible:focus {
  @apply ring-2 ring-white/50 ring-offset-2 ring-offset-transparent outline-none;
}
```

### **E. INTERACTION & STATES**

#### ✅ **E1. Focus states nhất quán**
**Files**: Hero, Navbar, SearchDropdown
```typescript
// THÊM aria-label cho icon-only buttons:
<Button aria-label="Mở tìm kiếm">
<Button aria-label="Menu điều hướng">
<Button aria-label="Tài khoản người dùng">
<Button aria-label="Phát video giới thiệu">
```

#### ✅ **E2. Modal accessibility**
**File**: `apps/frontend/src/components/features/home/hero.tsx`
```typescript
// Video Modal:
<div role="dialog" aria-modal="true" aria-labelledby="video-title">
  <h3 id="video-title">Video giới thiệu NyNus</h3>
  // Trap focus, ESC to close
</div>
```

### **H. ACCESSIBILITY (WCAG 2.1 AA)**

#### ✅ **H1. Semantic HTML và roles**
**File**: `apps/frontend/src/components/layout/search-dropdown.tsx`
```typescript
// THÊM:
<div role="dialog" aria-modal="true" aria-labelledby="search-title">
  <h3 id="search-title" className="sr-only">Tìm kiếm</h3>
  // Focus trap implementation
</div>
```

#### ✅ **H2. Alt text và ARIA labels**
- Tất cả decorative icons: `aria-hidden="true"`
- Images: alt text mô tả nội dung
- Form inputs: proper labels/aria-describedby

---

## 🎯 **SPRINT 2: MOBILE + PERFORMANCE** (Tuần 2)
**Mục tiêu**: Đạt 9.5/10

### **F. RESPONSIVE & MOBILE**

#### ✅ **F1. Touch targets và safe areas**
**File**: `apps/frontend/src/components/layout/navbar.tsx`
```typescript
// Tăng size buttons:
className="h-11 w-11" // từ h-9 w-9

// Safe areas cho iOS:
style={{ paddingTop: 'env(safe-area-inset-top)' }}
```

#### ✅ **F2. Ẩn animation nặng trên mobile**
**File**: `apps/frontend/src/components/features/home/hero.tsx`
```typescript
// Conditional rendering:
{!isMobile && (
  <motion.div className="complex-ui-mockup">
    // Heavy animations
  </motion.div>
)}
```

### **G. PERFORMANCE & LOADING**

#### ✅ **G1. Lazy loading và code splitting**
**File**: `apps/frontend/src/app/page.tsx`
```typescript
import dynamic from 'next/dynamic';

const AILearning = dynamic(() => import('@/components/features/home/ai-learning'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />
});

const FeaturedCourses = dynamic(() => import('@/components/features/home/featured-courses'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
});
```

#### ✅ **G2. Image optimization**
**File**: Featured courses components
```typescript
import Image from 'next/image';

<Image
  src={course.image}
  alt={course.title}
  width={400}
  height={240}
  priority={index < 3} // First 3 images
  className="object-cover"
/>
```

### **D. CONTENT & MICROCOPY**

#### ✅ **D1. Cụ thể hóa Features**
**File**: `apps/frontend/src/lib/mockdata/homepage.ts`
```typescript
// THÊM examples cho features:
featuresData.features[0].detailedDescription += "\nVí dụ: Phân tích điểm yếu Hình học, gợi ý 5 dạng bài cần luyện thêm"
```

---

## 🎯 **SPRINT 3: TRUST + ANALYTICS** (Tuần 3)
**Mục tiêu**: Đạt 10/10

### **I. SECURITY & TRUST**

#### ✅ **I1. Footer links đầy đủ**
**File**: `apps/frontend/src/components/layout/footer.tsx`
```typescript
// THÊM sections:
const footerLinks = {
  company: [
    { title: "Về NyNus", href: "/about" },
    { title: "Liên hệ", href: "/contact" },
    { title: "Tuyển dụng", href: "/careers" }
  ],
  legal: [
    { title: "Chính sách bảo mật", href: "/privacy" },
    { title: "Điều khoản sử dụng", href: "/terms" },
    { title: "Hỗ trợ", href: "/support" }
  ]
};
```

#### ✅ **I2. Social proof section**
**File**: Tạo `apps/frontend/src/components/features/home/testimonials.tsx`
```typescript
const testimonials = [
  {
    name: "Nguyễn Minh An",
    role: "Học sinh lớp 12",
    content: "NyNus giúp em cải thiện điểm Toán từ 6 lên 8.5 chỉ trong 3 tháng!",
    avatar: "/avatars/student-1.jpg"
  }
  // 2 testimonials nữa
];
```

### **J. ANALYTICS & MEASUREMENT**

#### ✅ **J1. Google Analytics 4**
**File**: `apps/frontend/src/lib/analytics.ts`
```typescript
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Events to track:
// - cta_click_start_learning
// - video_modal_open
// - search_submit
// - featured_course_click
```

#### ✅ **J2. Event tracking implementation**
**Files**: Hero, FeaturedCourses, SearchDropdown
```typescript
import { trackEvent } from '@/lib/analytics';

// Trong CTAs:
onClick={() => {
  trackEvent('cta_click_start_learning', {
    location: 'hero_section'
  });
}}
```

---

## 📋 **CHECKLIST HOÀN THÀNH**

### **Sprint 1 - Critical/High**
- [x] A1: Cập nhật CTA text và subtitle trong mockdata
- [x] A2: Giảm animation density trong Hero
- [x] B1: Thêm overlay/text-shadow cho contrast
- [x] B2: Chuẩn hóa spacing và typography scale
- [x] C1: Active state cho navigation
- [x] C2: Focus-visible styles
- [x] E1: Aria-labels cho icon buttons
- [x] E2: Modal accessibility (role, aria-modal)
- [x] H1: Search dropdown semantic HTML
- [x] H2: Alt text và ARIA labels

### **Sprint 2 - Mobile/Performance**
- [x] F1: Touch targets 44px+, safe areas
- [x] F2: Conditional rendering cho mobile
- [x] G1: Dynamic imports cho heavy components
- [x] G2: Next/Image optimization
- [x] D1: Feature examples trong mockdata

### **Sprint 3 - Trust/Analytics**
- [x] I1: Footer links đầy đủ
- [x] I2: Testimonials component
- [x] J1: GA4 setup và tracking utility
- [x] J2: Event tracking implementation

---

## 🧪 **TESTING CHECKLIST**

### **Accessibility Testing**
- [ ] axe DevTools: 0 critical/serious issues
- [ ] Keyboard navigation: Tab qua tất cả interactive elements
- [ ] Screen reader: NVDA/VoiceOver test
- [ ] Color contrast: ≥ 4.5:1 cho normal text

### **Performance Testing**
- [ ] Lighthouse: Performance ≥ 85, A11y ≥ 95
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Mobile PageSpeed Insights

### **Cross-browser Testing**
- [ ] Chrome, Firefox, Safari, Edge
- [ ] iOS Safari, Android Chrome
- [ ] Responsive: 320px, 768px, 1024px, 1440px

### **User Testing**
- [ ] 10-second test: User hiểu page purpose
- [ ] Navigation flow: Home → Courses → Back
- [ ] Search functionality
- [ ] CTA conversion path

---

## 📊 **SUCCESS METRICS**

**Trước (7.2/10)**:
- First Impression: 6/10
- Visual Design: 8/10  
- Navigation: 5/10
- Accessibility: 5/10

**Sau Sprint 1 (8.8/10)**:
- First Impression: 9/10
- Visual Design: 9/10
- Navigation: 8/10
- Accessibility: 9/10

**Sau Sprint 3 (10/10)**:
- Tất cả categories: 9-10/10
- Core Web Vitals: Green
- Accessibility: WCAG AA compliant

---

**Ước tính thời gian**: 3 tuần (1 tuần/sprint)  
**Người thực hiện**: Developer + UX review  
**Next review**: Sau mỗi sprint completion
