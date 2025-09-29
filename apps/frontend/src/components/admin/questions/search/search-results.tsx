/**
 * Search Results Component
 * Component hiển thị search results với highlighting
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge, Card, CardContent } from '@/components/ui';
import { FileText, Clock, Hash, Star } from 'lucide-react';
import { SearchResult } from '@/lib/utils/search-utils';
import { SearchHighlight, LaTeXSearchHighlight } from '@/components/ui/search/search-highlight';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface SearchResultsProps {
  /** Search results */
  results: SearchResult[];
  /** Current search query */
  query: string;
  /** Show search stats */
  showStats?: boolean;
  /** Show match details */
  showMatchDetails?: boolean;
  /** Callback khi click result */
  onResultClick?: (result: SearchResult) => void;
  /** Custom result renderer */
  renderResult?: (result: SearchResult, index: number) => React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Max results để hiển thị */
  maxResults?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Search time */
  searchTime?: number;
}

export interface SearchResultItemProps {
  /** Search result */
  result: SearchResult;
  /** Search query */
  query: string;
  /** Show match details */
  showMatchDetails?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ===== COMPONENTS =====

/**
 * Search Result Item Component
 * Individual search result item với highlighting
 */
export function SearchResultItem({
  result,
  query,
  showMatchDetails = true,
  onClick,
  className = ''
}: SearchResultItemProps) {
  const { item: question, score, matches } = result;

  // ===== RENDER HELPERS =====

  /**
   * Render question type badge
   */
  const renderTypeBadge = () => {
    const typeLabels = {
      MC: 'Trắc nghiệm',
      MULTIPLE_CHOICE: 'Trắc nghiệm',
      TF: 'Đúng/Sai',
      SA: 'Trả lời ngắn',
      ES: 'Tự luận',
      MA: 'Ghép đôi'
    };

    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[question.type] || question.type}
      </Badge>
    );
  };

  /**
   * Render difficulty badge
   */
  const renderDifficultyBadge = () => {
    if (!question.difficulty) return null;

    const difficultyColors = {
      EASY: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-red-100 text-red-800',
      EXPERT: 'bg-purple-100 text-purple-800'
    };

    const difficultyLabels = {
      EASY: 'Dễ',
      MEDIUM: 'Trung bình',
      HARD: 'Khó',
      EXPERT: 'Chuyên gia'
    };

    return (
      <Badge 
        variant="secondary" 
        className={cn('text-xs', difficultyColors[question.difficulty])}
      >
        {difficultyLabels[question.difficulty]}
      </Badge>
    );
  };

  /**
   * Render match details
   */
  const renderMatchDetails = () => {
    if (!showMatchDetails || matches.length === 0) return null;

    const fieldLabels = {
      content: 'Nội dung',
      rawContent: 'LaTeX',
      solution: 'Lời giải',
      tag: 'Tags',
      questionCodeId: 'Mã câu hỏi',
      subcount: 'Subcount',
      source: 'Nguồn'
    };

    const uniqueFields = [...new Set(matches.map(m => m.field))];

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {uniqueFields.map(field => (
          <Badge key={field} variant="secondary" className="text-xs">
            {fieldLabels[field as keyof typeof fieldLabels] || field}
          </Badge>
        ))}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <Card 
      className={cn(
        'search-result-item cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <code className="text-sm bg-muted px-2 py-1 rounded">
              <SearchHighlight
                text={question.questionCodeId}
                searchTerms={query}
                options={{ highlightClass: 'bg-yellow-200' }}
              />
            </code>
            {renderTypeBadge()}
            {renderDifficultyBadge()}
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {score.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="text-sm">
            <LaTeXSearchHighlight
              text={question.content}
              searchTerms={query}
              maxLength={200}
              className="line-clamp-3"
            />
          </div>

          {/* Solution preview nếu có match */}
          {question.solution && matches.some(m => m.field === 'solution') && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <span className="font-medium">Lời giải: </span>
              <LaTeXSearchHighlight
                text={question.solution}
                searchTerms={query}
                maxLength={100}
              />
            </div>
          )}

          {/* Tags */}
          {question.tag && question.tag.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.tag.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <SearchHighlight
                    text={tag}
                    searchTerms={query}
                    options={{ highlightClass: 'bg-blue-200' }}
                  />
                </Badge>
              ))}
              {question.tag.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{question.tag.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Match details */}
          {renderMatchDetails()}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Search Results Component
 * Main component hiển thị danh sách search results
 */
export function SearchResults({
  results,
  query,
  showStats = true,
  showMatchDetails = true,
  onResultClick,
  renderResult,
  className = '',
  maxResults = 50,
  isLoading = false,
  searchTime
}: SearchResultsProps) {
  // ===== COMPUTED VALUES =====

  const displayResults = maxResults ? results.slice(0, maxResults) : results;
  const hasResults = results.length > 0;

  // ===== RENDER HELPERS =====

  /**
   * Render search stats
   */
  const renderSearchStats = () => {
    if (!showStats || !query) return null;

    return (
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span>{results.length} kết quả</span>
          </div>
          {searchTime !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{searchTime.toFixed(1)}ms</span>
            </div>
          )}
        </div>
        
        {maxResults && results.length > maxResults && (
          <span className="text-xs">
            Hiển thị {maxResults} / {results.length} kết quả
          </span>
        )}
      </div>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Đang tìm kiếm...</span>
      </div>
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Không tìm thấy kết quả cho &quot;{query}&quot;</p>
        <p className="text-xs mt-1">Thử sử dụng từ khóa khác hoặc kiểm tra chính tả</p>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading) {
    return (
      <div className={cn('search-results', className)}>
        {renderSearchStats()}
        {renderLoadingState()}
      </div>
    );
  }

  if (!hasResults && query) {
    return (
      <div className={cn('search-results', className)}>
        {renderSearchStats()}
        {renderEmptyState()}
      </div>
    );
  }

  if (!query) {
    return null;
  }

  return (
    <div className={cn('search-results space-y-3', className)}>
      {/* Search stats */}
      {renderSearchStats()}
      
      {/* Results list */}
      <div className="space-y-3">
        {displayResults.map((result, index) => 
          renderResult ? (
            renderResult(result, index)
          ) : (
            <SearchResultItem
              key={result.item.id}
              result={result}
              query={query}
              showMatchDetails={showMatchDetails}
              onClick={() => onResultClick?.(result)}
            />
          )
        )}
      </div>
    </div>
  );
}
