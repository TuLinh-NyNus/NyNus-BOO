# Theme Update Implementation Plan - Part 2
**Created**: 2025-01-19
**Continuation of**: THEME_UPDATE_PLAN.md

## 3.2 Questions Pages Theme Update (4 hours)

**Scope**: 4 pages in `/questions/`

**Changes Required**:
1. Apply homepage gradient patterns
2. Use semantic color schemes (learning, practice, achievement)
3. Standardize typography using typography tokens
4. Add hover animations using animation tokens
5. Implement Card component for question cards

**Example Update**:
```typescript
// Before (hardcoded styles)
<div className="bg-white p-4 rounded shadow hover:shadow-lg">
  <h3 className="text-lg font-bold text-gray-900">{question.title}</h3>
  <p className="text-gray-600">{question.description}</p>
</div>

// After (design system)
import { Card, Badge } from '@nynus/design-system';
import { animations } from '@nynus/design-system/tokens';

<motion.div {...animations.fadeIn}>
  <Card variant="learning" hoverable>
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-xl font-semibold">{question.title}</h3>
      <Badge variant="info">{question.difficulty}</Badge>
    </div>
    <p className="text-foreground/80">{question.description}</p>
  </Card>
</motion.div>
```

**Files to Update** (4h):
- Questions List: `/questions/page.tsx` (1h)
- Browse Questions: `/questions/browse/page.tsx` (1h)
- Search Questions: `/questions/search/page.tsx` (1h)
- Question Detail: `/questions/[id]/page.tsx` (1h)

---

## 3.3 Exam Pages Theme Update (4 hours)

**Scope**: 10 pages in `/exams/`

**Changes Required**:
1. Consistent card layouts using Card component
2. Unified button styles using Button component
3. Standardized spacing using spacing tokens
4. Add loading states using Skeleton component
5. Implement progress indicators with consistent styling

**Example Update**:
```typescript
// Before (inconsistent styles)
<div className="bg-gray-100 p-6 rounded-lg">
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    Bắt đầu thi
  </button>
</div>

// After (design system)
import { Card, Button } from '@nynus/design-system';

<Card variant="default">
  <Button variant="primary" size="lg">
    Bắt đầu thi
  </Button>
</Card>
```

**Files to Update** (4h):
- Exams List: `/exams/page.tsx` (0.5h)
- Browse Exams: `/exams/browse/page.tsx` (0.5h)
- Search Exams: `/exams/search/page.tsx` (0.5h)
- Create Exam: `/exams/create/page.tsx` (0.5h)
- Manage Exams: `/exams/manage/page.tsx` (0.5h)
- My Exams: `/exams/my-exams/page.tsx` (0.5h)
- My Results: `/exams/my-results/page.tsx` (0.5h)
- Exam Detail: `/exams/[id]/page.tsx` (0.5h)

---

## 3.4 Dashboard Pages Theme Update (4 hours)

**Scope**: 6 pages in `/dashboard/`, `/profile/`, `/settings/`

**Changes Required**:
1. Apply design tokens for colors
2. Consistent component styles using design system
3. Unified animations using animation tokens
4. Responsive improvements using spacing tokens
5. Add loading states and error boundaries

**Example Update**:
```typescript
// Before (mixed styles)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-bold">Thống kê</h3>
  </div>
</div>

// After (design system)
import { Card, SectionHeader } from '@nynus/design-system';
import { spacing } from '@nynus/design-system/tokens';

<div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: spacing[6] }}>
  <Card variant="default">
    <SectionHeader title="Thống kê" align="left" />
  </Card>
</div>
```

**Files to Update** (4h):
- Dashboard: `/dashboard/page.tsx` (1h)
- Profile: `/profile/page.tsx` (1h)
- Profile Sessions: `/profile/sessions/page.tsx` (0.5h)
- Settings: `/settings/page.tsx` (1h)
- Sessions: `/sessions/page.tsx` (0.5h)
- Notifications: `/notifications/page.tsx` (0.5h)

---

## 4. DARK MODE COMPLETION (8 hours)

### 4.1 Complete Dark Mode CSS Variables (2h)

**File**: `apps/frontend/src/styles/theme/theme-dark.css`

**Changes**:
```css
/* Enhanced Dark Mode Variables */
.dark {
  /* Backgrounds */
  --color-background: #0B1320;        /* Deep navy base */
  --color-surface: #0D1628;           /* Navy surface 1 */
  --color-surface-2: #141D2E;         /* Navy surface 2 */
  --color-surface-3: #1A2436;         /* Navy surface 3 */
  --color-muted: #1F2937;             /* Muted background */
  
  /* Text */
  --color-foreground: #E5E7EB;        /* Light gray text */
  --color-foreground-muted: #9CA3AF;  /* Muted text */
  --color-foreground-subtle: #6B7280; /* Subtle text */
  
  /* Borders */
  --color-border: #374151;            /* Border color */
  --color-border-hover: #4B5563;      /* Border hover */
  
  /* Accents (brighter for dark mode) */
  --color-primary: #818CF8;           /* Brighter indigo */
  --color-primary-hover: #6366F1;     /* Primary hover */
  --color-accent: #A78BFA;            /* Brighter purple */
  --color-secondary: #F472B6;         /* Brighter pink */
  
  /* Semantic Colors */
  --color-success: #34D399;           /* Brighter green */
  --color-warning: #FBBF24;           /* Brighter amber */
  --color-error: #F87171;             /* Brighter red */
  --color-info: #60A5FA;              /* Brighter blue */
  
  /* Shadows (adjusted for dark mode) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
}
```

