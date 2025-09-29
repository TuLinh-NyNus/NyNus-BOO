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
export type {
  User,
  UserRole,
  UserStatus,
  UserProfile,
  UserFilters,
  UserSession,
  AdminUser
} from './user';

// ===== ADMIN TYPES =====
export type {
  AdminHeaderProps,
  AdminNotification,
  NavigationItem,
  NavigationSection
} from './admin';

// ===== EXAM TYPES =====
export type {
  Exam,
  ExamStatus,
  ExamType,
  ExamFormData,
  ExamAttempt,
  AttemptStatus
} from './exam';

// ===== API TYPES =====
export * from './api';

// ===== PUBLIC TYPES =====
export * from './public';

// ===== FORMS TYPES =====
export type {
  FormFieldType,
  FormFieldValidation,
  FormSubmissionState
} from './forms';

// ===== FORM COMPATIBILITY =====
export * from './form-compatibility';
