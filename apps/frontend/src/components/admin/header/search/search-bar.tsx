/**
 * Search Bar Component
 * Search bar component cho admin header
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { SearchBarProps, SearchSuggestion } from '@/types/admin/header';
import { useAdminSearch } from '@/hooks/admin/use-admin-search';
import { SEARCH_CONFIG, SearchUtils } from '@/lib/admin-search';
import { SearchDropdown } from './search-dropdown';
import { cn } from '@/lib/utils';

/**
 * Search Bar Component
 * Component chính cho search functionality
 */
export function SearchBar({
  placeholder = 'Tìm kiếm...',
  className,
  onSearch,
  onFocus,
  onBlur,
  showShortcut = true,
  variant = 'default'
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isLoading,
    performSearch,
    clearSearch
  } = useAdminSearch();

  /**
   * Handle input change
   * Xử lý khi input thay đổi
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    // Perform search if query meets minimum length
    if (newQuery.length >= SEARCH_CONFIG.minQueryLength) {
      performSearch(newQuery);
    }
  };

  /**
   * Handle input focus
   * Xử lý khi focus vào input
   */
  const handleInputFocus = () => {
    setIsOpen(true);
    if (onFocus) {
      onFocus();
    }
  };

  /**
   * Handle input blur
   * Xử lý khi blur khỏi input
   */
  const handleInputBlur = () => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      if (onBlur) {
        onBlur();
      }
    }, 150);
  };

  /**
   * Handle search submit
   * Xử lý khi submit search
   */
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      }
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  /**
   * Handle clear search
   * Xử lý khi clear search
   */
  const handleClearSearch = () => {
    setQuery('');
    clearSearch();
    inputRef.current?.focus();
  };

  /**
   * Handle suggestion select
   * Xử lý khi chọn suggestion
   */
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    
    if (onSearch) {
      onSearch(suggestion.title);
    }

    // Navigate to suggestion href if provided
    if (suggestion.href) {
      window.location.href = suggestion.href;
    }
  };

  /**
   * Handle keyboard shortcuts
   * Xử lý keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open search with Cmd+K
      if (SearchUtils.matchesShortcut(event, SEARCH_CONFIG.shortcuts.open)) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      // Close search with Escape
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Handle click outside
   * Xử lý khi click bên ngoài
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Get search bar classes
   * Lấy CSS classes cho search bar với admin dark theme styling
   */
  const getSearchBarClasses = () => {
    const baseClasses = [
      'relative flex items-center',
      // Dark theme background consistent with admin panel
      'bg-black/90 backdrop-blur-md',
      'border border-white/20',
      'rounded-lg',
      'transition-all duration-300 ease-in-out',
      // Enhanced hover and focus states for dark theme - NEW PURPLE SCHEME
      'hover:bg-black/95 hover:border-white/30',
      'focus-within:bg-black/95',
      'focus-within:border-[#A259FF]/50',
      'focus-within:ring-2 focus-within:ring-[#A259FF]/20',
      'focus-within:shadow-lg focus-within:shadow-[#A259FF]/10'
    ];

    const variantClasses = {
      default: 'h-10',
      compact: 'h-8',
      large: 'h-12'
    };

    return cn(baseClasses, variantClasses[variant], className);
  };

  /**
   * Render search icon
   * Render search icon với admin dark theme styling
   */
  const renderSearchIcon = () => {
    return (
      <div className="flex items-center justify-center w-10 h-full">
        <Search className="w-4 h-4 text-white/60 transition-colors duration-200" />
      </div>
    );
  };

  /**
   * Render clear button
   * Render button để clear search với admin dark theme styling
   */
  const renderClearButton = () => {
    if (!query) return null;

    return (
      <button
        type="button"
        onClick={handleClearSearch}
        className="flex items-center justify-center w-8 h-full text-white/60 hover:text-white/80 transition-colors duration-150"
        aria-label="Clear search"
      >
        <X className="w-4 h-4" />
      </button>
    );
  };

  /**
   * Render keyboard shortcut
   * Render keyboard shortcut hint
   */
  const renderKeyboardShortcut = () => {
    if (!showShortcut || query || isOpen) return null;

    return (
      <div className="flex items-center justify-center w-16 h-full">
        <div className="flex items-center space-x-1 text-xs text-white/70">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>
    );
  };

  /**
   * Render search dropdown
   * Render dropdown với suggestions
   */
  const renderSearchDropdown = () => {
    if (!isOpen) return null;

    return (
      <SearchDropdown
        query={query}
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionSelect={handleSuggestionSelect}
        onClose={() => setIsOpen(false)}
        className="absolute top-full left-0 right-0 mt-1 z-50"
      />
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSearchSubmit} className={getSearchBarClasses()}>
        {/* Search icon */}
        {renderSearchIcon()}

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent border-0 outline-none',
            'text-sm text-white placeholder-white/70',
            'px-0 py-0'
          )}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear button */}
        {renderClearButton()}

        {/* Keyboard shortcut */}
        {renderKeyboardShortcut()}
      </form>

      {/* Search dropdown */}
      {renderSearchDropdown()}
    </div>
  );
}

/**
 * Compact Search Bar
 * Compact version cho mobile
 */
export function CompactSearchBar({
  placeholder = 'Tìm kiếm...',
  className,
  onSearch
}: Omit<SearchBarProps, 'variant'>) {
  return (
    <SearchBar
      placeholder={placeholder}
      className={className}
      onSearch={onSearch}
      variant="compact"
      showShortcut={false}
    />
  );
}

/**
 * Large Search Bar
 * Large version cho landing pages
 */
export function LargeSearchBar({
  placeholder = 'Tìm kiếm trong hệ thống...',
  className,
  onSearch
}: Omit<SearchBarProps, 'variant'>) {
  return (
    <SearchBar
      placeholder={placeholder}
      className={className}
      onSearch={onSearch}
      variant="large"
      showShortcut={true}
    />
  );
}