### 4.2 Test Dark Mode on All Pages (4h)

**Testing Checklist**:
- [ ] Homepage - Hero section gradient visibility
- [ ] Auth pages - Form contrast and readability
- [ ] Dashboard pages - Card visibility and text contrast
- [ ] Questions pages - Question card readability
- [ ] Exams pages - Exam card and button visibility
- [ ] Admin pages - Sidebar and content contrast
- [ ] Teacher pages - Dashboard and management pages
- [ ] Tutor pages - Session and student pages
- [ ] Student pages - Course and materials pages

**Contrast Testing**:
```typescript
// Use contrast checker tool
// Minimum WCAG AA: 4.5:1 for normal text, 3:1 for large text
// Target WCAG AAA: 7:1 for normal text, 4.5:1 for large text

// Example test cases:
const contrastTests = [
  { bg: '#0B1320', fg: '#E5E7EB', expected: '>7:1' },  // Background + Text
  { bg: '#0D1628', fg: '#E5E7EB', expected: '>7:1' },  // Surface + Text
  { bg: '#818CF8', fg: '#FFFFFF', expected: '>4.5:1' }, // Primary + White
  { bg: '#34D399', fg: '#000000', expected: '>4.5:1' }  // Success + Black
];
```

### 4.3 Fix Contrast Issues (1h)

**Common Issues**:
1. Text on gradient backgrounds
2. Icon visibility on colored surfaces
3. Border visibility in dark mode
4. Hover state visibility

**Solutions**:
```css
/* Add text shadows for better readability on gradients */
.text-on-gradient {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Increase border opacity in dark mode */
.dark .border {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Enhance hover states */
.dark .hover-effect:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
```

### 4.4 Add Dark Mode Toggle Animations (1h)

**Implementation**:
```typescript
// File: apps/frontend/src/components/theme-toggle.tsx
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-surface hover:bg-surface-2 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )}
      </motion.div>
    </motion.button>
  );
}
```

---

## 5. ANIMATION ENHANCEMENTS (8 hours)

### 5.1 Page Transitions (3h)

**Implementation**:
```typescript
// File: apps/frontend/src/components/page-transition.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Apply to Layout**:
```typescript
// File: apps/frontend/src/components/layout/main-layout.tsx
import { PageTransition } from '../page-transition';

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdminPage && <Navbar />}
      <main className={`flex-1 ${isHomepage ? 'pt-0' : 'pt-16'}`}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {!isAdminPage && <><Footer /><FloatingCTA /></>}
    </div>
  );
}
```

### 5.2 Micro-interactions (3h)

**Button Interactions**:
```typescript
// Enhanced button with ripple effect
export function Button({ children, ...props }: ButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples([...ripples, { x, y, id: Date.now() }]);
    
    setTimeout(() => {
      setRipples(ripples.slice(1));
    }, 600);
  };
  
  return (
    <motion.button
      onClick={handleClick}
      className="relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0
          }}
          animate={{
            width: 200,
            height: 200,
            opacity: [1, 0],
            x: -100,
            y: -100
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </motion.button>
  );
}
```

**Card Interactions**:
```typescript
// Enhanced card with tilt effect
export function Card({ children, ...props }: CardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateX);
    setRotateY(rotateY);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### 5.3 Performance Optimization (2h)

**Lazy Loading Animations**:
```typescript
// Only animate elements when they enter viewport
import { useInView } from 'framer-motion';

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

**Reduced Motion Support**:
```typescript
// Respect user's motion preferences
import { useReducedMotion } from 'framer-motion';

export function ResponsiveAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  
  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 }
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      };
  
  return (
    <motion.div variants={variants} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
```

---

## 6. IMPLEMENTATION TIMELINE

### Week 1: Foundation (12h)
- **Day 1-2**: Create design tokens package (4h)
- **Day 3-4**: Build reusable components (8h)

### Week 2: Admin Pages (8h)
- **Day 1-2**: Update admin dashboard and user pages (4h)
- **Day 3-4**: Update admin management pages (4h)

### Week 3: Public Pages (8h)
- **Day 1-2**: Update questions pages (4h)
- **Day 3-4**: Update exam pages (4h)

### Week 4: Dashboard & Dark Mode (12h)
- **Day 1-2**: Update dashboard pages (4h)
- **Day 3-5**: Complete dark mode (8h)

### Week 5-6: Enhancements (8h)
- **Day 1-2**: Page transitions (3h)
- **Day 3-4**: Micro-interactions (3h)
- **Day 5**: Performance optimization (2h)

---

**Total**: 48 hours (6 weeks)
**Status**: READY FOR IMPLEMENTATION

