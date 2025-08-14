/**
 * useQuestionSorting Hook
 * Hook cho question sorting với persistence và URL sync
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SortConfig,
  SortColumn,
  QuestionSortKey,
  applySortConfig,
  updateSortConfig,
  removeSortColumn,
  getSortPreset,
  DEFAULT_SORT_CONFIG,
  SORT_PRESETS
} from '@/lib/utils/question-sorting';
import { Question } from '@/lib/types/question';

// ===== TYPES =====

export interface UseQuestionSortingOptions {
  initialConfig?: SortConfig;
  persistInUrl?: boolean;
  multiSort?: boolean;
  onSortChange?: (config: SortConfig) => void;
}

export interface UseQuestionSortingReturn {
  // Current state
  sortConfig: SortConfig;
  sortedQuestions: Question[];
  
  // Actions
  setSortConfig: (config: SortConfig) => void;
  addSortColumn: (key: QuestionSortKey, direction?: 'asc' | 'desc') => void;
  removeSortColumn: (key: string) => void;
  toggleSortDirection: (key: string) => void;
  applySortPreset: (presetName: keyof typeof SORT_PRESETS) => void;
  clearSort: () => void;
  
  // Utilities
  isSorted: boolean;
  sortSummary: string;
  canAddMoreColumns: boolean;
}

// ===== CONSTANTS =====

const MAX_SORT_COLUMNS = 5;
const URL_PARAM_KEY = 'sort';

// ===== HELPER FUNCTIONS =====

/**
 * Serialize sort config to URL string
 */
function serializeSortConfig(config: SortConfig): string {
  if (config.columns.length === 0) return '';
  
  return config.columns
    .sort((a, b) => a.priority - b.priority)
    .map(col => `${col.key}:${col.direction}`)
    .join(',');
}

/**
 * Deserialize sort config from URL string
 */
function deserializeSortConfig(sortString: string): SortConfig {
  if (!sortString) return DEFAULT_SORT_CONFIG;
  
  try {
    const columns: SortColumn[] = sortString
      .split(',')
      .map((part, index) => {
        const [key, direction] = part.split(':');
        return {
          key,
          direction: (direction as 'asc' | 'desc') || 'asc',
          priority: index
        };
      })
      .filter(col => col.key); // Filter out invalid entries
    
    return { columns };
  } catch (error) {
    console.warn('Error deserializing sort config:', error);
    return DEFAULT_SORT_CONFIG;
  }
}

// ===== MAIN HOOK =====

export function useQuestionSorting(
  questions: Question[],
  options: UseQuestionSortingOptions = {}
): UseQuestionSortingReturn {
  const {
    initialConfig = DEFAULT_SORT_CONFIG,
    persistInUrl = true,
    multiSort = true,
    onSortChange
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ===== STATE =====
  
  // Initialize sort config từ URL hoặc initial config
  const [sortConfig, setSortConfigState] = useState<SortConfig>(() => {
    if (persistInUrl) {
      const urlSort = searchParams.get(URL_PARAM_KEY);
      if (urlSort) {
        return deserializeSortConfig(urlSort);
      }
    }
    return initialConfig;
  });
  
  // ===== COMPUTED VALUES =====
  
  // Apply sorting to questions
  const sortedQuestions = useMemo(() => {
    if (sortConfig.columns.length === 0) {
      return questions;
    }
    return applySortConfig(questions, sortConfig);
  }, [questions, sortConfig]);
  
  // Check if any sorting is applied
  const isSorted = sortConfig.columns.length > 0;
  
  // Get sort summary
  const sortSummary = useMemo(() => {
    if (!isSorted) return 'Không có sắp xếp';
    
    const sortedColumns = [...sortConfig.columns].sort((a, b) => a.priority - b.priority);
    return sortedColumns
      .map(col => `${col.key} ${col.direction === 'asc' ? '↑' : '↓'}`)
      .join(', ');
  }, [sortConfig, isSorted]);
  
  // Check if can add more columns
  const canAddMoreColumns = sortConfig.columns.length < MAX_SORT_COLUMNS;
  
  // ===== EFFECTS =====
  
  // Sync sort config to URL
  useEffect(() => {
    if (!persistInUrl) return;
    
    const currentParams = new URLSearchParams(searchParams.toString());
    const sortString = serializeSortConfig(sortConfig);
    
    if (sortString) {
      currentParams.set(URL_PARAM_KEY, sortString);
    } else {
      currentParams.delete(URL_PARAM_KEY);
    }
    
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [sortConfig, persistInUrl, router, searchParams]);
  
  // Call onSortChange callback
  useEffect(() => {
    onSortChange?.(sortConfig);
  }, [sortConfig, onSortChange]);
  
  // ===== ACTIONS =====
  
  /**
   * Set sort config
   */
  const setSortConfig = useCallback((config: SortConfig) => {
    setSortConfigState(config);
  }, []);
  
  /**
   * Add sort column
   */
  const addSortColumn = useCallback((
    key: QuestionSortKey, 
    direction: 'asc' | 'desc' = 'asc'
  ) => {
    if (!canAddMoreColumns) {
      console.warn('Maximum sort columns reached');
      return;
    }
    
    const newColumn: SortColumn = { key, direction, priority: 0 };
    const newConfig = updateSortConfig(sortConfig, newColumn, multiSort);
    setSortConfigState(newConfig);
  }, [sortConfig, multiSort, canAddMoreColumns]);
  
  /**
   * Remove sort column
   */
  const removeSortColumnAction = useCallback((key: string) => {
    const newConfig = removeSortColumn(sortConfig, key);
    setSortConfigState(newConfig);
  }, [sortConfig]);
  
  /**
   * Toggle sort direction
   */
  const toggleSortDirection = useCallback((key: string) => {
    const column = sortConfig.columns.find(col => col.key === key);
    if (!column) return;
    
    const updatedColumn: SortColumn = {
      ...column,
      direction: column.direction === 'asc' ? 'desc' : 'asc'
    };
    
    const newConfig = updateSortConfig(sortConfig, updatedColumn, multiSort);
    setSortConfigState(newConfig);
  }, [sortConfig, multiSort]);
  
  /**
   * Apply sort preset
   */
  const applySortPreset = useCallback((presetName: keyof typeof SORT_PRESETS) => {
    const presetColumns = getSortPreset(presetName);
    const newConfig: SortConfig = {
      ...sortConfig,
      columns: presetColumns
    };
    setSortConfigState(newConfig);
  }, [sortConfig]);
  
  /**
   * Clear all sorting
   */
  const clearSort = useCallback(() => {
    setSortConfigState({ columns: [] });
  }, []);
  
  // ===== RETURN =====
  
  return {
    // Current state
    sortConfig,
    sortedQuestions,
    
    // Actions
    setSortConfig,
    addSortColumn,
    removeSortColumn: removeSortColumnAction,
    toggleSortDirection,
    applySortPreset,
    clearSort,
    
    // Utilities
    isSorted,
    sortSummary,
    canAddMoreColumns
  };
}
