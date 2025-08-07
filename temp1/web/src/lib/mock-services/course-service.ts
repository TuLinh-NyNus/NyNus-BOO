import { 
  mockCourses, 
  getCourseById, 
  getFeaturedCourses,
  getPopularCourses,
  getCoursesByCategory,
  getCoursesByLevel,
  searchCourses 
} from '../mock-data/courses';
import { 
  MockCourse, 
  MockCourseListResponse, 
  MockCourseFilterParams, 
  MockPagination 
} from '../mock-data/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type alias for compatibility
export type ICourse = MockCourse;

class MockCourseService {
  async getCourses(params?: MockCourseFilterParams): Promise<MockCourseListResponse> {
    await delay(500); // Simulate network delay

    let filteredCourses = [...mockCourses];

    // Apply filters
    if (params?.search) {
      filteredCourses = searchCourses(params.search);
    }

    if (params?.category) {
      filteredCourses = filteredCourses.filter(course => course.category === params.category);
    }

    if (params?.level) {
      filteredCourses = filteredCourses.filter(course => course.level === params.level);
    }

    if (params?.featured !== undefined) {
      filteredCourses = filteredCourses.filter(course => course.featured === params.featured);
    }

    if (params?.popular !== undefined) {
      filteredCourses = filteredCourses.filter(course => course.popular === params.popular);
    }

    // Apply sorting
    if (params?.sortBy) {
      filteredCourses.sort((a, b) => {
        const aValue = a[params.sortBy as keyof MockCourse] as string | number;
        const bValue = b[params.sortBy as keyof MockCourse] as string | number;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (params.sortOrder === 'desc') {
            return bValue.localeCompare(aValue);
          }
          return aValue.localeCompare(bValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (params.sortOrder === 'desc') {
            return bValue - aValue;
          }
          return aValue - bValue;
        }
        
        return 0;
      });
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    const pagination: MockPagination = {
      page,
      limit,
      total: filteredCourses.length,
      totalPages: Math.ceil(filteredCourses.length / limit),
      hasNext: endIndex < filteredCourses.length,
      hasPrev: page > 1
    };

    return {
      courses: paginatedCourses,
      pagination
    };
  }

  async getCourse(id: string): Promise<MockCourse | null> {
    await delay(300);
    return getCourseById(id) || null;
  }

  async getFeaturedCourses(limit: number = 6): Promise<MockCourse[]> {
    await delay(400);
    return getFeaturedCourses(limit);
  }

  async getPopularCourses(limit: number = 6): Promise<MockCourse[]> {
    await delay(400);
    return getPopularCourses(limit);
  }

  async createCourse(data: Partial<MockCourse>): Promise<MockCourse> {
    await delay(800);
    
    const newCourse: MockCourse = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description || '',
      image: data.image || '/images/courses/default.jpg',
      instructor: data.instructor || '',
      price: data.price || '0 VNĐ',
      href: data.href || `/courses/${Date.now()}`,
      progress: data.progress || 0,
      rating: data.rating || 0,
      students: data.students || 0,
      tags: data.tags || [],
      duration: data.duration || '0 giờ',
      level: data.level || 'Cơ bản',
      category: data.category || 'Khác',
      featured: data.featured || false,
      popular: data.popular || false,
      // Extended fields
      chapters: data.chapters || [],
      totalLessons: data.totalLessons || 0,
      totalQuizzes: data.totalQuizzes || 0,
      requirements: data.requirements || [],
      whatYouWillLearn: data.whatYouWillLearn || [],
      targetAudience: data.targetAudience || [],
      language: data.language || 'Tiếng Việt',
      hasSubtitles: data.hasSubtitles || false,
      hasCertificate: data.hasCertificate || false,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, this would save to database
    mockCourses.push(newCourse);
    
    return newCourse;
  }

  async updateCourse(id: string, data: Partial<MockCourse>): Promise<MockCourse | null> {
    await delay(600);
    
    const courseIndex = mockCourses.findIndex(course => course.id === id);
    if (courseIndex === -1) {
      return null;
    }

    const updatedCourse = {
      ...mockCourses[courseIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockCourses[courseIndex] = updatedCourse;
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    await delay(400);
    
    const courseIndex = mockCourses.findIndex(course => course.id === id);
    if (courseIndex === -1) {
      return false;
    }

    mockCourses.splice(courseIndex, 1);
    return true;
  }

  // Additional helper methods
  async getCoursesByCategory(category: string): Promise<MockCourse[]> {
    await delay(300);
    return getCoursesByCategory(category);
  }

  async getCoursesByLevel(level: string): Promise<MockCourse[]> {
    await delay(300);
    return getCoursesByLevel(level);
  }

  async getCourseStats(): Promise<{
    total: number;
    featured: number;
    popular: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }> {
    await delay(200);
    
    const total = mockCourses.length;
    const featured = mockCourses.filter(course => course.featured).length;
    const popular = mockCourses.filter(course => course.popular).length;
    
    const categories = [...new Set(mockCourses.map(course => course.category))];
    const byCategory: Record<string, number> = {};
    categories.forEach(category => {
      byCategory[category] = mockCourses.filter(course => course.category === category).length;
    });
    
    const levels = [...new Set(mockCourses.map(course => course.level))];
    const byLevel: Record<string, number> = {};
    levels.forEach(level => {
      byLevel[level] = mockCourses.filter(course => course.level === level).length;
    });

    return {
      total,
      featured,
      popular,
      byCategory,
      byLevel
    };
  }
}

// Export singleton instance
export const courseService = new MockCourseService();
export default courseService;
