/**
 * useSearchSuggestions Hook
 * Hook cho search suggestions và autocomplete functionality
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { AdminUser } from "../types/admin-user";

/**
 * Search suggestion interface
 * Interface cho search suggestion
 */
export interface SearchSuggestion {
  id: string;
  type: "user" | "email" | "role" | "recent";
  value: string;
  label: string;
  description?: string;
  metadata?: any;
}

/**
 * Search suggestions options
 * Options cho search suggestions
 */
interface UseSearchSuggestionsOptions {
  maxSuggestions?: number;
  enableUserSuggestions?: boolean;
  enableEmailSuggestions?: boolean;
  enableRoleSuggestions?: boolean;
  enableRecentSearches?: boolean;
  minQueryLength?: number;
}

/**
 * Search suggestions return interface
 * Interface cho return của search suggestions
 */
interface UseSearchSuggestionsReturn {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  clearSuggestions: () => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Recent searches
  recentSearches: string[];
}

/**
 * Default role suggestions
 * Suggestions mặc định cho roles
 */
const DEFAULT_ROLE_SUGGESTIONS: SearchSuggestion[] = [
  {
    id: "role-admin",
    type: "role",
    value: "role:ADMIN",
    label: "Quản trị viên",
    description: "Tìm kiếm theo vai trò Admin",
  },
  {
    id: "role-teacher",
    type: "role",
    value: "role:TEACHER",
    label: "Giáo viên",
    description: "Tìm kiếm theo vai trò Giáo viên",
  },
  {
    id: "role-tutor",
    type: "role",
    value: "role:TUTOR",
    label: "Gia sư",
    description: "Tìm kiếm theo vai trò Gia sư",
  },
  {
    id: "role-student",
    type: "role",
    value: "role:STUDENT",
    label: "Học viên",
    description: "Tìm kiếm theo vai trò Học viên",
  },
];

/**
 * Storage key for recent searches
 * Key lưu trữ cho recent searches
 */
const RECENT_SEARCHES_KEY = "admin-search-recent";

/**
 * Main useSearchSuggestions hook
 * Hook chính cho search suggestions
 */
