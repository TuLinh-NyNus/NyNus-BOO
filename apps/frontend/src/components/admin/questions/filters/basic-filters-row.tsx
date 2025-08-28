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
import { QuestionFilters, QuestionType } from '@/lib/types/question';

/**
 * Basic Filters Row Component
 * Hàng cơ bản với các dropdown filters luôn hiển thị
 * Layout: subcount + 6 QuestionCode fields + question type + toggle button
 */

interface BasicFiltersRowProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  isLoading?: boolean;
}

// Mock data cho dropdowns - sẽ được thay thế bằng API calls
const GRADE_OPTIONS = [
  { value: '0', label: 'Lớp 10' },
  { value: '1', label: 'Lớp 11' },
  { value: '2', label: 'Lớp 12' },
  { value: '3', label: 'Lớp 3' },
  { value: '4', label: 'Lớp 4' },
  { value: '5', label: 'Lớp 5' },
  { value: '6', label: 'Lớp 6' },
  { value: '7', label: 'Lớp 7' },
  { value: '8', label: 'Lớp 8' },
  { value: '9', label: 'Lớp 9' }
];

const SUBJECT_OPTIONS = [
  { value: 'P', label: 'Toán học' },
  { value: 'L', label: 'Vật lý' },
  { value: 'H', label: 'Hóa học' },
  { value: 'T', label: 'Tiếng Anh' },
  { value: 'S', label: 'Sinh học' },
  { value: 'V', label: 'Văn học' }
];

const LEVEL_OPTIONS = [
  { value: 'N', label: 'Nhận biết' },
  { value: 'H', label: 'Thông hiểu' },
  { value: 'V', label: 'Vận dụng' },
  { value: 'C', label: 'Vận dụng cao' },
  { value: 'T', label: 'VIP' },
  { value: 'M', label: 'Note' }
];

const FORMAT_OPTIONS = [
  { value: 'ID5', label: 'ID5 (5 ký tự)' },
  { value: 'ID6', label: 'ID6 (7 ký tự)' }
];

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

        {/* 2. Lớp (Grade) */}
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
              {GRADE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Môn học (Subject) */}
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
              {SUBJECT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Chương (Chapter) */}
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  Chương {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 5. Bài (Lesson) */}
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  Bài {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 6. Mức độ (Level) */}
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
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 7. Dạng (Format) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Dạng</Label>
          <Select
            value={getSingleValue('format')}
            onValueChange={(value) => handleArrayFilterChange('format', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Chọn dạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dạng</SelectItem>
              {FORMAT_OPTIONS.map((option) => (
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
