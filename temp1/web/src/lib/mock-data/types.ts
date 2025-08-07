// Mock data types for frontend-only application

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  adminNotes?: string;
  maxConcurrentIPs?: number;
  profile?: {
    bio?: string;
    phoneNumber?: string;
    completionRate?: number;
    preferences?: {
      language?: string;
      timezone?: string;
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

export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT', 
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface MockQuestion {
  id: string;
  subcount: string;      // Aligned with Prisma schema
  questionId: string;    // Aligned with Prisma schema
  source: string;        // Aligned with Prisma schema
  type: string;          // Aligned with Prisma schema
  rawContent: string;
  content: string;       // Aligned with Prisma schema
  answers: string[];
  correctAnswer: string; // Aligned with Prisma schema
  solution: string;      // Aligned with Prisma schema
  subject?: string;
  grade?: string;
  chapter?: string;
  lesson?: string;
  difficulty?: string;
  form?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  instructorAvatar?: string;
  instructorBio?: string;
  price: string;
  originalPrice?: string;
  href: string;
  progress: number;
  rating: number;
  students: number;
  tags: string[];
  duration: string;
  level: string;
  category: string;
  featured: boolean;
  popular: boolean;
  // Extended fields for course details
  chapters: MockChapter[];
  totalLessons: number;
  totalQuizzes: number;
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
  language: string;
  hasSubtitles: boolean;
  hasCertificate: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTutorial {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: string;
  instructor: string;
  thumbnail: string;
  videoUrl: string;
  isCompleted: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Extended interfaces for course details
export interface MockLesson {
  id: string;
  courseId: string;
  chapterId: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  isCompleted: boolean;
  isFree: boolean;
  resources: MockResource[];
  createdAt: string;
  updatedAt: string;
}

export interface MockChapter {
  id: string;
  courseId: string;
  number: number;
  title: string;
  description: string;
  lessons: MockLesson[];
  totalDuration: string;
  completedLessons: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockResource {
  id: string;
  lessonId: string;
  title: string;
  type: 'pdf' | 'doc' | 'slide' | 'exercise' | 'link';
  url: string;
  size?: string;
  createdAt: string;
}

export interface MockQuiz {
  id: string;
  courseId: string;
  chapterId?: string;
  lessonId?: string;
  title: string;
  description: string;
  questions: MockQuizQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  attempts: number;
  isCompleted: boolean;
  bestScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockQuizQuestion {
  id: string;
  Question: string;          // Updated to PascalCase
  Type: 'multiple_choice' | 'true_false' | 'fill_blank'; // Updated to PascalCase
  Options?: string[];        // Updated to PascalCase
  correctAnswer: string;     // Updated to PascalCase
  Explanation: string;       // Updated to PascalCase
  Points: number;            // Updated to PascalCase
}

export interface MockProgress {
  courseId: string;
  userId: string;
  completedLessons: string[];
  completedQuizzes: string[];
  totalProgress: number; // percentage
  timeSpent: number; // in minutes
  lastAccessed: string;
  certificateEarned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockDiscussion {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  replies: MockDiscussionReply[];
  likes: number;
  isResolved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockDiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isInstructorReply: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface MockUserListResponse {
  users: MockUser[];
  pagination: MockPagination;
}

export interface MockQuestionListResponse {
  questions: MockQuestion[];
  pagination: MockPagination;
}

export interface MockCourseListResponse {
  courses: MockCourse[];
  pagination: MockPagination;
}

export interface MockTutorialListResponse {
  tutorials: MockTutorial[];
  pagination: MockPagination;
}

export interface MockAuthResponse {
  success: boolean;
  user: MockUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface MockFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MockUserFilterParams extends MockFilterParams {
  role?: UserRole;
  isActive?: boolean;
}

export interface MockQuestionFilterParams extends MockFilterParams {
  subject?: string;
  grade?: string;
  chapter?: string;
  lesson?: string;
  type?: string;
  difficulty?: string;
  form?: string;
}

export interface MockCourseFilterParams extends MockFilterParams {
  category?: string;
  level?: string;
  featured?: boolean;
  popular?: boolean;
}

export interface MockTutorialFilterParams extends MockFilterParams {
  category?: string;
  level?: string;
  instructor?: string;
  isCompleted?: boolean;
}
