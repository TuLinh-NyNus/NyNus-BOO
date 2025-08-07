'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import { authService } from '@/lib/api/auth.service';
import logger from '@/lib/utils/logger';

/**
 * Options cho API client hook
 * Hỗ trợ tất cả HTTP methods và các tùy chọn cấu hình
 */
interface ApiClientOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | unknown[] | FormData | string;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  queryKey?: string[];
  enabled?: boolean;
}

/**
 * Return type cho GET requests (queries)
 */
type ApiClientQueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
};

/**
 * Return type cho non-GET requests (mutations)
 */
type ApiClientMutationResult<T> = {
  mutate: (variables?: void) => void;
  mutateAsync: (variables?: void) => Promise<T>;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
};

/**
 * Consolidated API Client Hook
 *
 * Features:
 * - Automatic token management via authService
 * - React Query integration for caching and state management
 * - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
 * - Automatic query invalidation on mutations
 * - Comprehensive error handling
 * - TypeScript support with proper return types
 * - Configurable caching and retry logic
 *
 * @param options - Configuration options for the API request
 * @returns Query result for GET requests, Mutation result for other methods
 */
export function useApiClient<T = unknown>({
  endpoint,
  method = 'GET',
  body,
  headers = {},
  skipAuth = false,
  queryKey,
  enabled = true
}: ApiClientOptions): ApiClientQueryResult<T> | ApiClientMutationResult<T> {
  const token = authService.getCurrentToken();
  const queryClient = useQueryClient();
  
  // Tạo queryKey mặc định nếu không được cung cấp
  const defaultQueryKey = [endpoint, method];
  const finalQueryKey = queryKey || defaultQueryKey;
  
  // Hàm gọi API
  const fetchApi = async (): Promise<T> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
      
      // Tạo headers
      const requestHeaders = new Headers(headers);
      
      // Thêm token xác thực nếu cần
      if (!skipAuth && token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
        logger.debug(`API Client: Gọi API với token: ${token.substring(0, 20)}...`);
      }
      
      // Thêm Content-Type cho POST/PUT/PATCH nếu chưa có
      if (['POST', 'PUT', 'PATCH'].includes(method) && body && !requestHeaders.has('Content-Type')) {
        // Kiểm tra loại body để set Content-Type phù hợp
        if (body instanceof FormData) {
          // Không set Content-Type cho FormData, browser sẽ tự động set với boundary
        } else {
          requestHeaders.set('Content-Type', 'application/json');
        }
      }

      logger.debug(`API Client: ${method} ${url}`);

      // Chuẩn bị body cho request
      let requestBody: string | FormData | undefined;
      if (body) {
        if (body instanceof FormData) {
          requestBody = body;
        } else if (typeof body === 'string') {
          requestBody = body;
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      const fetchResponse = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        logger.error(`API Client: HTTP ${fetchResponse.status} - ${errorText}`);

        // Xử lý lỗi 401 - Unauthorized
        if (fetchResponse.status === 401) {
          logger.warn('API Client: API trả về lỗi 401 Unauthorized - token có thể đã hết hạn');
          // Có thể trigger logout hoặc refresh token ở đây
        }

        throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
      }

      const responseData = await fetchResponse.json();
      logger.debug(`API Client: Response received`, responseData);

      return responseData;
    } catch (error) {
      logger.error(`API Client: Error calling ${method} ${endpoint}:`, error);
      throw error;
    }
  };
  
  // Sử dụng React Query cho GET requests
  const queryResult = useQuery({
    queryKey: finalQueryKey,
    queryFn: fetchApi,
    enabled: enabled && method === 'GET',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Sử dụng React Query mutation cho non-GET requests
  const mutationResult = useMutation({
    mutationFn: fetchApi,
    onSuccess: (data) => {
      // Invalidate related queries on successful mutation
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      logger.debug(`API Client: Mutation successful, invalidated queries for ${endpoint}`);
    },
    onError: (error) => {
      logger.error(`API Client: Mutation failed for ${endpoint}:`, error);
    },
  });
  
  // Return appropriate result based on method
  if (method === 'GET') {
    return {
      data: queryResult.data,
      isLoading: queryResult.isLoading,
      error: queryResult.error,
      refetch: queryResult.refetch,
      isSuccess: queryResult.isSuccess,
      isError: queryResult.isError,
    };
  } else {
    return {
      mutate: mutationResult.mutate,
      mutateAsync: mutationResult.mutateAsync,
      data: mutationResult.data,
      isLoading: mutationResult.isPending,
      error: mutationResult.error,
      isSuccess: mutationResult.isSuccess,
      isError: mutationResult.isError,
      reset: mutationResult.reset,
    };
  }
}

// Export aliases for backward compatibility
export { useApiClient as useApiClientHook };
export default useApiClient;

// Legacy export for any existing imports
export { useApiClient as useApiClientLegacy };
