/**
 * Search Suggestions Component
 * Autocomplete suggestions cho public search theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, Clock, TrendingUp, X } from "lucide-react";

// Import UI components
import { Button } from "@/components/ui";

// ===== CONSTANTS =====

const MAX_RECENT_SEARCHES = 5;
const MAX_SUGGESTIONS = 8;
const POPULAR_SEARCH_TERMS = [
  'phương trình bậc hai',
  'hình học không gian',
  'đạo hàm',
  'tích phân',
  'xác suất',
  'ma trận',
  'số phức',
  'hàm số'
];

// ===== TYPES =====

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'query';
  icon?: React.ReactNode;
  description?: string;
}

export interface SearchSuggestionsProps {
  /** Current search query */
  query: string;
  
  /** Suggestion select handler */
  onSuggestionSelect: (suggestion: string) => void;
  
  /** Clear recent searches handler */
  onClearRecent?: () => void;
  
  /** Show recent searches */
  showRecent?: boolean;
  
  /** Show popular searches */
  showPopular?: boolean;
  
  /** Show query-based suggestions */
  showQueryBased?: boolean;
  
  /** Maximum number of suggestions */
  maxSuggestions?: number;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get recent searches from localStorage
 */
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('nynus-recent-searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save recent searches to localStorage
 */
const saveRecentSearches = (searches: string[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('nynus-recent-searches', JSON.stringify(searches));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Add search to recent searches
 */
const addToRecentSearches = (query: string): void => {
  if (!query.trim()) return;
  
  const recent = getRecentSearches();
  const updated = [
    query,
    ...recent.filter(item => item !== query)
  ].slice(0, MAX_RECENT_SEARCHES);
  
  saveRecentSearches(updated);
};

/**
 * Clear recent searches
 */
const clearRecentSearches = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('nynus-recent-searches');
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Generate query-based suggestions
 */
const generateQuerySuggestions = (query: string): string[] => {
  if (!query.trim() || query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  
  // Filter popular terms that match the query
  const matchingTerms = POPULAR_SEARCH_TERMS.filter(term =>
    term.toLowerCase().includes(queryLower)
  );
  
  // Add some dynamic suggestions based on query
  const dynamicSuggestions: string[] = [];
  
  if (queryLower.includes('phương trình')) {
    dynamicSuggestions.push('phương trình bậc nhất', 'phương trình bậc hai', 'hệ phương trình');
  }
  
  if (queryLower.includes('hình')) {
    dynamicSuggestions.push('hình học phẳng', 'hình học không gian', 'hình học tọa độ');
  }
  
  if (queryLower.includes('đạo hàm')) {
    dynamicSuggestions.push('đạo hàm cấp cao', 'ứng dụng đạo hàm', 'quy tắc đạo hàm');
  }
  
  return [...new Set([...matchingTerms, ...dynamicSuggestions])].slice(0, 4);
};

// ===== MAIN COMPONENT =====

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSuggestionSelect,
  onClearRecent,
  showRecent = true,
  showPopular = true,
  showQueryBased = true,
  maxSuggestions = MAX_SUGGESTIONS,
  className = ''
}) => {
  // ===== STATE =====
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // ===== EFFECTS =====
  
  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);
  
  // ===== COMPUTED VALUES =====
  
  const suggestions = useMemo((): SearchSuggestion[] => {
    const allSuggestions: SearchSuggestion[] = [];
    
    // Query-based suggestions (highest priority)
    if (showQueryBased && query.trim().length >= 2) {
      const querySuggestions = generateQuerySuggestions(query);
      querySuggestions.forEach((text, index) => {
        allSuggestions.push({
          id: `query-${index}`,
          text,
          type: 'query',
          icon: <Search className="h-4 w-4" />,
          description: 'Gợi ý tìm kiếm'
        });
      });
    }
    
    // Recent searches (if no query or query is short)
    if (showRecent && query.trim().length < 2 && recentSearches.length > 0) {
      recentSearches.forEach((text, index) => {
        allSuggestions.push({
          id: `recent-${index}`,
          text,
          type: 'recent',
          icon: <Clock className="h-4 w-4" />,
          description: 'Tìm kiếm gần đây'
        });
      });
    }
    
    // Popular searches (fill remaining slots)
    if (showPopular && allSuggestions.length < maxSuggestions) {
      const remainingSlots = maxSuggestions - allSuggestions.length;
      const popularToShow = POPULAR_SEARCH_TERMS
        .filter(term => !allSuggestions.some(s => s.text === term))
        .slice(0, remainingSlots);
      
      popularToShow.forEach((text, index) => {
        allSuggestions.push({
          id: `popular-${index}`,
          text,
          type: 'popular',
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'Tìm kiếm phổ biến'
        });
      });
    }
    
    return allSuggestions.slice(0, maxSuggestions);
  }, [query, recentSearches, showRecent, showPopular, showQueryBased, maxSuggestions]);
  
  // ===== EVENT HANDLERS =====
  
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    // Add to recent searches if it's not already a recent search
    if (suggestion.type !== 'recent') {
      addToRecentSearches(suggestion.text);
      setRecentSearches(getRecentSearches());
    }
    
    onSuggestionSelect(suggestion.text);
  }, [onSuggestionSelect]);
  
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
    onClearRecent?.();
  }, [onClearRecent]);
  
  // ===== RENDER =====
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("search-suggestions", className)}>
      {/* Recent Searches Header */}
      {showRecent && recentSearches.length > 0 && query.trim().length < 2 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">
            Tìm kiếm gần đây
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearRecent}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa
          </Button>
        </div>
      )}
      
      {/* Suggestions List */}
      <div className="py-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              "w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors",
              "flex items-center gap-3 group"
            )}
          >
            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors",
              suggestion.type === 'recent' && "text-blue-500",
              suggestion.type === 'popular' && "text-orange-500",
              suggestion.type === 'query' && "text-green-500"
            )}>
              {suggestion.icon}
            </div>
            
            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {suggestion.text}
              </div>
              {suggestion.description && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer */}
      {showQueryBased && query.trim().length >= 2 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Nhấn Enter để tìm kiếm &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Hook to manage search suggestions
 */
export const useSearchSuggestions = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);
  
  const addSearch = useCallback((query: string) => {
    addToRecentSearches(query);
    setRecentSearches(getRecentSearches());
  }, []);
  
  const clearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);
  
  return {
    recentSearches,
    addSearch,
    clearRecent
  };
};

// ===== DEFAULT EXPORT =====

export default SearchSuggestions;
