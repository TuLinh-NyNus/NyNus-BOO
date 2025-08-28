/**
 * Questions Browse Components Index
 * Barrel exports cho questions browse components theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== MAIN COMPONENTS =====

// Question Grid components
export {
  PublicQuestionGrid,
  default as DefaultPublicQuestionGrid
} from './question-grid';

export {
  PublicVirtualQuestionGrid,
  default as DefaultPublicVirtualQuestionGrid,
  estimatePublicQuestionGridPerformance
} from './public-virtual-question-grid';

// Question Filter components
export {
  PublicQuestionFiltersComponent,
  PublicQuestionFilters
} from './question-filters';

export { default as DefaultPublicQuestionFilters } from './question-filters';

export {
  PublicFilterChips,
  default as DefaultPublicFilterChips,
  hasActiveFilters,
  countActiveFilters,
  getActiveFilterSummary
} from './public-filter-chips';

// Search components
export {
  PublicSearchBar,
  default as DefaultPublicSearchBar
} from './public-search-bar';

export {
  SearchSuggestions,
  default as DefaultSearchSuggestions,
  useSearchSuggestions
} from './search-suggestions';

// Pagination components
export {
  PublicPaginationControls,
  default as DefaultPublicPaginationControls,
  getOptimalPaginationSettings
} from './pagination-controls';

// Sort components
export {
  PublicSortControls,
  default as DefaultPublicSortControls,
  getSortDisplayText,
  getSortQueryParams,
  parseSortFromParams
} from './sort-controls';

// ===== TYPE EXPORTS =====

// Question Grid types
export type {
  PublicQuestionGridProps,
  QuestionGridViewMode,
  QuestionGridLayout,
  QuestionGridColumns
} from './question-grid';

export type {
  PublicVirtualQuestionGridProps,
  PublicQuestionListItem
} from './public-virtual-question-grid';

// Question Filter types
export type {
  PublicQuestionFiltersProps
} from './question-filters';

export type {
  PublicFilterChipsProps,
  FilterChip
} from './public-filter-chips';

// Search component types
export type {
  PublicSearchBarProps
} from './public-search-bar';

export type {
  SearchSuggestionsProps,
  SearchSuggestion
} from './search-suggestions';

// Pagination component types
export type {
  PublicPaginationControlsProps,
  PaginationInfo
} from './pagination-controls';

// Sort component types
export type {
  PublicSortControlsProps,
  SortOption,
  SortDirection
} from './sort-controls';

// ===== COMPONENT ALIASES =====

// Convenient aliases cho common use cases
export { PublicQuestionGrid as QuestionGrid } from './question-grid';
export { PublicVirtualQuestionGrid as VirtualQuestionGrid } from './public-virtual-question-grid';
export { PublicQuestionFiltersComponent as QuestionFilters } from './question-filters';
export { PublicFilterChips as FilterChips } from './public-filter-chips';
export { PublicSearchBar as SearchBar } from './public-search-bar';
export { PublicPaginationControls as PaginationControls } from './pagination-controls';
export { PublicSortControls as SortControls } from './sort-controls';

// ===== CONSTANTS =====

/**
 * Default configuration cho question grid components
 */
export const QUESTION_GRID_CONFIG = {
  DEFAULT_COLUMNS: 3,
  DEFAULT_CONTAINER_HEIGHT: 600,
  DEFAULT_VIRTUAL_THRESHOLD: 100,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
} as const;

/**
 * Grid layout presets
 */
export const GRID_LAYOUT_PRESETS = {
  COMPACT: {
    columns: 4,
    viewMode: 'grid' as const,
    enableVirtualScrolling: true,
  },
  COMFORTABLE: {
    columns: 3,
    viewMode: 'grid' as const,
    enableVirtualScrolling: true,
  },
  SPACIOUS: {
    columns: 2,
    viewMode: 'grid' as const,
    enableVirtualScrolling: false,
  },
  LIST: {
    columns: 1,
    viewMode: 'list' as const,
    enableVirtualScrolling: false,
  },
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get optimal grid configuration based on screen size và question count
 */
export function getOptimalGridConfig(
  questionCount: number,
  screenWidth: number
): typeof GRID_LAYOUT_PRESETS[keyof typeof GRID_LAYOUT_PRESETS] {
  // Mobile
  if (screenWidth < QUESTION_GRID_CONFIG.MOBILE_BREAKPOINT) {
    return GRID_LAYOUT_PRESETS.LIST;
  }
  
  // Tablet
  if (screenWidth < QUESTION_GRID_CONFIG.TABLET_BREAKPOINT) {
    return questionCount > 50 ? GRID_LAYOUT_PRESETS.COMFORTABLE : GRID_LAYOUT_PRESETS.SPACIOUS;
  }
  
  // Desktop
  if (questionCount > 100) {
    return GRID_LAYOUT_PRESETS.COMPACT;
  } else if (questionCount > 50) {
    return GRID_LAYOUT_PRESETS.COMFORTABLE;
  } else {
    return GRID_LAYOUT_PRESETS.SPACIOUS;
  }
}

/**
 * Calculate grid performance metrics
 */
export function calculateGridPerformance(
  questionCount: number,
  columns: number,
  enableVirtualScrolling: boolean
) {
  const itemsPerRow = columns;
  const visibleRows = enableVirtualScrolling ? 10 : Math.ceil(questionCount / itemsPerRow);
  const renderTime = visibleRows * itemsPerRow * 0.15; // ms per item
  const memoryUsage = visibleRows * itemsPerRow * 0.6; // KB per item
  
  return {
    itemsPerRow,
    visibleRows,
    renderTime,
    memoryUsage,
    recommendation: enableVirtualScrolling 
      ? 'Virtual scrolling enabled - hiệu suất tối ưu'
      : questionCount > 100 
        ? 'Nên bật virtual scrolling cho hiệu suất tốt hơn'
        : 'Hiệu suất tốt với cấu hình hiện tại'
  };
}
