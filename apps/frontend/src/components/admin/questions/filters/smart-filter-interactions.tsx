/**
 * Smart Filter Interactions Component
 * Provides auto-suggest, dependent filters, và conflict prevention
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui';
// Note: Command and Popover components will be implemented later
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import store và types
import { useQuestionFiltersStore } from '@/lib/stores/question-filters';
import { QuestionFilters } from '@/types/question';

// ===== INTERFACES =====

interface SmartFilterInteractionsProps {
  className?: string;
}

interface AutoSuggestOption {
  value: string;
  label: string;
  count?: number;
  category?: string;
}

// TODO: FilterDependency sẽ được implement trong tương lai
// interface FilterDependency {
//   field: keyof QuestionFilters;
//   dependsOn: keyof QuestionFilters;
//   getOptions: (parentValue: string[]) => AutoSuggestOption[];
// }

interface FilterConflict {
  fields: (keyof QuestionFilters)[];
  message: string;
  severity: 'warning' | 'error';
}

// ===== MOCK DATA =====

/**
 * Mock data cho auto-suggest options
 */
const MOCK_SUGGESTIONS = {
  tags: [
    { value: 'algebra', label: 'Đại số', count: 245 },
    { value: 'geometry', label: 'Hình học', count: 189 },
    { value: 'calculus', label: 'Giải tích', count: 156 },
    { value: 'trigonometry', label: 'Lượng giác', count: 134 },
    { value: 'statistics', label: 'Thống kê', count: 98 },
    { value: 'probability', label: 'Xác suất', count: 87 },
    { value: 'physics', label: 'Vật lý', count: 234 },
    { value: 'chemistry', label: 'Hóa học', count: 198 },
    { value: 'biology', label: 'Sinh học', count: 167 }
  ],
  source: [
    { value: 'textbook-grade-10', label: 'SGK Lớp 10', count: 456 },
    { value: 'textbook-grade-11', label: 'SGK Lớp 11', count: 389 },
    { value: 'textbook-grade-12', label: 'SGK Lớp 12', count: 345 },
    { value: 'exam-university', label: 'Đề thi Đại học', count: 234 },
    { value: 'exam-high-school', label: 'Đề thi THPT', count: 567 },
    { value: 'workbook', label: 'Sách bài tập', count: 123 },
    { value: 'reference-book', label: 'Sách tham khảo', count: 89 }
  ]
};

/**
 * Subject dependencies based on grade
 */
const GRADE_SUBJECT_DEPENDENCIES: Record<string, string[]> = {
  '0': ['P', 'L', 'H', 'S', 'V', 'A'], // Mầm non
  '1': ['P', 'L', 'H', 'S', 'V', 'A'], // Lớp 1
  '2': ['P', 'L', 'H', 'S', 'V', 'A'], // Lớp 2
  '3': ['P', 'L', 'H', 'S', 'V', 'A'], // Lớp 3
  '4': ['P', 'L', 'H', 'S', 'V', 'A'], // Lớp 4
  '5': ['P', 'L', 'H', 'S', 'V', 'A'], // Lớp 5
  '6': ['P', 'L', 'H', 'S', 'V', 'A', 'E'], // Lớp 6
  '7': ['P', 'L', 'H', 'S', 'V', 'A', 'E'], // Lớp 7
  '8': ['P', 'L', 'H', 'S', 'V', 'A', 'E'], // Lớp 8
  '9': ['P', 'L', 'H', 'S', 'V', 'A', 'E'], // Lớp 9
  '10': ['P', 'L', 'H', 'S', 'V', 'A', 'E', 'T', 'D', 'G'], // Lớp 10
  '11': ['P', 'L', 'H', 'S', 'V', 'A', 'E', 'T', 'D', 'G'], // Lớp 11
  '12': ['P', 'L', 'H', 'S', 'V', 'A', 'E', 'T', 'D', 'G']  // Lớp 12
};

/**
 * Subject labels
 */
const SUBJECT_LABELS: Record<string, string> = {
  'P': 'Toán',
  'L': 'Ngữ văn',
  'H': 'Hóa học',
  'S': 'Sinh học',
  'V': 'Vật lý',
  'A': 'Tiếng Anh',
  'E': 'GDCD',
  'T': 'Lịch sử',
  'D': 'Địa lý',
  'G': 'Tin học'
};

// ===== COMPONENT =====

/**
 * Smart Filter Interactions Component
 */
