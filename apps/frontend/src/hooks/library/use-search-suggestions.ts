/**
 * useSearchSuggestions Hook
 * React hook for search suggestions and autocomplete
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import * as LibrarySearchService from '@/services/grpc/library-search.service';

export function useSearchSuggestions(initialQuery: string = '', limit: number = 10) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery, limit],
    queryFn: () => LibrarySearchService.getSearchSuggestions(debouncedQuery, limit),
    enabled: true, // Always enabled, empty query returns trending
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    suggestions: data || [],
    isLoading,
    error,
    updateQuery,
    clearQuery,
  };
}

export function useTrendingSuggestions(limit: number = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending-suggestions', limit],
    queryFn: () => LibrarySearchService.getTrendingSuggestions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    suggestions: data || [],
    isLoading,
    error,
  };
}

export function useAutocomplete(limit: number = 10) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['autocomplete', debouncedQuery, limit],
    queryFn: async () => {
      const suggestions = await LibrarySearchService.getSearchSuggestions(debouncedQuery, limit);
      return LibrarySearchService.formatSuggestionsForAutocomplete(suggestions);
    },
    enabled: debouncedQuery.length >= 2, // Only search if query is at least 2 chars
    staleTime: 2 * 60 * 1000,
  });

  return {
    query,
    setQuery,
    suggestions: data || [],
    isLoading,
  };
}

