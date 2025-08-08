/**
 * Enhanced Question Types for Admin Management
 * Aligned với questions-enhanced.ts structure từ mockdata
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Core enums từ mockdata/core-types.ts
export enum QuestionType {
  MC = 'MC',           // Multiple Choice
  TF = 'TF',           // True/False
  SA = 'SA',           // Short Answer
  ES = 'ES',           // Essay
  MA = 'MA'            // Matching
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

// Question Code System
export interface QuestionCode {
  code: string;                    // Primary key - "0P1VH1" format
  format: 'ID5' | 'ID6';          // [XXXXX] hoặc [XXXXX-X]
  grade: string;                  // Lớp (0-9, A, B, C)
  subject: string;                // Môn học (P=Toán, L=Vật lý, H=Hóa học...)
  chapter: string;                // Chương (1-9)
  lesson: string;                 // Bài học (1-9, A-Z)
  form?: string;                  // Dạng bài (1-9, chỉ ID6)
  level: string;                  // Mức độ (N,H,V,C,T,M)
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Question với LaTeX support (Database-aligned)
export interface EnhancedQuestion {
  id: string;
  rawContent: string;             // LaTeX gốc từ user
  content: string;                // Nội dung đã xử lý (cleaned)
  subcount?: string;              // [XX.N] format
  type: QuestionType;
  source?: string;                // Nguồn câu hỏi

  // Structured answers data
  answers?: string[] | Record<string, unknown> | null;        // JSON - MC/TF: array options, SA/ES/MA: null
  correctAnswer?: string | string[] | Record<string, unknown> | null; // JSON - MC: single, TF: array, SA: string, ES/MA: null
  solution?: string;              // Lời giải chi tiết

  // Metadata (Database-aligned field names)
  tag: string[];                  // Tags array
  usageCount: number;             // Số lần sử dụng
  creator: string;                // Người tạo
  status: QuestionStatus;         // Trạng thái
  feedback: number;               // Điểm feedback trung bình
  difficulty: QuestionDifficulty; // Độ khó

  // Relations
  questionCodeId: string;         // Mã câu hỏi
  questionCode?: QuestionCode;    // Chi tiết mã câu hỏi

  createdAt: Date;
  updatedAt: Date;
}

// Question Image
export interface QuestionImage {
  id: string;
  questionId: string;
  imageType: 'QUESTION' | 'SOLUTION';
  imagePath?: string;             // Local path (temporary)
  driveUrl?: string;              // Google Drive URL
  driveFileId?: string;           // Google Drive file ID
  status: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

// Question Tag
export interface QuestionTag {
  id: string;
  questionId: string;
  tagName: string;
  createdAt: Date;
}

// Question Feedback
export interface QuestionFeedback {
  id: string;
  questionId: string;
  userId?: string;
  feedbackType: 'LIKE' | 'DISLIKE' | 'REPORT' | 'SUGGESTION';
  content?: string;
  rating?: number;                // 1-5 sao
  createdAt: Date;
}

// MapCode Configuration (user-specific)
export interface MapCodeConfig {
  id: string;
  userId: string;                 // User-specific configuration
  version: string;                // v2024-12-20
  isActive: boolean;
  gradeMapping: Record<string, string>;     // "0": "Lớp 10"
  subjectMapping: Record<string, string>;   // "P": "Toán học"
  chapterMapping: Record<string, Record<string, string>>;   // grade -> subject -> chapters
  lessonMapping: Record<string, Record<string, Record<string, string>>>;   // grade -> subject -> chapter -> lessons
  formMapping: Record<string, string>;      // "1": "Dạng 1"
  levelMapping: Record<string, string>;     // "N": "Nhận biết" (fixed)
  createdAt: Date;
  updatedAt: Date;
}

// Form types cho admin
export interface CreateQuestionForm {
  content: string;
  rawContent?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  source?: string;
  answers?: string[] | Record<string, unknown> | null;
  correctAnswer?: string | string[] | Record<string, unknown> | null;
  solution?: string;
  tag: string[];
  questionCodeId: string;
}

export interface UpdateQuestionForm extends Partial<CreateQuestionForm> {
  id: string;
  status?: QuestionStatus;
}

// Filter types
export interface QuestionFilters {
  search?: string;
  type?: QuestionType;
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  creator?: string;
  questionCodeId?: string;
  tag?: string[];
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response types
export interface QuestionListResponse {
  questions: EnhancedQuestion[];
  pagination: PaginationResult;
}

export interface QuestionResponse {
  question: EnhancedQuestion;
}

// Bulk operation types
export interface BulkOperationRequest {
  questionIds: string[];
  operation: 'delete' | 'activate' | 'deactivate' | 'archive' | 'export';
  data?: Record<string, unknown>;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

// LaTeX parsing types
export interface LaTeXParseRequest {
  content: string;
}

export interface LaTeXParseResponse {
  success: boolean;
  question?: Partial<EnhancedQuestion>;
  errors?: string[];
}

// File upload types
export interface FileUploadRequest {
  file: File;
  type: 'latex' | 'csv' | 'txt';
}

export interface FileUploadResponse {
  success: boolean;
  questions?: Partial<EnhancedQuestion>[];
  errors?: string[];
}

// MapID decoder types
export interface MapIdDecodeRequest {
  code: string;
}

export interface MapIdDecodeResponse {
  success: boolean;
  decoded?: {
    grade: string;
    subject: string;
    chapter: string;
    lesson: string;
    form?: string;
    level: string;
    description: string;
  };
  error?: string;
}

// Saved questions types (localStorage)
export interface SavedQuestion {
  id: string;
  question: EnhancedQuestion;
  savedAt: Date;
  note?: string;
}

export interface SavedQuestionsManager {
  items: SavedQuestion[];
  add: (question: EnhancedQuestion, note?: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  export: () => void;
}

// Statistics types
export interface QuestionStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  archived: number;
  byType: Record<QuestionType, number>;
  byDifficulty: Record<QuestionDifficulty, number>;
}

// Table column types cho admin list
export interface QuestionTableColumn {
  key: keyof EnhancedQuestion | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, question: EnhancedQuestion) => React.ReactNode;
}

// Selection types cho bulk operations
export interface QuestionSelection {
  selectedIds: string[];
  isAllSelected: boolean;
  toggleSelection: (id: string) => void;
  toggleSelectAll: (questions: EnhancedQuestion[]) => void;
  clearSelection: () => void;
}
