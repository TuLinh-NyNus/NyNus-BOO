# Theme Update Implementation Plan - NyNus
**Created**: 2025-01-19
**Status**: DETAILED IMPLEMENTATION PLAN

## 📊 EXECUTIVE SUMMARY

Kế hoạch chi tiết để cập nhật theme và design system cho toàn bộ pages trong NyNus Exam Bank System, đảm bảo consistency với homepage design.

**Total Effort**: 80 hours (6 weeks)
**Team Size**: 1-2 developers
**Priority**: HIGH

---

## 1. DESIGN SYSTEM FOUNDATION

### 1.1 Create Design Tokens Package (4 hours)

#### File Structure
```
packages/design-system/
├── src/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── animations.ts
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### Implementation Details

**colors.ts** (1h)
```typescript
export const colors = {
  // Light Mode
  light: {
    // Backgrounds
    bg: '#FDF2F8',           // Very light pink
    surface: '#F6EADE',      // Beige pastel
    muted: '#F9DDD2',        // Peach pastel
    secondaryBg: '#FBCFD0',  // Pink pastel
    
    // Text
    navy: '#1A1A2E',         // Dark text
    gray: '#2D3748',         // Secondary text
    mediumGray: '#4A5568',   // Muted text
    
    // Accents
    primary: '#6366F1',      // Indigo
    accent: '#8B5CF6',       // Purple
    secondary: '#EC4899',    // Pink
    
    // Semantic
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6'          // Blue
  },
  
  // Dark Mode
  dark: {
    // Backgrounds
    bg: '#1F1F46',           // Deep navy
    surface: '#2A2A5E',      // Navy surface
    surfaceHover: '#353570', // Hover state
    
    // Text
    text: '#E5E7EB',         // Light gray
    textMuted: '#9CA3AF',    // Muted text
    
    // Accents (brighter for dark mode)
    primary: '#818CF8',      // Brighter indigo
    accent: '#A78BFA',       // Brighter purple
    secondary: '#F472B6',    // Brighter pink
    
    // Semantic
    success: '#34D399',      // Brighter green
    warning: '#FBBF24',      // Brighter amber
    error: '#F87171',        // Brighter red
    info: '#60A5FA'          // Brighter blue
  },
  
  // Gradients
  gradients: {
    hero: 'linear-gradient(to bottom, #4417DB, #E57885, #F18582)',
    text: 'linear-gradient(to right, #60A5FA, #A78BFA, #F472B6)',
    card: {
      learning: 'linear-gradient(to-br, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))',
      practice: 'linear-gradient(to-br, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))',
      achievement: 'linear-gradient(to-br, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.3))',
      video: 'linear-gradient(to-br, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))'
    }
  }
};
```

**typography.ts** (1h)
```typescript
export const typography = {
  fontFamily: {
    sans: "Inter, 'Segoe UI', system-ui, sans-serif",
    mono: "'Fira Code', 'Courier New', monospace"
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem'    // 60px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.75
  },
  
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em'
  }
};
```

**spacing.ts** (0.5h)
```typescript
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem'      // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px'
};
```

**shadows.ts** (0.5h)
```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};
```

**animations.ts** (1h)
```typescript
export const animations = {
  // Framer Motion Variants
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.5 }
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // CSS Transitions
  transition: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  },
  
  // Keyframes
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 }
  },
  
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' }
  }
};
```

---

## 2. COMPONENT STANDARDIZATION

### 2.1 Reusable Components (8 hours)

#### Card Component (2h)
```typescript
// File: packages/design-system/src/components/Card.tsx
import { motion } from 'framer-motion';
import { colors, spacing, borderRadius, shadows } from '../tokens';

interface CardProps {
  variant?: 'default' | 'learning' | 'practice' | 'achievement' | 'video';
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ variant = 'default', children, className, hoverable = true }: CardProps) {
  const gradientMap = {
    default: 'bg-surface',
    learning: colors.gradients.card.learning,
    practice: colors.gradients.card.practice,
    achievement: colors.gradients.card.achievement,
    video: colors.gradients.card.video
  };
  
  return (
    <motion.div
      className={`p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${className}`}
      style={{
        background: variant === 'default' ? undefined : gradientMap[variant],
        borderRadius: borderRadius.xl,
        boxShadow: shadows.md
      }}
      whileHover={hoverable ? { y: -4, boxShadow: shadows.xl } : undefined}
    >
      {children}
    </motion.div>
  );
}
```

#### Button Component (2h)
```typescript
// File: packages/design-system/src/components/Button.tsx
import { motion } from 'framer-motion';
import { colors, spacing, borderRadius } from '../tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false,
  className 
}: ButtonProps) {
  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantMap = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10'
  };
  
  return (
    <motion.button
      className={`${sizeMap[size]} ${variantMap[variant]} rounded-lg font-medium transition-all ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
```

#### Badge Component (1h)
```typescript
// File: packages/design-system/src/components/Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantMap = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

#### Section Header Component (2h)
```typescript
// File: packages/design-system/src/components/SectionHeader.tsx
import { motion } from 'framer-motion';
import { animations } from '../tokens';

interface SectionHeaderProps {
  badge?: { icon: string; text: string };
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export function SectionHeader({ badge, title, subtitle, align = 'center' }: SectionHeaderProps) {
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <motion.div
      className={`mb-12 lg:mb-16 ${alignMap[align]}`}
      {...animations.slideUp}
    >
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <span>{badge.icon}</span>
          <span className="text-sm font-medium">{badge.text}</span>
        </div>
      )}
      
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
```

#### Loading Skeleton Component (1h)
```typescript
// File: packages/design-system/src/components/Skeleton.tsx
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button';
  className?: string;
}

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  const variantMap = {
    text: 'h-4 w-full rounded',
    card: 'h-64 w-full rounded-2xl',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-32 rounded-lg'
  };
  
  return (
    <motion.div
      className={`bg-muted ${variantMap[variant]} ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    />
  );
}
```

---

## 3. PAGE-SPECIFIC UPDATES

### 3.1 Admin Pages Theme Update (8 hours)

**Scope**: 30+ admin pages in `/3141592654/admin/`

**Changes Required**:
1. Replace hardcoded purple theme with design tokens
2. Standardize card layouts using Card component
3. Unify button styles using Button component
4. Consistent spacing using spacing tokens
5. Add loading states using Skeleton component

**Example Update**:
```typescript
// Before (hardcoded colors)
<div className="bg-purple-900 p-6 rounded-lg">
  <h3 className="text-white text-xl font-bold">Dashboard</h3>
</div>

// After (design tokens)
import { Card, SectionHeader } from '@nynus/design-system';

<Card variant="default">
  <SectionHeader 
    title="Dashboard" 
    align="left"
  />
</Card>
```

**Files to Update** (8h):
- Admin Dashboard: `/3141592654/admin/page.tsx` (1h)
- Users Management: `/3141592654/admin/users/**/*.tsx` (1h)
- Books Management: `/3141592654/admin/books/**/*.tsx` (1h)
- Exams Management: `/3141592654/admin/exams/**/*.tsx` (1h)
- Courses Management: `/3141592654/admin/courses/**/*.tsx` (1h)
- Questions Management: `/3141592654/admin/questions/**/*.tsx` (1h)
- Other Admin Pages: `/3141592654/admin/**/*.tsx` (2h)

---

**Continued in THEME_UPDATE_PLAN_PART2.md...**

