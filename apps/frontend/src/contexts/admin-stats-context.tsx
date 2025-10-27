/**
 * Admin Stats Context
 * Centralized data fetching for AdminService.getSystemStats()
 * 
 * Purpose: Fix rate limit exceeded error by fetching stats once and sharing across all components
 * 
 * Components using this context:
 * - DashboardStats
 * - useAdminDashboard
 * - RealtimeDashboardMetrics
 * - useDashboardData
 * 
 * @author NyNus Development Team
 * @created 2025-10-25
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AdminService } from '@/services/grpc/admin.service';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

/**
 * System Stats from backend
 * Mapped from AdminService.getSystemStats() response
 */
export interface SystemStats {
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  users_by_role: Record<string, number>;
  users_by_status: Record<string, number>;
  suspicious_activities: number;
}

/**
 * Metrics Data Point for time series
 * Used for sparklines and charts
 */
export interface MetricsDataPoint {
  timestamp: Date;
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  suspicious_activities: number;
}

/**
 * Admin Stats Context Value
 * Provides stats data and control functions
 */
export interface AdminStatsContextValue {
  stats: SystemStats | null;
  metricsHistory: MetricsDataPoint[] | null;
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
  refresh: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  retryCount: number; // Number of retry attempts for exponential backoff
}

// ===== CONTEXT =====

const AdminStatsContext = createContext<AdminStatsContextValue | undefined>(undefined);

// ===== PROVIDER =====

interface AdminStatsProviderProps {
  children: ReactNode;
  cacheTimeout?: number; // Cache duration in milliseconds (default: 30 seconds)
  autoRefresh?: boolean; // Auto-refresh stats (default: false)
  refreshInterval?: number; // Auto-refresh interval in milliseconds (default: 5 minutes)
}

