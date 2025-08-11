/**
 * Enhanced Search Component
 * Component tìm kiếm nâng cao cho user management
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/navigation/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover";
import {
  Search,
  X,
  Clock,
  User,
  Mail,
  Filter
} from "lucide-react";


// import { UserRole } from "@/lib/mockdata/core-types";

/**
 * Search suggestion interface
 */
interface SearchSuggestion {
  id: string;
  type: 'user' | 'email' | 'role' | 'recent' | 'filter';
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Enhanced Search Props
 */
interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
}

/**
 * User role labels mapping
 */
// const USER_ROLE_LABELS: Record<UserRole, string> = {
//   [UserRole.GUEST]: "Khách",
//   [UserRole.STUDENT]: "Học viên",
//   [UserRole.TUTOR]: "Trợ giảng",
//   [UserRole.TEACHER]: "Giảng viên",
//   [UserRole.ADMIN]: "Quản trị viên",
// };

/**
 * Default search suggestions
 */
const DEFAULT_SUGGESTIONS: SearchSuggestion[] = [
  {
    id: 'role-student',
    type: 'role',
    value: 'role:student',
    label: 'role:student',
    description: 'Tìm kiếm học viên',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'role-teacher',
    type: 'role',
    value: 'role:teacher',
    label: 'role:teacher',
    description: 'Tìm kiếm giảng viên',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'status-active',
    type: 'filter',
    value: 'status:active',
    label: 'status:active',
    description: 'Users đang hoạt động',
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: 'status-suspended',
    type: 'filter',
    value: 'status:suspended',
    label: 'status:suspended',
    description: 'Users bị tạm khóa',
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: 'verified-true',
    type: 'filter',
    value: 'verified:true',
    label: 'verified:true',
    description: 'Users đã xác thực email',
    icon: <Mail className="h-4 w-4" />,
  },
];

/**
 * Enhanced Search Component
 */
export function EnhancedSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Tìm kiếm users...",
  suggestions = DEFAULT_SUGGESTIONS,
  recentSearches = [],
  className = "",
}: EnhancedSearchProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Filter suggestions based on input value
   */
  useEffect(() => {
    if (!value.trim()) {
      // Show recent searches and default suggestions when empty
      const recentSuggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        value: search,
        label: search,
        description: 'Recent search',
        icon: <Clock className="h-4 w-4" />,
      }));

      setFilteredSuggestions([...recentSuggestions, ...suggestions]);
    } else {
      // Filter suggestions based on input
      const filtered = suggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.description?.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredSuggestions(filtered);
    }
    setSelectedIndex(-1);
  }, [value, suggestions, recentSearches]);

  /**
   * Handle input change
   */
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(true);
  };

  /**
   * Handle suggestion selection
   */
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    onSearch(suggestion.value);
  };

  /**
   * Handle search execution
   */
  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value);
      setIsOpen(false);
    }
  };

  /**
   * Handle clear search
   */
  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSuggestionSelect(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  /**
   * Get suggestion icon
   */
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon;

    switch (suggestion.type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'role':
        return <User className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'filter':
        return <Filter className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  /**
   * Parse search query for display
   */
  const parseSearchQuery = (query: string) => {
    const parts = query.split(' ').filter(Boolean);
    const filters: { key: string; value: string }[] = [];
    const terms: string[] = [];

    parts.forEach(part => {
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        filters.push({ key, value });
      } else {
        terms.push(part);
      }
    });

    return { filters, terms };
  };

  const { filters, terms } = parseSearchQuery(value);

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="h-6 w-6 p-0"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              {filteredSuggestions.length === 0 ? (
                <CommandEmpty>No suggestions found</CommandEmpty>
              ) : (
                <>
                  {recentSearches.length > 0 && value === "" && (
                    <CommandGroup heading="Recent Searches">
                      {filteredSuggestions
                        .filter(s => s.type === 'recent')
                        .slice(0, 3)
                        .map((suggestion, index) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => handleSuggestionSelect(suggestion)}
                            className={selectedIndex === index ? 'bg-accent' : ''}
                          >
                            <div className="flex items-center gap-2">
                              {getSuggestionIcon(suggestion)}
                              <span>{suggestion.label}</span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  <CommandGroup heading="Search Suggestions">
                    {filteredSuggestions
                      .filter(s => s.type !== 'recent')
                      .map((suggestion, index) => (
                        <CommandItem
                          key={suggestion.id}
                          onSelect={() => handleSuggestionSelect(suggestion)}
                          className={selectedIndex === index ? 'bg-accent' : ''}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getSuggestionIcon(suggestion)}
                            <div>
                              <div className="font-medium">{suggestion.label}</div>
                              {suggestion.description && (
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {(filters.length > 0 || terms.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter.key}:{filter.value}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  const newValue = value.replace(`${filter.key}:${filter.value}`, '').trim();
                  onChange(newValue);
                }}
              />
            </Badge>
          ))}
          {terms.map((term, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {term}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => {
                  const newValue = value.replace(term, '').trim();
                  onChange(newValue);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
