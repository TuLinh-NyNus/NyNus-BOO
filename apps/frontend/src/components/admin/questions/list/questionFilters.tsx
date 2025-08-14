/**
 * Question Filters Component
 * Bộ lọc câu hỏi theo type, status, difficulty, code prefix, keyword
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
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
import { Search, Filter, X, RotateCcw, Hash } from "lucide-react";

// Import types từ lib/types
import {
  QuestionFilters as IQuestionFilters,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty
} from "@/lib/types/question";
import { questionTypeAdapters, questionStatusAdapters, questionDifficultyAdapters } from "@/lib/utils/filter-type-adapters";

/**
 * Filter options configuration - cấu hình các tùy chọn bộ lọc
 */
const FILTER_OPTIONS = {
  status: [
    { value: "", label: "Tất cả trạng thái" },
    { value: QuestionStatus.ACTIVE, label: "Hoạt động" },
    { value: QuestionStatus.PENDING, label: "Chờ duyệt" },
    { value: QuestionStatus.INACTIVE, label: "Tạm ngưng" },
    { value: QuestionStatus.ARCHIVED, label: "Lưu trữ" },
  ],
  type: [
    { value: "", label: "Tất cả loại" },
    { value: QuestionType.MC, label: "Trắc nghiệm" },
    { value: QuestionType.TF, label: "Đúng/Sai" },
    { value: QuestionType.SA, label: "Trả lời ngắn" },
    { value: QuestionType.ES, label: "Tự luận" },
    { value: QuestionType.MA, label: "Ghép đôi" },
  ],
  difficulty: [
    { value: "", label: "Tất cả độ khó" },
    { value: QuestionDifficulty.EASY, label: "Dễ" },
    { value: QuestionDifficulty.MEDIUM, label: "Trung bình" },
    { value: QuestionDifficulty.HARD, label: "Khó" },
  ],
  grade: [
    { value: "", label: "Tất cả lớp" },
    { value: "0", label: "Lớp 10" },
    { value: "1", label: "Lớp 11" },
    { value: "2", label: "Lớp 12" },
  ],
  subject: [
    { value: "", label: "Tất cả môn" },
    { value: "P", label: "Toán" },
    { value: "L", label: "Vật lý" },
    { value: "H", label: "Hóa học" },
    { value: "S", label: "Sinh học" },
    { value: "V", label: "Văn" },
    { value: "A", label: "Anh" },
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
 * Props for QuestionFilters component
 */
interface QuestionFiltersProps {
  onFilterChange: (filters: IQuestionFilters) => void;
  initialFilters?: IQuestionFilters;
}

/**
 * Question Filters Component
 * Comprehensive filtering interface với real-time updates
 */
export function QuestionFilters({
  onFilterChange,
  initialFilters = {},
}: QuestionFiltersProps) {
  // Filter state - trạng thái bộ lọc
  const [filters, setFilters] = useState<IQuestionFilters>({
    keyword: initialFilters.keyword || "",
    status: initialFilters.status || undefined,
    type: initialFilters.type || undefined,
    difficulty: initialFilters.difficulty || undefined,
    codePrefix: initialFilters.codePrefix || "",
    sortBy: initialFilters.sortBy || "createdAt",
    sortDir: initialFilters.sortDir || "desc",
  });

  // Internal state cho các filter mở rộng
  const [extendedFilters, setExtendedFilters] = useState({
    grade: "",
    subject: "",
    level: "",
    creator: "",
    dateFrom: "",
    dateTo: "",
  });

  /**
   * Handle filter change - xử lý thay đổi bộ lọc
   */
  const handleFilterChange = (key: keyof IQuestionFilters, value: string | QuestionType | QuestionStatus | QuestionDifficulty | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    
    // Remove undefined values trước khi gửi
    const cleanFilters = Object.entries(newFilters).reduce(
      (acc, [k, v]) => {
        if (v !== undefined && v !== "") {
          (acc as Record<string, unknown>)[k] = v;
        }
        return acc;
      },
      {} as IQuestionFilters
    );
    
    onFilterChange(cleanFilters);
  };



  /**
   * Reset all filters - đặt lại tất cả bộ lọc
   */
  const resetFilters = () => {
    const emptyFilters: IQuestionFilters = {
      sortBy: "createdAt",
      sortDir: "desc",
    };
    
    setFilters(emptyFilters);
    setExtendedFilters({
      grade: "",
      subject: "",
      level: "",
      creator: "",
      dateFrom: "",
      dateTo: "",
    });
    
    onFilterChange(emptyFilters);
  };

  /**
   * Get active filter count - đếm số bộ lọc đang hoạt động
   */
  const getActiveFilterCount = () => {
    const mainFilters = Object.values(filters).filter(value => 
      value !== undefined && value !== "" && value !== "createdAt" && value !== "desc"
    ).length;
    
    const extendedFiltersCount = Object.values(extendedFilters).filter(value => 
      value && value.trim()
    ).length;
    
    return mainFilters + extendedFiltersCount;
  };

  /**
   * Remove specific filter - xóa bộ lọc cụ thể
   */
  const removeFilter = (key: keyof IQuestionFilters) => {
    handleFilterChange(key, undefined);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="question-filters">
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
        {/* Search Input - ô tìm kiếm */}
        <div className="space-y-2">
          <Label htmlFor="search">Tìm kiếm nội dung</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm kiếm trong nội dung câu hỏi..."
              value={filters.keyword || ""}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="pl-10"
            />
            {filters.keyword && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => removeFilter("keyword")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Filter Grid - lưới bộ lọc chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={questionStatusAdapters.toString(filters.status)}
              onValueChange={(value) => handleFilterChange("status", questionStatusAdapters.fromString(value))}
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
              value={questionTypeAdapters.toString(filters.type)}
              onValueChange={(value) => handleFilterChange("type", questionTypeAdapters.fromString(value))}
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
              value={questionDifficultyAdapters.toString(filters.difficulty)}
              onValueChange={(value) => handleFilterChange("difficulty", questionDifficultyAdapters.fromString(value))}
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

          {/* Code Prefix Filter */}
          <div className="space-y-2">
            <Label htmlFor="codePrefix">Mã câu hỏi</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="codePrefix"
                placeholder="VD: 2P5VN"
                value={filters.codePrefix || ""}
                onChange={(e) => handleFilterChange("codePrefix", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
