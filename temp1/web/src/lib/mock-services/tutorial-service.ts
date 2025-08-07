import { 
  mockTutorials, 
  getTutorialById, 
  getTutorialsByCategory,
  getTutorialsByLevel,
  getCompletedTutorials,
  getTutorialsByInstructor,
  searchTutorials,
  getTutorialStats
} from '../mock-data/tutorials';
import { 
  MockTutorial, 
  MockTutorialListResponse, 
  MockTutorialFilterParams, 
  MockPagination 
} from '../mock-data/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockTutorialService {
  async getTutorials(params?: MockTutorialFilterParams): Promise<MockTutorialListResponse> {
    await delay(400); // Simulate network delay

    let filteredTutorials = [...mockTutorials];

    // Apply filters
    if (params?.search) {
      filteredTutorials = searchTutorials(params.search);
    }

    if (params?.category) {
      filteredTutorials = filteredTutorials.filter(tutorial => tutorial.category === params.category);
    }

    if (params?.level) {
      filteredTutorials = filteredTutorials.filter(tutorial => tutorial.level === params.level);
    }

    if (params?.instructor) {
      filteredTutorials = filteredTutorials.filter(tutorial => tutorial.instructor === params.instructor);
    }

    if (params?.isCompleted !== undefined) {
      filteredTutorials = filteredTutorials.filter(tutorial => tutorial.isCompleted === params.isCompleted);
    }

    // Apply sorting
    if (params?.sortBy) {
      filteredTutorials.sort((a, b) => {
        const aValue = a[params.sortBy as keyof MockTutorial];
        const bValue = b[params.sortBy as keyof MockTutorial];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return params.sortOrder === 'desc' ? -comparison : comparison;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        }
        
        return 0;
      });
    } else {
      // Default sort by number
      filteredTutorials.sort((a, b) => a.number - b.number);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 9; // Default to 9 for 3x3 grid
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTutorials = filteredTutorials.slice(startIndex, endIndex);

    const pagination: MockPagination = {
      page,
      limit,
      total: filteredTutorials.length,
      totalPages: Math.ceil(filteredTutorials.length / limit),
      hasNext: endIndex < filteredTutorials.length,
      hasPrev: page > 1
    };

    return {
      tutorials: paginatedTutorials,
      pagination
    };
  }

  async getTutorial(id: string): Promise<MockTutorial | null> {
    await delay(300);
    return getTutorialById(id) || null;
  }

  async getTutorialsByCategory(category: string, limit: number = 9): Promise<MockTutorial[]> {
    await delay(350);
    return getTutorialsByCategory(category).slice(0, limit);
  }

  async getTutorialsByLevel(level: string, limit: number = 9): Promise<MockTutorial[]> {
    await delay(350);
    return getTutorialsByLevel(level).slice(0, limit);
  }

  async getCompletedTutorials(limit: number = 9): Promise<MockTutorial[]> {
    await delay(350);
    return getCompletedTutorials().slice(0, limit);
  }

  async markTutorialComplete(id: string): Promise<MockTutorial | null> {
    await delay(500);
    
    const tutorial = getTutorialById(id);
    if (!tutorial) {
      return null;
    }

    // In a real app, this would update the database
    tutorial.isCompleted = true;
    tutorial.updatedAt = new Date().toISOString();
    
    return tutorial;
  }

  async markTutorialIncomplete(id: string): Promise<MockTutorial | null> {
    await delay(500);
    
    const tutorial = getTutorialById(id);
    if (!tutorial) {
      return null;
    }

    // In a real app, this would update the database
    tutorial.isCompleted = false;
    tutorial.updatedAt = new Date().toISOString();
    
    return tutorial;
  }

  async createTutorial(data: Partial<MockTutorial>): Promise<MockTutorial> {
    await delay(800);
    
    const newTutorial: MockTutorial = {
      id: Date.now().toString(),
      number: data.number || mockTutorials.length + 1,
      title: data.title || '',
      description: data.description || '',
      duration: data.duration || '0:00',
      category: data.category || 'Khác',
      level: data.level || 'Cơ bản',
      instructor: data.instructor || '',
      thumbnail: data.thumbnail || '/images/tutorials/default.jpg',
      videoUrl: data.videoUrl || '',
      isCompleted: data.isCompleted || false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, this would save to database
    mockTutorials.push(newTutorial);
    
    return newTutorial;
  }

  async updateTutorial(id: string, data: Partial<MockTutorial>): Promise<MockTutorial | null> {
    await delay(600);
    
    const tutorialIndex = mockTutorials.findIndex(tutorial => tutorial.id === id);
    if (tutorialIndex === -1) {
      return null;
    }

    const updatedTutorial = {
      ...mockTutorials[tutorialIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockTutorials[tutorialIndex] = updatedTutorial;
    return updatedTutorial;
  }

  async deleteTutorial(id: string): Promise<boolean> {
    await delay(400);
    
    const tutorialIndex = mockTutorials.findIndex(tutorial => tutorial.id === id);
    if (tutorialIndex === -1) {
      return false;
    }

    mockTutorials.splice(tutorialIndex, 1);
    return true;
  }

  async searchTutorials(query: string, limit: number = 9): Promise<MockTutorial[]> {
    await delay(300);
    return searchTutorials(query).slice(0, limit);
  }

  async getTutorialStats(): Promise<{
    total: number;
    completed: number;
    progress: number;
    categories: string[];
    levels: string[];
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }> {
    await delay(200);
    return getTutorialStats();
  }

  async getCategories(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockTutorials.map(tutorial => tutorial.category))];
  }

  async getLevels(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockTutorials.map(tutorial => tutorial.level))];
  }

  async getInstructors(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockTutorials.map(tutorial => tutorial.instructor))];
  }
}

// Export singleton instance
export const tutorialService = new MockTutorialService();
export default tutorialService;
