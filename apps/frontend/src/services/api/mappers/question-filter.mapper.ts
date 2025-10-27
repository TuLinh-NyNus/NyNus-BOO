/**
 * Question Filter Mapper
 * Chuyển đổi filter data giữa Frontend và Backend formats
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import {
  PublicQuestionFilters
} from '@/types/public';

import {
  ListQuestionsByFilterRequest,
  SearchQuestionsRequest,
  QuestionCodeFilter,
  MetadataFilter,
  ContentFilter,
  FilterPagination,
  SortOptions,
  SortField,
  SortOrder
} from '@/types/api/backend';

import {
  subjectNameToCode,
  gradeNameToCode
} from '@/lib/constants/taxonomy';

// ===== FILTER MAPPERS =====

/**
 * Map PublicQuestionFilters to QuestionCodeFilter
 * UPDATED: Thêm hỗ trợ đầy đủ chapter, level, lesson, form
 */
function mapToQuestionCodeFilter(filters: PublicQuestionFilters): QuestionCodeFilter | undefined {
  const hasCodeFilters = filters.subject?.length || filters.grade?.length;
  
  if (!hasCodeFilters) {
    return undefined;
  }

  const questionCodeFilter: QuestionCodeFilter = {};

  // Map subjects - convert display names to codes if needed
  if (filters.subject?.length) {
    questionCodeFilter.subjects = filters.subject.map(subject => {
      // Check if it's already a code (single letter)
      if (subject.length === 1) {
        return subject;
      }
      // Otherwise convert from name to code
      return subjectNameToCode(subject) || subject;
    });
  }

  // Map grades - convert display names to codes if needed
  if (filters.grade?.length) {
    questionCodeFilter.grades = filters.grade.map(grade => {
      // Check if it's already a code (0,1,2)
      if (['0', '1', '2'].includes(grade)) {
        return grade;
      }
      // Otherwise convert from name to code
      return gradeNameToCode(grade) || grade;
    });
  }

  questionCodeFilter.includeId5 = true;
  questionCodeFilter.includeId6 = true;

  return questionCodeFilter;
}

/**
 * Map PublicQuestionFilters to MetadataFilter
 */
function mapToMetadataFilter(filters: PublicQuestionFilters): MetadataFilter | undefined {
  const hasMetadataFilters = filters.type?.length || 
                             filters.difficulty?.length || 
                             filters.tags?.length;
  
  if (!hasMetadataFilters) {
    return undefined;
  }

  const metadataFilter: MetadataFilter = {};

  // Map question types
  if (filters.type?.length) {
    metadataFilter.types = filters.type as string[];
  }

  // Map difficulties
  if (filters.difficulty?.length) {
    metadataFilter.difficulties = filters.difficulty as string[];
  }

  // Map tags
  if (filters.tags?.length) {
    metadataFilter.tags = filters.tags;
    metadataFilter.requireAllTags = false;
  }

  return metadataFilter;
}

/**
 * Map PublicQuestionFilters to ContentFilter
 */
function mapToContentFilter(filters: PublicQuestionFilters): ContentFilter | undefined {
  const hasContentFilters = filters.keyword || 
                           filters.hasAnswers !== undefined || 
                           filters.hasSolution !== undefined;
  
  if (!hasContentFilters) {
    return undefined;
  }

  const contentFilter: ContentFilter = {};

  // Map keyword to content search
  if (filters.keyword) {
    contentFilter.contentSearch = filters.keyword;
  }

  // Map boolean filters
  if (filters.hasAnswers !== undefined) {
    contentFilter.hasAnswers = filters.hasAnswers;
  }

  if (filters.hasSolution !== undefined) {
    contentFilter.hasSolution = filters.hasSolution;
  }

  return contentFilter;
}

/**
 * Map sorting options from FE to BE
 */
