/**
 * Question Filter Adapter
 * Converts between domain QuestionFilters and gRPC ListQuestionsByFilterRequest/Response
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-27
 */

import { QuestionFilters } from '@/types/question';
import {
  ListQuestionsByFilterRequest,
  ListQuestionsByFilterResponse,
  QuestionCodeFilter,
  MetadataFilter,
  DateRangeFilter,
  ContentFilter,
  FilterPagination,
  SortOptions,
  SortField,
  SortOrder,
  QuestionDetail,
} from '@/generated/v1/question_filter_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

// ===== TYPE GUARDS =====

/**
 * Check if value is an array
 */
function isArray<T>(value: T | T[] | undefined): value is T[] {
  return Array.isArray(value);
}

/**
 * Ensure value is an array
 */
function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return isArray(value) ? value : [value];
}

// ===== FILTER BUILDERS =====

/**
 * Build QuestionCodeFilter from domain filters
 */
function buildQuestionCodeFilter(filters: QuestionFilters): QuestionCodeFilter | undefined {
  const hasCodeFilters = 
    filters.grade?.length || 
    filters.subject?.length || 
    filters.chapter?.length || 
    filters.level?.length || 
    filters.lesson?.length || 
    filters.form?.length;

  if (!hasCodeFilters) {
    return undefined;
  }

  const codeFilter = new QuestionCodeFilter();

  // Set grade filter
  if (filters.grade?.length) {
    codeFilter.setGradesList(filters.grade);
  }

  // Set subject filter
  if (filters.subject?.length) {
    codeFilter.setSubjectsList(filters.subject);
  }

  // Set chapter filter
  if (filters.chapter?.length) {
    codeFilter.setChaptersList(filters.chapter);
  }

  // Set level filter
  if (filters.level?.length) {
    codeFilter.setLevelsList(filters.level);
  }

  // Set lesson filter
  if (filters.lesson?.length) {
    codeFilter.setLessonsList(filters.lesson);
  }

  // Set form filter
  if (filters.form?.length) {
    codeFilter.setFormsList(filters.form);
  }

  // Include both ID5 and ID6 format by default
  codeFilter.setIncludeId5(filters.format?.includes('ID5') ?? true);
  codeFilter.setIncludeId6(filters.format?.includes('ID6') ?? true);

  return codeFilter;
}

/**
 * Build MetadataFilter from domain filters
 */
function buildMetadataFilter(filters: QuestionFilters): MetadataFilter | undefined {
  const hasMetadataFilters = 
    filters.type || 
    filters.status || 
    filters.difficulty || 
    filters.creator?.length || 
    filters.tags?.length || 
    filters.subcount ||
    filters.usageCount ||
    filters.feedback;

  if (!hasMetadataFilters) {
    return undefined;
  }

  const metadataFilter = new MetadataFilter();

  // Set type filter
  if (filters.type) {
    const types = ensureArray(filters.type);
    // Convert to protobuf enum values (these are numbers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadataFilter.setTypesList(types as any);
  }

  // Set status filter
  if (filters.status) {
    const statuses = ensureArray(filters.status);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadataFilter.setStatusesList(statuses as any);
  }

  // Set difficulty filter
  if (filters.difficulty) {
    const difficulties = ensureArray(filters.difficulty);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadataFilter.setDifficultiesList(difficulties as any);
  }

  // Set creator filter
  if (filters.creator?.length) {
    metadataFilter.setCreatorsList(filters.creator);
  }

  // Set tags filter
  if (filters.tags?.length) {
    metadataFilter.setTagsList(filters.tags);
    metadataFilter.setRequireAllTags(false); // Match any tag by default
  }

  // Set subcount pattern
  if (filters.subcount) {
    metadataFilter.setSubcountPattern(filters.subcount);
  }

  // Set usage count range
  if (filters.usageCount) {
    if (filters.usageCount.min !== undefined) {
      metadataFilter.setMinUsageCount(filters.usageCount.min);
    }
    if (filters.usageCount.max !== undefined) {
      metadataFilter.setMaxUsageCount(filters.usageCount.max);
    }
  }

  // Set feedback range
  if (filters.feedback) {
    if (filters.feedback.min !== undefined) {
      metadataFilter.setMinFeedback(filters.feedback.min);
    }
    if (filters.feedback.max !== undefined) {
      metadataFilter.setMaxFeedback(filters.feedback.max);
    }
  }

  return metadataFilter;
}

