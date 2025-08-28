# Question MVP Implementation Plan
**Version**: 1.0.0  
**Created**: 2025-01-18  
**Scope**: Question Browsing + Answer Viewing Only  
**Timeline**: 3-4 weeks (120 hours)

## 🎯 MVP Scope Definition

### ✅ In Scope (MVP)
1. **Landing Page** (`/questions`)
   - Hero section với search bar
   - Category overview cards (4 main categories)
   - Featured questions preview (3-5 questions)
   - Basic stats display

2. **Browse Interface** (`/questions/browse`)
   - Question grid/list view với pagination
   - Basic filtering: Category, Difficulty, Type
   - Search functionality với debounced input
   - Sort options: Newest, Popular, Difficulty

3. **Question Detail Page** (`/questions/[id]`)
   - LaTeX content rendering
   - Answer options display (MC/TF/SA)
   - Basic metadata (type, difficulty, category)
   - View solution toggle

4. **Basic Search** (`/questions/search`)
   - Search results page
   - Filter integration
   - Pagination

### ❌ Out of Scope (Future Phases)
- Practice/Quiz interface
- User feedback/rating system
- Advanced filtering (creator, date range, tags)
- Mobile optimization (beyond responsive)
- User progress tracking
- Comment system
- PWA features

## 📊 Component Reusability Analysis

### Admin Components → End-User Mapping

| Admin Component | End-User Equivalent | Reusability | Adaptation Effort | Priority |
|----------------|-------------------|-------------|------------------|----------|
| `QuestionMobileCard` | `PublicQuestionCard` | 85% | 2h | 🔴 Critical |
| `LaTeXContent` | Same | 100% | 0h | 🔴 Critical |
| `LaTeXRenderer` | Same | 100% | 0h | 🔴 Critical |
| `QuestionFilters` | `PublicQuestionFilters` | 70% | 4h | 🟡 High |
| `QuestionPreview` | `QuestionViewer` | 65% | 6h | 🟡 High |
| `VirtualQuestionList` | `QuestionGrid` | 90% | 2h | 🟡 High |
| `QuestionListSkeleton` | Same | 100% | 0h | 🟢 Medium |
| `MockQuestionsService` | `PublicQuestionService` | 85% | 3h | 🟡 High |
| `QuestionFiltersStore` | `PublicFiltersStore` | 80% | 2h | 🟡 High |
| `ResponsiveQuestionTable` | `QuestionGrid` | 75% | 3h | 🟡 High |

**Total Reusability**: ~82% | **Total Adaptation Effort**: ~22 hours

### Shared UI Components (100% Reusable)
- `Card`, `Button`, `Badge`, `Input`, `Select` từ Shadcn UI
- `ErrorBoundary`, `LoadingSkeleton` từ UI components
- `Pagination`, `SearchInput` patterns

## 🏗️ MVP Architecture Plan

### Folder Structure
```
src/components/questions/
├── shared/                    # Reusable components (8h)
│   ├── question-card.tsx      # Adapted from QuestionMobileCard
│   ├── question-type-badge.tsx
│   ├── difficulty-indicator.tsx
│   ├── latex-content.tsx      # Wrapper for LaTeXRenderer
│   ├── loading-skeleton.tsx
│   └── question-metadata.tsx
├── browse/                    # Browse interface (16h)
│   ├── question-grid.tsx      # Grid layout with virtual scrolling
│   ├── question-filters.tsx   # Simplified filters
│   ├── search-bar.tsx         # Public search interface
│   ├── category-selector.tsx
│   ├── sort-controls.tsx
│   └── pagination-controls.tsx
├── detail/                    # Question detail view (12h)
│   ├── question-viewer.tsx    # Main question display
│   ├── answer-display.tsx     # Answer options rendering
│   ├── solution-panel.tsx     # Expandable solution
│   └── question-actions.tsx   # View/Share actions
└── layout/                    # Layout components (6h)
    ├── questions-header.tsx
    ├── breadcrumb.tsx
    ├── page-container.tsx
    └── stats-display.tsx
```

