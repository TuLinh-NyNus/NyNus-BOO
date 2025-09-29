/**
 * Public Question Service
 * Service layer cho public question operations
 * Hỗ trợ chuyển đổi giữa mock và real API dựa trên feature flag
 * 
 * @author NyNus Development Team
 * @version 2.1.0
 * @created 2025-01-18
 * @updated 2025-01-19 - Backend integration with proper error handling
 */

import {
  PublicQuestion,
  PublicQuestionFilters,
  PublicQuestionListResponse,
  PublicQuestionResponse,
  PublicQuestionSearchResponse,
  QuestionCategory,
  PublicQuestionStats,
  PublicSearchSuggestion,
  DEFAULT_PUBLIC_QUESTION_FILTERS
} from '@/types/public';

import { QuestionType, QuestionDifficulty } from '@/types/question';
import { 
  isGrpcError, 
  getGrpcErrorMessage, 
  logGrpcError 
} from '@/lib/grpc/errors';
import { QuestionService as GrpcQuestionService } from '@/services/grpc/question.service';
// TODO: Re-enable mappers when implementing proper gRPC filtering
// import { mapFiltersToListRequest, mapToSearchRequest } from '@/services/api/mappers/question-filter.mapper';
// import { mapQuestionDetailToPublic, mapSearchResultToPublic } from '@/services/api/mappers/question.mapper';

// ===== MOCK DATA =====

/**
 * Mock public questions data
 * Temporary data cho development phase
 */
const mockPublicQuestions: PublicQuestion[] = [
  {
    id: 'q001',
    content: 'Giải phương trình bậc hai: $x^2 + 2x - 3 = 0$',
    type: QuestionType.MC,
    difficulty: QuestionDifficulty.MEDIUM,
    category: 'Đại số',
    subject: 'Toán học',
    grade: 'Lớp 9',
    points: 10,
    timeLimit: 300,
    explanation: 'Sử dụng công thức nghiệm của phương trình bậc hai',
    answers: [
      { id: 'a', content: '$x = 1, x = -3$', isCorrect: true },
      { id: 'b', content: '$x = -1, x = 3$', isCorrect: false },
      { id: 'c', content: '$x = 2, x = -1$', isCorrect: false },
      { id: 'd', content: '$x = -2, x = 1$', isCorrect: false }
    ],
    correctAnswer: 'a',
    solution: 'Áp dụng công thức: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
    tags: ['phương trình bậc hai', 'đại số', 'toán 9'],
    views: 1234,
    rating: 4.8,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-16T00:00:00Z'
  },
  {
    id: 'q002',
    content: 'Tính tích phân: $\\int_0^1 x^2 dx$',
    type: QuestionType.SA,
    difficulty: QuestionDifficulty.HARD,
    category: 'Giải tích',
    subject: 'Toán học',
    grade: 'Lớp 12',
    points: 15,
    timeLimit: 600,
    explanation: 'Sử dụng quy tắc tích phân cơ bản',
    solution: '$\\int_0^1 x^2 dx = \\frac{x^3}{3}\\Big|_0^1 = \\frac{1}{3}$',
    tags: ['tích phân', 'giải tích', 'toán 12'],
    views: 987,
    rating: 4.9,
    createdAt: '2025-01-14T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'q003',
    content: 'Chứng minh định lý Pythagoras',
    type: QuestionType.ES,
    difficulty: QuestionDifficulty.MEDIUM,
    category: 'Hình học',
    subject: 'Toán học',
    grade: 'Lớp 8',
    points: 20,
    timeLimit: 900,
    explanation: 'Sử dụng phương pháp hình học hoặc đại số',
    solution: 'Có nhiều cách chứng minh, phổ biến nhất là dùng diện tích hình vuông',
    tags: ['định lý pythagoras', 'hình học', 'toán 8'],
    views: 2156,
    rating: 4.7,
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-14T00:00:00Z'
  }
];

/**
 * Mock categories data
 * Temporary data cho development phase
 */
const mockCategories: QuestionCategory[] = [
  {
    id: 'algebra',
    name: 'Đại số',
    description: 'Phương trình, bất phương trình, hàm số',
    questionCount: 2456,
    icon: '🔢',
    color: 'blue'
  },
  {
    id: 'geometry',
    name: 'Hình học',
    description: 'Hình học phẳng, không gian, tọa độ',
    questionCount: 1834,
    icon: '📐',
    color: 'green'
  },
  {
    id: 'calculus',
    name: 'Giải tích',
    description: 'Đạo hàm, tích phân, giới hạn',
    questionCount: 1567,
    icon: '📊',
    color: 'purple'
  }
];

