/**
 * Use Featured Questions Hook
 * React Query hook cho featured questions data fetching
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { PublicQuestionService } from '@/services/public';
import { PublicQuestion, PublicQuestionListResponse } from '@/types/public';

// ===== TYPES =====

/**
 * Use Featured Questions Options Interface
 * Options cho useFeaturedQuestions hook
 */
export interface UseFeaturedQuestionsOptions {
  limit?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Featured Questions Query Result Interface
 * Result structure cho featured questions query
 */
export interface FeaturedQuestionsQueryResult {
  data: PublicQuestion[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
  isFetching: boolean;
}

// ===== CONSTANTS =====

/**
 * Default query options cho featured questions
 */
const DEFAULT_FEATURED_QUESTIONS_OPTIONS = {
  limit: 5,
  enabled: true,
  refetchOnWindowFocus: false,
  refetchInterval: undefined,
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000     // 30 minutes
};

/**
 * Query keys cho featured questions
 */
export const FEATURED_QUESTIONS_QUERY_KEYS = {
  all: ['featured-questions'] as const,
  list: (limit: number) => [...FEATURED_QUESTIONS_QUERY_KEYS.all, 'list', limit] as const,
};

// ===== MAIN HOOK =====

/**
 * Use Featured Questions Hook
 * React Query hook để fetch featured questions data
 * 
 * Features:
 * - Automatic caching với 10min stale time
 * - Error handling với retry logic
 * - Loading states management
 * - Configurable limit và options
 * - Optimized for featured questions display
 * 
 * @param options - Hook configuration options
 * @returns Query result với featured questions data
 */
export function useFeaturedQuestions(
  options: UseFeaturedQuestionsOptions = {}
): FeaturedQuestionsQueryResult {
  // ===== MERGE OPTIONS =====
  
  const mergedOptions = {
    ...DEFAULT_FEATURED_QUESTIONS_OPTIONS,
    ...options
  };
  
  const { limit, enabled, refetchOnWindowFocus, refetchInterval, staleTime, gcTime } = mergedOptions;
  
  // ===== QUERY CONFIGURATION =====
  
  const queryOptions: UseQueryOptions<PublicQuestionListResponse, Error, PublicQuestion[]> = {
    queryKey: FEATURED_QUESTIONS_QUERY_KEYS.list(limit),
    queryFn: () => PublicQuestionService.getFeaturedQuestions(limit),
    enabled,
    refetchOnWindowFocus,
    refetchInterval,
    staleTime,
    gcTime,
    
    // Transform response to extract data array
    select: (response: PublicQuestionListResponse) => response.data,
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && 'status' in error && typeof error.status === 'number') {
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  };
  
  // ===== EXECUTE QUERY =====
  
  const queryResult = useQuery(queryOptions);
  
  // ===== RETURN FORMATTED RESULT =====
  
  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isSuccess: queryResult.isSuccess,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * Use Featured Questions for Homepage
 * Specialized hook cho homepage featured questions (limit 3)
 */
export function useFeaturedQuestionsHomepage() {
  return useFeaturedQuestions({
    limit: 3,
    staleTime: 15 * 60 * 1000, // 15 minutes for homepage
    gcTime: 60 * 60 * 1000     // 1 hour cache
  });
}

/**
 * Use Featured Questions for Landing
 * Specialized hook cho landing page featured questions (limit 5)
 */
export function useFeaturedQuestionsLanding() {
  return useFeaturedQuestions({
    limit: 5,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000     // 30 minutes cache
  });
}

/**
 * Use Featured Questions with Auto Refresh
 * Hook với automatic refresh cho dynamic content
 */
export function useFeaturedQuestionsAutoRefresh(intervalMs: number = 5 * 60 * 1000) {
  return useFeaturedQuestions({
    limit: 5,
    refetchInterval: intervalMs,
    refetchOnWindowFocus: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000    // 10 minutes cache
  });
}

// ===== UTILITY FUNCTIONS =====

/**
 * Prefetch featured questions
 * Utility function để prefetch featured questions data
 */
export function prefetchFeaturedQuestions(queryClient: unknown, limit: number = 5) {
  const client = queryClient as { prefetchQuery: (options: unknown) => Promise<unknown> };
  return client.prefetchQuery({
    queryKey: FEATURED_QUESTIONS_QUERY_KEYS.list(limit),
    queryFn: () => PublicQuestionService.getFeaturedQuestions(limit),
    staleTime: 10 * 60 * 1000
  });
}

/**
 * Invalidate featured questions cache
 * Utility function để invalidate featured questions cache
 */
export function invalidateFeaturedQuestions(queryClient: unknown) {
  const client = queryClient as { invalidateQueries: (options: unknown) => Promise<unknown> };
  return client.invalidateQueries({
    queryKey: FEATURED_QUESTIONS_QUERY_KEYS.all
  });
}

// ===== EXPORTS =====

export default useFeaturedQuestions;