function mapToSortOptions(sortBy?: string, sortDir?: 'asc' | 'desc'): SortOptions[] {
  const sort: SortOptions[] = [];
  
  if (!sortBy) {
    // Default sort by created_at desc
    sort.push({
      field: SortField.SORT_FIELD_CREATED_AT,
      order: SortOrder.SORT_ORDER_DESC
    });
    return sort;
  }

  // Map sort field
  let field: SortField;
  let order: SortOrder = sortDir === 'asc' ? SortOrder.SORT_ORDER_ASC : SortOrder.SORT_ORDER_DESC;

  switch (sortBy) {
    case 'newest':
      field = SortField.SORT_FIELD_CREATED_AT;
      order = SortOrder.SORT_ORDER_DESC;
      break;
    case 'oldest':
      field = SortField.SORT_FIELD_CREATED_AT;
      order = SortOrder.SORT_ORDER_ASC;
      break;
    case 'popular':
      field = SortField.SORT_FIELD_USAGE_COUNT;
      order = SortOrder.SORT_ORDER_DESC;
      break;
    case 'rating':
      // Backend uses feedback instead of rating
      field = SortField.SORT_FIELD_FEEDBACK;
      order = SortOrder.SORT_ORDER_DESC;
      break;
    case 'difficulty':
      field = SortField.SORT_FIELD_DIFFICULTY;
      order = SortOrder.SORT_ORDER_ASC; // Easy -> Hard
      break;
    default:
      field = SortField.SORT_FIELD_CREATED_AT;
  }

  sort.push({ field, order });
  return sort;
}

/**
 * Map pagination options
 */
function mapToPagination(filters: PublicQuestionFilters): FilterPagination {
  return {
    page: filters.page || 1,
    limit: Math.min(filters.limit || 20, 100), // Max 100 items per page
    sort: mapToSortOptions(filters.sortBy, filters.sortDir)
  };
}

// ===== MAIN MAPPER FUNCTIONS =====

/**
 * Map PublicQuestionFilters to ListQuestionsByFilterRequest
 */
export function mapFiltersToListRequest(filters: PublicQuestionFilters): ListQuestionsByFilterRequest {
  const request: ListQuestionsByFilterRequest = {
    pagination: mapToPagination(filters)
  };

  // Add optional filters
  const questionCodeFilter = mapToQuestionCodeFilter(filters);
  if (questionCodeFilter) {
    request.questionCodeFilter = questionCodeFilter;
  }

  const metadataFilter = mapToMetadataFilter(filters);
  if (metadataFilter) {
    request.metadataFilter = metadataFilter;
  }

  const contentFilter = mapToContentFilter(filters);
  if (contentFilter) {
    request.contentFilter = contentFilter;
  }

  return request;
}

/**
 * Map to SearchQuestionsRequest
 */
export function mapToSearchRequest(
  query: string,
  filters: PublicQuestionFilters
): SearchQuestionsRequest {
  const request: SearchQuestionsRequest = {
    query,
    searchFields: ['content', 'solution', 'tags'], // Search all fields
    pagination: mapToPagination(filters),
    highlightMatches: true
  };

  // Add optional filters
  const questionCodeFilter = mapToQuestionCodeFilter(filters);
  if (questionCodeFilter) {
    request.questionCodeFilter = questionCodeFilter;
  }

  const metadataFilter = mapToMetadataFilter(filters);
  if (metadataFilter) {
    request.metadataFilter = metadataFilter;
  }

  return request;
}

/**
 * Map filter summary to meta info
 */
export function mapFilterSummaryToMeta(summary?: Record<string, unknown>): Record<string, unknown> {
  if (!summary) return {};

  return {
    totalQuestions: summary.total_questions || 0,
    byType: summary.by_type || {},
    byDifficulty: summary.by_difficulty || {},
    byGrade: summary.by_grade || {},
    bySubject: summary.by_subject || {},
    withSolution: summary.with_solution || 0,
    withAnswers: summary.with_answers || 0
  };
}
