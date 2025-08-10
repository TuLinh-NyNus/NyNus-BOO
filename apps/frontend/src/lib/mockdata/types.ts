// Extended types for admin mockdata
import { Question } from '@/types';
// ✅ Import shared types from consolidated core-types
import {
  UserRole,
  UserStatus,
  QuestionType,
  QuestionDifficulty,
  ProfileVisibility
} from './core-types';

// ✅ Re-export shared types for backward compatibility
export type {
  MockPagination,
  MockApiResponse,
  MockListResponse
} from './core-types';

// Enhanced AdminUser interface aligned with AUTH_COMPLETE_GUIDE.md
// Note: Không extend User vì có conflicts với optional fields
export interface AdminUser {
  // ===== CORE REQUIRED FIELDS (MVP) =====
  id: string;                           // REQUIRED - Primary key
  email: string;                        // REQUIRED - Login identifier
  role: UserRole;                       // REQUIRED - Authorization với 5 roles
  status: UserStatus;                   // REQUIRED - Account control (thay vì isActive boolean)
  emailVerified: boolean;               // REQUIRED - Security
  createdAt: Date;                      // REQUIRED - Audit trail
  updatedAt: Date;                      // REQUIRED - Audit trail

  // ===== AUTHENTICATION FIELDS (IMPORTANT) =====
  googleId?: string | null;             // IMPORTANT - OAuth primary (null = không dùng OAuth)
  password?: string;                    // IMPORTANT - Fallback only
  password_hash?: string;               // Database storage

  // ===== CORE BUSINESS LOGIC (IMPORTANT) =====
  level?: number | null;                // IMPORTANT - Hierarchy (1-9 cho STUDENT/TUTOR/TEACHER, null cho GUEST/ADMIN)
  maxConcurrentSessions: number;        // IMPORTANT - Anti-sharing (default: 3)

  // ===== SECURITY TRACKING (IMPORTANT) =====
  lastLoginAt?: Date;                   // IMPORTANT - Security monitoring
  lastLoginIp?: string;                 // IMPORTANT - Suspicious detection
  loginAttempts: number;                // IMPORTANT - Brute force protection (default: 0)
  lockedUntil?: Date | null;            // IMPORTANT - Account locking (null = not locked)
  activeSessionsCount: number;          // IMPORTANT - Current sessions (0-3)
  totalResourceAccess: number;          // IMPORTANT - Anti-piracy monitoring
  riskScore?: number;                   // IMPORTANT - Risk calculation (0-100)

  // ===== PROFILE INFORMATION (NICE-TO-HAVE) =====
  username?: string;                    // OPTIONAL - Display name
  firstName?: string;                   // OPTIONAL - From Google/manual
  lastName?: string;                    // OPTIONAL - From Google/manual
  avatar?: string;                      // OPTIONAL - From Google/upload
  bio?: string;                         // OPTIONAL - User description
  phone?: string | null;                // OPTIONAL - Contact info (null = không có)
  address?: string | null;              // OPTIONAL - Simple address (null = không có)
  school?: string | null;               // OPTIONAL - Educational background (null = không có)
  dateOfBirth?: Date | null;            // OPTIONAL - Age verification (null = không có)
  gender?: string | null;               // OPTIONAL - Analytics ('male'/'female'/'other', null = không có)

  // ===== ADMIN SPECIFIC FIELDS =====
  adminNotes?: string;                  // Admin internal notes
  maxConcurrentIPs?: number;            // Legacy field for backward compatibility

  // ===== NESTED OBJECTS =====
  profile?: {
    bio?: string;
    phoneNumber?: string | null;         // Có thể null cho guest users
    completionRate?: number;
    preferences?: {
      language?: string;
      timezone?: string;
      profileVisibility?: ProfileVisibility;
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
    };
  };
  stats?: {
    totalExamResults?: number;
    totalCourses?: number;
    totalLessons?: number;
    averageScore?: number;
  };
}

// Admin-specific question interface extending base Question
export interface AdminQuestion extends Question {
  subcount?: string;
  questionId?: string;
  source?: string;
  rawContent?: string;
  solution?: string;
  subject?: string;
  grade?: string;
  chapter?: string;
  lesson?: string;
  form?: string;
  isActive?: boolean;
  usageCount?: number;
  lastUsed?: Date;
}

