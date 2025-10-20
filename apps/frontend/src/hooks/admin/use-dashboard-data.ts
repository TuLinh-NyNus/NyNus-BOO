/**
 * Dashboard Data Hook
 * Hook để quản lý dashboard data với auto refresh, caching và error handling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminDashboardMockService,
  DashboardMetrics,
  SystemStatus,
  RecentActivity
} from '@/lib/mockdata/admin';
import { logger } from '@/lib/utils/logger';

/**
 * Dashboard Data Hook Options
 * Options cho useDashboardData hook
 */
export interface UseDashboardDataOptions {
  autoRefresh?: boolean; // Tự động refresh data
  refreshInterval?: number; // Interval refresh (ms)
  enableCaching?: boolean; // Bật caching
  retryOnError?: boolean; // Retry khi có lỗi
  maxRetries?: number; // Số lần retry tối đa
}

/**
 * Dashboard Data Hook Return Value
 * Return value của useDashboardData hook
 */
export interface UseDashboardDataReturn {
  // Data states
  formattedMetrics: DashboardMetrics | null; // Dashboard metrics đã format
  systemStatus: SystemStatus | null; // System status
  recentActivities: RecentActivity[]; // Recent activities
  
  // Loading states
  isLoading: boolean; // Đang loading lần đầu
  isRefreshing: boolean; // Đang refresh data
  
  // Error states
  error: string | null; // Error message
  hasData: boolean; // Có data hay không
  
  // Metadata
  lastUpdated: Date | null; // Thời gian update cuối
  refreshCount: number; // Số lần đã refresh
  status: 'idle' | 'loading' | 'success' | 'error'; // Status tổng thể
  
  // Actions
  refreshData: () => Promise<void>; // Manual refresh
  retryFetch: () => Promise<void>; // Retry fetch khi có lỗi
}

/**
 * Dashboard Data Hook
 * Hook chính để quản lý dashboard data
 */
export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds default
    enableCaching = true,
    retryOnError = true,
    maxRetries = 3
  } = options;

  // States
  const [formattedMetrics, setFormattedMetrics] = useState<DashboardMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const cacheRef = useRef<{
    metrics: DashboardMetrics | null;
    systemStatus: SystemStatus | null;
    activities: RecentActivity[];
    timestamp: number;
  } | null>(null);

  /**
   * Fetch dashboard data
   * Fetch tất cả dashboard data
   */
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setStatus('loading');
      }

      setError(null);

      // Check cache nếu enabled và không phải refresh
      if (enableCaching && !isRefresh && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.timestamp;
        const cacheValidDuration = refreshInterval / 2; // Cache valid for half of refresh interval
        
        if (cacheAge < cacheValidDuration) {
          setFormattedMetrics(cacheRef.current.metrics);
          setSystemStatus(cacheRef.current.systemStatus);
          setRecentActivities(cacheRef.current.activities);
          setIsLoading(false);
          setStatus('success');
          return;
        }
      }

      // Fetch data từ mock service
      const [metrics, systemStatusData, activities] = await Promise.all([
        adminDashboardMockService.getDashboardMetrics(),
        adminDashboardMockService.getSystemStatus(),
        adminDashboardMockService.getRecentActivities(5)
      ]);

      // Update states
      setFormattedMetrics(metrics);
      setSystemStatus(systemStatusData);
      setRecentActivities(activities);
      setLastUpdated(new Date());
      setRefreshCount(prev => prev + 1);
      setStatus('success');

      // Update cache
      if (enableCaching) {
        cacheRef.current = {
          metrics,
          systemStatus: systemStatusData,
          activities,
          timestamp: Date.now()
        };
      }

      // Reset retry count on success
      retryCountRef.current = 0;

    } catch (err) {
      logger.error('[useDashboardData] Error fetching dashboard data', {
        operation: 'fetchDashboardData',
        errorName: err instanceof Error ? err.name : 'Unknown',
        errorMessage: err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard',
        stack: err instanceof Error ? err.stack : undefined,
      });
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard';
      setError(errorMessage);
      setStatus('error');

      // Retry logic
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        logger.info('[useDashboardData] Retrying dashboard data fetch', {
          operation: 'fetchDashboardData',
          retryAttempt: retryCountRef.current,
          maxRetries,
        });

        // Retry after delay
        setTimeout(() => {
          fetchDashboardData(isRefresh);
        }, 2000 * retryCountRef.current); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [enableCaching, refreshInterval, retryOnError, maxRetries]);

  /**
   * Manual refresh data
   * Refresh data manually
   */
  const refreshData = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  /**
   * Retry fetch when error
   * Retry fetch khi có lỗi
   */
  const retryFetch = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchDashboardData(true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Computed values
  const hasData = formattedMetrics !== null && systemStatus !== null;

  return {
    // Data states
    formattedMetrics,
    systemStatus,
    recentActivities,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error states
    error,
    hasData,
    
    // Metadata
    lastUpdated,
    refreshCount,
    status,
    
    // Actions
    refreshData,
    retryFetch
  };
}

/**
 * Default export
 */
export default useDashboardData;
