/**
 * useFilterUrlSync Hook
 * Hook để sync filter state với URL parameters
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuestionFilters, QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';

/**
 * Hook để sync filter state với URL parameters
 * Hỗ trợ browser navigation và persistence
 */
export function useFilterUrlSync(initialFilters: QuestionFilters = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<QuestionFilters>(initialFilters);

  /**
   * Parse URL parameters thành filter object
   */
  const parseFiltersFromUrl = useCallback((): QuestionFilters => {
    const urlFilters: QuestionFilters = {};

    // Basic filters
    const keyword = searchParams.get('keyword');
    if (keyword) urlFilters.keyword = keyword;

    const subcount = searchParams.get('subcount');
    if (subcount) urlFilters.subcount = subcount;

    const type = searchParams.get('type');
    if (type && type !== 'all') urlFilters.type = type as QuestionType;

    const status = searchParams.get('status');
    if (status && status !== 'all') urlFilters.status = status as QuestionStatus;

    const difficulty = searchParams.get('difficulty');
    if (difficulty && difficulty !== 'all') urlFilters.difficulty = difficulty as QuestionDifficulty;

    // QuestionCode filters
    const grade = searchParams.get('grade');
    if (grade) urlFilters.grade = [grade];

    const subject = searchParams.get('subject');
    if (subject) urlFilters.subject = [subject];

    const chapter = searchParams.get('chapter');
    if (chapter) urlFilters.chapter = [chapter];

    const lesson = searchParams.get('lesson');
    if (lesson) urlFilters.lesson = [lesson];

    const level = searchParams.get('level');
    if (level) urlFilters.level = [level];

    const format = searchParams.get('format');
    if (format) urlFilters.format = [format as 'ID5' | 'ID6'];

    // Advanced filters
    const globalSearch = searchParams.get('globalSearch');
    if (globalSearch) urlFilters.globalSearch = globalSearch;

    const source = searchParams.get('source');
    if (source) urlFilters.source = [source];

    const creator = searchParams.get('creator');
    if (creator) urlFilters.creator = [creator];

    const tags = searchParams.get('tags');
    if (tags) urlFilters.tags = tags.split(',');

    // Boolean filters
    const hasImages = searchParams.get('hasImages');
    if (hasImages === 'true') urlFilters.hasImages = true;

    const hasSolution = searchParams.get('hasSolution');
    if (hasSolution === 'true') urlFilters.hasSolution = true;

    const hasAnswers = searchParams.get('hasAnswers');
    if (hasAnswers === 'true') urlFilters.hasAnswers = true;

    // Range filters
    const usageMin = searchParams.get('usageMin');
    const usageMax = searchParams.get('usageMax');
    if (usageMin || usageMax) {
      urlFilters.usageCount = {
        min: usageMin ? parseInt(usageMin) : undefined,
        max: usageMax ? parseInt(usageMax) : undefined
      };
    }

    // Pagination
    const page = searchParams.get('page');
    if (page) urlFilters.page = parseInt(page);

    const pageSize = searchParams.get('pageSize');
    if (pageSize) urlFilters.pageSize = parseInt(pageSize);

    return urlFilters;
  }, [searchParams]);

  /**
   * Convert filter object thành URL parameters
   */
  const filtersToUrlParams = useCallback((filters: QuestionFilters): URLSearchParams => {
    const params = new URLSearchParams();

    // Basic filters
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.subcount) params.set('subcount', filters.subcount);
    if (filters.type) params.set('type', Array.isArray(filters.type) ? filters.type.join(',') : filters.type.toString());
    if (filters.status) params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status.toString());
    if (filters.difficulty) params.set('difficulty', Array.isArray(filters.difficulty) ? filters.difficulty.join(',') : filters.difficulty.toString());

    // QuestionCode filters
    if (filters.grade?.[0]) params.set('grade', filters.grade[0]);
    if (filters.subject?.[0]) params.set('subject', filters.subject[0]);
    if (filters.chapter?.[0]) params.set('chapter', filters.chapter[0]);
    if (filters.lesson?.[0]) params.set('lesson', filters.lesson[0]);
    if (filters.level?.[0]) params.set('level', filters.level[0]);
    if (filters.format?.[0]) params.set('format', filters.format[0]);

    // Advanced filters
    if (filters.globalSearch) params.set('globalSearch', filters.globalSearch);
    if (filters.source?.[0]) params.set('source', filters.source[0]);
    if (filters.creator?.[0]) params.set('creator', filters.creator[0]);
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));

    // Boolean filters
    if (filters.hasImages) params.set('hasImages', 'true');
    if (filters.hasSolution) params.set('hasSolution', 'true');
    if (filters.hasAnswers) params.set('hasAnswers', 'true');

    // Range filters
    if (filters.usageCount?.min) params.set('usageMin', filters.usageCount.min.toString());
    if (filters.usageCount?.max) params.set('usageMax', filters.usageCount.max.toString());

    // Pagination
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.pageSize && filters.pageSize !== 20) params.set('pageSize', filters.pageSize.toString());

    return params;
  }, []);

  /**
   * Update URL với new filters
   */
  const updateUrl = useCallback((newFilters: QuestionFilters) => {
    const params = filtersToUrlParams(newFilters);
    const url = params.toString() ? `?${params.toString()}` : '';
    router.push(url, { scroll: false });
  }, [router, filtersToUrlParams]);

  /**
   * Update filters và sync với URL
   */
  const updateFilters = useCallback((newFilters: QuestionFilters | ((prev: QuestionFilters) => QuestionFilters)) => {
    const updatedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters;
    setFilters(updatedFilters);
    updateUrl(updatedFilters);
  }, [filters, updateUrl]);

  /**
   * Reset tất cả filters về mặc định
   */
  const resetFilters = useCallback(() => {
    const defaultFilters: QuestionFilters = {};
    setFilters(defaultFilters);
    updateUrl(defaultFilters);
  }, [updateUrl]);

  /**
   * Load filters từ URL khi component mount
   */
  useEffect(() => {
    const urlFilters = parseFiltersFromUrl();
    setFilters(urlFilters);
  }, [parseFiltersFromUrl]);

  return {
    filters,
    updateFilters,
    resetFilters,
    setFilters: updateFilters
  };
}

/**
 * Hook để debounce filter updates
 */
export function useDebounceFilter(value: string, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
