/**
 * Questions API Service
 * Gọi các endpoint backend thật cho câu hỏi
 */

import type {
  ListQuestionsByFilterRequest,
  ListQuestionsByFilterResponse,
  SearchQuestionsRequest,
  SearchQuestionsResponse,
  GetQuestionsByQuestionCodeRequest,
  GetQuestionsByQuestionCodeResponse,
  QuestionDetail,
} from '@/lib/types/api/backend';
import { QuestionFilterService } from '@/services/grpc/question-filter.service';
import { QuestionService } from '@/services/grpc/question.service';

/**
 * Service gọi API câu hỏi từ backend
 */
export class QuestionsAPI {
  /**
   * Map camelCase request (backend.ts) -> snake_case dto (types/question.types)
   */
  private static mapListRequestToDto(req: ListQuestionsByFilterRequest): import('@/types/question.types').ListQuestionsByFilterRequest {
    const dto: import('@/types/question.types').ListQuestionsByFilterRequest = {};
    if (req.questionCodeFilter) {
      dto.question_code_filter = {
        grades: req.questionCodeFilter.grades,
        subjects: req.questionCodeFilter.subjects,
        chapters: req.questionCodeFilter.chapters,
        levels: req.questionCodeFilter.levels,
        lessons: req.questionCodeFilter.lessons,
        forms: req.questionCodeFilter.forms,
        include_id5: req.questionCodeFilter.includeId5,
        include_id6: req.questionCodeFilter.includeId6,
      };
    }
    if (req.metadataFilter) {
      dto.metadata_filter = {
        types: req.metadataFilter.types as unknown as import('@/types/question.types').QuestionType[],
        statuses: req.metadataFilter.statuses as unknown as import('@/types/question.types').QuestionStatus[],
        difficulties: req.metadataFilter.difficulties as unknown as import('@/types/question.types').QuestionDifficulty[],
        creators: req.metadataFilter.creators,
        tags: req.metadataFilter.tags,
        require_all_tags: req.metadataFilter.requireAllTags,
        subcount_pattern: req.metadataFilter.subcountPattern,
        min_usage_count: req.metadataFilter.minUsageCount,
        max_usage_count: req.metadataFilter.maxUsageCount,
        min_feedback: req.metadataFilter.minFeedback,
        max_feedback: req.metadataFilter.maxFeedback,
      };
    }
    if (req.contentFilter) {
      dto.content_filter = {
        has_images: req.contentFilter.hasImages,
        has_solution: req.contentFilter.hasSolution,
        has_answers: req.contentFilter.hasAnswers,
        has_feedback: req.contentFilter.hasFeedback,
        has_tags: req.contentFilter.hasTags,
        content_search: req.contentFilter.contentSearch,
        solution_search: req.contentFilter.solutionSearch,
      };
    }
    if (req.pagination) {
      dto.pagination = {
        page: req.pagination.page,
        limit: req.pagination.limit,
        sort: (req.pagination.sort || []).map(s => ({
          field: QuestionsAPI.mapSortFieldEnumToString(s.field),
          order: s.order === 1 ? 'asc' : 'desc',
        })),
      } as unknown as import('@/types/question.types').FilterPagination;
    }
    return dto;
  }

  /** Map sort enum (backend.ts) -> string key (question.types) */
  private static mapSortFieldEnumToString(field: import('@/lib/types/api/backend').SortField): import('@/types/question.types').SortField {
    switch (field) {
      case 1: return 'created_at';
      case 2: return 'updated_at';
      case 3: return 'usage_count';
      case 4: return 'feedback';
      case 5: return 'difficulty';
      case 6: return 'question_code';
      case 7: return 'type';
      case 8: return 'status';
      default: return 'created_at';
    }
  }

  /** Map question dto (various shapes) -> QuestionDetail (backend.ts) */
  private static mapAnyQuestionToBackend(q: Record<string, unknown>): QuestionDetail {
    const pick = (a: Record<string, unknown>, ...keys: string[]) => {
      const k = keys.find(key => Object.prototype.hasOwnProperty.call(a, key) && (a as Record<string, unknown>)[key] !== undefined);
      return k ? (a as Record<string, unknown>)[k] : undefined;
    };
    const toString = (v: unknown, fallback = ''): string => (v === undefined || v === null ? fallback : String(v));
    const toStringOpt = (v: unknown): string | undefined => (v === undefined || v === null ? undefined : String(v));
    const toNumberOpt = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };
    const toStringArray = (v: unknown): string[] => {
      if (Array.isArray(v)) return v.map(x => String(x));
      return [];
    };

