/**
 * Public Questions Hooks
 * React hooks cho public question operations theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicQuestionService } from '@/lib/services/public';
import {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  PublicQuestionStats,
  DEFAULT_PUBLIC_QUESTION_FILTERS
} from '@/lib/types/public';

// ===== QUERY KEYS =====

/**
 * Query keys cho public questions
 * Centralized query key management
 */
export const PUBLIC_QUESTION_QUERY_KEYS = {
  all: ['public-questions'] as const,
  lists: () => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: PublicQuestionFilters) => [...PUBLIC_QUESTION_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PUBLIC_QUESTION_QUERY_KEYS.details(), id] as const,
  search: (query: string, filters?: PublicQuestionFilters) => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'search', query, filters] as const,
  categories: () => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'categories'] as const,
  stats: () => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'stats'] as const,
  featured: (limit?: number) => [...PUBLIC_QUESTION_QUERY_KEYS.all, 'featured', limit] as const,
} as const;

// ===== CONFIGURATION =====

/**
 * Default query options cho public questions
 */
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// ===== MAIN HOOKS =====

/**
 * Hook cho browsing questions với filters và pagination
 */
export function usePublicQuestions(
  filters: PublicQuestionFilters = DEFAULT_PUBLIC_QUESTION_FILTERS,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.list(filters),
    queryFn: () => PublicQuestionService.browseQuestions(filters),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook cho getting single question detail
 */
export function usePublicQuestion(
  id: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.detail(id),
    queryFn: () => PublicQuestionService.getQuestion(id),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: (options?.enabled ?? true) && !!id,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

/**
 * Hook cho searching questions
 */
export function usePublicQuestionSearch(
  query: string,
  filters: PublicQuestionFilters = DEFAULT_PUBLIC_QUESTION_FILTERS,
  options?: {
    enabled?: boolean;
    debounceMs?: number;
  }
) {
  const enabled = (options?.enabled ?? true) && query.length >= 2;
  
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.search(query, filters),
    queryFn: () => PublicQuestionService.searchQuestions(query, filters),
    ...DEFAULT_QUERY_OPTIONS,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Hook cho getting featured questions
 */
export function useFeaturedQuestions(
  limit: number = 6,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.featured(limit),
    queryFn: () => PublicQuestionService.getFeaturedQuestions(limit),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook cho getting question categories
 */
export function useQuestionCategories(
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.categories(),
    queryFn: () => PublicQuestionService.getCategories(),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: options?.enabled ?? true,
    staleTime: 15 * 60 * 1000, // 15 minutes (categories change rarely)
  });
}

/**
 * Hook cho getting question statistics
 */
export function useQuestionStats(
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.stats(),
    queryFn: () => PublicQuestionService.getStatistics(),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook cho getting questions by category
 */
export function useQuestionsByCategory(
  categoryId: string,
  filters: Omit<PublicQuestionFilters, 'category'> = {},
  options?: {
    enabled?: boolean;
  }
) {
  const categoryFilters: PublicQuestionFilters = {
    ...filters,
    category: [categoryId]
  };

  return useQuery({
    queryKey: PUBLIC_QUESTION_QUERY_KEYS.list(categoryFilters),
    queryFn: () => PublicQuestionService.getQuestionsByCategory(categoryId, filters),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: (options?.enabled ?? true) && !!categoryId,
  });
}

// ===== MUTATION HOOKS =====

/**
 * Hook cho prefetching question detail
 * Useful cho hover effects và preloading
 */
export function usePrefetchQuestion() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: PUBLIC_QUESTION_QUERY_KEYS.detail(id),
      queryFn: () => PublicQuestionService.getQuestion(id),
      staleTime: DEFAULT_QUERY_OPTIONS.staleTime,
    });
  };
}

/**
 * Hook cho invalidating question queries
 * Useful cho cache management
 */
export function useInvalidateQuestions() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_QUESTION_QUERY_KEYS.all,
      });
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_QUESTION_QUERY_KEYS.lists(),
      });
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_QUESTION_QUERY_KEYS.detail(id),
      });
    },
    invalidateCategories: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_QUESTION_QUERY_KEYS.categories(),
      });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({
        queryKey: PUBLIC_QUESTION_QUERY_KEYS.stats(),
      });
    },
  };
}

// ===== UTILITY HOOKS =====

/**
 * Hook cho getting cached question data
 * Useful cho optimistic updates
 */
export function useCachedQuestion(id: string): PublicQuestion | undefined {
  const queryClient = useQueryClient();
  
  return queryClient.getQueryData<PublicQuestionResponse>(
    PUBLIC_QUESTION_QUERY_KEYS.detail(id)
  )?.data;
}

/**
 * Hook cho getting cached questions list
 */
export function useCachedQuestions(
  filters: PublicQuestionFilters
): PublicQuestion[] | undefined {
  const queryClient = useQueryClient();
  
  return queryClient.getQueryData<PublicQuestionListResponse>(
    PUBLIC_QUESTION_QUERY_KEYS.list(filters)
  )?.data;
}

/**
 * Hook cho setting question data in cache
 * Useful cho optimistic updates
 */
export function useSetQuestionCache() {
  const queryClient = useQueryClient();

  return {
    setQuestion: (id: string, question: PublicQuestion) => {
      queryClient.setQueryData(
        PUBLIC_QUESTION_QUERY_KEYS.detail(id),
        (old: PublicQuestionResponse | undefined) => ({
          ...old,
          data: question,
        } as PublicQuestionResponse)
      );
    },
    setQuestions: (filters: PublicQuestionFilters, questions: PublicQuestion[]) => {
      queryClient.setQueryData(
        PUBLIC_QUESTION_QUERY_KEYS.list(filters),
        (old: PublicQuestionListResponse | undefined) => ({
          ...old,
          data: questions,
        } as PublicQuestionListResponse)
      );
    },
  };
}

// ===== EXPORT TYPES =====

export type {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  PublicQuestionStats
};
