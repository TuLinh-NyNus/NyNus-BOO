/**
 * Client Search Component
 * Main component cho client-side search functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter, Clock, Hash } from 'lucide-react';
import { Input, Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Question } from '@/types/question';
import { useClientSearch, UseClientSearchOptions } from '@/hooks/useClientSearch';
import { SearchResult } from '@/lib/utils/search-utils';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface ClientSearchProps {
  /** Danh sách questions để search */
  questions: Question[];
  /** Search options */
  searchOptions?: UseClientSearchOptions;
  /** Placeholder text */
  placeholder?: string;
  /** Show search stats */
  showStats?: boolean;
  /** Show advanced options */
  showAdvancedOptions?: boolean;
  /** Callback khi select result */
  onResultSelect?: (question: Question) => void;
  /** Callback khi search complete */
  onSearchComplete?: (results: SearchResult[], query: string) => void;
  /** Custom result renderer */
  renderResult?: (result: SearchResult, index: number) => React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ===== COMPONENT =====

/**
 * Client Search Component
 * Comprehensive client-side search với real-time results
 */
function ClientSearchComponent({
  questions,
  searchOptions = {},
  placeholder = 'Tìm kiếm câu hỏi...',
  showStats = true,
  showAdvancedOptions = false,
  onResultSelect,
  onSearchComplete,
  renderResult,
  className = ''
}: ClientSearchProps) {
  // ===== PERFORMANCE MONITORING =====

  const { metrics } = usePerformanceOptimization({
    componentName: 'ClientSearch',
    enabled: true,
    warningThreshold: 50 // 50ms threshold cho search component
  });

  // ===== STATE =====

  const [showOptions, setShowOptions] = useState(false);

  // ===== HOOKS =====

  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    resultCount,
    search,
    clearSearch,
    searchOptions: currentOptions,
    setSearchOptions,
    searchTime,
    error
  } = useClientSearch(questions, {
    ...searchOptions,
    onSearchComplete
  });

  // ===== HANDLERS =====

  /**
   * Handle input change - memoized cho performance
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  /**
   * Handle clear search - memoized cho performance
   */
  const handleClearSearch = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  /**
   * Handle manual search trigger
   */
  const handleManualSearch = useCallback(() => {
    if (query.trim()) {
      search(query);
    }
  }, [query, search]);

  /**
   * Handle result click - memoized cho performance
   */
  const handleResultClick = useCallback((result: SearchResult) => {
    onResultSelect?.(result.item);
  }, [onResultSelect]);

  /**
   * Handle search option change - memoized cho performance
   */
  const handleOptionChange = useCallback((option: string, value: unknown) => {
    setSearchOptions({ [option]: value });
  }, [setSearchOptions]);

  // ===== RENDER HELPERS =====

  /**
   * Render search input - memoized cho performance
   */
  const renderSearchInput = useMemo(() => (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-20"
          disabled={isSearching}
        />
        
        {/* Clear button */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-12 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        {/* Manual search button */}
        {!searchOptions.autoSearch && query.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleManualSearch}
            className="absolute right-8 h-6 w-6 p-0"
            disabled={isSearching}
          >
            <Search className="h-3 w-3" />
          </Button>
        )}

        {/* Advanced options toggle */}
        {showAdvancedOptions && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="absolute right-2 h-6 w-6 p-0"
          >
            <Filter className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  ), [query, isSearching, handleInputChange, handleClearSearch, handleManualSearch, showAdvancedOptions, showOptions, placeholder, searchOptions.autoSearch]);

  /**
   * Render search stats
   */
  const renderSearchStats = () => {
    if (!showStats || !query) return null;

    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          <span>{resultCount} kết quả</span>
        </div>
        {searchTime > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{searchTime.toFixed(1)}ms</span>
          </div>
        )}
        {process.env.NODE_ENV === 'development' && metrics.renderTime > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span>Render: {metrics.renderTime.toFixed(1)}ms</span>
            {metrics.rerenderCount > 5 && (
              <span className="text-orange-500">({metrics.rerenderCount} renders)</span>
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render advanced options
   */
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions || !showOptions) return null;

    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tùy chọn tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fuzzy"
              checked={currentOptions.fuzzy}
              onChange={(e) => handleOptionChange('fuzzy', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="fuzzy" className="text-sm">Tìm kiếm gần đúng</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="caseSensitive"
              checked={currentOptions.caseSensitive}
              onChange={(e) => handleOptionChange('caseSensitive', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="caseSensitive" className="text-sm">Phân biệt hoa thường</label>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Độ chính xác</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentOptions.threshold || 0.3}
              onChange={(e) => handleOptionChange('threshold', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {((currentOptions.threshold || 0.3) * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render default result item
   */
  const renderDefaultResult = (result: SearchResult, index: number) => (
    <div
      key={result.item.id}
      onClick={() => handleResultClick(result)}
      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      role="option"
      aria-selected={false}
      aria-setsize={results.length}
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {result.item.questionCodeId}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Score: {result.score.toFixed(2)}
              </Badge>
            </div>
            <p className="text-sm line-clamp-2">
              {result.item.content}
            </p>
            {result.matches.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Matches: {result.matches.map(m => m.field).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render search results
   */
  const renderSearchResults = () => {
    if (!query) return null;

    if (error) {
      return (
        <div className="p-4 text-center text-red-600">
          <p>Lỗi tìm kiếm: {error.message}</p>
        </div>
      );
    }

    if (!hasResults && !isSearching) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Không tìm thấy kết quả cho &quot;{query}&quot;</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => 
          renderResult ? renderResult(result, index) : renderDefaultResult(result, index)
        )}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className={cn('client-search space-y-3', className)}>
      {/* Search input */}
      {renderSearchInput}
      
      {/* Search stats */}
      {renderSearchStats()}
      
      {/* Advanced options */}
      {renderAdvancedOptions()}
      
      {/* Search results */}
      {renderSearchResults()}
    </div>
  );
}

// ===== MEMOIZED EXPORT =====

/**
 * Memoized ClientSearch component cho performance optimization
 */
export const ClientSearch = React.memo(ClientSearchComponent, (prevProps, nextProps) => {
  // Custom comparison cho better performance
  return (
    prevProps.questions === nextProps.questions &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.showStats === nextProps.showStats &&
    prevProps.showAdvancedOptions === nextProps.showAdvancedOptions &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.searchOptions) === JSON.stringify(nextProps.searchOptions)
  );
});
