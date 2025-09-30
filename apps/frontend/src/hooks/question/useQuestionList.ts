/**
 * useQuestionList Hook
 * Enhanced hook cho question list management với virtual scrolling và responsive support
 * Kết hợp useQuestionFilters với additional list-specific functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuestionFilters } from './useQuestionFilters';
import { Question, QuestionFilters } from '@/types/question';
import {
  calculateQuestionListPerformance,
  shouldEnableVirtualScrolling,
  // getOptimalPageSize,
  getPerformanceRecommendation,
  // questionListPerformanceTracker,
  // type PerformanceMetrics
} from '@/lib/utils/question-list-performance';
import { useQuestionSorting } from './useQuestionSorting';
import { SortConfig, SORT_PRESETS, QuestionSortKey } from '@/lib/utils/question-sorting';

// ===== TYPES =====

export type QuestionListViewMode = 'table' | 'cards' | 'virtual';
export type QuestionListLayout = 'desktop' | 'tablet' | 'mobile';

export interface UseQuestionListOptions {
  // Filter options
  initialFilters?: Partial<QuestionFilters>;
  autoFetch?: boolean;
  
  // View options
  initialViewMode?: QuestionListViewMode;
  initialLayout?: QuestionListLayout;
  
  // Virtual scrolling options
  enableVirtualScrolling?: boolean;
  virtualScrollingThreshold?: number;
  containerHeight?: number;
  
  // Performance options
  enablePerformanceMonitoring?: boolean;

  // Sorting options
  initialSortConfig?: SortConfig;
  enableSorting?: boolean;
  multiSort?: boolean;
  persistSortInUrl?: boolean;

  // Callbacks
  onError?: (error: Error) => void;
  onSuccess?: (data: unknown) => void;
  onViewModeChange?: (mode: QuestionListViewMode) => void;
  onLayoutChange?: (layout: QuestionListLayout) => void;
  onSortChange?: (config: SortConfig) => void;
}

export interface UseQuestionListReturn {
  // Data state từ useQuestionFilters
  questions: Question[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isSearching: boolean;
  filters: QuestionFilters;
  
  // Enhanced list state
  viewMode: QuestionListViewMode;
  layout: QuestionListLayout;
  selectedQuestions: string[];

  // Sorting state
  sortConfig: SortConfig;
  sortedQuestions: Question[];
  isSorted: boolean;
  sortSummary: string;

  // Performance state
  performanceMetrics: {
    renderTime: number;
    memoryUsage: number;
    recommendation: string;
    shouldUseVirtualScrolling: boolean;
  };
  
  // Actions từ useQuestionFilters
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Enhanced list actions
  setViewMode: (mode: QuestionListViewMode) => void;
  setLayout: (layout: QuestionListLayout) => void;
  setSelectedQuestions: (selectedIds: string[]) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectInvert: () => void;

  // Sorting actions (optional based on enableSorting)
  setSortConfig?: (config: SortConfig) => void;
  addSortColumn?: (key: QuestionSortKey, direction?: 'asc' | 'desc') => void;
  removeSortColumn?: (key: string) => void;
  toggleSortDirection?: (key: string) => void;
  applySortPreset?: (presetName: keyof typeof SORT_PRESETS) => void;
  clearSort?: () => void;
  
  // Bulk operations
  bulkDelete: (questionIds: string[]) => Promise<void>;
  bulkStatusChange: (questionIds: string[], status: string) => Promise<void>;
  bulkExport: (questionIds: string[], format: string) => Promise<void>;
  
  // Utility functions
  hasActiveFilters: boolean;
  activeFilterCount: number;
  lastFetchTime: number;
  fetchCount: number;
}

// ===== CONSTANTS =====

const VIRTUAL_SCROLLING_THRESHOLD = 100;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// ===== HELPER FUNCTIONS =====

/**
 * Detect current layout dựa trên window width
 */
const detectLayout = (): QuestionListLayout => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
};

/**
 * Determine optimal view mode
 */
const determineOptimalViewMode = (
  questionCount: number,
  layout: QuestionListLayout,
  enableVirtualScrolling: boolean,
  threshold: number
): QuestionListViewMode => {
  if (layout === 'mobile') return 'cards';
  if (enableVirtualScrolling && questionCount > threshold) return 'virtual';
  return 'table';
};

/**
 * Calculate performance metrics với enhanced logic
 */
const calculateEnhancedPerformanceMetrics = (
  questionCount: number,
  currentLayout: QuestionListLayout,
  currentViewMode: QuestionListViewMode
) => {
  const baseMetrics = calculateQuestionListPerformance(questionCount);
  const recommendation = getPerformanceRecommendation(questionCount, baseMetrics.renderTime, currentViewMode);
  const shouldUseVirtual = shouldEnableVirtualScrolling(questionCount, currentLayout);

  return {
    ...baseMetrics,
    recommendation,
    shouldUseVirtualScrolling: shouldUseVirtual
  };
};

// ===== MAIN HOOK =====

