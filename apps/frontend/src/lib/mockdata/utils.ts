/**
 * Unified Mockdata Utilities
 * 
 * Consolidated helper functions to eliminate duplication across mockdata files
 * Generic, reusable functions for common operations
 */

import {
  MockPagination,
  MockApiResponse,
  MockListResponse,
  StringKeys,
  ArrayKeys,
  MOCK_DATA_CONSTANTS
} from './core-types';

// ===== PAGINATION UTILITIES =====

export class PaginationUtils {
  /**
   * Generic pagination function
   */
  static paginate<T>(
    items: T[], 
    page: number = 1, 
    limit: number = MOCK_DATA_CONSTANTS.DEFAULT_PAGE_SIZE
  ): MockListResponse<T> {
    // Validate inputs
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), MOCK_DATA_CONSTANTS.MAX_PAGE_SIZE);
    
    const total = items.length;
    const totalPages = Math.ceil(total / validLimit);
    const startIndex = (validPage - 1) * validLimit;
    const endIndex = startIndex + validLimit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      }
    };
  }

  /**
   * Create pagination metadata only
   */
  static createPagination(
    total: number,
    page: number = 1,
    limit: number = MOCK_DATA_CONSTANTS.DEFAULT_PAGE_SIZE
  ): MockPagination {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), MOCK_DATA_CONSTANTS.MAX_PAGE_SIZE);
    const totalPages = Math.ceil(total / validLimit);

    return {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrev: validPage > 1
    };
  }
}

// ===== SEARCH UTILITIES =====