export function SmartFilterInteractions({ className }: SmartFilterInteractionsProps) {
  const { filters, setSubjectFilter, setTagsFilter } = useQuestionFiltersStore();
  
  // Local state
  const [conflicts, setConflicts] = useState<FilterConflict[]>([]);
  const [suggestions, setSuggestions] = useState<{
    tags: AutoSuggestOption[];
    source: AutoSuggestOption[];
  }>({
    tags: MOCK_SUGGESTIONS.tags,
    source: MOCK_SUGGESTIONS.source
  });

  /**
   * Get available subjects based on selected grades
   */
  const availableSubjects = useMemo(() => {
    if (!filters.grade?.length) {
      return Object.entries(SUBJECT_LABELS).map(([value, label]) => ({
        value,
        label,
        disabled: false
      }));
    }

    // Get intersection of subjects available for all selected grades
    const subjectSets = filters.grade.map(grade => GRADE_SUBJECT_DEPENDENCIES[grade] || []);
    const commonSubjects = subjectSets.reduce((acc, subjects) => 
      acc.filter(subject => subjects.includes(subject))
    );

    return Object.entries(SUBJECT_LABELS).map(([value, label]) => ({
      value,
      label,
      disabled: !commonSubjects.includes(value)
    }));
  }, [filters.grade]);

  /**
   * Detect filter conflicts
   */
  useEffect(() => {
    const newConflicts: FilterConflict[] = [];

    // Conflict: Form filter without ID6 format
    if (filters.form?.length && (!filters.format?.length || !filters.format.includes('ID6'))) {
      newConflicts.push({
        fields: ['form', 'format'],
        message: 'Trường "Dạng" yêu cầu format ID6',
        severity: 'warning'
      });
    }

    // Conflict: Subject not available for selected grades
    if (filters.grade?.length && filters.subject?.length) {
      const invalidSubjects = filters.subject.filter(subject => 
        !availableSubjects.find(s => s.value === subject && !s.disabled)
      );
      
      if (invalidSubjects.length > 0) {
        newConflicts.push({
          fields: ['grade', 'subject'],
          message: `Môn học ${invalidSubjects.map(s => SUBJECT_LABELS[s] || s).join(', ')} không có cho lớp đã chọn`,
          severity: 'error'
        });
      }
    }

    // Conflict: Too many exclusion filters
    const exclusionCount = [
      filters.hasAnswers === false,
      filters.hasSolution === false,
      filters.hasImages === false
    ].filter(Boolean).length;

    if (exclusionCount >= 2) {
      newConflicts.push({
        fields: ['hasAnswers', 'hasSolution', 'hasImages'],
        message: 'Quá nhiều điều kiện loại trừ có thể không trả về kết quả',
        severity: 'warning'
      });
    }

    setConflicts(newConflicts);
  }, [filters, availableSubjects]);

  /**
   * Auto-fix subject selection when grade changes
   */
  useEffect(() => {
    if (filters.grade?.length && filters.subject?.length) {
      const validSubjects = filters.subject.filter(subject =>
        availableSubjects.find(s => s.value === subject && !s.disabled)
      );

      if (validSubjects.length !== filters.subject.length) {
        setSubjectFilter(validSubjects);
      }
    }
  }, [filters.grade, filters.subject, availableSubjects, setSubjectFilter]);

  /**
   * Update suggestions based on current filters
   */
  useEffect(() => {
    // Update suggestions based on selected filters
    const updatedSuggestions = {
      tags: MOCK_SUGGESTIONS.tags.map(tag => ({
        ...tag,
        // Boost count for tags related to selected subjects
        count: filters.subject?.some(subject =>
          tag.value.includes(subject) || tag.label.includes(subject)
        ) ? tag.count! + 50 : tag.count
      })),
      source: MOCK_SUGGESTIONS.source.filter(source => {
        // Filter sources based on selected grade
        if (!filters.grade?.length) return true;
        return filters.grade.some(grade =>
          source.value.includes(grade) || source.label.includes(grade)
        );
      })
    };

    setSuggestions(updatedSuggestions);
  }, [filters.grade, filters.subject]);

  /**
   * Filter suggestions based on search
   */
  const filterSuggestions = (options: AutoSuggestOption[], search: string) => {
    if (!search) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Conflicts Display */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 p-3 rounded-lg border",
                conflict.severity === 'error' 
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              )}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {conflict.severity === 'error' ? 'Lỗi' : 'Cảnh báo'} Filter
                </div>
                <div className="text-xs mt-1">{conflict.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  Ảnh hưởng: {conflict.fields.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject Dependencies Info */}
      {filters.grade?.length && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800">
                Môn học khả dụng
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Dựa trên lớp đã chọn: {filters.grade.join(', ')}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {availableSubjects.map(subject => (
                  <Badge
                    key={subject.value}
                    variant={subject.disabled ? "outline" : "secondary"}
                    className={cn(
                      "text-xs",
                      subject.disabled && "opacity-50"
                    )}
                  >
                    {subject.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-suggest Help */}
      <div className="text-xs text-muted-foreground">
        💡 <strong>Gợi ý:</strong> Chọn lớp trước để xem môn học khả dụng.
        Sử dụng tìm kiếm trong Tags và Source để tìm nhanh.
      </div>

      {/* Popular Tags Suggestions */}
      {suggestions.tags.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Tags phổ biến:</h4>
          <div className="flex flex-wrap gap-1">
            {filterSuggestions(suggestions.tags, '').slice(0, 6).map((tag) => (
              <Badge
                key={tag.value}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  // Add tag to filter using store
                  const currentTags = filters.tags || [];
                  if (!currentTags.includes(tag.value)) {
                    setTagsFilter([...currentTags, tag.value]);
                  }
                }}
              >
                {tag.label} ({tag.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartFilterInteractions;
