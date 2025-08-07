/**
 * useSearchHistory Hook
 * Hook cho search history management với persistence
 */

import { useState, useCallback, useEffect } from "react";

/**
 * Search history item interface
 * Interface cho search history item
 */
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount?: number;
  filters?: any;
  executionTime?: number;
}

/**
 * Search history options
 * Options cho search history
 */
interface UseSearchHistoryOptions {
  maxHistorySize?: number;
  enablePersistence?: boolean;
  storageKey?: string;
  enableAnalytics?: boolean;
}

/**
 * Search history return interface
 * Interface cho return của search history
 */
interface UseSearchHistoryReturn {
  history: SearchHistoryItem[];
  recentSearches: string[];
  popularSearches: string[];

  // Actions
  addSearch: (query: string, resultsCount?: number, filters?: any, executionTime?: number) => void;
  removeSearch: (id: string) => void;
  clearHistory: () => void;
  getSearchById: (id: string) => SearchHistoryItem | undefined;

  // Analytics
  getSearchFrequency: (query: string) => number;
  getAverageExecutionTime: () => number;
  getTotalSearches: () => number;
  getSearchesByDateRange: (startDate: Date, endDate: Date) => SearchHistoryItem[];

  // Export/Import
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
}

/**
 * Default storage key
 * Key lưu trữ mặc định
 */
const DEFAULT_STORAGE_KEY = "admin-search-history";

/**
 * Main useSearchHistory hook
 * Hook chính cho search history
 */
export function useSearchHistory(options: UseSearchHistoryOptions = {}): UseSearchHistoryReturn {
  const {
    maxHistorySize = 100,
    enablePersistence = true,
    storageKey = DEFAULT_STORAGE_KEY,
    enableAnalytics = true,
  } = options;

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  /**
   * Load history from localStorage
   * Load history từ localStorage
   */
  const loadHistory = useCallback(() => {
    if (!enablePersistence || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects
          const historyWithDates = parsed.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setHistory(historyWithDates);
        }
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    }
  }, [enablePersistence, storageKey]);

  /**
   * Save history to localStorage
   * Lưu history vào localStorage
   */
  const saveHistory = useCallback(
    (historyToSave: SearchHistoryItem[]) => {
      if (!enablePersistence || typeof window === "undefined") return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(historyToSave));
      } catch (error) {
        console.warn("Failed to save search history:", error);
      }
    },
    [enablePersistence, storageKey]
  );

  /**
   * Add search to history
   * Thêm search vào history
   */
  const addSearch = useCallback(
    (query: string, resultsCount?: number, filters?: any, executionTime?: number) => {
      if (!query.trim()) return;

      const newSearch: SearchHistoryItem = {
        id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query: query.trim(),
        timestamp: new Date(),
        resultsCount,
        filters,
        executionTime,
      };

      setHistory((prev) => {
        // Remove duplicate queries (keep most recent)
        const filteredHistory = prev.filter((item) => item.query !== newSearch.query);

        // Add new search at the beginning
        const updatedHistory = [newSearch, ...filteredHistory];

        // Limit history size
        const limitedHistory = updatedHistory.slice(0, maxHistorySize);

        // Save to localStorage
        saveHistory(limitedHistory);

        return limitedHistory;
      });
    },
    [maxHistorySize, saveHistory]
  );

  /**
   * Remove search from history
   * Xóa search từ history
   */
  const removeSearch = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updatedHistory = prev.filter((item) => item.id !== id);
        saveHistory(updatedHistory);
        return updatedHistory;
      });
    },
    [saveHistory]
  );

  /**
   * Clear all history
   * Xóa tất cả history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  /**
   * Get search by ID
   * Lấy search theo ID
   */
  const getSearchById = useCallback(
    (id: string): SearchHistoryItem | undefined => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  /**
   * Get search frequency
   * Lấy tần suất search
   */
  const getSearchFrequency = useCallback(
    (query: string): number => {
      if (!enableAnalytics) return 0;

      return history.filter((item) => item.query.toLowerCase() === query.toLowerCase()).length;
    },
    [history, enableAnalytics]
  );

  /**
   * Get average execution time
   * Lấy thời gian thực thi trung bình
   */
  const getAverageExecutionTime = useCallback((): number => {
    if (!enableAnalytics) return 0;

    const searchesWithTime = history.filter((item) => item.executionTime !== undefined);
    if (searchesWithTime.length === 0) return 0;

    const totalTime = searchesWithTime.reduce((sum, item) => sum + (item.executionTime || 0), 0);
    return totalTime / searchesWithTime.length;
  }, [history, enableAnalytics]);

  /**
   * Get total searches count
   * Lấy tổng số searches
   */
  const getTotalSearches = useCallback((): number => {
    return history.length;
  }, [history]);

  /**
   * Get searches by date range
   * Lấy searches theo khoảng thời gian
   */
  const getSearchesByDateRange = useCallback(
    (startDate: Date, endDate: Date): SearchHistoryItem[] => {
      return history.filter((item) => item.timestamp >= startDate && item.timestamp <= endDate);
    },
    [history]
  );

  /**
   * Export history to JSON
   * Export history ra JSON
   */
  const exportHistory = useCallback((): string => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  /**
   * Import history from JSON
   * Import history từ JSON
   */
  const importHistory = useCallback(
    (data: string): boolean => {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const historyWithDates = parsed.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setHistory(historyWithDates);
          saveHistory(historyWithDates);
          return true;
        }
        return false;
      } catch (error) {
        console.warn("Failed to import search history:", error);
        return false;
      }
    },
    [saveHistory]
  );

  /**
   * Get recent searches (unique queries)
   * Lấy recent searches (queries duy nhất)
   */
  const recentSearches = history
    .slice(0, 10)
    .map((item) => item.query)
    .filter((query, index, array) => array.indexOf(query) === index);

  /**
   * Get popular searches (by frequency)
   * Lấy popular searches (theo tần suất)
   */
  const popularSearches = (() => {
    if (!enableAnalytics) return [];

    const queryFrequency: Record<string, number> = {};

    history.forEach((item) => {
      const query = item.query.toLowerCase();
      queryFrequency[query] = (queryFrequency[query] || 0) + 1;
    });

    return Object.entries(queryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query);
  })();

  /**
   * Load history on mount
   * Load history khi mount
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    recentSearches,
    popularSearches,

    // Actions
    addSearch,
    removeSearch,
    clearHistory,
    getSearchById,

    // Analytics
    getSearchFrequency,
    getAverageExecutionTime,
    getTotalSearches,
    getSearchesByDateRange,

    // Export/Import
    exportHistory,
    importHistory,
  };
}
