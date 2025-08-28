/**
 * Instant Theory Search Engine
 * Client-side instant search với pre-built indices cho < 100ms response
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';
import { TheorySearchIndex, TheorySearchItem } from './search-index-generator';

// ===== TYPES =====

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: number;
  chapter: number;
  lesson: number;
  url: string;
  relevance: number;
  highlights: string[];
  matchType: 'title' | 'content' | 'keyword' | 'formula';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

export interface SearchOptions {
  /** Maximum number of results */
  maxResults?: number;
  
  /** Minimum relevance score (0-1) */
  minRelevance?: number;
  
  /** Enable fuzzy matching */
  enableFuzzy?: boolean;
  
  /** Search trong math formulas */
  includeMathFormulas?: boolean;
  
  /** Highlight matched text */
  enableHighlights?: boolean;
}

export interface SearchFilters {
  subjects?: string[];
  grades?: number[];
  chapters?: number[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  estimatedTimeRange?: [number, number];
}

export interface SearchPerformanceMetrics {
  searchTime: number;
  resultsCount: number;
  indexSize: number;
  cacheHits: number;
  lastSearchQuery: string;
}

// ===== CONSTANTS =====

const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  maxResults: 20,
  minRelevance: 0.1,
  enableFuzzy: true,
  includeMathFormulas: true,
  enableHighlights: true
};

const FUSE_OPTIONS: IFuseOptions<TheorySearchItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'keywords', weight: 0.2 },
    { name: 'mathFormulas', weight: 0.1 }
  ],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true
};

// ===== MAIN CLASS =====

export class InstantTheorySearch {
  private searchIndex: TheorySearchIndex | null = null;
  private fuseInstance: Fuse<TheorySearchItem> | null = null;
  private isInitialized = false;
  private performanceMetrics: SearchPerformanceMetrics;
  private searchCache = new Map<string, SearchResult[]>();
  private maxCacheSize = 100;

  constructor() {
    this.performanceMetrics = {
      searchTime: 0,
      resultsCount: 0,
      indexSize: 0,
      cacheHits: 0,
      lastSearchQuery: ''
    };
  }

