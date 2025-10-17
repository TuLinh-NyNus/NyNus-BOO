/**
 * Teacher Analytics Hooks
 * React hooks for teacher-specific analytics operations
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/grpc/analytics.service';
import type {
  TeacherDashboardData,
  StudentData,
  ExamData,
} from '@/services/grpc/analytics.service';

// ===== QUERY KEYS =====

/**
 * Query keys for teacher analytics
 * Centralized query key management
 */
export const TEACHER_ANALYTICS_QUERY_KEYS = {
  all: ['teacher-analytics'] as const,
  dashboard: (teacherId: string, timeRange: string) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'dashboard', teacherId, timeRange] as const,
  students: (teacherId: string, page: number, pageSize: number) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'students', teacherId, page, pageSize] as const,
  exams: (teacherId: string, status: string, page: number, pageSize: number) => 
    [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'exams', teacherId, status, page, pageSize] as const,
} as const;

// ===== CONFIGURATION =====

/**
 * Default query options for teacher analytics
 */
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// ===== MAIN HOOKS =====

/**
 * Hook for getting teacher dashboard overview
 * Lấy tổng quan dashboard cho giáo viên
 */
export function useTeacherDashboard(
  teacherId: string,
  timeRange: string = '30d',
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<TeacherDashboardData, Error>({
    queryKey: TEACHER_ANALYTICS_QUERY_KEYS.dashboard(teacherId, timeRange),
    queryFn: () => AnalyticsService.getTeacherDashboard(teacherId, timeRange),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: (options?.enabled ?? true) && !!teacherId,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook for getting teacher students list
 * Lấy danh sách học sinh của giáo viên
 */
export function useTeacherStudents(
  teacherId: string,
  page: number = 1,
  pageSize: number = 20,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery<{ students: StudentData[]; total: number }, Error>({
    queryKey: TEACHER_ANALYTICS_QUERY_KEYS.students(teacherId, page, pageSize),
    queryFn: () => AnalyticsService.getTeacherStudents(teacherId, page, pageSize),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: (options?.enabled ?? true) && !!teacherId,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

/**
 * Hook for getting teacher exams list
 * Lấy danh sách đề thi của giáo viên
 */
export function useTeacherExams(
  teacherId: string,
  status: string = 'all',
  page: number = 1,
  pageSize: number = 20,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery<{ exams: ExamData[]; total: number }, Error>({
    queryKey: TEACHER_ANALYTICS_QUERY_KEYS.exams(teacherId, status, page, pageSize),
    queryFn: () => AnalyticsService.getTeacherExams(teacherId, status, page, pageSize),
    ...DEFAULT_QUERY_OPTIONS,
    enabled: (options?.enabled ?? true) && !!teacherId,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// ===== UTILITY HOOKS =====

/**
 * Hook to invalidate teacher analytics queries
 * Làm mới cache của teacher analytics
 */
export function useInvalidateTeacherAnalytics() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_ANALYTICS_QUERY_KEYS.all });
    },
    invalidateDashboard: (teacherId: string, timeRange: string) => {
      queryClient.invalidateQueries({ 
        queryKey: TEACHER_ANALYTICS_QUERY_KEYS.dashboard(teacherId, timeRange) 
      });
    },
    invalidateStudents: (teacherId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'students', teacherId] 
      });
    },
    invalidateExams: (teacherId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: [...TEACHER_ANALYTICS_QUERY_KEYS.all, 'exams', teacherId] 
      });
    },
  };
}

/**
 * Hook to prefetch teacher analytics data
 * Prefetch dữ liệu analytics trước khi cần
 */
export function usePrefetchTeacherAnalytics() {
  const queryClient = useQueryClient();

  return {
    prefetchDashboard: async (teacherId: string, timeRange: string = '30d') => {
      await queryClient.prefetchQuery({
        queryKey: TEACHER_ANALYTICS_QUERY_KEYS.dashboard(teacherId, timeRange),
        queryFn: () => AnalyticsService.getTeacherDashboard(teacherId, timeRange),
        ...DEFAULT_QUERY_OPTIONS,
      });
    },
    prefetchStudents: async (teacherId: string, page: number = 1, pageSize: number = 20) => {
      await queryClient.prefetchQuery({
        queryKey: TEACHER_ANALYTICS_QUERY_KEYS.students(teacherId, page, pageSize),
        queryFn: () => AnalyticsService.getTeacherStudents(teacherId, page, pageSize),
        ...DEFAULT_QUERY_OPTIONS,
      });
    },
    prefetchExams: async (teacherId: string, status: string = 'all', page: number = 1, pageSize: number = 20) => {
      await queryClient.prefetchQuery({
        queryKey: TEACHER_ANALYTICS_QUERY_KEYS.exams(teacherId, status, page, pageSize),
        queryFn: () => AnalyticsService.getTeacherExams(teacherId, status, page, pageSize),
        ...DEFAULT_QUERY_OPTIONS,
      });
    },
  };
}

// ===== EXPORT ALL =====

export type {
  TeacherDashboardData,
  StudentData,
  ExamData,
} from '@/services/grpc/analytics.service';

