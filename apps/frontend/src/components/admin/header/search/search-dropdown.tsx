/**
 * Search Dropdown Component
 * Dropdown component cho search suggestions và results
 */

'use client';

import React from 'react';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { SearchDropdownProps, SearchSuggestion } from '@/types/admin/header';
import { QUICK_SEARCH_SUGGESTIONS, POPULAR_SEARCHES, getSearchIconComponent } from '@/lib/admin-search';
import { cn } from '@/lib/utils';

/**
 * Search Dropdown Component
 * Component để hiển thị search suggestions và results
 */
export function SearchDropdown({
  query,
  suggestions = [],
  isLoading = false,
  onSuggestionSelect,
  className
}: SearchDropdownProps) {
  /**
   * Get dropdown content
   * Lấy nội dung dropdown dựa trên query
   */
  const getDropdownContent = () => {
    // Show loading state
    if (isLoading) {
      return renderLoadingState();
    }

    // Show suggestions if query exists
    if (query && query.length >= 2) {
      if (suggestions.length > 0) {
        return renderSuggestions();
      } else {
        return renderNoResults();
      }
    }

    // Show default content when no query
    return renderDefaultContent();
  };

  /**
   * Render loading state
   * Render trạng thái loading
   */
  const renderLoadingState = () => {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center space-x-2 text-white/70">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Đang tìm kiếm...</span>
        </div>
      </div>
    );
  };

  /**
   * Render suggestions
   * Render search suggestions
   */
  const renderSuggestions = () => {
    return (
      <div className="py-2">
        <div className="px-3 py-2 text-xs font-medium text-white/70 uppercase tracking-wider">
          Kết quả tìm kiếm
        </div>
        
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={suggestion.id || index}
            suggestion={suggestion}
            onClick={() => onSuggestionSelect(suggestion)}
            query={query}
          />
        ))}
      </div>
    );
  };

  /**
   * Render no results
   * Render khi không có kết quả
   */
  const renderNoResults = () => {
    return (
      <div className="p-4 text-center">
        <div className="text-white/70">
          <div className="text-sm font-medium">Không tìm thấy kết quả</div>
          <div className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</div>
        </div>
      </div>
    );
  };

  /**
   * Render default content
   * Render nội dung mặc định khi chưa có query
   */
  const renderDefaultContent = () => {
    return (
      <div className="py-2">
        {/* Quick suggestions */}
        <div className="px-3 py-2 text-xs font-medium text-white/70 uppercase tracking-wider">
          Gợi ý nhanh
        </div>
        
        {QUICK_SEARCH_SUGGESTIONS.slice(0, 4).map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onClick={() => onSuggestionSelect(suggestion)}
            showIcon={true}
          />
        ))}

        {/* Popular searches */}
        <div className="border-t border-white/20 mt-2 pt-2">
          <div className="px-3 py-2 text-xs font-medium text-white/70 uppercase tracking-wider">
            Tìm kiếm phổ biến
          </div>
          
          {POPULAR_SEARCHES.slice(0, 3).map((search, index) => (
            <PopularSearchItem
              key={index}
              search={search}
              onClick={() => onSuggestionSelect({
                id: `popular-${index}`,
                title: search,
                description: `Tìm kiếm: ${search}`,
                category: 'popular'
              })}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg',
        'max-h-96 overflow-y-auto',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        className
      )}
    >
      {getDropdownContent()}
    </div>
  );
}

/**
 * Suggestion Item Component
 * Component cho individual suggestion item
 */
function SuggestionItem({
  suggestion,
  onClick,
  query,
  showIcon = false
}: {
  suggestion: SearchSuggestion;
  onClick: () => void;
  query?: string;
  showIcon?: boolean;
}) {
  const IconComponent = showIcon ? getSearchIconComponent(suggestion.icon || 'Search') : null;

  /**
   * Highlight matching text
   * Highlight text matching với query
   */
  const highlightText = (text: string, searchQuery?: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-400/30 text-yellow-300 rounded px-0.5">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center px-3 py-2 text-left',
        'hover:bg-white/10 transition-colors duration-150',
        'focus:bg-white/10 focus:outline-none'
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0 mr-3">
          <IconComponent className="w-4 h-4 text-white/70" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {highlightText(suggestion.title, query)}
        </div>
        {suggestion.description && (
          <div className="text-xs text-white/70 truncate">
            {highlightText(suggestion.description, query)}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 ml-2">
        <ArrowRight className="w-3 h-3 text-white/70" />
      </div>
    </button>
  );
}

/**
 * Popular Search Item Component
 * Component cho popular search items
 */
function PopularSearchItem({
  search,
  onClick
}: {
  search: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center px-3 py-2 text-left',
        'hover:bg-white/10 transition-colors duration-150',
        'focus:bg-white/10 focus:outline-none'
      )}
    >
      {/* Trending icon */}
      <div className="flex-shrink-0 mr-3">
        <TrendingUp className="w-4 h-4 text-white/70" />
      </div>

      {/* Search text */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">
          {search}
        </div>
      </div>

      {/* Clock icon */}
      <div className="flex-shrink-0 ml-2">
        <Clock className="w-3 h-3 text-white/70" />
      </div>
    </button>
  );
}

/**
 * Search Category Item Component
 * Component cho search category items
 */
export function SearchCategoryItem({
  category,
  onClick,
  className
}: {
  category: { id: string; name: string; icon: string; color: string };
  onClick: () => void;
  className?: string;
}) {
  const IconComponent = getSearchIconComponent(category.icon);
  
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    gray: 'text-gray-600 bg-gray-50'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center p-3 rounded-lg border border-gray-200',
        'hover:border-gray-300 hover:shadow-sm transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg mr-3',
        colorClasses[category.color as keyof typeof colorClasses] || colorClasses.gray
      )}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="text-sm font-medium text-gray-900">
        {category.name}
      </div>
    </button>
  );
}
