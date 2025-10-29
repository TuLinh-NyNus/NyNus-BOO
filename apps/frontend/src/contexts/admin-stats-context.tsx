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
 * ✅ FIX v2: Singleton pattern with module-level cache to prevent duplicate calls
 * 
 * @author NyNus Development Team
 * @created 2025-10-25
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AdminService } from '@/services/grpc/admin.service';
import { logger } from '@/lib/logger';

// ===== MODULE-LEVEL SINGLETON CACHE =====
// These variables persist across component remounts and React Strict Mode double-renders
// Prevents duplicate API calls even when components unmount/remount

// Stats cache
let globalPendingRequest: Promise<void> | null = null;
let globalLastFetch: Date | null = null;
let globalStats: SystemStats | null = null;
let globalLastRequestTime: number = 0; // Timestamp of last request for minimum interval check
const MIN_REQUEST_INTERVAL = 8000; // 8 seconds minimum between requests (increased for rate limit protection)

// Metrics history cache - ✅ FIX: Add caching for fetchMetricsHistory
let globalMetricsPendingRequest: Promise<void> | null = null;
let globalMetricsLastFetch: Date | null = null;
let globalMetricsHistory: MetricsDataPoint[] = [];
let globalMetricsLastRequestTime: number = 0; // Timestamp of last metrics request
const MIN_METRICS_REQUEST_INTERVAL = 10000; // 10 seconds minimum between metrics requests (more conservative)

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
  cacheTimeout?: number; // Cache duration in milliseconds (default: 120 seconds)
  autoRefresh?: boolean; // Auto-refresh stats (default: false)
  refreshInterval?: number; // Auto-refresh interval in milliseconds (default: 5 minutes)
}

