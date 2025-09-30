/**
 * Public Hooks Index
 * Barrel exports cho public hooks theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== QUESTION HOOKS =====

// Main hooks
export {
  usePublicQuestions,
  usePublicQuestion,
  usePublicQuestionSearch,
  useQuestionCategories,
  useQuestionStats,
  useQuestionsByCategory
} from './use-public-questions';

// Featured questions hooks
export {
  useFeaturedQuestions,
  useFeaturedQuestionsHomepage,
  useFeaturedQuestionsLanding,
  useFeaturedQuestionsAutoRefresh,
  prefetchFeaturedQuestions,
  invalidateFeaturedQuestions,
  FEATURED_QUESTIONS_QUERY_KEYS
} from './use-featured-questions';

// Utility hooks
export {
  usePrefetchQuestion,
  useInvalidateQuestions,
  useCachedQuestion,
  useCachedQuestions,
  useSetQuestionCache
} from './use-public-questions';

// Query keys
export {
  PUBLIC_QUESTION_QUERY_KEYS
} from './use-public-questions';

// ===== RE-EXPORT TYPES =====

// Re-export commonly used types cho convenience
export type {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  PublicQuestionStats
} from './use-public-questions';

// ===== HOOK UTILITIES =====

/**
 * Hook configuration types
 */
export interface PublicQuestionHookOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
}

import { TIMEOUTS } from '@/lib/constants/timeouts';

export interface PublicQuestionSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Common hook configurations
 */
export const HOOK_CONFIGURATIONS = {
  // Standard configuration cho most hooks
  standard: {
    enabled: true,
    refetchOnWindowFocus: false,
    refetchInterval: undefined,
  },

  // Configuration cho real-time data
  realtime: {
    enabled: true,
    refetchOnWindowFocus: true,
    refetchInterval: TIMEOUTS.REALTIME_REFRESH_MS,
  },

  // Configuration cho static data
  static: {
    enabled: true,
    refetchOnWindowFocus: false,
    refetchInterval: TIMEOUTS.STATIC_REFRESH_MS,
  },

  // Configuration cho search
  search: {
    enabled: true,
    debounceMs: TIMEOUTS.SEARCH_DEBOUNCE_MS,
  },
} as const;

/**
 * Hook error types
 */
export interface PublicQuestionHookError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Hook loading states
 */
export type PublicQuestionHookLoadingState = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

/**
 * Hook result interface
 */
export interface PublicQuestionHookResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: PublicQuestionHookError | null;
  refetch: () => void;
  isRefetching: boolean;
  isFetching: boolean;
}

// ===== HOOK UTILITIES FUNCTIONS =====

/**
 * Create standardized hook error
 */
export function createHookError(
  message: string,
  code?: string,
  status?: number,
  details?: Record<string, unknown>
): PublicQuestionHookError {
  return {
    message,
    code,
    status,
    details,
  };
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as PublicQuestionHookError;
  return err.code === 'NETWORK_ERROR' || 
         err.message?.toLowerCase().includes('network') ||
         err.message?.toLowerCase().includes('fetch');
}

/**
 * Check if error is timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as PublicQuestionHookError;
  return err.code === 'TIMEOUT_ERROR' || 
         err.message?.toLowerCase().includes('timeout');
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as PublicQuestionHookError;
  return err.code === 'VALIDATION_ERROR' || 
         err.status === 422;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'Đã xảy ra lỗi không xác định';
  
  if (typeof error === 'string') return error;
  
  if (typeof error === 'object' && 'message' in error) {
    const err = error as PublicQuestionHookError;
    
    if (isNetworkError(error)) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
    }
    
    if (isTimeoutError(error)) {
      return 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.';
    }
    
    if (isValidationError(error)) {
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    }
    
    return err.message || 'Đã xảy ra lỗi không xác định';
  }
  
  return 'Đã xảy ra lỗi không xác định';
}

// ===== HOOK PERFORMANCE UTILITIES =====

/**
 * Performance monitoring for hooks
 */
export interface HookPerformanceMetrics {
  queryKey: string;
  executionTime: number;
  cacheHit: boolean;
  dataSize: number;
  timestamp: number;
}

/**
 * Create performance metrics
 */
export function createPerformanceMetrics(
  queryKey: string,
  startTime: number,
  endTime: number,
  cacheHit: boolean,
  dataSize: number
): HookPerformanceMetrics {
  return {
    queryKey,
    executionTime: endTime - startTime,
    cacheHit,
    dataSize,
    timestamp: Date.now(),
  };
}

/**
 * Log hook performance (development only)
 */
export function logHookPerformance(metrics: HookPerformanceMetrics): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Hook Performance] ${metrics.queryKey}:`, {
      executionTime: `${metrics.executionTime}ms`,
      cacheHit: metrics.cacheHit,
      dataSize: `${metrics.dataSize} bytes`,
      timestamp: new Date(metrics.timestamp).toISOString(),
    });
  }
}

// ===== HOOK DEBUGGING UTILITIES =====

/**
 * Debug hook state
 */
export function debugHookState<T>(
  hookName: string,
  data: T,
  isLoading: boolean,
  error: unknown
): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Hook Debug] ${hookName}`);
    console.log('Data:', data);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
    console.groupEnd();
  }
}

/**
 * Debug query key
 */
export function debugQueryKey(queryKey: readonly unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Query Key]:', queryKey);
  }
}

// ===== CONSTANTS =====

/**
 * Hook constants
 */
export const PUBLIC_QUESTION_HOOK_CONSTANTS = {
  DEFAULT_STALE_TIME: TIMEOUTS.DEFAULT_STALE_TIME_MS,
  DEFAULT_CACHE_TIME: TIMEOUTS.DEFAULT_CACHE_TIME_MS,
  DEFAULT_RETRY_COUNT: 3,
  DEFAULT_RETRY_DELAY: 1000,
  SEARCH_DEBOUNCE_MS: TIMEOUTS.SEARCH_DEBOUNCE_MS,
  PREFETCH_STALE_TIME: TIMEOUTS.PREFETCH_STALE_TIME_MS,
} as const;

/**
 * Hook error codes
 */
export const PUBLIC_QUESTION_HOOK_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type PublicQuestionHookErrorCode = typeof PUBLIC_QUESTION_HOOK_ERROR_CODES[keyof typeof PUBLIC_QUESTION_HOOK_ERROR_CODES];