export function useSearchSuggestions(
  users: AdminUser[] = [],
  options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsReturn {
  const {
    maxSuggestions = 10,
    enableUserSuggestions = true,
    enableEmailSuggestions = true,
    enableRoleSuggestions = true,
    enableRecentSearches = true,
    minQueryLength = 2,
  } = options;

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  /**
   * Load recent searches from localStorage
   * Load recent searches từ localStorage
   */
  const loadRecentSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn("Failed to load recent searches:", error);
    }
  }, []);

  /**
   * Save recent searches to localStorage
   * Lưu recent searches vào localStorage
   */
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.warn("Failed to save recent searches:", error);
    }
  }, []);

  /**
   * Generate user suggestions
   * Tạo user suggestions
   */
  const generateUserSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!enableUserSuggestions || !query.trim()) return [];

      const lowerQuery = query.toLowerCase();
      const userSuggestions: SearchSuggestion[] = [];

      for (const user of users) {
        if (userSuggestions.length >= maxSuggestions / 2) break;

        // Match by name
        if (user.name?.toLowerCase().includes(lowerQuery)) {
          userSuggestions.push({
            id: `user-${user.id}`,
            type: "user",
            value: user.name,
            label: user.name,
            description: `${user.email} - ${user.role}`,
            metadata: { userId: user.id, userRole: user.role },
          });
        }
      }

      return userSuggestions;
    },
    [users, enableUserSuggestions, maxSuggestions]
  );

  /**
   * Generate email suggestions
   * Tạo email suggestions
   */
  const generateEmailSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!enableEmailSuggestions || !query.trim()) return [];

      const lowerQuery = query.toLowerCase();
      const emailSuggestions: SearchSuggestion[] = [];

      for (const user of users) {
        if (emailSuggestions.length >= maxSuggestions / 2) break;

        // Match by email
        if (user.email.toLowerCase().includes(lowerQuery)) {
          emailSuggestions.push({
            id: `email-${user.id}`,
            type: "email",
            value: user.email,
            label: user.email,
            description: `${user.name} - ${user.role}`,
            metadata: { userId: user.id, userRole: user.role },
          });
        }
      }

      return emailSuggestions;
    },
    [users, enableEmailSuggestions, maxSuggestions]
  );

  /**
   * Generate role suggestions
   * Tạo role suggestions
   */
  const generateRoleSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!enableRoleSuggestions || !query.trim()) return [];

      const lowerQuery = query.toLowerCase();

      return DEFAULT_ROLE_SUGGESTIONS.filter(
        (suggestion) =>
          suggestion.label.toLowerCase().includes(lowerQuery) ||
          suggestion.value.toLowerCase().includes(lowerQuery)
      );
    },
    [enableRoleSuggestions]
  );

  /**
   * Generate recent search suggestions
   * Tạo recent search suggestions
   */
  const generateRecentSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!enableRecentSearches) return [];

      const lowerQuery = query.toLowerCase();

      return recentSearches
        .filter(
          (search) =>
            search.toLowerCase().includes(lowerQuery) && search.toLowerCase() !== lowerQuery
        )
        .slice(0, 3)
        .map((search, index) => ({
          id: `recent-${index}`,
          type: "recent" as const,
          value: search,
          label: search,
          description: "Tìm kiếm gần đây",
        }));
    },
    [recentSearches, enableRecentSearches]
  );

  /**
   * Get suggestions for query
   * Lấy suggestions cho query
   */
  const getSuggestions = useCallback(
    async (query: string): Promise<SearchSuggestion[]> => {
      if (!query.trim() || query.length < minQueryLength) {
        setSuggestions([]);
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay for realistic UX
        await new Promise((resolve) => setTimeout(resolve, 50));

        const allSuggestions: SearchSuggestion[] = [
          ...generateRecentSuggestions(query),
          ...generateUserSuggestions(query),
          ...generateEmailSuggestions(query),
          ...generateRoleSuggestions(query),
        ];

        // Remove duplicates and limit results
        const uniqueSuggestions = allSuggestions
          .filter(
            (suggestion, index, array) =>
              array.findIndex((s) => s.value === suggestion.value) === index
          )
          .slice(0, maxSuggestions);

        setSuggestions(uniqueSuggestions);
        return uniqueSuggestions;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to get suggestions";
        setError(errorMessage);
        setSuggestions([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [
      minQueryLength,
      maxSuggestions,
      generateRecentSuggestions,
      generateUserSuggestions,
      generateEmailSuggestions,
      generateRoleSuggestions,
    ]
  );

  /**
   * Clear suggestions
   * Xóa suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  /**
   * Add recent search
   * Thêm recent search
   */
  const addRecentSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !enableRecentSearches) return;

      const trimmedQuery = query.trim();
      const updatedSearches = [
        trimmedQuery,
        ...recentSearches.filter((search) => search !== trimmedQuery),
      ].slice(0, 10); // Keep only last 10 searches

      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
    },
    [recentSearches, enableRecentSearches, saveRecentSearches]
  );

  /**
   * Remove recent search
   * Xóa recent search
   */
  const removeRecentSearch = useCallback(
    (query: string) => {
      const updatedSearches = recentSearches.filter((search) => search !== query);
      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
    },
    [recentSearches, saveRecentSearches]
  );

  /**
   * Clear recent searches
   * Xóa tất cả recent searches
   */
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecentSearches([]);
  }, [saveRecentSearches]);

  /**
   * Load recent searches on mount
   * Load recent searches khi mount
   */
  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  return {
    suggestions,
    isLoading,
    error,

    // Actions
    getSuggestions,
    clearSuggestions,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,

    // Recent searches
    recentSearches,
  };
}
