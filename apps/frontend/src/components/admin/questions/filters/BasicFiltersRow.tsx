/**
 * Basic Filters Row Component
 * Hàng cơ bản chứa các dropdown filters chính
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

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
  Button
} from '@/components/ui';
import { QuestionFilters, QuestionType } from '@/lib/types/question';
import { questionTypeAdapters } from '@/lib/utils/filter-type-adapters';

// ===== CONSTANTS =====

const GRADE_OPTIONS = [
  { value: '', label: 'Tất cả lớp' },
  { value: '1', label: 'Lớp 1' },
  { value: '2', label: 'Lớp 2' },
  { value: '3', label: 'Lớp 3' },
  { value: '4', label: 'Lớp 4' },
  { value: '5', label: 'Lớp 5' },
  { value: '6', label: 'Lớp 6' },
  { value: '7', label: 'Lớp 7' },
  { value: '8', label: 'Lớp 8' },
  { value: '9', label: 'Lớp 9' },
  { value: '10', label: 'Lớp 10' },
  { value: '11', label: 'Lớp 11' },
  { value: '12', label: 'Lớp 12' }
];

const SUBJECT_OPTIONS = [
  { value: '', label: 'Tất cả môn' },
  { value: 'toan', label: 'Toán' },
  { value: 'ly', label: 'Vật lý' },
  { value: 'hoa', label: 'Hóa học' },
  { value: 'sinh', label: 'Sinh học' },
  { value: 'van', label: 'Ngữ văn' },
  { value: 'su', label: 'Lịch sử' },
  { value: 'dia', label: 'Địa lý' },
  { value: 'anh', label: 'Tiếng Anh' }
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả mức độ' },
  { value: '1', label: 'Mức độ 1' },
  { value: '2', label: 'Mức độ 2' },
  { value: '3', label: 'Mức độ 3' },
  { value: '4', label: 'Mức độ 4' },
  { value: '5', label: 'Mức độ 5' }
];

const FORMAT_OPTIONS = [
  { value: '', label: 'Tất cả định dạng' },
  { value: 'ID5', label: 'ID5' },
  { value: 'ID6', label: 'ID6' }
];

// ===== INTERFACES =====

interface BasicFiltersRowProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
}

// ===== MAIN COMPONENT =====

/**
 * Basic Filters Row Component
 * Hiển thị hàng cơ bản với 9 elements theo specifications
 */
export function BasicFiltersRow({
  filters,
  onFiltersChange,
  isAdvancedOpen,
  onToggleAdvanced
}: BasicFiltersRowProps) {
  /**
   * Get chapter options based on selected subject
   */
  const getChapterOptions = (subject?: string) => {
    if (!subject) return [{ value: '', label: 'Chọn môn trước' }];
    
    // Mock chapter data - trong thực tế sẽ fetch từ API
    const chaptersBySubject: Record<string, Array<{ value: string; label: string }>> = {
      toan: [
        { value: '', label: 'Tất cả chương' },
        { value: '1', label: 'Chương 1: Số học' },
        { value: '2', label: 'Chương 2: Hình học' },
        { value: '3', label: 'Chương 3: Đại số' }
      ],
      ly: [
        { value: '', label: 'Tất cả chương' },
        { value: '1', label: 'Chương 1: Cơ học' },
        { value: '2', label: 'Chương 2: Nhiệt học' },
        { value: '3', label: 'Chương 3: Điện học' }
      ],
      // Add more subjects...
    };

    return chaptersBySubject[subject] || [{ value: '', label: 'Tất cả chương' }];
  };

  /**
   * Get lesson options based on selected chapter
   */
  const getLessonOptions = (subject?: string, chapter?: string) => {
    if (!subject || !chapter) return [{ value: '', label: 'Chọn chương trước' }];
    
    // Mock lesson data
    return [
      { value: '', label: 'Tất cả bài' },
      { value: '1', label: 'Bài 1' },
      { value: '2', label: 'Bài 2' },
      { value: '3', label: 'Bài 3' }
    ];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Basic Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-3">
        {/* 1. Subcount Search */}
        <div className="xl:col-span-1">
          <Input
            placeholder="Subcount..."
            value={filters.subcount || ''}
            onChange={(e) => onFiltersChange({ subcount: e.target.value })}
            className="h-9"
          />
        </div>

        {/* 2. Grade (Lớp) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.grade?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ 
              grade: value ? [value] : undefined,
              // Reset dependent fields
              subject: undefined,
              chapter: undefined,
              lesson: undefined
            })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Lớp" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Subject (Môn học) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.subject?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ 
              subject: value ? [value] : undefined,
              // Reset dependent fields
              chapter: undefined,
              lesson: undefined
            })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Môn học" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Chapter (Chương) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.chapter?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ 
              chapter: value ? [value] : undefined,
              // Reset dependent fields
              lesson: undefined
            })}
            disabled={!filters.subject?.[0]}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chương" />
            </SelectTrigger>
            <SelectContent>
              {getChapterOptions(filters.subject?.[0]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 5. Lesson (Bài) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.lesson?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ lesson: value ? [value] : undefined })}
            disabled={!filters.chapter?.[0]}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Bài" />
            </SelectTrigger>
            <SelectContent>
              {getLessonOptions(filters.subject?.[0], filters.chapter?.[0]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 6. Level (Mức độ) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.level?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ level: value ? [value] : undefined })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 7. Format (Dạng) */}
        <div className="xl:col-span-1">
          <Select
            value={filters.format?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ format: value ? [value as 'ID5' | 'ID6'] : undefined })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Dạng" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 8. Question Type */}
        <div className="xl:col-span-1">
          <Select
            value={questionTypeAdapters.toString(filters.type)}
            onValueChange={(value) => onFiltersChange({ type: questionTypeAdapters.fromString(value) })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
              <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
              <SelectItem value={QuestionType.SA}>Tự luận ngắn</SelectItem>
              <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
              <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 9. Advanced Toggle Button */}
        <div className="xl:col-span-1">
          <Button
            variant="outline"
            onClick={onToggleAdvanced}
            className="h-9 w-full"
          >
            Nâng cao
            {isAdvancedOpen ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
