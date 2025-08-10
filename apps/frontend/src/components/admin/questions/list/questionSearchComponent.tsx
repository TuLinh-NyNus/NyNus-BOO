/**
 * Question Search Component
 * Component tìm kiếm câu hỏi
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Input,
  Button,
  Badge,
} from "@/components/ui";
import { Search, X, Hash } from "lucide-react";

/**
 * Props for QuestionSearchComponent
 */
interface QuestionSearchComponentProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  codePrefix: string;
  onCodePrefixChange: (prefix: string) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

/**
 * Question Search Component
 * Specialized search functionality
 */
export function QuestionSearchComponent({
  keyword,
  onKeywordChange,
  codePrefix,
  onCodePrefixChange,
  onClearAll,
  activeFiltersCount,
}: QuestionSearchComponentProps) {
  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm nội dung câu hỏi..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Code Prefix Search */}
      <div className="relative">
        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã câu hỏi (VD: 2P5)"
          value={codePrefix}
          onChange={(e) => onCodePrefixChange(e.target.value)}
          className="pl-10 font-mono"
        />
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFiltersCount} bộ lọc đang áp dụng
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
          >
            <X className="h-4 w-4 mr-2" />
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
