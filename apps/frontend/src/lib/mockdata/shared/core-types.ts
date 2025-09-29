/**
 * Core Types for Mockdata System
 *
 * Consolidated type definitions to eliminate duplication
 * Aligned with database schema from migrations
 */

import { UserRole, type UserRole as UserRoleType, type UserStatus as UserStatusType } from '@/types/user/roles';

// ===== SHARED INTERFACES =====

// Temporary interfaces for missing types
export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string;
  isPublic: boolean;
  updatedBy?: string;
  updatedAt?: Date;
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  maxFileUploadSize?: number;
  supportedLanguages?: string[];
  defaultLanguage?: string;
  emailSettings?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  securitySettings?: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  // Allow any additional fields
  [key: string]: unknown;
}

export interface ResourceAccess {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  resourceType: string;
  resourceId: string;
  accessTime?: Date | string;
  accessedAt: Date | string;
  ipAddress: string;
  location: string;
  userAgent: string;
  duration?: number;
  action: string;
  riskScore: number;
  success: boolean;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface ResourceAccessStats {
  totalAccess: number;
  totalAccessToday: number;
  uniqueUsers: number;
  uniqueUsersToday: number;
  averageDuration: number;
  mostAccessedResourceType: string;
  averageRiskScore: number;
  highRiskAttempts: number;
  topResources: Array<{
    resourceId: string;
    resourceType: string;
    accessCount?: number;
    count: number;
  }>;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  token?: string;
  createdAt?: Date;
  expiresAt?: Date;
  lastActivityAt?: Date;
  startedAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive?: boolean;
  status: string;
  examId: string;
  examTitle: string;
  endedAt?: Date;
  answers?: unknown[];
  duration?: number;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminBook {
  id: string;
  title: string;
  description: string;
  author: string;
  publisher: string;
  isbn?: string;
  publishedDate: Date;
  category: string;
  tags: string[];
  coverImage: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | string;
  downloadCount: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AdminForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  isSticky: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: Date;
  lastReplyBy?: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: unknown[];
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  instructor: string;
  category: string;
  level: string;
  tags: string[];
  thumbnail?: string;
  image?: string;
  duration: number | string;
  price: number;
  isPublished: boolean;
  enrollmentCount?: number;
  rating: number;
  featured: boolean;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
  instructorAvatar?: string;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminQuestion {
  id: string;
  content: string;
  rawContent?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: string;
  subject: string;
  grade: string;
  chapter: string;
  tags?: string[];
  tag: string[];
  options?: string[] | Array<{id: string; content: string; isCorrect: boolean}>;
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  timeLimit: number;
  isActive: boolean;
  usageCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  subcount?: string;
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdminUser {
  // Core required fields
  id: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Authentication fields
  googleId?: string | null;
  password_hash?: string;

  // Business logic
  level?: number | null;
  maxConcurrentSessions?: number;

  // Security tracking
  lastLoginAt?: Date | null;
  lastLoginIp?: string | null;
  loginAttempts?: number;
  lockedUntil?: Date | null;
  activeSessionsCount?: number;
  totalResourceAccess?: number;
  riskScore?: number;

  // Profile information
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  school?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  adminNotes?: string | null;

  // Stats and profile
  stats?: {
    totalCourses?: number;
    totalLessons?: number;
    totalExamResults?: number;
    averageScore?: number;
    [key: string]: unknown;
  };
  profile?: {
    completionRate?: number;
    [key: string]: unknown;
  };

  // Additional fields
  [key: string]: unknown;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  newUsersToday?: number;
  pendingVerificationUsers?: number;
  usersByRole: Record<UserRoleType, number>;
  usersByStatus: Record<UserStatusType, number>;
  averageSessionDuration: number;
  topActiveUsers: AdminUser[];
  // Allow any additional fields
  [key: string]: unknown;
}

export interface AdvancedUserFilters {
  roles?: UserRoleType[];
  statuses?: UserStatusType[];
  riskLevels?: string[];
  emailVerified?: boolean | null;
  levelRange?: {
    min: number;
    max: number;
  } | null;
  riskScoreRange?: {
    min: number;
    max: number;
  } | null;
  isLocked?: boolean | null;
  highRiskUsers?: boolean | null;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Allow any additional fields
  [key: string]: unknown;
}

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



// Note: UserRole and UserStatus are now imported from @/types/user/roles at the top

// ===== COMMON FIELD TYPES =====

export interface TimestampFields {
  created_at: Date;
  updated_at: Date;
}

export interface OptionalTimestampFields {
  createdAt?: Date;
  updatedAt?: Date;
}

// ===== QUESTION INTERFACES =====

// Question Code interface (matches database schema)
export interface QuestionCode {
  code: string;                  // Primary key - "0P1VH1" format
  format: CodeFormat;            // ID5 or ID6
  grade: string;                 // Grade level (0-9, A, B, C)
  subject: string;               // Subject code (P=Math, L=Physics, etc.)
  chapter: string;               // Chapter number (1-9)
  lesson: string;                // Lesson identifier (1-9, A-Z)
  form?: string;                 // Form/type identifier (1-9, only for ID6)
  level: string;                 // Difficulty level (N,H,V,C,T,M)
  createdAt: Date;
  updatedAt: Date;
}

// Unified Question interface (consolidates DatabaseQuestion + EnhancedQuestion)
export interface Question {
  // Core fields
  id: string;                    // TEXT PRIMARY KEY
  rawContent: string;            // TEXT NOT NULL - LaTeX gốc từ user
  content: string;               // TEXT NOT NULL - Nội dung đã xử lý
  subcount?: string;             // VARCHAR(10) - [XX.N] format
  type: QuestionType;            // QuestionType NOT NULL
  source?: string;               // TEXT - Nguồn câu hỏi

  // Answer data (JSONB fields)
  answers?: string[] | Record<string, unknown> | Array<{id: string; content: string; isCorrect: boolean; explanation?: string}> | null;      // JSONB - Answer options
  correctAnswer?: string | string[] | Record<string, unknown> | null; // JSONB - Correct answer(s)
  solution?: string;             // TEXT - Lời giải chi tiết

  // Metadata
  tag: string[];                 // TEXT[] DEFAULT '{}' (note: 'tag' not 'tags')
  usageCount: number;            // INT DEFAULT 0
  creator: string;               // TEXT DEFAULT 'ADMIN'
  status: QuestionStatus;        // QuestionStatus DEFAULT 'ACTIVE'
  feedback: number;              // INT DEFAULT 0
  difficulty: QuestionDifficulty; // QuestionDifficulty DEFAULT 'MEDIUM'

  // Relations
  questionCodeId: string;        // VARCHAR(7) NOT NULL REFERENCES QuestionCode(code)
  questionCode?: QuestionCode;   // Optional populated relation

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Question Image interface
export interface QuestionImage {
  id: string;
  questionId: string;
  imageType: ImageType;          // 'QUESTION' | 'SOLUTION'
  imagePath?: string;            // Local path (temporary)
  driveUrl?: string;             // Google Drive URL
  driveFileId?: string;          // Google Drive file ID
  status: ImageStatus;           // Upload status
  createdAt: Date;
  updatedAt: Date;
}

// Question Tag interface
export interface QuestionTag {
  id: string;
  questionId: string;
  tagName: string;
  createdAt: Date;
}

// Question Feedback interface
export interface QuestionFeedback {
  id: string;
  questionId: string;
  userId?: string;
  feedbackType: FeedbackType;    // 'LIKE' | 'DISLIKE' | 'REPORT' | 'SUGGESTION'
  content?: string;
  rating?: number;               // 1-5 stars
  createdAt: Date;
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

export function isUserRole(value: number): value is UserRoleType {
  return Object.values(UserRole).includes(value as UserRoleType);
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
