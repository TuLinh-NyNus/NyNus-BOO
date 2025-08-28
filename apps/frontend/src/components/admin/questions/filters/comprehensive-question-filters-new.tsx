'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionFilters } from '@/lib/types/question';
import { useQuestionFiltersUrl } from '@/hooks/use-question-filters-url';
import { BasicFiltersRow } from './basic-filters-row';
import { AdvancedFiltersSection } from './advanced-filters-section';
import { FilterChips } from './filter-chips';

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
   * Handle filter changes from child components
   */
  const handleFiltersChange = useCallback((newFilters: Partial<QuestionFilters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

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
    resetFilters();
    setIsAdvancedOpen(false);
  }, [resetFilters]);

  /**
   * Notify parent when filters change
   * Use previous filters comparison to prevent unnecessary calls
   */
  const onFiltersChangeRef = React.useRef(onFiltersChange);
  const prevFiltersRef = React.useRef<QuestionFilters>({});
  onFiltersChangeRef.current = onFiltersChange;

  React.useEffect(() => {
    if (isInitialized) {
      // Only notify if filters actually changed
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);

      if (filtersChanged) {
        prevFiltersRef.current = filters;
        const cleanFilters = getCleanFilters();
        onFiltersChangeRef.current(cleanFilters);
      }
    }
  }, [filters, isInitialized, getCleanFilters]);



  return (
    <div className="space-y-4">
      {/* Basic Filters Row - Always Visible */}
      <BasicFiltersRow
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isAdvancedOpen={isAdvancedOpen}
        onToggleAdvanced={handleToggleAdvanced}
        isLoading={isLoading}
      />

      {/* Advanced Filters Section - Collapsible */}
      <AnimatePresence>
        {isAdvancedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            style={{ overflow: 'hidden' }}
          >
            <AdvancedFiltersSection
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isAdvancedOpen}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Chips - Show active filters (positioned after advanced filters) */}
      <FilterChips
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Filter Summary */}
      {isInitialized && (
        <FilterSummary
          filters={filters}
          onReset={handleResetAll}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

/**
 * Filter Summary Component
 * Hiển thị tóm tắt các filters đang active
 */
interface FilterSummaryProps {
  filters: QuestionFilters;
  onReset: () => void;
  isLoading: boolean;
}

function FilterSummary({ filters, onReset, isLoading }: FilterSummaryProps) {
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    
    // Count non-empty filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'page' || key === 'pageSize') return; // Skip pagination
      
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });

    return count;
  }, [filters]);

  if (activeFiltersCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-blue-900">
          Đang áp dụng {activeFiltersCount} bộ lọc
        </span>
        {filters.keyword && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Tìm kiếm: &quot;{filters.keyword}&quot;
          </span>
        )}
        {filters.subcount && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Subcount: {filters.subcount}
          </span>
        )}
      </div>
      
      <button
        onClick={onReset}
        disabled={isLoading}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
      >
        Xóa tất cả
      </button>
    </div>
  );
}

// Export for backward compatibility
export default ComprehensiveQuestionFilters;

// Named export for new usage
export { ComprehensiveQuestionFilters as ComprehensiveQuestionFiltersNew };
