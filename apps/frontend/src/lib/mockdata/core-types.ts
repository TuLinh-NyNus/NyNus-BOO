/**
 * Core Types for Mockdata System
 * 
 * Consolidated type definitions to eliminate duplication
 * Aligned with database schema from migrations
 */

// ===== SHARED INTERFACES =====

export interface MockPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MockApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: MockPagination;
}

export interface MockListResponse<T> {
  items: T[];
  pagination: MockPagination;
}

export interface MockFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== DATABASE-ALIGNED ENUMS =====

// Question Type Enum (matches database)
export enum QuestionType {
  MC = 'MC',    // Multiple Choice
  TF = 'TF',    // True/False
  SA = 'SA',    // Short Answer
  ES = 'ES',    // Essay
  MA = 'MA'     // Multiple Answer
}

// Question Status Enum (matches database)
export enum QuestionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

// Question Difficulty Enum (matches database)
export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Code Format Enum (matches database)
export enum CodeFormat {
  ID5 = 'ID5',
  ID6 = 'ID6'
}

// Image Type Enum (matches database)
export enum ImageType {
  QUESTION = 'QUESTION',
  SOLUTION = 'SOLUTION'
}

// Image Status Enum (matches database)
export enum ImageStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  FAILED = 'FAILED'
}

// Feedback Type Enum (matches database)
export enum FeedbackType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  REPORT = 'REPORT',
  SUGGESTION = 'SUGGESTION'
}

// User Role Enum (matches Enhanced User Model from AUTH_COMPLETE_GUIDE.md)
export enum UserRole {
  GUEST = 'GUEST',         // Khách (không đăng ký) - Không có level
  STUDENT = 'STUDENT',     // Học sinh - Level 1-9
  TUTOR = 'TUTOR',         // Gia sư - Level 1-9
  TEACHER = 'TEACHER',     // Giáo viên - Level 1-9
  ADMIN = 'ADMIN'          // Quản trị viên - Không có level
}

// User Status Enum (matches Enhanced User Model)
export enum UserStatus {
  ACTIVE = 'ACTIVE',                    // Hoạt động
  INACTIVE = 'INACTIVE',                // Không hoạt động
  SUSPENDED = 'SUSPENDED',              // Bị đình chỉ
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'  // Chờ xác thực email
}

// ===== COMMON FIELD TYPES =====

export interface TimestampFields {
  created_at: Date;
  updated_at: Date;
}

export interface OptionalTimestampFields {
  createdAt?: Date;
  updatedAt?: Date;
}

// ===== NOTIFICATION TYPES =====

export enum NotificationType {
  SECURITY_ALERT = 'SECURITY_ALERT',
  COURSE_UPDATE = 'COURSE_UPDATE',
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  SOCIAL = 'SOCIAL',
  PAYMENT = 'PAYMENT'
}

// ===== RESOURCE ACCESS TYPES =====

export enum ResourceType {
  COURSE = 'COURSE',
  LESSON = 'LESSON',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  EXAM = 'EXAM',
  QUESTION = 'QUESTION'
}

export enum AccessAction {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  STREAM = 'STREAM',
  START_EXAM = 'START_EXAM',
  SUBMIT_ANSWER = 'SUBMIT_ANSWER'
}

// ===== SESSION TYPES =====

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

// ===== OAUTH TYPES =====

export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github'
}

export enum OAuthType {
  OAUTH = 'oauth',
  OIDC = 'oidc'
}

// ===== AUDIT LOG TYPES =====

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  CREATE_QUESTION = 'CREATE_QUESTION',
  UPDATE_QUESTION = 'UPDATE_QUESTION',
  DELETE_QUESTION = 'DELETE_QUESTION',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  COURSE_ENROLLED = 'COURSE_ENROLLED',
  EXAM_STARTED = 'EXAM_STARTED',
  EXAM_COMPLETED = 'EXAM_COMPLETED'
}

export enum AuditResource {
  USER = 'USER',
  QUESTION = 'QUESTION',
  COURSE = 'COURSE',
  EXAM = 'EXAM',
  ENROLLMENT = 'ENROLLMENT',
  SESSION = 'SESSION'
}

// ===== CONTENT CATEGORIES =====

export const SUBJECT_CATEGORIES = {
  MATH: 'Toán học',
  PHYSICS: 'Vật lý',
  CHEMISTRY: 'Hóa học',
  BIOLOGY: 'Sinh học',
  ENGLISH: 'Tiếng Anh',
  LITERATURE: 'Văn học',
  HISTORY: 'Lịch sử',
  GEOGRAPHY: 'Địa lý'
} as const;

