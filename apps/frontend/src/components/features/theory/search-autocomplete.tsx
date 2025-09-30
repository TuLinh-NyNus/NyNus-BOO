/**
 * Search Auto-complete Component
 * Advanced auto-complete với keyboard navigation và suggestion categorization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import {
  Search,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSearchEngine } from "@/lib/search";

// ===== TYPES =====

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'content' | 'formula' | 'keyword';
  category?: string;
  count?: number;
  relevance?: number;
  description?: string;
  metadata?: {
    subject?: string;
    grade?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface SearchAutoCompleteProps {
  /** Current search query */
  query: string;
  
  /** Handler khi suggestion được select */
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  
  /** Handler khi close auto-complete */
  onClose: () => void;
  
  /** Maximum số suggestions hiển thị */
  maxSuggestions?: number;
  
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  
  /** Show recent searches */
  showRecentSearches?: boolean;
  
  /** Show trending terms */
  showTrendingTerms?: boolean;
  
  /** Show content-based suggestions */
  showContentSuggestions?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_SUGGESTIONS = 8;
const SUGGESTION_DEBOUNCE_DELAY = 150;
const _MAX_RECENT_SEARCHES = 5;

// ===== MAIN COMPONENT =====

export function SearchAutoComplete({
  query,
  onSuggestionSelect,
  onClose,
  maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
  enableKeyboardNavigation = true,
  showRecentSearches = true,
  showTrendingTerms = true,
  showContentSuggestions = true,
  className
}: SearchAutoCompleteProps) {
  
  // ===== STATE =====
  
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ===== REFS =====
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    // Load recent searches từ localStorage - chỉ trên client
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theory-recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          // Ignore invalid JSON và clear invalid data
          localStorage.removeItem('theory-recent-searches');
        }
      }
    }
  }, []);

  // useEffect moved after generateSuggestions definition

  // useEffect moved after handleSuggestionSelect definition

  // ===== HANDLERS =====

  const generateSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    const allSuggestions: SearchSuggestion[] = [];

    try {
      // 1. Recent searches suggestions
      if (showRecentSearches && !searchQuery.trim()) {
        const recentSuggestions = recentSearches.slice(0, 3).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: 'recent' as const,
          description: 'Tìm kiếm gần đây'
        }));
        allSuggestions.push(...recentSuggestions);
      }

      // 2. Content-based suggestions từ search engine
      if (showContentSuggestions && searchQuery.trim()) {
        try {
          const searchEngine = getSearchEngine();
          const contentSuggestions = await searchEngine.getSearchSuggestions(
            searchQuery, 
            Math.min(5, maxSuggestions - allSuggestions.length)
          );
          
          const formattedContentSuggestions = contentSuggestions.map((text, index) => ({
            id: `content-${index}`,
            text,
            type: 'content' as const,
            description: 'Từ nội dung lý thuyết',
            relevance: 0.8 - (index * 0.1)
          }));
          
          allSuggestions.push(...formattedContentSuggestions);
        } catch (error) {
          console.warn('Failed to get content suggestions:', error);
        }
      }

      // 3. Trending terms suggestions
      if (showTrendingTerms && searchQuery.trim()) {
        const trendingTerms = [
          'phương trình bậc hai',
          'định lý pythagoras', 
          'tích phân từng phần',
          'hàm số lượng giác',
          'ma trận nghịch đảo',
          'giới hạn hàm số',
          'đạo hàm cấp cao',
          'chuỗi số học'
        ].filter(term => 
          term.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const trendingSuggestions = trendingTerms.slice(0, 3).map((term, index) => ({
          id: `trending-${index}`,
          text: term,
          type: 'trending' as const,
          description: 'Thuật ngữ phổ biến',
          count: Math.floor(Math.random() * 100) + 50,
          metadata: {
            subject: 'TOÁN',
            grade: 12,
            difficulty: 'medium' as const
          }
        }));

        allSuggestions.push(...trendingSuggestions);
      }

      // 4. Formula suggestions cho mathematical queries
      if (searchQuery.trim() && /[+\-*/=^()x]/.test(searchQuery)) {
        const formulaSuggestions = [
          {
            id: 'formula-1',
            text: 'ax² + bx + c = 0',
            type: 'formula' as const,
            description: 'Phương trình bậc hai',
            metadata: { subject: 'TOÁN', grade: 9, difficulty: 'medium' as const }
          },
          {
            id: 'formula-2', 
            text: 'a² + b² = c²',
            type: 'formula' as const,
            description: 'Định lý Pythagoras',
            metadata: { subject: 'TOÁN', grade: 8, difficulty: 'easy' as const }
          }
        ].filter(formula => 
          formula.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formula.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        allSuggestions.push(...formulaSuggestions);
      }

      // Sort by relevance và limit
      const sortedSuggestions = allSuggestions
        .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
        .slice(0, maxSuggestions);

      setSuggestions(sortedSuggestions);
      setSelectedIndex(-1);

    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    showRecentSearches, 
    showContentSuggestions, 
    showTrendingTerms, 
    maxSuggestions, 
    recentSearches
  ]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    onSuggestionSelect(suggestion);
    onClose();
  }, [onSuggestionSelect, onClose]);

  // Re-create effect after generateSuggestions is defined
  useEffect(() => {
    // Generate suggestions khi query thay đổi
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      generateSuggestions(query);
    }, SUGGESTION_DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, generateSuggestions]);

  // Re-create keyboard effect after handleSuggestionSelect is defined
  useEffect(() => {
    // Keyboard event listener
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, suggestions, enableKeyboardNavigation, onClose, handleSuggestionSelect]);

  // ===== RENDER HELPERS =====

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'content':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'formula':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'keyword':
        return <Zap className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderSuggestion = (suggestion: SearchSuggestion, index: number) => {
    const isSelected = index === selectedIndex;

    return (
      <div
        key={suggestion.id}
        onClick={() => handleSuggestionSelect(suggestion)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
          "hover:bg-muted/50 rounded-md",
          isSelected && "bg-muted"
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {getSuggestionIcon(suggestion)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{suggestion.text}</span>
            {suggestion.count && (
              <Badge variant="secondary" className="text-xs">
                {suggestion.count}
              </Badge>
            )}
          </div>
          
          {suggestion.description && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {suggestion.description}
            </div>
          )}
          
          {suggestion.metadata && (
            <div className="flex items-center gap-2 mt-1">
              {suggestion.metadata.subject && (
                <Badge variant="outline" className="text-xs">
                  {suggestion.metadata.subject}
                </Badge>
              )}
              {suggestion.metadata.grade && (
                <Badge variant="outline" className="text-xs">
                  Lớp {suggestion.metadata.grade}
                </Badge>
              )}
              {suggestion.metadata.difficulty && (
                <span className={cn("text-xs", getDifficultyColor(suggestion.metadata.difficulty))}>
                  {suggestion.metadata.difficulty === 'easy' ? 'Dễ' : 
                   suggestion.metadata.difficulty === 'medium' ? 'TB' : 'Khó'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card ref={containerRef} className={cn("absolute top-full left-0 right-0 mt-1 z-50", className)}>
      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tìm gợi ý...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </div>
        )}
        
        {/* Footer hint */}
        {enableKeyboardNavigation && suggestions.length > 0 && (
          <div className="border-t mt-2 pt-2 text-xs text-muted-foreground text-center">
            ↑↓ để điều hướng • Enter để chọn • Esc để đóng
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Auto-complete
 * Phiên bản compact cho mobile
 */
export function CompactSearchAutoComplete(props: SearchAutoCompleteProps) {
  return (
    <SearchAutoComplete
      {...props}
      maxSuggestions={5}
      showTrendingTerms={false}
      className={cn("compact-autocomplete", props.className)}
    />
  );
}

/**
 * Advanced Auto-complete
 * Phiên bản đầy đủ với tất cả features
 */
export function AdvancedSearchAutoComplete(props: SearchAutoCompleteProps) {
  return (
    <SearchAutoComplete
      {...props}
      maxSuggestions={10}
      showRecentSearches={true}
      showTrendingTerms={true}
      showContentSuggestions={true}
      enableKeyboardNavigation={true}
      className={cn("advanced-autocomplete", props.className)}
    />
  );
}
