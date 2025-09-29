/**
 * Public Sort Controls Component
 * Sort controls cho public question browsing theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

// Import UI components
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui";

// Import types (for future use)
// import { PublicQuestionFilters } from "@/types/public";

// ===== CONSTANTS =====

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất', icon: '🕒' },
  { value: 'oldest', label: 'Cũ nhất', icon: '📅' },
  { value: 'popular', label: 'Phổ biến', icon: '🔥' },
  { value: 'rating', label: 'Đánh giá cao', icon: '⭐' },
  { value: 'difficulty', label: 'Độ khó', icon: '📊' }
] as const;

const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Tăng dần', icon: ArrowUp },
  { value: 'desc', label: 'Giảm dần', icon: ArrowDown }
] as const;

const MOBILE_BREAKPOINT = 768;

// ===== TYPES =====

export type SortOption = typeof SORT_OPTIONS[number]['value'];
export type SortDirection = 'asc' | 'desc';

export interface PublicSortControlsProps {
  /** Current sort option */
  sortBy?: SortOption;
  
  /** Current sort direction */
  sortDir?: SortDirection;
  
  /** Sort change handler */
  onSortChange: (sortBy: SortOption, sortDir: SortDirection) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Show sort direction controls */
  showDirection?: boolean;
  
  /** Compact layout for mobile */
  compact?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get default sort direction for sort option
 */
const getDefaultSortDirection = (sortBy: SortOption): SortDirection => {
  switch (sortBy) {
    case 'newest':
    case 'popular':
    case 'rating':
      return 'desc'; // Newest first, most popular first, highest rating first
    case 'oldest':
    case 'difficulty':
      return 'asc'; // Oldest first, easiest first
    default:
      return 'desc';
  }
};

/**
 * Get sort option display info
 */
const getSortOptionInfo = (sortBy: SortOption) => {
  return SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0];
};

/**
 * Get sort direction display info
 */
const getSortDirectionInfo = (sortDir: SortDirection) => {
  return SORT_DIRECTIONS.find(direction => direction.value === sortDir) || SORT_DIRECTIONS[1];
};

/**
 * Detect if mobile device
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

// ===== MAIN COMPONENT =====

export const PublicSortControls: React.FC<PublicSortControlsProps> = ({
  sortBy = 'newest',
  sortDir = 'desc',
  onSortChange,
  isLoading = false,
  disabled = false,
  showDirection = true,
  compact = false,
  className = ''
}) => {
  // ===== STATE =====
  
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  
  // ===== COMPUTED VALUES =====
  
  const currentSortOption = getSortOptionInfo(sortBy);
  const currentSortDirection = getSortDirectionInfo(sortDir);
  const isCompactMode = compact || isMobile;
  
  // ===== EVENT HANDLERS =====
  
  const handleSortByChange = useCallback((newSortBy: string) => {
    const sortOption = newSortBy as SortOption;
    const defaultDirection = getDefaultSortDirection(sortOption);
    onSortChange(sortOption, defaultDirection);
  }, [onSortChange]);
  
  const handleSortDirectionChange = useCallback((newSortDir: string) => {
    const direction = newSortDir as SortDirection;
    onSortChange(sortBy, direction);
  }, [sortBy, onSortChange]);
  
  const handleToggleSortDirection = useCallback(() => {
    const newDirection = sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newDirection);
  }, [sortBy, sortDir, onSortChange]);
  
  const handleQuickSort = useCallback((option: SortOption, direction: SortDirection) => {
    onSortChange(option, direction);
  }, [onSortChange]);
  
  // ===== RESPONSIVE HANDLING =====
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render compact sort controls (mobile)
   */
  const renderCompactControls = () => (
    <div className="flex items-center gap-2">
      {/* Combined Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            className="flex items-center gap-2 min-w-[120px]"
          >
            <span className="text-xs">{currentSortOption.icon}</span>
            <span className="truncate">{currentSortOption.label}</span>
            {showDirection && (
              <currentSortDirection.icon className="h-3 w-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {SORT_OPTIONS.map((option) => (
            <React.Fragment key={option.value}>
              <DropdownMenuItem
                onClick={() => handleQuickSort(option.value, getDefaultSortDirection(option.value))}
                className="flex items-center gap-2"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {option.value === sortBy && (
                  <currentSortDirection.icon className="h-3 w-3 ml-auto" />
                )}
              </DropdownMenuItem>
              {showDirection && option.value === sortBy && (
                <>
                  <DropdownMenuSeparator />
                  {SORT_DIRECTIONS.map((direction) => (
                    <DropdownMenuItem
                      key={direction.value}
                      onClick={() => handleSortDirectionChange(direction.value)}
                      className="flex items-center gap-2 pl-6"
                    >
                      <direction.icon className="h-3 w-3" />
                      <span className="text-sm">{direction.label}</span>
                      {direction.value === sortDir && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  /**
   * Render full sort controls (desktop)
   */
  const renderFullControls = () => (
    <div className="flex items-center gap-3">
      {/* Sort By Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Sắp xếp:
        </span>
        <Select
          value={sortBy}
          onValueChange={handleSortByChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{currentSortOption.icon}</span>
                <span>{currentSortOption.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Sort Direction Controls */}
      {showDirection && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSortDirection}
            disabled={disabled || isLoading}
            className="flex items-center gap-1 px-3"
            title={`${currentSortDirection.label} - Click để đổi hướng`}
          >
            <currentSortDirection.icon className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">
              {currentSortDirection.label}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={cn(
      "public-sort-controls flex items-center",
      isCompactMode ? "justify-end" : "justify-between",
      className
    )}>
      {isCompactMode ? renderCompactControls() : renderFullControls()}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get sort display text for current settings
 */
export const getSortDisplayText = (sortBy: SortOption, sortDir: SortDirection): string => {
  const option = getSortOptionInfo(sortBy);
  const direction = getSortDirectionInfo(sortDir);
  return `${option.label} (${direction.label})`;
};

/**
 * Get sort query parameters for URL
 */
export const getSortQueryParams = (sortBy: SortOption, sortDir: SortDirection) => {
  return {
    sortBy,
    sortDir
  };
};

/**
 * Parse sort from URL parameters
 */
export const parseSortFromParams = (searchParams: URLSearchParams) => {
  const sortBy = (searchParams.get('sortBy') as SortOption) || 'newest';
  const sortDir = (searchParams.get('sortDir') as SortDirection) || getDefaultSortDirection(sortBy);
  
  return { sortBy, sortDir };
};

// ===== DEFAULT EXPORT =====

export default PublicSortControls;
