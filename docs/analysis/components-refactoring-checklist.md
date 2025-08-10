# React Components Refactoring Checklist
*Theo dõi tiến độ khắc phục các vấn đề theo NyNus Clean Code Standards*

## 🔴 Critical Issues - Phase 1 (Week 1-2)

### Layout Components Refactoring

#### Navbar Component (`layout/navbar.tsx`)
- [ ] **Tách NavbarBrand component** (15-25 lines)
  - [ ] Extract logo và branding logic
  - [ ] Add proper TypeScript interface
  - [ ] Test responsive behavior

- [ ] **Tách NavbarNavigation component** (25-30 lines)
  - [ ] Extract navigation items logic
  - [ ] Add active state management
  - [ ] Implement keyboard navigation

- [ ] **Tách NavbarAuth component** (20-30 lines)
  - [ ] Extract authentication UI logic
  - [ ] Add user dropdown functionality
  - [ ] Handle login/logout states

- [ ] **Tách NavbarMobile component** (25-35 lines)
  - [ ] Extract mobile menu logic
  - [ ] Add hamburger menu animation
  - [ ] Implement touch gestures

- [ ] **Tách NavbarSearch component** (20-30 lines)
  - [ ] Extract search functionality
  - [ ] Add search suggestions
  - [ ] Implement search history

- [ ] **Tạo Navbar index component** (20-30 lines)
  - [ ] Compose all sub-components
  - [ ] Add responsive layout logic
  - [ ] Test integration

#### Footer Component (`layout/footer.tsx`)
- [ ] **Tách FooterNewsletter component** (25-35 lines)
  - [ ] Extract newsletter subscription logic
  - [ ] Add email validation với proper error handling
  - [ ] Implement success/error states với user feedback

- [ ] **Tách FooterLinks component** (30-40 lines)
  - [ ] Extract footer navigation links
  - [ ] Group links by categories (Sản phẩm, Hỗ trợ, Công ty)
  - [ ] Add hover animations và accessibility

- [ ] **Tách FooterSocial component** (20-25 lines)
  - [ ] Extract social media links
  - [ ] Add social icons với proper aria-labels
  - [ ] Implement external link handling

- [ ] **Tách FooterCompany component** (25-30 lines)
  - [ ] Extract company info và branding
  - [ ] Add language selector functionality
  - [ ] Handle company description và contact info

- [ ] **Tạo Footer index component** (20-30 lines)
  - [ ] Compose all sub-components
  - [ ] Add responsive layout logic
  - [ ] Test integration và accessibility

### Admin Components Refactoring

#### AdminBreadcrumb Component (`admin/breadcrumb/admin-breadcrumb.tsx`)
- [ ] **Fix parameter violations**
  - [ ] Convert 7 parameters to object parameter
  - [ ] Create BreadcrumbConfig interface
  - [ ] Update all usage sites

- [ ] **Simplify useMemo logic**
  - [ ] Extract breadcrumb generation to utility
  - [ ] Add unit tests for generation logic
  - [ ] Optimize performance

#### AdminSidebar Component (`features/admin/dashboard/admin-sidebar.tsx`)
- [ ] **Extract menu configuration** (Separate file)
  - [ ] Move menuItems array to `config/admin-menu.ts`
  - [ ] Add proper TypeScript interfaces cho menu items
  - [ ] Implement role-based menu filtering

- [ ] **Tách SidebarNavigation component** (30-40 lines)
  - [ ] Extract menu rendering logic
  - [ ] Add active state management với pathname detection
  - [ ] Implement collapsible menu groups
  - [ ] Add keyboard navigation support

- [ ] **Tách SidebarHeader component** (20-25 lines)
  - [ ] Extract sidebar toggle button
  - [ ] Add collapse/expand animations
  - [ ] Handle responsive behavior

- [ ] **Tách SidebarFooter component** (25-30 lines)
  - [ ] Extract theme toggle và logout functionality
  - [ ] Add user info display với avatar
  - [ ] Handle footer actions với proper error handling

### Features Components Refactoring

#### Home Features Component (`features/home/features.tsx`)
- [ ] **Refactor component architecture** (Tách thành 4-5 components)
  - [ ] Extract FeatureCard component (25-30 lines)
  - [ ] Extract FeatureGrid component (20-25 lines)
  - [ ] Extract FeatureTooltip component (15-20 lines)
  - [ ] Keep main Features component (30-40 lines)

- [ ] **FeatureCard component** (25-30 lines)
  - [ ] Extract individual feature rendering logic
  - [ ] Add proper hover animations với framer-motion
  - [ ] Implement click handlers với analytics tracking
  - [ ] Add accessibility attributes (aria-labels, roles)

