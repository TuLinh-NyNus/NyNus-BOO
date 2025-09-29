/**
 * Exam Types for NyNus Exam System
 * Interfaces và types cho quản lý exam system
 * Aligned với ExamSystem.md design và backend entities
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { QuestionDifficulty, Question } from './question';

// Re-export Question for convenience
export type { Question };

// ===== ENUMS =====

/**
 * Exam Status Enum
 * Aligned với backend ExamStatus và protocol buffers
 */
export enum ExamStatus {
  ACTIVE = 'ACTIVE',       // Đã xuất bản, students có thể làm
  PENDING = 'PENDING',     // Đang soạn thảo, chờ review
  INACTIVE = 'INACTIVE',   // Tạm ngưng
  ARCHIVED = 'ARCHIVED'    // Đã lưu trữ
}

/**
 * Exam Type Enum
 * Aligned với backend ExamType
 */
export enum ExamType {
  GENERATED = 'GENERATED', // Đề thi tạo từ ngân hàng câu hỏi
  OFFICIAL = 'OFFICIAL'    // Đề thi thật từ trường/sở
}

/**
 * Attempt Status Enum
 * Aligned với backend AttemptStatus và protocol buffers
 */
export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS', // Đang làm bài
  SUBMITTED = 'SUBMITTED',     // Đã nộp bài
  GRADED = 'GRADED',          // Đã chấm điểm
  CANCELLED = 'CANCELLED'      // Đã hủy
}

// ===== CORE INTERFACES =====

/**
 * Main Exam Interface
 * Aligned với backend entity/exam.go
 */
export interface Exam {
  // Basic Information
  id: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  totalPoints: number;
  passPercentage: number;
  examType: ExamType;
  status: ExamStatus;

  // Academic Classification (ESSENTIAL)
  subject: string;           // Môn học (REQUIRED)
  grade?: number;           // Khối lớp (1-12)
  difficulty: QuestionDifficulty; // EASY, MEDIUM, HARD, EXPERT
  tags: string[];           // Tags tìm kiếm

  // Settings
  shuffleQuestions: boolean;
  showResults: boolean;
  maxAttempts: number;

  // Official Exam Fields (OPTIONAL - chỉ cho examType = 'OFFICIAL')
  sourceInstitution?: string; // Tên trường/sở
  examYear?: string;         // Năm thi (VD: "2024")
  examCode?: string;         // Mã đề (VD: "001", "A")
  fileUrl?: string;          // Link file PDF

  // Integration Fields
  version: number;           // For optimistic locking

  // Questions (loaded separately)
  questionIds: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;

  // Relations (optional, loaded when needed)
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  examResults?: ExamResult[];
  examQuestions?: ExamQuestion[];
}

/**
 * Exam Attempt Interface
 * Represents a user's attempt at an exam
 */
export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  attemptNumber: number;
  status: AttemptStatus;
  score?: number;
  totalPoints: number;
  percentage?: number;
  passed?: boolean;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;

  // Additional data
  ipAddress?: string;
  userAgent?: string;
  notes?: string;

  // Relations (optional)
  exam?: Exam;
  answers?: ExamAnswer[];
  result?: ExamResult;
}

/**
 * Exam Answer Interface
 * Represents a user's answer to a question in an exam attempt
 */
export interface ExamAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerData: string;        // JSONB stored as string
  isCorrect?: boolean;       // Nullable for manual grading
  pointsEarned: number;
  timeSpentSeconds?: number;
  answeredAt: string;
}

/**
 * Exam Result Interface
 * Represents the final result of an exam attempt
 */
export interface ExamResult {
  id: string;
  attemptId: string;
  examId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  gradedAt: string;
  gradedBy?: string;

  // Detailed breakdown
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  timeSpentSeconds: number;

  // Feedback
  feedback?: string;
  teacherNotes?: string;

  // Relations (optional)
  attempt?: ExamAttempt;
  exam?: Exam;
}

/**
 * Exam Question Interface
 * Represents the relationship between exam and questions
 */
export interface ExamQuestion {
  id: string;
  examId: string;
  questionId: string;
  order: number;
  points: number;
  required: boolean;

  // Question data (loaded when needed)
  question?: {
    id: string;
    content: string;
    type: string;
    difficulty: QuestionDifficulty;
  };
}

// ===== UTILITY TYPES =====

/**
 * Exam Form Data Interface
 * For create/edit exam forms
 */
export interface ExamFormData {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  totalPoints: number;
  passPercentage: number;
  examType: ExamType;
  status: ExamStatus;

  // Academic Classification
  subject: string;
  grade?: number;
  difficulty: QuestionDifficulty;
  tags: string[];

  // Settings
  shuffleQuestions: boolean;
  shuffleAnswers?: boolean;
  showResults: boolean;
  showAnswers?: boolean;
  allowReview?: boolean;
  maxAttempts: number;

  // Official Exam Fields (conditional)
  sourceInstitution?: string;
  examYear?: string;
  examCode?: string;
  fileUrl?: string;

  // Questions
  questionIds: string[];
}

/**
 * Exam Answer Input Interface
 * Custom interface for exam taking
 */
export interface ExamAnswerInput {
  questionId: string;
  questionType: string;
  selectedOptions: string[];
  answerText: string;
  isFlagged: boolean;
}

/**
 * Exam Filters Interface
 * For search and filter functionality
 */
export interface ExamFilters {
  search?: string;
  status?: ExamStatus[];
  examType?: ExamType[];
  subject?: string[];
  grade?: number[];
  difficulty?: QuestionDifficulty[];
  tags?: string[];
  createdBy?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Exam Sort Options
 * For sorting exam lists
 */
export interface ExamSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'status' | 'difficulty' | 'totalPoints' | 'durationMinutes';
  direction: 'asc' | 'desc';
}

/**
 * Exam Statistics Interface
 * For exam analytics and reporting
 */
export interface ExamStatistics {
  examId: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  difficultyDistribution: {
    [key in QuestionDifficulty]: number;
  };
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}

// ===== TYPE GUARDS =====

/**
 * Type guard to check if exam is official
 */
export function isOfficialExam(exam: Exam): boolean {
  return exam.examType === ExamType.OFFICIAL;
}

/**
 * Type guard to check if exam is published
 */
export function isPublishedExam(exam: Exam): boolean {
  return exam.status === ExamStatus.ACTIVE;
}

/**
 * Type guard to check if attempt is completed
 */
export function isCompletedAttempt(attempt: ExamAttempt): boolean {
  return attempt.status === AttemptStatus.SUBMITTED || 
         attempt.status === AttemptStatus.GRADED;
}