/**
 * Build DateRangeFilter from domain filters
 */
function buildDateRangeFilter(filters: QuestionFilters): DateRangeFilter | undefined {
  if (!filters.dateRange) {
    return undefined;
  }

  const dateFilter = new DateRangeFilter();
  const { from, to, field } = filters.dateRange;

  if (field === 'createdAt') {
    if (from) {
      const timestamp = new Timestamp();
      timestamp.fromDate(from);
      dateFilter.setCreatedAfter(timestamp);
    }
    if (to) {
      const timestamp = new Timestamp();
      timestamp.fromDate(to);
      dateFilter.setCreatedBefore(timestamp);
    }
  } else if (field === 'updatedAt') {
    if (from) {
      const timestamp = new Timestamp();
      timestamp.fromDate(from);
      dateFilter.setUpdatedAfter(timestamp);
    }
    if (to) {
      const timestamp = new Timestamp();
      timestamp.fromDate(to);
      dateFilter.setUpdatedBefore(timestamp);
    }
  }

  return dateFilter;
}

/**
 * Build ContentFilter from domain filters
 */
function buildContentFilter(filters: QuestionFilters): ContentFilter | undefined {
  const hasContentFilters = 
    filters.keyword || 
    filters.solutionKeyword || 
    filters.latexKeyword || 
    filters.globalSearch ||
    filters.hasAnswers !== undefined || 
    filters.hasSolution !== undefined || 
    filters.hasImages !== undefined;

  if (!hasContentFilters) {
    return undefined;
  }

  const contentFilter = new ContentFilter();

  // Set keyword searches
  // Priority: globalSearch > specific keyword searches
  if (filters.globalSearch) {
    contentFilter.setContentSearch(filters.globalSearch);
    contentFilter.setSolutionSearch(filters.globalSearch);
  } else {
    if (filters.keyword) {
      contentFilter.setContentSearch(filters.keyword);
    }
    if (filters.solutionKeyword) {
      contentFilter.setSolutionSearch(filters.solutionKeyword);
    }
  }

  // Set boolean filters
  if (filters.hasAnswers !== undefined) {
    contentFilter.setHasAnswers(filters.hasAnswers);
  }

  if (filters.hasSolution !== undefined) {
    contentFilter.setHasSolution(filters.hasSolution);
  }

  if (filters.hasImages !== undefined) {
    contentFilter.setHasImages(filters.hasImages);
  }

  return contentFilter;
}

/**
 * Build sort options from domain filters
 */
function buildSortOptions(filters: QuestionFilters): SortOptions[] {
  const sortOptions: SortOptions[] = [];
  
  // Determine sort field
  let field: SortField = SortField.SORT_FIELD_CREATED_AT;
  const order: SortOrder = filters.sortDir === 'asc' ? SortOrder.SORT_ORDER_ASC : SortOrder.SORT_ORDER_DESC;

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'createdAt':
        field = SortField.SORT_FIELD_CREATED_AT;
        break;
      case 'updatedAt':
        field = SortField.SORT_FIELD_UPDATED_AT;
        break;
      case 'usageCount':
        field = SortField.SORT_FIELD_USAGE_COUNT;
        break;
      case 'feedback':
        field = SortField.SORT_FIELD_FEEDBACK;
        break;
      default:
        field = SortField.SORT_FIELD_CREATED_AT;
    }
  }

  const sortOption = new SortOptions();
  sortOption.setField(field);
  sortOption.setOrder(order);
  sortOptions.push(sortOption);

  return sortOptions;
}

/**
 * Build pagination from domain filters
 */
function buildPagination(filters: QuestionFilters, page?: number, pageSize?: number): FilterPagination {
  const pagination = new FilterPagination();
  
  // Use provided page/pageSize or fall back to filters
  const targetPage = page ?? filters.page ?? 1;
  const targetPageSize = pageSize ?? filters.pageSize ?? 20;

  pagination.setPage(targetPage);
  pagination.setLimit(Math.min(targetPageSize, 100)); // Max 100 per page
  
  // Add sort options
  const sortOptions = buildSortOptions(filters);
  pagination.setSortList(sortOptions);

  return pagination;
}

