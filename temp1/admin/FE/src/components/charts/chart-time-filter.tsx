"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Calendar, Clock, Filter } from "lucide-react";

/**
 * Chart Time Filter Component
 * Component filter thời gian cho charts
 */

export type TimeRange = "7d" | "30d" | "90d" | "custom";

interface ChartTimeFilterProps {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  className?: string;
}

const TIME_RANGE_OPTIONS = [
  { value: "7d" as const, label: "7 ngày", description: "Tuần qua" },
  { value: "30d" as const, label: "30 ngày", description: "Tháng qua" },
  { value: "90d" as const, label: "90 ngày", description: "3 tháng qua" },
  { value: "custom" as const, label: "Tùy chỉnh", description: "Chọn khoảng thời gian" },
];

export function ChartTimeFilter({ value, onChange, className = "" }: ChartTimeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = TIME_RANGE_OPTIONS.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        {selectedOption?.label || "30 ngày"}
        <Filter className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-20">
            <div className="p-2 space-y-1">
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    value === option.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Chart Export Button Component
 * Component xuất dữ liệu chart
 */

interface ChartExportButtonProps {
  onExport: (format: "png" | "csv" | "json") => void;
  className?: string;
  disabled?: boolean;
}

export function ChartExportButton({
  onExport,
  className = "",
  disabled = false,
}: ChartExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { value: "png" as const, label: "Xuất PNG", description: "Hình ảnh chart" },
    { value: "csv" as const, label: "Xuất CSV", description: "Dữ liệu bảng" },
    { value: "json" as const, label: "Xuất JSON", description: "Dữ liệu thô" },
  ];

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Xuất dữ liệu
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-40 bg-background border rounded-lg shadow-lg z-20">
            <div className="p-2 space-y-1">
              {exportOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onExport(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Chart Controls Component
 * Component điều khiển charts (filter + export)
 */

interface ChartControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onExport: (format: "png" | "csv" | "json") => void;
  className?: string;
  exportDisabled?: boolean;
}

export function ChartControls({
  timeRange,
  onTimeRangeChange,
  onExport,
  className = "",
  exportDisabled = false,
}: ChartControlsProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <ChartTimeFilter value={timeRange} onChange={onTimeRangeChange} />
      <ChartExportButton onExport={onExport} disabled={exportDisabled} />
    </div>
  );
}
