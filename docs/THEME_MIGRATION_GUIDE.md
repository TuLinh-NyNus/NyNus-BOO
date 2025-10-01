# NyNus Theme System - Migration Guide
**Version**: 2.0  
**Date**: 2025-01-19  
**Status**: ✅ Production Ready

---

## 📋 Overview

This guide helps you migrate from the old theme system to the new unified theme system in NyNus.

### What Changed?

1. **Storage Key**: `theme` → `nynus-theme`
2. **Theme Management**: Custom logic → `next-themes`
3. **Theme Toggle Components**: Multiple components → `UnifiedThemeToggle`

---

## 🔄 For End Users

### Automatic Migration

The system will automatically migrate your theme preference:

1. Open the application
2. Your previous theme preference will be preserved
3. No action needed!

### Manual Migration (if needed)

If you experience theme issues:

1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Find `theme` key with value `light` or `dark`
4. Delete the `theme` key
5. Refresh the page
6. Your theme will auto-migrate to `nynus-theme`

---

## 👨‍💻 For Developers

### 1. Update Theme Toggle Components

#### ❌ Old Code (Deprecated)

```typescript
// Using old ThemeToggle
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';

export function Navbar() {
  return (
    <nav>
      <ThemeToggle isScrolled={true} />
    </nav>
  );
}
```

```typescript
// Using old ThemeSwitch
import ThemeSwitch from '@/components/ui/theme/theme-switch';

export function Sidebar() {
  return (
    <aside>
      <ThemeSwitch />
    </aside>
  );
}
```

#### ✅ New Code (Recommended)

```typescript
// Using UnifiedThemeToggle
import { UnifiedThemeToggle } from '@/components/ui/theme';

export function Navbar() {
  return (
    <nav>
      <UnifiedThemeToggle variant="ghost" size="md" />
    </nav>
  );
}
```

```typescript
// Using UnifiedThemeToggle with label
import { UnifiedThemeToggle } from '@/components/ui/theme';

export function Sidebar() {
  return (
    <aside>
      <UnifiedThemeToggle 
        variant="default" 
        size="md" 
        showLabel={true}
        labelPosition="right"
      />
    </aside>
  );
}
```

### 2. Update Custom Theme Logic

#### ❌ Old Code (Deprecated)

```typescript
// Custom theme management
import { useState, useEffect } from 'react';

export function MyComponent() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

#### ✅ New Code (Recommended)

```typescript
// Using next-themes
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### 3. Update Theme Detection

#### ❌ Old Code (Deprecated)

```typescript
// Manual theme detection
const isDark = document.documentElement.classList.contains('dark');
const theme = localStorage.getItem('theme') || 'light';
```

#### ✅ New Code (Recommended)

```typescript
// Using next-themes hook
import { useTheme } from 'next-themes';

const { theme, resolvedTheme } = useTheme();
// theme: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (actual applied theme)
```

---

## 🎨 UnifiedThemeToggle Props

### Available Props

```typescript
interface UnifiedThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  showLabel?: boolean;
  labelPosition?: 'left' | 'right';
  iconType?: 'radix' | 'lucide';
}
```

### Usage Examples

```typescript
// Basic usage
<UnifiedThemeToggle />

// With custom size and variant
<UnifiedThemeToggle variant="ghost" size="lg" />

// With label
<UnifiedThemeToggle 
  showLabel={true} 
  labelPosition="right" 
  variant="outline"
/>

// With Radix icons
<UnifiedThemeToggle iconType="radix" variant="default" />

// Custom styling
<UnifiedThemeToggle 
  className="my-custom-class" 
  variant="ghost"
/>
```

---

## 🔧 Breaking Changes

### 1. localStorage Key Changed

**Before**: `localStorage.getItem('theme')`  
**After**: `localStorage.getItem('nynus-theme')`

**Impact**: Users will need to re-select their theme preference once.

**Migration**: Automatic migration script runs on first load.

### 2. Admin Theme Toggle

**Before**: Custom theme toggle with manual DOM manipulation  
**After**: Uses `next-themes` for unified theme management

**Impact**: Admin panel theme now syncs with public pages.

### 3. Removed Components

The following components are deprecated and will be removed in v2.0:

- `apps/frontend/src/components/ui/theme/theme-toggle.tsx`
- `apps/frontend/src/components/ui/theme/theme-switch.tsx`
- `apps/frontend/src/components/admin/theme/theme-toggle.tsx` (old version)

**Migration**: Replace all usages with `UnifiedThemeToggle`.

---

## 📚 Additional Resources

### Documentation

- **Architecture**: `docs/arch/THEME_SYSTEM_OPTIMAL_SOLUTION.md`
- **Implementation Checklist**: `docs/checklist/theme-implementation-final.md`
- **Color Token Reference**: `docs/theme-color-reference.md` (to be created)

### Code Examples

- **UnifiedThemeToggle**: `apps/frontend/src/components/ui/theme/unified-theme-toggle.tsx`
- **Theme Preloader**: `apps/frontend/src/lib/theme-preloader.ts`
- **App Providers**: `apps/frontend/src/providers/app-providers.tsx`

---

## ❓ FAQ

### Q: Will my theme preference be lost?

**A**: No, the system automatically migrates your preference from `theme` to `nynus-theme`.

### Q: Can I still use the old ThemeToggle component?

**A**: Yes, but it's deprecated and will be removed in v2.0. Please migrate to `UnifiedThemeToggle`.

### Q: How do I test the new theme system?

**A**: 
1. Start dev server: `pnpm dev`
2. Open http://localhost:3000
3. Toggle theme using the theme button
4. Verify theme persists across page navigation

### Q: What if I encounter issues?

**A**: 
1. Clear browser cache and localStorage
2. Check browser console for errors
3. Verify you're using `UnifiedThemeToggle`
4. Check that `storageKey="nynus-theme"` in ThemeProvider

---

## 🚀 Next Steps

1. ✅ Update all theme toggle components to `UnifiedThemeToggle`
2. ✅ Remove custom theme management logic
3. ✅ Test theme switching on all pages
4. ✅ Verify theme persistence
5. ✅ Check system preference sync

---

**Migration Complete!** 🎉

Your theme system is now unified, performant, and maintainable.

---

**Created by**: Augment AI Agent  
**Methodology**: RIPER-5 Implementation  
**Last Updated**: 2025-01-19