// Course interface for admin
export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  image?: string;
  instructor: string;
  instructorId: string;
  instructorAvatar?: string;
  instructorBio?: string;
  price: number;
  originalPrice?: number;
  progress?: number;
  rating: number;
  students: number;
  tags: string[];
  duration: string;
  level: string;
  category: string;
  featured: boolean;
  popular: boolean;
  isPublished: boolean;
  chapters: AdminChapter[];
  totalLessons: number;
  totalQuizzes: number;
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
  language: string;
  hasSubtitles: boolean;
  hasCertificate: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminChapter {
  id: string;
  courseId: string;
  number: number;
  title: string;
  description: string;
  lessons: AdminLesson[];
  totalDuration: string;
  completedLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLesson {
  id: string;
  courseId: string;
  chapterId: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  thumbnail?: string;
  isCompleted: boolean;
  isFree: boolean;
  resources: AdminResource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminResource {
  id: string;
  lessonId: string;
  title: string;
  type: 'pdf' | 'doc' | 'slide' | 'exercise' | 'link';
  url: string;
  size?: string;
  createdAt: Date;
}

// Analytics interfaces
export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalQuestions: number;
    totalCourses: number;
    totalSessions: number;
    activeUsers: number;
    newUsersToday: number;
    questionsAddedToday: number;
    coursesCompletedToday: number;
  };
  userGrowth: {
    date: string;
    newUsers: number;
    totalUsers: number;
  }[];
  questionUsage: {
    date: string;
    questionsUsed: number;
    questionsAdded: number;
  }[];
  courseProgress: {
    courseId: string;
    courseName: string;
    enrollments: number;
    completions: number;
    averageProgress: number;
  }[];
  topPerformers: {
    userId: string;
    userName: string;
    averageScore: number;
    completedExams: number;
  }[];
}

// Session interfaces
export interface AdminSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  examId?: string;
  examTitle?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  score?: number;
  totalPoints?: number;
  status: 'active' | 'completed' | 'abandoned';
  ipAddress: string;
  userAgent: string;
  answers?: AdminAnswer[];
}

export interface AdminAnswer {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number; // in seconds
}

// Book/Material interfaces
export interface AdminBook {
  id: string;
  title: string;
  description: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: Date;
  category: string;
  tags: string[];
  coverImage?: string;
  fileUrl?: string;
  fileSize?: string;
  fileType: 'pdf' | 'epub' | 'doc' | 'ppt';
  isActive: boolean;
  downloadCount: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

// FAQ interfaces
export interface AdminFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  order: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Forum interfaces
export interface AdminForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  isSticky: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: Date;
  lastReplyBy?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: AdminForumReply[];
}

export interface AdminForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isInstructorReply: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Settings interfaces
export interface AdminSettings {
  id: string;
  category: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: Date;
}

// Resource Access interfaces
export interface ResourceAccess {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  resourceId: string;
  resourceType: string;
  action: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  accessedAt: string;
  riskScore?: number;
  success: boolean;
}

export interface ResourceAccessStats {
  totalAccessToday: number;
  uniqueUsersToday: number;
  mostAccessedResourceType: string;
  mostCommonAction: string;
  averageRiskScore: number;
  highRiskAttempts: number;
  accessByResourceType: Record<string, number>;
  accessByAction: Record<string, number>;
  topResources: Array<{ resourceId: string; resourceType: string; count: number }>;
}

// ✅ REMOVED: Duplicate interfaces - now imported from core-types.ts
// These interfaces are now available from core-types.ts:
// - MockPagination
// - MockApiResponse<T>
// - MockListResponse<T>

// Filter interfaces
export interface MockFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Enhanced UserStats interface aligned with Enhanced User Model
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;                // NEW - INACTIVE status users
  suspendedUsers: number;               // SUSPENDED status users
  pendingVerificationUsers: number;     // NEW - PENDING_VERIFICATION status users
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;

  // Role distribution - NEW
  guestUsers: number;                   // GUEST role count
  studentUsers: number;                 // STUDENT role count
  tutorUsers: number;                   // TUTOR role count
  teacherUsers: number;                 // TEACHER role count
  adminUsers: number;                   // ADMIN role count

  // Security metrics - NEW
  highRiskUsers: number;                // riskScore > 70
  lockedUsers: number;                  // lockedUntil is set
  multipleSessionUsers: number;         // activeSessionsCount > 1
}

// Advanced User Filters interface for enhanced filtering
export interface AdvancedUserFilters {
  // Basic filters
  search: string;
  roles: UserRole[];
  statuses: UserStatus[];

  // Enhanced User Model filters
  emailVerified?: boolean | null;
  levelRange?: { min: number; max: number } | null;
  riskScoreRange?: { min: number; max: number } | null;

  // Date filters
  createdDateRange?: { from: Date; to: Date } | null;
  lastLoginDateRange?: { from: Date; to: Date } | null;

  // Security filters
  isLocked?: boolean | null;            // lockedUntil is set
  highRiskUsers?: boolean | null;       // riskScore > 70
  multipleSessionUsers?: boolean | null; // activeSessionsCount > 1
}

export interface AdminUserFilterParams extends MockFilterParams {
  role?: UserRole;
  status?: UserStatus;                  // Changed from isActive to status
  emailVerified?: boolean;
  levelMin?: number;
  levelMax?: number;
  riskScoreMin?: number;
  riskScoreMax?: number;
  isLocked?: boolean;
  highRisk?: boolean;
}

export interface AdminQuestionFilterParams extends MockFilterParams {
  subject?: string;
  grade?: string;
  chapter?: string;
  lesson?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty; // ✅ Fixed: Use correct enum name
  form?: string;
}

export interface AdminCourseFilterParams extends MockFilterParams {
  category?: string;
  level?: string;
  featured?: boolean;
  popular?: boolean;
  isPublished?: boolean;
}
