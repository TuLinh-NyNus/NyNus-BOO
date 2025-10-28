'use client';

/**
 * Library Search Autocomplete Component
 * Autocomplete/suggestions cho search bar với debounce
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, BookOpen, FileText, PlayCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/performance/useDebounce';

// Types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'book' | 'exam' | 'video' | 'subject' | 'tag';
  count?: number;
  metadata?: {
    subject?: string;
    grade?: string;
  };
}

export interface LibrarySearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Mock suggestions - sẽ được thay thế bằng API call thực
const MOCK_TRENDING_SEARCHES: SearchSuggestion[] = [
  { id: '1', text: 'Toán học lớp 12', type: 'trending', count: 1234 },
  { id: '2', text: 'Đề thi THPT Quốc gia', type: 'trending', count: 987 },
  { id: '3', text: 'Vật lý đại cương', type: 'trending', count: 756 },
  { id: '4', text: 'Hóa học hữu cơ', type: 'trending', count: 654 },
];

const MOCK_SUBJECTS: SearchSuggestion[] = [
  { id: 's1', text: 'Toán học', type: 'subject' },
  { id: 's2', text: 'Vật lý', type: 'subject' },
  { id: 's3', text: 'Hóa học', type: 'subject' },
  { id: 's4', text: 'Sinh học', type: 'subject' },
];

// Icon mapping
const ICON_MAP = {
  recent: Clock,
  trending: TrendingUp,
  book: BookOpen,
  exam: FileText,
  video: PlayCircle,
  subject: BookOpen,
  tag: TrendingUp,
};

export function LibrarySearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm tài liệu, môn học, chủ đề...',
  className,
  disabled,
}: LibrarySearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query
  const debouncedValue = useDebounce(value, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('library-recent-searches');
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent).slice(0, 5));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('library-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch suggestions when value changes
  useEffect(() => {
    if (!debouncedValue.trim()) {
      // Show recent + trending when empty
      const recent: SearchSuggestion[] = recentSearches.map((text, i) => ({
        id: `recent-${i}`,
        text,
        type: 'recent' as const,
      }));
      setSuggestions([...recent, ...MOCK_TRENDING_SEARCHES]);
      return;
    }

    // TODO: Replace with actual API call
    // Simulate API call
    const filtered = [
      ...MOCK_SUBJECTS.filter(s => 
        s.text.toLowerCase().includes(debouncedValue.toLowerCase())
      ),
      ...MOCK_TRENDING_SEARCHES.filter(s => 
        s.text.toLowerCase().includes(debouncedValue.toLowerCase())
      ),
    ];
    
    setSuggestions(filtered);
  }, [debouncedValue, recentSearches]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (value.trim()) {
          handleSearch(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    saveRecentSearch(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    saveRecentSearch(query);
    setIsOpen(false);
    
    if (onSearch) {
      onSearch(query);
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('library-recent-searches');
    setSuggestions(MOCK_TRENDING_SEARCHES);
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-11 pl-10 pr-10 rounded-xl border-border/50 bg-muted/40',
            'focus-visible:ring-primary/30 transition',
            isOpen && 'rounded-b-none border-b-transparent'
          )}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 right-0 z-50',
            'rounded-b-xl border border-t-0 border-border/60 bg-background/95 backdrop-blur-sm',
            'shadow-lg shadow-primary/10 max-h-[400px] overflow-y-auto'
          )}
        >
          <div className="p-2">
            {/* Recent Searches Header */}
            {recentSearches.length > 0 && !value && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tìm kiếm gần đây
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearRecent}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                >
                  Xóa
                </Button>
              </div>
            )}

            {/* Suggestions List */}
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => {
                const Icon = ICON_MAP[suggestion.type];
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      'hover:bg-primary/10',
                      isSelected && 'bg-primary/10'
                    )}
                  >
                    <Icon className={cn(
                      'h-4 w-4 shrink-0',
                      suggestion.type === 'recent' && 'text-muted-foreground',
                      suggestion.type === 'trending' && 'text-orange-500',
                      suggestion.type === 'book' && 'text-blue-500',
                      suggestion.type === 'exam' && 'text-purple-500',
                      suggestion.type === 'video' && 'text-pink-500',
                      suggestion.type === 'subject' && 'text-primary',
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.metadata && (
                        <div className="flex gap-2 mt-0.5">
                          {suggestion.metadata.subject && (
                            <Badge variant="secondary" className="text-xs h-4 px-1.5">
                              {suggestion.metadata.subject}
                            </Badge>
                          )}
                          {suggestion.metadata.grade && (
                            <Badge variant="outline" className="text-xs h-4 px-1.5">
                              Lớp {suggestion.metadata.grade}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {suggestion.count !== undefined && (
                      <div className="text-xs text-muted-foreground shrink-0">
                        {suggestion.count.toLocaleString('vi-VN')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* No Results */}
            {value && suggestions.length === 0 && (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Không tìm thấy gợi ý
                </p>
                <p className="text-xs text-muted-foreground">
                  Nhấn Enter để tìm kiếm &quot;{value}&quot;
                </p>
              </div>
            )}

            {/* Trending Label */}
            {!value && suggestions.some(s => s.type === 'trending') && (
              <div className="px-3 py-2 mt-2 border-t border-border/40">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tìm kiếm phổ biến
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LibrarySearchAutocomplete;

