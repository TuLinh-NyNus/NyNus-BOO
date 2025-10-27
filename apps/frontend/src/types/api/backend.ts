/**
 * Backend API Types
 * TypeScript types cho Backend API (từ proto/swagger)
 * QuestionFilterService và related types
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

// ===== BASIC TYPES =====

/**
 * Timestamp type (ISO string)
 */
export type Timestamp = string;

/**
 * Sort field enum
 */
export enum SortField {
  SORT_FIELD_UNSPECIFIED = 0,
  SORT_FIELD_CREATED_AT = 1,
  SORT_FIELD_UPDATED_AT = 2,
  SORT_FIELD_USAGE_COUNT = 3,
  SORT_FIELD_FEEDBACK = 4,
  SORT_FIELD_DIFFICULTY = 5,
  SORT_FIELD_QUESTION_CODE = 6,
  SORT_FIELD_TYPE = 7,
  SORT_FIELD_STATUS = 8,
}

/**
 * Sort order enum
 */
export enum SortOrder {
  SORT_ORDER_UNSPECIFIED = 0,
  SORT_ORDER_ASC = 1,
  SORT_ORDER_DESC = 2,
}

/**
 * Sort options
 */
export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// ===== FILTER TYPES =====

/**
 * QuestionCode Filter Components
 */
export interface QuestionCodeFilter {
  grades?: string[];          // 0,1,2 (10th, 11th, 12th grade)
  subjects?: string[];        // D,E,H,M,P,S
  chapters?: string[];        // 1,2,3,4,5...
  levels?: string[];          // N,H,V,C,T,M
  lessons?: string[];         // 1,2,3,A,B,C...
  forms?: string[];           // 1,2,3... (Form numbers, only for ID6 format)
  includeId5?: boolean;       // Include ID5 format questions (default: true)
  includeId6?: boolean;       // Include ID6 format questions (default: true)
}

/**
 * Metadata Filters
 */
export interface MetadataFilter {
  types?: string[];               // MC, TF, SA, ES, MA
  statuses?: string[];            // ACTIVE, PENDING, INACTIVE, ARCHIVED
  difficulties?: string[];        // EASY, MEDIUM, HARD
  creators?: string[];            // Filter by creator usernames
  tags?: string[];                // Filter by tags (OR logic)
  requireAllTags?: boolean;       // If true, use AND logic for tags
  subcountPattern?: string;       // Pattern matching for subcount field
  minUsageCount?: number;         // Minimum usage count
  maxUsageCount?: number;         // Maximum usage count
  minFeedback?: number;           // Minimum feedback score
  maxFeedback?: number;           // Maximum feedback score
  onlyFavorites?: boolean;        // If true, only return favorite questions
}

/**
 * Date Range Filter
 */
export interface DateRangeFilter {
  createdAfter?: Timestamp;      // Created after this date
  createdBefore?: Timestamp;     // Created before this date
  updatedAfter?: Timestamp;      // Updated after this date
  updatedBefore?: Timestamp;     // Updated before this date
}

/**
 * Boolean Content Filters
 */
export interface ContentFilter {
  hasImages?: boolean;         // Filter questions with/without images
  hasSolution?: boolean;       // Filter questions with/without solution
  hasAnswers?: boolean;        // Filter questions with/without answers
  hasFeedback?: boolean;       // Filter questions with/without feedback
  hasTags?: boolean;           // Filter questions with/without tags
  contentSearch?: string;      // Full-text search in content
  solutionSearch?: string;     // Full-text search in solution
}

/**
 * Pagination for Filter Results
 */
export interface FilterPagination {
  page: number;               // Page number (1-based)
  limit: number;              // Items per page (max 100)
  sort?: SortOptions[];       // Multiple sort criteria
}

// ===== QUESTION TYPES =====

/**
 * QuestionDetail message for filter responses
 */
export interface QuestionDetail {
  id: string;
  rawContent: string;
  content: string;
  subcount?: string;
  type: string;
  source?: string;
  answers?: string;           // JSON string
  correctAnswer?: string;
  solution?: string;
  tags?: string[];
  usageCount?: number;
  creator?: string;
  status?: string;
  feedback?: number;
  difficulty?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  questionCodeId: string;
}

