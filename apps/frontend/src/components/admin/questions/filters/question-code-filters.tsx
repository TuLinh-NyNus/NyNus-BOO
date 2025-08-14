/**
 * Question Code Filters Component
 * Filters cho QuestionCode parameters (Grade, Subject, Chapter, Level, Lesson, Form)
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/form/label";
import { MultiSelect } from "@/components/ui/form/multi-select";
import { Badge } from "@/components/ui/display/badge";

// Import store và utilities
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { getFilterOptions } from "@/lib/utils/question-code";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface QuestionCodeFiltersProps {
  className?: string;
}

// ===== COMPONENT =====

/**
 * Question Code Filters Component
 * Primary filters cho QuestionCode parameters theo database schema
 */
export function QuestionCodeFilters({
  className = ""
}: QuestionCodeFiltersProps) {
  // Store state và actions
  const {
    filters,
    setGradeFilter,
    setSubjectFilter,
    setChapterFilter,
    setLevelFilter,
    setLessonFilter,
    setFormFilter,
    setFormatFilter
  } = useQuestionFiltersStore();

  // Get filter options từ MapCode configuration
  const filterOptions = getFilterOptions();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Grade Filter (Position 1) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Lớp</Label>
          {filters.grade && filters.grade.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.grade.length} lớp
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.grade || []}
          setSelected={setGradeFilter}
          Options={filterOptions.grades}
          placeholder="Chọn lớp..."
          className="w-full"
        />
      </div>

      {/* Subject Filter (Position 2) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Môn học</Label>
          {filters.subject && filters.subject.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.subject.length} môn
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.subject || []}
          setSelected={setSubjectFilter}
          Options={filterOptions.subjects}
          placeholder="Chọn môn học..."
          className="w-full"
        />
      </div>

      {/* Chapter Filter (Position 3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Chương</Label>
          {filters.chapter && filters.chapter.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.chapter.length} chương
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.chapter || []}
          setSelected={setChapterFilter}
          Options={filterOptions.chapters}
          placeholder="Chọn chương..."
          className="w-full"
        />
      </div>

      {/* Level Filter (Position 4) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Mức độ</Label>
          {filters.level && filters.level.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.level.length} mức độ
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.level || []}
          setSelected={setLevelFilter}
          Options={filterOptions.levels}
          placeholder="Chọn mức độ..."
          className="w-full"
        />
      </div>

      {/* Lesson Filter (Position 5) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Bài học</Label>
          {filters.lesson && filters.lesson.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.lesson.length} bài
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.lesson || []}
          setSelected={setLessonFilter}
          Options={filterOptions.lessons}
          placeholder="Chọn bài học..."
          className="w-full"
        />
      </div>

      {/* Form Filter (Position 6 - chỉ ID6) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Dạng bài
            <span className="text-xs text-muted-foreground ml-1">(chỉ ID6)</span>
          </Label>
          {filters.form && filters.form.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.form.length} dạng
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.form || []}
          setSelected={setFormFilter}
          Options={filterOptions.forms}
          placeholder="Chọn dạng bài..."
          className="w-full"
        />
      </div>

      {/* Format Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Định dạng mã</Label>
          {filters.format && filters.format.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.format.length} định dạng
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.format || []}
          setSelected={(values: string[]) => setFormatFilter(values as ('ID5' | 'ID6')[])}
          Options={filterOptions.formats}
          placeholder="Chọn định dạng..."
          className="w-full"
        />
      </div>

      {/* Quick Filter Combinations */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Bộ lọc nhanh</Label>
        <div className="flex flex-wrap gap-2">
          {/* Toán lớp 10 */}
          <button
            onClick={() => {
              setGradeFilter(['0']);
              setSubjectFilter(['P']);
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Toán lớp 10
          </button>
          
          {/* Vật lý lớp 11 */}
          <button
            onClick={() => {
              setGradeFilter(['1']);
              setSubjectFilter(['L']);
            }}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            Vật lý lớp 11
          </button>
          
          {/* Hóa học lớp 12 */}
          <button
            onClick={() => {
              setGradeFilter(['2']);
              setSubjectFilter(['H']);
            }}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            Hóa học lớp 12
          </button>
          
          {/* Câu hỏi vận dụng */}
          <button
            onClick={() => {
              setLevelFilter(['V', 'C']);
            }}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            Vận dụng
          </button>
          
          {/* Chỉ ID6 */}
          <button
            onClick={() => {
              setFormatFilter(['ID6']);
            }}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Chỉ ID6
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionCodeFilters;
