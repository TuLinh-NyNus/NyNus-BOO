/**
 * useBulkSelection Hook
 * Advanced bulk selection logic với smart patterns và keyboard shortcuts
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Question } from '@/types/question';

// ===== TYPES =====

export type BulkSelectionPattern = 
  | 'all'
  | 'none'
  | 'invert'
  | 'visible'
  | 'filtered'
  | 'by-type'
  | 'by-difficulty'
  | 'by-status'
  | 'by-grade'
  | 'by-subject'
  | 'by-date-range';

export interface BulkSelectionCriteria {
  pattern: BulkSelectionPattern;
  value?: string | string[] | { from: Date; to: Date };
}

export interface UseBulkSelectionOptions {
  enableKeyboardShortcuts?: boolean;
  maxSelectionCount?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
  onMaxSelectionReached?: () => void;
}

export interface UseBulkSelectionReturn {
  // Current state
  selectedIds: string[];
  selectedCount: number;
  isAllSelected: boolean;
  isNoneSelected: boolean;
  hasSelection: boolean;
  
  // Selection actions
  selectAll: () => void;
  selectNone: () => void;
  selectInvert: () => void;
  selectVisible: () => void;
  selectByPattern: (criteria: BulkSelectionCriteria) => void;
  
  // Individual selection
  toggleSelection: (id: string) => void;
  selectRange: (startId: string, endId: string) => void;
  isSelected: (id: string) => boolean;
  
  // Smart selection
  selectByType: (type: string) => void;
  selectByDifficulty: (difficulty: string) => void;
  selectByStatus: (status: string) => void;
  selectByGrade: (grade: string) => void;
  selectBySubject: (subject: string) => void;
  selectByDateRange: (from: Date, to: Date) => void;
  
  // Utilities
  getSelectionSummary: () => string;
  canSelectMore: boolean;
  selectionPercentage: number;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_SELECTION = 1000;

// ===== HELPER FUNCTIONS =====

/**
 * Check if question matches criteria
 */
function questionMatchesCriteria(
  question: Question,
  criteria: BulkSelectionCriteria
): boolean {
  switch (criteria.pattern) {
    case 'by-type':
      return question.type === criteria.value;
    
    case 'by-difficulty':
      return question.difficulty === criteria.value;
    
    case 'by-status':
      return question.status === criteria.value;
    
    case 'by-grade':
      // Extract grade từ questionCodeId
      const gradeMatch = question.questionCodeId?.match(/^(\d+)/);
      return gradeMatch ? gradeMatch[1] === criteria.value : false;
    
    case 'by-subject':
      // Extract subject từ questionCodeId
      const subjectMatch = question.questionCodeId?.match(/^\d+([A-Z]+)/);
      return subjectMatch ? subjectMatch[1] === criteria.value : false;
    
    case 'by-date-range':
      if (!criteria.value || typeof criteria.value !== 'object' || !('from' in criteria.value)) {
        return false;
      }
      const { from, to } = criteria.value as { from: Date; to: Date };
      const questionDate = new Date(question.createdAt);
      return questionDate >= from && questionDate <= to;
    
    default:
      return false;
  }
}

/**
 * Get selection summary text
 */
function getSelectionSummaryText(
  selectedCount: number,
  totalCount: number,
  questions: Question[],
  selectedIds: string[]
): string {
  if (selectedCount === 0) {
    return 'Chưa chọn câu hỏi nào';
  }
  
  if (selectedCount === totalCount) {
    return `Đã chọn tất cả ${totalCount} câu hỏi`;
  }
  
  // Analyze selection patterns
  const selectedQuestions = questions.filter(q => selectedIds.includes(q.id));
  
  // Check if all selected questions have same type
  const types = [...new Set(selectedQuestions.map(q => q.type))];
  if (types.length === 1) {
    return `Đã chọn ${selectedCount} câu hỏi ${types[0]}`;
  }
  
  // Check if all selected questions have same difficulty
  const difficulties = [...new Set(selectedQuestions.map(q => q.difficulty))];
  if (difficulties.length === 1) {
    return `Đã chọn ${selectedCount} câu hỏi độ khó ${difficulties[0]}`;
  }
  
  return `Đã chọn ${selectedCount}/${totalCount} câu hỏi`;
}

// ===== MAIN HOOK =====

