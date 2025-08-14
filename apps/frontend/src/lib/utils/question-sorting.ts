/**
 * Question Sorting Utilities
 * Advanced sorting logic cho question lists với multi-column support
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question } from '@/lib/types/question';

// ===== TYPES =====

export type SortDirection = 'asc' | 'desc';

export interface SortColumn {
  key: string;
  direction: SortDirection;
  priority: number; // 0 = highest priority
}

export interface SortConfig {
  columns: SortColumn[];
  defaultSort?: SortColumn[];
}

export type QuestionSortKey = 
  | 'questionCode'
  | 'content'
  | 'type'
  | 'difficulty'
  | 'status'
  | 'grade'
  | 'subject'
  | 'chapter'
  | 'level'
  | 'lesson'
  | 'form'
  | 'creator'
  | 'createdAt'
  | 'updatedAt'
  | 'usageCount'
  | 'feedbackScore';

// ===== CONSTANTS =====

export const DEFAULT_SORT_CONFIG: SortConfig = {
  columns: [
    { key: 'questionCode', direction: 'asc', priority: 0 }
  ],
  defaultSort: [
    { key: 'questionCode', direction: 'asc', priority: 0 }
  ]
};

export const SORT_PRESETS = {
  DEFAULT: [
    { key: 'questionCode', direction: 'asc' as SortDirection, priority: 0 }
  ],
  NEWEST_FIRST: [
    { key: 'createdAt', direction: 'desc' as SortDirection, priority: 0 }
  ],
  MOST_USED: [
    { key: 'usageCount', direction: 'desc' as SortDirection, priority: 0 },
    { key: 'questionCode', direction: 'asc' as SortDirection, priority: 1 }
  ],
  HIGHEST_RATED: [
    { key: 'feedbackScore', direction: 'desc' as SortDirection, priority: 0 },
    { key: 'questionCode', direction: 'asc' as SortDirection, priority: 1 }
  ],
  BY_DIFFICULTY: [
    { key: 'difficulty', direction: 'asc' as SortDirection, priority: 0 },
    { key: 'questionCode', direction: 'asc' as SortDirection, priority: 1 }
  ],
  BY_SUBJECT: [
    { key: 'subject', direction: 'asc' as SortDirection, priority: 0 },
    { key: 'grade', direction: 'asc' as SortDirection, priority: 1 },
    { key: 'questionCode', direction: 'asc' as SortDirection, priority: 2 }
  ]
};

// ===== HELPER FUNCTIONS =====

/**
 * Parse QuestionCode để extract sorting components
 * Format: 0P1N1 hoặc 1L2V2-1
 */
function parseQuestionCode(questionCode: string): {
  grade: number;
  subject: string;
  chapter: number;
  level: number;
  lesson?: number;
  form?: number;
} {
  // Default values
  const result = {
    grade: 0,
    subject: '',
    chapter: 0,
    level: 0,
    lesson: 0,
    form: 0
  };

  try {
    // Pattern cho ID5: 0P1N1 (Grade + Subject + Chapter + Level)
    const id5Pattern = /^(\d+)([A-Z]+)(\d+)([A-Z]+)(\d+)$/;
    const id5Match = questionCode.match(id5Pattern);
    
    if (id5Match) {
      result.grade = parseInt(id5Match[1]);
      result.subject = id5Match[2];
      result.chapter = parseInt(id5Match[3]);
      result.level = parseInt(id5Match[5]);
      return result;
    }

    // Pattern cho ID6: 1L2V2-1 (Grade + Subject + Chapter + Level + Lesson + Form)
    const id6Pattern = /^(\d+)([A-Z]+)(\d+)([A-Z]+)(\d+)-(\d+)$/;
    const id6Match = questionCode.match(id6Pattern);
    
    if (id6Match) {
      result.grade = parseInt(id6Match[1]);
      result.subject = id6Match[2];
      result.chapter = parseInt(id6Match[3]);
      result.level = parseInt(id6Match[5]);
      result.lesson = parseInt(id6Match[6]);
      return result;
    }
  } catch (error) {
    console.warn('Error parsing QuestionCode:', questionCode, error);
  }

  return result;
}

