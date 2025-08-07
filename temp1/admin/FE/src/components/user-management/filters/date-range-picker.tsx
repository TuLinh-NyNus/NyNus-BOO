/**
 * Date Range Picker Component
 * Component chọn khoảng thời gian cho filtering
 */

"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Calendar, X, Clock } from "lucide-react";

import { DateRange } from "../../../types/user-filters";

/**
 * Date Range Picker Props
 * Props cho Date Range Picker component
 */
interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Predefined date ranges
 * Các khoảng thời gian định sẵn
 */
const PREDEFINED_RANGES = [
  {
    label: "Hôm nay",
    getValue: () => ({
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
  },
  {
    label: "Hôm qua",
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        from: new Date(yesterday.setHours(0, 0, 0, 0)),
        to: new Date(yesterday.setHours(23, 59, 59, 999)),
      };
    },
  },
  {
    label: "7 ngày qua",
    getValue: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "30 ngày qua",
    getValue: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "3 tháng qua",
    getValue: () => ({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "6 tháng qua",
    getValue: () => ({
      from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "1 năm qua",
    getValue: () => ({
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
];

/**
 * Format date for input
 * Format date cho input
 */
function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse date from input
 * Parse date từ input
 */
function parseDateFromInput(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format date range for display
 * Format date range để hiển thị
 */
function formatDateRangeDisplay(range?: DateRange): string {
  if (!range) return "";

  const { from, to } = range;

  if (from && to) {
    const fromStr = from.toLocaleDateString("vi-VN");
    const toStr = to.toLocaleDateString("vi-VN");

    if (fromStr === toStr) {
      return fromStr;
    }

    return `${fromStr} - ${toStr}`;
  } else if (from) {
    return `Từ ${from.toLocaleDateString("vi-VN")}`;
  } else if (to) {
    return `Đến ${to.toLocaleDateString("vi-VN")}`;
  }

  return "";
}

/**
 * Date Range Picker Component
 * Component chọn khoảng thời gian
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  className = "",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState(value?.from ? formatDateForInput(value.from) : "");
  const [toDate, setToDate] = useState(value?.to ? formatDateForInput(value.to) : "");

  /**
   * Handle predefined range selection
   * Xử lý chọn khoảng thời gian định sẵn
   */
  const handlePredefinedRange = (rangeGetter: () => DateRange) => {
    const range = rangeGetter();
    setFromDate(range.from ? formatDateForInput(range.from) : "");
    setToDate(range.to ? formatDateForInput(range.to) : "");
    onChange(range);
    setIsOpen(false);
  };

  /**
   * Handle custom date change
   * Xử lý thay đổi ngày tùy chỉnh
   */
  const handleDateChange = (type: "from" | "to", dateString: string) => {
    if (type === "from") {
      setFromDate(dateString);
    } else {
      setToDate(dateString);
    }

    const fromDateObj = parseDateFromInput(type === "from" ? dateString : fromDate);
    const toDateObj = parseDateFromInput(type === "to" ? dateString : toDate);

    // Validate date range
    if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
      return; // Invalid range, don't update
    }

    const newRange: DateRange = {
      from: fromDateObj || undefined,
      to: toDateObj || undefined,
    };

    // Only call onChange if we have at least one date
    if (newRange.from || newRange.to) {
      onChange(newRange);
    } else {
      onChange(undefined);
    }
  };

  /**
   * Clear date range
   * Xóa khoảng thời gian
   */
  const handleClear = () => {
    setFromDate("");
    setToDate("");
    onChange(undefined);
    setIsOpen(false);
  };

  /**
   * Apply custom range
   * Áp dụng khoảng thời gian tùy chỉnh
   */
  const handleApplyCustomRange = () => {
    const fromDateObj = parseDateFromInput(fromDate);
    const toDateObj = parseDateFromInput(toDate);

    if (fromDateObj || toDateObj) {
      onChange({
        from: fromDateObj || undefined,
        to: toDateObj || undefined,
      });
    }

    setIsOpen(false);
  };

  const displayValue = formatDateRangeDisplay(value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {displayValue || placeholder}
        {value && (
          <X
            className="ml-auto h-4 w-4 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
          <div className="p-4 space-y-4">
            {/* Predefined Ranges */}
            <div>
              <Label className="text-sm font-medium">Khoảng thời gian nhanh</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PREDEFINED_RANGES.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedRange(range.getValue)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Tùy chỉnh khoảng thời gian</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="from-date" className="text-xs text-muted-foreground">
                    Từ ngày
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date" className="text-xs text-muted-foreground">
                    Đến ngày
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" size="sm" onClick={handleClear}>
                Xóa
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleApplyCustomRange} disabled={!fromDate && !toDate}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
