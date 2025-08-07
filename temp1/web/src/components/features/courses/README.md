# Courses Components

Bộ components cho trang khóa học với thiết kế hybrid layout và nội dung Toán học THPT.

## Components Overview

### HeroSection
Hero section với gradient background và search functionality.

```tsx
import { HeroSection } from './hero-section';

<HeroSection onSearch={(query) => console.log(query)} />
```

**Features:**
- Gradient purple-to-blue background
- Subject icons với hover effects
- Integrated search bar
- Responsive design
- Floating geometric shapes (desktop only)

### TutorialCard & TutorialGrid
Card components cho tutorial items với numbered design.

```tsx
import { TutorialGrid, TutorialCard } from './tutorial-card';

<TutorialGrid tutorials={tutorials} />
// hoặc
<TutorialCard tutorial={tutorial} index={0} />
```

**Features:**
- Numbered badges (1-9)
- Glass morphism effect
- Completion status
- Duration display
- Tags system
- Responsive grid layout

### FeaturedCourseCard
Featured course card cho sidebar với dark theme.

```tsx
import { FeaturedCourseCard } from './featured-course-card';

<FeaturedCourseCard course={course} showProgress={true} />
```

**Features:**
- Dark gradient background
- Course metadata
- Progress indicator
- Action buttons
- Glass effect overlay

### SearchBar
Advanced search và filtering component.

```tsx
import { FloatingSearchBar } from './search-bar';

<FloatingSearchBar
  onSearch={handleSearch}
  onFilter={handleFilter}
  showFilters={true}
  variant="floating"
/>
```

**Features:**
- Debounced search (300ms)
- Advanced filters
- Multiple variants
- Vietnamese placeholders
- Responsive design

## Styling Guidelines

### Color Scheme
- Primary: Purple-to-blue gradients
- Background: Dark theme với glass effects
- Text: White/purple-200 cho readability
- Accents: Yellow-orange gradients

### Typography
- Headings: Bold, white color
- Body text: Purple-100/slate-300
- Small text: Purple-200/slate-400

### Spacing
- Mobile: 4-6 spacing units
- Desktop: 6-8 spacing units
- Grid gaps: 4 (mobile) → 6 (desktop)

## Responsive Behavior

### Breakpoints
- `sm`: 640px (tablet)
- `lg`: 1024px (desktop)

### Layout Changes
- Mobile: Single column, stacked layout
- Tablet: 2-column grid
- Desktop: Hybrid layout (25% + 75%)

## Performance Notes

- Floating shapes disabled on mobile
- Skeleton loading states
- Debounced search
- Optimized animations
- Lazy loading ready

## Accessibility

- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- Focus management
- Semantic HTML

## Mock Data Integration

Components work with mock data services:
- `useTutorials()` hook
- `useFeaturedCourses()` hook
- `tutorialService` và `courseService`

## Testing

Run component tests:
```bash
pnpm test components/courses
```

## Examples

See `/app/khoa-hoc/page.tsx` for complete implementation example.