- [ ] **FeatureGrid component** (20-25 lines)
  - [ ] Extract grid layout logic
  - [ ] Add responsive breakpoints
  - [ ] Handle loading states

- [ ] **FeatureTooltip component** (15-20 lines)
  - [ ] Extract tooltip positioning logic
  - [ ] Add mobile touch event handling
  - [ ] Implement auto-hide functionality

## 🟡 High Priority Issues - Phase 2 (Week 3-4)

### Error Handling Implementation

#### Add Error Boundaries
- [ ] **Wrap layout components**
  - [ ] Add ErrorBoundary to MainLayout
  - [ ] Add fallback UI components
  - [ ] Implement error reporting

- [ ] **Wrap feature components**
  - [ ] Add ErrorBoundary to each feature
  - [ ] Create feature-specific fallbacks
  - [ ] Add retry mechanisms

#### Implement Try-Catch Patterns
- [ ] **Newsletter subscription**
  - [ ] Add proper error handling
  - [ ] Show user-friendly messages
  - [ ] Log errors for debugging

- [ ] **Search functionality**
  - [ ] Handle search API errors
  - [ ] Add loading states
  - [ ] Implement retry logic

- [ ] **Authentication flows**
  - [ ] Handle login/logout errors
  - [ ] Add session timeout handling
  - [ ] Implement token refresh

### TypeScript Strict Mode Compliance

#### Fix Type Issues
- [ ] **Remove any types**
  - [ ] Replace with proper interfaces
  - [ ] Add generic type parameters
  - [ ] Update function signatures

- [ ] **Add missing interfaces**
  - [ ] Create component prop interfaces
  - [ ] Add event handler types
  - [ ] Define API response types

- [ ] **Fix import/export types**
  - [ ] Use type-only imports where needed
  - [ ] Export types from index files
  - [ ] Add proper type re-exports

### Naming Convention Standardization

#### Function Naming
- [ ] **Convert to consistent pattern**
  - [ ] Use function declarations for components
  - [ ] Use camelCase for handlers
  - [ ] Use PascalCase for components

- [ ] **Update export patterns**
  - [ ] Use named exports consistently
  - [ ] Update barrel export files
  - [ ] Fix import statements

## 🟢 Medium Priority Issues - Phase 3 (Week 5-6)

### Performance Optimization

#### Add React.memo (Performance optimization)
- [ ] **Memoize frequently re-rendered components**
  - [ ] FeatureCard components (prevent unnecessary re-renders)
  - [ ] AdminSidebar menu items (stable menu rendering)
  - [ ] Footer link groups (static content optimization)
  - [ ] NavbarNavigation items (stable navigation)

#### Add useCallback (Event handler optimization)
- [ ] **Memoize event handlers để prevent child re-renders**
  - [ ] Click handlers in FeatureCard components
  - [ ] Form submission handlers (newsletter, search)
  - [ ] Search input handlers với debouncing
  - [ ] Menu toggle handlers trong sidebar

#### Add useMemo (Calculation optimization)
- [ ] **Memoize expensive calculations**
  - [ ] Breadcrumb generation từ pathname
  - [ ] Menu item filtering based on user roles
  - [ ] Search results filtering và sorting
  - [ ] Theme-based CSS class calculations

### Accessibility Improvements

#### Add ARIA Labels (Screen reader support)
- [ ] **Navigation components accessibility**
  - [ ] Add aria-label to all nav items với descriptive text
  - [ ] Add aria-current="page" for active navigation items
  - [ ] Add aria-expanded for dropdown menus và mobile menu
  - [ ] Add aria-haspopup for menu triggers

#### Keyboard Navigation (Full keyboard support)
- [ ] **Implement comprehensive keyboard support**
  - [ ] Tab navigation for all interactive elements
  - [ ] Enter/Space activation for custom buttons
  - [ ] Arrow keys for menu navigation
  - [ ] Escape key for closing modals và dropdowns
  - [ ] Focus management trong modal dialogs

#### Screen Reader Support (Semantic HTML)
- [ ] **Add proper semantic structure**
  - [ ] Use proper heading hierarchy (h1 → h2 → h3)
  - [ ] Add landmark roles (navigation, main, complementary)
  - [ ] Add skip links for main content
  - [ ] Use semantic HTML elements (nav, main, aside, footer)

### Code Organization

#### File Structure Cleanup
- [ ] **Organize by feature**
  - [ ] Group related components
  - [ ] Create feature-specific folders
  - [ ] Update import paths

#### Barrel Export Optimization
- [ ] **Optimize index files**
  - [ ] Remove unused exports
  - [ ] Add proper type exports
  - [ ] Group related exports

