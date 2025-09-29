/**
 * Filter Chips Component
 * Hiển thị active filters dưới dạng chips có thể remove với category grouping
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import { X } from "lucide-react";
import { cn } from '@/lib/utils';

// Import hooks và utilities
import { MAPCODE_CONFIG } from "@/lib/utils/question-code";
import { QuestionType, QuestionStatus, QuestionDifficulty, QuestionFilters } from "@/types/question";
import { ensureArray } from '@/lib/utils/filter-type-adapters';


// ===== INTERFACES =====

interface FilterChipsProps {
  className?: string;
  filters: QuestionFilters;
  updateFilters: (newFilters: Partial<QuestionFilters>) => void;
  resetFilters: () => void;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get label cho filter value
 */
function getFilterLabel(type: string, value: string): string {
  switch (type) {
    case 'grade':
      return MAPCODE_CONFIG.grades[value as keyof typeof MAPCODE_CONFIG.grades] || value;
    case 'subject':
      return MAPCODE_CONFIG.subjects[value as keyof typeof MAPCODE_CONFIG.subjects] || value;
    case 'chapter':
      return MAPCODE_CONFIG.chapters[value as keyof typeof MAPCODE_CONFIG.chapters] || value;
    case 'level':
      return MAPCODE_CONFIG.levels[value as keyof typeof MAPCODE_CONFIG.levels] || value;
    case 'lesson':
      return MAPCODE_CONFIG.lessons[value as keyof typeof MAPCODE_CONFIG.lessons] || value;
    case 'form':
      return MAPCODE_CONFIG.forms[value as keyof typeof MAPCODE_CONFIG.forms] || value;
    case 'type':
      switch (value) {
        case QuestionType.MC: return 'Trắc nghiệm';
        case QuestionType.TF: return 'Đúng/Sai';
        case QuestionType.SA: return 'Trả lời ngắn';
        case QuestionType.ES: return 'Tự luận';
        case QuestionType.MA: return 'Ghép cặp';
        default: return value;
      }
    case 'status':
      switch (value) {
        case QuestionStatus.ACTIVE: return 'Hoạt động';
        case QuestionStatus.PENDING: return 'Chờ duyệt';
        case QuestionStatus.INACTIVE: return 'Không hoạt động';
        case QuestionStatus.ARCHIVED: return 'Đã lưu trữ';
        default: return value;
      }
    case 'difficulty':
      switch (value) {
        case QuestionDifficulty.EASY: return 'Dễ';
        case QuestionDifficulty.MEDIUM: return 'Trung bình';
        case QuestionDifficulty.HARD: return 'Khó';
        default: return value;
      }
    case 'keyword':
      return value; // Return keyword as-is
    case 'hasAnswers':
      return value === 'true' ? 'Có' : 'Không';
    case 'hasSolution':
      return value === 'true' ? 'Có' : 'Không';
    case 'hasImages':
      return value === 'true' ? 'Có' : 'Không';
    case 'creator':
      return value; // Return creator as-is
    case 'source':
      return value; // Return source as-is
    default:
      return value;
  }
}

/**
 * Get color cho filter chip
 */
function _getChipColor(type: string): string {
  switch (type) {
    case 'grade':
    case 'subject':
    case 'chapter':
    case 'level':
    case 'lesson':
    case 'form':
    case 'format':
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
    case 'type':
    case 'status':
    case 'difficulty':
    case 'creator':
      return 'bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20';
    case 'source':
    case 'tags':
    case 'subcount':
    case 'hasAnswers':
    case 'hasSolution':
    case 'hasImages':
      return 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20';
    case 'usageCount':
    case 'feedback':
    case 'dateRange':
      return 'bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20';
    case 'keyword':
    case 'solutionKeyword':
    case 'latexKeyword':
    case 'globalSearch':
      return 'bg-info/10 text-info-foreground border-info/20 hover:bg-info/20';
    default:
      return 'bg-muted/50 text-muted-foreground border-border hover:bg-muted';
  }
}

// ===== COMPONENT =====

/**
 * Filter Chips Component
 * Hiển thị tất cả active filters dưới dạng removable chips
 */
