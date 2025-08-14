/**
 * useClientSearch Hook
 * Client-side search hook với debouncing và performance optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/lib/types/question';
import { 
  searchQuestions, 
  multiTermSearch, 
  SearchOptions, 
  SearchResult, 
  DEFAULT_SEARCH_OPTIONS 
} from '@/lib/utils/search-utils';
import { useDebounce } from './useDebounce';

// ===== TYPES =====

export interface UseClientSearchOptions extends SearchOptions {
  /** Debounce delay (ms) */
  debounceDelay?: number;
  /** Auto search khi query thay đổi */
  autoSearch?: boolean;
  /** Multi-term search support */
  multiTerm?: boolean;
  /** Callback khi search hoàn thành */
  onSearchComplete?: (results: SearchResult[], query: string) => void;
  /** Callback khi có lỗi */
  onError?: (error: Error) => void;
}

export interface UseClientSearchReturn {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Search results */
  results: SearchResult[];
  /** Đang search hay không */
  isSearching: boolean;
  /** Có kết quả hay không */
  hasResults: boolean;
  /** Số lượng kết quả */
  resultCount: number;
  /** Perform search manually */
  search: (searchQuery?: string) => void;
  /** Clear search */
  clearSearch: () => void;
  /** Search options */
  searchOptions: SearchOptions;
  /** Update search options */
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  /** Performance metrics */
  searchTime: number;
  /** Error state */
  error: Error | null;
}

// ===== HOOK =====

/**
 * useClientSearch Hook
 * Comprehensive client-side search với performance optimization
 */
export function useClientSearch(
  questions: Question[],
  options: UseClientSearchOptions = {}
): UseClientSearchReturn {
  const {
    debounceDelay = 300,
    autoSearch = true,
    multiTerm = true,
    onSearchComplete,
    onError,
    ...searchOptions
  } = options;

  // ===== STATE =====

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [currentSearchOptions, setCurrentSearchOptions] = useState<SearchOptions>({
    ...DEFAULT_SEARCH_OPTIONS,
    ...searchOptions
  });

  // ===== DEBOUNCED QUERY =====

  const debouncedQuery = useDebounce(query, debounceDelay);

  // ===== MEMOIZED VALUES =====

  /**
   * Memoized search function cho performance
   */
  const performSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    
    try {
      const startTime = performance.now();
      
      let searchResults: SearchResult[];
      
      if (multiTerm && searchQuery.includes(' ')) {
        // Multi-term search
        searchResults = multiTermSearch(questions, searchQuery, currentSearchOptions);
      } else {
        // Single-term search
        searchResults = searchQuestions(questions, searchQuery, currentSearchOptions);
      }
      
      const endTime = performance.now();
      setSearchTime(endTime - startTime);
      
      return searchResults;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      onError?.(error);
      return [];
    }
  }, [questions, currentSearchOptions, multiTerm, onError]);

  /**
   * Manual search function
   */
  const search = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery ?? query;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = performSearch(queryToSearch);
      setResults(searchResults);
      onSearchComplete?.(searchResults, queryToSearch);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsSearching(false);
    }
  }, [query, performSearch, onSearchComplete, onError]);

  /**
   * Clear search function
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setSearchTime(0);
  }, []);

  /**
   * Update search options
   */
  const setSearchOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setCurrentSearchOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // ===== EFFECTS =====

  /**
   * Auto search khi debounced query thay đổi
   */
  useEffect(() => {
    if (autoSearch && debouncedQuery !== query) {
      // Only search if query has actually changed và not empty
      if (debouncedQuery.trim()) {
        // Inline search logic để avoid circular dependency
        setIsSearching(true);
        setError(null);

        try {
          const searchResults = performSearch(debouncedQuery);
          setResults(searchResults);
          onSearchComplete?.(searchResults, debouncedQuery);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Search failed');
          setError(error);
          onError?.(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setError(null);
      }
    }
  }, [debouncedQuery, autoSearch, query, performSearch, onSearchComplete, onError]);

  /**
   * Clear results khi questions thay đổi
   */
  useEffect(() => {
    if (query.trim()) {
      // Re-search với new questions - inline logic để avoid circular dependency
      setIsSearching(true);
      setError(null);

      try {
        const searchResults = performSearch(query);
        setResults(searchResults);
        onSearchComplete?.(searchResults, query);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Search failed');
        setError(error);
        onError?.(error);
      } finally {
        setIsSearching(false);
      }
    }
  }, [questions, query, performSearch, onSearchComplete, onError]); // Include all dependencies

  // ===== COMPUTED VALUES =====

  const hasResults = results.length > 0;
  const resultCount = results.length;

  // ===== RETURN =====

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    resultCount,
    search,
    clearSearch,
    searchOptions: currentSearchOptions,
    setSearchOptions,
    searchTime,
    error
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * Quick search hook với minimal options
 */
export function useQuickSearch(questions: Question[], debounceDelay = 300) {
  return useClientSearch(questions, {
    debounceDelay,
    autoSearch: true,
    multiTerm: true,
    fuzzy: true,
    threshold: 0.3
  });
}

/**
 * Advanced search hook với full options
 */
export function useAdvancedSearch(questions: Question[], options: UseClientSearchOptions = {}) {
  return useClientSearch(questions, {
    debounceDelay: 300,
    autoSearch: true,
    multiTerm: true,
    fuzzy: true,
    threshold: 0.2,
    maxResults: 50,
    ...options
  });
}