### API Integration Strategy
```typescript
// New service layer for end-users
class PublicQuestionService {
  // Simplified API calls without admin features
  static async browseQuestions(filters: PublicQuestionFilters): Promise<QuestionListResponse>
  static async getQuestionDetail(id: string): Promise<Question>
  static async searchQuestions(query: string, filters?: PublicQuestionFilters): Promise<QuestionListResponse>
  static async getQuestionCategories(): Promise<QuestionCategory[]>
  static async getFeaturedQuestions(): Promise<Question[]>
}

// Simplified filter interface
interface PublicQuestionFilters {
  category?: string;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'difficulty';
  page?: number;
  limit?: number;
}
```

## 📅 3-Week MVP Timeline

### Week 1: Foundation & Shared Components (40h)
**Days 1-2: Project Setup (16h)**
- [ ] Setup routing structure (`/questions/*`)
- [ ] Create base layout components
- [ ] Setup TypeScript interfaces for public API
- [ ] Configure build and development environment

**Days 3-5: Shared Components (24h)**
- [ ] Extract and adapt `QuestionCard` component (6h)
- [ ] Create `QuestionTypeBadge` and `DifficultyIndicator` (4h)
- [ ] Setup `LaTeXContent` wrapper (2h)
- [ ] Create loading skeletons and error boundaries (4h)
- [ ] Implement `PublicQuestionService` (6h)
- [ ] Setup basic state management (2h)

### Week 2: Browse Interface (40h)
**Days 6-7: Landing Page (16h)**
- [ ] Hero section với search bar (6h)
- [ ] Category overview cards (4h)
- [ ] Featured questions section (4h)
- [ ] Stats display component (2h)

**Days 8-10: Browse Page (24h)**
- [ ] Question grid layout với virtual scrolling (8h)
- [ ] Basic filtering interface (6h)
- [ ] Search functionality với debouncing (4h)
- [ ] Pagination controls (3h)
- [ ] Sort controls (3h)

### Week 3: Detail Pages & Polish (40h)
**Days 11-12: Question Detail Page (16h)**
- [ ] Question viewer với LaTeX rendering (8h)
- [ ] Answer display components (4h)
- [ ] Solution panel với toggle (2h)
- [ ] Question metadata display (2h)

**Days 13-15: Integration & Testing (24h)**
- [ ] API integration và error handling (8h)
- [ ] Cross-page navigation (4h)
- [ ] Responsive design adjustments (6h)
- [ ] Testing và bug fixes (6h)

## 🔧 Technical Implementation Details

### Component Adaptation Strategy

#### 1. QuestionCard Adaptation (2h)
```typescript
// Simplified props for public use
interface PublicQuestionCardProps {
  question: Question;
  variant: 'grid' | 'list' | 'featured';
  onView: (id: string) => void;
  showMetadata?: boolean;
  className?: string;
}

// Remove admin-specific features:
// - Selection checkbox
// - Edit/Delete actions
// - Status indicators
// - Bulk operations
```

#### 2. Filter Simplification (4h)
```typescript
// Simplified filters for public use
interface PublicQuestionFilters {
  category?: string;        // Keep
  difficulty?: string;      // Keep
  type?: QuestionType;      // Keep
  search?: string;          // Keep
  // Remove: status, creator, dateRange, tags, advanced options
}
```

#### 3. Question Viewer Adaptation (6h)
```typescript
// Focus on viewing, remove editing capabilities
interface QuestionViewerProps {
  question: Question;
  showSolution?: boolean;
  onSolutionToggle?: () => void;
  // Remove: editing, validation, admin controls
}
```

### Performance Optimizations
- Virtual scrolling for 100+ questions
- Debounced search (300ms delay)
- Lazy loading for LaTeX content
- Image optimization
- Bundle splitting by route

### Mobile Responsiveness
- Grid → List view on mobile
- Touch-friendly buttons (44px min)
- Simplified navigation
- Optimized LaTeX rendering

## 🚨 Risk Assessment & Mitigation

### High Risk
1. **LaTeX Rendering Performance**
   - Risk: Slow rendering on mobile
   - Mitigation: Lazy loading, caching, fallback text

2. **Search Performance**
   - Risk: Slow search với large dataset
   - Mitigation: Debouncing, server-side pagination

### Medium Risk
1. **Component Adaptation Complexity**
   - Risk: More effort than estimated
   - Mitigation: Start with simplest components first

2. **API Integration**
   - Risk: Backend API not ready
   - Mitigation: Use mock services, parallel development

### Low Risk
1. **Responsive Design**
   - Risk: Layout issues on different screens
   - Mitigation: Use proven Tailwind patterns

