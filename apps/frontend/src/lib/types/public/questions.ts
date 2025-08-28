/**
 * Public Question Types
 * TypeScript interfaces cho public question interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// Import base types từ existing question types
import {
  QuestionType,
  QuestionDifficulty,
  AnswerOption
} from '../question';

// ===== PUBLIC QUESTION INTERFACES =====

/**
 * Public Question Interface
 * Simplified question interface cho public users (no sensitive admin data)
 */
export interface PublicQuestion {
  id: string;
  content: string;
  type: QuestionType;
  difficulty?: QuestionDifficulty;
  category: string;
  subject?: string;
  grade?: string;
  points?: number;
  timeLimit?: number;
  explanation?: string;
  answers?: AnswerOption[];
  correctAnswer?: string | string[];
  solution?: string;
  tags?: string[];
  views?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public Question Filters Interface
 * Simplified filters cho public question browsing (no admin-specific filters)
 */
export interface PublicQuestionFilters {
  // Basic search
  keyword?: string;
  
  // Category filters
  category?: string[];
  subject?: string[];
  grade?: string[];
  
  // Question properties
  type?: QuestionType[];
  difficulty?: QuestionDifficulty[];
  
  // Content filters
  tags?: string[];
  hasAnswers?: boolean;
  hasSolution?: boolean;
  
  // Sorting
  sortBy?: 'newest' | 'oldest' | 'popular' | 'rating' | 'difficulty';
  sortDir?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Public Question List Response Interface
 * Response structure cho public question list API
 */
export interface PublicQuestionListResponse {
  data: PublicQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: PublicQuestionFilters;
  meta?: {
    totalQuestions: number;
    categories: string[];
    subjects: string[];
    grades: string[];
    difficulties: QuestionDifficulty[];
  };
}

/**
 * Public Question Response Interface
 * Response structure cho single question API
 */
export interface PublicQuestionResponse {
  data: PublicQuestion;
  related?: PublicQuestion[];
  meta?: {
    category: string;
    subject?: string;
    grade?: string;
    nextQuestionId?: string;
    previousQuestionId?: string;
  };
}

/**
 * Public Question Search Response Interface
 * Response structure cho question search API
 */
export interface PublicQuestionSearchResponse extends PublicQuestionListResponse {
  query: string;
  searchMeta: {
    totalResults: number;
    searchTime: number;
    suggestions?: string[];
    corrections?: string[];
  };
}

// ===== CATEGORY & METADATA INTERFACES =====

/**
 * Question Category Interface
 * Category information cho public browsing
 */
export interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  icon?: string;
  color?: string;
  subjects?: QuestionSubject[];
}

/**
 * Question Subject Interface
 * Subject information cho public browsing
 */
export interface QuestionSubject {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  questionCount: number;
  grades?: QuestionGrade[];
}

/**
 * Question Grade Interface
 * Grade information cho public browsing
 */
export interface QuestionGrade {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  questionCount: number;
  level: number;
}

// ===== STATISTICS INTERFACES =====

/**
 * Public Question Statistics Interface
 * Statistics data cho public dashboard
 */
export interface PublicQuestionStats {
  totalQuestions: number;
  totalCategories: number;
  totalSubjects: number;
  popularCategories: Array<{
    category: string;
    questionCount: number;
    percentage: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: QuestionDifficulty;
    count: number;
    percentage: number;
  }>;
  recentlyAdded: number;
  averageRating: number;
}

// ===== SEARCH & FILTER UTILITIES =====

/**
 * Public Search Suggestion Interface
 * Search suggestions cho public autocomplete
 */
export interface PublicSearchSuggestion {
  type: 'keyword' | 'category' | 'subject' | 'tag';
  value: string;
  label: string;
  count?: number;
  category?: string;
}

/**
 * Filter Option Interface
 * Filter options cho UI components
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  description?: string;
  disabled?: boolean;
}

/**
 * Filter Group Interface
 * Grouped filter options
 */
export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
  searchable?: boolean;
}

// ===== DEFAULT VALUES =====

/**
 * Default Public Question Filters
 * Default filter values cho public interface
 */
export const DEFAULT_PUBLIC_QUESTION_FILTERS: PublicQuestionFilters = {
  keyword: '',
  category: [],
  subject: [],
  grade: [],
  type: [],
  difficulty: [],
  tags: [],
  hasAnswers: undefined,
  hasSolution: undefined,
  sortBy: 'newest',
  sortDir: 'desc',
  page: 1,
  limit: 20
};

/**
 * Public Question Sort Options
 * Available sort options cho public interface
 */
export const PUBLIC_QUESTION_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất', field: 'createdAt', direction: 'desc' },
  { value: 'oldest', label: 'Cũ nhất', field: 'createdAt', direction: 'asc' },
  { value: 'popular', label: 'Phổ biến', field: 'views', direction: 'desc' },
  { value: 'rating', label: 'Đánh giá cao', field: 'rating', direction: 'desc' },
  { value: 'difficulty', label: 'Độ khó', field: 'difficulty', direction: 'asc' }
] as const;

/**
 * Public Question Pagination Limits
 * Available pagination limits cho public interface
 */
export const PUBLIC_QUESTION_PAGINATION_LIMITS = [10, 20, 50, 100] as const;

// ===== TYPE GUARDS =====

/**
 * Type guard cho PublicQuestion
 * Check if object is valid PublicQuestion
 */
export function isPublicQuestion(obj: unknown): obj is PublicQuestion {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as PublicQuestion).id === 'string' &&
    typeof (obj as PublicQuestion).content === 'string' &&
    typeof (obj as PublicQuestion).type === 'string' &&
    typeof (obj as PublicQuestion).category === 'string'
  );
}

/**
 * Type guard cho PublicQuestionFilters
 * Check if object is valid PublicQuestionFilters
 */
export function isPublicQuestionFilters(obj: unknown): obj is PublicQuestionFilters {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    // All properties are optional, so just check it's an object
    true
  );
}

// ===== UTILITY TYPES =====

/**
 * Public Question Sort By Type
 * Union type của available sort options
 */
export type PublicQuestionSortBy = typeof PUBLIC_QUESTION_SORT_OPTIONS[number]['value'];

/**
 * Public Question Pagination Limit Type
 * Union type của available pagination limits
 */
export type PublicQuestionPaginationLimit = typeof PUBLIC_QUESTION_PAGINATION_LIMITS[number];

/**
 * Public Question Filter Keys Type
 * Union type của filter keys
 */
export type PublicQuestionFilterKey = keyof PublicQuestionFilters;