  /**
   * Initialize search engine với pre-built index
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔍 Initializing InstantTheorySearch...');
      const startTime = performance.now();

      // Load search index
      this.searchIndex = await this.loadSearchIndex();
      
      // Initialize Fuse.js instance
      this.fuseInstance = new Fuse(this.searchIndex.searchIndex, FUSE_OPTIONS);
      
      // Update metrics
      this.performanceMetrics.indexSize = this.searchIndex.totalItems;
      
      const initTime = performance.now() - startTime;
      console.log(`✅ InstantTheorySearch initialized in ${initTime.toFixed(2)}ms`);
      console.log(`📊 Loaded ${this.searchIndex.totalItems} items across ${Object.keys(this.searchIndex.subjects).length} subjects`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize InstantTheorySearch:', error);
      throw new Error('Search engine initialization failed');
    }
  }

  /**
   * Instant search với < 100ms response time
   */
  async searchInstant(
    query: string, 
    options: SearchOptions = {},
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    const searchOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(query, searchOptions, filters);
      if (this.searchCache.has(cacheKey)) {
        this.performanceMetrics.cacheHits++;
        const cachedResults = this.searchCache.get(cacheKey)!;
        this.updatePerformanceMetrics(query, cachedResults, performance.now() - startTime);
        return cachedResults;
      }

      // Perform search
      const results = await this.performSearch(query, searchOptions, filters);
      
      // Cache results
      this.cacheResults(cacheKey, results);
      
      // Update metrics
      const searchTime = performance.now() - startTime;
      this.updatePerformanceMetrics(query, results, searchTime);
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Search by subject với optional grade filtering
   */
  async searchBySubject(
    subject: string, 
    grade?: number,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const filters: SearchFilters = {
      subjects: [subject],
      ...(grade && { grades: [grade] })
    };

    // Use empty query to get all items for subject
    return this.searchInstant('', options, filters);
  }

  /**
   * Search by grade với optional subject filtering
   */
  async searchByGrade(
    grade: number,
    subject?: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const filters: SearchFilters = {
      grades: [grade],
      ...(subject && { subjects: [subject] })
    };

    return this.searchInstant('', options, filters);
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(partialQuery: string, maxSuggestions = 5): Promise<string[]> {
    if (!this.isInitialized || !this.searchIndex) {
      return [];
    }

    const suggestions = new Set<string>();
    const queryLower = partialQuery.toLowerCase();

    // Extract suggestions từ titles và keywords
    for (const item of this.searchIndex.searchIndex) {
      // Title suggestions
      if (item.title.toLowerCase().includes(queryLower)) {
        suggestions.add(item.title);
      }

      // Keyword suggestions
      for (const keyword of item.keywords) {
        if (keyword.toLowerCase().includes(queryLower)) {
          suggestions.add(keyword);
        }
      }

      if (suggestions.size >= maxSuggestions) break;
    }

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): SearchPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.performanceMetrics.cacheHits = 0;
  }

  /**
   * Get available subjects
   */
  getAvailableSubjects(): string[] {
    if (!this.searchIndex) return [];
    return Object.keys(this.searchIndex.subjects);
  }

  /**
   * Get available grades for subject
   */
  getAvailableGrades(subject?: string): number[] {
    if (!this.searchIndex) return [];
    
    if (subject && this.searchIndex.subjects[subject]) {
      const grades = new Set(this.searchIndex.subjects[subject].map(item => item.grade));
      return Array.from(grades).sort((a, b) => a - b);
    }
    
    return Object.keys(this.searchIndex.grades).map(Number).sort((a, b) => a - b);
  }

  // ===== PRIVATE METHODS =====

  /**
   * Load search index từ pre-built file
   */
  private async loadSearchIndex(): Promise<TheorySearchIndex> {
    try {
      // Try to load from public directory
      const response = await fetch('/theory-search-index.json');
      
      if (!response.ok) {
        console.warn('Pre-built search index not found, using fallback...');
        return this.createFallbackIndex();
      }
      
      const searchIndex = await response.json() as TheorySearchIndex;
      
      // Validate index structure
      if (!searchIndex.searchIndex || !Array.isArray(searchIndex.searchIndex)) {
        throw new Error('Invalid search index structure');
      }
      
      return searchIndex;
    } catch (error) {
      console.warn('Failed to load search index:', error);
      return this.createFallbackIndex();
    }
  }

  /**
   * Create fallback index cho development
   */
  private createFallbackIndex(): TheorySearchIndex {
    const mockItems: TheorySearchItem[] = [
      {
        id: 'TOÁN/LỚP-10/CHƯƠNG-1/bài-1',
        title: 'Phương trình bậc hai',
        content: 'Phương trình bậc hai là phương trình có dạng ax² + bx + c = 0 với a ≠ 0',
        subject: 'TOÁN',
        grade: 10,
        chapter: 1,
        lesson: 1,
        keywords: ['phương trình', 'bậc hai', 'toán học'],
        mathFormulas: ['ax^2 + bx + c = 0', 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
        url: '/theory/TOÁN/LỚP-10/CHƯƠNG-1/bài-1',
        difficulty: 'medium',
        estimatedTime: 45,
        lastModified: new Date().toISOString()
      },
      {
        id: 'LÝ/LỚP-11/CHƯƠNG-2/bài-3',
        title: 'Định luật Newton',
        content: 'Định luật Newton mô tả mối quan hệ giữa lực và chuyển động',
        subject: 'LÝ',
        grade: 11,
        chapter: 2,
        lesson: 3,
        keywords: ['newton', 'lực', 'chuyển động'],
        mathFormulas: ['F = ma', 'F = \\frac{dp}{dt}'],
        url: '/theory/LÝ/LỚP-11/CHƯƠNG-2/bài-3',
        difficulty: 'hard',
        estimatedTime: 60,
        lastModified: new Date().toISOString()
      }
    ];

    return {
      version: '1.0.0-fallback',
      lastBuilt: new Date().toISOString(),
      totalItems: mockItems.length,
      subjects: {
        'TOÁN': [mockItems[0]],
        'LÝ': [mockItems[1]]
      },
      grades: {
        10: [mockItems[0]],
        11: [mockItems[1]]
      },
      searchIndex: mockItems,
      metadata: {
        buildTime: 0,
        compressionRatio: 1,
        indexSize: JSON.stringify(mockItems).length,
        compressedSize: JSON.stringify(mockItems).length,
        itemCount: mockItems.length,
        subjectCount: 2,
        gradeRange: [10, 11]
      }
    };
  }

  /**
   * Perform actual search operation
   */
  private async performSearch(
    query: string,
    options: Required<SearchOptions>,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    if (!this.fuseInstance || !this.searchIndex) {
      return [];
    }

    let searchItems = this.searchIndex.searchIndex;

    // Apply filters
    searchItems = this.applyFilters(searchItems, filters);

    // Perform search
    let results: SearchResult[];
    
    if (query.trim() === '') {
      // No query - return filtered items
      results = searchItems.slice(0, options.maxResults).map(item => 
        this.convertToSearchResult(item, 1.0, [], 'content')
      );
    } else {
      // Perform Fuse.js search
      const fuseResults = this.fuseInstance.search(query, {
        limit: options.maxResults * 2 // Get more results for filtering
      });

      results = fuseResults
        .filter(result => (result.score || 0) <= (1 - options.minRelevance))
        .map(result => {
          const relevance = 1 - (result.score || 0);
          const highlights = this.extractHighlights(result, options.enableHighlights);
          const matchType = this.determineMatchType(result);
          
          return this.convertToSearchResult(result.item, relevance, highlights, matchType);
        })
        .slice(0, options.maxResults);
    }

    return results;
  }

  /**
   * Apply search filters to items
   */
  private applyFilters(items: TheorySearchItem[], filters: SearchFilters): TheorySearchItem[] {
    let filtered = items;

    if (filters.subjects && filters.subjects.length > 0) {
      filtered = filtered.filter(item => filters.subjects!.includes(item.subject));
    }

    if (filters.grades && filters.grades.length > 0) {
      filtered = filtered.filter(item => filters.grades!.includes(item.grade));
    }

    if (filters.chapters && filters.chapters.length > 0) {
      filtered = filtered.filter(item => filters.chapters!.includes(item.chapter));
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(item => filters.difficulty!.includes(item.difficulty));
    }

    if (filters.estimatedTimeRange) {
      const [min, max] = filters.estimatedTimeRange;
      filtered = filtered.filter(item => item.estimatedTime >= min && item.estimatedTime <= max);
    }

    return filtered;
  }

  /**
   * Convert search item to search result
   */
  private convertToSearchResult(
    item: TheorySearchItem,
    relevance: number,
    highlights: string[],
    matchType: SearchResult['matchType']
  ): SearchResult {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      subject: item.subject,
      grade: item.grade,
      chapter: item.chapter,
      lesson: item.lesson,
      url: item.url,
      relevance,
      highlights,
      matchType,
      difficulty: item.difficulty,
      estimatedTime: item.estimatedTime
    };
  }

  /**
   * Extract highlights từ Fuse.js result
   */
  private extractHighlights(result: FuseResult<TheorySearchItem>, enableHighlights: boolean): string[] {
    if (!enableHighlights || !result.matches) {
      return [];
    }

    const highlights: string[] = [];
    
    for (const match of result.matches) {
      if (match.indices && match.value) {
        for (const [start, end] of match.indices) {
          const highlight = match.value.substring(Math.max(0, start - 20), Math.min(match.value.length, end + 20));
          highlights.push(highlight);
        }
      }
    }

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  /**
   * Determine match type từ Fuse.js result
   */
  private determineMatchType(result: FuseResult<TheorySearchItem>): SearchResult['matchType'] {
    if (!result.matches) return 'content';

    for (const match of result.matches) {
      if (match.key === 'title') return 'title';
      if (match.key === 'keywords') return 'keyword';
      if (match.key === 'mathFormulas') return 'formula';
    }

    return 'content';
  }

  /**
   * Generate cache key cho search results
   */
  private generateCacheKey(query: string, options: SearchOptions, filters: SearchFilters): string {
    return JSON.stringify({ query, options, filters });
  }

  /**
   * Cache search results
   */
  private cacheResults(cacheKey: string, results: SearchResult[]): void {
    // Implement LRU cache
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) {
        this.searchCache.delete(firstKey);
      }
    }
    
    this.searchCache.set(cacheKey, results);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(query: string, results: SearchResult[], searchTime: number): void {
    this.performanceMetrics.searchTime = searchTime;
    this.performanceMetrics.resultsCount = results.length;
    this.performanceMetrics.lastSearchQuery = query;
  }
}

// ===== SINGLETON INSTANCE =====

let searchEngineInstance: InstantTheorySearch | null = null;

/**
 * Get singleton instance của InstantTheorySearch
 */
export function getSearchEngine(): InstantTheorySearch {
  if (!searchEngineInstance) {
    searchEngineInstance = new InstantTheorySearch();
  }
  return searchEngineInstance;
}

/**
 * Initialize search engine (call once at app startup)
 */
export async function initializeSearchEngine(): Promise<InstantTheorySearch> {
  const engine = getSearchEngine();
  await engine.initialize();
  return engine;
}
