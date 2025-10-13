# Bundle Size Optimization Guide - NyNus Frontend
**Version**: 1.0.0  
**Last Updated**: 2025-01-19

---

## 📋 Overview

This document outlines the bundle optimization strategies implemented in NyNus Frontend and how to analyze and improve bundle size.

---

## 🔍 Bundle Analysis

### Run Bundle Analyzer

```bash
# Analyze production bundle
cd apps/frontend
pnpm build:analyze

# Or manually
ANALYZE=true pnpm build
```

### View Analysis Reports

After build completes, open:
- **Client bundle**: `apps/frontend/.next/analyze/client.html`
- **Server bundle**: `apps/frontend/.next/analyze/server.html`

### Turbopack Analysis

For Turbopack builds (faster):
```bash
pnpm build:fast
du -sh .next/static/chunks/
```

---

## ✅ Implemented Optimizations

### 1. Package Import Optimization

**Configuration**: `next.config.js`

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    'date-fns'
  ],
}
```

**Impact**: Reduces bundle size by tree-shaking unused icons and components.

---

### 2. Dynamic Imports

**Location**: `apps/frontend/src/lib/performance/dynamic-imports.tsx`

**Heavy Components**:
```typescript
// Monaco Editor - only load when needed
export const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

// Charts - lazy load
export const Chart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    loading: LoadingSkeleton,
    ssr: false
  }
);
```

**Usage**:
```typescript
import { MonacoEditor } from '@/lib/performance/dynamic-imports';

function CodeEditor() {
  return <MonacoEditor height="400px" language="latex" />;
}
```

---

### 3. Progressive Loading

**Home Page Components**:
```typescript
// Critical content - SSR enabled
export const HeroSection = dynamic(
  () => import('@/components/features/home/hero'),
  {
    loading: () => <div className="h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg" />,
    ssr: true
  }
);

// Non-critical - load after hero
export const FeaturedCourses = dynamic(
  () => import('@/components/features/home/featured-courses'),
  {
    loading: LoadingSkeleton,
    ssr: false
  }
);
```

---

### 4. Code Splitting

**Automatic Code Splitting**:
- Next.js automatically splits code by routes
- Each page gets its own bundle
- Shared code extracted to common chunks

**Manual Code Splitting**:
```typescript
// Load component only when visible
export const LazyComponent = loadComponentOnVisible(
  () => import('./HeavyComponent'),
  { threshold: 0.1 }
);
```

---

### 5. Image Optimization

**Configuration**: `next.config.js`

```javascript
images: {
  formats: ['image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  minimumCacheTTL: 60,
}
```

**Usage**:
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // For above-the-fold images
/>
```

---

## 📊 Bundle Size Targets

### Current Metrics (Baseline)

| Metric | Value | Target |
|--------|-------|--------|
| Total Bundle Size | 4.72MB | <5MB |
| Number of Chunks | 88 | <100 |
| Largest Chunk | ~500KB | <244KB |
| First Load JS | ~200KB | <170KB |

### Performance Budget

| Resource Type | Budget | Current |
|---------------|--------|---------|
| JavaScript | 170KB | ~200KB |
| CSS | 50KB | ~30KB |
| Images | 200KB | ~150KB |
| Fonts | 100KB | ~80KB |

---

## 🔧 Optimization Strategies

### 1. Identify Large Dependencies

```bash
# Analyze bundle
pnpm build:analyze

# Look for:
# - Large libraries (>100KB)
# - Duplicate dependencies
# - Unused code
```

### 2. Replace Heavy Libraries

**Before**:
```typescript
import moment from 'moment'; // 288KB
```

**After**:
```typescript
import { format } from 'date-fns'; // 13KB
```

### 3. Lazy Load Non-Critical Features

```typescript
// Admin features - only for admin users
const AdminPanel = dynamic(
  () => import('@/components/admin/admin-panel'),
  {
    loading: () => <div>Loading admin panel...</div>,
    ssr: false
  }
);

// Use conditionally
{user.role === 'admin' && <AdminPanel />}
```

### 4. Tree Shaking

**Ensure proper imports**:
```typescript
// ❌ BAD - imports entire library
import _ from 'lodash';

// ✅ GOOD - imports only what's needed
import debounce from 'lodash/debounce';
```

---

## 📈 Monitoring

### Build-time Analysis

```bash
# Check bundle size after each build
pnpm build
du -sh .next/static/chunks/

# Compare with previous builds
git diff HEAD~1 .next/build-manifest.json
```

### Runtime Monitoring

**Core Web Vitals**:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

**Tools**:
- Chrome DevTools > Lighthouse
- WebPageTest
- Google PageSpeed Insights

---

## 🚀 Best Practices

### 1. Component Design

```typescript
// ✅ GOOD - Small, focused components
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatar} alt={user.name} />;
}

// ❌ BAD - Large, monolithic components
function UserProfile() {
  // 500+ lines of code
}
```

### 2. Conditional Loading

```typescript
// Load heavy features only when needed
const [showEditor, setShowEditor] = useState(false);

{showEditor && <MonacoEditor />}
```

### 3. Prefetching

```typescript
import Link from 'next/link';

// Prefetch next page
<Link href="/dashboard" prefetch>
  Go to Dashboard
</Link>
```

---

## 🔍 Troubleshooting

### Issue: Bundle size increased after adding dependency

**Solution**:
1. Check dependency size: `npm install -g bundle-phobia-cli && bundle-phobia <package-name>`
2. Look for lighter alternatives
3. Use dynamic imports if needed

### Issue: Duplicate dependencies in bundle

**Solution**:
```bash
# Check for duplicates
pnpm dedupe

# Or manually in package.json
pnpm install
```

### Issue: Large chunks

**Solution**:
1. Split large components
2. Use dynamic imports
3. Check for circular dependencies: `pnpm madge --circular src/`

---

## 📚 References

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Phobia](https://bundlephobia.com/)

---

**Document Version**: 1.0.0  
**Maintained by**: NyNus Frontend Team  
**Next Review**: 2025-04-19

