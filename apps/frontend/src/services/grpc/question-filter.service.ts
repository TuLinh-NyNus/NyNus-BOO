/**
 * Question Filter Service Client (gRPC-Web)
 * ========================================
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  ListQuestionsByFilterRequest as ListQuestionsByFilterRequestDTO,
  ListQuestionsByFilterResponse as ListQuestionsByFilterResponseDTO,
  SearchQuestionsRequest as SearchQuestionsRequestDTO,
  SearchQuestionsResponse as SearchQuestionsResponseDTO,
  GetQuestionsByQuestionCodeRequest as GetQuestionsByQuestionCodeRequestDTO,
  GetQuestionsByQuestionCodeResponse as GetQuestionsByQuestionCodeResponseDTO,
  SortField,
  QuestionType,
  QuestionDifficulty,
  QuestionStatus,
} from '@/types/question.types';

import { GRPC_WEB_HOST, getAuthMetadata } from './client';

import {
  ListQuestionsByFilterRequest,
  ListQuestionsByFilterResponse,
  SearchQuestionsRequest,
  SearchQuestionsResponse,
  GetQuestionsByQuestionCodeRequest,
  GetQuestionsByQuestionCodeResponse,
} from '@/generated/v1/question_filter_pb';
import { QuestionFilterServiceClient } from '@/generated/v1/question_filter_pb_service';

const client = new QuestionFilterServiceClient(GRPC_WEB_HOST);

export class QuestionFilterService {
  static async listQuestionsByFilter(dto: ListQuestionsByFilterRequestDTO): Promise<ListQuestionsByFilterResponseDTO> {
    const req = new ListQuestionsByFilterRequest();
    // Minimal mapping: directly passing nested objects may not work; here we use toObject style expectations.
    // For now, only pagination mapped; extend if needed.
    if (dto.pagination) {
      req.getPagination()?.setPage?.(dto.pagination.page);
      req.getPagination()?.setLimit?.(dto.pagination.limit);
      // Sorting mapping can be added later if needed
    }
    return new Promise((resolve, reject) => {
      client.listQuestionsByFilter(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as ListQuestionsByFilterResponse;
        resolve({
          questions: msg.getQuestionsList().map(q => q.toObject() as any),
          total_count: msg.getTotalCount(),
          page: msg.getPage(),
          limit: msg.getLimit(),
          total_pages: msg.getTotalPages(),
          filter_summary: msg.getFilterSummary()?.toObject() as any,
        } as any);
      });
    });
  }

  static async searchQuestions(dto: SearchQuestionsRequestDTO): Promise<SearchQuestionsResponseDTO> {
    const req = new SearchQuestionsRequest();
    req.setQuery(dto.query);
    req.setSearchFieldsList(dto.search_fields || []);
    return new Promise((resolve, reject) => {
      client.searchQuestions(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as SearchQuestionsResponse;
        resolve({
          questions: msg.getQuestionsList().map(q => q.toObject() as any),
          total_count: msg.getTotalCount(),
          page: msg.getPage(),
          limit: msg.getLimit(),
          total_pages: msg.getTotalPages(),
          query: msg.getQuery(),
          search_fields: msg.getSearchFieldsList(),
        } as any);
      });
    });
  }

static async getQuestionsByQuestionCode(_dto: GetQuestionsByQuestionCodeRequestDTO): Promise<GetQuestionsByQuestionCodeResponseDTO> {
    const req = new GetQuestionsByQuestionCodeRequest();
    return new Promise((resolve, reject) => {
      client.getQuestionsByQuestionCode(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as GetQuestionsByQuestionCodeResponse;
        resolve({
          questions: msg.getQuestionsList().map(q => q.toObject() as any),
          total_count: msg.getTotalCount(),
          page: msg.getPage(),
          limit: msg.getLimit(),
          total_pages: msg.getTotalPages(),
          question_code_summary: msg.getQuestionCodeSummaryList().map(s => s.toObject() as any),
        } as any);
      });
    });
  }

  static async quickSearch(
    query: string,
    options?: {
      types?: string[];
      difficulties?: string[];
      statuses?: string[];
      page?: number;
      limit?: number;
    }
  ): Promise<SearchQuestionsResponseDTO> {
    const req: SearchQuestionsRequestDTO = {
      query,
      search_fields: ['content', 'solution'],
      metadata_filter: {
        types: options?.types as QuestionType[] | undefined,
        difficulties: options?.difficulties as QuestionDifficulty[] | undefined,
        statuses: options?.statuses as QuestionStatus[] | undefined,
      },
      pagination: {
        page: options?.page || 1,
        limit: options?.limit || 20,
      },
      highlight_matches: true,
    } as any;
    return this.searchQuestions(req);
  }
}

export class QuestionFilterHelpers {
  static getGradeOptions() {
    return [
      { value: '0', label: 'Lớp 10' },
      { value: '1', label: 'Lớp 11' },
      { value: '2', label: 'Lớp 12' },
    ];
  }
  static getSubjectOptions() {
    return [
      { value: 'D', label: 'Xác suất thống kê' },
      { value: 'E', label: 'Tiếng Anh' },
      { value: 'H', label: 'Hóa học' },
      { value: 'M', label: 'Toán học' },
      { value: 'P', label: 'Vật lý' },
      { value: 'S', label: 'Khoa học' },
    ];
  }
  static getLevelOptions() {
    return [
      { value: 'N', label: 'Nhận biết' },
      { value: 'H', label: 'Hiểu' },
      { value: 'V', label: 'Vận dụng' },
      { value: 'C', label: 'Vận dụng cao' },
      { value: 'T', label: 'VIP' },
      { value: 'M', label: 'Ghi chú' },
    ];
  }
  static getSortFieldOptions() {
    return [
      { value: 'created_at' as SortField, label: 'Ngày tạo' },
      { value: 'updated_at' as SortField, label: 'Ngày cập nhật' },
      { value: 'usage_count' as SortField, label: 'Số lần sử dụng' },
      { value: 'feedback' as SortField, label: 'Phản hồi' },
      { value: 'difficulty' as SortField, label: 'Độ khó' },
      { value: 'question_code' as SortField, label: 'Mã câu hỏi' },
      { value: 'type' as SortField, label: 'Loại câu hỏi' },
      { value: 'status' as SortField, label: 'Trạng thái' },
    ];
  }
  static createDefaultFilterRequest(): ListQuestionsByFilterRequestDTO {
    return {
      pagination: {
        page: 1,
        limit: 20,
        sort: [{ field: 'created_at', order: 'desc' } as any],
      },
    } as any;
  }
  /**
   * Build filter summary text
   */
  static buildFilterSummaryText(request: ListQuestionsByFilterRequestDTO): string {
    const parts: string[] = [];
    if (request.question_code_filter?.grades?.length) {
      const gradeLabels = request.question_code_filter.grades.map(g => `Lớp ${parseInt(g) + 10}`);
      parts.push(`Lớp: ${gradeLabels.join(', ')}`);
    }
    if (request.question_code_filter?.subjects?.length) {
      const subjectMap: Record<string, string> = { 'D': 'XS-TK', 'E': 'Anh', 'H': 'Hóa', 'M': 'Toán', 'P': 'Lý', 'S': 'Khoa học' };
      const subjectLabels = request.question_code_filter.subjects.map(s => subjectMap[s] || s);
      parts.push(`Môn: ${subjectLabels.join(', ')}`);
    }
    if (request.metadata_filter?.types?.length) {
      const typeMap: Record<string, string> = { 'MC': 'TN', 'TF': 'Đ/S', 'SA': 'TL ngắn', 'ES': 'Tự luận', 'MA': 'TN nhiều ĐA' };
      const typeLabels = request.metadata_filter.types.map(t => typeMap[t] || t);
      parts.push(`Loại: ${typeLabels.join(', ')}`);
    }
    if (request.metadata_filter?.difficulties?.length) {
      const difficultyMap: Record<string, string> = { 'EASY': 'Dễ', 'MEDIUM': 'TB', 'HARD': 'Khó' };
      const difficultyLabels = request.metadata_filter.difficulties.map(d => difficultyMap[d] || d);
      parts.push(`Độ khó: ${difficultyLabels.join(', ')}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Tất cả câu hỏi';
  }
}

// Re-export types for convenience (optional)
export type { SortField } from '@/types/question.types';
