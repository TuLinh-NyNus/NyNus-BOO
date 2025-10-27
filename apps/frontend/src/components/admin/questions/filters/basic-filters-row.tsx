'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Label
} from '@/components/ui';
import { QuestionFilters, QuestionType } from '@/types/question';
import { getFilterOptions } from '@/lib/utils/question-code';

/**
 * Basic Filters Row Component
 * Hàng cơ bản với các dropdown filters luôn hiển thị
 * Layout: subcount + grade + subject + chapter + lesson + level + form + question type + toggle (9 columns)
 * 
 * QuestionCode structure (6 positions):
 * Position 1: Grade (Lớp) | Position 2: Subject (Môn) | Position 3: Chapter (Chương)
 * Position 4: Level (Mức độ) | Position 5: Lesson (Bài) | Position 6: Form (Dạng - chỉ ID6)
 * 
 * Updated: Sử dụng MapCode configuration từ getFilterOptions()
 */

interface BasicFiltersRowProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  isLoading?: boolean;
}

// Get MapCode configuration - Dynamic based on imported MapCode.md
const MAPCODE_OPTIONS = getFilterOptions();

const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.MC, label: 'Trắc nghiệm' },
  { value: QuestionType.TF, label: 'Đúng/Sai' },
  { value: QuestionType.SA, label: 'Tự luận ngắn' },
  { value: QuestionType.ES, label: 'Tự luận' },
  { value: QuestionType.MA, label: 'Ghép đôi' }
];

export function BasicFiltersRow({
  filters,
  onFiltersChange,
  isAdvancedOpen,
  onToggleAdvanced,
  isLoading = false
}: BasicFiltersRowProps) {
  // DEBUG: Log trong useEffect để tránh hydration mismatch
  React.useEffect(() => {
    console.log('=== MAPCODE_OPTIONS LOADED ===');
    console.log('Chapters:', MAPCODE_OPTIONS.chapters.slice(0, 3).map(c => c.label));
    console.log('Lessons:', MAPCODE_OPTIONS.lessons.slice(0, 3).map(l => l.label));
  }, []);

  /**
   * Handle single filter change
   */
  const handleFilterChange = React.useCallback((key: keyof QuestionFilters, value: unknown) => {
    onFiltersChange({ [key]: value });
  }, [onFiltersChange]);

  /**
   * Handle array filter change (for multi-select)
   */
  const handleArrayFilterChange = React.useCallback((key: keyof QuestionFilters, value: string) => {
    const newValues = value === 'all' ? [] : [value];
    onFiltersChange({ [key]: newValues });
  }, [onFiltersChange]);

  /**
   * Get current value for single select
   */
  const getSingleValue = React.useCallback((key: keyof QuestionFilters): string => {
    const value = filters[key];
    if (Array.isArray(value)) {
      return value.length === 0 ? 'all' : String(value[0]);
    }
    return String(value || 'all');
  }, [filters]);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-lg p-4 shadow-sm admin-card">
      {/* Grid with 9 columns: Subcount + Grade + Subject + Chapter + Lesson + Level + Form + Type + Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-4 items-end">
        {/* 1. Subcount Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Subcount</Label>
          <Input
            placeholder="VD: TL.100022"
            value={filters.subcount || ''}
            onChange={(e) => handleFilterChange('subcount', e.target.value)}
            disabled={isLoading}
            className="h-10"
          />
        </div>

        {/* 2. Lớp (Grade) - From MapCode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Lớp</Label>
          <Select
            value={getSingleValue('grade')}
            onValueChange={(value) => handleArrayFilterChange('grade', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {MAPCODE_OPTIONS.grades.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Môn học (Subject) - From MapCode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Môn học</Label>
          <Select
            value={getSingleValue('subject')}
            onValueChange={(value) => handleArrayFilterChange('subject', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn</SelectItem>
              {MAPCODE_OPTIONS.subjects.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Chương (Chapter) - From MapCode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Chương</Label>
          <Select
            value={getSingleValue('chapter')}
            onValueChange={(value) => handleArrayFilterChange('chapter', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn chương" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chương</SelectItem>
              {MAPCODE_OPTIONS.chapters.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 5. Bài (Lesson) - From MapCode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Bài</Label>
          <Select
            value={getSingleValue('lesson')}
            onValueChange={(value) => handleArrayFilterChange('lesson', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn bài" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bài</SelectItem>
              {MAPCODE_OPTIONS.lessons.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 6. Mức độ (Level) - From MapCode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Mức độ</Label>
          <Select
            value={getSingleValue('level')}
            onValueChange={(value) => handleArrayFilterChange('level', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              {MAPCODE_OPTIONS.levels.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 7. Dạng (Form - Position 6, chỉ ID6) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Dạng</Label>
          <Select
            value={getSingleValue('form')}
            onValueChange={(value) => handleArrayFilterChange('form', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn dạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dạng</SelectItem>
              {MAPCODE_OPTIONS.forms.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 8. Question Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Loại câu hỏi</Label>
          <Select
            value={getSingleValue('type')}
            onValueChange={(value) => handleArrayFilterChange('type', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 9. Toggle Advanced Button */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground invisible">Toggle</Label>
          <Button
            variant="outline"
            onClick={onToggleAdvanced}
            className="h-10 w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <span className="text-sm">Nâng cao</span>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
