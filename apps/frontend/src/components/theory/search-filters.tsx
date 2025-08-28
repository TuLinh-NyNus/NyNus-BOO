/**
 * Search Filters Component
 * Advanced filtering với multi-level controls và mobile optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
// import { Separator } from "@/components/ui/display/separator";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bookmark,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEARCH_CONSTANTS } from "@/lib/search";

// ===== TYPES =====

export interface SearchFilters {
  subjects?: string[];
  grades?: number[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  contentTypes?: ('theory' | 'example' | 'exercise' | 'formula')[];
  estimatedTimeRange?: [number, number];
  hasImages?: boolean;
  hasFormulas?: boolean;
  recentlyUpdated?: boolean;
}

export interface SearchFiltersProps {
  /** Current filter state */
  filters: SearchFilters;
  
  /** Handler khi filters thay đổi */
  onFiltersChange: (filters: SearchFilters) => void;
  
  /** Available subjects */
  availableSubjects?: string[];
  
  /** Available grades */
  availableGrades?: number[];
  
  /** Enable advanced filters */
  enableAdvancedFilters?: boolean;
  
  /** Mobile-optimized design */
  mobileOptimized?: boolean;
  
  /** Show filter count */
  showFilterCount?: boolean;
  
  /** Show filter presets */
  showPresets?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: SearchFilters;
  icon?: string;
}

// ===== CONSTANTS =====

const DEFAULT_SUBJECTS = SEARCH_CONSTANTS.SUBJECTS;
const DEFAULT_GRADES = SEARCH_CONSTANTS.GRADES;

const DIFFICULTY_LABELS = {
  easy: 'Dễ',
  medium: 'Trung bình', 
  hard: 'Khó'
};

const CONTENT_TYPE_LABELS = {
  theory: 'Lý thuyết',
  example: 'Ví dụ',
  exercise: 'Bài tập',
  formula: 'Công thức'
};

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'math-grade-12',
    name: 'Toán lớp 12',
    description: 'Toán học lớp 12 tất cả mức độ',
    filters: {
      subjects: ['TOÁN'],
      grades: [12]
    },
    icon: '📐'
  },
  {
    id: 'physics-hard',
    name: 'Vật lý khó',
    description: 'Bài tập vật lý mức độ khó',
    filters: {
      subjects: ['VẬT LÝ'],
      difficulty: ['hard'],
      contentTypes: ['exercise']
    },
    icon: '⚡'
  },
  {
    id: 'chemistry-formulas',
    name: 'Công thức Hóa',
    description: 'Công thức và lý thuyết Hóa học',
    filters: {
      subjects: ['HÓA HỌC'],
      contentTypes: ['formula', 'theory'],
      hasFormulas: true
    },
    icon: '🧪'
  },
  {
    id: 'recent-updates',
    name: 'Cập nhật gần đây',
    description: 'Nội dung được cập nhật trong 30 ngày',
    filters: {
      recentlyUpdated: true
    },
    icon: '🆕'
  }
];

// ===== MAIN COMPONENT =====