export function AdminStatsProvider({
  children,
  cacheTimeout = 120000, // ✅ FIX: 120 seconds (2 minutes) default - increased from 30s
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
  const mountedRef = useRef<boolean>(false);
  const initialFetchDoneRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0); // ✅ FIX: Use ref instead of state to avoid dependency cycle
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer for initial fetch
  const fetchStatsRef = useRef<((force?: boolean) => Promise<void>) | null>(null); // ✅ FIX: Ref to always have latest fetchStats

  // ===== FETCH FUNCTIONS =====

  /**
   * Fetch metrics history for sparklines
   * Gets last 7 data points for trending visualization
   * 
   * ✅ FIX: Add caching mechanism similar to fetchStats to prevent rate limit exceeded
   */
  const fetchMetricsHistory = useCallback(async (force = false) => {
    // ===== GLOBAL REQUEST DEDUPLICATION =====
    // Check global pending request first (survives component remounts)
    if (globalMetricsPendingRequest && !force) {
      logger.debug('[AdminStatsContext] Global metrics request already in progress, returning existing promise');
      return globalMetricsPendingRequest;
    }

    // ===== MINIMUM INTERVAL CHECK =====
    // Prevent requests more frequent than MIN_METRICS_REQUEST_INTERVAL (10s)
    const timeSinceLastRequest = Date.now() - globalMetricsLastRequestTime;
    if (!force && timeSinceLastRequest < MIN_METRICS_REQUEST_INTERVAL) {
      const waitTime = MIN_METRICS_REQUEST_INTERVAL - timeSinceLastRequest;
      logger.debug('[AdminStatsContext] Too soon since last metrics request, skipping', {
        timeSinceLastRequest: `${timeSinceLastRequest}ms`,
        minInterval: `${MIN_METRICS_REQUEST_INTERVAL}ms`,
        waitTime: `${waitTime}ms`,
      });
      return;
    }

    // ===== GLOBAL CACHE CHECK =====
    // Use global cache that survives component remounts (30 seconds cache)
    const metricsTimeout = 30000; // 30 seconds cache for metrics history
    if (!force && globalMetricsLastFetch && globalMetricsHistory.length > 0) {
      const cacheAge = Date.now() - globalMetricsLastFetch.getTime();
      if (cacheAge < metricsTimeout) {
        logger.debug('[AdminStatsContext] Using global cached metrics history', {
          cacheAge: `${cacheAge}ms`,
          cacheTimeout: `${metricsTimeout}ms`,
          points: globalMetricsHistory.length,
        });
        // Update component state from global cache
        setMetricsHistory(globalMetricsHistory);
        return;
      }
    }

    // ===== FETCH LOGIC =====
    const fetchPromise = (async () => {
      if (!mountedRef.current) {
        logger.debug('[AdminStatsContext] Component unmounted, skipping metrics fetch');
        return;
      }

      globalMetricsLastRequestTime = Date.now(); // Update global last request time
      setHistoryLoading(true);

      try {
        logger.info('[AdminStatsContext] 🚀 Fetching metrics history from backend (global singleton)');
        
        const response = await AdminService.getMetricsHistory({
          limit: 7, // Last 7 data points for sparkline
        });

        if (!mountedRef.current) {
          logger.debug('[AdminStatsContext] Component unmounted during metrics fetch, discarding result');
          return;
        }

        if (response.success && response.dataPoints) {
          // ✅ FIX: Update BOTH component state AND global cache
          const fetchTime = new Date();
          
          // Update global cache (persists across remounts)
          globalMetricsHistory = response.dataPoints;
          globalMetricsLastFetch = fetchTime;
          
          // Update component state
          setMetricsHistory(response.dataPoints);

          logger.info('[AdminStatsContext] ✅ Metrics history fetched successfully (cached globally)', {
            points: response.dataPoints.length,
            cacheTimeout: `${metricsTimeout}ms`,
          });
        } else {
          logger.error('[AdminStatsContext] Failed to fetch metrics history', {
            message: response.message,
          });
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Silent fail for permission errors - these are expected on non-dashboard pages
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
          logger.debug('[AdminStatsContext] Metrics history not available (permission restricted)', {
            operation: 'fetchMetricsHistory',
          });
        } else {
          logger.error('[AdminStatsContext] ❌ Failed to fetch metrics history', {
            operation: 'fetchMetricsHistory',
            errorMessage,
            timeSinceLastRequest: `${Date.now() - globalMetricsLastRequestTime}ms`,
          });
        }
      } finally {
        if (mountedRef.current) {
          setHistoryLoading(false);
        }
        globalMetricsPendingRequest = null; // Clear global pending request
      }
    })();

    globalMetricsPendingRequest = fetchPromise; // Set global pending request
    return fetchPromise;
  }, []);

  /**
   * Fetch system stats from backend
   * ✅ FIX v2: Singleton pattern with module-level cache to prevent ALL duplicate calls
   *
   * Features:
   * - Module-level cache survives component remounts and React Strict Mode
   * - Global request deduplication (even across different component instances)
   * - Minimum interval enforcement (5s between requests)
   * - Exponential backoff retry for rate limit errors
   * - Functional updates to avoid state dependencies
   */
  const fetchStats = useCallback(async (force = false) => {
    // ===== GLOBAL REQUEST DEDUPLICATION =====
    // Check global pending request first (survives component remounts)
    if (globalPendingRequest && !force) {
      logger.debug('[AdminStatsContext] Global request already in progress, returning existing promise');
      return globalPendingRequest;
    }

    // ===== MINIMUM INTERVAL CHECK =====
    // Prevent requests more frequent than MIN_REQUEST_INTERVAL (5s)
    const timeSinceLastRequest = Date.now() - globalLastRequestTime;
    if (!force && timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      logger.debug('[AdminStatsContext] Too soon since last request, skipping', {
        timeSinceLastRequest: `${timeSinceLastRequest}ms`,
        minInterval: `${MIN_REQUEST_INTERVAL}ms`,
        waitTime: `${waitTime}ms`,
      });
      return;
    }

    // ===== GLOBAL CACHE CHECK =====
    // Use global cache that survives component remounts
    if (!force && globalLastFetch && globalStats) {
      const cacheAge = Date.now() - globalLastFetch.getTime();
      if (cacheAge < cacheTimeout) {
        logger.debug('[AdminStatsContext] Using global cached stats', {
          cacheAge: `${cacheAge}ms`,
          cacheTimeout: `${cacheTimeout}ms`,
        });
        // Update component state from global cache
        setStats(globalStats);
        setLastFetch(globalLastFetch);
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
      globalLastRequestTime = Date.now(); // Update global last request time
      setLoading(true);
      setError(null);

      try {
        logger.info('[AdminStatsContext] 🚀 Fetching system stats from backend (global singleton)');

        const response = await AdminService.getSystemStats();

        if (!mountedRef.current) {
          logger.debug('[AdminStatsContext] Component unmounted during fetch, discarding result');
          return;
        }

        if (!response.success || !response.stats) {
          throw new Error(response.message || 'Failed to fetch system stats');
        }

        // ✅ FIX: Update BOTH component state AND global cache
        const fetchTime = new Date();
        
        // Update global cache (persists across remounts)
        globalStats = response.stats;
        globalLastFetch = fetchTime;
        
        // Update component state
        setStats(() => response.stats);
        setLastFetch(() => fetchTime);
        retryCountRef.current = 0; // Reset retry count on success

        logger.info('[AdminStatsContext] ✅ System stats fetched successfully (cached globally)', {
          total_users: response.stats.total_users,
          active_users: response.stats.active_users,
          total_sessions: response.stats.total_sessions,
          cacheTimeout: `${cacheTimeout}ms`,
        });
      } catch (err) {
        if (!mountedRef.current) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system stats';

        // Check if it's a rate limit error
        const isRateLimitError = errorMessage.includes('rate limit exceeded');

        setError(() => errorMessage);

        // Increment retry count for exponential backoff
        retryCountRef.current += 1;

        logger.error('[AdminStatsContext] ❌ Failed to fetch system stats', {
          operation: 'fetchStats',
          errorName: err instanceof Error ? err.name : 'Unknown',
          errorMessage,
          isRateLimitError,
          retryCount: retryCountRef.current,
          timeSinceLastRequest: `${Date.now() - globalLastRequestTime}ms`,
        });

        // ===== EXPONENTIAL BACKOFF RETRY =====
        // Only retry for rate limit errors, not authentication errors
        if (isRateLimitError && retryCountRef.current < 3) {
          const backoffDelay = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 30000); // Max 30s
          logger.warn('[AdminStatsContext] ⏳ Scheduling retry with exponential backoff', {
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
        globalPendingRequest = null; // Clear global pending request
      }
    })();

    globalPendingRequest = fetchPromise; // Set global pending request
    return fetchPromise;
  }, [cacheTimeout]);

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
    // Also refresh metrics history - ✅ FIX: Pass force=true to bypass cache
    await fetchMetricsHistory(true);
  }, [fetchStats, fetchMetricsHistory]);

  // ===== EFFECTS =====

  /**
   * Initial fetch on mount with debounce
   * Uses global cache to prevent duplicate fetch across component remounts
   * Debounce prevents rapid duplicate calls during React hydration
   * 
   * ✅ FIX v2: Use global cache + longer debounce (2000ms) to handle React Strict Mode
   * The effect should only run once on mount, not when fetchStats changes
   */
  useEffect(() => {
    mountedRef.current = true;
    logger.info('[AdminStatsContext] Mount effect triggered', {
      initialFetchDone: initialFetchDoneRef.current,
      hasPendingTimer: !!debounceTimerRef.current,
      hasGlobalCache: !!globalStats,
      globalCacheAge: globalLastFetch ? `${Date.now() - globalLastFetch.getTime()}ms` : 'none',
    });

    // Check global cache first - if available, use it immediately
    if (globalStats && globalLastFetch) {
      const cacheAge = Date.now() - globalLastFetch.getTime();
      if (cacheAge < cacheTimeout) {
        logger.info('[AdminStatsContext] 🎯 Using existing global cache on mount (skipping fetch)', {
          cacheAge: `${cacheAge}ms`,
          cacheTimeout: `${cacheTimeout}ms`,
        });
        setStats(globalStats);
        setLastFetch(globalLastFetch);
        
        // ✅ FIX: Also check and use metrics history cache
        if (globalMetricsHistory.length > 0 && globalMetricsLastFetch) {
          const metricsCacheAge = Date.now() - globalMetricsLastFetch.getTime();
          if (metricsCacheAge < 30000) { // 30 seconds cache
            logger.info('[AdminStatsContext] 🎯 Using existing global metrics cache on mount');
            setMetricsHistory(globalMetricsHistory);
          }
        }
        
        return; // Skip fetch entirely
      }
    }

    // Only fetch once on initial mount if no global cache
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      logger.info('[AdminStatsContext] Setting up debounced fetch (2000ms delay for React Strict Mode)');

      // Debounce initial fetch to prevent duplicate calls during hydration
      // This is especially important in Next.js 14 App Router with React Strict Mode
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (mountedRef.current && fetchStatsRef.current) {
          logger.info('[AdminStatsContext] ⏱️ Executing debounced initial fetch NOW');
          fetchStatsRef.current();
          // Also fetch metrics history for charts
          fetchMetricsHistory();
        } else {
          logger.warn('[AdminStatsContext] Skipped fetch - component unmounted or no fetchRef');
        }
      }, 3000); // ✅ FIX: 3000ms (3s) to handle React Strict Mode double-render + concurrent components + multiple tabs
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


