/**
 * Question Search Filters Component
 * Advanced search filters với debounced input
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/form/label";
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  Code,
  Zap
} from "lucide-react";

// Import store
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface QuestionSearchFiltersProps {
  className?: string;
}

// ===== DEBOUNCE HOOK =====

/**
 * Custom hook cho debounced search
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ===== COMPONENT =====

/**
 * Question Search Filters Component
 * Advanced search với multiple search fields và debouncing
 */
export function QuestionSearchFilters({
  className = ""
}: QuestionSearchFiltersProps) {
  // Store state và actions
  const {
    filters,
    setKeywordFilter,
    setSolutionKeywordFilter,
    setLatexKeywordFilter,
    setGlobalSearchFilter
  } = useQuestionFiltersStore();

  // Local state cho search inputs (để handle debouncing)
  const [localKeyword, setLocalKeyword] = useState(filters.keyword || '');
  const [localSolutionKeyword, setLocalSolutionKeyword] = useState(filters.solutionKeyword || '');
  const [localLatexKeyword, setLocalLatexKeyword] = useState(filters.latexKeyword || '');
  const [localGlobalSearch, setLocalGlobalSearch] = useState(filters.globalSearch || '');

  // Debounced values (300ms delay)
  const debouncedKeyword = useDebounce(localKeyword, 300);
  const debouncedSolutionKeyword = useDebounce(localSolutionKeyword, 300);
  const debouncedLatexKeyword = useDebounce(localLatexKeyword, 300);
  const debouncedGlobalSearch = useDebounce(localGlobalSearch, 300);

  // Update store when debounced values change
  useEffect(() => {
    setKeywordFilter(debouncedKeyword);
  }, [debouncedKeyword, setKeywordFilter]);

  useEffect(() => {
    setSolutionKeywordFilter(debouncedSolutionKeyword);
  }, [debouncedSolutionKeyword, setSolutionKeywordFilter]);

  useEffect(() => {
    setLatexKeywordFilter(debouncedLatexKeyword);
  }, [debouncedLatexKeyword, setLatexKeywordFilter]);

  useEffect(() => {
    setGlobalSearchFilter(debouncedGlobalSearch);
  }, [debouncedGlobalSearch, setGlobalSearchFilter]);

  // Sync local state với store state khi filters change externally
  useEffect(() => {
    setLocalKeyword(filters.keyword || '');
    setLocalSolutionKeyword(filters.solutionKeyword || '');
    setLocalLatexKeyword(filters.latexKeyword || '');
    setLocalGlobalSearch(filters.globalSearch || '');
  }, [filters.keyword, filters.solutionKeyword, filters.latexKeyword, filters.globalSearch]);

  /**
   * Clear specific search field
   */
  const clearSearchField = useCallback((field: 'keyword' | 'solutionKeyword' | 'latexKeyword' | 'globalSearch') => {
    switch (field) {
      case 'keyword':
        setLocalKeyword('');
        setKeywordFilter('');
        break;
      case 'solutionKeyword':
        setLocalSolutionKeyword('');
        setSolutionKeywordFilter('');
        break;
      case 'latexKeyword':
        setLocalLatexKeyword('');
        setLatexKeywordFilter('');
        break;
      case 'globalSearch':
        setLocalGlobalSearch('');
        setGlobalSearchFilter('');
        break;
    }
  }, [setKeywordFilter, setSolutionKeywordFilter, setLatexKeywordFilter, setGlobalSearchFilter]);

  /**
   * Clear all search fields
   */
  const clearAllSearches = useCallback(() => {
    setLocalKeyword('');
    setLocalSolutionKeyword('');
    setLocalLatexKeyword('');
    setLocalGlobalSearch('');
    setKeywordFilter('');
    setSolutionKeywordFilter('');
    setLatexKeywordFilter('');
    setGlobalSearchFilter('');
  }, [setKeywordFilter, setSolutionKeywordFilter, setLatexKeywordFilter, setGlobalSearchFilter]);

  /**
   * Get active search count
   */
  const getActiveSearchCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.solutionKeyword) count++;
    if (filters.latexKeyword) count++;
    if (filters.globalSearch) count++;
    return count;
  };

  const activeSearchCount = getActiveSearchCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header với clear all button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium">Tìm kiếm nâng cao</span>
          {activeSearchCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeSearchCount} tìm kiếm
            </Badge>
          )}
        </div>
        {activeSearchCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllSearches}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Global Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <Label className="text-sm font-medium">Tìm kiếm tổng quát</Label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trong tất cả nội dung..."
            value={localGlobalSearch}
            onChange={(e) => setLocalGlobalSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {localGlobalSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSearchField('globalSearch')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Tìm kiếm trong nội dung câu hỏi, lời giải, LaTeX và metadata
        </div>
      </div>

      {/* Content Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-500" />
          <Label className="text-sm font-medium">Tìm trong nội dung câu hỏi</Label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trong nội dung câu hỏi..."
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            className="pl-10 pr-10"
          />
          {localKeyword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSearchField('keyword')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Tìm kiếm trong nội dung đã xử lý của câu hỏi
        </div>
      </div>

      {/* Solution Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-500" />
          <Label className="text-sm font-medium">Tìm trong lời giải</Label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trong lời giải..."
            value={localSolutionKeyword}
            onChange={(e) => setLocalSolutionKeyword(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSolutionKeyword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSearchField('solutionKeyword')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Tìm kiếm trong lời giải chi tiết của câu hỏi
        </div>
      </div>

      {/* LaTeX Search */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-orange-500" />
          <Label className="text-sm font-medium">Tìm trong LaTeX</Label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trong mã LaTeX..."
            value={localLatexKeyword}
            onChange={(e) => setLocalLatexKeyword(e.target.value)}
            className="pl-10 pr-10"
          />
          {localLatexKeyword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSearchField('latexKeyword')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Tìm kiếm trong mã LaTeX gốc của câu hỏi
        </div>
      </div>

      {/* Search Tips */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Mẹo tìm kiếm</Label>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>• Sử dụng dấu ngoặc kép cho cụm từ chính xác: &quot;phương trình bậc hai&quot;</div>
          <div>• Tìm kiếm không phân biệt hoa thường</div>
          <div>• Kết quả được cập nhật tự động sau 300ms</div>
          <div>• Tìm kiếm tổng quát sẽ tìm trong tất cả các trường</div>
        </div>
      </div>

      {/* Quick Search Examples */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Ví dụ tìm kiếm</Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLocalGlobalSearch('phương trình')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            &quot;phương trình&quot;
          </button>

          <button
            onClick={() => setLocalKeyword('tích phân')}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            &quot;tích phân&quot;
          </button>

          <button
            onClick={() => setLocalLatexKeyword('\\frac')}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            &quot;\\frac&quot;
          </button>

          <button
            onClick={() => setLocalSolutionKeyword('áp dụng công thức')}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            &quot;áp dụng công thức&quot;
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionSearchFilters;
