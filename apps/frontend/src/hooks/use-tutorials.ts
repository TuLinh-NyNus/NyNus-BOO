/**
 * Hook for Tutorials
 * Tương thích với dự án cũ
 */

import { useState, useEffect, useCallback } from 'react';
import { MockTutorial, MockTutorialFilterParams } from '@/lib/mockdata/courses-types';
import { mockTutorials } from '@/lib/mockdata';

interface UseTutorialsResult {
  data: MockTutorial[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTutorials(params?: MockTutorialFilterParams): UseTutorialsResult {
  const [data, setData] = useState<MockTutorial[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTutorials = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredTutorials = [...mockTutorials];

      // Apply filters
      if (params?.search) {
        filteredTutorials = filteredTutorials.filter(tutorial =>
          tutorial.title.toLowerCase().includes(params.search!.toLowerCase()) ||
          tutorial.description.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      if (params?.category) {
        filteredTutorials = filteredTutorials.filter(tutorial =>
          tutorial.category === params.category
        );
      }

      if (params?.level) {
        filteredTutorials = filteredTutorials.filter(tutorial =>
          tutorial.level === params.level
        );
      }

      // Apply sorting
      if (params?.sortBy) {
        filteredTutorials.sort((a, b) => {
          let aValue: number | string | Date, bValue: number | string | Date;

          switch (params.sortBy) {
            case 'number':
              aValue = a.number;
              bValue = b.number;
              break;
            case 'title':
              aValue = a.title;
              bValue = b.title;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            default:
              aValue = a.number;
              bValue = b.number;
          }

          if (params.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      // Apply pagination
      if (params?.limit) {
        const offset = params.offset || 0;
        filteredTutorials = filteredTutorials.slice(offset, offset + params.limit);
      }

      setData(filteredTutorials);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tutorials'));
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTutorials
  };
}

interface UseTutorialResult {
  data: MockTutorial | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTutorial(id: string): UseTutorialResult {
  const [data, setData] = useState<MockTutorial | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTutorial = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const tutorial = mockTutorials.find(t => t.id === id) || null;
      setData(tutorial);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tutorial'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTutorial();
    }
  }, [id, fetchTutorial]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTutorial
  };
}

interface UseTutorialStatsResult {
  data: {
    total: number;
    completed: number;
    progress: number;
    categories: string[];
    levels: string[];
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTutorialStats(): UseTutorialStatsResult {
  const [data, setData] = useState<UseTutorialStatsResult['data']>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const total = mockTutorials.length;
      const completed = mockTutorials.filter(t => t.isCompleted).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const categories = [...new Set(mockTutorials.map(t => t.category))];
      const levels = [...new Set(mockTutorials.map(t => t.level))];
      
      const byCategory: Record<string, number> = {};
      const byLevel: Record<string, number> = {};
      
      categories.forEach(category => {
        byCategory[category] = mockTutorials.filter(t => t.category === category).length;
      });
      
      levels.forEach(level => {
        byLevel[level] = mockTutorials.filter(t => t.level === level).length;
      });

      setData({
        total,
        completed,
        progress,
        categories,
        levels,
        byCategory,
        byLevel
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tutorial stats'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats
  };
}

interface UseTutorialCategoriesResult {
  data: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTutorialCategories(): UseTutorialCategoriesResult {
  const [data, setData] = useState<string[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const categories = [...new Set(mockTutorials.map(t => t.category))];
      setData(categories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCategories
  };
}

// Hook for tutorial actions (mark complete/incomplete)
export function useTutorialActions(): {
  isLoading: boolean;
  error: Error | null;
  markComplete: (id: string) => Promise<MockTutorial | null>;
  markIncomplete: (id: string) => Promise<MockTutorial | null>;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markComplete = async (id: string): Promise<MockTutorial | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const tutorial = mockTutorials.find(t => t.id === id);
      if (tutorial) {
        tutorial.isCompleted = true;
        return tutorial;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark tutorial complete'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const markIncomplete = async (id: string): Promise<MockTutorial | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const tutorial = mockTutorials.find(t => t.id === id);
      if (tutorial) {
        tutorial.isCompleted = false;
        return tutorial;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark tutorial incomplete'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    markComplete,
    markIncomplete,
    isLoading,
    error
  };
}