// ===== MAIN ADAPTER FUNCTIONS =====

/**
 * Create ListQuestionsByFilterRequest from domain QuestionFilters
 * This is the main function used by stores and hooks
 */
export function createFilterListRequest(
  filters: QuestionFilters | undefined, 
  page?: number, 
  pageSize?: number
): ListQuestionsByFilterRequest {
  const request = new ListQuestionsByFilterRequest();
  
  // Provide default empty filters if undefined
  const safeFilters: QuestionFilters = filters ?? {};

  // Build and set filters
  const questionCodeFilter = buildQuestionCodeFilter(safeFilters);
  if (questionCodeFilter) {
    request.setQuestionCodeFilter(questionCodeFilter);
  }

  const metadataFilter = buildMetadataFilter(safeFilters);
  if (metadataFilter) {
    request.setMetadataFilter(metadataFilter);
  }

  const dateFilter = buildDateRangeFilter(safeFilters);
  if (dateFilter) {
    request.setDateFilter(dateFilter);
  }

  const contentFilter = buildContentFilter(safeFilters);
  if (contentFilter) {
    request.setContentFilter(contentFilter);
  }

  // Always set pagination
  const pagination = buildPagination(safeFilters, page, pageSize);
  request.setPagination(pagination);

  return request;
}

// ===== TYPES =====

interface FilterSummary {
  [key: string]: unknown;
}

export interface RawQuestionData {
  id: string;
  raw_content: string;
  rawContent: string;
  content: string;
  subcount: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any; // protobuf QuestionType
  source: string;
  answers: string;
  correct_answer: string;
  correctAnswer: string;
  solution: string;
  tags: string[];
  tag: string[];
  usage_count: number;
  usageCount: number;
  creator: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status: any; // protobuf QuestionStatus  
  feedback: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  difficulty: any; // protobuf DifficultyLevel
  question_code_id: string;
  questionCodeId: string;
  created_at: string;
  createdAt: string;
  updated_at: string;
  updatedAt: string;
  is_favorite?: boolean;
  isFavorite?: boolean;
}

interface FilterListResponseResult {
  questions: RawQuestionData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filterSummary?: FilterSummary;
}

/**
 * Parse ListQuestionsByFilterResponse to domain format
 */
export function parseFilterListResponse(response: ListQuestionsByFilterResponse): FilterListResponseResult {
  const questionsList = response.getQuestionsList();
  const questions = questionsList.map((q: QuestionDetail) => {
    // Get timestamps
    const createdAtTimestamp = q.getCreatedAt();
    const updatedAtTimestamp = q.getUpdatedAt();

    const questionCodeId = q.getQuestionCodeId();
    
    // DEBUG: Log question code ID
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 [parseFilterListResponse] Question:', {
        id: q.getId(),
        questionCodeId: questionCodeId,
        type: typeof questionCodeId,
        isEmpty: !questionCodeId || questionCodeId === '',
      });
    }

    return {
      id: q.getId(),
      raw_content: q.getRawContent(),
      rawContent: q.getRawContent(),
      content: q.getContent(),
      subcount: q.getSubcount(),
      type: q.getType(),
      source: q.getSource(),
      answers: q.getAnswers(),
      correct_answer: q.getCorrectAnswer(),
      correctAnswer: q.getCorrectAnswer(),
      solution: q.getSolution(),
      tags: q.getTagsList(),
      tag: q.getTagsList(),
      usage_count: q.getUsageCount(),
      usageCount: q.getUsageCount(),
      creator: q.getCreator(),
      status: q.getStatus(),
      feedback: q.getFeedback(),
      difficulty: q.getDifficulty(),
      question_code_id: questionCodeId,
      questionCodeId: questionCodeId,
      created_at: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString(),
      createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString(),
      updated_at: updatedAtTimestamp ? updatedAtTimestamp.toDate().toISOString() : new Date().toISOString(),
      updatedAt: updatedAtTimestamp ? updatedAtTimestamp.toDate().toISOString() : new Date().toISOString(),
    };
  });

  const filterSummary = response.getFilterSummary();

  return {
    questions,
    total: response.getTotalCount(),
    page: response.getPage(),
    pageSize: response.getLimit(),
    totalPages: response.getTotalPages(),
    filterSummary: filterSummary ? filterSummary.toObject() : undefined,
  };
}

