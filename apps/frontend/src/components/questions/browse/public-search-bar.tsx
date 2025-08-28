/**
 * Public Search Bar Component
 * Search bar với debouncing cho public question browsing theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";

// Import UI components
import { Input, Button } from "@/components/ui";

// Import utilities
import { useDebounce } from "@/hooks/useDebounce";

// ===== CONSTANTS =====

const DEBOUNCE_DELAY = 300; // ms
const MIN_SEARCH_LENGTH = 2; // Minimum characters to trigger search
const MAX_SEARCH_LENGTH = 100; // Maximum search query length

// ===== TYPES =====

export interface PublicSearchBarProps {
  /** Search handler function */
  onSearch: (query: string) => void;
  
  /** Clear search handler */
  onClear?: () => void;
  
  /** Initial search query */
  initialQuery?: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Show suggestions dropdown */
  showSuggestions?: boolean;
  
  /** Auto-focus on mount */
  autoFocus?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Search suggestions */
  suggestions?: string[];
  
  /** Suggestion select handler */
  onSuggestionSelect?: (suggestion: string) => void;
  
  /** Show suggestions handler */
  onShowSuggestions?: (show: boolean) => void;
}

// ===== MAIN COMPONENT =====

export const PublicSearchBar: React.FC<PublicSearchBarProps> = ({
  onSearch,
  onClear,
  initialQuery = '',
  placeholder = 'Tìm kiếm câu hỏi...',
  isLoading = false,
  showSuggestions = false,
  autoFocus = false,
  disabled = false,
  className = '',
  suggestions = [],
  onSuggestionSelect,
  onShowSuggestions
}) => {
  // ===== STATE =====
  
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounced search query
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);
  
  // ===== EFFECTS =====
  
  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      if (debouncedQuery.length >= MIN_SEARCH_LENGTH) {
        onSearch(debouncedQuery);
      } else if (debouncedQuery.length === 0) {
        onSearch('');
      }
    }
  }, [debouncedQuery, initialQuery, onSearch]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onShowSuggestions?.(false);
        setSelectedSuggestionIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onShowSuggestions]);
  
  // ===== EVENT HANDLERS =====
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value.slice(0, MAX_SEARCH_LENGTH);
    setQuery(newQuery);
    setSelectedSuggestionIndex(-1);
    
    // Show suggestions when typing
    if (newQuery.length >= MIN_SEARCH_LENGTH && suggestions.length > 0) {
      onShowSuggestions?.(true);
    } else {
      onShowSuggestions?.(false);
    }
  }, [suggestions.length, onShowSuggestions]);
  
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (query.length >= MIN_SEARCH_LENGTH && suggestions.length > 0) {
      onShowSuggestions?.(true);
    }
  }, [query.length, suggestions.length, onShowSuggestions]);
  
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      onShowSuggestions?.(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  }, [onShowSuggestions]);
  
  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedSuggestionIndex(-1);
    onShowSuggestions?.(false);
    onClear?.();
    onSearch('');
    inputRef.current?.focus();
  }, [onClear, onSearch, onShowSuggestions]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(query);
        onShowSuggestions?.(false);
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          setQuery(selectedSuggestion);
          onSuggestionSelect?.(selectedSuggestion);
          onSearch(selectedSuggestion);
        } else {
          onSearch(query);
        }
        onShowSuggestions?.(false);
        setSelectedSuggestionIndex(-1);
        break;
        
      case 'Escape':
        e.preventDefault();
        onShowSuggestions?.(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, query, onSearch, onSuggestionSelect, onShowSuggestions]);
  
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion);
    onShowSuggestions?.(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  }, [onSuggestionSelect, onSearch, onShowSuggestions]);
  
  // ===== COMPUTED VALUES =====
  
  const showClearButton = query.length > 0 && !disabled;
  const showLoadingIndicator = isLoading && query.length >= MIN_SEARCH_LENGTH;
  
  // ===== RENDER =====
  
  return (
    <div className={cn("public-search-bar relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pl-10 pr-20 transition-all duration-200",
              isFocused && "ring-2 ring-primary/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            autoComplete="off"
            spellCheck="false"
            maxLength={MAX_SEARCH_LENGTH}
          />
          
          {/* Right Side Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Loading Indicator */}
            {showLoadingIndicator && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
            
            {/* Clear Button */}
            {showClearButton && !showLoadingIndicator && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-muted/80"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                "flex items-center gap-2",
                selectedSuggestionIndex === index && "bg-muted"
              )}
            >
              <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== DEFAULT EXPORT =====

export default PublicSearchBar;