    return {
      id: toString(pick(q, 'id')),
      rawContent: toString(pick(q, 'rawContent', 'raw_content')),
      content: toString(pick(q, 'content')),
      subcount: toString(pick(q, 'subcount'), ''),
      type: toString(pick(q, 'type')),
      source: toStringOpt(pick(q, 'source')),
      answers: toStringOpt(pick(q, 'jsonAnswers', 'answers')),
      correctAnswer: toStringOpt(pick(q, 'jsonCorrectAnswer', 'correct_answer')),
      solution: toStringOpt(pick(q, 'solution')),
      tags: toStringArray(pick(q, 'tag', 'tags')),
      usageCount: toNumberOpt(pick(q, 'usageCount', 'usage_count')),
      creator: toStringOpt(pick(q, 'creator')),
      status: toStringOpt(pick(q, 'status')),
      feedback: toNumberOpt(pick(q, 'feedback')),
      difficulty: toStringOpt(pick(q, 'difficulty')),
      createdAt: toString(pick(q, 'createdAt', 'created_at'), new Date().toISOString()),
      updatedAt: toString(pick(q, 'updatedAt', 'updated_at'), new Date().toISOString()),
      questionCodeId: toString(pick(q, 'questionCodeId', 'question_code_id')),
    };
  }

  /**
   * Lọc câu hỏi theo các tiêu chí (gRPC-Web)
   */
  static async filterQuestions(
    request: ListQuestionsByFilterRequest
  ): Promise<ListQuestionsByFilterResponse> {
    const dto = QuestionsAPI.mapListRequestToDto(request);
    const res = await QuestionFilterService.listQuestionsByFilter(dto as unknown as import('@/types/question.types').ListQuestionsByFilterRequest);
    return {
      questions: (res.questions || []).map(q => QuestionsAPI.mapAnyQuestionToBackend(q as unknown as Record<string, unknown>)),
      totalCount: res.total_count,
      page: res.page,
      limit: res.limit,
      totalPages: res.total_pages,
      filterSummary: res.filter_summary as unknown as import('@/lib/types/api/backend').FilterSummary,
    };
  }

  /**
   * Tìm kiếm câu hỏi theo nội dung (gRPC-Web)
   */
  static async searchQuestions(
    request: SearchQuestionsRequest
  ): Promise<SearchQuestionsResponse> {
    const dto: import('@/types/question.types').SearchQuestionsRequest = {
      query: request.query,
      search_fields: request.searchFields || ['content', 'solution'],
      question_code_filter: request.questionCodeFilter ? {
        grades: request.questionCodeFilter.grades,
        subjects: request.questionCodeFilter.subjects,
        chapters: request.questionCodeFilter.chapters,
        levels: request.questionCodeFilter.levels,
        lessons: request.questionCodeFilter.lessons,
        forms: request.questionCodeFilter.forms,
        include_id5: request.questionCodeFilter.includeId5,
        include_id6: request.questionCodeFilter.includeId6,
      } : undefined,
      metadata_filter: request.metadataFilter ? {
        types: request.metadataFilter.types as unknown as import('@/types/question.types').QuestionType[],
        statuses: request.metadataFilter.statuses as unknown as import('@/types/question.types').QuestionStatus[],
        difficulties: request.metadataFilter.difficulties as unknown as import('@/types/question.types').QuestionDifficulty[],
        creators: request.metadataFilter.creators,
        tags: request.metadataFilter.tags,
        require_all_tags: request.metadataFilter.requireAllTags,
        subcount_pattern: request.metadataFilter.subcountPattern,
        min_usage_count: request.metadataFilter.minUsageCount,
        max_usage_count: request.metadataFilter.maxUsageCount,
        min_feedback: request.metadataFilter.minFeedback,
        max_feedback: request.metadataFilter.maxFeedback,
      } : undefined,
      pagination: request.pagination ? {
        page: request.pagination.page,
        limit: request.pagination.limit,
        sort: (request.pagination.sort || []).map(s => ({
          field: QuestionsAPI.mapSortFieldEnumToString(s.field),
          order: s.order === 1 ? 'asc' : 'desc',
        })),
      } : undefined,
      highlight_matches: request.highlightMatches ?? true,
    } as unknown as import('@/types/question.types').SearchQuestionsRequest;

    const res = await QuestionFilterService.searchQuestions(dto);
    return {
      questions: (res.questions || []).map(q => ({
        question: QuestionsAPI.mapAnyQuestionToBackend(q as unknown as Record<string, unknown>),
      })) as unknown as SearchQuestionsResponse['questions'],
      totalCount: res.total_count,
      page: res.page,
      limit: res.limit,
      totalPages: res.total_pages,
      query: res.query,
      searchFields: res.search_fields,
    };
  }

  /**
   * Lấy câu hỏi theo QuestionCode components (gRPC-Web)
   */
  static async getQuestionsByQuestionCode(
    request: GetQuestionsByQuestionCodeRequest
  ): Promise<GetQuestionsByQuestionCodeResponse> {
    const dto: import('@/types/question.types').GetQuestionsByQuestionCodeRequest = {
      question_code_filter: request.questionCodeFilter ? {
        grades: request.questionCodeFilter.grades,
        subjects: request.questionCodeFilter.subjects,
        chapters: request.questionCodeFilter.chapters,
        levels: request.questionCodeFilter.levels,
        lessons: request.questionCodeFilter.lessons,
        forms: request.questionCodeFilter.forms,
        include_id5: request.questionCodeFilter.includeId5,
        include_id6: request.questionCodeFilter.includeId6,
      } : undefined,
      metadata_filter: request.metadataFilter ? {
        types: request.metadataFilter.types as unknown as import('@/types/question.types').QuestionType[],
        statuses: request.metadataFilter.statuses as unknown as import('@/types/question.types').QuestionStatus[],
        difficulties: request.metadataFilter.difficulties as unknown as import('@/types/question.types').QuestionDifficulty[],
        creators: request.metadataFilter.creators,
        tags: request.metadataFilter.tags,
        require_all_tags: request.metadataFilter.requireAllTags,
      } : undefined,
      pagination: request.pagination ? {
        page: request.pagination.page,
        limit: request.pagination.limit,
      } : undefined,
      include_question_code_info: request.includeQuestionCodeInfo ?? true,
    } as unknown as import('@/types/question.types').GetQuestionsByQuestionCodeRequest;

    const res = await QuestionFilterService.getQuestionsByQuestionCode(dto);
    return {
      questions: (res.questions || []).map(q => {
        const obj = q as unknown as { [key: string]: unknown };
        const info = obj['question_code_info'] as unknown as GetQuestionsByQuestionCodeResponse['questions'][number]['questionCodeInfo'];
        return {
          question: QuestionsAPI.mapAnyQuestionToBackend(obj),
          questionCodeInfo: info,
        };
      }) as unknown as GetQuestionsByQuestionCodeResponse['questions'],
      totalCount: res.total_count,
      page: res.page,
      limit: res.limit,
      totalPages: res.total_pages,
      questionCodeSummary: res.question_code_summary as unknown as import('@/lib/types/api/backend').QuestionCodeSummary[],
    };
  }

  /**
   * Lấy chi tiết một câu hỏi theo ID (gRPC-Web)
   */
  static async getQuestionById(id: string): Promise<QuestionDetail> {
    const res = await QuestionService.getQuestion({ id });
    if (!res.question) throw new Error('Question not found');
    return QuestionsAPI.mapAnyQuestionToBackend(res.question as unknown as Record<string, unknown>);
  }

  /**
   * Kiểm tra xem có thể kết nối với backend không
   * Có thể dùng để health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Ping by listing questions with minimal pagination
      await QuestionsAPI.filterQuestions({
        pagination: { page: 1, limit: 1, sort: [] },
      } as unknown as ListQuestionsByFilterRequest);
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export default cho tiện dụng
export default QuestionsAPI;
