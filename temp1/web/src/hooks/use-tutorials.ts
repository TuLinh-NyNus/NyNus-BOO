import { useState, useEffect } from 'react';

import { MockTutorial, MockTutorialFilterParams } from '@/lib/mock-data/types';
import { tutorialService } from '@/lib/mock-services';

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

  const fetchTutorials = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tutorialService.getTutorials(params);
      setData(response.tutorials);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tutorials'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [JSON.stringify(params)]);

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

  const fetchTutorial = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const tutorial = await tutorialService.getTutorial(id);
      setData(tutorial);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tutorial'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTutorial();
    }
  }, [id]);

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
      const stats = await tutorialService.getTutorialStats();
      setData(stats);
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
      const categories = await tutorialService.getCategories();
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
export function useTutorialActions():  {
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
      const result = await tutorialService.markTutorialComplete(id);
      return result;
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
      const result = await tutorialService.markTutorialIncomplete(id);
      return result;
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