export const BOOK_CATEGORIES = {
  TEXTBOOK: 'Sách giáo khoa',
  WORKBOOK: 'Sách bài tập',
  REFERENCE: 'Sách tham khảo',
  EXAM: 'Đề thi',
  LANGUAGE: 'Sách ngoại ngữ'
} as const;

export const FAQ_CATEGORIES = {
  ACCOUNT: 'Tài khoản',
  LEARNING: 'Học tập',
  PAYMENT: 'Thanh toán',
  CERTIFICATE: 'Chứng chỉ',
  TECHNICAL: 'Kỹ thuật',
  SUPPORT: 'Hỗ trợ'
} as const;

export const FORUM_CATEGORIES = {
  MATH: 'Toán học',
  PHYSICS: 'Vật lý',
  CHEMISTRY: 'Hóa học',
  ENGLISH: 'Tiếng Anh',
  LITERATURE: 'Văn học',
  MATERIALS: 'Tài liệu',
  ANNOUNCEMENTS: 'Thông báo'
} as const;

export const SETTINGS_CATEGORIES = {
  SYSTEM: 'System',
  AUTHENTICATION: 'Authentication',
  EMAIL: 'Email',
  LEARNING: 'Learning',
  PAYMENT: 'Payment',
  NOTIFICATION: 'Notification',
  SEO: 'SEO'
} as const;

// ===== GRADE LEVELS =====

export const GRADE_LEVELS = {
  '0': 'Lớp 10',
  '1': 'Lớp 11',
  '2': 'Lớp 12',
  '3': 'Lớp 3',
  '4': 'Lớp 4',
  '5': 'Lớp 5',
  '6': 'Lớp 6',
  '7': 'Lớp 7',
  '8': 'Lớp 8',
  '9': 'Lớp 9'
} as const;

// ===== COURSE LEVELS =====

export const COURSE_LEVELS = {
  BASIC: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao'
} as const;

// ===== VIDEO QUALITY =====

export const VIDEO_QUALITY = {
  '480p': '480p',
  '720p': '720p',
  '1080p': '1080p'
} as const;

// ===== PLAYBACK SPEED =====

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

// ===== PROFILE VISIBILITY =====

export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE'
}

// ===== LANGUAGE CODES =====

export const LANGUAGE_CODES = {
  VI: 'vi',
  EN: 'en'
} as const;

// ===== TIMEZONE =====

export const TIMEZONES = {
  VIETNAM: 'Asia/Ho_Chi_Minh',
  UTC: 'UTC'
} as const;

// ===== DATE FORMATS =====

export const DATE_FORMATS = {
  DD_MM_YYYY: 'DD/MM/YYYY',
  MM_DD_YYYY: 'MM/DD/YYYY',
  YYYY_MM_DD: 'YYYY-MM-DD'
} as const;

// ===== CURRENCY =====

export const CURRENCIES = {
  VND: 'VND',
  USD: 'USD'
} as const;

// ===== FILE TYPES =====

export enum FileType {
  PDF = 'pdf',
  EPUB = 'epub',
  DOC = 'doc',
  PPT = 'ppt'
}

// ===== CONSTANTS =====

export const MOCK_DATA_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 5000,
  MAX_QUESTION_LENGTH: 5000,
  MAX_SOLUTION_LENGTH: 10000,
  MAX_UPLOAD_SIZE_MB: 50,
  SESSION_TIMEOUT_SECONDS: 3600,
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
  RISK_SCORE_THRESHOLD: 70,
  HIGH_RISK_SCORE: 85
} as const;

// ===== TYPE GUARDS =====

export function isQuestionType(value: string): value is QuestionType {
  return Object.values(QuestionType).includes(value as QuestionType);
}

export function isQuestionStatus(value: string): value is QuestionStatus {
  return Object.values(QuestionStatus).includes(value as QuestionStatus);
}

export function isQuestionDifficulty(value: string): value is QuestionDifficulty {
  return Object.values(QuestionDifficulty).includes(value as QuestionDifficulty);
}

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

// ===== UTILITY TYPES =====

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends Array<unknown> ? K : never; // ✅ Fixed: any → unknown
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never; // ✅ Fixed: {} → Record<string, never>
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K; // ✅ Fixed: {} → Record<string, never>
}[keyof T];
