/**
 * useSearchOptimization Hook
 * Hook cho search performance optimization với indexing và caching
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AdminUser } from "../types/admin-user";

/**
 * Search index interface
 * Interface cho search index
 */
interface SearchIndex {
  [key: string]: Set<string>; // term -> user IDs
}

/**
 * Search cache interface
 * Interface cho search cache
 */
interface SearchCache {
  [query: string]: {
    results: AdminUser[];
    timestamp: number;
    executionTime: number;
  };
}

/**
 * Search performance metrics
 * Metrics cho search performance
 */
interface SearchMetrics {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
  averageExecutionTime: number;
  indexSize: number;
  cacheSize: number;
}

/**
 * Search optimization options
 * Options cho search optimization
 */
interface UseSearchOptimizationOptions {
  enableIndexing?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number; // milliseconds
  maxCacheSize?: number;
  enableMetrics?: boolean;
  indexFields?: (keyof AdminUser)[];
}

/**
 * Search optimization return interface
 * Interface cho return của search optimization
 */
interface UseSearchOptimizationReturn {
  // Search function
  optimizedSearch: (
    query: string,
    users: AdminUser[]
  ) => Promise<{
    results: AdminUser[];
    executionTime: number;
    fromCache: boolean;
  }>;

  // Index management
  buildIndex: (users: AdminUser[]) => void;
  clearIndex: () => void;
  getIndexSize: () => number;

  // Cache management
  clearCache: () => void;
  getCacheSize: () => number;
  getCacheHitRate: () => number;

  // Metrics
  metrics: SearchMetrics;
  resetMetrics: () => void;

  // Status
  isIndexing: boolean;
  isSearching: boolean;
}

/**
 * Default search fields to index
 * Fields mặc định để index
 */
const DEFAULT_INDEX_FIELDS: (keyof AdminUser)[] = ["name", "email", "role"];

/**
 * Normalize text for indexing
 * Normalize text để indexing
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Tokenize text for indexing
 * Tokenize text để indexing
 */
function tokenizeText(text: string): string[] {
  const normalized = normalizeText(text);
  const tokens = normalized.split(" ").filter((token) => token.length > 0);

  // Add partial tokens for autocomplete
  const partialTokens: string[] = [];
  tokens.forEach((token) => {
    for (let i = 2; i <= token.length; i++) {
      partialTokens.push(token.substring(0, i));
    }
  });

  return [...tokens, ...partialTokens];
}

/**
 * Main useSearchOptimization hook
 * Hook chính cho search optimization
 */
