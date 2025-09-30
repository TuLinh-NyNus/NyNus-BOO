/**
 * Theory Components Index
 * Export tất cả theory components cho Phase 3.2
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Mobile Theory Viewer Components (Phase 3.2.1)
export {
  MobileTheoryViewer,
  CompactMobileTheoryViewer,
  FullMobileTheoryViewer,
  type MobileTheoryViewerProps,
  type TheoryContent,
  type LoadMetrics
} from './mobile-theory-viewer';

// Mobile Navigation Components (Phase 3.2.2)
export {
  MobileNavigation,
  CompactMobileNavigation,
  FullMobileNavigation,
  type MobileNavigationProps,
  type ChapterInfo,
  type NavigationItem,
  type SwipeGesture
} from './mobile-navigation';

// Collapsible Breadcrumbs Components (Phase 3.2.3)
export {
  CollapsibleBreadcrumbs,
  CompactCollapsibleBreadcrumbs,
  FullCollapsibleBreadcrumbs,
  MobileCollapsibleBreadcrumbs,
  type CollapsibleBreadcrumbsProps,
  type BreadcrumbItem
} from './collapsible-breadcrumbs';

// Touch Subject Selector Components (Phase 3.2.4)
export {
  TouchSubjectSelector,
  CompactTouchSubjectSelector,
  FullTouchSubjectSelector,
  type TouchSubjectSelectorProps,
  type SubjectInfo,
  type GradeInfo
} from './touch-subject-selector';

// Swipeable Chapter List Components (Phase 3.3.1)
export {
  SwipeableChapterList,
  CompactSwipeableChapterList,
  FullSwipeableChapterList,
  type SwipeableChapterListProps
} from './swipeable-chapter-list';

// Bottom Navigation Bar Components (Phase 3.3.2)
export {
  BottomNavigationBar,
  CompactBottomNavigationBar,
  FullBottomNavigationBar,
  SimpleBottomNavigationBar,
  type BottomNavigationBarProps,
  type NavigationAction
} from './bottom-navigation-bar';

// Theory Content Skeleton Components (Phase 3.4.1)
export {
  TheoryContentSkeleton,
  QuickTheorySkeleton,
  DetailedTheorySkeleton,
  type TheoryContentSkeletonProps
} from './theory-content-skeleton';

// Theory Error Boundary Components (Phase 3.4.2)
export {
  TheoryErrorBoundary,
  CompactTheoryErrorBoundary,
  FullTheoryErrorBoundary,
  type TheoryErrorBoundaryProps,
  type TheoryErrorFallbackProps
} from './theory-error-boundary';

// Search Interface Components (Phase 4.2.1)
export {
  SearchInterface,
  CompactSearchInterface,
  MobileSearchInterface,
  type SearchInterfaceProps,
  type SearchFilters as SearchInterfaceFilters
} from './search-interface';

// Search Results Components (Phase 4.2.2)
export {
  SearchResults,
  CompactSearchResults,
  MobileSearchResults,
  type SearchResultsProps,
  type SearchResult
} from './search-results';

// Search Auto-complete Components (Phase 4.3.1)
export {
  SearchAutoComplete,
  CompactSearchAutoComplete,
  AdvancedSearchAutoComplete,
  type SearchAutoCompleteProps,
  type SearchSuggestion
} from './search-autocomplete';

// Search Filters Components (Phase 4.3.2)
export {
  SearchFilters as TheorySearchFilters,
  CompactSearchFilters,
  AdvancedSearchFilters,
  type SearchFiltersProps,
  type FilterPreset
} from './search-filters';

// Re-export common types for convenience
export type {
  LoadMetrics as TheoryLoadMetrics
} from './mobile-theory-viewer';

export type {
  SwipeGesture as MobileSwipeGesture
} from './mobile-navigation';

export type {
  BreadcrumbItem as TheoryBreadcrumbItem
} from './collapsible-breadcrumbs';

export type {
  SubjectInfo as TheorySubjectInfo,
  GradeInfo as TheoryGradeInfo
} from './touch-subject-selector';

export type {
  SwipeGesture as ChapterSwipeGesture
} from './swipeable-chapter-list';

export type {
  NavigationAction as TheoryNavigationAction
} from './bottom-navigation-bar';

export type {
  TheoryContentSkeletonProps as TheorySkeletonProps
} from './theory-content-skeleton';

export type {
  TheoryErrorBoundaryProps as TheoryErrorProps,
  TheoryErrorFallbackProps as TheoryErrorFallback
} from './theory-error-boundary';

export type {
  SearchInterfaceProps as TheorySearchInterfaceProps,
  SearchFilters as TheorySearchInterfaceFilters
} from './search-interface';

export type {
  SearchResultsProps as TheorySearchResultsProps,
  SearchResult as TheorySearchResult
} from './search-results';

export type {
  SearchAutoCompleteProps as TheorySearchAutoCompleteProps,
  SearchSuggestion as TheorySearchSuggestion
} from './search-autocomplete';

export type {
  SearchFiltersProps as TheorySearchFiltersProps,
  FilterPreset as TheoryFilterPreset
} from './search-filters';
