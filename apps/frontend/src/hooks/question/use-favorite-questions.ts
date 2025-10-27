/**
 * useFavoriteQuestions Hook
 * Hook for managing favorite questions functionality
 * 
 * Features:
 * - Toggle favorite status for questions
 * - Fetch list of favorite questions with pagination
 * - Optimistic UI updates
 * - Error handling with toast notifications
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { QuestionService } from '@/services/grpc/question.service';
import { useToast } from '@/hooks/ui/use-toast';
import { Question } from '@/types/question';

interface UseFavoriteQuestionsReturn {
  /**
   * Toggle favorite status of a question
   * @param questionId - The question ID
   * @param currentStatus - Current favorite status
   * @returns Promise that resolves when operation completes
   */
  toggleFavorite: (questionId: string, currentStatus: boolean) => Promise<boolean>;
  
  /**
   * Fetch favorite questions with pagination
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page
   * @returns Promise with questions and pagination info
   */
  fetchFavorites: (page?: number, pageSize?: number) => Promise<{
    questions: Question[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>;
  
  /**
   * Loading state for async operations
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: string | null;
}

/**
 * Hook for managing favorite questions
 * @returns Object with favorite management functions and state
 */
export function useFavoriteQuestions(): UseFavoriteQuestionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Toggle favorite status of a question
   * Implements optimistic UI pattern with rollback on error
   */
  const toggleFavorite = useCallback(async (
    questionId: string, 
    currentStatus: boolean
  ): Promise<boolean> => {
    const newStatus = !currentStatus;
    setIsLoading(true);
    setError(null);

    try {
      const response = await QuestionService.toggleFavorite(questionId, newStatus);

      if (response.success) {
        toast({
          title: 'Thành công',
          description: newStatus 
            ? 'Đã thêm câu hỏi vào danh sách yêu thích' 
            : 'Đã xóa câu hỏi khỏi danh sách yêu thích',
          variant: 'success',
        });

        return response.isFavorite;
      } else {
        throw new Error(response.message || 'Failed to toggle favorite');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái yêu thích';
      setError(errorMessage);
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });

      // Return original status on error
      return currentStatus;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Fetch favorite questions with pagination
   */
  const fetchFavorites = useCallback(async (
    page: number = 1,
    pageSize: number = 20
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await QuestionService.listFavoriteQuestions(page, pageSize);

      if (response.success) {
        return {
          questions: response.questions as Question[],
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách câu hỏi yêu thích';
      setError(errorMessage);
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        questions: [],
        pagination: undefined,
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    toggleFavorite,
    fetchFavorites,
    isLoading,
    error,
  };
}

