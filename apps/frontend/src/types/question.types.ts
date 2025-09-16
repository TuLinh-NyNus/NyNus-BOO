/**
 * Question Management Types
 * =========================
 * TypeScript interfaces based on proto definitions
 * This is a temporary solution until proto generation is set up
 */

// ========================================
// BASIC TYPES
// ========================================

export interface BaseResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

// ========================================
// QUESTION TYPES
// ========================================

export type QuestionType = 'MC' | 'TF' | 'SA' | 'ES' | 'MA';
export type QuestionStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ARCHIVED';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Answer {
  id: string;
  content: string;
  is_correct: boolean;
  explanation?: string;
}

export interface SingleAnswer {
  answer_id: string;
}

export interface MultipleAnswers {
  answer_ids: string[];
}

export interface TextAnswer {
  text: string;
}

export type CorrectAnswer = {
  single?: SingleAnswer;
  multiple?: MultipleAnswers;
  text?: TextAnswer;
};

export interface Question {
  id: string;
  raw_content: string;
  content: string;
  subcount: string;
  type: QuestionType;
  source: string;
  
  // Answer data - can be structured or JSON
  structured_answers?: Answer[];
  json_answers?: string;
  
  // Correct answer data
  structured_correct?: CorrectAnswer;
  json_correct_answer?: string;
  
  solution?: string;
  tag: string[];
  usage_count: number;
  creator: string;
  status: QuestionStatus;
  feedback: number;
  difficulty: QuestionDifficulty;
  question_code_id: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface CreateQuestionRequest {
  raw_content: string;
  content: string;
  subcount: string;
  type: QuestionType;
  source: string;
  
  // Answer data
  structured_answers?: Answer[];
  json_answers?: string;
  
  // Correct answer data
  structured_correct?: CorrectAnswer;
  json_correct_answer?: string;
  
  solution?: string;
  tag: string[];
  question_code_id: string;
  status: QuestionStatus;
  difficulty: QuestionDifficulty;
  creator: string;
}

export interface CreateQuestionResponse extends BaseResponse {
  question?: Question;
}

export interface GetQuestionRequest {
  id: string;
}

export interface GetQuestionResponse extends BaseResponse {
  question?: Question;
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {
  id: string;
}

export interface UpdateQuestionResponse extends BaseResponse {
  question?: Question;
}

export interface DeleteQuestionRequest {
  id: string;
}

export interface DeleteQuestionResponse extends BaseResponse {
  deleted_id?: string; // ID of deleted question
}

export interface ListQuestionsRequest {
  pagination?: PaginationRequest;
}

export interface ListQuestionsResponse extends BaseResponse {
  questions: Question[];
  pagination?: PaginationResponse;
}

export interface ImportError {
  row_number: number;
  field_name: string;
  error_message: string;
  row_data: string;
}

export interface ImportQuestionsRequest {
  csv_data_base64: string;
  upsert_mode: boolean;
}

export interface ImportQuestionsResponse {
  success: boolean;
  message: string;
  total_processed: number;
  created_count: number;
  updated_count: number;
  error_count: number;
  errors: ImportError[];
  summary: string;
}

// ========================================
// FILTER TYPES (from question_filter.proto)
// ========================================

export interface QuestionDetail {
  id: string;
  raw_content: string;
  content: string;
  subcount: string;
  type: QuestionType;
  source: string;
  answers: string;
  correct_answer: string;
  solution: string;
  tags: string[];
  usage_count: number;
  creator: string;
  status: QuestionStatus;
  feedback: number;
  difficulty: QuestionDifficulty;
  created_at: string;
  updated_at: string;
  question_code_id: string;
}

export interface QuestionCodeFilter {
  grades?: string[];
  subjects?: string[];
  chapters?: string[];
  levels?: string[];
  lessons?: string[];
  forms?: string[];
  include_id5?: boolean;
  include_id6?: boolean;
}

export interface MetadataFilter {
  types?: QuestionType[];
  statuses?: QuestionStatus[];
  difficulties?: QuestionDifficulty[];
  creators?: string[];
  tags?: string[];
  require_all_tags?: boolean;
  subcount_pattern?: string;
  min_usage_count?: number;
  max_usage_count?: number;
  min_feedback?: number;
  max_feedback?: number;
}

export interface DateRangeFilter {
  created_after?: string; // ISO string
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

export interface ContentFilter {
  has_images?: boolean;
  has_solution?: boolean;
  has_answers?: boolean;
  has_feedback?: boolean;
  has_tags?: boolean;
  content_search?: string;
  solution_search?: string;
}

export type SortField = 
  | 'created_at' 
  | 'updated_at' 
  | 'usage_count' 
  | 'feedback' 
  | 'difficulty' 
  | 'question_code' 
  | 'type' 
  | 'status';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export interface FilterPagination {
  page: number;
  limit: number;
  sort?: SortOptions[];
}

export interface ListQuestionsByFilterRequest {
  question_code_filter?: QuestionCodeFilter;
  metadata_filter?: MetadataFilter;
  date_filter?: DateRangeFilter;
  content_filter?: ContentFilter;
  pagination?: FilterPagination;
}

export interface FilterSummary {
  total_matched: number;
  breakdown_by_type: Record<QuestionType, number>;
  breakdown_by_difficulty: Record<QuestionDifficulty, number>;
  breakdown_by_status: Record<QuestionStatus, number>;
}

export interface ListQuestionsByFilterResponse extends BaseResponse {
  questions: QuestionDetail[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  filter_summary?: FilterSummary;
}

export interface SearchQuestionsRequest {
  query: string;
  search_fields: string[];
  question_code_filter?: QuestionCodeFilter;
  metadata_filter?: MetadataFilter;
  date_filter?: DateRangeFilter;
  pagination?: FilterPagination;
  highlight_matches?: boolean;
}

export interface QuestionSearchResult extends QuestionDetail {
  highlights?: string[];
  match_score?: number;
}

export interface SearchQuestionsResponse extends BaseResponse {
  questions: QuestionSearchResult[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  query: string;
  search_fields: string[];
}

export interface GetQuestionsByQuestionCodeRequest {
  // Inherits all QuestionCode fields
  question_code_filter?: QuestionCodeFilter;
  metadata_filter?: MetadataFilter;
  pagination?: FilterPagination;
  include_question_code_info?: boolean;
}

export interface QuestionWithCodeInfo extends QuestionDetail {
  question_code_info?: {
    grade: string;
    subject: string;
    chapter: string;
    lesson: string;
    level: string;
    form?: string;
  };
}

export interface QuestionCodeSummary {
  grade: string;
  subject: string;
  chapter: string;
  total_questions: number;
}

export interface GetQuestionsByQuestionCodeResponse extends BaseResponse {
  questions: QuestionWithCodeInfo[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  question_code_summary?: QuestionCodeSummary[];
}