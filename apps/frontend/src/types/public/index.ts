/**
 * Public Types Index
 * Barrel exports cho public types theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== QUESTION TYPES =====

// Main interfaces
export type {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse
} from './questions';

// Category & metadata interfaces
export type {
  QuestionCategory,
  QuestionSubject,
  QuestionGrade,
  PublicQuestionStats
} from './questions';

// Search & filter utilities
export type {
  PublicSearchSuggestion,
  FilterOption,
  FilterGroup
} from './questions';

// Utility types
export type {
  PublicQuestionSortBy,
  PublicQuestionPaginationLimit,
  PublicQuestionFilterKey
} from './questions';

// Constants
export {
  DEFAULT_PUBLIC_QUESTION_FILTERS,
  PUBLIC_QUESTION_SORT_OPTIONS,
  PUBLIC_QUESTION_PAGINATION_LIMITS
} from './questions';

// Type guards
export {
  isPublicQuestion,
  isPublicQuestionFilters
} from './questions';

// ===== RE-EXPORTS FROM BASE TYPES =====

// Re-export commonly used base types cho convenience
export type {
  QuestionType,
  AnswerOption
} from '../question';

// Re-export enums as values
export {
  QuestionDifficulty
} from '../question';
