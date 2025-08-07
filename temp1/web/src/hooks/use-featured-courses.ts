"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { QueryKeys } from "@/lib/api/query-keys";
import { courseService, ICourse } from "@/lib/api/services/course-service";

/**
 * Hook để lấy danh sách khóa học nổi bật
 * @param limit Số lượng khóa học tối đa (mặc định: 6)
 * @returns UseQueryResult với danh sách khóa học nổi bật
 */
export function useFeaturedCourses(limit: number = 6): UseQueryResult<ICourse[], Error> {
  return useQuery({
    queryKey: [QueryKeys.FEATURED_COURSES, limit],
    queryFn: () => courseService.getFeaturedCourses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - featured courses don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook để lấy khóa học phổ biến
 * @param limit Số lượng khóa học tối đa (mặc định: 6)
 * @returns UseQueryResult với danh sách khóa học phổ biến
 */
export function usePopularCourses(limit: number = 6): UseQueryResult<ICourse[], Error> {
  return useQuery({
    queryKey: [QueryKeys.POPULAR_COURSES, limit],
    queryFn: () => courseService.getPopularCourses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
