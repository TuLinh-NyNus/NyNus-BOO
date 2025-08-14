/**
 * Question Metadata Filters Component
 * Filters cho question metadata (Type, Status, Difficulty, Creator)
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/form/label";
import { MultiSelect } from "@/components/ui/form/multi-select";
import { Badge } from "@/components/ui/display/badge";

// Import store và types
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { QuestionType, QuestionStatus, QuestionDifficulty } from "@/lib/types/question";
import { ensureArray } from '@/lib/utils/filter-type-adapters';
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface QuestionMetadataFiltersProps {
  className?: string;
}

// ===== FILTER OPTIONS =====

const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.MC, label: 'Trắc nghiệm' },
  { value: QuestionType.TF, label: 'Đúng/Sai' },
  { value: QuestionType.SA, label: 'Trả lời ngắn' },
  { value: QuestionType.ES, label: 'Tự luận' },
  { value: QuestionType.MA, label: 'Ghép cặp' }
];

const QUESTION_STATUS_OPTIONS = [
  { value: QuestionStatus.ACTIVE, label: 'Hoạt động' },
  { value: QuestionStatus.PENDING, label: 'Chờ duyệt' },
  { value: QuestionStatus.INACTIVE, label: 'Không hoạt động' },
  { value: QuestionStatus.ARCHIVED, label: 'Đã lưu trữ' }
];

const QUESTION_DIFFICULTY_OPTIONS = [
  { value: QuestionDifficulty.EASY, label: 'Dễ' },
  { value: QuestionDifficulty.MEDIUM, label: 'Trung bình' },
  { value: QuestionDifficulty.HARD, label: 'Khó' }
];

const CREATOR_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'TEACHER', label: 'Giáo viên' },
  { value: 'SYSTEM', label: 'Hệ thống' },
  { value: 'IMPORT', label: 'Nhập khẩu' }
];

// ===== COMPONENT =====

/**
 * Question Metadata Filters Component
 * Secondary filters cho question metadata
 */
export function QuestionMetadataFilters({
  className = ""
}: QuestionMetadataFiltersProps) {
  // Store state và actions
  const {
    filters,
    setTypeFilter,
    setStatusFilter,
    setDifficultyFilter,
    setCreatorFilter
  } = useQuestionFiltersStore();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Question Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Loại câu hỏi</Label>
          {filters.type && filters.type.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.type.length} loại
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={ensureArray(filters.type).map((t: QuestionType) => t.toString())}
          setSelected={(values) => setTypeFilter(values as QuestionType[])}
          Options={QUESTION_TYPE_OPTIONS}
          placeholder="Chọn loại câu hỏi..."
          className="w-full"
        />
        
        {/* Type description */}
        {ensureArray(filters.type).length > 0 && (
          <div className="text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {ensureArray(filters.type).map((type: QuestionType) => {
                const option = QUESTION_TYPE_OPTIONS.find(opt => opt.value === type);
                return option ? (
                  <span key={type} className="px-2 py-1 bg-muted rounded">
                    {option.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Question Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Trạng thái</Label>
          {filters.status && filters.status.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.status.length} trạng thái
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={ensureArray(filters.status).map((s: QuestionStatus) => s.toString())}
          setSelected={(values) => setStatusFilter(values as QuestionStatus[])}
          Options={QUESTION_STATUS_OPTIONS}
          placeholder="Chọn trạng thái..."
          className="w-full"
        />
        
        {/* Status indicators */}
        {ensureArray(filters.status).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ensureArray(filters.status).map((status: QuestionStatus) => {
              const option = QUESTION_STATUS_OPTIONS.find(opt => opt.value === status);
              if (!option) return null;
              
              let badgeColor = "bg-gray-100 text-gray-800";
              switch (status) {
                case QuestionStatus.ACTIVE:
                  badgeColor = "bg-green-100 text-green-800";
                  break;
                case QuestionStatus.PENDING:
                  badgeColor = "bg-yellow-100 text-yellow-800";
                  break;
                case QuestionStatus.INACTIVE:
                  badgeColor = "bg-red-100 text-red-800";
                  break;
                case QuestionStatus.ARCHIVED:
                  badgeColor = "bg-gray-100 text-gray-800";
                  break;
              }
              
              return (
                <span key={status} className={`px-2 py-1 text-xs rounded ${badgeColor}`}>
                  {option.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Difficulty Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Độ khó</Label>
          {filters.difficulty && filters.difficulty.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.difficulty.length} mức độ
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={ensureArray(filters.difficulty).map((d: QuestionDifficulty) => d.toString())}
          setSelected={(values) => setDifficultyFilter(values as QuestionDifficulty[])}
          Options={QUESTION_DIFFICULTY_OPTIONS}
          placeholder="Chọn độ khó..."
          className="w-full"
        />
        
        {/* Difficulty indicators */}
        {ensureArray(filters.difficulty).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ensureArray(filters.difficulty).map((difficulty: QuestionDifficulty) => {
              const option = QUESTION_DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty);
              if (!option) return null;
              
              let badgeColor = "bg-gray-100 text-gray-800";
              switch (difficulty) {
                case QuestionDifficulty.EASY:
                  badgeColor = "bg-green-100 text-green-800";
                  break;
                case QuestionDifficulty.MEDIUM:
                  badgeColor = "bg-yellow-100 text-yellow-800";
                  break;
                case QuestionDifficulty.HARD:
                  badgeColor = "bg-red-100 text-red-800";
                  break;
              }
              
              return (
                <span key={difficulty} className={`px-2 py-1 text-xs rounded ${badgeColor}`}>
                  {option.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Người tạo</Label>
          {filters.creator && filters.creator.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.creator.length} người tạo
            </Badge>
          )}
        </div>
        <MultiSelect
          selected={filters.creator || []}
          setSelected={setCreatorFilter}
          Options={CREATOR_OPTIONS}
          placeholder="Chọn người tạo..."
          className="w-full"
        />
      </div>

      {/* Quick Filter Combinations */}
      <div className="pt-2 border-t">
        <Label className="text-sm font-medium mb-2 block">Bộ lọc nhanh</Label>
        <div className="flex flex-wrap gap-2">
          {/* Active Multiple Choice */}
          <button
            onClick={() => {
              setTypeFilter([QuestionType.MC]);
              setStatusFilter([QuestionStatus.ACTIVE]);
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Trắc nghiệm hoạt động
          </button>
          
          {/* Hard Questions */}
          <button
            onClick={() => {
              setDifficultyFilter([QuestionDifficulty.HARD]);
              setStatusFilter([QuestionStatus.ACTIVE]);
            }}
            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
          >
            Câu hỏi khó
          </button>
          
          {/* Pending Review */}
          <button
            onClick={() => {
              setStatusFilter([QuestionStatus.PENDING]);
            }}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
          >
            Chờ duyệt
          </button>
          
          {/* Admin Created */}
          <button
            onClick={() => {
              setCreatorFilter(['ADMIN']);
              setStatusFilter([QuestionStatus.ACTIVE]);
            }}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
          >
            Tạo bởi Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionMetadataFilters;
