'use client';

import React, { useState, useCallback } from 'react';
import { QuestionFilters } from '@/types/question';
import { useQuestionFiltersUrl } from '@/hooks';
import { BasicFiltersRow } from './basic-filters-row';
import { AdvancedFiltersSection } from './advanced-filters-section';
import { FilterChips } from './filter-chips';

const FILTER_APPLY_DEBOUNCE_MS = 300;

/**
 * Comprehensive Question Filters Component
 * Hệ thống lọc câu hỏi toàn diện với giao diện đơn giản, dễ sử dụng
 * 
 * Layout:
 * 1. Hàng CƠ BẢN (luôn hiển thị): subcount + 6 QuestionCode fields + question type + toggle
 * 2. Section NÂNG CAO (có thể thu gọn): content search, usage count, source, media filters, tags, status, creator
 */

interface ComprehensiveQuestionFiltersProps {
  onFiltersChange: (filters: QuestionFilters) => void;
  isLoading?: boolean;
  defaultFilters?: Partial<QuestionFilters>;
}

export function ComprehensiveQuestionFilters({
  onFiltersChange,
  isLoading = false,
  defaultFilters = {}
}: ComprehensiveQuestionFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  // Local filter state (not applied until user clicks "Lọc" button)
  const [localFilters, setLocalFilters] = useState<QuestionFilters>(defaultFilters as QuestionFilters);
  
  // Applied filters (synced to URL and parent)
  const [appliedFilters, setAppliedFilters] = useState<QuestionFilters>(defaultFilters as QuestionFilters);

  // URL sync hook
  const {
    filters,
    updateFilters,
    resetFilters,
    getCleanFilters,
    isInitialized
  } = useQuestionFiltersUrl({
    defaultFilters,
    debounceMs: 300
  });

  /**
   * Handle filter changes from child components (local state only)
   * Don't apply until user clicks "Lọc" button
   */
  const handleFiltersChange = useCallback((newFilters: Partial<QuestionFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  /**
   * Apply filters when user clicks "Lọc" button
   */
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(localFilters);
    updateFilters(localFilters);
  }, [localFilters, updateFilters]);

  /**
   * Toggle advanced section
   */
  const handleToggleAdvanced = useCallback(() => {
    setIsAdvancedOpen(prev => !prev);
  }, []);

  /**
   * Handle reset all filters
   */
  const handleResetAll = useCallback(() => {
    setLocalFilters(defaultFilters as QuestionFilters);
    setAppliedFilters(defaultFilters as QuestionFilters);
    resetFilters();
    setIsAdvancedOpen(false);
  }, [resetFilters, defaultFilters]);

  /**
   * Notify parent when filters change
   * FIXED: Use stable callback ref and proper memoization to prevent infinite loop
   */
  const onFiltersChangeRef = React.useRef(onFiltersChange);
  const prevFiltersRef = React.useRef<QuestionFilters>({});

  // Update ref on every render but don't trigger re-render
  React.useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  });

  // FIXED: Only notify parent when filters actually change AND initialized
  React.useEffect(() => {
    if (!isInitialized) {
      return; // Don't notify during initialization
    }

    // Deep comparison to prevent unnecessary calls
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);

    if (filtersChanged) {
      prevFiltersRef.current = filters;
      const cleanFilters = getCleanFilters();

      // Use timeout to batch updates and prevent rapid-fire calls
      const timeoutId = setTimeout(() => {
        onFiltersChangeRef.current(cleanFilters);
      }, FILTER_APPLY_DEBOUNCE_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [filters, isInitialized, getCleanFilters]);



  return (
    <div className="space-y-4">
      {/* Basic Filters Row - Always Visible */}
      <BasicFiltersRow
        filters={localFilters}
        onFiltersChange={handleFiltersChange}
        isAdvancedOpen={isAdvancedOpen}
        onToggleAdvanced={handleToggleAdvanced}
        onApplyFilters={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* Advanced Filters Section - Collapsible */}
      {isAdvancedOpen && (
        <div>
          <AdvancedFiltersSection
            filters={localFilters}
            onFiltersChange={handleFiltersChange}
            isOpen={isAdvancedOpen}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Filter Chips - Show active filters (positioned after advanced filters) */}
      <FilterChips
        filters={appliedFilters}
        updateFilters={(newFilters) => {
          setLocalFilters(prev => ({ ...prev, ...newFilters }));
          setAppliedFilters(prev => ({ ...prev, ...newFilters }));
          updateFilters(newFilters);
        }}
        resetFilters={handleResetAll}
      />

      {/* Filter Summary - Removed */}
    </div>
  );
}

/**
 * Filter Summary Component removed - not used in current implementation
 */

// Export for backward compatibility
export default ComprehensiveQuestionFilters;

// Named export for new usage
export { ComprehensiveQuestionFilters as ComprehensiveQuestionFiltersNew };