/**
 * Get sortable value từ question object
 */
function getSortableValue(question: Question, sortKey: QuestionSortKey): string | number | Date | { grade: number; subject: string; chapter: number; level: number; lesson?: number; form?: number } {
  switch (sortKey) {
    case 'questionCode':
      return parseQuestionCode(question.questionCodeId || '');

    case 'content':
      return question.content?.toLowerCase() || '';

    case 'type':
      return question.type || '';

    case 'difficulty':
      // Convert difficulty to numeric for sorting
      const difficultyMap = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
      return difficultyMap[question.difficulty as keyof typeof difficultyMap] || 0;

    case 'status':
      return question.status || '';

    case 'grade':
      return parseQuestionCode(question.questionCodeId || '').grade;

    case 'subject':
      return parseQuestionCode(question.questionCodeId || '').subject;

    case 'chapter':
      return parseQuestionCode(question.questionCodeId || '').chapter;

    case 'level':
      return parseQuestionCode(question.questionCodeId || '').level;

    case 'lesson':
      return parseQuestionCode(question.questionCodeId || '').lesson || 0;

    case 'form':
      return parseQuestionCode(question.questionCodeId || '').form || 0;

    case 'creator':
      return question.creator?.toLowerCase() || '';

    case 'createdAt':
      return new Date(question.createdAt || 0).getTime();

    case 'updatedAt':
      return new Date(question.updatedAt || 0).getTime();

    case 'usageCount':
      return question.usageCount || 0;

    case 'feedbackScore':
      return question.feedback || 0; // Use feedback field instead of feedbackScore

    default:
      return '';
  }
}

// Type guard for question code object
function isQuestionCodeObject(value: unknown): value is { grade: number; subject: string; chapter: number; level: number; lesson?: number; form?: number } {
  return typeof value === 'object' && value !== null && 'grade' in value && 'subject' in value;
}

/**
 * Compare two values cho sorting
 */
