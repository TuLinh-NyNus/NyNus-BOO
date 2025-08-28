/**
 * Public Services Index
 * Barrel exports cho public services theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== QUESTION SERVICES =====

// Main service class
export { PublicQuestionService } from './questions.service';

// ===== SERVICE TYPES =====

// Re-export service-related types cho convenience
export type {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  PublicQuestionStats,
  PublicSearchSuggestion
} from '@/lib/types/public';
