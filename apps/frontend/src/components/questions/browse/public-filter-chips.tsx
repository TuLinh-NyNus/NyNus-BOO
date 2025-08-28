/**
 * Public Filter Chips Component
 * Display active filters as removable chips cho public interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Filter, RotateCcw } from "lucide-react";

// Import UI components
import { Badge, Button } from "@/components/ui";

// Import types
import { PublicQuestionFilters } from "@/lib/types/public";
import { QuestionType, QuestionDifficulty } from "@/lib/types/question";

// ===== CONSTANTS =====

/**
 * Filter labels mapping
 */
const FILTER_LABELS = {
  categories: {
    'dai-so': 'Đại số',
    'hinh-hoc': 'Hình học',
    'giai-tich': 'Giải tích',
    'xac-suat': 'Xác suất',
    'thong-ke': 'Thống kê'
  },
  subjects: {
    'toan-10': 'Toán 10',
    'toan-11': 'Toán 11',
    'toan-12': 'Toán 12'
  },
  grades: {
    'lop-10': 'Lớp 10',
    'lop-11': 'Lớp 11',
    'lop-12': 'Lớp 12'
  },
  types: {
    [QuestionType.MC]: 'Trắc nghiệm',
    [QuestionType.TF]: 'Đúng/Sai',
    [QuestionType.SA]: 'Tự luận ngắn',
    [QuestionType.ES]: 'Tự luận',
    [QuestionType.MA]: 'Ghép đôi'
  },
  difficulties: {
    [QuestionDifficulty.EASY]: 'Dễ',
    [QuestionDifficulty.MEDIUM]: 'Trung bình',
    [QuestionDifficulty.HARD]: 'Khó'
  }
} as const;

/**
 * Filter chip colors
 */
const CHIP_COLORS = {
  keyword: 'bg-blue-100 text-blue-800 border-blue-200',
  category: 'bg-green-100 text-green-800 border-green-200',
  subject: 'bg-purple-100 text-purple-800 border-purple-200',
  grade: 'bg-orange-100 text-orange-800 border-orange-200',
  type: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  difficulty: 'bg-red-100 text-red-800 border-red-200'
} as const;

// ===== TYPES =====

export interface PublicFilterChipsProps {
  /** Current filter values */
  filters: PublicQuestionFilters;
  
  /** Remove filter handler */
  onRemoveFilter: (key: keyof PublicQuestionFilters, value?: string) => void;
  
  /** Clear all filters handler */
  onClearAll: () => void;
  
  /** Show clear all button */
  showClearAll?: boolean;
  
  /** Show filter count */
  showCount?: boolean;
  
