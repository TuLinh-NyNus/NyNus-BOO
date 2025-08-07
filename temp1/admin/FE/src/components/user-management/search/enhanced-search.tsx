/**
 * Enhanced Search Component
 * Component tìm kiếm nâng cao với autocomplete, suggestions, và history
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input, Button, Badge, Card, CardContent } from "@/components/ui";
import { Search, X, Clock, TrendingUp, User, Mail, Shield, History, Loader2 } from "lucide-react";

import { AdminUser } from "../../../types/admin-user";
import { useSearchSuggestions, SearchSuggestion } from "../../../hooks/use-search-suggestions";
import { useSearchHistory } from "../../../hooks/use-search-history";
import { useSearchOptimization } from "../../../hooks/use-search-optimization";

/**
 * Enhanced Search Props
 * Props cho Enhanced Search component
 */
interface EnhancedSearchProps {
  users: AdminUser[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string, results: AdminUser[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Enhanced Search Component
 * Component tìm kiếm nâng cao
 */
export function EnhancedSearch({
  users,
  value,
  onChange,
  onSearch,
  placeholder = "Tìm kiếm theo email hoặc tên...",
  disabled = false,
  className = "",
}: EnhancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    getSuggestions,
    clearSuggestions,
    addRecentSearch,
    recentSearches,
  } = useSearchSuggestions(users, {
    maxSuggestions: 8,
    enableUserSuggestions: true,
    enableEmailSuggestions: true,
    enableRoleSuggestions: true,
    enableRecentSearches: true,
  });

  const {
    addSearch: addToHistory,
    recentSearches: historySearches,
    popularSearches,
    clearHistory,
  } = useSearchHistory({
    maxHistorySize: 50,
    enablePersistence: true,
    enableAnalytics: true,
  });

  const { optimizedSearch, buildIndex, isIndexing, isSearching, metrics } = useSearchOptimization({
    enableIndexing: true,
    enableCaching: true,
    enableMetrics: true,
  });

  /**
   * Build search index when users change
   * Xây dựng search index khi users thay đổi
   */
  useEffect(() => {
    if (users.length > 0) {
      buildIndex(users);
    }
  }, [users, buildIndex]);

  /**
   * Handle input change
   * Xử lý thay đổi input
   */
  const handleInputChange = useCallback(
    async (newValue: string) => {
      onChange(newValue);
      setSelectedIndex(-1);

      if (newValue.trim().length >= 2) {
        setIsOpen(true);
        setShowHistory(false);
        await getSuggestions(newValue);
      } else {
        setIsOpen(false);
        clearSuggestions();
      }
    },
    [onChange, getSuggestions, clearSuggestions]
  );

  /**
   * Handle search execution
   * Xử lý thực thi search
   */
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      const startTime = performance.now();

      try {
        const { results, executionTime, fromCache } = await optimizedSearch(query, users);

        // Add to history
        addToHistory(query, results.length, undefined, executionTime);
        addRecentSearch(query);

        // Callback with results
        if (onSearch) {
          onSearch(query, results);
        }

        // Close dropdown
        setIsOpen(false);
        setShowHistory(false);
      } catch (error) {
        console.error("Search failed:", error);
      }
    },
    [optimizedSearch, users, addToHistory, addRecentSearch, onSearch]
  );

  /**
   * Handle suggestion selection
   * Xử lý chọn suggestion
   */
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      onChange(suggestion.value);
      handleSearch(suggestion.value);
    },
    [onChange, handleSearch]
  );

  /**
   * Handle keyboard navigation
   * Xử lý navigation bằng keyboard
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" && !showHistory) {
          setShowHistory(true);
          setIsOpen(true);
          e.preventDefault();
        }
        return;
      }

      const items = showHistory ? historySearches : suggestions;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            if (showHistory) {
              const query = historySearches[selectedIndex];
              onChange(query);
              handleSearch(query);
            } else {
              handleSuggestionSelect(suggestions[selectedIndex]);
            }
          } else {
            handleSearch(value);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setShowHistory(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [
      isOpen,
      showHistory,
      selectedIndex,
      suggestions,
      historySearches,
      value,
      onChange,
      handleSearch,
      handleSuggestionSelect,
    ]
  );

  /**
   * Handle input focus
   * Xử lý focus input
   */
  const handleFocus = useCallback(() => {
    if (value.trim().length >= 2) {
      setIsOpen(true);
      getSuggestions(value);
    } else if (historySearches.length > 0) {
      setShowHistory(true);
      setIsOpen(true);
    }
  }, [value, getSuggestions, historySearches]);

  /**
   * Handle input blur
   * Xử lý blur input
   */
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setShowHistory(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  /**
   * Clear search
   * Xóa search
   */
  const handleClear = useCallback(() => {
    onChange("");
    setIsOpen(false);
    setShowHistory(false);
    clearSuggestions();
    inputRef.current?.focus();
  }, [onChange, clearSuggestions]);

  /**
   * Get suggestion icon
   * Lấy icon cho suggestion
   */
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case "user":
        return <User className="h-3 w-3" />;
      case "email":
        return <Mail className="h-3 w-3" />;
      case "role":
        return <Shield className="h-3 w-3" />;
      case "recent":
        return <Clock className="h-3 w-3" />;
      default:
        return <Search className="h-3 w-3" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="pl-8 pr-8"
        />

        {/* Loading Indicator */}
        {(isSuggestionsLoading || isSearching || isIndexing) && (
          <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {/* Clear Button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg"
        >
          <CardContent className="p-0">
            {showHistory ? (
              /* Search History */
              <div>
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tìm kiếm gần đây</span>
                  </div>
                  {historySearches.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs">
                      Xóa tất cả
                    </Button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {historySearches.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Chưa có lịch sử tìm kiếm
                    </div>
                  ) : (
                    historySearches.slice(0, 8).map((query, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted ${
                          selectedIndex === index ? "bg-muted" : ""
                        }`}
                        onClick={() => {
                          onChange(query);
                          handleSearch(query);
                        }}
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{query}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div className="border-t">
                    <div className="flex items-center gap-2 p-3">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tìm kiếm phổ biến</span>
                    </div>
                    <div className="flex flex-wrap gap-1 p-3 pt-0">
                      {popularSearches.slice(0, 5).map((query, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            onChange(query);
                            handleSearch(query);
                          }}
                        >
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Search Suggestions */
              <div className="max-h-60 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {isSuggestionsLoading ? "Đang tìm kiếm..." : "Không có gợi ý"}
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted ${
                        selectedIndex === index ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {getSuggestionIcon(suggestion)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{suggestion.label}</div>
                        {suggestion.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Metrics (Development only) */}
      {process.env.NODE_ENV === "development" && metrics.totalSearches > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-muted rounded text-xs text-muted-foreground">
          Searches: {metrics.totalSearches} | Avg: {metrics.averageExecutionTime.toFixed(1)}ms |
          Cache: {metrics.cacheSize} (
          {((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}% hit
          rate)
        </div>
      )}
    </div>
  );
}
