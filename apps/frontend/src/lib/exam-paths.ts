/**
 * Exam Routes Constants
 * Centralized route management cho exam interface
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

// ===== BASE PATHS =====

/**
 * Base path cho exams section
 */
export const EXAMS_BASE_PATH = '/exams' as const;

// ===== STATIC ROUTES =====

/**
 * Exam Static Routes
 * Các route tĩnh cho exam interface
 */
export const EXAM_ROUTES = {
  // Main pages
  LANDING: '/exams',
  BROWSE: '/exams/browse', 
  SEARCH: '/exams/search',
  
  // Management routes (Teacher/Admin only)
  CREATE: '/exams/create',
  MANAGE: '/exams/manage',
  
  // Student routes
  MY_EXAMS: '/exams/my-exams',
  MY_RESULTS: '/exams/my-results',
  
  // Categories routes (future)
  CATEGORIES: '/exams/categories',
  
  // Practice routes (future phases)
  PRACTICE: '/exams/practice',
} as const;

// ===== DYNAMIC ROUTES =====

/**
 * Exam Dynamic Routes
 * Functions để generate dynamic routes với parameters
 */
export const EXAM_DYNAMIC_ROUTES = {
  /**
   * Generate exam detail route
   * @param id - Exam ID
   * @returns Exam detail route
   */
  DETAIL: (id: string) => `/exams/${id}`,
  
  /**
   * Generate exam edit route (Teacher/Admin only)
   * @param id - Exam ID
   * @returns Exam edit route
   */
  EDIT: (id: string) => `/exams/${id}/edit`,
  
  /**
   * Generate exam taking route (Student)
   * @param id - Exam ID
   * @returns Exam taking route
   */
  TAKE: (id: string) => `/exams/${id}/take`,
  
  /**
   * Generate exam results route
   * @param id - Exam ID
   * @returns Exam results route
   */
  RESULTS: (id: string) => `/exams/${id}/results`,
  
  /**
   * Generate exam attempt results route
   * @param examId - Exam ID
   * @param attemptId - Attempt ID
   * @returns Specific attempt results route
   */
  ATTEMPT_RESULTS: (examId: string, attemptId: string) => `/exams/${examId}/results/${attemptId}`,
  
  /**
   * Generate exam preview route (Teacher/Admin only)
   * @param id - Exam ID
   * @returns Exam preview route
   */
  PREVIEW: (id: string) => `/exams/${id}/preview`,
  
  /**
   * Generate exam analytics route (Teacher/Admin only)
   * @param id - Exam ID
   * @returns Exam analytics route
   */
  ANALYTICS: (id: string) => `/exams/${id}/analytics`,
  
  /**
   * Generate category route
   * @param categoryId - Category ID
   * @returns Category exams route
   */
  CATEGORY: (categoryId: string) => `/exams/category/${categoryId}`,
  
  /**
   * Generate difficulty route
   * @param level - Difficulty level
   * @returns Difficulty exams route
   */
  DIFFICULTY: (level: string) => `/exams/difficulty/${level}`,
  
  /**
   * Generate subject route
   * @param subject - Subject code
   * @returns Subject exams route
   */
  SUBJECT: (subject: string) => `/exams/subject/${subject}`,
} as const;

// ===== ROUTE VALIDATION =====

/**
 * Validate exam ID format
 * @param id - Exam ID to validate
 * @returns True if valid UUID format
 */
export function isValidExamId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate attempt ID format
 * @param id - Attempt ID to validate
 * @returns True if valid UUID format
 */
export function isValidAttemptId(id: string): boolean {
  return isValidExamId(id); // Same UUID format
}

// ===== ROUTE HELPERS =====

/**
 * Get exam route type from pathname
 * @param pathname - Current pathname
 * @returns Route type or null if not exam route
 */
export function getExamRouteType(pathname: string): string | null {
  if (!pathname.startsWith(EXAMS_BASE_PATH)) {
    return null;
  }
  
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 1) return 'listing';
  if (segments.length === 2 && segments[1] === 'create') return 'create';
  if (segments.length === 2 && segments[1] === 'browse') return 'browse';
  if (segments.length === 2 && segments[1] === 'search') return 'search';
  if (segments.length === 2 && segments[1] === 'my-exams') return 'my-exams';
  if (segments.length === 2 && segments[1] === 'my-results') return 'my-results';
  
  if (segments.length === 2 && isValidExamId(segments[1])) return 'detail';
  if (segments.length === 3 && isValidExamId(segments[1])) {
    switch (segments[2]) {
      case 'edit': return 'edit';
      case 'take': return 'take';
      case 'results': return 'results';
      case 'preview': return 'preview';
      case 'analytics': return 'analytics';
      default: return null;
    }
  }
  
  return null;
}

/**
 * Check if route requires authentication
 * @param pathname - Route pathname
 * @returns True if authentication required
 */
export function examRouteRequiresAuth(pathname: string): boolean {
  const routeType = getExamRouteType(pathname);
  
  // All exam routes require authentication except public browsing
  const publicRoutes = ['listing', 'browse', 'search'];
  return routeType ? !publicRoutes.includes(routeType) : false;
}

/**
 * Check if route requires teacher/admin role
 * @param pathname - Route pathname
 * @returns True if teacher/admin role required
 */
export function examRouteRequiresTeacher(pathname: string): boolean {
  const routeType = getExamRouteType(pathname);
  const teacherRoutes = ['create', 'edit', 'preview', 'analytics'];
  return routeType ? teacherRoutes.includes(routeType) : false;
}

// ===== TYPE EXPORTS =====

/**
 * Exam route types
 */
export type ExamRouteType = 
  | 'listing' 
  | 'create' 
  | 'browse' 
  | 'search' 
  | 'my-exams' 
  | 'my-results'
  | 'detail' 
  | 'edit' 
  | 'take' 
  | 'results' 
  | 'preview' 
  | 'analytics';

/**
 * Static exam routes type
 */
export type ExamStaticRoute = typeof EXAM_ROUTES[keyof typeof EXAM_ROUTES];

/**
 * Dynamic exam route function type
 */
export type ExamDynamicRouteFunction = typeof EXAM_DYNAMIC_ROUTES[keyof typeof EXAM_DYNAMIC_ROUTES];
