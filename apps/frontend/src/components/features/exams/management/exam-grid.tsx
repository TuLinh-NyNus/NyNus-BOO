/**
 * Exam Grid Component
 * Exam listing với advanced filters, pagination, sorting, và bulk operations
 * Follows question-grid pattern với exam-specific features
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// Import components
import { ExamCard } from "@/components/features/exams/shared/exam-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Checkbox } from "@/components/ui/form/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

// Import icons
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Plus,
  Download,
  Trash2,
  Archive,
  Play,
  X,
  FileText,
  Upload,
} from "lucide-react";

// Import types
import {
  Exam,
  ExamStatus,
  ExamType,
  ExamFilters,
} from "@/types/exam";
import { QuestionDifficulty } from "@/types/question";

// ===== TYPES =====

export type ExamGridViewMode = 'grid' | 'list';
export type ExamGridSortField = 'title' | 'createdAt' | 'updatedAt' | 'status' | 'subject' | 'difficulty';
export type ExamGridSortDirection = 'asc' | 'desc';

export interface ExamGridProps {
  /** Array of exams to display */
  exams: Exam[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string | null;
  
  /** View mode */
  viewMode?: ExamGridViewMode;
  
  /** Show filters */
  showFilters?: boolean;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Show bulk actions */
  showBulkActions?: boolean;
  
  /** Show create button */
  showCreateButton?: boolean;
  
  /** Grid columns for grid view */
  gridColumns?: 1 | 2 | 3 | 4;
  
  /** Items per page */
  itemsPerPage?: number;
  
  /** Current page */
  currentPage?: number;
  
  /** Total items */
  totalItems?: number;
  
  /** Selected exam IDs */
  selectedIds?: string[];
  
  /** Event handlers */
  onViewModeChange?: (mode: ExamGridViewMode) => void;
  onFiltersChange?: (filters: ExamFilters) => void;
  onSortChange?: (field: ExamGridSortField, direction: ExamGridSortDirection) => void;
  onPageChange?: (page: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onCreateExam?: () => void;
  onEditExam?: (exam: Exam) => void;
  onDeleteExam?: (exam: Exam) => void;
  onViewExam?: (exam: Exam) => void;
  onDuplicateExam?: (exam: Exam) => void;
  onPublishExam?: (exam: Exam) => void;
  onArchiveExam?: (exam: Exam) => void;
  onTakeExam?: (exam: Exam) => void;
  onBulkDelete?: (examIds: string[]) => void;
  onBulkPublish?: (examIds: string[]) => void;
  onBulkArchive?: (examIds: string[]) => void;
  onExport?: (examIds?: string[]) => void;
  onImport?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_ITEMS_PER_PAGE = 12;
const DEFAULT_GRID_COLUMNS = 3;

const SORT_OPTIONS = [
  { value: 'title', label: 'Tiêu đề' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Cập nhật' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'subject', label: 'Môn học' },
  { value: 'difficulty', label: 'Độ khó' },
] as const;

const STATUS_OPTIONS = [
  { value: ExamStatus.ACTIVE, label: 'Đang hoạt động' },
  { value: ExamStatus.PENDING, label: 'Chờ duyệt' },
  { value: ExamStatus.INACTIVE, label: 'Tạm ngưng' },
  { value: ExamStatus.ARCHIVED, label: 'Đã lưu trữ' },
] as const;

const TYPE_OPTIONS = [
  { value: ExamType.GENERATED, label: 'Đề thi tạo' },
  { value: ExamType.OFFICIAL, label: 'Đề thi chính thức' },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: QuestionDifficulty.EASY, label: 'Dễ' },
  { value: QuestionDifficulty.MEDIUM, label: 'Trung bình' },
  { value: QuestionDifficulty.HARD, label: 'Khó' },
  { value: QuestionDifficulty.EXPERT, label: 'Chuyên gia' },
] as const;

// ===== MAIN COMPONENT =====

export function ExamGrid({
  exams,
  loading = false,
  error = null,
  viewMode = 'grid',
  showFilters = true,
  showSearch = true,
  showBulkActions = true,
  showCreateButton = true,
  gridColumns = DEFAULT_GRID_COLUMNS,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  currentPage: _currentPage = 1,
  totalItems = 0,
  selectedIds = [],
  onViewModeChange,
  onFiltersChange,
  onSortChange,
  onPageChange: _onPageChange,
  onSelectionChange,
  onCreateExam,
  onEditExam,
  onDeleteExam,
  onViewExam,
  onDuplicateExam,
  onPublishExam,
  onArchiveExam,
  onTakeExam,
  onBulkDelete,
  onBulkPublish,
  onBulkArchive,
  onExport,
  onImport,
  className,
}: ExamGridProps) {
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<ExamGridSortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<ExamGridSortDirection>('desc');
  const [activeFilters, setActiveFilters] = useState<ExamFilters>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Computed values
  const hasSelection = selectedIds.length > 0;
  const isAllSelected = selectedIds.length === exams.length && exams.length > 0;
  const _isPartiallySelected = selectedIds.length > 0 && selectedIds.length < exams.length;
  
  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Trigger search with debounce in real implementation
    onFiltersChange?.({ ...activeFilters, search: query });
  }, [activeFilters, onFiltersChange]);
  
  const handleSort = useCallback((field: ExamGridSortField) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSortChange?.(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);
  
  const handleFilterChange = useCallback((key: string, value: string | string[] | number[] | undefined) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [activeFilters, onFiltersChange]);
  
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(exams.map(exam => exam.id));
    }
  }, [isAllSelected, exams, onSelectionChange]);
  
  const handleSelectExam = useCallback((exam: Exam) => {
    const isSelected = selectedIds.includes(exam.id);
    if (isSelected) {
      onSelectionChange?.(selectedIds.filter(id => id !== exam.id));
    } else {
      onSelectionChange?.([...selectedIds, exam.id]);
    }
  }, [selectedIds, onSelectionChange]);
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-2">Có lỗi xảy ra</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-base font-semibold text-blue-900">
              Hiện có <span className="text-xl font-bold text-blue-600">{totalItems || exams.length}</span> đề thi
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Nhập đề thi
            </Button>
          )}
          {showCreateButton && (
            <Button onClick={onCreateExam}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo đề thi mới
            </Button>
          )}
        </div>
      </div>
      
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm đề thi..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-transparent border-white text-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20 placeholder:text-white/60"
                />
              </div>
            </div>
          )}
          
          {/* Filter Controls */}
          {showFilters && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="bg-transparent border-white text-white hover:bg-white/10 hover:border-white transition-all duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
              </Button>
              
              <Select value={sortField} onValueChange={(value) => handleSort(value as ExamGridSortField)}>
                <SelectTrigger className="w-40 bg-transparent border-white text-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort(sortField)}
                className="bg-transparent border-white text-white hover:bg-white/10 hover:border-white"
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-transparent border-white text-white hover:bg-white/10 hover:border-white"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Bộ lọc
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersPanel(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Trạng thái
              </label>
              <Select
                value={activeFilters.status?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? [] : [value])}
              >
                <SelectTrigger className="bg-transparent border-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20 text-white text-sm h-9">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Loại đề thi
              </label>
              <Select
                value={activeFilters.examType?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('examType', value === 'all' ? [] : [value])}
              >
                <SelectTrigger className="bg-transparent border-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20 text-white text-sm h-9">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Độ khó
              </label>
              <Select
                value={activeFilters.difficulty?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('difficulty', value === 'all' ? [] : [value])}
              >
                <SelectTrigger className="bg-transparent border-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20 text-white text-sm h-9">
                  <SelectValue placeholder="Tất cả độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả độ khó</SelectItem>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Subject Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Môn học
              </label>
              <Input
                placeholder="Nhập môn học..."
                value={activeFilters.subject?.[0] || ''}
                onChange={(e) => handleFilterChange('subject', e.target.value ? [e.target.value] : [])}
                className="bg-transparent border-white hover:bg-white/10 hover:border-white focus:border-white focus:ring-white/20 text-white placeholder:text-white/60 text-sm h-9"
              />
            </div>
          </div>
          
          {/* Clear Filters */}
          <div className="flex justify-end pt-3 border-t border-white/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilters({});
                onFiltersChange?.({});
              }}
              className="bg-transparent border-white text-white hover:bg-white/10 hover:border-white text-xs h-8"
            >
              <X className="w-3 h-3 mr-1" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}
      
      {/* Bulk Actions */}
      {showBulkActions && hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedIds.length} đề thi
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkPublish?.(selectedIds)}
              >
                <Play className="w-4 h-4 mr-2" />
                Xuất bản
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkArchive?.(selectedIds)}
              >
                <Archive className="w-4 h-4 mr-2" />
                Lưu trữ
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport?.(selectedIds)}
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất file
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkDelete?.(selectedIds)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      {loading ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' && gridColumns === 1 && "grid-cols-1",
          viewMode === 'grid' && gridColumns === 2 && "grid-cols-1 sm:grid-cols-2",
          viewMode === 'grid' && gridColumns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          viewMode === 'grid' && gridColumns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          viewMode === 'list' && "grid-cols-1"
        )}>
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-500 mb-2">Không tìm thấy đề thi nào</div>
          <div className="text-gray-400">Thử thay đổi bộ lọc hoặc tạo đề thi mới</div>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' && gridColumns === 1 && "grid-cols-1",
          viewMode === 'grid' && gridColumns === 2 && "grid-cols-1 sm:grid-cols-2",
          viewMode === 'grid' && gridColumns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          viewMode === 'grid' && gridColumns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          viewMode === 'list' && "grid-cols-1"
        )}>
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              viewMode={viewMode === 'list' ? 'compact' : 'card'}
              selected={selectedIds.includes(exam.id)}
              onSelect={handleSelectExam}
              onEdit={onEditExam}
              onDelete={onDeleteExam}
              onView={onViewExam}
              onDuplicate={onDuplicateExam}
              onPublish={onPublishExam}
              onArchive={onArchiveExam}
              onTakeExam={onTakeExam}
            />
          ))}
        </div>
      )}
    </div>
  );
}
