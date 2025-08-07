"use client";

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";

import { QueryKeys, createListQueryKey, createDetailQueryKey } from "@/lib/api/query-keys";
import {
  examService,
  IExamFilterParams,
  IExamListResponse,
  IExam,
  ICreateExamRequest,
  IUpdateExamRequest,
  IExamResult,
  IExamStats,
} from "@/lib/api/services/exam-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";

/**
 * Hook để lấy danh sách bài thi
 */
export function useExams(params?: IExamFilterParams): UseQueryResult<IExamListResponse, ApiError> {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.EXAMS, params),
    queryFn: () => examService.getExams(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy chi tiết bài thi
 */
export function useExam(id: string): UseQueryResult<IExam, ApiError> {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.EXAM, id),
    queryFn: () => examService.getExam(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để tìm kiếm bài thi
 */
export function useSearchExams(params: IExamFilterParams): UseQueryResult<IExamListResponse, ApiError> {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.EXAMS, { ...params, search: true }),
    queryFn: () => examService.searchExams(params),
    enabled: !!params.search,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Hook để lấy thống kê bài thi
 */
export function useExamStats(examId: string): UseQueryResult<IExamStats, ApiError> {
  return useQuery({
    queryKey: [QueryKeys.EXAMS, 'stats', examId],
    queryFn: () => examService.getExamStats(examId),
    enabled: !!examId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook để lấy kết quả bài thi của người dùng
 */
export function useUserExamResults(
  userId: string,
  params?: { page?: number; limit?: number }
): UseQueryResult<{ results: IExamResult[]; total: number; page: number; limit: number }, ApiError> {
  return useQuery({
    queryKey: [QueryKeys.EXAM_RESULTS, 'user', userId, params],
    queryFn: () => examService.getUserExamResults(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy kết quả bài thi cụ thể
 */
export function useExamResult(examId: string, resultId: string): UseQueryResult<IExamResult, ApiError> {
  return useQuery({
    queryKey: [QueryKeys.EXAM_RESULTS, examId, resultId],
    queryFn: () => examService.getExamResult(examId, resultId),
    enabled: !!examId && !!resultId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook để tạo bài thi mới
 */
export function useCreateExam(): UseMutationResult<IExam, ApiError, ICreateExamRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examService.createExam,
    onSuccess: (newExam) => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });
      
      // Add to cache
      queryClient.setQueryData(
        createDetailQueryKey(QueryKeys.EXAM, newExam.id),
        newExam
      );

      toast({
        title: "Thành công",
        description: "Bài thi đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo bài thi",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để cập nhật bài thi
 */
export function useUpdateExam(): UseMutationResult<IExam, ApiError, { id: string; data: IUpdateExamRequest }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => examService.updateExam(id, data),
    onSuccess: (updatedExam) => {
      // Update cache
      queryClient.setQueryData(
        createDetailQueryKey(QueryKeys.EXAM, updatedExam.id),
        updatedExam
      );

      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });

      toast({
        title: "Thành công",
        description: "Bài thi đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật bài thi",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để xóa bài thi
 */
export function useDeleteExam(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: (_, examId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: createDetailQueryKey(QueryKeys.EXAM, examId) });

      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });

      toast({
        title: "Thành công",
        description: "Bài thi đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bài thi",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để bắt đầu làm bài thi
 */
export function useStartExam(): UseMutationResult<
  {
    attemptId: string;
    exam: IExam;
    questions: unknown[];
    timeLimit: number;
    startTime: string;
  },
  ApiError,
  string
> {
  return useMutation({
    mutationFn: examService.startExam,
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể bắt đầu bài thi",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook để nộp bài thi
 */
export function useSubmitExam(): UseMutationResult<
  IExamResult,
  ApiError,
  {
    examId: string;
    attemptId: string;
    answers: Record<string, unknown>;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, attemptId, answers }) => 
      examService.submitExam(examId, attemptId, answers),
    onSuccess: (result) => {
      // Invalidate exam results
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAM_RESULTS] });
      
      // Invalidate exam stats
      queryClient.invalidateQueries({ 
        queryKey: [QueryKeys.EXAMS, 'stats', result.examId] 
      });

      toast({
        title: "Thành công",
        description: "Bài thi đã được nộp thành công",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể nộp bài thi",
        variant: "destructive",
      });
    },
  });
}
