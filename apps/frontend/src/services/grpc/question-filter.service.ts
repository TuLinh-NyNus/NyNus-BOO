/**
 * Question Filter Service Client (gRPC-Web)
 * ========================================
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QuestionFilterServiceClient } from '@/generated/v1/Question_filterServiceClientPb';
import {
  ListQuestionsByFilterRequest,
  SearchQuestionsRequest,
  GetQuestionsByQuestionCodeRequest,
  QuestionCodeFilter,
  MetadataFilter,
  DateRangeFilter,
  ContentFilter,
  FilterPagination,
  SortOptions,
  SortField,
  SortOrder,
  QuestionDetail,
  QuestionSearchResult,
  QuestionWithCodeInfo,

} from '@/generated/v1/question_filter_pb';
import { RpcError } from 'grpc-web';

// gRPC client configuration
const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';
const questionFilterServiceClient = new QuestionFilterServiceClient(GRPC_ENDPOINT);

// Helper to get auth metadata
function getAuthMetadata(): { [key: string]: string } {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      return { 'authorization': `Bearer ${token}` };
    }
  }
  return {};
}

// Handle gRPC errors
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Invalid input provided';
    case 7: return 'Permission denied';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// Map QuestionDetail from protobuf
function mapQuestionDetailFromPb(q: QuestionDetail): any {
  return {
    id: q.getId(),
    raw_content: q.getRawContent(),
    content: q.getContent(),
    subcount: q.getSubcount(),
    type: q.getType(),
    source: q.getSource(),
    answers: q.getAnswers(),
    correct_answer: q.getCorrectAnswer(),
    solution: q.getSolution(),
    tags: q.getTagsList(),
    usage_count: q.getUsageCount(),
    creator: q.getCreator(),
    status: q.getStatus(),
    feedback: q.getFeedback(),
    difficulty: q.getDifficulty(),
    created_at: q.getCreatedAt()?.toDate(),
    updated_at: q.getUpdatedAt()?.toDate(),
    question_code_id: q.getQuestionCodeId(),
  };
}

export class QuestionFilterService {
  static async listQuestionsByFilter(dto: any): Promise<any> {
    try {
      const request = new ListQuestionsByFilterRequest();
      
      // Set QuestionCodeFilter
      if (dto.question_code_filter) {
        const codeFilter = new QuestionCodeFilter();
        if (dto.question_code_filter.grades) codeFilter.setGradesList(dto.question_code_filter.grades);
        if (dto.question_code_filter.subjects) codeFilter.setSubjectsList(dto.question_code_filter.subjects);
        if (dto.question_code_filter.chapters) codeFilter.setChaptersList(dto.question_code_filter.chapters);
        if (dto.question_code_filter.levels) codeFilter.setLevelsList(dto.question_code_filter.levels);
        if (dto.question_code_filter.lessons) codeFilter.setLessonsList(dto.question_code_filter.lessons);
        if (dto.question_code_filter.forms) codeFilter.setFormsList(dto.question_code_filter.forms);
        if (dto.question_code_filter.include_id5 !== undefined) codeFilter.setIncludeId5(dto.question_code_filter.include_id5);
        if (dto.question_code_filter.include_id6 !== undefined) codeFilter.setIncludeId6(dto.question_code_filter.include_id6);
        request.setQuestionCodeFilter(codeFilter);
      }
      
      // Set MetadataFilter
      if (dto.metadata_filter) {
        const metaFilter = new MetadataFilter();
        if (dto.metadata_filter.types) metaFilter.setTypesList(dto.metadata_filter.types);
        if (dto.metadata_filter.statuses) metaFilter.setStatusesList(dto.metadata_filter.statuses);
        if (dto.metadata_filter.difficulties) metaFilter.setDifficultiesList(dto.metadata_filter.difficulties);
        if (dto.metadata_filter.creators) metaFilter.setCreatorsList(dto.metadata_filter.creators);
        if (dto.metadata_filter.tags) metaFilter.setTagsList(dto.metadata_filter.tags);
        if (dto.metadata_filter.require_all_tags !== undefined) metaFilter.setRequireAllTags(dto.metadata_filter.require_all_tags);
        if (dto.metadata_filter.subcount_pattern) metaFilter.setSubcountPattern(dto.metadata_filter.subcount_pattern);
        if (dto.metadata_filter.min_usage_count !== undefined) metaFilter.setMinUsageCount(dto.metadata_filter.min_usage_count);
        if (dto.metadata_filter.max_usage_count !== undefined) metaFilter.setMaxUsageCount(dto.metadata_filter.max_usage_count);
        if (dto.metadata_filter.min_feedback !== undefined) metaFilter.setMinFeedback(dto.metadata_filter.min_feedback);
        if (dto.metadata_filter.max_feedback !== undefined) metaFilter.setMaxFeedback(dto.metadata_filter.max_feedback);
        request.setMetadataFilter(metaFilter);
      }
      
      // Set DateRangeFilter
      if (dto.date_filter) {
        const dateFilter = new DateRangeFilter();
        // Note: You may need to convert date strings to Timestamp objects
        // This is a simplified version
        request.setDateFilter(dateFilter);
      }
      
      // Set ContentFilter
      if (dto.content_filter) {
        const contentFilter = new ContentFilter();
        if (dto.content_filter.has_images !== undefined) contentFilter.setHasImages(dto.content_filter.has_images);
        if (dto.content_filter.has_solution !== undefined) contentFilter.setHasSolution(dto.content_filter.has_solution);
        if (dto.content_filter.has_answers !== undefined) contentFilter.setHasAnswers(dto.content_filter.has_answers);
        if (dto.content_filter.has_feedback !== undefined) contentFilter.setHasFeedback(dto.content_filter.has_feedback);
        if (dto.content_filter.has_tags !== undefined) contentFilter.setHasTags(dto.content_filter.has_tags);
        if (dto.content_filter.content_search) contentFilter.setContentSearch(dto.content_filter.content_search);
        if (dto.content_filter.solution_search) contentFilter.setSolutionSearch(dto.content_filter.solution_search);
        request.setContentFilter(contentFilter);
      }
      
      // Set Pagination
      if (dto.pagination) {
        const pagination = new FilterPagination();
        pagination.setPage(dto.pagination.page || 1);
        pagination.setLimit(dto.pagination.limit || 20);
        
        // Set sorting
        if (dto.pagination.sort && dto.pagination.sort.length > 0) {
          const sortList = dto.pagination.sort.map((s: any) => {
            const sortOption = new SortOptions();
            sortOption.setField(s.field || SortField.SORT_FIELD_CREATED_AT);
            sortOption.setOrder(s.order === 'asc' ? SortOrder.SORT_ORDER_ASC : SortOrder.SORT_ORDER_DESC);
            return sortOption;
          });
          pagination.setSortList(sortList);
        }
        
        request.setPagination(pagination);
      }

      const response = await questionFilterServiceClient.listQuestionsByFilter(request, getAuthMetadata());
      
      return {
        questions: response.getQuestionsList().map(mapQuestionDetailFromPb),
        total_count: response.getTotalCount(),
        page: response.getPage(),
        limit: response.getLimit(),
        total_pages: response.getTotalPages(),
        filter_summary: response.getFilterSummary()?.toObject(),
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  static async searchQuestions(dto: any): Promise<any> {
    try {
      const request = new SearchQuestionsRequest();
      request.setQuery(dto.query);
      if (dto.search_fields) request.setSearchFieldsList(dto.search_fields);
      
      // Set filters similar to listQuestionsByFilter
      if (dto.question_code_filter) {
        const codeFilter = new QuestionCodeFilter();
        // ... set properties as above
        request.setQuestionCodeFilter(codeFilter);
      }
      
      if (dto.metadata_filter) {
        const metaFilter = new MetadataFilter();
        // ... set properties as above
        request.setMetadataFilter(metaFilter);
      }
      
      if (dto.date_filter) {
        const dateFilter = new DateRangeFilter();
        request.setDateFilter(dateFilter);
      }
      
      if (dto.pagination) {
        const pagination = new FilterPagination();
        pagination.setPage(dto.pagination.page || 1);
        pagination.setLimit(dto.pagination.limit || 20);
        request.setPagination(pagination);
      }
      
      if (dto.highlight_matches !== undefined) {
        request.setHighlightMatches(dto.highlight_matches);
      }

      const response = await questionFilterServiceClient.searchQuestions(request, getAuthMetadata());
      
      return {
        questions: response.getQuestionsList().map((q: QuestionSearchResult) => ({
          question: mapQuestionDetailFromPb(q.getQuestion()!),
          highlights: q.getHighlightsList().map(h => h.toObject()),
          relevance_score: q.getRelevanceScore(),
        })),
        total_count: response.getTotalCount(),
        page: response.getPage(),
        limit: response.getLimit(),
        total_pages: response.getTotalPages(),
        query: response.getQuery(),
        search_fields: response.getSearchFieldsList(),
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  }

  static async getQuestionsByQuestionCode(dto: any): Promise<any> {
    try {
      const request = new GetQuestionsByQuestionCodeRequest();
      
      // Set QuestionCodeFilter
      if (dto.question_code_filter) {
        const codeFilter = new QuestionCodeFilter();
        if (dto.question_code_filter.grades) codeFilter.setGradesList(dto.question_code_filter.grades);
        if (dto.question_code_filter.subjects) codeFilter.setSubjectsList(dto.question_code_filter.subjects);
        if (dto.question_code_filter.chapters) codeFilter.setChaptersList(dto.question_code_filter.chapters);
        if (dto.question_code_filter.levels) codeFilter.setLevelsList(dto.question_code_filter.levels);
        if (dto.question_code_filter.lessons) codeFilter.setLessonsList(dto.question_code_filter.lessons);
        if (dto.question_code_filter.forms) codeFilter.setFormsList(dto.question_code_filter.forms);
        request.setQuestionCodeFilter(codeFilter);
      }
      
      if (dto.metadata_filter) {
        const metaFilter = new MetadataFilter();
        // ... set properties
        request.setMetadataFilter(metaFilter);
      }
      
      if (dto.pagination) {
        const pagination = new FilterPagination();
        pagination.setPage(dto.pagination.page || 1);
        pagination.setLimit(dto.pagination.limit || 20);
        request.setPagination(pagination);
      }
      
      if (dto.include_question_code_info !== undefined) {
        request.setIncludeQuestionCodeInfo(dto.include_question_code_info);
      }

      const response = await questionFilterServiceClient.getQuestionsByQuestionCode(request, getAuthMetadata());
      
      return {
        questions: response.getQuestionsList().map((q: QuestionWithCodeInfo) => ({
          question: mapQuestionDetailFromPb(q.getQuestion()!),
          question_code_info: q.getQuestionCodeInfo()?.toObject(),
        })),
        total_count: response.getTotalCount(),
        page: response.getPage(),
        limit: response.getLimit(),
        total_pages: response.getTotalPages(),
        question_code_summary: response.getQuestionCodeSummaryList().map(s => s.toObject()),
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
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
  ): Promise<any> {
    const req = {
      query,
      search_fields: ['content', 'solution'],
      metadata_filter: {
        types: options?.types,
        difficulties: options?.difficulties,
        statuses: options?.statuses,
      },
      pagination: {
        page: options?.page || 1,
        limit: options?.limit || 20,
      },
      highlight_matches: true,
    };
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
      { value: SortField.SORT_FIELD_CREATED_AT, label: 'Ngày tạo' },
      { value: SortField.SORT_FIELD_UPDATED_AT, label: 'Ngày cập nhật' },
      { value: SortField.SORT_FIELD_USAGE_COUNT, label: 'Số lần sử dụng' },
      { value: SortField.SORT_FIELD_FEEDBACK, label: 'Phản hồi' },
      { value: SortField.SORT_FIELD_DIFFICULTY, label: 'Độ khó' },
      { value: SortField.SORT_FIELD_QUESTION_CODE, label: 'Mã câu hỏi' },
      { value: SortField.SORT_FIELD_TYPE, label: 'Loại câu hỏi' },
      { value: SortField.SORT_FIELD_STATUS, label: 'Trạng thái' },
    ];
  }
  static createDefaultFilterRequest(): any {
    return {
      pagination: {
        page: 1,
        limit: 20,
        sort: [{ field: SortField.SORT_FIELD_CREATED_AT, order: 'desc' }],
      },
    };
  }
  /**
   * Build filter summary text
   */
  static buildFilterSummaryText(request: any): string {
    const parts: string[] = [];
    if (request.question_code_filter?.grades?.length) {
      const gradeLabels = request.question_code_filter.grades.map((g: any) => `Lớp ${parseInt(g) + 10}`);
      parts.push(`Lớp: ${gradeLabels.join(', ')}`);
    }
    if (request.question_code_filter?.subjects?.length) {
      const subjectMap: Record<string, string> = { 'D': 'XS-TK', 'E': 'Anh', 'H': 'Hóa', 'M': 'Toán', 'P': 'Lý', 'S': 'Khoa học' };
      const subjectLabels = request.question_code_filter.subjects.map((s: any) => subjectMap[s] || s);
      parts.push(`Môn: ${subjectLabels.join(', ')}`);
    }
    if (request.metadata_filter?.types?.length) {
      const typeMap: Record<string, string> = { 'MC': 'TN', 'TF': 'Đ/S', 'SA': 'TL ngắn', 'ES': 'Tự luận', 'MA': 'TN nhiều ĐA' };
      const typeLabels = request.metadata_filter.types.map((t: any) => typeMap[t] || t);
      parts.push(`Loại: ${typeLabels.join(', ')}`);
    }
    if (request.metadata_filter?.difficulties?.length) {
      const difficultyMap: Record<string, string> = { 'EASY': 'Dễ', 'MEDIUM': 'TB', 'HARD': 'Khó' };
      const difficultyLabels = request.metadata_filter.difficulties.map((d: any) => difficultyMap[d] || d);
      parts.push(`Độ khó: ${difficultyLabels.join(', ')}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Tất cả câu hỏi';
  }
}

// Re-export types for convenience (optional)
export type { SortField } from '@/types/question.types';
