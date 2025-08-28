/**
 * Types Index
 * Main barrel exports cho tất cả types trong application
 *
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== COMMON TYPES =====
export type {
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  TableColumn,
  Theme,
  ThemeConfig
} from './common';

// ===== QUESTION TYPES =====
export type {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  AnswerOption,
  MatchingOption,
  CorrectAnswer,
  Question,
  QuestionFilters,
  QuestionPagination,
  QuestionListResponse
} from './question';

// ===== USER TYPES =====
export * from './user';

// ===== ADMIN TYPES =====
export * from './admin';

// ===== PUBLIC TYPES =====
export type {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  QuestionSubject,
  QuestionGrade,
  PublicQuestionStats,
  PublicSearchSuggestion,
  FilterOption,
  FilterGroup,
  PublicQuestionSortBy,
  PublicQuestionPaginationLimit,
  PublicQuestionFilterKey,
  DEFAULT_PUBLIC_QUESTION_FILTERS,
  PUBLIC_QUESTION_SORT_OPTIONS,
  PUBLIC_QUESTION_PAGINATION_LIMITS,
  isPublicQuestion,
  isPublicQuestionFilters
} from './public';

// ===== FORM COMPATIBILITY =====
export * from './form-compatibility';
