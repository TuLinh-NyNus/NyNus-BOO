"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";

// Import mockdata services
import { getFeaturedCourses, FeaturedCourse } from "@/lib/mockdata/featured-courses";

// Mock error type
export interface ApiError extends Error {
  message: string;
}

/**
 * Hook để lấy danh sách khóa học nổi bật
 * Sử dụng mockdata thay vì API calls thực
 */
export function useFeaturedCourses(): UseQueryResult<FeaturedCourse[], ApiError> {
  return useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const featuredCourses = await getFeaturedCourses();

      // Return courses as-is since they already match FeaturedCourse interface
      return featuredCourses;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook để lấy khóa học nổi bật theo danh mục
 */
export function useFeaturedCoursesByCategory(category: string): UseQueryResult<FeaturedCourse[], ApiError> {
  return useQuery({
    queryKey: ['featured-courses', 'category', category],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const featuredCourses = await getFeaturedCourses();
      // Note: FeaturedCourse doesn't have category field, so return all courses
      return featuredCourses;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook để lấy số lượng khóa học nổi bật
 */
export function useFeaturedCoursesCount(): UseQueryResult<number, ApiError> {
  return useQuery({
    queryKey: ['featured-courses', 'count'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const featuredCourses = await getFeaturedCourses();
      return featuredCourses.length;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
