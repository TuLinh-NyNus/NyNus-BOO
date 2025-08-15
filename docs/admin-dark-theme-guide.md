# Admin Dark Theme Guide
## Hướng dẫn sử dụng Dark Theme cho Admin Panel

### Tổng quan
Dark theme đã được tối ưu hóa cho admin panel với:
- **Contrast cao**: Dễ đọc trong thời gian dài
- **Màu sắc tối ưu**: Giảm mỏi mắt
- **Component styling**: Tất cả component đã được tối ưu

### Cách sử dụng

#### 1. Áp dụng Dark Theme cho trang Admin
```tsx
import { DarkThemeProvider } from '@/components/admin/ui';

export default function AdminPage() {
  return (
    <DarkThemeProvider>
      {/* Nội dung admin page */}
    </DarkThemeProvider>
  );
}
```

#### 2. Sử dụng Enhanced Admin Components
```tsx
import {
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  AdminButton,
  AdminBadge,
  AdminText
} from '@/components/admin/ui';

export function AdminUserCard() {
  return (
    <AdminCard>
      <AdminCardHeader>
        <AdminCardTitle>Quản lý người dùng</AdminCardTitle>
      </AdminCardHeader>
      <AdminCardContent>
        <AdminText variant="primary">
          Danh sách người dùng trong hệ thống
        </AdminText>
        <AdminButton adminVariant="primary">
          Thêm người dùng
        </AdminButton>
        <AdminBadge adminVariant="success">
          Hoạt động
        </AdminBadge>
      </AdminCardContent>
    </AdminCard>
  );
}
```

### Màu sắc Available

#### Badge Variants
- `default`: Màu xanh chính
- `success`: Màu xanh lá (thành công)
- `warning`: Màu cam (cảnh báo)
- `error`: Màu đỏ (lỗi)
- `secondary`: Màu xám (phụ)

#### Button Variants
- `primary`: Button chính (màu xanh)
- `secondary`: Button phụ (màu xám)

#### Text Variants
- `primary`: Text chính (trắng sáng)
- `secondary`: Text phụ (xám sáng)
- `muted`: Text mờ (xám nhạt)

#### Icon Variants
- `primary`: Icon chính
- `secondary`: Icon phụ
- `muted`: Icon mờ
- `accent`: Icon nhấn mạnh

### CSS Classes Available

#### Utility Classes
```css
.admin-panel          /* Container chính */
.admin-card           /* Card styling */
.admin-button-primary /* Button chính */
.admin-badge-success  /* Badge thành công */
.admin-text-primary   /* Text chính */
.admin-icon-accent    /* Icon nhấn mạnh */
```

#### Table Classes
```css
.admin-table          /* Table container */
.admin-table-header   /* Table header */
.admin-table-row      /* Table row */
.admin-table-cell     /* Table cell */
```

### Tùy chỉnh màu sắc

#### CSS Variables
```css
:root {
  --admin-text-primary: #F7FAFC;
  --admin-text-secondary: #E2E8F0;
  --admin-text-muted: #A0AEC0;
  --admin-bg-primary: #0A0E1A;
  --admin-bg-secondary: #1A202C;
  --admin-bg-tertiary: #2D3748;
  --admin-border: #4A5568;
  --admin-accent: #4299E1;
}
```

### Best Practices

1. **Luôn sử dụng DarkThemeProvider** cho admin pages
2. **Ưu tiên Enhanced Components** thay vì component gốc
3. **Sử dụng semantic variants** (success, warning, error)
4. **Test contrast** trên nhiều màn hình khác nhau
5. **Consistent spacing** với Tailwind classes

### Troubleshooting

#### Vấn đề: Màu sắc không hiển thị đúng
**Giải pháp**: Đảm bảo đã wrap component trong `DarkThemeProvider`

#### Vấn đề: Component không có styling admin
**Giải pháp**: Sử dụng Enhanced Admin Components thay vì component gốc

#### Vấn đề: Text khó đọc
**Giải pháp**: Sử dụng `AdminText` với variant phù hợp

### Testing Colors

#### Color Test Component
```tsx
import { ColorTest } from '@/components/admin/test/color-test';

// Sử dụng trong page để test màu sắc
<DarkThemeProvider>
  <ColorTest />
</DarkThemeProvider>
```

### Vấn đề đã sửa

#### ✅ Text màu đen bị chìm
- **Vấn đề**: `text-gray-900`, `text-gray-500` không hiển thị trên dark theme
- **Giải pháp**: Thay bằng `text-foreground`, `text-muted-foreground`

#### ✅ Box người dùng cuối bị che mất
- **Vấn đề**: Container height không đủ, overflow không được xử lý
- **Giải pháp**: Thêm `maxHeight: '80vh'`, custom scrollbar styling

#### ✅ Badge colors không phù hợp
- **Vấn đề**: Hardcoded colors không tương thích dark theme
- **Giải pháp**: Thêm dark theme variants cho tất cả badge colors

### Files liên quan
- `apps/frontend/src/styles/admin-dark-theme.css`
- `apps/frontend/src/components/admin/theme/dark-theme-provider.tsx`
- `apps/frontend/src/components/admin/ui/enhanced-components.tsx`
- `apps/frontend/src/components/admin/test/color-test.tsx`
- `apps/frontend/src/styles/theme/themes/dark.css`
- `apps/frontend/src/styles/theme/tokens/colors.css`
- `apps/frontend/src/components/user-management/table/virtualized-user-table.tsx`
- `apps/frontend/src/components/features/admin/user-management/virtualized-user-table.tsx`
