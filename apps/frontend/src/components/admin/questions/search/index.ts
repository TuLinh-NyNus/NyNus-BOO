/**
 * Search Components Exports
 * Centralized exports cho question search components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Main search components
export { ClientSearch } from './client-search';
export type { ClientSearchProps } from './client-search';

// Search results components
export {
  SearchResults,
  SearchResultItem
} from './search-results';
export type {
  SearchResultsProps,
  SearchResultItemProps
} from './search-results';

// Search skeleton components
export {
  SearchSkeleton,
  SearchInputSkeleton,
  SearchStatsSkeleton,
  SearchResultItemSkeleton,
  SearchResultsSkeleton,
  AdvancedOptionsSkeleton,
  QuickSearchSkeleton,
  AdvancedSearchSkeleton,
  SearchLoadingIndicator
} from './search-skeleton';
export type { SearchSkeletonProps } from './search-skeleton';

// Search error boundary components
export {
  SearchErrorBoundary,
  DefaultSearchErrorFallback,
  CompactSearchErrorFallback,
  SearchErrorWrapper,
  CompactSearchErrorWrapper,
  useSearchErrorHandler
} from './search-error-boundary';
export type {
  SearchErrorBoundaryProps,
  SearchErrorBoundaryState,
  SearchErrorFallbackProps
} from './search-error-boundary';

// Re-export search utilities và hooks
export { 
  searchQuestions, 
  multiTermSearch, 
  searchInField,
  searchQuestion,
  normalizeText,
  calculateSimilarity,
  isMatch,
  findMatches,
  DEFAULT_SEARCH_OPTIONS,
  SEARCH_FIELD_WEIGHTS
} from '@/lib/utils/search-utils';

export type {
  SearchOptions,
  SearchField,
  SearchResult,
  SearchMatch
} from '@/lib/utils/search-utils';

export {
  useClientSearch,
  useQuickSearch,
  useAdvancedSearch
} from '@/hooks/useClientSearch';

export type {
  UseClientSearchOptions,
  UseClientSearchReturn
} from '@/hooks/useClientSearch';
