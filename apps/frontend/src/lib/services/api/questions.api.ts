/**
 * Questions API Service
 * Gọi các endpoint backend thật cho câu hỏi
 */

import { httpClient } from '@/lib/api/client';
import type {
  ListQuestionsByFilterRequest,
  ListQuestionsByFilterResponse,
  SearchQuestionsRequest,
  SearchQuestionsResponse,
  GetQuestionsByQuestionCodeRequest,
  GetQuestionsByQuestionCodeResponse,
  QuestionDetail,
} from '@/lib/types/api/backend';

/**
 * Service gọi API câu hỏi từ backend
 */
export class QuestionsAPI {
  /**
   * Lọc câu hỏi theo các tiêu chí
   * POST /api/v1/questions/filter
   */
  static async filterQuestions(
    request: ListQuestionsByFilterRequest
  ): Promise<ListQuestionsByFilterResponse> {
    const response = await httpClient<ListQuestionsByFilterResponse>(
      '/api/v1/questions/filter',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response;
  }

  /**
   * Tìm kiếm câu hỏi theo nội dung
   * POST /api/v1/questions/search
   */
  static async searchQuestions(
    request: SearchQuestionsRequest
  ): Promise<SearchQuestionsResponse> {
    const response = await httpClient<SearchQuestionsResponse>(
      '/api/v1/questions/search',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response;
  }

  /**
   * Lấy câu hỏi theo QuestionCode components
   * POST /api/v1/questions/by-code
   */
  static async getQuestionsByQuestionCode(
    request: GetQuestionsByQuestionCodeRequest
  ): Promise<GetQuestionsByQuestionCodeResponse> {
    const response = await httpClient<GetQuestionsByQuestionCodeResponse>(
      '/api/v1/questions/by-code',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response;
  }

  /**
   * Lấy chi tiết một câu hỏi theo ID
   * GET /api/v1/questions/{id}
   * Note: Endpoint này có thể chưa được implement ở backend
   */
  static async getQuestionById(id: string): Promise<QuestionDetail> {
    const response = await httpClient<QuestionDetail>(`/api/v1/questions/${id}`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Kiểm tra xem có thể kết nối với backend không
   * Có thể dùng để health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
    // Thử gọi filter với request rỗng để kiểm tra kết nối
      await QuestionsAPI.filterQuestions({
        metadataFilter: {},
        contentFilter: {},
        pagination: {
          page: 1,
          limit: 1,
          sort: [],
        },
      });
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export default cho tiện dụng
export default QuestionsAPI;
