/**
 * Course Types for Frontend UI
 * Compatible với dự án cũ để chuyển đổi giao diện
 */

// Mock Course interface tương thích với dự án cũ
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

// Mock Tutorial interface
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

// Filter params for tutorials
export interface MockTutorialFilterParams {
  search?: string;
  category?: string;
  level?: string;
  sortBy?: 'number' | 'title' | 'createdAt' | 'views' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Search filters for courses
export interface SearchFilters {
  query: string;
  category: string;
  level: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Advanced search filters
export interface AdvancedSearchFilters {
  subject?: string[];
  level?: string[];
  difficulty?: string[];
  duration?: string[];
  price?: string[];
  rating?: number;
  instructor?: string[];
}

// Sort options
export interface SortOption {
  field: 'name' | 'date' | 'popularity' | 'rating' | 'price';
  direction: 'asc' | 'desc';
}

// API Response types
export interface MockTutorialsResponse {
  tutorials: MockTutorial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MockCoursesResponse {
  courses: MockCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
