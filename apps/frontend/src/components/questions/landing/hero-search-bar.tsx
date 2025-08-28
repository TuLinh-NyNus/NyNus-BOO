/**
 * Hero Search Bar Component
 * Search bar component cho hero section với debouncing và store integration
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { usePublicQuestionFiltersStore, publicQuestionFiltersSelectors } from '@/lib/stores/public';
import { QUESTION_ROUTES } from '@/lib/question-paths';

// ===== TYPES =====

/**
 * Hero Search Bar Props Interface
 * Props cho HeroSearchBar component
 */
export interface HeroSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// ===== CONSTANTS =====

const DEBOUNCE_DELAY = 300;
const MAX_SUGGESTIONS = 6;
const MAX_RECENT_SEARCHES = 5;

// Mock suggestions data (sẽ được thay thế bằng real data sau)
const MOCK_SUGGESTIONS = [
  'phương trình bậc hai',
  'tích phân xác định', 
  'định lý pythagoras',
  'hàm số lượng giác',
  'ma trận nghịch đảo',
  'xác suất có điều kiện'
];

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function
 * Delay execution của function
 */
function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// ===== MAIN COMPONENT =====

/**
 * Hero Search Bar Component
 * Search bar với debouncing, suggestions, và store integration
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Recent searches display
 * - Search suggestions dropdown
 * - Keyboard navigation support
 * - Integration với PublicQuestionFiltersStore
 * - Responsive design
 */
export function HeroSearchBar({
  placeholder = 'Tìm kiếm câu hỏi toán học...',
  onSearch,
  showSuggestions = true,
  showRecentSearches = true,
  autoFocus = false,
  className
}: HeroSearchBarProps) {
  // ===== HOOKS =====
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Local state
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Store state và actions
  const searchHistory = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchHistory);
  const setSearchQuery = usePublicQuestionFiltersStore(state => state.setSearchQuery);
  const addToSearchHistory = usePublicQuestionFiltersStore(state => state.addToSearchHistory);
  
  // ===== DEBOUNCED SEARCH =====
  
  /**
   * Debounced search function
   * Update suggestions sau delay
   */
  const debouncedSearch = useCallback((searchQuery: string) => {
    const debouncedFn = debounce((query: string) => {
      if (query.trim().length >= 2) {
        // Filter mock suggestions based on query
        const filteredSuggestions = MOCK_SUGGESTIONS
          .filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, MAX_SUGGESTIONS);

        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    }, DEBOUNCE_DELAY);

    debouncedFn(searchQuery);
  }, []);
  
  // ===== EFFECTS =====
  
  /**
   * Handle query changes
   * Trigger debounced search khi query thay đổi
   */
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  /**
   * Auto focus effect
   * Focus input khi component mount
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // ===== HANDLERS =====
  
  /**
   * Handle input change
   * Update local query state
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };
  
  /**
   * Handle search execution
   * Execute search và navigate to search page
   */
  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length >= 2) {
      // Update store state
      setSearchQuery(trimmedQuery);
      addToSearchHistory(trimmedQuery);
      
      // Call onSearch callback if provided
      onSearch?.(trimmedQuery);
      
      // Navigate to search page
      router.push(`${QUESTION_ROUTES.SEARCH}?q=${encodeURIComponent(trimmedQuery)}`);
      
      // Close dropdown và clear input
      setIsOpen(false);
      setQuery('');
    }
  };
  
  /**
   * Handle form submit
   * Handle Enter key press
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };
  
  /**
   * Handle suggestion click
   * Select suggestion và execute search
   */
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };
  
  /**
   * Handle input focus
   * Show dropdown khi focus
   */
  const handleFocus = () => {
    setIsOpen(query.length > 0 || searchHistory.length > 0);
  };
  
  /**
   * Handle input blur
   * Hide dropdown sau delay để allow click on suggestions
   */
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };
  
  /**
   * Clear search input
   * Reset query và close dropdown
   */
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render recent searches
   * Display recent search history
   */
  const renderRecentSearches = () => {
    if (!showRecentSearches || searchHistory.length === 0) return null;
    
    const recentSearches = searchHistory.slice(0, MAX_RECENT_SEARCHES);
    
    return (
      <div className="recent-searches">
        <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
          Tìm kiếm gần đây
        </div>
        {recentSearches.map((search, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(search)}
            className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{search}</span>
          </button>
        ))}
      </div>
    );
  };
  
  /**
   * Render search suggestions
   * Display filtered suggestions
   */
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    
    return (
      <div className="suggestions">
        <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
          Gợi ý tìm kiếm
        </div>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{suggestion}</span>
          </button>
        ))}
      </div>
    );
  };
  
  /**
   * Render dropdown content
   * Combine recent searches và suggestions
   */
  const renderDropdown = () => {
    if (!isOpen) return null;
    
    const hasRecentSearches = showRecentSearches && searchHistory.length > 0;
    const hasSuggestions = showSuggestions && suggestions.length > 0;
    
    if (!hasRecentSearches && !hasSuggestions) return null;
    
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
        {query.length === 0 && renderRecentSearches()}
        {query.length > 0 && renderSuggestions()}
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={cn('hero-search-bar relative w-full max-w-2xl mx-auto', className)}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full px-6 py-4 pl-14 pr-12 text-lg bg-background border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors shadow-sm"
          />
          
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Hidden Submit Button cho accessibility */}
        <button type="submit" className="sr-only">
          Tìm kiếm
        </button>
      </form>
      
      {/* Dropdown */}
      {renderDropdown()}
    </div>
  );
}

// ===== EXPORTS =====

export default HeroSearchBar;