## 📊 Success Metrics

### Performance Targets
- Page load time: <2s
- Search response: <300ms
- Mobile Lighthouse score: >85
- Bundle size: <400KB gzipped

### User Experience
- Question browsing completion: >80%
- Search usage rate: >30%
- Mobile usage: >50%
- Bounce rate: <40%

### Technical
- Zero TypeScript errors
- Test coverage: >70%
- Zero critical accessibility violations

## 🚀 Ready for Implementation

### Prerequisites ✅
- Admin components analyzed and mapped
- Reusability strategy defined
- Timeline realistic and achievable
- Technical architecture planned
- Risk mitigation strategies in place

### Next Steps
1. **Week 1 Start**: Setup project structure
2. **Daily Standups**: Track progress against timeline
3. **Weekly Reviews**: Adjust scope if needed
4. **End of Week 3**: MVP ready for testing

## 📋 Detailed Task Breakdown

### Week 1 Tasks (40h total)

#### Day 1-2: Project Setup (16h)
**Task 1.1: Routing Setup (4h)**
- [ ] Create `/questions` route structure
- [ ] Setup dynamic routes for `[id]` pages
- [ ] Configure Next.js App Router
- [ ] Test navigation between pages

**Task 1.2: Layout Components (6h)**
- [ ] Create `QuestionsLayout` component (2h)
- [ ] Implement `QuestionsHeader` với breadcrumbs (2h)
- [ ] Setup `PageContainer` với responsive design (2h)

**Task 1.3: TypeScript Setup (4h)**
- [ ] Define `PublicQuestionFilters` interface (1h)
- [ ] Create `PublicQuestionService` skeleton (2h)
- [ ] Setup type exports và imports (1h)

**Task 1.4: Development Environment (2h)**
- [ ] Configure build scripts
- [ ] Setup development server
- [ ] Test hot reload functionality

#### Day 3-5: Shared Components (24h)
**Task 2.1: QuestionCard Adaptation (6h)**
- [ ] Copy `QuestionMobileCard` to `shared/question-card.tsx` (1h)
- [ ] Remove admin-specific props (selection, edit, delete) (2h)
- [ ] Add public-specific props (onView, variant) (1h)
- [ ] Update styling for public interface (1h)
- [ ] Test component với mock data (1h)

**Task 2.2: Badge Components (4h)**
- [ ] Create `QuestionTypeBadge` component (2h)
- [ ] Create `DifficultyIndicator` component (2h)

**Task 2.3: LaTeX Integration (2h)**
- [ ] Create `LaTeXContent` wrapper component (1h)
- [ ] Test LaTeX rendering với sample questions (1h)

**Task 2.4: Loading & Error Components (4h)**
- [ ] Adapt loading skeletons for public use (2h)
- [ ] Create error boundaries for question display (2h)

**Task 2.5: Service Layer (6h)**
- [ ] Implement `PublicQuestionService.browseQuestions()` (2h)
- [ ] Implement `PublicQuestionService.getQuestionDetail()` (2h)
- [ ] Implement `PublicQuestionService.searchQuestions()` (2h)

**Task 2.6: State Management (2h)**
- [ ] Setup Zustand store for public filters (1h)
- [ ] Test state persistence (1h)

### Week 2 Tasks (40h total)

#### Day 6-7: Landing Page (16h)
**Task 3.1: Hero Section (6h)**
- [ ] Create hero layout với gradient background (2h)
- [ ] Implement search bar với debouncing (2h)
- [ ] Add quick filter buttons (2h)

**Task 3.2: Category Cards (4h)**
- [ ] Create category overview cards (2h)
- [ ] Add hover effects và animations (1h)
- [ ] Link to category browse pages (1h)

**Task 3.3: Featured Questions (4h)**
- [ ] Create featured questions section (2h)
- [ ] Implement question preview cards (2h)

**Task 3.4: Stats Display (2h)**
- [ ] Create stats component với counters (1h)
- [ ] Add loading states (1h)

#### Day 8-10: Browse Page (24h)
**Task 4.1: Question Grid (8h)**
- [ ] Adapt `VirtualQuestionList` for public use (3h)
- [ ] Implement grid layout với responsive design (3h)
- [ ] Add loading states và error handling (2h)

