/**
 * Search Interface Component
 * Mobile-first search interface với instant search và filters
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/display/badge";
import {
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEARCH_CONSTANTS } from "@/lib/search";

// ===== TYPES =====

export interface SearchFilters {
  subjects?: string[];
  grades?: number[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  estimatedTimeRange?: [number, number];
}

export interface SearchInterfaceProps {
  /** Handler khi search được trigger */
  onSearch: (query: string, filters?: SearchFilters) => void;
  
  /** Placeholder text cho search input */
  placeholder?: string;
  
  /** Enable filter controls */
  enableFilters?: boolean;
  
  /** Enable auto-complete suggestions */
  enableAutoComplete?: boolean;
  
  /** Show recent searches */
  showRecentSearches?: boolean;
  
  /** Mobile-optimized design */
  mobileOptimized?: boolean;
  
  /** Initial search query */
  initialQuery?: string;
  
  /** Initial filters */
  initialFilters?: SearchFilters;
  
  /** Debounce delay cho search */
  debounceDelay?: number;
  
  /** Custom CSS classes */
  className?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'suggestion' | 'trending';
  count?: number;
}

// ===== CONSTANTS =====

const DEFAULT_DEBOUNCE_DELAY = 300;
const MAX_RECENT_SEARCHES = 5;
const MAX_SUGGESTIONS = 8;

// ===== MAIN COMPONENT =====

