import { useState, useEffect, useCallback } from 'react';

interface LoadingStateOptions {
  /** Minimum loading time in milliseconds to prevent flashing */
  minLoadingTime?: number;
  /** Initial loading state */
  initialLoading?: boolean;
  /** Auto-start loading on mount */
  autoStart?: boolean;
}

interface LoadingState {
  /** Current loading state */
  isLoading: boolean;
  /** Error state if any */
  error: Error | null;
  /** Start loading manually */
  startLoading: () => void;
  /** Stop loading manually */
  stopLoading: () => void;
  /** Set error state */
  setError: (error: Error | null) => void;
  /** Reset all states */
  reset: () => void;
  /** Execute async function with loading state management */
  executeWithLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Custom hook for managing loading states with smooth transitions
 * Provides consistent loading behavior across components
 * 
 * @param options - Configuration options for loading behavior
 * @returns Loading state and control functions
 */
export function useLoadingState(options: LoadingStateOptions = {}): LoadingState {
  const {
    minLoadingTime = 500, // Minimum 500ms to prevent flashing
    initialLoading = false,
    autoStart = false
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setLoadingStartTime(Date.now());
  }, []);

  // Auto-start loading if specified
  useEffect(() => {
    if (autoStart) {
      startLoading();
    }
  }, [autoStart, startLoading]);

  const stopLoading = useCallback(async () => {
    if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        // Wait for minimum loading time to prevent flashing
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    }
    
    setIsLoading(false);
    setLoadingStartTime(null);
  }, [loadingStartTime, minLoadingTime]);

  const handleSetError = useCallback((error: Error | null) => {
    setError(error);
    if (error) {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLoadingStartTime(null);
  }, []);

  const executeWithLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await asyncFn();
      await stopLoading();
      return result;
    } catch (error) {
      handleSetError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, [startLoading, stopLoading, handleSetError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: handleSetError,
    reset,
    executeWithLoading
  };
}

/**
 * Hook for simulating data loading with realistic delays
 * Useful for testing loading states and demonstrations
 */
export function useSimulatedLoading(delay: number = 2000) {
  const loadingState = useLoadingState({ minLoadingTime: 300 });

  const simulateLoading = useCallback(async <T>(data: T): Promise<T> => {
    return loadingState.executeWithLoading(async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, delay));
      return data;
    });
  }, [loadingState, delay]);

  return {
    ...loadingState,
    simulateLoading
  };
}

/**
 * Hook for managing multiple loading states
 * Useful when you have multiple async operations
 */
export function useMultipleLoadingStates<T extends Record<string, boolean>>(
  initialStates: T
) {
  const [loadingStates, setLoadingStates] = useState<T>(initialStates);

  const setLoading = useCallback((key: keyof T, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isAnyLoading
  };
}