## 🔵 Low Priority Issues - Phase 4 (Week 7-8)

### Documentation

#### Add JSDoc Comments
- [ ] **Component documentation**
  - [ ] Add component descriptions
  - [ ] Document prop interfaces
  - [ ] Add usage examples

#### Add README Files
- [ ] **Feature documentation**
  - [ ] Create feature READMEs
  - [ ] Add component guides
  - [ ] Include best practices

### Code Style Consistency

#### Formatting
- [ ] **Consistent code style**
  - [ ] Run Prettier on all files
  - [ ] Fix ESLint warnings
  - [ ] Update formatting rules

#### Import Organization
- [ ] **Organize imports**
  - [ ] Group by type (React, libraries, local)
  - [ ] Sort alphabetically
  - [ ] Remove unused imports

## 📊 Progress Tracking

### Completion Status (Cập nhật)
- **Phase 1 (Critical)**: 0/28 tasks completed (0%)
- **Phase 2 (High)**: 0/18 tasks completed (0%)
- **Phase 3 (Medium)**: 0/16 tasks completed (0%)
- **Phase 4 (Low)**: 0/10 tasks completed (0%)

### Overall Progress: 0/72 tasks completed (0%)

### Weekly Goals (Chi tiết hơn)
- **Week 1**: Complete Navbar refactoring (6 components) + Start Footer
- **Week 2**: Complete Footer refactoring (4 components) + Admin components
- **Week 3**: Error handling implementation + TypeScript fixes
- **Week 4**: Complete TypeScript compliance + Naming conventions
- **Week 5**: Performance optimization (memo, callback, useMemo)
- **Week 6**: Accessibility improvements (ARIA, keyboard, semantic HTML)
- **Week 7**: Documentation + Code organization cleanup
- **Week 8**: Final testing, cleanup và performance validation

## 🎯 Success Criteria

### Code Quality Metrics
- [ ] All components < 100 lines
- [ ] All functions < 50 lines (khuyến khích 20-30 lines)
- [ ] All functions < 4 parameters
- [ ] No nesting > 3 levels
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] 90%+ test coverage

### Performance Metrics
- [ ] Lighthouse score > 90
- [ ] Bundle size < 500KB
- [ ] First paint < 1s
- [ ] Interactive < 2s

### Accessibility Metrics
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation 100%
- [ ] Screen reader compatible
- [ ] Color contrast > 4.5:1

## ⏱️ Task Estimation (Ước tính thời gian)

### Phase 1 - Critical Issues (Week 1-2)
| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Navbar refactoring (6 components) | 12-16 hours | Medium |
| Footer refactoring (4 components) | 8-12 hours | Medium |
| AdminSidebar refactoring | 6-8 hours | Medium |
| AdminBreadcrumb parameter fix | 2-4 hours | Low |
| **Total Phase 1** | **28-40 hours** | **2-3 weeks** |

### Phase 2 - High Priority (Week 3-4)
| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Error handling implementation | 8-12 hours | Medium |
| TypeScript strict compliance | 6-10 hours | Medium |
| Naming convention fixes | 4-6 hours | Low |
| **Total Phase 2** | **18-28 hours** | **2-3 weeks** |

### Phase 3 - Medium Priority (Week 5-6)
| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Performance optimization | 8-12 hours | Medium |
| Accessibility improvements | 10-14 hours | High |
| Code organization | 4-6 hours | Low |
| **Total Phase 3** | **22-32 hours** | **2-3 weeks** |

### Phase 4 - Low Priority (Week 7-8)
| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Documentation writing | 6-8 hours | Low |
| Code style consistency | 2-4 hours | Low |
| Final testing & cleanup | 4-6 hours | Medium |
| **Total Phase 4** | **12-18 hours** | **1-2 weeks** |

### 📊 Total Project Estimation
- **Total Time**: 80-118 hours
- **Total Duration**: 8-10 weeks
- **Team Size**: 1-2 developers
- **Risk Buffer**: 20% (add 2 weeks for unexpected issues)

## 🎯 Priority Matrix

### Must Have (Week 1-4)
- ✅ Navbar & Footer refactoring
- ✅ Error handling
- ✅ TypeScript compliance

### Should Have (Week 5-6)
- ✅ Performance optimization
- ✅ Basic accessibility

### Could Have (Week 7-8)
- ✅ Advanced accessibility
- ✅ Comprehensive documentation

### Won't Have (This iteration)
- ❌ Complete redesign
- ❌ New feature development
- ❌ Backend refactoring

---

*Checklist được cập nhật: 2025-01-09*
*Tiến độ sẽ được cập nhật hàng tuần*
*Estimation dựa trên developer experience level: Mid-Senior*
