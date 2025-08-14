/**
 * Question Content Filters Component
 * Filters cho question content (Source, Tags, Subcount, Has Solution/Answers/Images)
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/form/label";
import { Input } from "@/components/ui/form/input";
import { MultiSelect } from "@/components/ui/form/multi-select";
import { Switch } from "@/components/ui/form/switch";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import { Search, X } from "lucide-react";

// Import store
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface QuestionContentFiltersProps {
  className?: string;
}

// ===== MOCK DATA =====

// Mock available sources (trong thực tế sẽ fetch từ API)
const AVAILABLE_SOURCES = [
  { value: 'sach-giao-khoa', label: 'Sách giáo khoa' },
  { value: 'sach-bai-tap', label: 'Sách bài tập' },
  { value: 'de-thi-dai-hoc', label: 'Đề thi đại học' },
  { value: 'de-thi-thpt', label: 'Đề thi THPT' },
  { value: 'olympic', label: 'Olympic' },
  { value: 'hsg', label: 'Học sinh giỏi' },
  { value: 'tu-soan', label: 'Tự soạn' },
  { value: 'internet', label: 'Internet' }
];

// Mock available tags (trong thực tế sẽ fetch từ API)
const AVAILABLE_TAGS = [
  { value: 'co-ban', label: 'Cơ bản' },
  { value: 'nang-cao', label: 'Nâng cao' },
  { value: 'on-thi', label: 'Ôn thi' },
  { value: 'thuc-hanh', label: 'Thực hành' },
  { value: 'ly-thuyet', label: 'Lý thuyết' },
  { value: 'bai-tap', label: 'Bài tập' },
  { value: 'kiem-tra', label: 'Kiểm tra' },
  { value: 'thi-thu', label: 'Thi thử' },
  { value: 'quan-trong', label: 'Quan trọng' },
  { value: 'hay-sai', label: 'Hay sai' }
];

// ===== COMPONENT =====

/**
 * Question Content Filters Component
 * Advanced filters cho question content
 */
export function QuestionContentFilters({
  className = ""
}: QuestionContentFiltersProps) {
  // Store state và actions
  const {
    filters,
    setSourceFilter,
    setTagsFilter,
    setSubcountFilter,
    setHasAnswersFilter,
    setHasSolutionFilter,
    setHasImagesFilter
  } = useQuestionFiltersStore();

  // Local state cho source search
  const [sourceSearch, setSourceSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Filter sources based on search
  const filteredSources = AVAILABLE_SOURCES.filter(source =>
    source.label.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  // Filter tags based on search
  const filteredTags = AVAILABLE_TAGS.filter(tag =>
    tag.label.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Source Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Nguồn câu hỏi</Label>
          {filters.source && filters.source.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.source.length} nguồn
            </Badge>
          )}
        </div>
        
        {/* Source search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm nguồn..."
            value={sourceSearch}
            onChange={(e) => setSourceSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <MultiSelect
          selected={filters.source || []}
          setSelected={setSourceFilter}
          Options={filteredSources}
          placeholder="Chọn nguồn câu hỏi..."
          className="w-full"
        />
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Tags</Label>
          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.tags.length} tags
            </Badge>
          )}
        </div>
        
        {/* Tag search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm tag..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <MultiSelect
          selected={filters.tags || []}
          setSelected={setTagsFilter}
          Options={filteredTags}
          placeholder="Chọn tags..."
          className="w-full"
        />
        
        {/* Selected tags display */}
        {filters.tags && filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.tags.map(tag => {
              const tagOption = AVAILABLE_TAGS.find(t => t.value === tag);
              return tagOption ? (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {tagOption.label}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Subcount Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Subcount
          <span className="text-xs text-muted-foreground ml-1">(định dạng [XX.N])</span>
        </Label>
        <div className="relative">
          <Input
            placeholder="Ví dụ: [01.1], [02.A]..."
            value={filters.subcount || ''}
            onChange={(e) => setSubcountFilter(e.target.value)}
            className="w-full"
          />
          {filters.subcount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubcountFilter('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {filters.subcount && (
          <div className="text-xs text-muted-foreground">
            Tìm kiếm: &quot;{filters.subcount}&quot;
          </div>
        )}
      </div>

      {/* Boolean Filters */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-sm font-medium">Nội dung có sẵn</Label>
        
        {/* Has Answers */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Có đáp án</Label>
            <div className="text-xs text-muted-foreground">
              Câu hỏi có đáp án được định nghĩa
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.hasAnswers === true}
              onCheckedChange={(checked) => 
                setHasAnswersFilter(checked ? true : undefined)
              }
            />
            {filters.hasAnswers !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasAnswersFilter(undefined)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Has Solution */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Có lời giải</Label>
            <div className="text-xs text-muted-foreground">
              Câu hỏi có lời giải chi tiết
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.hasSolution === true}
              onCheckedChange={(checked) => 
                setHasSolutionFilter(checked ? true : undefined)
              }
            />
            {filters.hasSolution !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasSolutionFilter(undefined)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Has Images */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Có hình ảnh</Label>
            <div className="text-xs text-muted-foreground">
              Câu hỏi có hình ảnh đính kèm
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.hasImages === true}
              onCheckedChange={(checked) => 
                setHasImagesFilter(checked ? true : undefined)
              }
            />
            {filters.hasImages !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasImagesFilter(undefined)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filter Combinations */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Bộ lọc nhanh</Label>
        <div className="flex flex-wrap gap-2">
          {/* Complete Questions */}
          <button
            onClick={() => {
              setHasAnswersFilter(true);
              setHasSolutionFilter(true);
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            Câu hỏi hoàn chỉnh
          </button>
          
          {/* Textbook Questions */}
          <button
            onClick={() => {
              setSourceFilter(['sach-giao-khoa']);
              setTagsFilter(['co-ban']);
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Sách giáo khoa
          </button>
          
          {/* Exam Questions */}
          <button
            onClick={() => {
              setSourceFilter(['de-thi-dai-hoc', 'de-thi-thpt']);
              setTagsFilter(['on-thi']);
            }}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            Đề thi
          </button>
          
          {/* Questions with Images */}
          <button
            onClick={() => {
              setHasImagesFilter(true);
            }}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            Có hình ảnh
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionContentFilters;
