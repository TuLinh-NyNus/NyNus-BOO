/**
 * Questions Landing Components Index
 * Barrel exports cho questions landing components
 * 
 * @author NyNus Development Team
 * @version 2.0.0
 * @created 2025-01-18
 * @updated 2025-01-19 - Added enhanced components
 */

// ===== HERO COMPONENTS =====

// Hero Search Bar
export {
  HeroSearchBar,
  default as DefaultHeroSearchBar
} from './hero-search-bar';

// Combined Search Bar (Text/Subcount)
export {
  CombinedSearchBar,
  default as DefaultCombinedSearchBar
} from './combined-search-bar';

// Enhanced Search Bar (Improved UX)
export {
  EnhancedSearchBar,
  default as DefaultEnhancedSearchBar
} from './enhanced-search-bar';

// Issues Spotlight
export {
  IssuesSpotlight,
  default as DefaultIssuesSpotlight
} from './issues-spotlight';

// Enhanced Issues Spotlight (Gradient Design)
export {
  EnhancedIssuesSpotlight,
  default as DefaultEnhancedIssuesSpotlight
} from './enhanced-issues-spotlight';

// Classification Chips
export {
  ClassificationChips,
  default as DefaultClassificationChips
} from './classification-chips';

// Enhanced Classification Chips (Grouped & Multi-select)
export {
  EnhancedClassificationChips,
  default as DefaultEnhancedClassificationChips
} from './enhanced-classification-chips';

// Quick Filter Buttons
export {
  QuickFilterButtons,
  CompactQuickFilterButtons,
  GradeQuickFilterButtons,
  SubjectQuickFilterButtons,
  default as DefaultQuickFilterButtons
} from './quick-filter-buttons';

// Category Cards
export {
  CategoryCard,
  CompactCategoryCard,
  FeaturedCategoryCard,
  default as DefaultCategoryCard
} from './category-card';

// Category Cards Grid
export {
  CategoryCardsGrid,
  CompactCategoryCardsGrid,
  FeaturedCategoryCardsGrid,
  SimpleCategoryCardsGrid,
  default as DefaultCategoryCardsGrid
} from './category-cards-grid';

// Featured Questions Section
export {
  FeaturedQuestionsSection,
  CompactFeaturedQuestionsSection,
  EnhancedFeaturedQuestionsSection,
  default as DefaultFeaturedQuestionsSection
} from './featured-questions-section';

// Stats Display
export {
  StatsDisplay,
  CompactStatsDisplay,
  EnhancedStatsDisplay,
  InlineStatsDisplay,
  default as DefaultStatsDisplay
} from './stats-display';

// Question Type Cards Grid
export {
  QuestionTypeCardsGrid,
  CompactQuestionTypeCardsGrid,
  FeaturedQuestionTypeCardsGrid,
  SimpleQuestionTypeCardsGrid,
  default as DefaultQuestionTypeCardsGrid
} from './question-type-cards-grid';

// Enhanced Question Type Filter (Live Filter Buttons)
export {
  EnhancedQuestionTypeFilter,
  default as DefaultEnhancedQuestionTypeFilter
} from './enhanced-question-type-filter';

// Unified Filter Section (Combined Filters)
export {
  UnifiedFilterSection,
  default as DefaultUnifiedFilterSection
} from './unified-filter-section';

// Mobile Filter Sheet (Bottom Sheet)
export {
  MobileFilterSheet,
  default as DefaultMobileFilterSheet
} from './mobile-filter-sheet';

// Decorative Elements
export {
  DecorativeElements,
  QuestionCardDecoration,
  MathBackground,
  default as DefaultDecorativeElements
} from './decorative-elements';

// ===== TYPE EXPORTS =====

// Component props types
export type {
  HeroSearchBarProps
} from './hero-search-bar';

export type {
  QuickFilterButtonsProps
} from './quick-filter-buttons';

export type {
  CategoryCardProps
} from './category-card';

export type {
  CategoryCardsGridProps
} from './category-cards-grid';

export type {
  FeaturedQuestionsSectionProps
} from './featured-questions-section';

export type {
  StatsDisplayProps
} from './stats-display';

export type {
  QuestionTypeCardsGridProps
} from './question-type-cards-grid';
