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

// Import store và utilities
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { MAPCODE_CONFIG } from "@/lib/utils/question-code";
import { QuestionType, QuestionStatus, QuestionDifficulty } from "@/lib/types/question";


// ===== INTERFACES =====

interface FilterChipsProps {
  className?: string;
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
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'type':
    case 'status':
    case 'difficulty':
    case 'creator':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'source':
    case 'tags':
    case 'subcount':
    case 'hasAnswers':
    case 'hasSolution':
    case 'hasImages':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'usageCount':
    case 'feedback':
    case 'dateRange':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'keyword':
    case 'solutionKeyword':
    case 'latexKeyword':
    case 'globalSearch':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// ===== COMPONENT =====

/**
 * Filter Chips Component
 * Hiển thị tất cả active filters dưới dạng removable chips
 */
export function FilterChips({
  className = ""
}: FilterChipsProps) {
  // Store state và actions
  const {
    filters,
    resetFilters,
    resetFilterCategory,
    setGradeFilter,
    setSubjectFilter,
    setChapterFilter,
    setLevelFilter,
    setLessonFilter,
    setFormFilter,
    setFormatFilter,
    setTypeFilter,
    setStatusFilter,
    setDifficultyFilter,
    setCreatorFilter,
    setSourceFilter,
    setTagsFilter,
    setSubcountFilter,
    setHasAnswersFilter,
    setHasSolutionFilter,
    setHasImagesFilter,
    setUsageCountFilter,
    setFeedbackFilter,
    setDateRangeFilter,
    setKeywordFilter,
    setSolutionKeywordFilter,
    setLatexKeywordFilter,
    setGlobalSearchFilter
  } = useQuestionFiltersStore();

  /**
   * Remove specific filter value
   */
  const removeFilterValue = (type: string, value: string) => {
    switch (type) {
      case 'grade':
        setGradeFilter((filters.grade || []).filter(v => v !== value));
        break;
      case 'subject':
        setSubjectFilter((filters.subject || []).filter(v => v !== value));
        break;
      case 'chapter':
        setChapterFilter((filters.chapter || []).filter(v => v !== value));
        break;
      case 'level':
        setLevelFilter((filters.level || []).filter(v => v !== value));
        break;
      case 'lesson':
        setLessonFilter((filters.lesson || []).filter(v => v !== value));
        break;
      case 'form':
        setFormFilter((filters.form || []).filter(v => v !== value));
        break;
      case 'format':
        setFormatFilter((filters.format || []).filter(v => v !== value) as ('ID5' | 'ID6')[]);
        break;
      case 'type':
        setTypeFilter((filters.type || []).filter(v => v !== value));
        break;
      case 'status':
        setStatusFilter((filters.status || []).filter(v => v !== value));
        break;
      case 'difficulty':
        setDifficultyFilter((filters.difficulty || []).filter(v => v !== value));
        break;
      case 'creator':
        setCreatorFilter((filters.creator || []).filter(v => v !== value));
        break;
      case 'source':
        setSourceFilter((filters.source || []).filter(v => v !== value));
        break;
      case 'tags':
        setTagsFilter((filters.tags || []).filter(v => v !== value));
        break;
    }
  };

  /**
   * Remove entire filter category
   */
  const _removeFilterCategory = (type: string) => {
    switch (type) {
      case 'subcount':
        setSubcountFilter('');
        break;
      case 'hasAnswers':
        setHasAnswersFilter(undefined);
        break;
      case 'hasSolution':
        setHasSolutionFilter(undefined);
        break;
      case 'hasImages':
        setHasImagesFilter(undefined);
        break;
      case 'usageCount':
        setUsageCountFilter(undefined);
        break;
      case 'feedback':
        setFeedbackFilter(undefined);
        break;
      case 'dateRange':
        setDateRangeFilter(undefined);
        break;
      case 'keyword':
        setKeywordFilter('');
        break;
      case 'solutionKeyword':
        setSolutionKeywordFilter('');
        break;
      case 'latexKeyword':
        setLatexKeywordFilter('');
        break;
      case 'globalSearch':
        setGlobalSearchFilter('');
        break;
    }
  };

  /**
   * Generate categorized filter chips
   */
  const generateCategorizedChips = () => {
    const categories = {
      questionCode: {
        title: 'Mã câu hỏi',
        color: 'bg-blue-50 border-blue-200',
        chips: [] as JSX.Element[]
      },
      metadata: {
        title: 'Thông tin',
        color: 'bg-green-50 border-green-200',
        chips: [] as JSX.Element[]
      },
      content: {
        title: 'Nội dung',
        color: 'bg-purple-50 border-purple-200',
        chips: [] as JSX.Element[]
      },
      usage: {
        title: 'Sử dụng',
        color: 'bg-orange-50 border-orange-200',
        chips: [] as JSX.Element[]
      },
      search: {
        title: 'Tìm kiếm',
        color: 'bg-gray-50 border-gray-200',
        chips: [] as JSX.Element[]
      }
    };

    // QuestionCode filters
    const questionCodeFilters = [
      { key: 'grade', values: filters.grade, label: 'Lớp' },
      { key: 'subject', values: filters.subject, label: 'Môn' },
      { key: 'chapter', values: filters.chapter, label: 'Chương' },
      { key: 'level', values: filters.level, label: 'Mức độ' },
      { key: 'lesson', values: filters.lesson, label: 'Bài' },
      { key: 'form', values: filters.form, label: 'Dạng' },
      { key: 'format', values: filters.format, label: 'Định dạng' }
    ];

    questionCodeFilters.forEach(({ key, values, label }) => {
      if (values && values.length > 0) {
        values.forEach(value => {
          categories.questionCode.chips.push(
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className={cn("gap-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200")}
            >
              <span>{label}: {getFilterLabel(key, value)}</span>
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

    // Metadata filters
    const metadataFilters = [
      { key: 'type', values: filters.type, label: 'Loại' },
      { key: 'status', values: filters.status, label: 'Trạng thái' },
      { key: 'difficulty', values: filters.difficulty, label: 'Độ khó' },
      { key: 'creator', values: filters.creator, label: 'Người tạo' }
    ];

    metadataFilters.forEach(({ key, values, label }) => {
      if (values && values.length > 0) {
        values.forEach(value => {
          categories.metadata.chips.push(
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className={cn("gap-1 text-xs bg-green-100 text-green-800 hover:bg-green-200")}
            >
              <span>{label}: {getFilterLabel(key, value.toString())}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilterValue(key, value.toString())}
                className="h-3 w-3 p-0 hover:bg-transparent"
                aria-label={`Xóa filter ${label}: ${getFilterLabel(key, value.toString())}`}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          );
        });
      }
    });

    // Content filters
    const contentFilters = [
      { key: 'source', values: filters.source, label: 'Nguồn' },
      { key: 'tags', values: filters.tags, label: 'Tag' }
    ];

    contentFilters.forEach(({ key, values, label }) => {
      if (values && values.length > 0) {
        values.forEach(value => {
          categories.content.chips.push(
            <Badge
              key={`${key}-${value}`}
              variant="secondary"
              className={cn("gap-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-200")}
            >
              <span>{label}: {value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilterValue(key, value)}
                className="h-3 w-3 p-0 hover:bg-transparent"
                aria-label={`Xóa filter ${label}: ${value}`}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          );
        });
      }
    });

    // Single value content filters
    if (filters.subcount) {
      categories.content.chips.push(
        <Badge
          key="subcount"
          variant="secondary"
          className={cn("gap-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-200")}
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
        categories.content.chips.push(
          <Badge
            key={key}
            variant="secondary"
            className={cn("gap-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-200")}
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
      categories.usage.chips.push(
        <Badge
          key="usageCount"
          variant="secondary"
          className={cn("gap-1 text-xs bg-orange-100 text-orange-800 hover:bg-orange-200")}
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
      categories.usage.chips.push(
        <Badge
          key="feedback"
          variant="secondary"
          className={cn("gap-1 text-xs bg-orange-100 text-orange-800 hover:bg-orange-200")}
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

      categories.usage.chips.push(
        <Badge
          key="dateRange"
          variant="secondary"
          className={cn("gap-1 text-xs bg-orange-100 text-orange-800 hover:bg-orange-200")}
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

    // Search filters
    const searchFilters = [
      { key: 'keyword', value: filters.keyword, label: 'Từ khóa' },
      { key: 'solutionKeyword', value: filters.solutionKeyword, label: 'Từ khóa lời giải' },
      { key: 'latexKeyword', value: filters.latexKeyword, label: 'Từ khóa LaTeX' },
      { key: 'globalSearch', value: filters.globalSearch, label: 'Tìm kiếm toàn bộ' }
    ];

    searchFilters.forEach(({ key, value, label }) => {
      if (value && value.trim()) {
        categories.search.chips.push(
          <Badge
            key={key}
            variant="secondary"
            className={cn("gap-1 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200")}
          >
            <span>{label}: &quot;{value}&quot;</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilterValue(key, '')}
              className="h-3 w-3 p-0 hover:bg-transparent"
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

      {/* Categorized filter chips */}
      <div className="space-y-2">
        {Object.entries(categories).map(([categoryKey, category]) => {
          if (category.chips.length === 0) return null;

          return (
            <div key={categoryKey} className={cn("p-2 rounded-md border", category.color)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {category.title} ({category.chips.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetFilterCategory(categoryKey as 'questionCode' | 'metadata' | 'content' | 'usage' | 'search')}
                  className="text-xs h-5 px-1"
                  aria-label={`Xóa tất cả filters ${category.title}`}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {category.chips}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FilterChips;
