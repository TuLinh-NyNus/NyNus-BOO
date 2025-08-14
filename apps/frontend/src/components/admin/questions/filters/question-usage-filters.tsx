/**
 * Question Usage Filters Component
 * Filters cho usage statistics (Usage Count, Feedback, Date Range)
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/form/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Badge } from "@/components/ui/display/badge";

// Import custom components
import { UsageCountRangeSlider, FeedbackRangeSlider } from "@/components/ui/form/range-slider";
import { DateRangePicker } from "@/components/features/admin/user-management/filters/date-range-picker";

// Import store
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface QuestionUsageFiltersProps {
  className?: string;
}

// ===== COMPONENT =====

/**
 * Question Usage Filters Component
 * Advanced filters cho usage statistics và performance metrics
 */
export function QuestionUsageFilters({
  className = ""
}: QuestionUsageFiltersProps) {
  // Store state và actions
  const {
    filters,
    setUsageCountFilter,
    setFeedbackFilter,
    setDateRangeFilter
  } = useQuestionFiltersStore();

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (dateRange: { from: string; to: string }) => {
    if (!dateRange.from && !dateRange.to) {
      setDateRangeFilter(undefined);
      return;
    }

    const currentField = filters.dateRange?.field || 'createdAt';
    setDateRangeFilter({
      from: dateRange.from ? new Date(dateRange.from) : undefined,
      to: dateRange.to ? new Date(dateRange.to) : undefined,
      field: currentField
    });
  };

  /**
   * Handle date field change
   */
  const handleDateFieldChange = (field: 'createdAt' | 'updatedAt') => {
    if (!filters.dateRange) {
      setDateRangeFilter({
        from: undefined,
        to: undefined,
        field
      });
      return;
    }

    setDateRangeFilter({
      ...filters.dateRange,
      field
    });
  };

  /**
   * Get current date range value for DateRangePicker
   */
  const getCurrentDateRange = () => {
    if (!filters.dateRange) {
      return { from: '', to: '' };
    }

    return {
      from: filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : '',
      to: filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''
    };
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Usage Count Range Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Số lần sử dụng</Label>
          {filters.usageCount && (
            <Badge variant="secondary" className="text-xs">
              {filters.usageCount.min !== undefined ? filters.usageCount.min : 0} - {filters.usageCount.max !== undefined ? filters.usageCount.max : '∞'}
            </Badge>
          )}
        </div>
        
        <UsageCountRangeSlider
          value={filters.usageCount || { min: undefined, max: undefined }}
          onChange={setUsageCountFilter}
          className="w-full"
        />
        
        {/* Usage count description */}
        <div className="text-xs text-muted-foreground">
          Lọc câu hỏi theo số lần được sử dụng trong các bài thi và bài tập
        </div>
      </div>

      {/* Feedback Score Range Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Điểm feedback</Label>
          {filters.feedback && (
            <Badge variant="secondary" className="text-xs">
              {filters.feedback.min !== undefined ? filters.feedback.min.toFixed(1) : '0.0'} - {filters.feedback.max !== undefined ? filters.feedback.max.toFixed(1) : '10.0'}
            </Badge>
          )}
        </div>
        
        <FeedbackRangeSlider
          value={filters.feedback || { min: undefined, max: undefined }}
          onChange={setFeedbackFilter}
          className="w-full"
        />
        
        {/* Feedback description */}
        <div className="text-xs text-muted-foreground">
          Lọc câu hỏi theo điểm feedback trung bình từ học viên (0-10)
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Khoảng thời gian</Label>
          {filters.dateRange && (
            <Badge variant="secondary" className="text-xs">
              {filters.dateRange.field === 'createdAt' ? 'Ngày tạo' : 'Ngày cập nhật'}
            </Badge>
          )}
        </div>
        
        {/* Date field selector */}
        <div className="space-y-2">
          <Label className="text-xs">Lọc theo</Label>
          <Select
            value={filters.dateRange?.field || 'createdAt'}
            onValueChange={handleDateFieldChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trường ngày..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Ngày tạo</SelectItem>
              <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Date range picker */}
        <DateRangePicker
          value={getCurrentDateRange()}
          onChange={handleDateRangeChange}
          placeholder="Chọn khoảng thời gian..."
          className="w-full"
        />
        
        {/* Date range description */}
        <div className="text-xs text-muted-foreground">
          {filters.dateRange?.field === 'createdAt' 
            ? 'Lọc câu hỏi theo ngày tạo'
            : 'Lọc câu hỏi theo ngày cập nhật cuối cùng'
          }
        </div>
      </div>

      {/* Usage Statistics Summary */}
      {(filters.usageCount || filters.feedback || filters.dateRange) && (
        <div className="pt-3 border-t">
          <Label className="text-sm font-medium mb-2 block">Tóm tắt bộ lọc</Label>
          <div className="space-y-1 text-xs text-muted-foreground">
            {filters.usageCount && (
              <div>
                • Số lần sử dụng: {filters.usageCount.min !== undefined ? filters.usageCount.min : 0} - {filters.usageCount.max !== undefined ? filters.usageCount.max : '∞'}
              </div>
            )}
            {filters.feedback && (
              <div>
                • Điểm feedback: {filters.feedback.min !== undefined ? filters.feedback.min.toFixed(1) : '0.0'} - {filters.feedback.max !== undefined ? filters.feedback.max.toFixed(1) : '10.0'}
              </div>
            )}
            {filters.dateRange && (
              <div>
                • {filters.dateRange.field === 'createdAt' ? 'Ngày tạo' : 'Ngày cập nhật'}: {
                  filters.dateRange.from 
                    ? filters.dateRange.from.toLocaleDateString('vi-VN')
                    : 'Không giới hạn'
                } - {
                  filters.dateRange.to 
                    ? filters.dateRange.to.toLocaleDateString('vi-VN')
                    : 'Không giới hạn'
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Filter Combinations */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Bộ lọc nhanh</Label>
        <div className="flex flex-wrap gap-2">
          {/* Popular Questions */}
          <button
            onClick={() => {
              setUsageCountFilter({ min: 10, max: undefined });
              setFeedbackFilter({ min: 7, max: undefined });
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            Câu hỏi phổ biến
          </button>
          
          {/* High Quality */}
          <button
            onClick={() => {
              setFeedbackFilter({ min: 8, max: undefined });
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Chất lượng cao
          </button>
          
          {/* Recently Created */}
          <button
            onClick={() => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              setDateRangeFilter({
                from: thirtyDaysAgo,
                to: new Date(),
                field: 'createdAt'
              });
            }}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            30 ngày qua
          </button>
          
          {/* Unused Questions */}
          <button
            onClick={() => {
              setUsageCountFilter({ min: 0, max: 0 });
            }}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            Chưa sử dụng
          </button>
          
          {/* Low Feedback */}
          <button
            onClick={() => {
              setFeedbackFilter({ min: 0, max: 5 });
            }}
            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
          >
            Feedback thấp
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionUsageFilters;
