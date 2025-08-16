/**
 * Comprehensive Question Filters Component
 * Main component cho hệ thống lọc câu hỏi toàn diện
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { QuestionFilters } from '@/lib/types/question';
import { BasicFiltersRow } from './BasicFiltersRow';
import { AdvancedFiltersSection } from './AdvancedFiltersSection';

// ===== INTERFACES =====

interface ComprehensiveQuestionFiltersProps {
  /**
   * Current filter values
   */
  filters: QuestionFilters;
  
  /**
   * Callback khi filters thay đổi
   */
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  
  /**
   * Callback để reset tất cả filters
   */
  onResetFilters: () => void;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Show/hide filter count
   */
  showFilterCount?: boolean;
}

// ===== HELPER FUNCTIONS =====

/**
 * Count active filters
 */
function countActiveFilters(filters: QuestionFilters): number {
  let count = 0;
  
  // Basic filters
  if (filters.subcount) count++;
  if (filters.grade?.length) count++;
  if (filters.subject?.length) count++;
  if (filters.chapter?.length) count++;
  if (filters.lesson?.length) count++;
  if (filters.level?.length) count++;
  if (filters.format?.length) count++;
  if (filters.type) count++;
  
  // Advanced filters
  if (filters.globalSearch) count++;
  if (filters.usageCount?.min || filters.usageCount?.max) count++;
  if (filters.source?.length) count++;
  if (filters.status) count++;
  if (filters.creator?.length) count++;
  if (filters.tags?.length) count++;
  if (filters.hasImages) count++;
  if (filters.hasSolution) count++;
  if (filters.hasAnswers) count++;
  
  return count;
}

/**
 * Check if any advanced filters are active
 */
function hasAdvancedFilters(filters: QuestionFilters): boolean {
  return !!(
    filters.globalSearch ||
    filters.usageCount?.min ||
    filters.usageCount?.max ||
    filters.source?.length ||
    filters.status ||
    filters.creator?.length ||
    filters.tags?.length ||
    filters.hasImages ||
    filters.hasSolution ||
    filters.hasAnswers
  );
}

// ===== MAIN COMPONENT =====

/**
 * Comprehensive Question Filters Component
 * Hệ thống lọc câu hỏi toàn diện với basic và advanced sections
 */
export function ComprehensiveQuestionFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  isLoading = false,
  className = '',
  showFilterCount = true
}: ComprehensiveQuestionFiltersProps) {
  // State cho advanced section
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasAdvancedFilters(filters));
  
  // Count active filters
  const activeFilterCount = countActiveFilters(filters);
  
  /**
   * Handle toggle advanced section
   */
  const handleToggleAdvanced = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };
  
  /**
   * Handle filters change với validation
   */
  const handleFiltersChange = (newFilters: Partial<QuestionFilters>) => {
    // Validate và clean up filters
    const cleanedFilters = { ...newFilters };
    
    // Remove empty arrays
    Object.keys(cleanedFilters).forEach(key => {
      const value = cleanedFilters[key as keyof QuestionFilters];
      if (Array.isArray(value) && value.length === 0) {
        delete cleanedFilters[key as keyof QuestionFilters];
      }
    });
    
    onFiltersChange(cleanedFilters);
  };
  
  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setIsAdvancedOpen(false);
    onResetFilters();
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Bộ lọc câu hỏi
            {showFilterCount && activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </CardTitle>
          
          {/* Quick stats */}
          {showFilterCount && (
            <div className="text-sm text-gray-500">
              {isAdvancedOpen ? 'Đang hiển thị bộ lọc nâng cao' : 'Bộ lọc cơ bản'}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-0">
        {/* Basic Filters Row */}
        <BasicFiltersRow
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isAdvancedOpen={isAdvancedOpen}
          onToggleAdvanced={handleToggleAdvanced}
        />
        
        {/* Advanced Filters Section */}
        <AdvancedFiltersSection
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
          isOpen={isAdvancedOpen}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Đang tải...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== EXPORTS =====

export default ComprehensiveQuestionFilters;

// Export helper functions for external use
export { countActiveFilters, hasAdvancedFilters };
