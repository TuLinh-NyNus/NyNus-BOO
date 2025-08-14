/**
 * Filter Type Adapters
 * Utility functions để handle union types trong filter system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';

// ===== TYPE UTILITIES =====

/**
 * Ensure value is an array
 * Converts single values to arrays, handles undefined
 */
export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Ensure value is a single item
 * Extracts first item from arrays, handles undefined
 */
export function ensureSingle<T>(value: T | T[] | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Convert filter value to string for UI components
 * Handles arrays by taking first value, provides fallback
 */
export function filterToString<T extends string>(
  value: T | T[] | undefined, 
  fallback: string = 'all'
): string {
  if (!value) return fallback;
  return Array.isArray(value) ? (value[0] || fallback) : value;
}

/**
 * Convert string value back to filter format
 * Handles 'all' special case, maintains type safety
 */
export function stringToFilter<T extends string>(
  value: string, 
  allValue: string = 'all'
): T | undefined {
  return value === allValue ? undefined : (value as T);
}

// ===== SPECIFIC TYPE ADAPTERS =====

/**
 * QuestionType adapters
 */
export const questionTypeAdapters = {
  toArray: (value: QuestionType | QuestionType[] | undefined): QuestionType[] => 
    ensureArray(value),
  
  toSingle: (value: QuestionType | QuestionType[] | undefined): QuestionType | undefined => 
    ensureSingle(value),
  
  toString: (value: QuestionType | QuestionType[] | undefined): string => 
    filterToString(value, 'all'),
  
  fromString: (value: string): QuestionType | undefined => 
    stringToFilter<QuestionType>(value, 'all'),
  
  hasValue: (value: QuestionType | QuestionType[] | undefined): boolean => {
    const arr = ensureArray(value);
    return arr.length > 0;
  }
};

/**
 * QuestionStatus adapters
 */
export const questionStatusAdapters = {
  toArray: (value: QuestionStatus | QuestionStatus[] | undefined): QuestionStatus[] => 
    ensureArray(value),
  
  toSingle: (value: QuestionStatus | QuestionStatus[] | undefined): QuestionStatus | undefined => 
    ensureSingle(value),
  
  toString: (value: QuestionStatus | QuestionStatus[] | undefined): string => 
    filterToString(value, 'all'),
  
  fromString: (value: string): QuestionStatus | undefined => 
    stringToFilter<QuestionStatus>(value, 'all'),
  
  hasValue: (value: QuestionStatus | QuestionStatus[] | undefined): boolean => {
    const arr = ensureArray(value);
    return arr.length > 0;
  }
};

/**
 * QuestionDifficulty adapters
 */
export const questionDifficultyAdapters = {
  toArray: (value: QuestionDifficulty | QuestionDifficulty[] | undefined): QuestionDifficulty[] => 
    ensureArray(value),
  
  toSingle: (value: QuestionDifficulty | QuestionDifficulty[] | undefined): QuestionDifficulty | undefined => 
    ensureSingle(value),
  
  toString: (value: QuestionDifficulty | QuestionDifficulty[] | undefined): string => 
    filterToString(value, 'all'),
  
  fromString: (value: string): QuestionDifficulty | undefined => 
    stringToFilter<QuestionDifficulty>(value, 'all'),
  
  hasValue: (value: QuestionDifficulty | QuestionDifficulty[] | undefined): boolean => {
    const arr = ensureArray(value);
    return arr.length > 0;
  }
};

// ===== RANGE UTILITIES =====

/**
 * Ensure range object has required properties
 */
export function ensureRange(
  range: { min?: number; max?: number } | undefined
): { min: number; max: number } | undefined {
  if (!range) return undefined;
  
  const min = range.min ?? 0;
  const max = range.max ?? 100;
  
  return { min, max };
}

/**
 * Ensure date range has required properties
 */
export function ensureDateRange(
  range: { from?: Date; to?: Date; field?: string } | undefined
): { from: Date; to: Date; field: string } | undefined {
  if (!range) return undefined;
  
  const from = range.from ?? new Date();
  const to = range.to ?? new Date();
  const field = range.field ?? 'createdAt';
  
  return { from, to, field };
}

// ===== TYPE GUARDS =====

/**
 * Check if value is array
 */
export function isArrayValue<T>(value: T | T[] | undefined): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is single item
 */
export function isSingleValue<T>(value: T | T[] | undefined): value is T {
  return value !== undefined && !Array.isArray(value);
}

/**
 * Check if filter has any values
 */
export function hasFilterValues<T>(value: T | T[] | undefined): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ===== EXPORT ALL =====
export default {
  ensureArray,
  ensureSingle,
  filterToString,
  stringToFilter,
  questionTypeAdapters,
  questionStatusAdapters,
  questionDifficultyAdapters,
  ensureRange,
  ensureDateRange,
  isArrayValue,
  isSingleValue,
  hasFilterValues
};
