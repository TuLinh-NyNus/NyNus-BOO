'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuestionFilters } from '@/types/question';

/**
 * Hook for syncing question filters with URL parameters
 * Đồng bộ hóa filter state với URL parameters
 * Hỗ trợ browser navigation (back/forward buttons)
 */

interface UseQuestionFiltersUrlOptions {
  defaultFilters?: Partial<QuestionFilters>;
  debounceMs?: number;
}

export function useQuestionFiltersUrl(options: UseQuestionFiltersUrlOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultFilters = {} } = options;

  const [filters, setFilters] = useState<QuestionFilters>(() => {
    // Initialize filters from URL params on mount
    return parseFiltersFromUrl(searchParams, defaultFilters);
  });

  const [isInitialized] = useState(false);
  const [shouldSyncUrl, setShouldSyncUrl] = useState(false);

  /**
   * Parse filters from URL search params
   */
  function parseFiltersFromUrl(
    params: URLSearchParams, 
    defaults: Partial<QuestionFilters>
  ): QuestionFilters {
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
  }

  /**
   * Convert filters to URL search params
   */
  function filtersToUrlParams(filters: QuestionFilters): URLSearchParams {
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
  }

  /**
   * Update URL with current filters
   */
  const _updateUrl = useCallback((newFilters: QuestionFilters) => {
    const params = filtersToUrlParams(newFilters);
    const url = params.toString() ? `?${params.toString()}` : '';

    // Use replace to avoid creating too many history entries
    router.replace(url, { scroll: false });
  }, [router]);

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
    const resetFilters = { ...defaultFilters, page: 1 };
    setFilters(resetFilters);

    // Trigger URL sync after state update
    setShouldSyncUrl(true);
  }, [defaultFilters]);

  /**
   * Get clean filters (remove undefined/empty values)
   * Not using useCallback to avoid dependency issues
   */
  const getCleanFilters = (): QuestionFilters => {
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
  };

  // Sync filters to URL when filters change (with debounce)
  // Use refs to track state and prevent circular updates
  const _prevFiltersForUrlRef = useRef<QuestionFilters | null>(null);
  const _isUpdatingFromUrlRef = useRef(false);
  const _currentFiltersRef = useRef<QuestionFilters>(filters);

  // Update ref whenever filters change
  useEffect(() => {
    _currentFiltersRef.current = filters;
  }, [filters]);

  // useEffect(() => {
  //   if (!isInitialized) {
  //     return;
  //   }

  //   // Skip if we're updating from URL
  //   if (isUpdatingFromUrlRef.current) {
  //     return;
  //   }

  //   // Only update URL if filters actually changed
  //   const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersForUrlRef.current);

  //   if (!filtersChanged) {
  //     return;
  //   }

  //   const timeoutId = setTimeout(() => {
  //     prevFiltersForUrlRef.current = filters;
  //     const params = filtersToUrlParams(filters);
  //     const url = params.toString() ? `?${params.toString()}` : '';
  //     router.replace(url, { scroll: false });
  //   }, debounceMs);

  //   return () => clearTimeout(timeoutId);
  // }, [filters, debounceMs, isInitialized, router]);

  // Listen to URL changes (browser navigation)
  useEffect(() => {
    const newFilters = parseFiltersFromUrl(searchParams, defaultFilters);

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
  }, [searchParams, defaultFilters]);

  // Sync URL when shouldSyncUrl flag is set (with debouncing)
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
  }, [shouldSyncUrl, filters, router]);

  return {
    filters,
    updateFilters,
    resetFilters,
    getCleanFilters,
    isInitialized
  };
}
