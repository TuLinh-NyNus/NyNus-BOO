/**
 * Question Filter Grid Component
 * Grid bộ lọc câu hỏi chính
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@/components/ui";

// Import types từ lib/types
import { 
  IQuestionFilters,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty 
} from "@/lib/types/question";

/**
 * Filter options configuration
 */
const FILTER_OPTIONS = {
  status: [
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "INACTIVE", label: "Không hoạt động" },
    { value: "ARCHIVED", label: "Lưu trữ" },
  ],
  type: [
    { value: "MC", label: "Trắc nghiệm" },
    { value: "TF", label: "Đúng/Sai" },
    { value: "SA", label: "Trả lời ngắn" },
    { value: "ES", label: "Tự luận" },
    { value: "MA", label: "Ghép đôi" },
  ],
  difficulty: [
    { value: "EASY", label: "Dễ" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HARD", label: "Khó" },
  ],
  sortBy: [
    { value: "createdAt", label: "Ngày tạo" },
    { value: "updatedAt", label: "Ngày cập nhật" },
    { value: "questionCodeId", label: "Mã câu hỏi" },
    { value: "usageCount", label: "Số lần sử dụng" },
  ],
  sortOrder: [
    { value: "desc", label: "Giảm dần" },
    { value: "asc", label: "Tăng dần" },
  ],
};

/**
 * Props for QuestionFilterGrid component
 */
interface QuestionFilterGridProps {
  filters: IQuestionFilters;
  onFilterChange: (key: keyof IQuestionFilters, value: unknown) => void;
}

/**
 * Question Filter Grid Component
 * Specialized component cho main filter grid
 */
export function QuestionFilterGrid({
  filters,
  onFilterChange,
}: QuestionFilterGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <Select
          value={filters.status || ""}
          onValueChange={(value) => onFilterChange("status", value as QuestionStatus)}
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
          value={filters.type || ""}
          onValueChange={(value) => onFilterChange("type", value as QuestionType)}
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

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <Label>Độ khó</Label>
        <Select
          value={filters.difficulty || ""}
          onValueChange={(value) => onFilterChange("difficulty", value as QuestionDifficulty)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn độ khó" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.difficulty.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By Filter */}
      <div className="space-y-2">
        <Label>Sắp xếp theo</Label>
        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => onFilterChange("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn cách sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.sortBy.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order Filter */}
      <div className="space-y-2">
        <Label>Thứ tự</Label>
        <Select
          value={filters.sortDir || "desc"}
          onValueChange={(value) => onFilterChange("sortDir", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn thứ tự" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.sortOrder.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
