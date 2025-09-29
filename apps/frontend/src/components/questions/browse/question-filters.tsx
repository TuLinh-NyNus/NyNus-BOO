/**
 * Public Question Filters Component
 * Simplified filter interface cho public question browsing theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";

// Import UI components
import {
  Input,
  Button,
  Label,
  Card,
  CardContent,
  Badge
} from "@/components/ui";

// Import types
import type { PublicQuestionFilters } from "@/types/public";
import { QuestionType, QuestionDifficulty } from "@/types/question";

// Import utilities
import { useDebounce } from "@/hooks/useDebounce";

// ===== CONSTANTS =====

/**
 * Filter options cho public interface
 */
const FILTER_OPTIONS = {
  categories: [
    { value: 'dai-so', label: 'Đại số' },
    { value: 'hinh-hoc', label: 'Hình học' },
    { value: 'giai-tich', label: 'Giải tích' },
    { value: 'xac-suat', label: 'Xác suất' },
    { value: 'thong-ke', label: 'Thống kê' }
  ],
  subjects: [
    { value: 'toan-10', label: 'Toán 10' },
    { value: 'toan-11', label: 'Toán 11' },
    { value: 'toan-12', label: 'Toán 12' }
  ],
  grades: [
    { value: 'lop-10', label: 'Lớp 10' },
    { value: 'lop-11', label: 'Lớp 11' },
    { value: 'lop-12', label: 'Lớp 12' }
  ],
  types: [
    { value: QuestionType.MC, label: 'Trắc nghiệm' },
    { value: QuestionType.TF, label: 'Đúng/Sai' },
    { value: QuestionType.SA, label: 'Tự luận ngắn' },
    { value: QuestionType.ES, label: 'Tự luận' },
    { value: QuestionType.MA, label: 'Ghép đôi' }
  ],
  difficulties: [
    { value: QuestionDifficulty.EASY, label: 'Dễ' },
    { value: QuestionDifficulty.MEDIUM, label: 'Trung bình' },
    { value: QuestionDifficulty.HARD, label: 'Khó' }
  ]
} as const;

const DEBOUNCE_DELAY = 300; // ms

// ===== TYPES =====

export interface PublicQuestionFiltersProps {
  /** Current filter values */
  filters: PublicQuestionFilters;
  
  /** Filter change handler */
  onFiltersChange: (filters: Partial<PublicQuestionFilters>) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Show filter chips */
  showFilterChips?: boolean;
  
