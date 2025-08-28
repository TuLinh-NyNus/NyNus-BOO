/**
 * Public Question Filters Store
 * Zustand store cho public question filtering state theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import {
  PublicQuestionFilters,
  DEFAULT_PUBLIC_QUESTION_FILTERS,
  PublicQuestionSortBy,
  QuestionType,
  QuestionDifficulty
} from '@/lib/types/public';

// ===== STORE INTERFACES =====

/**
 * Public Question Filters State Interface
 * State interface cho public question filters store
 */
interface PublicQuestionFiltersState {
  // Current filter state
  filters: PublicQuestionFilters;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Search state
  searchQuery: string;
  searchHistory: string[];
  searchSuggestions: string[];
  
  // Results state
  resultCount: number;
  hasResults: boolean;
  
  // Filter actions
  setFilters: (filters: Partial<PublicQuestionFilters>) => void;
  updateFilter: <K extends keyof PublicQuestionFilters>(
    key: K, 
    value: PublicQuestionFilters[K]
  ) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof PublicQuestionFilters) => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setSearchSuggestions: (suggestions: string[]) => void;
  
  // Sorting actions
  setSorting: (sortBy: PublicQuestionSortBy, sortDir?: 'asc' | 'desc') => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Category/Subject/Grade actions
  toggleCategory: (category: string) => void;
  toggleSubject: (subject: string) => void;
  toggleGrade: (grade: string) => void;
  toggleType: (type: QuestionType) => void;
  toggleDifficulty: (difficulty: QuestionDifficulty) => void;
  
  // State management actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResultCount: (count: number) => void;
  setHasResults: (hasResults: boolean) => void;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Toggle array item
 * Add/remove item from array
 */
function toggleArrayItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  } else {
    return array.filter((_, i) => i !== index);
  }
}

/**
 * Validate search query
 * Basic validation cho search query
 */
function validateSearchQuery(query: string): boolean {
  return query.trim().length >= 2 && query.trim().length <= 100;
}

// ===== STORE IMPLEMENTATION =====

/**
 * Public Question Filters Store
 * Zustand store với persistence và devtools
 */
export const usePublicQuestionFiltersStore = create<PublicQuestionFiltersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filters: { ...DEFAULT_PUBLIC_QUESTION_FILTERS },
        isLoading: false,
        error: null,
        searchQuery: '',
        searchHistory: [],
        searchSuggestions: [],
        resultCount: 0,
        hasResults: false,

        // Filter actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            error: null
          }));
        },

        updateFilter: (key, value) => {
          set((state) => ({
            filters: { ...state.filters, [key]: value },
            error: null
          }));
        },

        resetFilters: () => {
          set({
            filters: { ...DEFAULT_PUBLIC_QUESTION_FILTERS },
            searchQuery: '',
            error: null,
            resultCount: 0,
            hasResults: false
          });
        },

        clearFilter: (key) => {
          set((state) => {
            const newFilters = { ...state.filters };
            
            // Reset specific filter to default value
            switch (key) {
              case 'keyword':
                newFilters.keyword = '';
                break;
              case 'category':
              case 'subject':
              case 'grade':
              case 'type':
              case 'difficulty':
              case 'tags':
                newFilters[key] = [];
                break;
              case 'hasAnswers':
              case 'hasSolution':
                newFilters[key] = undefined;
                break;
              case 'sortBy':
                newFilters.sortBy = 'newest';
                break;
              case 'sortDir':
                newFilters.sortDir = 'desc';
                break;
              case 'page':
                newFilters.page = 1;
                break;
              case 'limit':
                newFilters.limit = 20;
                break;
              default:
                delete newFilters[key];
            }

            return {
              filters: newFilters,
              error: null
            };
          });
        },

        // Search actions
        setSearchQuery: (query) => {
          set((state) => ({
            searchQuery: query,
            filters: { ...state.filters, keyword: query, page: 1 },
            error: null
          }));
        },

        addToSearchHistory: (query) => {
          if (!validateSearchQuery(query)) return;

          set((state) => {
            const trimmedQuery = query.trim();
            const newHistory = [
              trimmedQuery,
              ...state.searchHistory.filter(h => h !== trimmedQuery)
            ].slice(0, 10); // Keep only last 10 searches

            return { searchHistory: newHistory };
          });
        },

        clearSearchHistory: () => {
          set({ searchHistory: [] });
        },

        setSearchSuggestions: (suggestions) => {
          set({ searchSuggestions: suggestions });
        },

        // Sorting actions
        setSorting: (sortBy, sortDir = 'desc') => {
          set((state) => ({
            filters: {
              ...state.filters,
              sortBy,
              sortDir,
              page: 1 // Reset to first page when sorting changes
            },
            error: null
          }));
        },

        // Pagination actions
        setPage: (page) => {
          set((state) => ({
            filters: { ...state.filters, page: Math.max(1, page) },
            error: null
          }));
        },

        setLimit: (limit) => {
          set((state) => ({
            filters: { 
              ...state.filters, 
              limit: Math.max(1, Math.min(100, limit)), // Limit between 1-100
              page: 1 // Reset to first page when limit changes
            },
            error: null
          }));
        },

        nextPage: () => {
          const { filters } = get();
          const currentPage = filters.page || 1;
          set((state) => ({
            filters: { ...state.filters, page: currentPage + 1 },
            error: null
          }));
        },

        previousPage: () => {
          const { filters } = get();
          const currentPage = filters.page || 1;
          if (currentPage > 1) {
            set((state) => ({
              filters: { ...state.filters, page: currentPage - 1 },
              error: null
            }));
          }
        },

        // Toggle actions
        toggleCategory: (category) => {
          set((state) => ({
            filters: {
              ...state.filters,
              category: toggleArrayItem(state.filters.category || [], category),
              page: 1
            },
            error: null
          }));
        },

        toggleSubject: (subject) => {
          set((state) => ({
            filters: {
              ...state.filters,
              subject: toggleArrayItem(state.filters.subject || [], subject),
              page: 1
            },
            error: null
          }));
        },

        toggleGrade: (grade) => {
          set((state) => ({
            filters: {
              ...state.filters,
              grade: toggleArrayItem(state.filters.grade || [], grade),
              page: 1
            },
            error: null
          }));
        },

        toggleType: (type) => {
          set((state) => ({
            filters: {
              ...state.filters,
              type: toggleArrayItem(state.filters.type || [], type),
              page: 1
            },
            error: null
          }));
        },

        toggleDifficulty: (difficulty) => {
          set((state) => ({
            filters: {
              ...state.filters,
              difficulty: toggleArrayItem(state.filters.difficulty || [], difficulty),
              page: 1
            },
            error: null
          }));
        },

        // State management actions
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error, isLoading: false });
        },

        setResultCount: (count) => {
          set({ 
            resultCount: count,
            hasResults: count > 0
          });
        },

        setHasResults: (hasResults) => {
          set({ hasResults });
        }
      }),
      {
        name: 'public-question-filters',
        partialize: (state) => ({
          filters: state.filters,
          searchHistory: state.searchHistory
        })
      }
    ),
    {
      name: 'PublicQuestionFiltersStore'
    }
  )
);