export function AdminStatsProvider({
  children,
  cacheTimeout = 30000, // 30 seconds default
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
}: AdminStatsProviderProps) {
  // ===== STATE =====

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricsDataPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // ===== REFS =====

  const fetchInProgressRef = useRef<boolean>(false);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef<boolean>(false);
  const initialFetchDoneRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0); // ✅ FIX: Use ref instead of state to avoid dependency cycle
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer for initial fetch
  const fetchStatsRef = useRef<((force?: boolean) => Promise<void>) | null>(null); // ✅ FIX: Ref to always have latest fetchStats

  // ===== FETCH FUNCTIONS =====

  /**
   * Fetch metrics history for sparklines
   * Gets last 7 data points for trending visualization
   */
  const fetchMetricsHistory = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setHistoryLoading(true);
      
      const response = await AdminService.getMetricsHistory({
        limit: 7, // Last 7 data points for sparkline
      });

      if (response.success && response.dataPoints) {
        setMetricsHistory(response.dataPoints);
        logger.debug('[AdminStatsContext] Metrics history fetched successfully', {
          points: response.dataPoints.length,
        });
      } else {
        logger.error('[AdminStatsContext] Failed to fetch metrics history', {
          message: response.message,
        });
      }
    } catch (err) {
      logger.error('[AdminStatsContext] Error fetching metrics history', { 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      if (mountedRef.current) {
        setHistoryLoading(false);
      }
    }
  }, []);

  /**
   * Fetch system stats from backend
   * ✅ FIX: Refactored to prevent dependency cycle and add request deduplication
   *
   * Features:
   * - Request deduplication with pendingRequestRef (prevents concurrent requests)
   * - Functional updates to avoid state dependencies
   * - Exponential backoff retry for rate limit errors
   * - Mounted check to prevent memory leaks
   * - Debounce on initial fetch to prevent hydration duplicate calls
   */
  const fetchStats = useCallback(async (force = false) => {
    // ===== REQUEST DEDUPLICATION =====
    // If there's already a pending request, return that promise instead of making a new request
    // This prevents multiple components from making concurrent requests to the same endpoint
    if (pendingRequestRef.current && !force) {
      logger.debug('[AdminStatsContext] Request already in progress, returning existing promise', {
        fetchInProgress: fetchInProgressRef.current,
      });
      return pendingRequestRef.current;
    }

    // ===== CACHE CHECK =====
    // Check cache validity using functional approach to avoid state dependencies
    if (!force) {
      const shouldUseCache = (() => {
        const currentStats = stats;
        const currentLastFetch = lastFetch;

        if (!currentLastFetch || !currentStats) return false;

        const cacheAge = Date.now() - currentLastFetch.getTime();
        return cacheAge < cacheTimeout;
      })();

      if (shouldUseCache) {
        logger.debug('[AdminStatsContext] Using cached stats');
        return;
      }
    }

    // ===== FETCH LOGIC =====
    const fetchPromise = (async () => {
      if (!mountedRef.current) {
        logger.debug('[AdminStatsContext] Component unmounted, skipping fetch');
        return;
      }

      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        logger.debug('[AdminStatsContext] Fetching system stats from backend');

        const response = await AdminService.getSystemStats();

        if (!mountedRef.current) {
          logger.debug('[AdminStatsContext] Component unmounted during fetch, discarding result');
          return;
        }

        if (!response.success || !response.stats) {
          throw new Error(response.message || 'Failed to fetch system stats');
        }

        // ✅ FIX: Use functional updates to avoid dependency on current state
        setStats(() => response.stats);
        setLastFetch(() => new Date());
        retryCountRef.current = 0; // Reset retry count on success

        logger.debug('[AdminStatsContext] System stats fetched successfully', {
          total_users: response.stats.total_users,
          active_users: response.stats.active_users,
          total_sessions: response.stats.total_sessions,
        });
      } catch (err) {
        if (!mountedRef.current) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system stats';

        // Check if it's a rate limit error
        const isRateLimitError = errorMessage.includes('rate limit exceeded');

        setError(() => errorMessage);

        // Increment retry count for exponential backoff
        retryCountRef.current += 1;

        logger.error('[AdminStatsContext] Failed to fetch system stats', {
          operation: 'fetchStats',
          errorName: err instanceof Error ? err.name : 'Unknown',
          errorMessage,
          isRateLimitError,
          retryCount: retryCountRef.current,
        });

        // ===== EXPONENTIAL BACKOFF RETRY =====
        // Only retry for rate limit errors, not authentication errors
        if (isRateLimitError && retryCountRef.current < 3) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000); // Max 10s
          logger.debug('[AdminStatsContext] Scheduling retry with exponential backoff', {
            retryCount: retryCountRef.current,
            delay: `${backoffDelay}ms`,
          });

          setTimeout(() => {
            if (mountedRef.current) {
              fetchStats(true);
            }
          }, backoffDelay);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        fetchInProgressRef.current = false;
        pendingRequestRef.current = null;
      }
    })();

    pendingRequestRef.current = fetchPromise;
    return fetchPromise;
  }, [cacheTimeout]); // ✅ FIX: Remove lastFetch and stats to prevent dependency cycle
  // Reason: fetchStats uses closure to access stats/lastFetch, doesn't need them as dependencies
  // Cache check (line 116-117) uses local variables, functional updates (line 157-158) don't need current state

  // ✅ FIX: Update fetchStatsRef whenever fetchStats changes
  useEffect(() => {
    fetchStatsRef.current = fetchStats;
  }, [fetchStats]);

  /**
   * Manual refresh function
   * Forces a fresh fetch regardless of cache
   */
  const refresh = useCallback(async () => {
    logger.debug('[AdminStatsContext] Manual refresh triggered');
    await fetchStats(true);
  }, [fetchStats]);

  // ===== EFFECTS =====

  /**
   * Initial fetch on mount with debounce
   * Uses initialFetchDoneRef to prevent duplicate fetch in React Strict Mode
   * Debounce prevents rapid duplicate calls during React hydration
   * 
   * ✅ FIX: Remove fetchStats from dependency array to prevent infinite loop
   * The effect should only run once on mount, not when fetchStats changes
   */
  useEffect(() => {
    mountedRef.current = true;
    logger.info('[AdminStatsContext] Mount effect triggered', {
      initialFetchDone: initialFetchDoneRef.current,
      hasPendingTimer: !!debounceTimerRef.current
    });

    // Only fetch once on initial mount
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      logger.info('[AdminStatsContext] Setting up debounced fetch (500ms delay for React Strict Mode)');

      // Debounce initial fetch to prevent duplicate calls during hydration
      // This is especially important in Next.js 14 App Router with React Strict Mode
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (mountedRef.current && fetchStatsRef.current) {
          logger.info('[AdminStatsContext] Executing debounced initial fetch NOW');
          fetchStatsRef.current();
        } else {
          logger.warn('[AdminStatsContext] Skipped fetch - component unmounted or no fetchRef');
        }
      }, 500); // ✅ FIX: 500ms to handle React Strict Mode double-render
    } else {
      logger.debug('[AdminStatsContext] Skipping fetch - already done (React Strict Mode second render)');
    }

    return () => {
      logger.debug('[AdminStatsContext] Unmounting - cleaning up timer');
      mountedRef.current = false;
      // Cleanup debounce timer on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run once on mount

  /**
   * Auto-refresh timer
   * 
   * ✅ FIX: Keep fetchStats in dependencies but wrap in ref to prevent recreation
   * Auto-refresh should restart when interval changes, but not cause infinite loops
   */
  useEffect(() => {
    if (!autoRefresh) return;

    logger.debug('[AdminStatsContext] Starting auto-refresh timer', {
      interval: `${refreshInterval}ms`,
    });

    autoRefreshTimerRef.current = setInterval(() => {
      logger.debug('[AdminStatsContext] Auto-refresh triggered');
      if (fetchStatsRef.current) {
        fetchStatsRef.current(true);
      }
    }, refreshInterval);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval]); // ✅ FIX: Remove fetchStats from dependencies

  // ===== CONTEXT VALUE =====

  const contextValue: AdminStatsContextValue = {
    stats,
    metricsHistory,
    loading,
    historyLoading,
    error,
    lastFetch,
    refresh,
    refreshHistory: fetchMetricsHistory,
    retryCount: retryCountRef.current, // Expose retry count for debugging
  };

  return (
    <AdminStatsContext.Provider value={contextValue}>
      {children}
    </AdminStatsContext.Provider>
  );
}

// ===== HOOK =====

/**
 * useAdminStats Hook
 * Access admin stats from context
 * 
 * @throws Error if used outside AdminStatsProvider
 */
export function useAdminStats(): AdminStatsContextValue {
  const context = useContext(AdminStatsContext);

  if (context === undefined) {
    throw new Error('useAdminStats must be used within AdminStatsProvider');
  }

  return context;
}

// ===== EXPORTS =====

export default AdminStatsProvider;