  /** Collapsible on mobile */
  collapsible?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Toggle array item (add if not exists, remove if exists)
 */
function toggleArrayItem<T>(array: T[] = [], item: T): T[] {
  const exists = array.includes(item);
  return exists
    ? array.filter(i => i !== item)
    : [...array, item];
}

/**
 * Get filter label by value
 */
function getFilterLabel(type: string, value: string): string {
  const options = FILTER_OPTIONS[type as keyof typeof FILTER_OPTIONS];
  if (!options) return value;

  const option = options.find(opt => opt.value === value);
  return option?.label || value;
}

// ===== MAIN COMPONENT =====

export const PublicQuestionFiltersComponent: React.FC<PublicQuestionFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false,
  showFilterChips = true,
  collapsible = true,
  className = ""
}) => {
  // ===== STATE =====
  
  const [searchQuery, setSearchQuery] = useState(filters.keyword || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY);
  
  // ===== EFFECTS =====
  
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.keyword) {
      onFiltersChange({ keyword: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.keyword, onFiltersChange]);
  
  // ===== EVENT HANDLERS =====
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);
  
  const handleArrayFilterChange = useCallback((
    key: keyof PublicQuestionFilters,
    value: string
  ) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = toggleArrayItem(currentArray, value);
    onFiltersChange({ 
      [key]: newArray.length > 0 ? newArray : undefined 
    });
  }, [filters, onFiltersChange]);
  
  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    onFiltersChange({
      keyword: undefined,
      category: undefined,
      subject: undefined,
      grade: undefined,
      type: undefined,
      difficulty: undefined
    });
  }, [onFiltersChange]);
  
  const handleRemoveFilter = useCallback((
    key: keyof PublicQuestionFilters,
    value?: string
  ) => {
    if (key === 'keyword') {
      setSearchQuery('');
      onFiltersChange({ keyword: undefined });
    } else if (value) {
      const currentArray = (filters[key] as string[]) || [];
      const newArray = currentArray.filter(item => item !== value);
      onFiltersChange({ 
        [key]: newArray.length > 0 ? newArray : undefined 
      });
    } else {
      onFiltersChange({ [key]: undefined });
    }
  }, [filters, onFiltersChange]);
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // ===== COMPUTED VALUES =====
  
  const hasActiveFilters = Boolean(
    filters.keyword ||
    (filters.category && filters.category.length > 0) ||
    (filters.subject && filters.subject.length > 0) ||
    (filters.grade && filters.grade.length > 0) ||
    (filters.type && filters.type.length > 0) ||
    (filters.difficulty && filters.difficulty.length > 0)
  );
  
  const activeFilterCount = [
    filters.keyword,
    ...(filters.category || []),
    ...(filters.subject || []),
    ...(filters.grade || []),
    ...(filters.type || []),
    ...(filters.difficulty || [])
  ].filter(Boolean).length;
  
  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render filter chips
   */
  const renderFilterChips = () => {
    if (!showFilterChips || !hasActiveFilters) return null;
    
    const chips: React.ReactNode[] = [];
    
    // Keyword chip
    if (filters.keyword) {
      chips.push(
        <Badge key="keyword" variant="secondary" className="gap-2">
          <Search className="h-3 w-3" />
          <span>&quot;{filters.keyword}&quot;</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('keyword')}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }
    
    // Category chips
    (filters.category || []).forEach(category => {
      chips.push(
        <Badge key={`category-${category}`} variant="secondary" className="gap-2">
          <span>{getFilterLabel('categories', category)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('category', category)}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    });
    
    // Subject chips
    (filters.subject || []).forEach(subject => {
      chips.push(
        <Badge key={`subject-${subject}`} variant="secondary" className="gap-2">
          <span>{getFilterLabel('subjects', subject)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('subject', subject)}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    });
    
    // Grade chips
    (filters.grade || []).forEach(grade => {
      chips.push(
        <Badge key={`grade-${grade}`} variant="secondary" className="gap-2">
          <span>{getFilterLabel('grades', grade)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('grade', grade)}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    });
    
    // Type chips
    (filters.type || []).forEach(type => {
      chips.push(
        <Badge key={`type-${type}`} variant="secondary" className="gap-2">
          <span>{getFilterLabel('types', type)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('type', type)}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    });
    
    // Difficulty chips
    (filters.difficulty || []).forEach(difficulty => {
      chips.push(
        <Badge key={`difficulty-${difficulty}`} variant="secondary" className="gap-2">
          <span>{getFilterLabel('difficulties', difficulty)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFilter('difficulty', difficulty)}
            className="h-3 w-3 p-0 hover:bg-transparent"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    });
    
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>
        {chips}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAllFilters}
          className="h-7"
        >
          Xóa tất cả
        </Button>
      </div>
    );
  };

  /**
   * Render multi-select dropdown
   */
  const renderMultiSelect = (
    key: keyof PublicQuestionFilters,
    label: string,
    options: readonly { value: string; label: string }[]
  ) => {
    const selectedValues = (filters[key] as string[]) || [];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="space-y-1">
          {options.map(option => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleArrayFilterChange(key, option.value)}
                disabled={isLoading}
                className={cn(
                  "w-full justify-start h-8",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "transition-all duration-200"
                )}
                aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} ${option.label}`}
                role="checkbox"
                aria-checked={isSelected}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  const shouldShowCollapsed = collapsible && isMobile && !isExpanded;

  return (
    <div className={cn("public-question-filters", className)}>
      {/* Filter Chips */}
      {showFilterChips && hasActiveFilters && (
        <div className="mb-4">
          {renderFilterChips()}
        </div>
      )}

      {/* Mobile Toggle Button */}
      {collapsible && isMobile && (
        <Button
          variant="outline"
          onClick={toggleExpanded}
          className="w-full mb-4 justify-between"
          disabled={isLoading}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc {hasActiveFilters && `(${activeFilterCount})`}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Filter Content */}
      {!shouldShowCollapsed && (
        <Card className="bg-card/50 backdrop-blur-sm border border-border/60">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Category Filter */}
                {renderMultiSelect(
                  'category',
                  'Chủ đề',
                  FILTER_OPTIONS.categories
                )}

                {/* Subject Filter */}
                {renderMultiSelect(
                  'subject',
                  'Môn học',
                  FILTER_OPTIONS.subjects
                )}

                {/* Grade Filter */}
                {renderMultiSelect(
                  'grade',
                  'Lớp',
                  FILTER_OPTIONS.grades
                )}

                {/* Type Filter */}
                {renderMultiSelect(
                  'type',
                  'Loại câu hỏi',
                  FILTER_OPTIONS.types
                )}

                {/* Difficulty Filter */}
                {renderMultiSelect(
                  'difficulty',
                  'Độ khó',
                  FILTER_OPTIONS.difficulties
                )}
              </div>

              {/* Clear All Button */}
              {hasActiveFilters && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ===== DEFAULT EXPORT =====

export default PublicQuestionFiltersComponent;

// Named export alias for convenience
export { PublicQuestionFiltersComponent as PublicQuestionFilters };
