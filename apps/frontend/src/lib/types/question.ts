/**
 * Question Types for Admin Management
 * Interfaces và types cho quản lý câu hỏi trong admin panel
 */

// Enums cho question management
export enum QuestionType {
  MC = 'MC', // Multiple Choice
  TF = 'TF', // True/False
  SA = 'SA', // Short Answer
  ES = 'ES', // Essay
  MA = 'MA'  // Matching
}

export enum QuestionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Answer Option interface cho multiple choice questions
export interface AnswerOption {
  id: string;
  content: string;
  isCorrect?: boolean;
  explanation?: string;  // Add explanation property
  text?: string;         // Add backward compatibility for text property
}

// Matching Pair interface cho matching questions
export interface MatchingPair {
  left: string;
  right: string;
}

// Union type cho matching options
export type MatchingOption = MatchingPair;

// Correct Answer union type cho các loại câu hỏi khác nhau
export type CorrectAnswer =
  | { kind: 'MC'; values: string[] }
  | { kind: 'TF'; values: string[] }
  | { kind: 'SA'; values: string[] }
  | { kind: 'ES'; values: string[] }
  | { kind: 'MA'; pairs: MatchingPair[] };

// Question Code interface cho MapID system
export interface QuestionCode {
  code: string; // Primary key - "0P1VH1" format
  format: 'ID5' | 'ID6'; // [XXXXX] hoặc [XXXXX-X]
  grade: string; // Lớp (0-9, A, B, C)
  subject: string; // Môn học (P=Toán, L=Vật lý, H=Hóa học...)
  chapter: string; // Chương (1-9)
  lesson: string; // Bài học (1-9, A-Z)
  form?: string; // Dạng bài (1-9, chỉ ID6)
  level: string; // Mức độ (N,H,V,C,T,M)

  // Validation properties
  isValid?: boolean; // Indicates if the code is valid
  error?: string; // Error message if invalid
}

// Main Question interface
export interface Question {
  id: string;
  rawContent: string; // LaTeX gốc từ user
  content: string; // Nội dung đã xử lý (cleaned)
  subcount?: string; // [XX.N] format
  type: QuestionType;
  source?: string; // Nguồn câu hỏi

  // Structured answers data
  answers?: AnswerOption[] | MatchingOption[];
  correctAnswer?: CorrectAnswer;
  solution?: string; // Lời giải chi tiết
  explanation?: string; // Giải thích đáp án

  // Scoring and timing
  points?: number; // Điểm số của câu hỏi
  timeLimit?: number; // Thời gian làm bài (giây)

  // Metadata
  tag: string[]; // Tags cho câu hỏi
  usageCount?: number;
  creator?: string;
  status?: QuestionStatus;
  feedback?: number; // Điểm feedback trung bình
  difficulty?: QuestionDifficulty;

  // Relations
  questionCodeId: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Question Draft interface cho form creation
export interface QuestionDraft {
  content: string;
  rawContent?: string;
  type: QuestionType;
  difficulty?: QuestionDifficulty;
  category?: string;
  tags?: string[];
  timeLimit?: number;
  points?: number;
  explanation?: string;
  answers?: AnswerOption[] | MatchingOption[];
  correctAnswer?: CorrectAnswer;
  source?: string;
  questionCodeId?: string;
}

// Filter interface cho question list - Extended version
export interface QuestionFilters {
  // Core filters (existing - maintain backward compatibility)
  type?: QuestionType | QuestionType[];
  status?: QuestionStatus | QuestionStatus[];
  difficulty?: QuestionDifficulty | QuestionDifficulty[];
  codePrefix?: string;
  keyword?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'feedback';
  sortDir?: 'asc' | 'desc';

  // Academic/Educational filters
  grade?: string[];
  subject?: string[];
  chapter?: string[];
  level?: string[];
  lesson?: string[];
  form?: string[];
  format?: ('ID5' | 'ID6')[];

  // Metadata filters
  creator?: string[];
  source?: string; // Changed from string[] to string for free input
  tags?: string[];
  subcount?: string;

  // Content flags
  hasAnswers?: boolean;
  hasSolution?: boolean;
  hasImages?: boolean;

  // Analytics filters
  usageCount?: { min?: number; max?: number };
  feedback?: { min?: number; max?: number };
  dateRange?: { from?: Date; to?: Date; field: 'createdAt' | 'updatedAt' };

  // Search filters
  solutionKeyword?: string;
  latexKeyword?: string;
  globalSearch?: string;

  // Pagination (optional for compatibility)
  page?: number;
  pageSize?: number;
}

// Alias for backward compatibility
export type IQuestionFilters = QuestionFilters;

// Pagination interface
export interface QuestionPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

// API Response interface
export interface QuestionListResponse {
  data: Question[];
  pagination: QuestionPagination;
}

// Props interfaces cho components

// QuestionList component props
export interface QuestionListProps {
  data: Question[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  pagination: QuestionPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// QuestionFilters component props
export interface QuestionFiltersProps {
  value: QuestionFilters;
  onChange: (value: QuestionFilters) => void;
}

// QuestionBulkActions component props
export interface QuestionBulkActionsProps {
  selectedIds: string[];
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: QuestionStatus) => void;
}

// QuestionForm component props
export interface QuestionFormProps {
  value: QuestionDraft;
  onChange: (draft: QuestionDraft) => void;
  errors?: string[];
}

// QuestionFormTabs component props
export interface QuestionFormTabsProps {
  form: React.ReactNode;
  latex: React.ReactNode;
  mapid: React.ReactNode;
  preview: React.ReactNode;
}

// MapIdDecoder component props
export interface MapIdDecoderProps {
  code?: string;
  onDecode: (result: QuestionCode) => void;
}

// LaTeX parsing result interface
export interface LaTeXParseResult {
  data?: Partial<Question>;
  error?: string;
}

// File upload result interface
export interface FileUploadResult {
  data?: Question[];
  error?: string;
}

// Saved questions interface cho localStorage
export interface SavedQuestionsData {
  questions: Question[];
  lastUpdated: string;
}

// Error types cho question operations
export class QuestionNotFoundError extends Error {
  constructor(message: string = 'Không tìm thấy câu hỏi') {
    super(message);
    this.name = 'QuestionNotFoundError';
  }
}

export class QuestionValidationError extends Error {
  constructor(message: string = 'Dữ liệu câu hỏi không hợp lệ') {
    super(message);
    this.name = 'QuestionValidationError';
  }
}

export class LaTeXParseError extends Error {
  constructor(message: string = 'Lỗi phân tích LaTeX') {
    super(message);
    this.name = 'LaTeXParseError';
  }
}
