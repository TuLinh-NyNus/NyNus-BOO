/**
 * Search Utilities
 * Client-side search algorithms và utilities cho question search
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question } from '@/types/question';

// ===== TYPES =====

export interface SearchOptions {
  /** Tìm kiếm fuzzy (gần đúng) */
  fuzzy?: boolean;
  /** Độ chính xác cho fuzzy search (0-1) */
  threshold?: number;
  /** Tìm kiếm case-sensitive */
  caseSensitive?: boolean;
  /** Các fields để search */
  searchFields?: SearchField[];
  /** Highlight search terms */
  highlight?: boolean;
  /** Số lượng kết quả tối đa */
  maxResults?: number;
}

export interface SearchField {
  /** Tên field */
  field: keyof Question | 'all';
  /** Trọng số (weight) cho field này */
  weight?: number;
  /** Có search trong field này không */
  enabled?: boolean;
}

export interface SearchResult {
  /** Question item */
  item: Question;
  /** Điểm số relevance */
  score: number;
  /** Các matches được tìm thấy */
  matches: SearchMatch[];
}

export interface SearchMatch {
  /** Field được match */
  field: string;
  /** Text được match */
  text: string;
  /** Vị trí bắt đầu */
  start: number;
  /** Vị trí kết thúc */
  end: number;
  /** Highlighted text */
  highlighted?: string;
}

// ===== CONSTANTS =====

/** Default search options */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  fuzzy: true,
  threshold: 0.3,
  caseSensitive: false,
  searchFields: [
    { field: 'content', weight: 3, enabled: true },
    { field: 'rawContent', weight: 2, enabled: true },
    { field: 'solution', weight: 1.5, enabled: true },
    { field: 'tag', weight: 1, enabled: true },
    { field: 'questionCodeId', weight: 2, enabled: true },
  ],
  highlight: true,
  maxResults: 100
};

/** Search field weights */
export const SEARCH_FIELD_WEIGHTS = {
  content: 3,
  rawContent: 2,
  solution: 1.5,
  tag: 1,
  questionCodeId: 2,
  subcount: 1,
  source: 0.5
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Normalize text cho search
 */
export function normalizeText(text: string, caseSensitive = false): string {
  if (!text) return '';
  
  let normalized = text.trim();
  
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove Vietnamese diacritics cho better search
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  return normalized;
}

/**
 * Calculate Levenshtein distance cho fuzzy search
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLength);
}

/**
 * Check if text matches query với fuzzy support
 */
export function isMatch(
  text: string, 
  query: string, 
  options: Pick<SearchOptions, 'fuzzy' | 'threshold' | 'caseSensitive'> = {}
): boolean {
  const { fuzzy = true, threshold = 0.3, caseSensitive = false } = options;
  
  const normalizedText = normalizeText(text, caseSensitive);
  const normalizedQuery = normalizeText(query, caseSensitive);
  
  // Exact match
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }
  
  // Fuzzy match
  if (fuzzy) {
    const similarity = calculateSimilarity(normalizedText, normalizedQuery);
    return similarity >= threshold;
  }
  
  return false;
}

/**
 * Find all matches trong text
 */
export function findMatches(
  text: string, 
  query: string, 
  options: Pick<SearchOptions, 'fuzzy' | 'threshold' | 'caseSensitive'> = {}
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const { caseSensitive = false } = options;
  
  const normalizedText = normalizeText(text, caseSensitive);
  const normalizedQuery = normalizeText(query, caseSensitive);
  
  if (!normalizedQuery) return matches;
  
  // Find exact matches
  let startIndex = 0;
  while (true) {
    const index = normalizedText.indexOf(normalizedQuery, startIndex);
    if (index === -1) break;
    
    matches.push({
      field: 'content', // Will be set by caller
      text: text.substring(index, index + normalizedQuery.length),
      start: index,
      end: index + normalizedQuery.length
    });
    
    startIndex = index + 1;
  }
  
  return matches;
}

// ===== MAIN SEARCH FUNCTIONS =====

/**
 * Search trong một field cụ thể
 */
export function searchInField(
  question: Question,
  field: keyof Question,
  query: string,
  options: SearchOptions = {}
): SearchResult | null {
  const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };

  let fieldValue: string = '';

  // Get field value
  switch (field) {
    case 'content':
    case 'rawContent':
    case 'solution':
    case 'questionCodeId':
    case 'subcount':
    case 'source':
      fieldValue = (question[field] as string) || '';
      break;
    case 'tag':
      fieldValue = Array.isArray(question.tag) ? question.tag.join(' ') : '';
      break;
    default:
      return null;
  }

  if (!fieldValue) return null;

  // Check if matches
  if (!isMatch(fieldValue, query, mergedOptions)) {
    return null;
  }

  // Find matches
  const matches = findMatches(fieldValue, query, mergedOptions);
  if (matches.length === 0) return null;

  // Set field name cho matches
  matches.forEach(match => {
    match.field = field as string;
  });

  // Calculate score dựa trên field weight và match quality
  const fieldWeight = SEARCH_FIELD_WEIGHTS[field as keyof typeof SEARCH_FIELD_WEIGHTS] || 1;
  const matchScore = matches.length / fieldValue.length; // Simple scoring
  const score = fieldWeight * matchScore;

  return {
    item: question,
    score,
    matches
  };
}

/**
 * Search trong tất cả fields của một question
 */
export function searchQuestion(
  question: Question,
  query: string,
  options: SearchOptions = {}
): SearchResult | null {
  const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const { searchFields = DEFAULT_SEARCH_OPTIONS.searchFields! } = mergedOptions;

  const allMatches: SearchMatch[] = [];
  let totalScore = 0;

  // Search trong từng field
  for (const searchField of searchFields) {
    if (!searchField.enabled) continue;

    const fieldResult = searchInField(question, searchField.field as keyof Question, query, mergedOptions);
    if (fieldResult) {
      allMatches.push(...fieldResult.matches);
      totalScore += fieldResult.score * (searchField.weight || 1);
    }
  }

  if (allMatches.length === 0) return null;

  return {
    item: question,
    score: totalScore,
    matches: allMatches
  };
}

/**
 * Search trong danh sách questions
 */
export function searchQuestions(
  questions: Question[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const { maxResults = 100 } = mergedOptions;

  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  // Search từng question
  for (const question of questions) {
    const result = searchQuestion(question, query, mergedOptions);
    if (result) {
      results.push(result);
    }
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Multi-term search (search với nhiều từ khóa)
 */
export function multiTermSearch(
  questions: Question[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const terms = query.trim().split(/\s+/).filter(term => term.length > 0);

  if (terms.length === 0) return [];
  if (terms.length === 1) return searchQuestions(questions, query, options);

  const termResults: SearchResult[][] = [];

  // Search cho từng term
  for (const term of terms) {
    const results = searchQuestions(questions, term, options);
    termResults.push(results);
  }

  // Combine results - questions phải match ít nhất 1 term
  const combinedResults = new Map<string, SearchResult>();

  for (const results of termResults) {
    for (const result of results) {
      const questionId = result.item.id;

      if (combinedResults.has(questionId)) {
        // Merge với existing result
        const existing = combinedResults.get(questionId)!;
        existing.score += result.score;
        existing.matches.push(...result.matches);
      } else {
        // Add new result
        combinedResults.set(questionId, { ...result });
      }
    }
  }

  // Convert to array và sort
  const finalResults = Array.from(combinedResults.values());
  finalResults.sort((a, b) => b.score - a.score);

  return finalResults.slice(0, options.maxResults || 100);
}