// ===== UTILITY FUNCTIONS =====

/**
 * Simulate API delay
 * Mock realistic API latency
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique ID
 * Generate unique identifier cho mock data
 */
const _generateId = (): string => Math.random().toString(36).substr(2, 9);

/**
 * Check if mock mode is enabled
 * Kiểm tra xem có sử dụng mock data hay không
 */
const isUseMock = (): boolean => {
  // Kiểm tra biến môi trường
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK;
  return useMock === 'true' || useMock === undefined; // Default to mock if not set
};

/**
 * Check if we should use real API
 * Kiểm tra có nên dùng API thật hay không
 */
const shouldUseRealAPI = (): boolean => {
  return !isUseMock() && isAuthenticated();
};

/**
 * Log current configuration for debugging
 * Ghi log cấu hình hiện tại để debug
 */
const logCurrentConfig = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[PublicQuestionService] Config:', {
      useMock: isUseMock(),
      isAuthenticated: isAuthenticated(),
      shouldUseRealAPI: shouldUseRealAPI(),
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
  }
};

/**
 * Check if user is authenticated
 * Kiểm tra xem người dùng đã đăng nhập chưa
 */
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('nynus-auth-token');
  return !!token;
};

/**
 * Handle gRPC errors with proper UX
 * Xử lý lỗi gRPC với UX tốt
 */
const handleGrpcError = (error: unknown, operation: string): void => {
  logGrpcError(error, operation);
  
  if (isGrpcError(error)) {
    const message = getGrpcErrorMessage(error);
    
    if (error.code === 16) { // UNAUTHENTICATED
      console.warn('Authentication required - redirecting to login or fallback to mock');
      // toast.error('Vui lòng đăng nhập để truy cập tài nguyên này');
    } else if (error.code === 14) { // UNAVAILABLE 
      console.warn('Service unavailable - falling back to mock data');
      // toast.error('Không thể kết nối đến server. Hiển thị dữ liệu mẫu.');
    } else {
      console.warn(`gRPC Error: ${message}`);
      // toast.error(`Lỗi: ${message}`);
    }
  } else {
    console.warn('Unknown error occurred');
    // toast.error('Đã xảy ra lỗi không xác định');
  }
};

// ===== MAIN SERVICE CLASS =====

/**
 * Public Question Service
 * Service class cho public question operations với mock implementation
 * 
 * Features:
 * - Browse questions với filtering và pagination
 * - Search questions với advanced search capabilities
 * - Get individual question details
 * - Get featured và popular questions
 * - Get questions by category/subject/grade
 * - Get question statistics và metadata
 */
export class PublicQuestionService {
  /**
   * Browse questions với filters và pagination
   * Auto-switches between real API and mock based on auth status
   */
  static async browseQuestions(
    filters: PublicQuestionFilters = DEFAULT_PUBLIC_QUESTION_FILTERS
  ): Promise<PublicQuestionListResponse> {
    // Use real API if authenticated and not in mock mode
    if (shouldUseRealAPI()) {
      logCurrentConfig();
      try {
        // Use listQuestions as a temporary replacement for filterQuestions
        // TODO: Implement proper filtering when backend gRPC service supports it
        const response = await GrpcQuestionService.listQuestions({});
        
        // Basic client-side filtering for now
        let filteredQuestions = response.questions || [];
        
        // Apply keyword filter
        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredQuestions = filteredQuestions.filter((q: any) =>
            q.content?.toLowerCase().includes(keyword) ||
            q.raw_content?.toLowerCase().includes(keyword)
          );
        }
        
        // Simple mapping - we'll need proper mappers later
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedQuestions: PublicQuestion[] = filteredQuestions.map((q: any) => ({
          id: q.id || '',
          content: q.content || q.raw_content || '',
          type: (q.type as QuestionType) || QuestionType.MC,
          difficulty: (q.difficulty as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
          category: 'General', // TODO: Get from question data
          subject: 'General', // TODO: Get from question data  
          grade: 'General', // TODO: Get from question data
          points: 10,
          timeLimit: 300,
          explanation: q.solution || '',
          tags: q.tag || [],
          views: q.usage_count || 0,
          rating: 4.5,
          createdAt: q.created_at || new Date().toISOString(),
          updatedAt: q.updated_at || new Date().toISOString(),
          // Mock additional fields that PublicQuestion requires
          answers: [],
          correctAnswer: '',
          solution: q.solution
        }));
        
        const total = mappedQuestions.length;
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: mappedQuestions.slice((page - 1) * limit, page * limit),
          pagination: {
            page,
            limit,
            total,
            totalPages
          },
          filters,
          meta: {
            totalQuestions: total,
            categories: ['General'],
            subjects: ['General'],
            grades: ['General'],
            difficulties: [QuestionDifficulty.EASY, QuestionDifficulty.MEDIUM, QuestionDifficulty.HARD]
          }
        };
      } catch (error) {
        handleGrpcError(error, 'browseQuestions');
        // Fallback to mock implementation
      }
    }
    
