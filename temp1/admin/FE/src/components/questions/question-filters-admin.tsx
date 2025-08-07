/**
 * Question Filters Admin Component
 * Advanced filtering interface cho admin question management
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Label,
} from "@/components/ui";
import { Search, Filter, X, RotateCcw, Calendar, User, Hash } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Filter options configuration
 */
const FILTER_OPTIONS = {
  status: [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "INACTIVE", label: "Tạm ngưng" },
    { value: "ARCHIVED", label: "Lưu trữ" },
  ],
  type: [
    { value: "", label: "Tất cả loại" },
    { value: "MC", label: "Trắc nghiệm" },
    { value: "TF", label: "Đúng/Sai" },
    { value: "SA", label: "Trả lời ngắn" },
    { value: "ES", label: "Tự luận" },
    { value: "MA", label: "Ghép đôi" },
  ],
  grade: [
    { value: "", label: "Tất cả lớp" },
    { value: "0", label: "Lớp 10" },
    { value: "1", label: "Lớp 11" },
    { value: "2", label: "Lớp 12" },
    { value: "3", label: "Lớp 6" },
    { value: "4", label: "Lớp 7" },
    { value: "5", label: "Lớp 8" },
    { value: "6", label: "Lớp 9" },
  ],
  subject: [
    { value: "", label: "Tất cả môn" },
    { value: "P", label: "Toán học" },
    { value: "L", label: "Vật lý" },
    { value: "H", label: "Hóa học" },
    { value: "S", label: "Sinh học" },
    { value: "V", label: "Văn học" },
    { value: "A", label: "Tiếng Anh" },
  ],
  level: [
    { value: "", label: "Tất cả mức độ" },
    { value: "N", label: "Nhận biết" },
    { value: "H", label: "Thông hiểu" },
    { value: "V", label: "Vận dụng" },
    { value: "C", label: "Vận dụng cao" },
    { value: "T", label: "VIP" },
    { value: "M", label: "Note" },
  ],
};

/**
 * Props for QuestionFiltersAdmin component
 */
interface QuestionFiltersAdminProps {
  onFilterChange: (filters: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

/**
 * Question Filters Admin Component
 * Comprehensive filtering interface với URL state management
 */
export function QuestionFiltersAdmin({
  onFilterChange,
  initialFilters = {},
}: QuestionFiltersAdminProps) {
  // Filter state
  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    status: initialFilters.status || "",
    type: initialFilters.type || "",
    grade: initialFilters.grade || "",
    subject: initialFilters.subject || "",
    level: initialFilters.level || "",
    creator: initialFilters.creator || "",
    questionCode: initialFilters.questionCode || "",
    dateFrom: initialFilters.dateFrom || "",
    dateTo: initialFilters.dateTo || "",
  });

  // Debounced search để tránh quá nhiều API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    // Remove empty filters
    const cleanFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value && value.trim()) {
          acc[key] = value.trim();
        }
        return acc;
      },
      {} as Record<string, string>
    );

    onFilterChange(cleanFilters);
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    const emptyFilters = {
      search: "",
      status: "",
      type: "",
      grade: "",
      subject: "",
      level: "",
      creator: "",
      questionCode: "",
      dateFrom: "",
      dateTo: "",
    };

    setFilters(emptyFilters);
    onFilterChange({});
  };

  /**
   * Get active filter count
   */
  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value && value.trim()).length;
  };

  /**
   * Remove specific filter
   */
  const removeFilter = (key: string) => {
    handleFilterChange(key, "");
  };

  // Apply filters when search changes (debounced)
  useEffect(() => {
    if (debouncedSearch !== initialFilters.search) {
      applyFilters();
    }
  }, [debouncedSearch]);

  // Apply filters when other filters change
  useEffect(() => {
    const { search, ...otherFilters } = filters;
    const hasOtherChanges = Object.entries(otherFilters).some(
      ([key, value]) => value !== (initialFilters[key] || "")
    );

    if (hasOtherChanges) {
      applyFilters();
    }
  }, [
    filters.status,
    filters.type,
    filters.grade,
    filters.subject,
    filters.level,
    filters.creator,
    filters.questionCode,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="question-filters-admin">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc tìm kiếm
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Tìm kiếm nội dung</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm kiếm trong nội dung câu hỏi..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => removeFilter("search")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.status.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label>Loại câu hỏi</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.type.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Filter */}
          <div className="space-y-2">
            <Label>Lớp</Label>
            <Select
              value={filters.grade}
              onValueChange={(value) => handleFilterChange("grade", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.grade.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-2">
            <Label>Môn học</Label>
            <Select
              value={filters.subject}
              onValueChange={(value) => handleFilterChange("subject", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.subject.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <Label>Mức độ</Label>
            <Select
              value={filters.level}
              onValueChange={(value) => handleFilterChange("level", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mức độ" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.level.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creator Filter */}
          <div className="space-y-2">
            <Label htmlFor="creator">Người tạo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="creator"
                placeholder="Tên người tạo..."
                value={filters.creator}
                onChange={(e) => handleFilterChange("creator", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Question Code Filter */}
          <div className="space-y-2">
            <Label htmlFor="questionCode">Mã câu hỏi</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="questionCode"
                placeholder="VD: 0P1N1"
                value={filters.questionCode}
                onChange={(e) => handleFilterChange("questionCode", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Ngày tạo</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="flex-1"
              />
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <Label>Bộ lọc đang áp dụng:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || !value.trim()) return null;

                const getFilterLabel = (key: string, value: string) => {
                  switch (key) {
                    case "search":
                      return `Tìm kiếm: "${value}"`;
                    case "status":
                      return `Trạng thái: ${FILTER_OPTIONS.status.find((o) => o.value === value)?.label || value}`;
                    case "type":
                      return `Loại: ${FILTER_OPTIONS.type.find((o) => o.value === value)?.label || value}`;
                    case "grade":
                      return `Lớp: ${FILTER_OPTIONS.grade.find((o) => o.value === value)?.label || value}`;
                    case "subject":
                      return `Môn: ${FILTER_OPTIONS.subject.find((o) => o.value === value)?.label || value}`;
                    case "level":
                      return `Mức độ: ${FILTER_OPTIONS.level.find((o) => o.value === value)?.label || value}`;
                    case "creator":
                      return `Người tạo: ${value}`;
                    case "questionCode":
                      return `Mã: ${value}`;
                    case "dateFrom":
                      return `Từ: ${value}`;
                    case "dateTo":
                      return `Đến: ${value}`;
                    default:
                      return `${key}: ${value}`;
                  }
                };

                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {getFilterLabel(key, value)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-transparent"
                      onClick={() => removeFilter(key)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
