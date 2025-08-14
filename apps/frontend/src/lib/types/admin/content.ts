/**
 * Admin Content Types
 * Consolidated content management types for admin interface
 */

// ===== COURSE INTERFACES =====

/**
 * Admin Course Interface
 * Interface cho admin course management
 */
export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
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
  level: 'beginner' | 'intermediate' | 'advanced';
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

/**
 * Admin Chapter Interface
 * Interface cho admin chapter management
 */
export interface AdminChapter {
  id: string;
  courseId: string;
  number: number;
  title: string;
  description?: string;
  duration: string;
  lessons: AdminLesson[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin Lesson Interface
 * Interface cho admin lesson management
 */
export interface AdminLesson {
  id: string;
  chapterId: string;
  number: number;
  title: string;
  description?: string;
  content: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  videoUrl?: string;
  attachments?: LessonAttachment[];
  isPublished: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson Attachment Interface
 * Interface cho lesson attachments
 */
export interface LessonAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
}

// ===== QUESTION INTERFACES =====

/**
 * Admin Question Interface
 * Interface cho admin question management
 */
export interface AdminQuestion {
  id: string;
  content: string;
  type: 'multiple-choice' | 'essay' | 'true-false' | 'fill-blank';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  subject: string;
  grade: string;
  chapter?: string;
  lesson?: string;
  points: number;
  timeLimit?: number;
  explanation?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  tags?: string[];
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question Option Interface
 * Interface cho question options
 */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  order: number;
}

/**
 * Question Bank Interface
 * Interface cho question banks
 */
export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  category: string;
  subject: string;
  grade: string;
  questionCount: number;
  questions: string[]; // Question IDs
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BOOK INTERFACES =====

/**
 * Admin Book Interface
 * Interface cho admin book management
 */
export interface AdminBook {
  id: string;
  title: string;
  description: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: Date;
  category: string;
  subject: string;
  grade: string;
  language: string;
  pageCount?: number;
  coverImage?: string;
  pdfUrl?: string;
  price?: number;
  isPublished: boolean;
  isFree: boolean;
  downloadCount: number;
  rating: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== FAQ INTERFACES =====

/**
 * FAQ Item Interface
 * Interface cho FAQ items
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FAQ Category Interface
 * Interface cho FAQ categories
 */
export interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  itemCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CONTENT FILTERS =====

/**
 * Content Filter Interface
 * Interface cho content filtering
 */
export interface ContentFilter {
  search?: string;
  category?: string;
  subject?: string;
  grade?: string;
  level?: string;
  status?: 'published' | 'draft' | 'archived';
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  featured?: boolean;
  popular?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ===== CONTENT STATISTICS =====

/**
 * Content Statistics Interface
 * Interface cho content statistics
 */
export interface ContentStatistics {
  courses: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    totalStudents: number;
    averageRating: number;
  };
  questions: {
    total: number;
    active: number;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
    bySubject: Record<string, number>;
  };
  books: {
    total: number;
    published: number;
    free: number;
    totalDownloads: number;
    averageRating: number;
  };
  faq: {
    total: number;
    published: number;
    totalViews: number;
    averageHelpfulness: number;
  };
}

// ===== CONTENT STATE & ACTIONS =====

/**
 * Content State Interface
 * Interface cho content state
 */
export interface ContentState {
  courses: AdminCourse[];
  questions: AdminQuestion[];
  books: AdminBook[];
  faqItems: FAQItem[];
  faqCategories: FAQCategory[];
  statistics: ContentStatistics | null;
  isLoading: boolean;
  error: string | null;
  filters: ContentFilter;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Content Actions Interface
 * Interface cho content actions
 */
export interface ContentActions {
  // Courses
  loadCourses: (filter?: ContentFilter) => Promise<void>;
  createCourse: (course: Partial<AdminCourse>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<AdminCourse>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  publishCourse: (id: string) => Promise<void>;
  unpublishCourse: (id: string) => Promise<void>;

  // Questions
  loadQuestions: (filter?: ContentFilter) => Promise<void>;
  createQuestion: (question: Partial<AdminQuestion>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<AdminQuestion>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  activateQuestion: (id: string) => Promise<void>;
  deactivateQuestion: (id: string) => Promise<void>;

  // Books
  loadBooks: (filter?: ContentFilter) => Promise<void>;
  createBook: (book: Partial<AdminBook>) => Promise<void>;
  updateBook: (id: string, updates: Partial<AdminBook>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  // FAQ
  loadFAQItems: (filter?: ContentFilter) => Promise<void>;
  createFAQItem: (item: Partial<FAQItem>) => Promise<void>;
  updateFAQItem: (id: string, updates: Partial<FAQItem>) => Promise<void>;
  deleteFAQItem: (id: string) => Promise<void>;

  // General
  loadStatistics: () => Promise<void>;
  setFilter: (filter: Partial<ContentFilter>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Content Hook Return
 * Return type cho useContent hook
 */
export interface UseContentReturn {
  state: ContentState;
  actions: ContentActions;
}
