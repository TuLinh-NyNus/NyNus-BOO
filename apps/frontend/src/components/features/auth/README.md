# User Display System - NyNus

## Tổng quan

Hệ thống User Display System cung cấp các components để hiển thị thông tin người dùng một cách nhất quán và responsive trong toàn bộ ứng dụng NyNus.

## Components

### 1. UserDisplay

Component chính để hiển thị thông tin user với nhiều variants khác nhau.

#### Props

```typescript
interface UserDisplayProps {
  user: User;                          // User data object
  variant?: 'compact' | 'full' | 'dropdown-trigger' | 'card';
  size?: 'sm' | 'md' | 'lg';          // Component size
  showRole?: boolean;                  // Show role badge
  showLevel?: boolean;                 // Show level indicator
  showAvatar?: boolean;                // Show user avatar
  showNotificationBadge?: boolean;     // Show notification badge
  notificationCount?: number;          // Notification count
  onClick?: () => void;                // Click handler
  isLoading?: boolean;                 // Loading state
  className?: string;                  // Additional CSS classes
  ariaLabel?: string;                  // ARIA label for accessibility
}
```

#### Variants

- **compact**: Chỉ hiển thị avatar và notification badge
- **full**: Hiển thị đầy đủ thông tin (avatar, name, email, role, level)
- **dropdown-trigger**: Dành cho dropdown menu trigger (avatar, name, role, chevron)
- **card**: Layout dạng card với thông tin đầy đủ

#### Usage Examples

```tsx
// Compact variant
<UserDisplay
  user={user}
  variant="compact"
  size="sm"
  showNotificationBadge={true}
  notificationCount={5}
/>

// Dropdown trigger
<UserDisplay
  user={user}
  variant="dropdown-trigger"
  size="md"
  onClick={() => setMenuOpen(true)}
  showNotificationBadge={true}
  notificationCount={3}
/>

// Full display
<UserDisplay
  user={user}
  variant="full"
  size="lg"
  showRole={true}
  showLevel={true}
/>
```

### 2. NotificationBadge

Component hiển thị số lượng notification với animation.

#### Props

```typescript
interface NotificationBadgeProps {
  count: number;                       // Số lượng notification
  showZero?: boolean;                  // Hiển thị khi count = 0
  maxCount?: number;                   // Số tối đa (default: 99)
  size?: 'sm' | 'md' | 'lg';          // Kích thước
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  animate?: boolean;                   // Animation khi thay đổi
  pulse?: boolean;                     // Pulse animation
  onClick?: () => void;                // Click handler
}
```

#### Usage

```tsx
<NotificationBadge 
  count={12} 
  size="md" 
  variant="destructive"
  animate={true}
  onClick={() => openNotifications()}
/>
```

### 3. UserMenu (Enhanced)

Component dropdown menu cho user với UserDisplay integration.

#### Features

- ✅ Sử dụng UserDisplay component
- ✅ Notification badge integration
- ✅ Vietnamese role labels
- ✅ Level indicator
- ✅ Responsive design
- ✅ Accessibility support
- ✅ Loading states

#### Usage

```tsx
<UserMenu
  onProfileClick={() => navigate('/profile')}
  onSettingsClick={() => navigate('/settings')}
  onLogoutClick={() => logout()}
  variant="default"
/>
```

## Type System

### User Role System

```typescript
// Protobuf roles
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0,
  USER_ROLE_GUEST = 1,
  USER_ROLE_STUDENT = 2,
  USER_ROLE_TUTOR = 3,
  USER_ROLE_TEACHER = 4,
  USER_ROLE_ADMIN = 5
}

// Vietnamese labels
const ROLE_LABELS = {
  [UserRole.USER_ROLE_GUEST]: "Khách",
  [UserRole.USER_ROLE_STUDENT]: "Học viên",
  [UserRole.USER_ROLE_TUTOR]: "Trợ giảng",
  [UserRole.USER_ROLE_TEACHER]: "Giảng viên",
  [UserRole.USER_ROLE_ADMIN]: "Quản trị viên"
};
```

### User Level System

- **Level Range**: 1-12 (school grades)
- **School Levels**: 
  - Tiểu học (1-5)
  - THCS (6-9) 
  - THPT (10-12)
- **Colors**: green (1-3), blue (4-6), purple (7-9), orange (10-12)

## Utilities

### Type Converters

```typescript
// Get Vietnamese role label
getProtobufRoleLabel(role: UserRole): string

// Get role color
getProtobufRoleColor(role: UserRole): string

// Get status label
getProtobufStatusLabel(status: UserStatus): string

// Get status color
getProtobufStatusColor(status: UserStatus): string
```

## Accessibility

### ARIA Support

- Proper ARIA labels for screen readers
- Role attributes for semantic meaning
- Live regions for dynamic content updates
- Keyboard navigation support

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dropdowns and modals
- **Arrow Keys**: Navigate within menus

## Performance

### Optimizations

- React.memo for component memoization
- useMemo for expensive computations
- useCallback for event handlers
- Lazy loading for large components

### Bundle Size

- Tree-shaking friendly exports
- Minimal dependencies
- Optimized icon usage
- CSS-in-JS with minimal runtime

## Testing

### Test Coverage

- Unit tests: 90%+ coverage
- Integration tests: API mocking
- E2E tests: User workflows
- Accessibility tests: WCAG compliance

### Test Files

```
tests/
├── unit/
│   ├── UserDisplay.test.tsx
│   ├── NotificationBadge.test.tsx
│   └── UserMenu.test.tsx
├── integration/
│   └── user-display-integration.test.tsx
└── e2e/
    └── user-menu-workflow.spec.ts
```

## Migration Guide

### From Old UserMenu

```tsx
// Before
<div className="user-info">
  <img src={user.avatar} />
  <span>{user.name}</span>
  <span>{user.role}</span>
</div>

// After
<UserDisplay
  user={user}
  variant="full"
  size="md"
  showRole={true}
  showAvatar={true}
/>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow NyNus coding standards
2. Add TypeScript types for all props
3. Include accessibility attributes
4. Write comprehensive tests
5. Update documentation

## Changelog

### v2.0.0 (Current)
- ✅ Enhanced UserDisplay component
- ✅ NotificationBadge integration
- ✅ Improved UserMenu with UserDisplay
- ✅ Vietnamese role labels
- ✅ Level indicator system
- ✅ Comprehensive accessibility
- ✅ Performance optimizations

### v1.0.0
- Basic UserMenu component
- Simple avatar display
- Basic role display