export function useBulkSelection(
  questions: Question[],
  options: UseBulkSelectionOptions = {}
): UseBulkSelectionReturn {
  const {
    enableKeyboardShortcuts = true,
    maxSelectionCount = DEFAULT_MAX_SELECTION,
    onSelectionChange,
    onMaxSelectionReached
  } = options;
  
  // ===== STATE =====
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [, setLastSelectedId] = useState<string | null>(null);
  
  // ===== COMPUTED VALUES =====
  
  const selectedCount = selectedIds.length;
  const totalCount = questions.length;
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;
  const isNoneSelected = selectedCount === 0;
  const hasSelection = selectedCount > 0;
  const canSelectMore = selectedCount < maxSelectionCount;
  const selectionPercentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;
  
  // ===== EFFECTS =====
  
  // Call onSelectionChange callback
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A - Select all
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectAll();
      }
      
      // Ctrl+D - Deselect all
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        selectNone();
      }
      
      // Ctrl+I - Invert selection
      if (event.ctrlKey && event.key === 'i') {
        event.preventDefault();
        selectInvert();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableKeyboardShortcuts]);
  
  // ===== SELECTION ACTIONS =====
  
  /**
   * Select all questions
   */
  const selectAll = useCallback(() => {
    const allIds = questions.map(q => q.id);
    const limitedIds = allIds.slice(0, maxSelectionCount);
    
    setSelectedIds(limitedIds);
    
    if (allIds.length > maxSelectionCount) {
      onMaxSelectionReached?.();
    }
  }, [questions, maxSelectionCount, onMaxSelectionReached]);
  
  /**
   * Select none
   */
  const selectNone = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedId(null);
  }, []);
  
  /**
   * Invert selection
   */
  const selectInvert = useCallback(() => {
    const allIds = questions.map(q => q.id);
    const newSelection = allIds.filter(id => !selectedIds.includes(id));
    const limitedSelection = newSelection.slice(0, maxSelectionCount);
    
    setSelectedIds(limitedSelection);
    
    if (newSelection.length > maxSelectionCount) {
      onMaxSelectionReached?.();
    }
  }, [questions, selectedIds, maxSelectionCount, onMaxSelectionReached]);
  
  /**
   * Select visible questions (same as selectAll for now)
   */
  const selectVisible = useCallback(() => {
    selectAll();
  }, [selectAll]);
  
  /**
   * Select by pattern
   */
  const selectByPattern = useCallback((criteria: BulkSelectionCriteria) => {
    const matchingQuestions = questions.filter(q => 
      questionMatchesCriteria(q, criteria)
    );
    const matchingIds = matchingQuestions.map(q => q.id);
    const limitedIds = matchingIds.slice(0, maxSelectionCount);
    
    setSelectedIds(limitedIds);
    
    if (matchingIds.length > maxSelectionCount) {
      onMaxSelectionReached?.();
    }
  }, [questions, maxSelectionCount, onMaxSelectionReached]);
  
  // ===== INDIVIDUAL SELECTION =====
  
  /**
   * Toggle individual selection
   */
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const isCurrentlySelected = prev.includes(id);
      
      if (isCurrentlySelected) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        if (prev.length >= maxSelectionCount) {
          onMaxSelectionReached?.();
          return prev;
        }
        return [...prev, id];
      }
    });
    
    setLastSelectedId(id);
  }, [maxSelectionCount, onMaxSelectionReached]);
  
  /**
   * Select range từ startId đến endId
   */
  const selectRange = useCallback((startId: string, endId: string) => {
    const startIndex = questions.findIndex(q => q.id === startId);
    const endIndex = questions.findIndex(q => q.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    const rangeIds = questions
      .slice(minIndex, maxIndex + 1)
      .map(q => q.id);
    
    const limitedIds = rangeIds.slice(0, maxSelectionCount);
    
    setSelectedIds(prev => {
      const newSelection = [...new Set([...prev, ...limitedIds])];
      return newSelection.slice(0, maxSelectionCount);
    });
    
    if (rangeIds.length > maxSelectionCount) {
      onMaxSelectionReached?.();
    }
  }, [questions, maxSelectionCount, onMaxSelectionReached]);
  
  /**
   * Check if question is selected
   */
  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);
  
  // ===== SMART SELECTION =====
  
  const selectByType = useCallback((type: string) => {
    selectByPattern({ pattern: 'by-type', value: type });
  }, [selectByPattern]);
  
  const selectByDifficulty = useCallback((difficulty: string) => {
    selectByPattern({ pattern: 'by-difficulty', value: difficulty });
  }, [selectByPattern]);
  
  const selectByStatus = useCallback((status: string) => {
    selectByPattern({ pattern: 'by-status', value: status });
  }, [selectByPattern]);
  
  const selectByGrade = useCallback((grade: string) => {
    selectByPattern({ pattern: 'by-grade', value: grade });
  }, [selectByPattern]);
  
  const selectBySubject = useCallback((subject: string) => {
    selectByPattern({ pattern: 'by-subject', value: subject });
  }, [selectByPattern]);
  
  const selectByDateRange = useCallback((from: Date, to: Date) => {
    selectByPattern({ pattern: 'by-date-range', value: { from, to } });
  }, [selectByPattern]);
  
  // ===== UTILITIES =====
  
  const getSelectionSummary = useCallback(() => {
    return getSelectionSummaryText(selectedCount, totalCount, questions, selectedIds);
  }, [selectedCount, totalCount, questions, selectedIds]);
  
  // ===== RETURN =====
  
  return {
    // Current state
    selectedIds,
    selectedCount,
    isAllSelected,
    isNoneSelected,
    hasSelection,
    
    // Selection actions
    selectAll,
    selectNone,
    selectInvert,
    selectVisible,
    selectByPattern,
    
    // Individual selection
    toggleSelection,
    selectRange,
    isSelected,
    
    // Smart selection
    selectByType,
    selectByDifficulty,
    selectByStatus,
    selectByGrade,
    selectBySubject,
    selectByDateRange,
    
    // Utilities
    getSelectionSummary,
    canSelectMore,
    selectionPercentage
  };
}