export function useQuestionList(options: UseQuestionListOptions = {}): UseQuestionListReturn {
  const {
    autoFetch = true,
    initialViewMode,
    initialLayout,
    enableVirtualScrolling = true,
    virtualScrollingThreshold = VIRTUAL_SCROLLING_THRESHOLD,
    initialSortConfig,
    enableSorting = true,
    multiSort = true,
    persistSortInUrl = true,
    onError,
    onSuccess,
    onViewModeChange,
    onLayoutChange,
    onSortChange,
  } = options;
  
  // ===== CORE STATE từ useQuestionFilters =====

  const {
    questions,
    pagination,
    isLoading,
    isSearching,
    filters,
    refetch,
    setPage,
    setPageSize,
    hasActiveFilters,
    activeFilterCount,
    lastFetchTime,
    fetchCount
  } = useQuestionFilters({
    autoFetch,
    onError,
    onSuccess
  });

  // ===== SORTING STATE =====

  const {
    sortConfig,
    sortedQuestions,
    isSorted,
    sortSummary,
    setSortConfig,
    addSortColumn,
    removeSortColumn,
    toggleSortDirection,
    applySortPreset,
    clearSort
  } = useQuestionSorting(questions, {
    initialConfig: initialSortConfig,
    persistInUrl: persistSortInUrl,
    multiSort,
    onSortChange
  });
  
  // ===== ENHANCED LIST STATE =====
  
  // Layout detection và management
  const [detectedLayout, setDetectedLayout] = useState<QuestionListLayout>(() => 
    initialLayout || detectLayout()
  );
  
  const currentLayout = initialLayout || detectedLayout;
  
  // View mode management
  const optimalViewMode = useMemo(() => 
    determineOptimalViewMode(
      questions.length, 
      currentLayout, 
      enableVirtualScrolling, 
      virtualScrollingThreshold
    ),
    [questions.length, currentLayout, enableVirtualScrolling, virtualScrollingThreshold]
  );
  
  const [viewMode, setViewModeState] = useState<QuestionListViewMode>(
    initialViewMode || optimalViewMode
  );
  
  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Performance metrics với enhanced calculation (use sorted questions)
  const performanceMetrics = useMemo(() =>
    calculateEnhancedPerformanceMetrics(sortedQuestions.length, currentLayout, viewMode),
    [sortedQuestions.length, currentLayout, viewMode]
  );
  
  // ===== EFFECTS =====
  
  // Listen for window resize để update layout
  useEffect(() => {
    if (initialLayout) return; // Không auto-detect nếu layout được set manually
    
    const handleResize = () => {
      const newLayout = detectLayout();
      if (newLayout !== detectedLayout) {
        setDetectedLayout(newLayout);
        onLayoutChange?.(newLayout);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectedLayout, initialLayout, onLayoutChange]);
  
  // Auto-adjust view mode khi layout thay đổi
  useEffect(() => {
    if (!initialViewMode) {
      const newOptimalMode = determineOptimalViewMode(
        questions.length, 
        currentLayout, 
        enableVirtualScrolling, 
        virtualScrollingThreshold
      );
      if (newOptimalMode !== viewMode) {
        setViewModeState(newOptimalMode);
        onViewModeChange?.(newOptimalMode);
      }
    }
  }, [currentLayout, questions.length, enableVirtualScrolling, virtualScrollingThreshold, initialViewMode, viewMode, onViewModeChange]);
  
  // Clear selection khi sorted questions thay đổi
  useEffect(() => {
    setSelectedQuestions(prev =>
      prev.filter(id => sortedQuestions.some(q => q.id === id))
    );
  }, [sortedQuestions]);
  
  // ===== ACTIONS =====
  
  /**
   * Set view mode với callback
   */
  const setViewMode = useCallback((mode: QuestionListViewMode) => {
    setViewModeState(mode);
    onViewModeChange?.(mode);
  }, [onViewModeChange]);
  
  /**
   * Set layout với callback
   */
  const setLayout = useCallback((layout: QuestionListLayout) => {
    setDetectedLayout(layout);
    onLayoutChange?.(layout);
  }, [onLayoutChange]);
  
  /**
   * Selection actions (use sorted questions)
   */
  const selectAll = useCallback(() => {
    const allIds = sortedQuestions.map(q => q.id);
    setSelectedQuestions(allIds);
  }, [sortedQuestions]);

  const selectNone = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  const selectInvert = useCallback(() => {
    const allIds = sortedQuestions.map(q => q.id);
    const newSelection = allIds.filter(id => !selectedQuestions.includes(id));
    setSelectedQuestions(newSelection);
  }, [sortedQuestions, selectedQuestions]);
  
  /**
   * Bulk operations - placeholder implementations
   */
  const bulkDelete = useCallback(async (questionIds: string[]) => {
    // TODO: Implement bulk delete với MockQuestionsService
    console.log('Bulk delete:', questionIds);
  }, []);
  
  const bulkStatusChange = useCallback(async (questionIds: string[], status: string) => {
    // TODO: Implement bulk status change
    console.log('Bulk status change:', questionIds, status);
  }, []);
  
  const bulkExport = useCallback(async (questionIds: string[], format: string) => {
    // TODO: Implement bulk export
    console.log('Bulk export:', questionIds, format);
  }, []);
  
  // ===== RETURN =====
  
  return {
    // Data state
    questions,
    pagination,
    isLoading,
    isSearching,
    filters,

    // Enhanced list state
    viewMode,
    layout: currentLayout,
    selectedQuestions,

    // Sorting state
    sortConfig,
    sortedQuestions,
    isSorted,
    sortSummary,

    // Performance state
    performanceMetrics,

    // Actions
    refetch,
    setPage,
    setPageSize,
    setViewMode,
    setLayout,
    setSelectedQuestions,
    selectAll,
    selectNone,
    selectInvert,

    // Sorting actions (conditional based on enableSorting)
    ...(enableSorting ? {
      setSortConfig,
      addSortColumn,
      removeSortColumn,
      toggleSortDirection,
      applySortPreset,
      clearSort,
    } : {}),

    // Bulk operations
    bulkDelete,
    bulkStatusChange,
    bulkExport,

    // Utility
    hasActiveFilters,
    activeFilterCount,
    lastFetchTime,
    fetchCount
  };
}