/**
 * QuestionCode information
 */
export interface QuestionCodeInfo {
  code: string;
  format: string;          // ID5 or ID6
  grade: string;           // Human-readable grade
  subject: string;         // Human-readable subject
  chapter: string;
  level: string;           // Human-readable level
  lesson: string;
  form?: string;
  folderPath?: string;     // Google Drive folder path
  isId6?: boolean;
}

/**
 * Question with QuestionCode information
 */
export interface QuestionWithCodeInfo {
  question: QuestionDetail;
  questionCodeInfo?: QuestionCodeInfo;
}

// ===== SEARCH TYPES =====

/**
 * Search highlight information
 */
export interface SearchHighlight {
  field: string;           // Field name where match was found
  snippet: string;         // Text snippet with highlights
  positions?: number[];    // Character positions of matches
}

/**
 * Question with search highlights
 */
export interface QuestionSearchResult {
  question: QuestionDetail;
  highlights?: SearchHighlight[];
  relevance_score?: number;
}

// ===== FILTER SUMMARY =====

/**
 * Filter Summary for analytics
 */
export interface FilterSummary {
  totalQuestions: number;
  byType?: Record<string, number>;           // Count by question type
  byStatus?: Record<string, number>;         // Count by status
  byDifficulty?: Record<string, number>;     // Count by difficulty
  byGrade?: Record<string, number>;          // Count by grade
  bySubject?: Record<string, number>;        // Count by subject
  byCreator?: Record<string, number>;        // Count by creator
  withImages?: number;                       // Count with images
  withSolution?: number;                     // Count with solution
  withFeedback?: number;                     // Count with feedback
}

/**
 * QuestionCode summary for analytics
 */
export interface QuestionCodeSummary {
  grade: string;
  subject: string;
  chapter: string;
  level: string;
  questionCount: number;
  availableLessons?: string[];
  availableForms?: string[];
}

// ===== REQUEST/RESPONSE TYPES =====

/**
 * ListQuestionsByFilter Request
 */
export interface ListQuestionsByFilterRequest {
  questionCodeFilter?: QuestionCodeFilter;
  metadataFilter?: MetadataFilter;
  dateFilter?: DateRangeFilter;
  contentFilter?: ContentFilter;
  pagination?: FilterPagination;
}

/**
 * ListQuestionsByFilter Response
 */
export interface ListQuestionsByFilterResponse {
  questions: QuestionDetail[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  filterSummary?: FilterSummary;
}

/**
 * SearchQuestions Request
 */
export interface SearchQuestionsRequest {
  query: string;                           // Search query
  searchFields?: string[];                 // Fields to search: content, solution, tags
  questionCodeFilter?: QuestionCodeFilter;
  metadataFilter?: MetadataFilter;
  dateFilter?: DateRangeFilter;
  pagination?: FilterPagination;
  highlightMatches?: boolean;              // Return highlighted search matches
}

/**
 * SearchQuestions Response
 */
export interface SearchQuestionsResponse {
  questions: QuestionSearchResult[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  query: string;
  searchFields?: string[];
}

/**
 * GetQuestionsByQuestionCode Request
 */
export interface GetQuestionsByQuestionCodeRequest {
  questionCodeFilter: QuestionCodeFilter;
  metadataFilter?: MetadataFilter;
  pagination?: FilterPagination;
  includeQuestionCodeInfo?: boolean;       // Include parsed QuestionCode information
}

/**
 * GetQuestionsByQuestionCode Response
 */
export interface GetQuestionsByQuestionCodeResponse {
  questions: QuestionWithCodeInfo[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  questionCodeSummary?: QuestionCodeSummary[];
}

// QuestionCodeRequest/Response were custom types - removed
// Use GetQuestionsByQuestionCodeRequest/Response instead

// ===== UTILITY TYPES =====

/**
 * Generic API Response wrapper
 */
export interface APIResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Error response type
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
