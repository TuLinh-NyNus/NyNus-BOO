'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuestionFilters } from '@/lib/types/question';

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
  const { defaultFilters = {}, debounceMs = 300 } = options;

  const [filters, setFilters] = useState<QuestionFilters>(() => {
    // Initialize filters from URL params on mount
    return parseFiltersFromUrl(searchParams, defaultFilters);
  });

  const [isInitialized, setIsInitialized] = useState(false);

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

    // Array fields (comma-separated)
    const arrayFields = ['grade', 'subject', 'chapter', 'lesson', 'level', 'format', 'type', 'status', 'creator', 'source', 'tags'];
    arrayFields.forEach(field => {
      const value = params.get(field);
      if (value && value !== 'all') {
        parsed[field as keyof QuestionFilters] = value.split(',').filter(Boolean);
      }
    });

    // Boolean fields
    const booleanFields = ['hasImages', 'hasSolution', 'hasAnswers'];
    booleanFields.forEach(field => {
      const value = params.get(field);
      if (value === 'true') {
        parsed[field as keyof QuestionFilters] = true;
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
    if (params.get('sortBy')) parsed.sortBy = params.get('sortBy') as any;
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

    // Array fields
    const arrayFields = ['grade', 'subject', 'chapter', 'lesson', 'level', 'format', 'type', 'status', 'creator', 'source', 'tags'];
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
  const updateUrl = useCallback((newFilters: QuestionFilters) => {
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
  }, []);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    const resetFilters = { ...defaultFilters, page: 1 };
    setFilters(resetFilters);
  }, [defaultFilters]);

  /**
   * Get clean filters (remove undefined/empty values)
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
  }, [filters]);

  // Sync filters to URL when filters change (with debounce)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      updateUrl(filters);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, updateUrl, debounceMs, isInitialized]);

  // Listen to URL changes (browser navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const newFilters = parseFiltersFromUrl(searchParams, defaultFilters);
      setFilters(newFilters);
    };

    // Only update if URL actually changed
    const currentParams = filtersToUrlParams(filters);
    const urlParams = new URLSearchParams(window.location.search);
    
    if (currentParams.toString() !== urlParams.toString()) {
      handleUrlChange();
    }
  }, [searchParams, defaultFilters, filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    getCleanFilters,
    isInitialized
  };
}