export function SearchFilters({
  filters,
  onFiltersChange,
  availableSubjects = DEFAULT_SUBJECTS,
  availableGrades = DEFAULT_GRADES,
  enableAdvancedFilters = true,
  mobileOptimized = true,
  showFilterCount = true,
  showPresets = true,
  className
}: SearchFiltersProps) {
  
  // ===== STATE =====
  
  const [_isExpanded, _setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ===== COMPUTED VALUES =====
  
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.subjects?.length) count += filters.subjects.length;
    if (filters.grades?.length) count += filters.grades.length;
    if (filters.difficulty?.length) count += filters.difficulty.length;
    if (filters.contentTypes?.length) count += filters.contentTypes.length;
    if (filters.hasImages) count++;
    if (filters.hasFormulas) count++;
    if (filters.recentlyUpdated) count++;
    if (filters.estimatedTimeRange) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // ===== HANDLERS =====

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  }, [filters, onFiltersChange]);

  const handleSubjectToggle = useCallback((subject: string) => {
    const currentSubjects = filters.subjects || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    handleFilterChange({ subjects: newSubjects });
  }, [filters.subjects, handleFilterChange]);

  const handleGradeToggle = useCallback((grade: number) => {
    const currentGrades = filters.grades || [];
    const newGrades = currentGrades.includes(grade)
      ? currentGrades.filter(g => g !== grade)
      : [...currentGrades, grade];
    handleFilterChange({ grades: newGrades });
  }, [filters.grades, handleFilterChange]);

  const handleDifficultyToggle = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    const currentDifficulty = filters.difficulty || [];
    const newDifficulty = currentDifficulty.includes(difficulty)
      ? currentDifficulty.filter(d => d !== difficulty)
      : [...currentDifficulty, difficulty];
    handleFilterChange({ difficulty: newDifficulty });
  }, [filters.difficulty, handleFilterChange]);

  const handleContentTypeToggle = useCallback((contentType: 'theory' | 'example' | 'exercise' | 'formula') => {
    const currentTypes = filters.contentTypes || [];
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(t => t !== contentType)
      : [...currentTypes, contentType];
    handleFilterChange({ contentTypes: newTypes });
  }, [filters.contentTypes, handleFilterChange]);

  const handlePresetSelect = useCallback((preset: FilterPreset) => {
    onFiltersChange(preset.filters);
  }, [onFiltersChange]);

  const handleResetFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const handleRemoveFilter = useCallback((filterType: keyof SearchFilters, value?: string | number) => {
    switch (filterType) {
      case 'subjects':
        if (value && filters.subjects) {
          handleFilterChange({ subjects: filters.subjects.filter(s => s !== value) });
        }
        break;
      case 'grades':
        if (value && filters.grades) {
          handleFilterChange({ grades: filters.grades.filter(g => g !== value) });
        }
        break;
      case 'difficulty':
        if (value && filters.difficulty) {
          handleFilterChange({ difficulty: filters.difficulty.filter(d => d !== value) });
        }
        break;
      case 'contentTypes':
        if (value && filters.contentTypes) {
          handleFilterChange({ contentTypes: filters.contentTypes.filter(t => t !== value) });
        }
        break;
      default:
        handleFilterChange({ [filterType]: undefined });
    }
  }, [filters, handleFilterChange]);

  // ===== RENDER HELPERS =====

  const renderFilterChips = () => {
    if (!hasActiveFilters) return null;

    const chips: React.ReactNode[] = [];

    // Subject chips
    filters.subjects?.forEach(subject => {
      chips.push(
        <Badge
          key={`subject-${subject}`}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {subject}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('subjects', subject)}
          />
        </Badge>
      );
    });

    // Grade chips
    filters.grades?.forEach(grade => {
      chips.push(
        <Badge
          key={`grade-${grade}`}
          variant="secondary"
          className="flex items-center gap-1"
        >
          Lớp {grade}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('grades', grade)}
          />
        </Badge>
      );
    });

    // Difficulty chips
    filters.difficulty?.forEach(difficulty => {
      chips.push(
        <Badge
          key={`difficulty-${difficulty}`}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {DIFFICULTY_LABELS[difficulty]}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('difficulty', difficulty)}
          />
        </Badge>
      );
    });

    // Content type chips
    filters.contentTypes?.forEach(type => {
      chips.push(
        <Badge
          key={`type-${type}`}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {CONTENT_TYPE_LABELS[type]}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('contentTypes', type)}
          />
        </Badge>
      );
    });

    // Boolean filters
    if (filters.hasImages) {
      chips.push(
        <Badge key="hasImages" variant="secondary" className="flex items-center gap-1">
          Có hình ảnh
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('hasImages')}
          />
        </Badge>
      );
    }

    if (filters.hasFormulas) {
      chips.push(
        <Badge key="hasFormulas" variant="secondary" className="flex items-center gap-1">
          Có công thức
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('hasFormulas')}
          />
        </Badge>
      );
    }

    if (filters.recentlyUpdated) {
      chips.push(
        <Badge key="recentlyUpdated" variant="secondary" className="flex items-center gap-1">
          Cập nhật gần đây
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleRemoveFilter('recentlyUpdated')}
          />
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {chips}
        {chips.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>
    );
  };

  const renderPresets = () => {
    if (!showPresets) return null;

    return (
      <div className="mb-4">
        <div className="text-sm font-medium mb-2 flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Bộ lọc nhanh
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_PRESETS.map(preset => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "flex items-center gap-2",
                mobileOptimized && "touch-target"
              )}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderBasicFilters = () => (
    <div className="space-y-4">
      {/* Subjects */}
      <div>
        <label className="text-sm font-medium mb-2 block">Môn học</label>
        <div className="flex flex-wrap gap-2">
          {availableSubjects.map(subject => (
            <Button
              key={subject}
              variant={filters.subjects?.includes(subject) ? "default" : "outline"}
              size="sm"
              onClick={() => handleSubjectToggle(subject)}
              className={mobileOptimized ? "touch-target" : ""}
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>

      {/* Grades */}
      <div>
        <label className="text-sm font-medium mb-2 block">Lớp</label>
        <div className="flex flex-wrap gap-2">
          {availableGrades.map(grade => (
            <Button
              key={grade}
              variant={filters.grades?.includes(grade) ? "default" : "outline"}
              size="sm"
              onClick={() => handleGradeToggle(grade)}
              className={mobileOptimized ? "touch-target" : ""}
            >
              Lớp {grade}
            </Button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="text-sm font-medium mb-2 block">Độ khó</label>
        <div className="flex gap-2">
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.difficulty?.includes(key as 'easy' | 'medium' | 'hard') ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyToggle(key as 'easy' | 'medium' | 'hard')}
              className={mobileOptimized ? "touch-target" : ""}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvancedFilters = () => {
    if (!enableAdvancedFilters || !showAdvanced) return null;

    return (
      <div className="space-y-4 pt-4 border-t">
        {/* Content Types */}
        <div>
          <label className="text-sm font-medium mb-2 block">Loại nội dung</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={filters.contentTypes?.includes(key as 'theory' | 'example' | 'exercise' | 'formula') ? "default" : "outline"}
                size="sm"
                onClick={() => handleContentTypeToggle(key as 'theory' | 'example' | 'exercise' | 'formula')}
                className={mobileOptimized ? "touch-target" : ""}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Boolean Filters */}
        <div>
          <label className="text-sm font-medium mb-2 block">Đặc điểm</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.hasImages ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ hasImages: !filters.hasImages })}
              className={mobileOptimized ? "touch-target" : ""}
            >
              Có hình ảnh
            </Button>
            <Button
              variant={filters.hasFormulas ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ hasFormulas: !filters.hasFormulas })}
              className={mobileOptimized ? "touch-target" : ""}
            >
              Có công thức
            </Button>
            <Button
              variant={filters.recentlyUpdated ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ recentlyUpdated: !filters.recentlyUpdated })}
              className={mobileOptimized ? "touch-target" : ""}
            >
              Cập nhật gần đây
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <Card className={cn("search-filters", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Bộ lọc tìm kiếm</span>
            {showFilterCount && activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {enableAdvancedFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1"
              >
                <Settings className="h-3 w-3" />
                <span className="text-xs">Nâng cao</span>
                {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Filter chips */}
        {renderFilterChips()}
        
        {/* Presets */}
        {renderPresets()}
        
        {/* Basic filters */}
        {renderBasicFilters()}
        
        {/* Advanced filters */}
        {renderAdvancedFilters()}
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Search Filters
 * Phiên bản compact cho mobile
 */
export function CompactSearchFilters(props: SearchFiltersProps) {
  return (
    <SearchFilters
      {...props}
      enableAdvancedFilters={false}
      showPresets={false}
      className={cn("compact-search-filters", props.className)}
    />
  );
}

/**
 * Advanced Search Filters
 * Phiên bản đầy đủ với tất cả features
 */
export function AdvancedSearchFilters(props: SearchFiltersProps) {
  return (
    <SearchFilters
      {...props}
      enableAdvancedFilters={true}
      showPresets={true}
      showFilterCount={true}
      className={cn("advanced-search-filters", props.className)}
    />
  );
}