export function FilterChips({
  className = "",
  filters,
  updateFilters,
  resetFilters
}: FilterChipsProps) {

  /**
   * Remove specific filter value
   */
  const removeFilterValue = (type: string, value: string) => {
    switch (type) {
      case 'grade':
        updateFilters({ grade: (filters.grade || []).filter(v => v !== value) });
        break;
      case 'subject':
        updateFilters({ subject: (filters.subject || []).filter(v => v !== value) });
        break;
      case 'chapter':
        updateFilters({ chapter: (filters.chapter || []).filter(v => v !== value) });
        break;
      case 'level':
        updateFilters({ level: (filters.level || []).filter(v => v !== value) });
        break;
      case 'lesson':
        updateFilters({ lesson: (filters.lesson || []).filter(v => v !== value) });
        break;
      case 'form':
        updateFilters({ form: (filters.form || []).filter(v => v !== value) });
        break;
      case 'format':
        updateFilters({ format: (filters.format || []).filter(v => v !== value) as ('ID5' | 'ID6')[] });
        break;
      case 'type':
        updateFilters({ type: ensureArray(filters.type).filter((v: QuestionType) => v !== value) });
        break;
      case 'status':
        updateFilters({ status: ensureArray(filters.status).filter((v: QuestionStatus) => v !== value) });
        break;
      case 'difficulty':
        updateFilters({ difficulty: ensureArray(filters.difficulty).filter((v: QuestionDifficulty) => v !== value) });
        break;
      case 'creator':
        updateFilters({ creator: (filters.creator || []).filter(v => v !== value) });
        break;
      case 'source':
        updateFilters({ source: '' }); // Source is now a string, so clear it
        break;
      case 'tags':
        updateFilters({ tags: (filters.tags || []).filter(v => v !== value) });
        break;
      case 'keyword':
        updateFilters({ keyword: '' }); // Clear keyword filter
        break;
      case 'hasAnswers':
        updateFilters({ hasAnswers: undefined }); // Clear hasAnswers filter
        break;
      case 'hasSolution':
        updateFilters({ hasSolution: undefined }); // Clear hasSolution filter
        break;
      case 'hasImages':
        updateFilters({ hasImages: undefined }); // Clear hasImages filter
        break;
      case 'usageCount':
        updateFilters({ usageCount: undefined }); // Clear usageCount filter
        break;
    }
  };



  /**
   * Generate categorized filter chips
   */
  const generateCategorizedChips = () => {
    // Gộp tất cả filters vào một nhóm duy nhất
    const categories = {
      all: {
        title: 'Bộ lọc đang áp dụng',
        color: 'bg-primary/10 border-primary/20',
        chips: [] as JSX.Element[]
      }
    };

    // QuestionCode filters với icons
    const questionCodeFilters = [
      { key: 'grade', values: filters.grade, label: '🎓 Lớp', icon: '🎓' },
      { key: 'subject', values: filters.subject, label: '📚 Môn', icon: '📚' },
      { key: 'chapter', values: filters.chapter, label: '📖 Chương', icon: '📖' },
      { key: 'level', values: filters.level, label: '⭐ Mức độ', icon: '⭐' },
      { key: 'lesson', values: filters.lesson, label: '📝 Bài', icon: '📝' },
      { key: 'form', values: filters.form, label: '📋 Dạng', icon: '📋' },
      { key: 'format', values: filters.format, label: '🎯 Định dạng', icon: '🎯' }
    ];

    questionCodeFilters.forEach(({ key, values, label, icon }) => {
      if (values && values.length > 0) {
        values.forEach(value => {
          categories.all.chips.push(
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className={cn("gap-2 text-xs", _getChipColor(key))}
            >
              <span className="flex items-center gap-1">
                <span>{icon}</span>
                <span>{label.replace(icon + ' ', '')}: {getFilterLabel(key, value)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilterValue(key, value)}
                className="h-3 w-3 p-0 hover:bg-transparent"
                aria-label={`Xóa filter ${label}: ${getFilterLabel(key, value)}`}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          );
        });
      }
    });

    // Metadata filters với icons
    const metadataFilters = [
      { key: 'type', values: filters.type, label: '🔤 Loại', icon: '🔤' },
      { key: 'status', values: filters.status, label: '🔄 Trạng thái', icon: '🔄' },
      { key: 'difficulty', values: filters.difficulty, label: '⚡ Độ khó', icon: '⚡' },
      { key: 'creator', values: filters.creator, label: '👤 Người tạo', icon: '👤' }
    ];

    metadataFilters.forEach(({ key, values, label, icon }) => {
      const arrayValues = ensureArray(values);
      if (arrayValues && arrayValues.length > 0) {
        arrayValues.forEach((value: string) => {
          categories.all.chips.push(
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className={cn("gap-2 text-xs", _getChipColor(key))}
            >
              <span className="flex items-center gap-1">
                <span>{icon}</span>
                <span>{label.replace(icon + ' ', '')}: {getFilterLabel(key, value.toString())}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilterValue(key, value.toString())}
                className="h-3 w-3 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                aria-label={`Xóa filter ${label}: ${getFilterLabel(key, value.toString())}`}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          );
        });
      }
    });

    // Content filters - Source (string) và Tags (array)
    if (filters.source && typeof filters.source === 'string' && filters.source.trim()) {
      categories.all.chips.push(
        <Badge
          key="source"
          variant="secondary"
          className={cn("gap-2 text-xs", _getChipColor('source'))}
        >
          <span className="flex items-center gap-1">
            <span>📚</span>
            <span>Nguồn: &quot;{filters.source}&quot;</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilterValue('source', '')}
            className="h-3 w-3 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            aria-label={`Xóa filter Nguồn: ${filters.source}`}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }

    // Tags filter (array)
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        categories.all.chips.push(
          <Badge
            key={`tag-${tag}`}
            variant="secondary"
            className={cn("gap-1 text-xs", _getChipColor('tags'))}
          >
            <span>🏷️ Tag: {tag}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilterValue('tags', tag)}
              className="h-3 w-3 p-0 hover:bg-transparent"
              aria-label={`Xóa filter Tag: ${tag}`}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        );
      });
    }

    // Single value content filters
    if (filters.subcount) {
      categories.all.chips.push(
        <Badge
          key="subcount"
          variant="secondary"
          className={cn("gap-1 text-xs", _getChipColor('subcount'))}
        >
          <span>Subcount: {filters.subcount}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilterValue('subcount', '')}
            className="h-3 w-3 p-0 hover:bg-transparent"
            aria-label="Xóa filter Subcount"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }

    // Boolean filters
    const booleanFilters = [
      { key: 'hasAnswers', value: filters.hasAnswers, label: 'Có đáp án' },
      { key: 'hasSolution', value: filters.hasSolution, label: 'Có lời giải' },
      { key: 'hasImages', value: filters.hasImages, label: 'Có hình ảnh' }
    ];

    booleanFilters.forEach(({ key, value, label }) => {
      if (value !== undefined) {
        categories.all.chips.push(
          <Badge
            key={key}
            variant="secondary"
            className={cn("gap-1 text-xs", _getChipColor(key))}
          >
            <span>{label}: {value ? 'Có' : 'Không'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilterValue(key, '')}
              className="h-3 w-3 p-0 hover:bg-transparent"
              aria-label={`Xóa filter ${label}`}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        );
      }
    });

    // Usage filters
    if (filters.usageCount) {
      const { min, max } = filters.usageCount;
      categories.all.chips.push(
        <Badge
          key="usageCount"
          variant="secondary"
          className={cn("gap-1 text-xs", _getChipColor('usageCount'))}
        >
          <span>Sử dụng: {min !== undefined ? min : 0} - {max !== undefined ? max : '∞'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilterValue('usageCount', '')}
            className="h-3 w-3 p-0 hover:bg-transparent"
            aria-label="Xóa filter Usage Count"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }

    if (filters.feedback) {
      const { min, max } = filters.feedback;
      categories.all.chips.push(
        <Badge
          key="feedback"
          variant="secondary"
          className={cn("gap-1 text-xs", _getChipColor('feedback'))}
        >
          <span>Feedback: {min !== undefined ? min.toFixed(1) : '0.0'} - {max !== undefined ? max.toFixed(1) : '10.0'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilterValue('feedback', '')}
            className="h-3 w-3 p-0 hover:bg-transparent"
            aria-label="Xóa filter Feedback"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }

    if (filters.dateRange) {
      const { from, to, field } = filters.dateRange;
      const fieldLabel = field === 'createdAt' ? 'Ngày tạo' : 'Ngày cập nhật';
      const fromStr = from ? from.toLocaleDateString('vi-VN') : 'Không giới hạn';
      const toStr = to ? to.toLocaleDateString('vi-VN') : 'Không giới hạn';

      categories.all.chips.push(
        <Badge
          key="dateRange"
          variant="secondary"
          className={cn("gap-1 text-xs", _getChipColor('dateRange'))}
        >
          <span>{fieldLabel}: {fromStr} - {toStr}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilterValue('dateRange', '')}
            className="h-3 w-3 p-0 hover:bg-transparent"
            aria-label="Xóa filter Date Range"
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      );
    }

    // Search filters với format đẹp hơn
    const searchFilters = [
      { key: 'keyword', value: filters.keyword, label: '🔍 Nội dung', icon: '🔍' },
      { key: 'solutionKeyword', value: filters.solutionKeyword, label: '📝 Lời giải', icon: '📝' },
      { key: 'latexKeyword', value: filters.latexKeyword, label: '🔢 LaTeX', icon: '🔢' },
      { key: 'globalSearch', value: filters.globalSearch, label: '🌐 Toàn bộ', icon: '🌐' }
    ];

    searchFilters.forEach(({ key, value, label, icon }) => {
      if (value && value.trim()) {
        categories.all.chips.push(
          <Badge
            key={key}
            variant="secondary"
            className={cn("gap-2 text-xs", _getChipColor(key))}
          >
            <span className="flex items-center gap-1">
              <span>{icon}</span>
              <span>{label.replace(icon + ' ', '')}: &quot;{value}&quot;</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilterValue(key, '')}
              className="h-3 w-3 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
              aria-label={`Xóa filter ${label}: ${value}`}
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        );
      }
    });

    return categories;
  };

  const categories = generateCategorizedChips();
  const totalChips = Object.values(categories).reduce((sum, cat) => sum + cat.chips.length, 0);

  if (totalChips === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Bộ lọc đang áp dụng ({totalChips})
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs h-6 px-2"
          aria-label="Xóa tất cả filters"
        >
          <X className="h-3 w-3 mr-1" />
          Xóa tất cả
        </Button>
      </div>

      {/* All filter chips in one group */}
      <div className="p-3 rounded-md border bg-muted/50 border-border">
        <div className="flex flex-wrap gap-2">
          {categories.all.chips}
        </div>
      </div>
    </div>
  );
}

export default FilterChips;
