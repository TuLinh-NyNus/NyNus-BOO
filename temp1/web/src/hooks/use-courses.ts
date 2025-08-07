"use client";

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";

import { QueryKeys, createListQueryKey, createDetailQueryKey } from "@/lib/api/query-keys";
import {
  courseService,
  ICourseListParams,
  ICourseListResponse,
  ICourse,
  ICreateCourseRequest,
  IUpdateCourseRequest,
} from "@/lib/api/services/course-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";

/**
 * Hook để lấy danh sách khóa học
 */
export function useCourses(params?: ICourseListParams): UseQueryResult<ICourseListResponse, ApiError> {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.COURSES, params),
    queryFn: () => courseService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy chi tiết khóa học
 */
export function useCourse(id: string): UseQueryResult<ICourse, ApiError> {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.COURSE, id),
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để tìm kiếm khóa học
 */
export function useSearchCourses(params: ICourseListParams): UseQueryResult<ICourseListResponse, ApiError> {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.COURSES, { ...params, search: true }),
    queryFn: () => courseService.getCourses(params),
    enabled: !!params.search,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Hook để lấy khóa học theo danh mục
 */
export function useCoursesByCategory(categoryId: string): UseQueryResult<ICourse[], ApiError> {
  return useQuery({
    queryKey: [QueryKeys.COURSES, 'category', categoryId],
    queryFn: () => courseService.getCoursesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy khóa học của người dùng
 */
export function useUserCourses(userId: string, params?: ICourseListParams): UseQueryResult<ICourseListResponse, ApiError> {
  return useQuery({
    queryKey: [QueryKeys.USER_COURSES, userId, params],
    queryFn: () => courseService.getUserCourses(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để tạo khóa học mới
 */
export function useCreateCourse(): UseMutationResult<ICourse, ApiError, ICreateCourseRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: (newCourse) => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });
      
      // Add to cache
      queryClient.setQueryData(
        createDetailQueryKey(QueryKeys.COURSE, newCourse.id),
        newCourse
      );

      toast({
        title: "Thành công",
        description: "Khóa học đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo khóa học",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để cập nhật khóa học
 */
export function useUpdateCourse(): UseMutationResult<ICourse, ApiError, { id: string; data: IUpdateCourseRequest }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => courseService.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      // Update cache
      queryClient.setQueryData(
        createDetailQueryKey(QueryKeys.COURSE, updatedCourse.id),
        updatedCourse
      );

      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });

      toast({
        title: "Thành công",
        description: "Khóa học đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật khóa học",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để xóa khóa học
 */
export function useDeleteCourse(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: (_, courseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: createDetailQueryKey(QueryKeys.COURSE, courseId) });

      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });

      toast({
        title: "Thành công",
        description: "Khóa học đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa khóa học",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để đánh giá khóa học
 */
export function useRateCourse(): UseMutationResult<ICourse, ApiError, { courseId: string; rating: number }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, rating }) => courseService.rateCourse(courseId, rating),
    onSuccess: (updatedCourse) => {
      // Update cache
      queryClient.setQueryData(
        createDetailQueryKey(QueryKeys.COURSE, updatedCourse.id),
        updatedCourse
      );

      // Invalidate courses list to update ratings
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });

      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được ghi nhận",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi đánh giá",
        variant: "destructive",
      });
    },
  });
}