// ===== VALIDATION & LOGGING =====

/**
 * Validate QuestionFilters
 */
export function validateQuestionFilters(filters: QuestionFilters): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate page
  if (filters.page !== undefined && filters.page < 1) {
    errors.push('Page must be >= 1');
  }

  // Validate pageSize
  if (filters.pageSize !== undefined) {
    if (filters.pageSize < 1) {
      errors.push('Page size must be >= 1');
    }
    if (filters.pageSize > 100) {
      errors.push('Page size must be <= 100');
    }
  }

  // Validate usage count range
  if (filters.usageCount) {
    if (filters.usageCount.min !== undefined && filters.usageCount.min < 0) {
      errors.push('Usage count min must be >= 0');
    }
    if (filters.usageCount.max !== undefined && filters.usageCount.max < 0) {
      errors.push('Usage count max must be >= 0');
    }
    if (
      filters.usageCount.min !== undefined && 
      filters.usageCount.max !== undefined && 
      filters.usageCount.min > filters.usageCount.max
    ) {
      errors.push('Usage count min must be <= max');
    }
  }

  // Validate feedback range
  if (filters.feedback) {
    if (filters.feedback.min !== undefined && filters.feedback.min < 0) {
      errors.push('Feedback min must be >= 0');
    }
    if (filters.feedback.max !== undefined && filters.feedback.max < 0) {
      errors.push('Feedback max must be >= 0');
    }
    if (
      filters.feedback.min !== undefined && 
      filters.feedback.max !== undefined && 
      filters.feedback.min > filters.feedback.max
    ) {
      errors.push('Feedback min must be <= max');
    }
  }

  // Validate date range
  if (filters.dateRange) {
    if (filters.dateRange.from && filters.dateRange.to && filters.dateRange.from > filters.dateRange.to) {
      errors.push('Date range from must be <= to');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Log filter request for debugging
 */
export function logFilterRequest(filters: QuestionFilters, request: ListQuestionsByFilterRequest): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 [Question Filter Request]');
    console.log('Domain Filters:', filters);
    
    const hasQuestionCodeFilter = request.hasQuestionCodeFilter();
    const hasMetadataFilter = request.hasMetadataFilter();
    const hasDateFilter = request.hasDateFilter();
    const hasContentFilter = request.hasContentFilter();
    
    console.log('Filter Components:', {
      questionCodeFilter: hasQuestionCodeFilter,
      metadataFilter: hasMetadataFilter,
      dateFilter: hasDateFilter,
      contentFilter: hasContentFilter,
    });

    if (hasQuestionCodeFilter) {
      const qcf = request.getQuestionCodeFilter()!;
      console.log('QuestionCodeFilter:', {
        grades: qcf.getGradesList(),
        subjects: qcf.getSubjectsList(),
        chapters: qcf.getChaptersList(),
        levels: qcf.getLevelsList(),
        lessons: qcf.getLessonsList(),
        forms: qcf.getFormsList(),
      });
    }

    if (hasMetadataFilter) {
      const mf = request.getMetadataFilter()!;
      console.log('MetadataFilter:', {
        types: mf.getTypesList(),
        statuses: mf.getStatusesList(),
        difficulties: mf.getDifficultiesList(),
        creators: mf.getCreatorsList(),
        tags: mf.getTagsList(),
      });
    }

    if (hasContentFilter) {
      const cf = request.getContentFilter()!;
      console.log('ContentFilter:', {
        contentSearch: cf.getContentSearch(),
        solutionSearch: cf.getSolutionSearch(),
        hasAnswers: cf.getHasAnswers(),
        hasSolution: cf.getHasSolution(),
        hasImages: cf.getHasImages(),
      });
    }

    const pagination = request.getPagination();
    if (pagination) {
      console.log('Pagination:', {
        page: pagination.getPage(),
        limit: pagination.getLimit(),
        sort: pagination.getSortList().map((s: any) => ({
          field: s.getField(),
          order: s.getOrder(),
        })),
      });
    }

    console.groupEnd();
  }
}
