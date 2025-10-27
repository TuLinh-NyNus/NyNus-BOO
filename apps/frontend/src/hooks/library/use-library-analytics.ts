/**
 * useLibraryAnalytics Hook
 * React hook for library analytics data
 */

import { useQuery } from '@tanstack/react-query';
import * as LibraryAnalyticsService from '@/services/grpc/library-analytics.service';

export function useLibraryAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['library-analytics'],
    queryFn: LibraryAnalyticsService.getAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return {
    summary: data?.summary,
    topDownloaded: data?.topDownloaded || [],
    topRated: data?.topRated || [],
    recentlyAdded: data?.recentlyAdded || [],
    distribution: data?.distribution || [],
    isLoading,
    error,
    refetch,
  };
}

export function useAnalyticsSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library-analytics-summary'],
    queryFn: LibraryAnalyticsService.getAnalyticsSummary,
    staleTime: 5 * 60 * 1000,
  });

  return {
    summary: data,
    isLoading,
    error,
  };
}

export function useTopDownloaded(limit: number = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library-top-downloaded', limit],
    queryFn: () => LibraryAnalyticsService.getTopDownloaded(limit),
    staleTime: 5 * 60 * 1000,
  });

  return {
    items: data || [],
    isLoading,
    error,
  };
}

export function useTopRated(limit: number = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library-top-rated', limit],
    queryFn: () => LibraryAnalyticsService.getTopRated(limit),
    staleTime: 5 * 60 * 1000,
  });

  return {
    items: data || [],
    isLoading,
    error,
  };
}

export function useContentDistribution() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library-content-distribution'],
    queryFn: LibraryAnalyticsService.getContentDistribution,
    staleTime: 10 * 60 * 1000,
  });

  return {
    distribution: data || [],
    isLoading,
    error,
  };
}

