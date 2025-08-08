/**
 * Date Range Picker Component
 * Component chọn khoảng thời gian cho filtering
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover";
import { Calendar, ChevronDown, X } from "lucide-react";

/**
 * Date range interface
 */
interface DateRange {
  from: string;
  to: string;
}

/**
 * Date Range Picker Props
 */
interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Predefined date ranges
 */
const PREDEFINED_RANGES = [
  {
    label: "Hôm nay",
    getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { from: today, to: today };
    },
  },
  {
    label: "7 ngày qua",
    getValue: () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: sevenDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: "30 ngày qua",
    getValue: () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: thirtyDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: "3 tháng qua",
    getValue: () => {
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      return {
        from: threeMonthsAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: "Năm nay",
    getValue: () => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return {
        from: startOfYear.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };
    },
  },
];

/**
 * Format date for display
 */
function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get display text for date range
 */
function getDisplayText(dateRange: DateRange): string {
  if (!dateRange.from && !dateRange.to) {
    return 'Chọn khoảng thời gian';
  }
  
  if (dateRange.from && dateRange.to) {
    if (dateRange.from === dateRange.to) {
      return formatDateForDisplay(dateRange.from);
    }
    return `${formatDateForDisplay(dateRange.from)} - ${formatDateForDisplay(dateRange.to)}`;
  }
  
  if (dateRange.from) {
    return `Từ ${formatDateForDisplay(dateRange.from)}`;
  }
  
  if (dateRange.to) {
    return `Đến ${formatDateForDisplay(dateRange.to)}`;
  }
  
  return 'Chọn khoảng thời gian';
}

/**
 * Date Range Picker Component
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  className = "",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<DateRange>(value);

  /**
   * Handle predefined range selection
   */
  const handlePredefinedRange = (range: DateRange) => {
    setLocalValue(range);
    onChange(range);
    setIsOpen(false);
  };

  /**
   * Handle manual date input
   */
  const handleDateChange = (field: 'from' | 'to', dateValue: string) => {
    const updatedRange = { ...localValue, [field]: dateValue };
    setLocalValue(updatedRange);
    onChange(updatedRange);
  };

  /**
   * Clear date range
   */
  const handleClear = () => {
    const emptyRange = { from: '', to: '' };
    setLocalValue(emptyRange);
    onChange(emptyRange);
    setIsOpen(false);
  };

  /**
   * Validate date range
   */
  const isValidRange = () => {
    if (!localValue.from || !localValue.to) return true;
    return new Date(localValue.from) <= new Date(localValue.to);
  };

  const hasValue = localValue.from || localValue.to;

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between ${!hasValue ? 'text-muted-foreground' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{getDisplayText(localValue)}</span>
            </div>
            <div className="flex items-center gap-1">
              {hasValue && (
                <X
                  className="h-3 w-3 hover:bg-muted rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Predefined Ranges */}
            <div>
              <Label className="text-sm font-medium">Quick Select</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PREDEFINED_RANGES.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedRange(range.getValue())}
                    className="justify-start text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Manual Date Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Range</Label>
              
              <div className="space-y-2">
                <div>
                  <Label htmlFor="from-date" className="text-xs">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={localValue.from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    max={localValue.to || undefined}
                  />
                </div>
                
                <div>
                  <Label htmlFor="to-date" className="text-xs">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={localValue.to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    min={localValue.from || undefined}
                  />
                </div>
              </div>

              {!isValidRange() && (
                <div className="text-xs text-red-600">
                  Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={!isValidRange()}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