export class SearchUtils {
  /**
   * Generic search in multiple fields
   */
  static searchInFields<T>(
    items: T[], 
    query: string, 
    fields: StringKeys<T>[]
  ): T[] {
    if (!query || !query.trim()) return items;
    
    const searchTerm = query.toLowerCase().trim();
    return items.filter(item =>
      fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        return false;
      })
    );
  }

  /**
   * Search in array fields (like tags)
   */
  static searchInArrayFields<T>(
    items: T[], 
    query: string, 
    fields: ArrayKeys<T>[]
  ): T[] {
    if (!query || !query.trim()) return items;
    
    const searchTerm = query.toLowerCase().trim();
    return items.filter(item =>
      fields.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchTerm)
          );
        }
        return false;
      })
    );
  }

  /**
   * Combined search in both string and array fields
   */
  static searchInAllFields<T>(
    items: T[], 
    query: string, 
    stringFields: StringKeys<T>[], 
    arrayFields: ArrayKeys<T>[] = []
  ): T[] {
    if (!query || !query.trim()) return items;
    
    const stringResults = this.searchInFields(items, query, stringFields);
    const arrayResults = this.searchInArrayFields(items, query, arrayFields);
    
    // Combine and deduplicate results
    const combinedResults = [...stringResults];
    arrayResults.forEach(item => {
      if (!combinedResults.includes(item)) {
        combinedResults.push(item);
      }
    });
    
    return combinedResults;
  }

  /**
   * Fuzzy search with similarity scoring
   */
  static fuzzySearch<T>(
    items: T[], 
    query: string, 
    fields: StringKeys<T>[],
    threshold: number = 0.3
  ): T[] {
    if (!query || !query.trim()) return items;
    
    const searchTerm = query.toLowerCase().trim();
    
    return items
      .map(item => ({
        item,
        score: this.calculateSimilarity(item, searchTerm, fields)
      }))
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  }

  /**
   * Calculate similarity score for fuzzy search
   */
  private static calculateSimilarity<T>(
    item: T, 
    searchTerm: string, 
    fields: StringKeys<T>[]
  ): number {
    let maxScore = 0;
    
    fields.forEach(field => {
      const value = item[field];
      if (typeof value === 'string') {
        const fieldValue = value.toLowerCase();
        const score = this.stringSimilarity(fieldValue, searchTerm);
        maxScore = Math.max(maxScore, score);
      }
    });
    
    return maxScore;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// ===== FILTER UTILITIES =====

export class FilterUtils {
  /**
   * Generic date range filter
   */
  static filterByDateRange<T extends { createdAt: Date } | { created_at: Date }>(
    items: T[],
    startDate: Date,
    endDate: Date,
    dateField: 'createdAt' | 'created_at' = 'createdAt'
  ): T[] {
    return items.filter(item => {
      const itemDate = (item as Record<string, Date>)[dateField]; // ✅ Fixed: Proper type assertion
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Generic enum filter
   */
  static filterByEnum<T, K extends keyof T>(
    items: T[], 
    field: K, 
    value: T[K]
  ): T[] {
    return items.filter(item => item[field] === value);
  }

  /**
   * Generic boolean filter
   */
  static filterByBoolean<T, K extends keyof T>(
    items: T[], 
    field: K, 
    value: boolean
  ): T[] {
    return items.filter(item => item[field] === value);
  }

  /**
   * Generic array contains filter
   */
  static filterByArrayContains<T, K extends keyof T>(
    items: T[],
    field: K,
    value: unknown
  ): T[] {
    return items.filter(item => {
      const fieldValue = item[field];
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return false;
    });
  }

  /**
   * Generic range filter (for numbers)
   */
  static filterByRange<T, K extends keyof T>(
    items: T[], 
    field: K, 
    min?: number, 
    max?: number
  ): T[] {
    return items.filter(item => {
      const value = item[field];
      if (typeof value === 'number') {
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      }
      return false;
    });
  }
}

// ===== SORT UTILITIES =====

export class SortUtils {
  /**
   * Generic sort by field
   */
  static sortBy<T, K extends keyof T>(
    items: T[], 
    field: K, 
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Sort by multiple fields
   */
  static sortByMultiple<T>(
    items: T[], 
    sortConfigs: Array<{ field: keyof T; order: 'asc' | 'desc' }>
  ): T[] {
    return [...items].sort((a, b) => {
      for (const config of sortConfigs) {
        const aVal = a[config.field];
        const bVal = b[config.field];
        
        if (aVal < bVal) return config.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return config.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Sort by date (most recent first by default)
   */
  static sortByDate<T extends { createdAt: Date } | { created_at: Date }>(
    items: T[],
    order: 'asc' | 'desc' = 'desc',
    dateField: 'createdAt' | 'created_at' = 'createdAt'
  ): T[] {
    return [...items].sort((a, b) => {
      const aDate = (a as Record<string, Date>)[dateField].getTime(); // ✅ Fixed: Proper type assertion
      const bDate = (b as Record<string, Date>)[dateField].getTime(); // ✅ Fixed: Proper type assertion

      return order === 'desc' ? bDate - aDate : aDate - bDate;
    });
  }
}

// ===== API RESPONSE UTILITIES =====

export class ApiResponseUtils {
  /**
   * Create successful API response
   */
  static createSuccessResponse<T>(
    data: T, 
    message?: string,
    pagination?: MockPagination
  ): MockApiResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Data retrieved successfully',
      ...(pagination && { pagination })
    };
  }

  /**
   * Create error API response
   */
  static createErrorResponse<T = null>(
    message: string,
    data: T = null as T
  ): MockApiResponse<T> {
    return {
      success: false,
      data,
      message
    };
  }

  /**
   * Create paginated API response
   */
  static createPaginatedResponse<T>(
    items: T[],
    page: number = 1,
    limit: number = MOCK_DATA_CONSTANTS.DEFAULT_PAGE_SIZE,
    message?: string
  ): MockApiResponse<MockListResponse<T>> {
    const paginatedData = PaginationUtils.paginate(items, page, limit);
    
    return {
      success: true,
      data: paginatedData,
      message: message || 'Data retrieved successfully',
      pagination: paginatedData.pagination
    };
  }
}

// ===== DATA GENERATION UTILITIES =====

export class DataGenerationUtils {
  /**
   * Generate random ID with prefix
   */
  static generateId(prefix: string = 'id'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate random date within range
   */
  static generateRandomDate(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  /**
   * Generate random number within range
   */
  static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random boolean with probability
   */
  static generateRandomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  /**
   * Pick random item from array
   */
  static pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Pick multiple random items from array
   */
  static pickRandomMultiple<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, items.length));
  }
}

// ===== VALIDATION UTILITIES =====

// ValidationUtils moved to shared validation utilities
// Import from shared location to avoid duplication
import {
  isValidEmail,
  isValidPhone,
  validateRequiredFields
} from '../validation/shared/common-schemas';
import { AUTH_CONSTANTS } from '../constants/timeouts';

export class ValidationUtils {
  /**
   * Validate email format (using shared utility)
   */
  static isValidEmail = isValidEmail;

  /**
   * Validate phone number (Vietnamese format, using shared utility)
   */
  static isValidPhone = isValidPhone;

  /**
   * Validate password strength (simplified)
   */
  static isValidPassword(password: string): boolean {
    return password.length >= AUTH_CONSTANTS.PASSWORD_MIN_LENGTH;
  }

  /**
   * Validate required fields (using shared utility)
   */
  static validateRequired<T extends Record<string, unknown>>(obj: T, requiredFields: (keyof T)[]): string[] {
    return validateRequiredFields(obj, requiredFields);
  }
}

// ===== API SIMULATION UTILITIES =====

export class ApiSimulationUtils {
  /**
   * Simulate API call with delay
   * Mô phỏng API call với delay
   */
  static simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  }

  /**
   * Simulate API call with random delay
   * Mô phỏng API call với delay ngẫu nhiên
   */
  static simulateApiCallWithRandomDelay<T>(
    data: T,
    minDelay: number = 200,
    maxDelay: number = 800
  ): Promise<T> {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    return this.simulateApiCall(data, delay);
  }

  /**
   * Simulate API error
   * Mô phỏng API error
   */
  static simulateApiError(
    message: string = 'API Error',
    delay: number = 500
  ): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message));
      }, delay);
    });
  }
}

// ===== EXPORT CONSOLIDATED UTILS =====

export const MockDataUtils = {
  Pagination: PaginationUtils,
  Search: SearchUtils,
  Filter: FilterUtils,
  Sort: SortUtils,
  ApiResponse: ApiResponseUtils,
  DataGeneration: DataGenerationUtils,
  Validation: ValidationUtils,
  simulateApiCall: ApiSimulationUtils.simulateApiCall,
  simulateApiCallWithRandomDelay: ApiSimulationUtils.simulateApiCallWithRandomDelay,
  simulateApiError: ApiSimulationUtils.simulateApiError
};

export default MockDataUtils;
