/**
 * useAnalytics Hook
 * React Query integration for analytics data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import * as FocusAnalyticsService from '@/services/grpc/focus-analytics.service';

// Re-export types
export type {
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  ContributionDay,
} from '@/services/grpc/focus-analytics.service';

/**
 * Hook to fetch daily statistics
 */
export function useDailyStats(date?: string): UseQueryResult<FocusAnalyticsService.DailyStats, Error> {
  return useQuery({
    queryKey: ['focus', 'analytics', 'daily', date],
    queryFn: () => FocusAnalyticsService.getDailyStats(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch weekly statistics
 */
export function useWeeklyStats(weekStart?: string): UseQueryResult<FocusAnalyticsService.WeeklyStats, Error> {
  return useQuery({
    queryKey: ['focus', 'analytics', 'weekly', weekStart],
    queryFn: () => FocusAnalyticsService.getWeeklyStats(weekStart),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch monthly statistics
 */
export function useMonthlyStats(year?: number, month?: number): UseQueryResult<FocusAnalyticsService.MonthlyStats, Error> {
  return useQuery({
    queryKey: ['focus', 'analytics', 'monthly', year, month],
    queryFn: () => FocusAnalyticsService.getMonthlyStats(year, month),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch contribution graph data
 */
export function useContributionGraph(days: number = 365): UseQueryResult<FocusAnalyticsService.ContributionDay[], Error> {
  return useQuery({
    queryKey: ['focus', 'analytics', 'contribution', days],
    queryFn: () => FocusAnalyticsService.getContributionGraph(days),
    staleTime: 15 * 60 * 1000, // 15 minutes (longer cache for large dataset)
    retry: 2,
  });
}

