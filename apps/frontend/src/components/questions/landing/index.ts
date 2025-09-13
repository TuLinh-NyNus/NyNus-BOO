/**
 * Questions Landing Components Index
 * Barrel exports cho questions landing components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
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

// Issues Spotlight
export {
  IssuesSpotlight,
  default as DefaultIssuesSpotlight
} from './issues-spotlight';

// Classification Chips
export {
  ClassificationChips,
  default as DefaultClassificationChips
} from './classification-chips';

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
