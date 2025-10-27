'use client';

import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuestionFilters } from '@/types/question';

const EMPTY_FILTERS: Partial<QuestionFilters> = {};

/**
 * Hook for syncing question filters with URL parameters
 * Đồng bộ hóa filter state với URL parameters
 * Hỗ trợ browser navigation (back/forward buttons)
 *
 * FIXED: Prevent infinite loop by:
 * 1. Memoizing defaultFilters
 * 2. Using refs to track update sources
 * 3. Proper initialization state
 * 4. Debounced URL updates
 */

interface UseQuestionFiltersUrlOptions {
  defaultFilters?: Partial<QuestionFilters>;
  debounceMs?: number;
}

export function useQuestionFiltersUrl(options: UseQuestionFiltersUrlOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawDefaultFilters = options.defaultFilters;
  // Memoize defaultFilters to prevent re-creation on every render
  const memoizedDefaultFilters = useMemo(
    () => (rawDefaultFilters ? { ...rawDefaultFilters } : EMPTY_FILTERS),
    [rawDefaultFilters]
  );

  /**
   * Helper function to parse filters from URL (defined before useState)
   * This is a pure function that doesn't depend on any state
   */
  const parseFiltersFromUrlHelper = (
    params: URLSearchParams,
    defaults: Partial<QuestionFilters>
  ): QuestionFilters => {
    const parsed: QuestionFilters = { ...defaults };

    // Simple string fields
    if (params.get('subcount')) parsed.subcount = params.get('subcount')!;
    if (params.get('keyword')) parsed.keyword = params.get('keyword')!;
    if (params.get('codePrefix')) parsed.codePrefix = params.get('codePrefix')!;
    if (params.get('source')) parsed.source = params.get('source')!;

    // Array fields (comma-separated) - removed 'source' as it's now a string
    const arrayFields: (keyof QuestionFilters)[] = ['grade', 'subject', 'chapter', 'lesson', 'level', 'format', 'type', 'status', 'creator', 'tags'];
    arrayFields.forEach(field => {
      const value = params.get(field);
      if (value && value !== 'all') {
        (parsed[field] as string[]) = value.split(',').filter(Boolean);
      }
    });

    // Boolean fields
    const booleanFields: (keyof QuestionFilters)[] = ['hasImages', 'hasSolution', 'hasAnswers'];
    booleanFields.forEach(field => {
      const value = params.get(field);
      if (value === 'true') {
        (parsed[field] as boolean) = true;
      }
    });

    // Range fields
    const usageMin = params.get('usageMin');
    const usageMax = params.get('usageMax');
    if (usageMin || usageMax) {
      parsed.usageCount = {
        min: usageMin ? parseInt(usageMin) : undefined,
        max: usageMax ? parseInt(usageMax) : undefined
      };
    }

    const feedbackMin = params.get('feedbackMin');
    const feedbackMax = params.get('feedbackMax');
    if (feedbackMin || feedbackMax) {
      parsed.feedback = {
        min: feedbackMin ? parseInt(feedbackMin) : undefined,
        max: feedbackMax ? parseInt(feedbackMax) : undefined
      };
    }

    // Pagination
    const page = params.get('page');
    const pageSize = params.get('pageSize');
    if (page) parsed.page = parseInt(page);
    if (pageSize) parsed.pageSize = parseInt(pageSize);

    // Sort
    if (params.get('sortBy')) parsed.sortBy = params.get('sortBy') as QuestionFilters['sortBy'];
    if (params.get('sortDir')) parsed.sortDir = params.get('sortDir') as 'asc' | 'desc';

    return parsed;
  };

  // Initialize filters from URL params on mount
  const [filters, setFilters] = useState<QuestionFilters>(() => {
    return parseFiltersFromUrlHelper(searchParams, memoizedDefaultFilters);
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldSyncUrl, setShouldSyncUrl] = useState(false);

  /**
   * Memoized version of parseFiltersFromUrl for use in effects
   */
  const parseFiltersFromUrl = useCallback(parseFiltersFromUrlHelper, []);

  /**
   * Convert filters to URL search params
   * Memoized to prevent re-creation on every render
   */
  const filtersToUrlParams = useCallback((filters: QuestionFilters): URLSearchParams => {
    const params = new URLSearchParams();

    // Simple string fields
    if (filters.subcount) params.set('subcount', filters.subcount);
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.codePrefix) params.set('codePrefix', filters.codePrefix);
    if (filters.source) params.set('source', filters.source);

    // Array fields - removed 'source' as it's now a string
    const arrayFields = ['grade', 'subject', 'chapter', 'lesson', 'level', 'format', 'type', 'status', 'creator', 'tags'];
    arrayFields.forEach(field => {
      const value = filters[field as keyof QuestionFilters];
      if (Array.isArray(value) && value.length > 0) {
        params.set(field, value.join(','));
      }
    });

    // Boolean fields
    const booleanFields = ['hasImages', 'hasSolution', 'hasAnswers'];
    booleanFields.forEach(field => {
      const value = filters[field as keyof QuestionFilters];
      if (value === true) {
        params.set(field, 'true');
      }
    });

    // Range fields
    if (filters.usageCount) {
      if (filters.usageCount.min !== undefined) {
        params.set('usageMin', filters.usageCount.min.toString());
      }
      if (filters.usageCount.max !== undefined) {
        params.set('usageMax', filters.usageCount.max.toString());
      }
    }

    if (filters.feedback) {
      if (filters.feedback.min !== undefined) {
        params.set('feedbackMin', filters.feedback.min.toString());
      }
      if (filters.feedback.max !== undefined) {
        params.set('feedbackMax', filters.feedback.max.toString());
      }
    }

    // Pagination
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    }
    if (filters.pageSize && filters.pageSize !== 20) {
      params.set('pageSize', filters.pageSize.toString());
    }

    // Sort
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortDir && filters.sortDir !== 'desc') {
      params.set('sortDir', filters.sortDir);
    }

    return params;
  }, []); // Empty deps - pure function

  /**
   * Update filters and sync with URL
   */
  const updateFilters = useCallback((newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };

      // Reset page to 1 when filters change (except when page itself is being updated)
      if (!('page' in newFilters) && Object.keys(newFilters).length > 0) {
        updated.page = 1;
      }

      return updated;
    });

    // Trigger URL sync after state update
    setShouldSyncUrl(true);
  }, []);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    const resetFilters = { ...memoizedDefaultFilters, page: 1 };
    setFilters(resetFilters);

    // Trigger URL sync after state update
    setShouldSyncUrl(true);
  }, [memoizedDefaultFilters]);

  /**
   * Get clean filters (remove undefined/empty values)
   * FIXED: Use useCallback with proper dependencies to prevent re-creation
   */
  const getCleanFilters = useCallback((): QuestionFilters => {
    const clean: QuestionFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          return; // Skip empty arrays
        }
        clean[key as keyof QuestionFilters] = value;
      }
    });

    return clean;
  }, [filters]); // Depend on filters

  // Sync filters to URL when filters change (with debounce)
  // Use refs to track state and prevent circular updates
  const _isUpdatingFromUrlRef = useRef(false);
  const _currentFiltersRef = useRef<QuestionFilters>(filters);

  // Update ref whenever filters change
  useEffect(() => {
    _currentFiltersRef.current = filters;
  }, [filters]);

  // FIXED: Initialize on mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // FIXED: Listen to URL changes (browser navigation) with memoized defaultFilters
  useEffect(() => {
    const newFilters = parseFiltersFromUrl(searchParams, memoizedDefaultFilters);

    // Use ref to compare with current filters to avoid stale closure
    const currentFiltersString = JSON.stringify(_currentFiltersRef.current);
    const newFiltersString = JSON.stringify(newFilters);
    const filtersChanged = newFiltersString !== currentFiltersString;

    if (filtersChanged) {
      // Set flag to prevent URL sync effect from running
      _isUpdatingFromUrlRef.current = true;
      setFilters(newFilters);

      // Reset flag after state update
      setTimeout(() => {
        _isUpdatingFromUrlRef.current = false;
      }, 0);
    }
  }, [searchParams, memoizedDefaultFilters, parseFiltersFromUrl]);

  // FIXED: Sync URL when shouldSyncUrl flag is set (with debouncing)
  useEffect(() => {
    if (shouldSyncUrl && !_isUpdatingFromUrlRef.current) {
      // Debounce URL updates to prevent rapid-fire API calls
      const timeoutId = setTimeout(() => {
        const params = filtersToUrlParams(filters);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
        setShouldSyncUrl(false);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [shouldSyncUrl, filters, router, filtersToUrlParams]);

  return {
    filters,
    updateFilters,
    resetFilters,
    getCleanFilters,
    isInitialized
  };
}
