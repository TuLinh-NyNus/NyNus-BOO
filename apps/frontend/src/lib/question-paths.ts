/**
 * Question Routes Constants
 * Centralized route management cho public question interface
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== BASE PATHS =====

/**
 * Base path cho questions section
 */
export const QUESTIONS_BASE_PATH = '/questions' as const;

// ===== STATIC ROUTES =====

/**
 * Question Static Routes
 * Các route tĩnh cho question interface
 */
export const QUESTION_ROUTES = {
  // Main pages
  LANDING: '/questions',
  BROWSE: '/questions/browse', 
  SEARCH: '/questions/search',
  
  // Category routes (future)
  CATEGORIES: '/questions/categories',
  
  // Practice routes (future phases)
  PRACTICE: '/questions/practice',
  PRACTICE_START: '/questions/practice/start',
} as const;

// ===== DYNAMIC ROUTES =====

/**
 * Question Dynamic Routes
 * Functions để generate dynamic routes với parameters
 */
export const QUESTION_DYNAMIC_ROUTES = {
  /**
   * Generate question detail route
   * @param id - Question ID
   * @returns Question detail route
   */
  DETAIL: (id: string) => `/questions/${id}`,
  
  /**
   * Generate category route
   * @param categoryId - Category ID
   * @returns Category questions route
   */
  CATEGORY: (categoryId: string) => `/questions/category/${categoryId}`,
  
  /**
   * Generate difficulty route
   * @param level - Difficulty level
   * @returns Difficulty questions route
   */
  DIFFICULTY: (level: string) => `/questions/difficulty/${level}`,
  
  /**
   * Generate practice quiz route
   * @param quizId - Quiz ID
   * @returns Practice quiz route
   */
  PRACTICE_QUIZ: (quizId: string) => `/questions/practice/quiz/${quizId}`,
  
  /**
   * Generate practice results route
   * @param sessionId - Session ID
   * @returns Practice results route
   */
  PRACTICE_RESULTS: (sessionId: string) => `/questions/practice/results/${sessionId}`,
} as const;

// ===== SEARCH ROUTES =====

/**
 * Question Search Routes
 * Routes cho search functionality
 */
export const QUESTION_SEARCH_ROUTES = {
  /**
   * Generate search route với query parameters
   * @param query - Search query
   * @param filters - Optional filters
   * @returns Search route với parameters
   */
  SEARCH_WITH_QUERY: (query: string, filters?: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value);
        }
      });
    }
    
    return `/questions/search?${searchParams.toString()}`;
  },
  
  /**
   * Generate browse route với filters
   * @param filters - Filter parameters
   * @returns Browse route với filters
   */
  BROWSE_WITH_FILTERS: (filters: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `/questions/browse?${queryString}` : '/questions/browse';
  },
} as const;

// ===== ROUTE VALIDATION =====

/**
 * Check if path is a question route
 * @param pathname - Current pathname
 * @returns True if pathname is question route
 */
export function isQuestionRoute(pathname: string): boolean {
  return pathname.startsWith(QUESTIONS_BASE_PATH);
}

/**
 * Check if path is question detail route
 * @param pathname - Current pathname
 * @returns True if pathname is question detail route
 */
export function isQuestionDetailRoute(pathname: string): boolean {
  const detailPattern = /^\/questions\/[^\/]+$/;
  return detailPattern.test(pathname);
}

/**
 * Extract question ID from detail route
 * @param pathname - Question detail pathname
 * @returns Question ID or null
 */
export function extractQuestionId(pathname: string): string | null {
  const match = pathname.match(/^\/questions\/([^\/]+)$/);
  return match ? match[1] : null;
}

// ===== BREADCRUMB HELPERS =====

/**
 * Question Route Metadata
 * Metadata cho breadcrumb generation
 */
export const QUESTION_ROUTE_METADATA = {
  [QUESTION_ROUTES.LANDING]: {
    title: 'Ngân hàng câu hỏi',
    description: 'Khám phá hàng nghìn câu hỏi toán học',
  },
  [QUESTION_ROUTES.BROWSE]: {
    title: 'Duyệt câu hỏi',
    description: 'Tìm kiếm và lọc câu hỏi theo chủ đề',
  },
  [QUESTION_ROUTES.SEARCH]: {
    title: 'Kết quả tìm kiếm',
    description: 'Kết quả tìm kiếm câu hỏi',
  },
} as const;

/**
 * Generate breadcrumb data cho question routes
 * @param pathname - Current pathname
 * @returns Breadcrumb data array
 */
export function generateQuestionBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/' }
  ];

  if (pathname === QUESTION_ROUTES.LANDING) {
    breadcrumbs.push({ label: 'Ngân hàng câu hỏi', href: pathname, isActive: true });
  } else if (pathname === QUESTION_ROUTES.BROWSE) {
    breadcrumbs.push(
      { label: 'Ngân hàng câu hỏi', href: QUESTION_ROUTES.LANDING },
      { label: 'Duyệt câu hỏi', href: pathname, isActive: true }
    );
  } else if (pathname === QUESTION_ROUTES.SEARCH) {
    breadcrumbs.push(
      { label: 'Ngân hàng câu hỏi', href: QUESTION_ROUTES.LANDING },
      { label: 'Tìm kiếm', href: pathname, isActive: true }
    );
  } else if (isQuestionDetailRoute(pathname)) {
    const questionId = extractQuestionId(pathname);
    breadcrumbs.push(
      { label: 'Ngân hàng câu hỏi', href: QUESTION_ROUTES.LANDING },
      { label: 'Duyệt câu hỏi', href: QUESTION_ROUTES.BROWSE },
      { label: `Câu hỏi ${questionId}`, href: pathname, isActive: true }
    );
  }

  return breadcrumbs;
}

// ===== TYPE EXPORTS =====

/**
 * Question Route Type
 * Union type của tất cả question routes
 */
export type QuestionRoute = typeof QUESTION_ROUTES[keyof typeof QUESTION_ROUTES];

/**
 * Breadcrumb Item Type
 * Type cho breadcrumb items
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}