    // Mock implementation (original code)
    await delay(300);

    let filteredQuestions = [...mockPublicQuestions];

    // Apply keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q =>
        q.content.toLowerCase().includes(keyword) ||
        q.tags?.some(tag => tag.toLowerCase().includes(keyword)) ||
        q.explanation?.toLowerCase().includes(keyword)
      );
    }

    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        filters.category!.includes(q.category)
      );
    }

    // Apply subject filter
    if (filters.subject && filters.subject.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.subject && filters.subject!.includes(q.subject)
      );
    }

    // Apply grade filter
    if (filters.grade && filters.grade.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.grade && filters.grade!.includes(q.grade)
      );
    }

    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        filters.type!.includes(q.type)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.difficulty && filters.difficulty!.includes(q.difficulty)
      );
    }

    // Apply content filters
    if (filters.hasAnswers !== undefined) {
      filteredQuestions = filteredQuestions.filter(q =>
        filters.hasAnswers ? (q.answers && q.answers.length > 0) : !q.answers
      );
    }

    if (filters.hasSolution !== undefined) {
      filteredQuestions = filteredQuestions.filter(q =>
        filters.hasSolution ? !!q.solution : !q.solution
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'newest';
    filteredQuestions.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'difficulty':
          const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3, 'EXPERT': 4 };
          return (difficultyOrder[a.difficulty || 'MEDIUM'] || 2) -
                 (difficultyOrder[b.difficulty || 'MEDIUM'] || 2);
        default:
          return 0;
      }
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = filteredQuestions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    return {
      data: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      filters,
      meta: {
        totalQuestions: mockPublicQuestions.length,
        categories: [...new Set(mockPublicQuestions.map(q => q.category))],
        subjects: [...new Set(mockPublicQuestions.map(q => q.subject).filter(Boolean) as string[])],
        grades: [...new Set(mockPublicQuestions.map(q => q.grade).filter(Boolean) as string[])],
        difficulties: [QuestionDifficulty.EASY, QuestionDifficulty.MEDIUM, QuestionDifficulty.HARD]
      }
    };
  }

  /**
   * Search questions với query string
   * Auto-switches between real API and mock based on auth status
   */
  static async searchQuestions(
    query: string,
    filters: PublicQuestionFilters = DEFAULT_PUBLIC_QUESTION_FILTERS
  ): Promise<PublicQuestionSearchResponse> {
    // Use real API if authenticated and not in mock mode
    // TODO: Implement search when backend gRPC service supports it
    // For now, fall back to mock to avoid breaking existing functionality
    /*
    if (shouldUseRealAPI()) {
      logCurrentConfig();
      try {
        // Use listQuestions with client-side search for now
        const response = await GrpcQuestionService.listQuestions({});
        // Apply search filtering here...
      } catch (error) {
        handleGrpcError(error, 'searchQuestions');
        // Fallback to mock nếu lỗi
      }
    }
    */
    
    // Mock implementation (original code)
    await delay(400);

    const searchStartTime = Date.now();

    // Combine query với keyword filter
    const searchFilters: PublicQuestionFilters = {
      ...filters,
      keyword: query
    };

    // Use browse method với search filters
    const browseResult = await this.browseQuestions(searchFilters);

    const searchTime = Date.now() - searchStartTime;

    return {
      ...browseResult,
      query,
      searchMeta: {
        totalResults: browseResult.pagination.total,
        searchTime,
        suggestions: query.length > 2 ? ['phương trình', 'tích phân', 'hình học'] : [],
        corrections: query.includes('phuong') ? ['phương trình'] : undefined
      }
    };
  }

  /**
   * Get single question by ID or question code
   * Auto-switches between real API and mock based on auth status
   */
  static async getQuestion(id: string): Promise<PublicQuestionResponse> {
    // TODO: Implement getQuestion with gRPC when backend supports it
    // For now, use mock to avoid breaking existing functionality
    /*
    if (shouldUseRealAPI()) {
      try {
        // Use getQuestion by ID when available
        const response = await GrpcQuestionService.getQuestion({ id });
        // Map response...
      } catch (error) {
        handleGrpcError(error, 'getQuestion');
        // Fallback to mock nếu lỗi
      }
    }
    */
    
    // Mock implementation (original code)
    await delay(200);

    const question = mockPublicQuestions.find(q => q.id === id);
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }

    // Get related questions (same category, different ID)
    const related = mockPublicQuestions
      .filter(q => q.id !== id && q.category === question.category)
      .slice(0, 3);

    return {
      data: question,
      related,
      meta: {
        category: question.category,
        subject: question.subject,
        grade: question.grade,
        nextQuestionId: mockPublicQuestions[1]?.id,
        previousQuestionId: mockPublicQuestions[0]?.id
      }
    };
  }

  /**
   * Get featured questions
   * Retrieve featured/popular questions cho homepage
   */
  static async getFeaturedQuestions(limit: number = 6): Promise<PublicQuestionListResponse> {
    await delay(250);

    // Sort by rating và views để get featured questions
    const featured = [...mockPublicQuestions]
      .sort((a, b) => ((b.rating || 0) + (b.views || 0) / 1000) - ((a.rating || 0) + (a.views || 0) / 1000))
      .slice(0, limit);

    return {
      data: featured,
      pagination: {
        page: 1,
        limit,
        total: featured.length,
        totalPages: 1
      }
    };
  }

  /**
   * Get questions by category
   * Retrieve questions filtered by specific category
   */
  static async getQuestionsByCategory(
    categoryId: string,
    filters: Omit<PublicQuestionFilters, 'category'> = {}
  ): Promise<PublicQuestionListResponse> {
    const categoryFilters: PublicQuestionFilters = {
      ...filters,
      category: [categoryId]
    };

    return this.browseQuestions(categoryFilters);
  }

  /**
   * Get question categories
   * Retrieve available categories với question counts
   */
  static async getCategories(): Promise<QuestionCategory[]> {
    await delay(150);
    return mockCategories;
  }

  /**
   * Get question statistics
   * Retrieve public statistics cho dashboard
   */
  static async getStatistics(): Promise<PublicQuestionStats> {
    await delay(200);

    const totalQuestions = mockPublicQuestions.length;
    const categories = mockCategories;

    return {
      totalQuestions,
      totalCategories: categories.length,
      totalSubjects: [...new Set(mockPublicQuestions.map(q => q.subject).filter(Boolean))].length,
      popularCategories: categories.map(cat => ({
        category: cat.name,
        questionCount: cat.questionCount,
        percentage: Math.round((cat.questionCount / totalQuestions) * 100)
      })),
      difficultyDistribution: [
        { difficulty: QuestionDifficulty.EASY, count: 1, percentage: 33 },
        { difficulty: QuestionDifficulty.MEDIUM, count: 1, percentage: 33 },
        { difficulty: QuestionDifficulty.HARD, count: 1, percentage: 34 }
      ],
      recentlyAdded: 5,
      averageRating: 4.8
    };
  }

  /**
   * Get search suggestions
   * Retrieve search suggestions cho autocomplete
   */
  static async getSearchSuggestions(query: string): Promise<PublicSearchSuggestion[]> {
    await delay(100);

    if (query.length < 2) return [];

    const suggestions: PublicSearchSuggestion[] = [
      { type: 'keyword', value: 'phương trình', label: 'Phương trình', count: 156 },
      { type: 'keyword', value: 'tích phân', label: 'Tích phân', count: 89 },
      { type: 'category', value: 'algebra', label: 'Đại số', count: 245, category: 'Đại số' },
      { type: 'tag', value: 'toán 9', label: 'Toán lớp 9', count: 123 }
    ];

    return suggestions.filter(s => 
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.value.toLowerCase().includes(query.toLowerCase())
    );
  }
}
