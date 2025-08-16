'use client';

import React from 'react';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePathname } from 'next/navigation';

// Interface cho props của QueryProvider
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider Component
 * 
 * Wrapper component cho TanStack Query (React Query):
 * - Data fetching và caching
 * - Background updates
 * - Optimistic updates
 * - Error handling
 * - DevTools cho development
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Check if we're on admin page to conditionally disable DevTools
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin') ?? false;

  // Tạo QueryClient instance với configuration tối ưu
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Stale time: Thời gian data được coi là "fresh"
          staleTime: 5 * 60 * 1000, // 5 minutes
          
          // Cache time: Thời gian data được giữ trong cache sau khi không sử dụng
          gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
          
          // Retry configuration
          retry: (failureCount, error: unknown) => {
            // Không retry cho 404 errors
            if (error && typeof error === 'object' && 'status' in error && error.status === 404) return false;
            // Retry tối đa 3 lần cho các lỗi khác
            return failureCount < 3;
          },
          
          // Retry delay với exponential backoff
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          
          // Refetch configuration
          refetchOnWindowFocus: false, // Không refetch khi focus window
          refetchOnReconnect: true,    // Refetch khi reconnect internet
          refetchOnMount: true,        // Refetch khi component mount
        },
        mutations: {
          // Retry configuration cho mutations
          retry: 1,
          retryDelay: 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools chỉ hiển thị trong development và KHÔNG phải admin pages */}
      {process.env.NODE_ENV === 'development' && !isAdminPage && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