**Task 4.2: Filter Interface (6h)**
- [ ] Simplify `QuestionFilters` for public use (3h)
- [ ] Remove admin-specific filters (1h)
- [ ] Test filter application (2h)

**Task 4.3: Search Functionality (4h)**
- [ ] Implement search bar với debouncing (2h)
- [ ] Connect search to API service (1h)
- [ ] Add search suggestions (1h)

**Task 4.4: Pagination (3h)**
- [ ] Implement pagination controls (2h)
- [ ] Test với large datasets (1h)

**Task 4.5: Sort Controls (3h)**
- [ ] Create sort dropdown (2h)
- [ ] Implement sort logic (1h)

### Week 3 Tasks (40h total)

#### Day 11-12: Question Detail Page (16h)
**Task 5.1: Question Viewer (8h)**
- [ ] Adapt `QuestionPreview` for public viewing (4h)
- [ ] Remove admin controls và editing features (2h)
- [ ] Test LaTeX rendering performance (2h)

**Task 5.2: Answer Display (4h)**
- [ ] Create answer options component (2h)
- [ ] Handle different question types (MC/TF/SA) (2h)

**Task 5.3: Solution Panel (2h)**
- [ ] Create expandable solution panel (1h)
- [ ] Add toggle functionality (1h)

**Task 5.4: Metadata Display (2h)**
- [ ] Show question metadata (type, difficulty, category) (1h)
- [ ] Add usage statistics (1h)

#### Day 13-15: Integration & Testing (24h)
**Task 6.1: API Integration (8h)**
- [ ] Connect all components to real API (4h)
- [ ] Implement error handling (2h)
- [ ] Add loading states (2h)

**Task 6.2: Navigation (4h)**
- [ ] Test navigation between pages (2h)
- [ ] Implement breadcrumbs (1h)
- [ ] Add back/forward functionality (1h)

**Task 6.3: Responsive Design (6h)**
- [ ] Test on mobile devices (2h)
- [ ] Adjust layouts for tablet (2h)
- [ ] Fix responsive issues (2h)

**Task 6.4: Testing & Bug Fixes (6h)**
- [ ] Manual testing của all features (3h)
- [ ] Fix discovered bugs (2h)
- [ ] Performance optimization (1h)

## 🔧 Technical Specifications

### API Endpoints Required
```typescript
// MVP endpoints needed
GET /api/questions/browse?category=&difficulty=&type=&page=&limit=
GET /api/questions/search?q=&filters=
GET /api/questions/[id]
GET /api/questions/categories
GET /api/questions/featured
GET /api/questions/stats
```

### Component Props Interfaces
```typescript
// Shared component interfaces
interface PublicQuestionCardProps {
  question: Question;
  variant: 'grid' | 'list' | 'featured';
  onView: (id: string) => void;
  showMetadata?: boolean;
  className?: string;
}

interface QuestionGridProps {
  questions: Question[];
  loading?: boolean;
  onQuestionView: (id: string) => void;
  variant: 'grid' | 'list';
  className?: string;
}

interface PublicQuestionFiltersProps {
  onFilterChange: (filters: PublicQuestionFilters) => void;
  initialFilters?: PublicQuestionFilters;
  showAdvanced?: boolean;
}
```

### State Management Structure
```typescript
// Public question store
interface PublicQuestionStore {
  // Browse state
  questions: Question[];
  filters: PublicQuestionFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;

  // Current question state
  currentQuestion: Question | null;

  // Actions
  setFilters: (filters: Partial<PublicQuestionFilters>) => void;
  loadQuestions: () => Promise<void>;
  searchQuestions: (query: string) => Promise<void>;
  loadQuestionDetail: (id: string) => Promise<void>;
  resetFilters: () => void;
}
```

### Performance Optimizations
```typescript
// Virtual scrolling configuration
const VIRTUAL_SCROLL_CONFIG = {
  itemHeight: 200, // px
  overscan: 5,     // items
  threshold: 100   // items before virtual scrolling
};

// Search debouncing
const SEARCH_DEBOUNCE_MS = 300;

// Lazy loading
const LAZY_LOAD_THRESHOLD = '100px';
```

---

**Estimated Total Effort**: 120 hours
**Team Recommendation**: 2-3 developers
**Critical Path**: Shared Components → Browse Interface → Detail Pages
**Success Probability**: High (85%+ reusability from existing components)

**Ready for Implementation**: ✅ All tasks defined with realistic estimates
