/**
 * Use Admin Search Hook
 * Hook cho admin search functionality và suggestions
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchSuggestion, SearchResult } from '@/types/admin/header';
import { MockSearchAPI, SearchUtils, SEARCH_CONFIG } from '@/lib/admin-search';

/**
 * Search State Interface
 * Interface cho search state
 */
interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

/**
 * Search Actions Interface
 * Interface cho search actions
 */
interface SearchActions {
  performSearch: (query: string, category?: string) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSelectedCategory: (category: string | null) => void;
  trackSearchEvent: (eventType: string, data: Record<string, unknown>) => void;
}

/**
 * Use Admin Search Return Type
 * Return type cho useAdminSearch hook
 */
interface UseAdminSearchReturn {
  state: SearchState;
  actions: SearchActions;
  // Convenience getters
  query: string;
  suggestions: SearchSuggestion[];
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  // Convenience actions
  performSearch: (query: string, category?: string) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSelectedCategory: (category: string | null) => void;
}

/**
 * Use Admin Search Hook
 * Main hook cho admin search functionality
 */
export function useAdminSearch(): UseAdminSearchReturn {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    suggestions: [],
    results: [],
    isLoading: false,
    error: null,
    selectedCategory: null
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform search
   * Thực hiện search với debouncing
   */
  const performSearch = useCallback(async (query: string, category?: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Update query immediately
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null
    }));

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const formattedQuery = SearchUtils.formatSearchQuery(query);
        
        if (formattedQuery.length < SEARCH_CONFIG.minQueryLength) {
          setSearchState(prev => ({
            ...prev,
            results: [],
            isLoading: false
          }));
          return;
        }

        // Perform search
        const results = await MockSearchAPI.search(formattedQuery, category);

        setSearchState(prev => ({
          ...prev,
          results,
          isLoading: false,
          selectedCategory: category || null
        }));

        // Track search event
        SearchUtils.trackSearchEvent('search_performed', {
          query: formattedQuery,
          category,
          resultCount: results.length
        });

      } catch (error) {
        setSearchState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Search failed',
          isLoading: false
        }));
      }
    }, SEARCH_CONFIG.searchDelay);
  }, []);

  /**
   * Get search suggestions
   * Lấy search suggestions
   */
  const getSuggestions = useCallback(async (query: string) => {
    try {
      setSearchState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const suggestions = await MockSearchAPI.getSuggestions(query);

      setSearchState(prev => ({
        ...prev,
        suggestions,
        isLoading: false
      }));

      // Track suggestions event
      SearchUtils.trackSearchEvent('suggestions_loaded', {
        query,
        suggestionCount: suggestions.length
      });

    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load suggestions',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Clear search
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    // Clear timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchState({
      query: '',
      suggestions: [],
      results: [],
      isLoading: false,
      error: null,
      selectedCategory: null
    });

    // Track clear event
    SearchUtils.trackSearchEvent('search_cleared', {});
  }, []);

  /**
   * Set selected category
   * Set category filter
   */
  const setSelectedCategory = useCallback((category: string | null) => {
    setSearchState(prev => ({
      ...prev,
      selectedCategory: category
    }));

    // Re-perform search with new category if query exists
    if (searchState.query && searchState.query.length >= SEARCH_CONFIG.minQueryLength) {
      performSearch(searchState.query, category || undefined);
    }
  }, [searchState.query, performSearch]);

  /**
   * Track search event
   * Track search events cho analytics
   */
  const trackSearchEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    SearchUtils.trackSearchEvent(eventType, data);
  }, []);

  // Create actions object
  const actions: SearchActions = {
    performSearch,
    getSuggestions,
    clearSearch,
    setSelectedCategory,
    trackSearchEvent
  };

  return {
    state: searchState,
    actions,
    // Convenience getters
    query: searchState.query,
    suggestions: searchState.suggestions,
    results: searchState.results,
    isLoading: searchState.isLoading,
    error: searchState.error,
    selectedCategory: searchState.selectedCategory,
    // Convenience actions
    performSearch,
    getSuggestions,
    clearSearch,
    setSelectedCategory
  };
}

/**
 * Use Search Suggestions Hook
 * Hook để lấy search suggestions
 */
export function useSearchSuggestions(query: string): {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
} {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < SEARCH_CONFIG.minQueryLength) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await MockSearchAPI.getSuggestions(searchQuery);
      setSuggestions(results);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced suggestions loading
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedLoadSuggestions = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      loadSuggestions(query);
    }, SEARCH_CONFIG.searchDelay);
  }, [loadSuggestions]);

  // Load suggestions when query changes
  useEffect(() => {
    debouncedLoadSuggestions(query);
  }, [query, debouncedLoadSuggestions]);

  return { suggestions, isLoading, error };
}

/**
 * Use Search Results Hook
 * Hook để lấy search results
 */
export function useSearchResults(query: string, category?: string): {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
} {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async (searchQuery: string, searchCategory?: string) => {
    if (!searchQuery || searchQuery.length < SEARCH_CONFIG.minQueryLength) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const searchResults = await MockSearchAPI.search(searchQuery, searchCategory);
      setResults(searchResults);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced results loading
  const resultsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedLoadResults = useCallback((query: string, category?: string) => {
    if (resultsTimeoutRef.current) {
      clearTimeout(resultsTimeoutRef.current);
    }
    resultsTimeoutRef.current = setTimeout(() => {
      loadResults(query, category);
    }, SEARCH_CONFIG.searchDelay);
  }, [loadResults]);

  // Load results when query or category changes
  useEffect(() => {
    debouncedLoadResults(query, category);
  }, [query, category, debouncedLoadResults]);

  return { results, isLoading, error };
}

/**
 * Use Search Keyboard Shortcuts Hook
 * Hook cho keyboard shortcuts
 */
export function useSearchKeyboardShortcuts(
  onOpenSearch: () => void,
  onCloseSearch: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open search with Cmd+K
      if (SearchUtils.matchesShortcut(event, SEARCH_CONFIG.shortcuts.open)) {
        event.preventDefault();
        onOpenSearch();
      }

      // Close search with Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch, onCloseSearch]);
}