function compareValues(a: string | number | Date | { grade: number; subject: string; chapter: number; level: number; lesson?: number; form?: number }, b: string | number | Date | { grade: number; subject: string; chapter: number; level: number; lesson?: number; form?: number }, direction: SortDirection): number {
  // Handle QuestionCode objects
  if (isQuestionCodeObject(a) && isQuestionCodeObject(b)) {
    // Sort by grade -> subject -> chapter -> level -> lesson -> form
    const gradeCompare = a.grade - b.grade;
    if (gradeCompare !== 0) return direction === 'asc' ? gradeCompare : -gradeCompare;
    
    const subjectCompare = a.subject.localeCompare(b.subject);
    if (subjectCompare !== 0) return direction === 'asc' ? subjectCompare : -subjectCompare;
    
    const chapterCompare = a.chapter - b.chapter;
    if (chapterCompare !== 0) return direction === 'asc' ? chapterCompare : -chapterCompare;
    
    const levelCompare = a.level - b.level;
    if (levelCompare !== 0) return direction === 'asc' ? levelCompare : -levelCompare;
    
    const lessonCompare = (a.lesson || 0) - (b.lesson || 0);
    if (lessonCompare !== 0) return direction === 'asc' ? lessonCompare : -lessonCompare;
    
    const formCompare = (a.form || 0) - (b.form || 0);
    return direction === 'asc' ? formCompare : -formCompare;
  }
  
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? -1 : 1;
  if (b == null) return direction === 'asc' ? 1 : -1;
  
  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }
  
  // Handle strings
  if (typeof a === 'string' && typeof b === 'string') {
    const result = a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });
    return direction === 'asc' ? result : -result;
  }
  
  // Fallback to string comparison
  const aStr = String(a);
  const bStr = String(b);
  const result = aStr.localeCompare(bStr, 'vi', { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}

// ===== MAIN SORTING FUNCTIONS =====

/**
 * Sort questions với single column
 */
export function sortQuestionsBySingleColumn(
  questions: Question[],
  sortKey: QuestionSortKey,
  direction: SortDirection = 'asc'
): Question[] {
  return [...questions].sort((a, b) => {
    const aValue = getSortableValue(a, sortKey);
    const bValue = getSortableValue(b, sortKey);
    return compareValues(aValue, bValue, direction);
  });
}

/**
 * Sort questions với multiple columns (priority-based)
 */
export function sortQuestionsByMultipleColumns(
  questions: Question[],
  sortColumns: SortColumn[]
): Question[] {
  if (sortColumns.length === 0) {
    return [...questions];
  }

  // Sort columns by priority (0 = highest priority)
  const sortedColumns = [...sortColumns].sort((a, b) => a.priority - b.priority);

  return [...questions].sort((a, b) => {
    for (const column of sortedColumns) {
      const aValue = getSortableValue(a, column.key as QuestionSortKey);
      const bValue = getSortableValue(b, column.key as QuestionSortKey);
      const result = compareValues(aValue, bValue, column.direction);
      
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  });
}

/**
 * Apply sort config to questions
 */
export function applySortConfig(questions: Question[], config: SortConfig): Question[] {
  return sortQuestionsByMultipleColumns(questions, config.columns);
}

/**
 * Create sort column
 */
export function createSortColumn(
  key: QuestionSortKey,
  direction: SortDirection = 'asc',
  priority: number = 0
): SortColumn {
  return { key, direction, priority };
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

/**
 * Add or update sort column trong existing config
 */
export function updateSortConfig(
  currentConfig: SortConfig,
  newColumn: SortColumn,
  multiSort: boolean = true
): SortConfig {
  const existingColumnIndex = currentConfig.columns.findIndex(
    col => col.key === newColumn.key
  );

  if (existingColumnIndex >= 0) {
    // Update existing column
    const updatedColumns = [...currentConfig.columns];
    updatedColumns[existingColumnIndex] = newColumn;
    
    return {
      ...currentConfig,
      columns: updatedColumns
    };
  } else {
    // Add new column
    if (multiSort) {
      // Add to existing columns với adjusted priorities
      const adjustedColumns = currentConfig.columns.map(col => ({
        ...col,
        priority: col.priority + 1
      }));
      
      return {
        ...currentConfig,
        columns: [{ ...newColumn, priority: 0 }, ...adjustedColumns]
      };
    } else {
      // Replace all columns với new column
      return {
        ...currentConfig,
        columns: [{ ...newColumn, priority: 0 }]
      };
    }
  }
}

/**
 * Remove sort column từ config
 */
export function removeSortColumn(config: SortConfig, columnKey: string): SortConfig {
  const filteredColumns = config.columns
    .filter(col => col.key !== columnKey)
    .map((col, index) => ({ ...col, priority: index })); // Re-index priorities

  return {
    ...config,
    columns: filteredColumns
  };
}

/**
 * Get sort preset by name
 */
export function getSortPreset(presetName: keyof typeof SORT_PRESETS): SortColumn[] {
  return SORT_PRESETS[presetName] || SORT_PRESETS.DEFAULT;
}

/**
 * Check if sort config is empty
 */
export function isSortConfigEmpty(config: SortConfig): boolean {
  return config.columns.length === 0;
}

/**
 * Get sort summary text cho UI display
 */
export function getSortSummary(config: SortConfig): string {
  if (isSortConfigEmpty(config)) {
    return 'Không có sắp xếp';
  }

  const sortedColumns = [...config.columns].sort((a, b) => a.priority - b.priority);
  const summaries = sortedColumns.map(col => {
    const direction = col.direction === 'asc' ? '↑' : '↓';
    return `${col.key} ${direction}`;
  });

  return summaries.join(', ');
}