export function useSearchOptimization(
  options: UseSearchOptimizationOptions = {}
): UseSearchOptimizationReturn {
  const {
    enableIndexing = true,
    enableCaching = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    maxCacheSize = 100,
    enableMetrics = true,
    indexFields = DEFAULT_INDEX_FIELDS,
  } = options;

  // State
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [metrics, setMetrics] = useState<SearchMetrics>({
    totalSearches: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageExecutionTime: 0,
    indexSize: 0,
    cacheSize: 0,
  });

  // Refs for persistent data
  const searchIndex = useRef<SearchIndex>({});
  const userMap = useRef<Map<string, AdminUser>>(new Map());
  const searchCache = useRef<SearchCache>({});
  const executionTimes = useRef<number[]>([]);

  /**
   * Build search index
   * Xây dựng search index
   */
  const buildIndex = useCallback(
    async (users: AdminUser[]) => {
      if (!enableIndexing) return;

      setIsIndexing(true);

      try {
        const newIndex: SearchIndex = {};
        const newUserMap = new Map<string, AdminUser>();

        // Process users in batches to avoid blocking UI
        const batchSize = 100;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);

          batch.forEach((user) => {
            newUserMap.set(user.id, user);

            // Index specified fields
            indexFields.forEach((field) => {
              const value = user[field];
              if (typeof value === "string" && value.trim()) {
                const tokens = tokenizeText(value);

                tokens.forEach((token) => {
                  if (!newIndex[token]) {
                    newIndex[token] = new Set();
                  }
                  newIndex[token].add(user.id);
                });
              }
            });
          });

          // Yield control to prevent blocking
          if (i + batchSize < users.length) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        searchIndex.current = newIndex;
        userMap.current = newUserMap;

        // Update metrics
        if (enableMetrics) {
          setMetrics((prev) => ({
            ...prev,
            indexSize: Object.keys(newIndex).length,
          }));
        }
      } finally {
        setIsIndexing(false);
      }
    },
    [enableIndexing, indexFields, enableMetrics]
  );

  /**
   * Clear search index
   * Xóa search index
   */
  const clearIndex = useCallback(() => {
    searchIndex.current = {};
    userMap.current.clear();

    if (enableMetrics) {
      setMetrics((prev) => ({ ...prev, indexSize: 0 }));
    }
  }, [enableMetrics]);

  /**
   * Get index size
   * Lấy kích thước index
   */
  const getIndexSize = useCallback(() => {
    return Object.keys(searchIndex.current).length;
  }, []);

  /**
   * Search using index
   * Tìm kiếm sử dụng index
   */
  const searchWithIndex = useCallback((query: string): AdminUser[] => {
    const normalizedQuery = normalizeText(query);
    const queryTokens = normalizedQuery.split(" ").filter((token) => token.length > 0);

    if (queryTokens.length === 0) return [];

    // Find user IDs that match all query tokens
    let matchingUserIds: Set<string> | null = null;

    queryTokens.forEach((token) => {
      const userIdsForToken = new Set<string>();

      // Find all index keys that start with this token
      Object.keys(searchIndex.current).forEach((indexKey) => {
        if (indexKey.startsWith(token)) {
          searchIndex.current[indexKey].forEach((userId) => {
            userIdsForToken.add(userId);
          });
        }
      });

      if (matchingUserIds === null) {
        matchingUserIds = userIdsForToken;
      } else {
        // Intersection: keep only user IDs that match all tokens
        matchingUserIds = new Set([...matchingUserIds].filter((id) => userIdsForToken.has(id)));
      }
    });

    // Convert user IDs to user objects
    const results: AdminUser[] = [];
    if (matchingUserIds) {
      (matchingUserIds as Set<string>).forEach((userId: string) => {
        const user = userMap.current.get(userId);
        if (user) {
          results.push(user);
        }
      });
    }

    return results;
  }, []);

  /**
   * Search without index (fallback)
   * Tìm kiếm không sử dụng index (fallback)
   */
  const searchWithoutIndex = useCallback(
    (query: string, users: AdminUser[]): AdminUser[] => {
      const normalizedQuery = normalizeText(query);

      return users.filter((user) => {
        return indexFields.some((field) => {
          const value = user[field];
          if (typeof value === "string") {
            return normalizeText(value).includes(normalizedQuery);
          }
          return false;
        });
      });
    },
    [indexFields]
  );

  /**
   * Get cached result
   * Lấy kết quả từ cache
   */
  const getCachedResult = useCallback(
    (query: string) => {
      if (!enableCaching) return null;

      const cached = searchCache.current[query];
      if (!cached) return null;

      // Check if cache is still valid
      if (Date.now() - cached.timestamp > cacheTimeout) {
        delete searchCache.current[query];
        return null;
      }

      return cached;
    },
    [enableCaching, cacheTimeout]
  );

  /**
   * Set cached result
   * Lưu kết quả vào cache
   */
  const setCachedResult = useCallback(
    (query: string, results: AdminUser[], executionTime: number) => {
      if (!enableCaching) return;

      // Limit cache size
      const cacheKeys = Object.keys(searchCache.current);
      if (cacheKeys.length >= maxCacheSize) {
        // Remove oldest entries
        const sortedKeys = cacheKeys.sort(
          (a, b) => searchCache.current[a].timestamp - searchCache.current[b].timestamp
        );
        const keysToRemove = sortedKeys.slice(0, Math.floor(maxCacheSize / 2));
        keysToRemove.forEach((key) => delete searchCache.current[key]);
      }

      searchCache.current[query] = {
        results,
        timestamp: Date.now(),
        executionTime,
      };
    },
    [enableCaching, maxCacheSize]
  );

  /**
   * Clear cache
   * Xóa cache
   */
  const clearCache = useCallback(() => {
    searchCache.current = {};

    if (enableMetrics) {
      setMetrics((prev) => ({ ...prev, cacheSize: 0 }));
    }
  }, [enableMetrics]);

  /**
   * Get cache size
   * Lấy kích thước cache
   */
  const getCacheSize = useCallback(() => {
    return Object.keys(searchCache.current).length;
  }, []);

  /**
   * Get cache hit rate
   * Lấy tỷ lệ cache hit
   */
  const getCacheHitRate = useCallback(() => {
    const { cacheHits, cacheMisses } = metrics;
    const total = cacheHits + cacheMisses;
    return total > 0 ? (cacheHits / total) * 100 : 0;
  }, [metrics]);

  /**
   * Update metrics
   * Cập nhật metrics
   */
  const updateMetrics = useCallback(
    (executionTime: number, fromCache: boolean) => {
      if (!enableMetrics) return;

      executionTimes.current.push(executionTime);

      // Keep only last 100 execution times for average calculation
      if (executionTimes.current.length > 100) {
        executionTimes.current = executionTimes.current.slice(-100);
      }

      const averageExecutionTime =
        executionTimes.current.reduce((sum, time) => sum + time, 0) / executionTimes.current.length;

      setMetrics((prev) => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        cacheHits: fromCache ? prev.cacheHits + 1 : prev.cacheHits,
        cacheMisses: fromCache ? prev.cacheMisses : prev.cacheMisses + 1,
        averageExecutionTime,
        cacheSize: Object.keys(searchCache.current).length,
      }));
    },
    [enableMetrics]
  );

  /**
   * Optimized search function
   * Hàm tìm kiếm được tối ưu
   */
  const optimizedSearch = useCallback(
    async (query: string, users: AdminUser[]) => {
      const startTime = performance.now();
      setIsSearching(true);

      try {
        // Check cache first
        const cached = getCachedResult(query);
        if (cached) {
          const executionTime = performance.now() - startTime;
          updateMetrics(executionTime, true);

          return {
            results: cached.results,
            executionTime: cached.executionTime,
            fromCache: true,
          };
        }

        // Perform search
        let results: AdminUser[];

        if (enableIndexing && Object.keys(searchIndex.current).length > 0) {
          results = searchWithIndex(query);
        } else {
          results = searchWithoutIndex(query, users);
        }

        const executionTime = performance.now() - startTime;

        // Cache results
        setCachedResult(query, results, executionTime);

        // Update metrics
        updateMetrics(executionTime, false);

        return {
          results,
          executionTime,
          fromCache: false,
        };
      } finally {
        setIsSearching(false);
      }
    },
    [
      enableIndexing,
      getCachedResult,
      setCachedResult,
      updateMetrics,
      searchWithIndex,
      searchWithoutIndex,
    ]
  );

  /**
   * Reset metrics
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    executionTimes.current = [];
    setMetrics({
      totalSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      indexSize: Object.keys(searchIndex.current).length,
      cacheSize: Object.keys(searchCache.current).length,
    });
  }, []);

  return {
    // Search function
    optimizedSearch,

    // Index management
    buildIndex,
    clearIndex,
    getIndexSize,

    // Cache management
    clearCache,
    getCacheSize,
    getCacheHitRate,

    // Metrics
    metrics,
    resetMetrics,

    // Status
    isIndexing,
    isSearching,
  };
}