export function SearchInterface({
  onSearch,
  placeholder = "Tìm kiếm lý thuyết, công thức, bài tập...",
  enableFilters = true,
  enableAutoComplete = true,
  showRecentSearches = true,
  mobileOptimized = true,
  initialQuery = "",
  initialFilters = {},
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  className
}: SearchInterfaceProps) {
  
  // ===== STATE =====
  
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ===== REFS =====
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    // Load recent searches từ localStorage
    const saved = localStorage.getItem('theory-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Move this effect after handleSearch is defined

  // ===== HANDLERS =====

  // handleInputChange will be defined after dependencies

  const handleSearch = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Add to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)]
      .slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updatedRecent);
    localStorage.setItem('theory-recent-searches', JSON.stringify(updatedRecent));

    // Hide suggestions
    setShowSuggestions(false);

    // Trigger search
    onSearch(searchQuery, searchFilters || filters);
    
    setTimeout(() => setIsSearching(false), 100);
  }, [recentSearches, filters, onSearch]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text, filters);
  }, [filters, handleSearch]);

  const handleClearQuery = useCallback(() => {
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (query.trim()) {
      handleSearch(query, newFilters);
    }
  }, [query, handleSearch]);

  // Auto-search effect after handleSearch is defined
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery, initialFilters);
    }
  }, [initialQuery, initialFilters, handleSearch]);

  // Move handleInputChange after generateSuggestions is defined

  const generateSuggestions = useCallback((searchQuery: string) => {
    const suggestions: SearchSuggestion[] = [];

    // Recent searches matching query
    if (showRecentSearches) {
      const matchingRecent = recentSearches
        .filter(search => search.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3);
      
      suggestions.push(...matchingRecent.map(text => ({
        text,
        type: 'recent' as const
      })));
    }

    // Mock suggestions (trong thực tế sẽ từ search engine)
    const mockSuggestions = [
      'phương trình bậc hai',
      'định lý pythagoras',
      'tích phân từng phần',
      'hàm số lượng giác',
      'ma trận nghịch đảo'
    ].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    suggestions.push(...mockSuggestions.slice(0, 5).map(text => ({
      text,
      type: 'suggestion' as const,
      count: Math.floor(Math.random() * 100) + 10
    })));

    setSuggestions(suggestions.slice(0, MAX_SUGGESTIONS));
  }, [recentSearches, showRecentSearches]);

  // handleInputChange defined after generateSuggestions
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Show suggestions nếu có query
    if (newQuery.trim() && enableAutoComplete) {
      setShowSuggestions(true);
      generateSuggestions(newQuery);
    } else {
      setShowSuggestions(false);
    }

    // Debounced search
    if (newQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        handleSearch(newQuery, filters);
      }, debounceDelay);
    }
  }, [filters, debounceDelay, enableAutoComplete, generateSuggestions, handleSearch]);

  // ===== RENDER HELPERS =====

  const renderSearchInput = () => (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => enableAutoComplete && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-12 py-3 text-base",
            mobileOptimized && "touch-target min-h-[48px]"
          )}
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearQuery}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
        <CardContent className="p-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors",
                "flex items-center gap-2",
                mobileOptimized && "touch-target min-h-[44px]"
              )}
            >
              {suggestion.type === 'recent' && <Clock className="h-4 w-4 text-muted-foreground" />}
              {suggestion.type === 'trending' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
              {suggestion.type === 'suggestion' && <Search className="h-4 w-4 text-muted-foreground" />}
              
              <span className="flex-1">{suggestion.text}</span>
              
              {suggestion.count && (
                <Badge variant="secondary" className="text-xs">
                  {suggestion.count}
                </Badge>
              )}
            </button>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => {
    if (!enableFilters || !showFilters) return null;

    return (
      <Card className="mt-3">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Subject filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Môn học</label>
              <div className="flex flex-wrap gap-2">
                {SEARCH_CONSTANTS.SUBJECTS.map(subject => (
                  <Button
                    key={subject}
                    variant={filters.subjects?.includes(subject) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newSubjects = filters.subjects?.includes(subject)
                        ? filters.subjects.filter(s => s !== subject)
                        : [...(filters.subjects || []), subject];
                      handleFilterChange({ ...filters, subjects: newSubjects });
                    }}
                    className={mobileOptimized ? "touch-target" : ""}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grade filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Lớp</label>
              <div className="flex flex-wrap gap-2">
                {SEARCH_CONSTANTS.GRADES.map(grade => (
                  <Button
                    key={grade}
                    variant={filters.grades?.includes(grade) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newGrades = filters.grades?.includes(grade)
                        ? filters.grades.filter(g => g !== grade)
                        : [...(filters.grades || []), grade];
                      handleFilterChange({ ...filters, grades: newGrades });
                    }}
                    className={mobileOptimized ? "touch-target" : ""}
                  >
                    Lớp {grade}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Độ khó</label>
              <div className="flex gap-2">
                {SEARCH_CONSTANTS.DIFFICULTIES.map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={filters.difficulty?.includes(difficulty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newDifficulty = filters.difficulty?.includes(difficulty)
                        ? filters.difficulty.filter(d => d !== difficulty)
                        : [...(filters.difficulty || []), difficulty];
                      handleFilterChange({ ...filters, difficulty: newDifficulty });
                    }}
                    className={mobileOptimized ? "touch-target" : ""}
                  >
                    {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div ref={containerRef} className={cn("search-interface", className)}>
      <Card>
        <CardContent className="p-4">
          {/* Search input */}
          {renderSearchInput()}

          {/* Filter toggle */}
          {enableFilters && (
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2",
                  mobileOptimized && "touch-target"
                )}
              >
                <Filter className="h-4 w-4" />
                <span>Bộ lọc</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {/* Active filters count */}
              {(filters.subjects?.length || filters.grades?.length || filters.difficulty?.length) && (
                <Badge variant="secondary">
                  {(filters.subjects?.length || 0) + (filters.grades?.length || 0) + (filters.difficulty?.length || 0)} bộ lọc
                </Badge>
              )}
            </div>
          )}

          {/* Suggestions dropdown */}
          {renderSuggestions()}
        </CardContent>
      </Card>

      {/* Filters panel */}
      {renderFilters()}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Search Interface
 * Phiên bản compact cho embedded use
 */
export function CompactSearchInterface(props: SearchInterfaceProps) {
  return (
    <SearchInterface
      {...props}
      enableFilters={false}
      showRecentSearches={false}
      className={cn("compact-search-interface", props.className)}
    />
  );
}

/**
 * Mobile Search Interface
 * Phiên bản tối ưu cho mobile
 */
export function MobileSearchInterface(props: SearchInterfaceProps) {
  return (
    <SearchInterface
      {...props}
      mobileOptimized={true}
      enableAutoComplete={true}
      enableFilters={true}
      className={cn("mobile-search-interface", props.className)}
    />
  );
}
