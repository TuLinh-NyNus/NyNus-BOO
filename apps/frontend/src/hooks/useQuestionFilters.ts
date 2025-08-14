/**
 * useQuestionFilters Hook
 * Custom hook cho real-time filter application với MockQuestionsService
 * Tự động sync store changes với API calls và debounced search
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuestionFiltersStore } from '@/lib/stores/question-filters';
import { MockQuestionsService } from '@/lib/services/mock/questions';
import { Question, QuestionFilters, QuestionListResponse } from '@/lib/types/question';
import { useDebounce } from './useDebounce';

// ===== INTERFACES =====

export interface UseQuestionFiltersOptions {
  /**
   * Tự động fetch khi filters thay đổi
   * @default true
   */
  autoFetch?: boolean;
  
  /**
   * Debounce delay cho search filters (ms)
   * @default 300
   */
  searchDebounceDelay?: number;
  
  /**
   * Debounce delay cho other filters (ms)
   * @default 100
   */
  filterDebounceDelay?: number;
  
  /**
   * Callback khi có lỗi
   */
  onError?: (error: Error) => void;
  
  /**
   * Callback khi fetch thành công
   */
  onSuccess?: (response: QuestionListResponse) => void;
}

export interface UseQuestionFiltersReturn {
  // Data state
  questions: Question[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  
  // Filter state từ store
  filters: QuestionFilters;
  
  // Actions
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Filter validation
  hasActiveFilters: boolean;
  activeFilterCount: number;
  
  // Performance metrics
  lastFetchTime: number;
  fetchCount: number;
}

// ===== HOOK IMPLEMENTATION =====

/**
 * useQuestionFilters Hook
 * Comprehensive hook cho question filtering với real-time updates
 */
export function useQuestionFilters(
  options: UseQuestionFiltersOptions = {}
): UseQuestionFiltersReturn {
  const {
    autoFetch = true,
    searchDebounceDelay = 300,
    filterDebounceDelay = 100,
    onError,
    onSuccess
  } = options;

  // Store state
  const { filters, setFilters } = useQuestionFiltersStore();
  
  // Local state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Performance tracking
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [fetchCount, setFetchCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Separate search filters từ other filters cho different debounce delays
  const searchFilters = {
    keyword: filters.keyword,
    solutionKeyword: filters.solutionKeyword,
    latexKeyword: filters.latexKeyword,
    globalSearch: filters.globalSearch
  };
  
  const otherFilters = {
    ...filters,
    keyword: '',
    solutionKeyword: '',
    latexKeyword: '',
    globalSearch: ''
  };

  // Debounced values
  const debouncedSearchFilters = useDebounce(searchFilters, searchDebounceDelay);
  const debouncedOtherFilters = useDebounce(otherFilters, filterDebounceDelay);

  /**
   * Fetch questions từ MockQuestionsService
   */
  const fetchQuestions = useCallback(async (
    currentFilters: QuestionFilters,
    isSearchRequest = false
  ): Promise<void> => {
    // Cancel previous request nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      if (isSearchRequest) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const startTime = performance.now();
      
      // Gọi MockQuestionsService với current filters
      const response = await MockQuestionsService.listQuestions(currentFilters);
      
      // Update state
      setQuestions(response.data);
      setPagination({
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages || Math.ceil(response.pagination.total / response.pagination.pageSize)
      });
      
      // Performance tracking
      const endTime = performance.now();
      setLastFetchTime(endTime - startTime);
      setFetchCount(prev => prev + 1);
      
      // Success callback
      onSuccess?.(response);
      
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching questions:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  }, [onError, onSuccess]);

  /**
   * Combine debounced filters
   */
  const combinedFilters = useCallback((): QuestionFilters => {
    return {
      ...debouncedOtherFilters,
      ...debouncedSearchFilters
    };
  }, [debouncedOtherFilters, debouncedSearchFilters]);

  /**
   * Auto fetch khi filters thay đổi
   */
  useEffect(() => {
    if (!autoFetch) return;
    
    const filters = combinedFilters();
    const hasSearchTerms = Boolean(
      filters.keyword || 
      filters.solutionKeyword || 
      filters.latexKeyword || 
      filters.globalSearch
    );
    
    fetchQuestions(filters, hasSearchTerms);
  }, [autoFetch, combinedFilters, fetchQuestions]);

  /**
   * Manual refetch
   */
  const refetch = useCallback(async (): Promise<void> => {
    const currentFilters = combinedFilters();
    await fetchQuestions(currentFilters);
  }, [combinedFilters, fetchQuestions]);

  /**
   * Set page với auto-fetch
   */
  const setPage = useCallback((page: number): void => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
  }, [filters, setFilters]);

  /**
   * Set page size với auto-fetch
   */
  const setPageSize = useCallback((pageSize: number): void => {
    const newFilters = { ...filters, pageSize, page: 1 }; // Reset về page 1
    setFilters(newFilters);
  }, [filters, setFilters]);

  /**
   * Check if có active filters
   */
  const hasActiveFilters = useCallback((): boolean => {
    const {
      grade, subject, chapter, level, lesson, form, format,
      type, status, difficulty, creator,
      source, tags, subcount, hasAnswers, hasSolution, hasImages,
      usageCount, feedback, dateRange,
      keyword, solutionKeyword, latexKeyword, globalSearch
    } = filters;

    return Boolean(
      grade?.length || subject?.length || chapter?.length || level?.length || 
      lesson?.length || form?.length || format?.length ||
      type?.length || status?.length || difficulty?.length || creator?.length ||
      source?.length || tags?.length || subcount ||
      hasAnswers !== undefined || hasSolution !== undefined || hasImages !== undefined ||
      usageCount || feedback || dateRange ||
      keyword || solutionKeyword || latexKeyword || globalSearch
    );
  }, [filters]);

  /**
   * Count active filters
   */
  const activeFilterCount = useCallback((): number => {
    const {
      grade, subject, chapter, level, lesson, form, format,
      type, status, difficulty, creator,
      source, tags, subcount, hasAnswers, hasSolution, hasImages,
      usageCount, feedback, dateRange,
      keyword, solutionKeyword, latexKeyword, globalSearch
    } = filters;

    let count = 0;
    
    // QuestionCode filters
    if (grade?.length) count++;
    if (subject?.length) count++;
    if (chapter?.length) count++;
    if (level?.length) count++;
    if (lesson?.length) count++;
    if (form?.length) count++;
    if (format?.length) count++;
    
    // Metadata filters
    if (type?.length) count++;
    if (status?.length) count++;
    if (difficulty?.length) count++;
    if (creator?.length) count++;
    
    // Content filters
    if (source?.length) count++;
    if (tags?.length) count++;
    if (subcount) count++;
    if (hasAnswers !== undefined) count++;
    if (hasSolution !== undefined) count++;
    if (hasImages !== undefined) count++;
    
    // Usage filters
    if (usageCount) count++;
    if (feedback) count++;
    if (dateRange) count++;
    
    // Search filters
    if (keyword) count++;
    if (solutionKeyword) count++;
    if (latexKeyword) count++;
    if (globalSearch) count++;
    
    return count;
  }, [filters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data state
    questions,
    pagination,
    
    // Loading states
    isLoading,
    isSearching,
    
    // Filter state
    filters,
    
    // Actions
    refetch,
    setPage,
    setPageSize,
    
    // Filter validation
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: activeFilterCount(),
    
    // Performance metrics
    lastFetchTime,
    fetchCount
  };
}