// ===== STORE SELECTORS =====

/**
 * Store selectors cho optimized re-renders
 */
export const publicQuestionFiltersSelectors = {
  // Filter selectors
  filters: (state: PublicQuestionFiltersState) => state.filters,
  keyword: (state: PublicQuestionFiltersState) => state.filters.keyword,
  category: (state: PublicQuestionFiltersState) => state.filters.category,
  subject: (state: PublicQuestionFiltersState) => state.filters.subject,
  grade: (state: PublicQuestionFiltersState) => state.filters.grade,
  type: (state: PublicQuestionFiltersState) => state.filters.type,
  difficulty: (state: PublicQuestionFiltersState) => state.filters.difficulty,
  sorting: (state: PublicQuestionFiltersState) => ({
    sortBy: state.filters.sortBy,
    sortDir: state.filters.sortDir
  }),
  pagination: (state: PublicQuestionFiltersState) => ({
    page: state.filters.page,
    limit: state.filters.limit
  }),

  // UI selectors
  isLoading: (state: PublicQuestionFiltersState) => state.isLoading,
  error: (state: PublicQuestionFiltersState) => state.error,
  searchQuery: (state: PublicQuestionFiltersState) => state.searchQuery,
  searchHistory: (state: PublicQuestionFiltersState) => state.searchHistory,
  resultCount: (state: PublicQuestionFiltersState) => state.resultCount,
  hasResults: (state: PublicQuestionFiltersState) => state.hasResults,

  // Computed selectors
  hasActiveFilters: (state: PublicQuestionFiltersState) => {
    const { filters } = state;
    return !!(
      filters.keyword ||
      (filters.category && filters.category.length > 0) ||
      (filters.subject && filters.subject.length > 0) ||
      (filters.grade && filters.grade.length > 0) ||
      (filters.type && filters.type.length > 0) ||
      (filters.difficulty && filters.difficulty.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      filters.hasAnswers !== undefined ||
      filters.hasSolution !== undefined
    );
  },

  activeFilterCount: (state: PublicQuestionFiltersState) => {
    const { filters } = state;
    let count = 0;
    
    if (filters.keyword) count++;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.subject && filters.subject.length > 0) count++;
    if (filters.grade && filters.grade.length > 0) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.difficulty && filters.difficulty.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.hasAnswers !== undefined) count++;
    if (filters.hasSolution !== undefined) count++;
    
    return count;
  }
};
