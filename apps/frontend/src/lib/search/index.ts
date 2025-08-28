/**
 * Search Library Index
 * Export all search-related components và utilities
 *
 * @author NyNus Team
 * @version 1.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ===== SEARCH INDEX GENERATOR =====

export {
  SearchIndexGenerator,
  type TheorySearchIndex,
  type TheorySearchItem,
  type SearchIndexMetadata,
  type SearchIndexGeneratorOptions
} from './search-index-generator';

// ===== INSTANT SEARCH ENGINE =====

export {
  InstantTheorySearch,
  getSearchEngine,
  initializeSearchEngine
} from './instant-search';

export type {
  SearchResult,
  SearchOptions,
  SearchFilters,
  SearchPerformanceMetrics
} from './instant-search';

// ===== RE-EXPORTS FROM EXISTING SEARCH =====

// Re-export existing search utilities if available
export type {
  SearchableContent,
  PreBuiltIndexes,
  NavigationNode,
  MobileManifest
} from '@/types/theory';

// Re-export existing search indexer
export {
  BuildTimeSearchIndexer
} from '@/lib/theory/search-indexer';

// ===== SEARCH UTILITIES =====

/**
 * Initialize search system cho application startup
 */
export async function initializeSearchSystem(): Promise<{
  searchEngine: unknown;
  isReady: boolean;
  indexMetadata: unknown;
}> {
  try {
    console.log('🔍 Initializing search system...');
    
    const { initializeSearchEngine: initEngine } = await import('./instant-search');
    const searchEngine = await initEngine();
    const metrics = searchEngine.getPerformanceMetrics();
    
    console.log('✅ Search system initialized successfully');
    console.log(`📊 Index size: ${metrics.indexSize} items`);
    
    return {
      searchEngine,
      isReady: true,
      indexMetadata: metrics
    };
  } catch (error) {
    console.error('❌ Search system initialization failed:', error);
    
    const { InstantTheorySearch: SearchEngine } = await import('./instant-search');
    return {
      searchEngine: new SearchEngine(),
      isReady: false,
      indexMetadata: null
    };
  }
}

/**
 * Search utility functions
 */
export const SearchUtils = {
  /**
   * Format search query cho better results
   */
  formatQuery: (query: string): string => {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
      .replace(/\s+/g, ' ');
  },

  /**
   * Extract keywords từ search query
   */
  extractKeywords: (query: string): string[] => {
    const formatted = SearchUtils.formatQuery(query);
    return formatted
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to 10 keywords
  },

  /**
   * Generate search suggestions
   */
  generateSuggestions: (query: string, availableTerms: string[]): string[] => {
    const queryLower = query.toLowerCase();
    
    return availableTerms
      .filter(term => term.toLowerCase().includes(queryLower))
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.toLowerCase().startsWith(queryLower);
        const bExact = b.toLowerCase().startsWith(queryLower);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.length - b.length;
      })
      .slice(0, 5);
  },

  /**
   * Highlight search terms trong text
   */
  highlightSearchTerms: (text: string, searchTerms: string[]): string => {
    let highlighted = text;
    
    for (const term of searchTerms) {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    }
    
    return highlighted;
  },

  /**
   * Calculate search relevance score
   */
  calculateRelevance: (item: any, query: string): number => {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Title match (highest weight)
    if (item.title?.toLowerCase().includes(queryLower)) {
      score += 0.4;
    }
    
    // Content match
    if (item.content?.toLowerCase().includes(queryLower)) {
      score += 0.3;
    }
    
    // Keywords match
    if (item.keywords?.some((keyword: string) => 
      keyword.toLowerCase().includes(queryLower)
    )) {
      score += 0.2;
    }
    
    // Math formulas match
    if (item.mathFormulas?.some((formula: string) => 
      formula.toLowerCase().includes(queryLower)
    )) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }
};

// ===== SEARCH CONSTANTS =====

export const SEARCH_CONSTANTS = {
  MAX_RESULTS: 20,
  MIN_RELEVANCE: 0.1,
  CACHE_SIZE: 100,
  SEARCH_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 300,
  
  SUBJECTS: ['TOÁN', 'LÝ', 'HÓA', 'SINH', 'VĂN', 'ANH', 'SỬ', 'ĐỊA'],
  GRADES: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  DIFFICULTIES: ['easy', 'medium', 'hard'] as const,
  
  SEARCH_TYPES: {
    INSTANT: 'instant',
    SUBJECT: 'subject',
    GRADE: 'grade',
    ADVANCED: 'advanced'
  } as const
};

// ===== SEARCH HOOKS PREPARATION =====

/**
 * Search hook interface cho React components
 */
export interface UseSearchOptions {
  enableDebounce?: boolean;
  debounceDelay?: number;
  maxResults?: number;
  enableCache?: boolean;
  autoSearch?: boolean;
}

/**
 * Search hook return type
 */
export interface UseSearchReturn {
  results: any[];
  isSearching: boolean;
  error: string | null;
  search: (query: string, options?: any) => Promise<void>;
  clearResults: () => void;
  suggestions: string[];
  performanceMetrics: any;
}

// ===== TYPE GUARDS =====

/**
 * Type guard cho SearchResult
 */
export function isSearchResult(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string' &&
    typeof (obj as any).url === 'string' &&
    typeof (obj as any).relevance === 'number'
  );
}

/**
 * Type guard cho TheorySearchIndex
 */
export function isTheorySearchIndex(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'version' in obj &&
    'totalItems' in obj &&
    'searchIndex' in obj &&
    'subjects' in obj &&
    'grades' in obj
  );
}

// ===== ERROR CLASSES =====

/**
 * Search-specific error class
 */
export class SearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

/**
 * Search initialization error
 */
export class SearchInitializationError extends SearchError {
  constructor(message: string, details?: unknown) {
    super(message, 'SEARCH_INIT_ERROR', details);
    this.name = 'SearchInitializationError';
  }
}

/**
 * Search index error
 */
export class SearchIndexError extends SearchError {
  constructor(message: string, details?: unknown) {
    super(message, 'SEARCH_INDEX_ERROR', details);
    this.name = 'SearchIndexError';
  }
}
