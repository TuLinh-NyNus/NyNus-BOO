/**
 * Search Results Component
 * Mobile-optimized search results với highlighted text và quick navigation
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import {
  BookOpen,
  Clock,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Star,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchHighlight, LaTeXSearchHighlight } from "@/components/ui/search/search-highlight";

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

export interface SearchResultsProps {
  /** Search results */
  results: SearchResult[];
  
  /** Search query */
  query: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Handler khi click result */
  onResultClick: (result: SearchResult) => void;
  
  /** Show text highlights */
  showHighlights?: boolean;
  
  /** Enable quick navigation */
  enableQuickNavigation?: boolean;
  
  /** Mobile-optimized design */
  mobileOptimized?: boolean;
  
  /** Show performance stats */
  showStats?: boolean;
  
  /** Search time in ms */
  searchTime?: number;
  
  /** Maximum results to display */
  maxResults?: number;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_RESULTS = 20;
const RELEVANCE_THRESHOLD = 0.3;

// ===== MAIN COMPONENT =====

export function SearchResults({
  results,
  query,
  isLoading = false,
  onResultClick,
  showHighlights = true,
  enableQuickNavigation = true,
  mobileOptimized = true,
  showStats = true,
  searchTime,
  maxResults = DEFAULT_MAX_RESULTS,
  className
}: SearchResultsProps) {
  
  // ===== STATE =====
  
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // ===== COMPUTED VALUES =====
  
  const displayResults = useMemo(() => {
    return results
      .filter(result => result.relevance >= RELEVANCE_THRESHOLD)
      .slice(0, maxResults);
  }, [results, maxResults]);

  const resultStats = useMemo(() => {
    const subjectCounts = displayResults.reduce((acc, result) => {
      acc[result.subject] = (acc[result.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const gradeCounts = displayResults.reduce((acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total: displayResults.length,
      subjects: subjectCounts,
      grades: gradeCounts,
      avgRelevance: displayResults.reduce((sum, r) => sum + r.relevance, 0) / displayResults.length
    };
  }, [displayResults]);

  // ===== HANDLERS =====

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick(result);
  }, [onResultClick]);

  const handleToggleExpanded = useCallback((resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  }, []);

  // ===== RENDER HELPERS =====

  const getDifficultyColor = (difficulty: SearchResult['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyLabel = (difficulty: SearchResult['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  };

  const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'title': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'formula': return <Target className="h-4 w-4 text-blue-500" />;
      case 'keyword': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderSearchStats = () => {
    if (!showStats || displayResults.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                <strong>{resultStats.total}</strong> kết quả
              </span>
              {searchTime && (
                <span>
                  trong <strong>{searchTime}ms</strong>
                </span>
              )}
              <span>
                Độ chính xác: <strong>{(resultStats.avgRelevance * 100).toFixed(1)}%</strong>
              </span>
            </div>

            {enableQuickNavigation && (
              <div className="flex items-center gap-2">
                <span className="text-xs">Môn học:</span>
                {Object.entries(resultStats.subjects).slice(0, 3).map(([subject, count]) => (
                  <Badge key={subject} variant="outline" className="text-xs">
                    {subject} ({count})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResultItem = (result: SearchResult, index: number) => {
    const isExpanded = expandedResults.has(result.id);
    const relevancePercentage = result.relevance * 100;

    return (
      <Card
        key={result.id}
        className={cn(
          "search-result-item cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-primary/20",
          mobileOptimized && "touch-target"
        )}
        onClick={() => handleResultClick(result)}
        role="button"
        aria-label={`Search result ${index + 1} of ${displayResults.length}: ${result.title}`}
        tabIndex={0}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">
                {showHighlights ? (
                  <SearchHighlight
                    text={result.title}
                    searchTerms={query}
                    className="font-semibold"
                  />
                ) : (
                  result.title
                )}
              </CardTitle>
              
              <CardDescription className="mt-1 flex items-center gap-2 text-sm">
                <span>{result.subject}</span>
                <span>•</span>
                <span>Lớp {result.grade}</span>
                <span>•</span>
                <span>Chương {result.chapter}</span>
                <span>•</span>
                <span className={getDifficultyColor(result.difficulty)}>
                  {getDifficultyLabel(result.difficulty)}
                </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-3">
              {getMatchTypeIcon(result.matchType)}
              <Badge variant="secondary" className="text-xs">
                {relevancePercentage.toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Relevance progress */}
          <Progress value={relevancePercentage} className="h-1 mt-2" />
        </CardHeader>

        <CardContent className="pt-0">
          {/* Content preview */}
          <div className="mb-3">
            {showHighlights ? (
              result.matchType === 'formula' ? (
                <LaTeXSearchHighlight
                  text={result.content}
                  searchTerms={query}
                  maxLength={isExpanded ? undefined : 200}
                  className="text-sm text-muted-foreground"
                />
              ) : (
                <SearchHighlight
                  text={result.content}
                  searchTerms={query}
                  maxLength={isExpanded ? undefined : 200}
                  className="text-sm text-muted-foreground"
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {result.content}
              </p>
            )}
          </div>

          {/* Highlights */}
          {showHighlights && result.highlights.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Đoạn trích nổi bật:</div>
              <div className="space-y-1">
                {result.highlights.slice(0, isExpanded ? undefined : 2).map((highlight, idx) => (
                  <div key={idx} className="text-xs bg-muted/50 rounded px-2 py-1">
                    <SearchHighlight
                      text={highlight}
                      searchTerms={query}
                      className="text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{result.estimatedTime} phút</span>
              </div>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Bài {result.lesson}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {result.highlights.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpanded(result.id);
                  }}
                  className="text-xs h-6 px-2"
                >
                  {isExpanded ? 'Thu gọn' : `+${result.highlights.length - 2} đoạn trích`}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(result.url, '_blank');
                }}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
              <div className="h-3 bg-muted rounded w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
        <p className="text-muted-foreground mb-4">
          Không có kết quả nào phù hợp với từ khóa &ldquo;{query}&rdquo;
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Gợi ý:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Kiểm tra chính tả từ khóa</li>
            <li>Thử sử dụng từ khóa khác</li>
            <li>Sử dụng bộ lọc để thu hẹp kết quả</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====

  if (isLoading) {
    return (
      <div className={cn("search-results", className)}>
        {renderSearchStats()}
        {renderLoadingState()}
      </div>
    );
  }

  if (displayResults.length === 0 && query) {
    return (
      <div className={cn("search-results", className)}>
        {renderEmptyState()}
      </div>
    );
  }

  if (!query) {
    return null;
  }

  return (
    <div className={cn("search-results space-y-4", className)}>
      {/* Search stats */}
      {renderSearchStats()}
      
      {/* Results list */}
      <div className="space-y-3">
        {displayResults.map((result, index) => renderResultItem(result, index))}
      </div>

      {/* Load more hint */}
      {results.length > maxResults && (
        <Card>
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Hiển thị {maxResults} trong {results.length} kết quả. 
            Sử dụng bộ lọc để thu hẹp kết quả.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Search Results
 * Phiên bản compact cho sidebar
 */
export function CompactSearchResults(props: SearchResultsProps) {
  return (
    <SearchResults
      {...props}
      showStats={false}
      enableQuickNavigation={false}
      maxResults={10}
      className={cn("compact-search-results", props.className)}
    />
  );
}

/**
 * Mobile Search Results
 * Phiên bản tối ưu cho mobile
 */
export function MobileSearchResults(props: SearchResultsProps) {
  return (
    <SearchResults
      {...props}
      mobileOptimized={true}
      showHighlights={true}
      enableQuickNavigation={true}
      className={cn("mobile-search-results", props.className)}
    />
  );
}
