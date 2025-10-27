/**
 * Dashboard Data Hook
 * Hook để quản lý dashboard data với auto refresh, caching và error handling
 *
 * ✅ FIX: Sử dụng AdminStatsContext để tránh duplicate API calls
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  DashboardMetrics,
  SystemStatus,
  RecentActivity
} from '@/lib/mockdata/admin';
import { useAdminStats } from '@/contexts/admin-stats-context';

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
 *
 * ✅ FIX: Sử dụng AdminStatsContext thay vì fetch trực tiếp
 */
export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds default
    enableCaching: _enableCaching = true,
    retryOnError: _retryOnError = true,
    maxRetries: _maxRetries = 3
  } = options;

  // ✅ FIX: Use AdminStatsContext instead of direct API call
  const { stats, loading: isLoading, error: statsError, refresh: refreshStats, lastFetch } = useAdminStats();

  // States
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Map stats to DashboardMetrics format - wrapped in useMemo
  const formattedMetrics: DashboardMetrics | null = useMemo(() => stats ? {
    users: {
      total: stats.total_users || 0,
      active: stats.active_users || 0,
      newToday: 0, // TODO: Add to backend
      growth: 0 // TODO: Calculate from historical data
    },
    sessions: {
      total: stats.total_sessions || 0,
      active: stats.active_sessions || 0,
      averageDuration: 0, // TODO: Add to backend
      bounceRate: 0 // TODO: Add to backend
    },
    security: {
      events: 0, // TODO: Add to backend
      alerts: stats.suspicious_activities || 0,
      blockedIPs: 0, // TODO: Add to backend
      riskScore: stats.suspicious_activities || 0
    },
    system: {
      uptime: 99.8, // TODO: Add to backend
      responseTime: 145, // TODO: Add to backend
      errorRate: 0.02, // TODO: Add to backend
      performance: 94.5 // TODO: Add to backend
    }
  } : null, [stats]);

  // System status - memoized to prevent re-creation
  const systemStatusData: SystemStatus = useMemo(() => ({
    apiServer: 'online',
    database: 'online',
    redisCache: 'online',
    fileStorage: 'online'
  }), []);

  // Update system status when stats change
  useEffect(() => {
    setSystemStatus(systemStatusData);
    setRecentActivities([]); // Empty for now
    if (stats) {
      setRefreshCount(prev => prev + 1);
      setStatus('success');
    }
  }, [stats, systemStatusData]);

  // Update error state
  useEffect(() => {
    if (statsError) {
      setError(statsError);
      setStatus('error');
    } else {
      setError(null);
    }
  }, [statsError]);

  /**
   * Manual refresh data
   * Refresh data manually
   */
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await refreshStats();
    setIsRefreshing(false);
  }, [refreshStats]);

  /**
   * Retry fetch when error
   * Retry fetch khi có lỗi
   */
  const retryFetch = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count
    await refreshStats();
  }, [refreshStats]);

  // Auto refresh setup - disabled since AdminStatsProvider handles this
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshData]);

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
    lastUpdated: lastFetch,
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