  /** Compact layout */
  compact?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface FilterChip {
  key: string;
  type: keyof PublicQuestionFilters;
  value?: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get filter label by type and value
 */
const getFilterLabel = (type: string, value: string): string => {
  const labels = FILTER_LABELS[type as keyof typeof FILTER_LABELS];
  if (!labels) return value;
  
  return labels[value as keyof typeof labels] || value;
};

/**
 * Generate filter chips from current filters
 */
const generateFilterChips = (filters: PublicQuestionFilters): FilterChip[] => {
  const chips: FilterChip[] = [];
  
  // Keyword chip
  if (filters.keyword && filters.keyword.trim()) {
    chips.push({
      key: 'keyword',
      type: 'keyword',
      label: `"${filters.keyword}"`,
      icon: <Search className="h-3 w-3" />,
      color: CHIP_COLORS.keyword
    });
  }
  
  // Category chips
  if (filters.category && filters.category.length > 0) {
    filters.category.forEach(category => {
      chips.push({
        key: `category-${category}`,
        type: 'category',
        value: category,
        label: getFilterLabel('categories', category),
        color: CHIP_COLORS.category
      });
    });
  }
  
  // Subject chips
  if (filters.subject && filters.subject.length > 0) {
    filters.subject.forEach(subject => {
      chips.push({
        key: `subject-${subject}`,
        type: 'subject',
        value: subject,
        label: getFilterLabel('subjects', subject),
        color: CHIP_COLORS.subject
      });
    });
  }
  
  // Grade chips
  if (filters.grade && filters.grade.length > 0) {
    filters.grade.forEach(grade => {
      chips.push({
        key: `grade-${grade}`,
        type: 'grade',
        value: grade,
        label: getFilterLabel('grades', grade),
        color: CHIP_COLORS.grade
      });
    });
  }
  
  // Type chips
  if (filters.type && filters.type.length > 0) {
    filters.type.forEach(type => {
      chips.push({
        key: `type-${type}`,
        type: 'type',
        value: type,
        label: getFilterLabel('types', type),
        color: CHIP_COLORS.type
      });
    });
  }
  
  // Difficulty chips
  if (filters.difficulty && filters.difficulty.length > 0) {
    filters.difficulty.forEach(difficulty => {
      chips.push({
        key: `difficulty-${difficulty}`,
        type: 'difficulty',
        value: difficulty,
        label: getFilterLabel('difficulties', difficulty),
        color: CHIP_COLORS.difficulty
      });
    });
  }
  
  return chips;
};

// ===== MAIN COMPONENT =====

export const PublicFilterChips: React.FC<PublicFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  showClearAll = true,
  showCount = true,
  compact = false,
  className = ""
}) => {
  // ===== COMPUTED VALUES =====
  
  const filterChips = useMemo(() => generateFilterChips(filters), [filters]);
  
  const hasActiveFilters = filterChips.length > 0;
  
  const activeFilterCount = filterChips.length;
  
  // ===== EVENT HANDLERS =====
  
  const handleRemoveChip = useCallback((chip: FilterChip) => {
    onRemoveFilter(chip.type, chip.value);
  }, [onRemoveFilter]);
  
  const handleClearAll = useCallback(() => {
    onClearAll();
  }, [onClearAll]);
  
  // ===== RENDER =====
  
  if (!hasActiveFilters) {
    return null;
  }
  
  return (
    <div className={cn(
      "public-filter-chips",
      "flex flex-wrap items-center gap-2",
      compact ? "gap-1" : "gap-2",
      className
    )}>
      {/* Filter Label */}
      {!compact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Bộ lọc đang áp dụng
            {showCount && ` (${activeFilterCount})`}:
          </span>
        </div>
      )}
      
      {/* Filter Chips */}
      {filterChips.map(chip => (
        <Badge
          key={chip.key}
          variant="secondary"
          className={cn(
            "gap-2 transition-all duration-200 hover:shadow-sm",
            compact ? "text-xs px-2 py-1" : "text-sm px-3 py-1",
            chip.color
          )}
        >
          {/* Chip Icon */}
          {chip.icon && (
            <span className="flex items-center">
              {chip.icon}
            </span>
          )}
          
          {/* Chip Label */}
          <span className="font-medium">
            {chip.label}
          </span>
          
          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveChip(chip)}
            className={cn(
              "hover:bg-transparent text-current hover:text-current/80",
              compact ? "h-3 w-3 p-0" : "h-4 w-4 p-0"
            )}
            aria-label={`Xóa bộ lọc ${chip.label}`}
          >
            <X className={compact ? "h-2 w-2" : "h-3 w-3"} />
          </Button>
        </Badge>
      ))}
      
      {/* Clear All Button */}
      {showClearAll && hasActiveFilters && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleClearAll}
          className={cn(
            "flex items-center gap-2 transition-all duration-200",
            compact ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm"
          )}
        >
          <RotateCcw className={compact ? "h-3 w-3" : "h-4 w-4"} />
          <span>Xóa tất cả</span>
        </Button>
      )}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if filters have any active values
 */
export const hasActiveFilters = (filters: PublicQuestionFilters): boolean => {
  return generateFilterChips(filters).length > 0;
};

/**
 * Count active filters
 */
export const countActiveFilters = (filters: PublicQuestionFilters): number => {
  return generateFilterChips(filters).length;
};

/**
 * Get active filter summary
 */
export const getActiveFilterSummary = (filters: PublicQuestionFilters): string => {
  const chips = generateFilterChips(filters);
  
  if (chips.length === 0) {
    return 'Không có bộ lọc nào';
  }
  
  if (chips.length === 1) {
    return `1 bộ lọc: ${chips[0].label}`;
  }
  
  return `${chips.length} bộ lọc đang áp dụng`;
};

// ===== DEFAULT EXPORT =====

export default PublicFilterChips;
