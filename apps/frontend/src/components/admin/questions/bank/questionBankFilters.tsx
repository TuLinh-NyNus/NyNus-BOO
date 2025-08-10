/**
 * Question Bank Filters Component
 * Bộ lọc cho Question Bank
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Search } from "lucide-react";

// Import types từ lib/types
import { 
  QuestionType, 
  QuestionStatus,
  QuestionDifficulty 
} from "@/lib/types/question";

/**
 * Props for QuestionBankFilters component
 */
interface QuestionBankFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: QuestionType | "";
  onTypeFilterChange: (value: QuestionType | "") => void;
  statusFilter: QuestionStatus | "";
  onStatusFilterChange: (value: QuestionStatus | "") => void;
  difficultyFilter: QuestionDifficulty | "";
  onDifficultyFilterChange: (value: QuestionDifficulty | "") => void;
}

/**
 * Question Bank Filters Component
 * Specialized filters cho Question Bank
 */
export function QuestionBankFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
}: QuestionBankFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Search */}
      <div className="lg:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Type Filter */}
      <Select value={typeFilter} onValueChange={(value) => onTypeFilterChange(value as QuestionType)}>
        <SelectTrigger>
          <SelectValue placeholder="Loại câu hỏi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả loại</SelectItem>
          <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
          <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
          <SelectItem value={QuestionType.SA}>Trả lời ngắn</SelectItem>
          <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
          <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as QuestionStatus)}>
        <SelectTrigger>
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả trạng thái</SelectItem>
          <SelectItem value={QuestionStatus.ACTIVE}>Hoạt động</SelectItem>
          <SelectItem value={QuestionStatus.PENDING}>Chờ duyệt</SelectItem>
          <SelectItem value={QuestionStatus.INACTIVE}>Không hoạt động</SelectItem>
          <SelectItem value={QuestionStatus.ARCHIVED}>Lưu trữ</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty Filter */}
      <Select value={difficultyFilter} onValueChange={(value) => onDifficultyFilterChange(value as QuestionDifficulty)}>
        <SelectTrigger>
          <SelectValue placeholder="Độ khó" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả độ khó</SelectItem>
          <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
          <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
          <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
