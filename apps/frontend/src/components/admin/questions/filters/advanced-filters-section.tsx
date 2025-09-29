'use client';

import React, { useState, useCallback } from 'react';
import { Search, RotateCcw, Image as ImageIcon, FileText, CheckCircle, User, Tag, BarChart3 } from 'lucide-react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Label,
  Slider,
  Badge
} from '@/components/ui';
import { EnhancedCheckbox } from '@/components/ui/enhanced-checkbox';
import { QuestionFilters, QuestionStatus } from '@/types/question';
import { useDebounce } from '@/hooks/use-debounce';

/**
 * Advanced Filters Section Component
 * Section nâng cao có thể thu gọn với các filters chi tiết
 */

interface AdvancedFiltersSectionProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  isOpen: boolean;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: QuestionStatus.ACTIVE, label: 'Hoạt động' },
  { value: QuestionStatus.PENDING, label: 'Chờ duyệt' },
  { value: QuestionStatus.INACTIVE, label: 'Không hoạt động' },
  { value: QuestionStatus.ARCHIVED, label: 'Lưu trữ' }
];

const CREATOR_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'TEACHER_001', label: 'Giáo viên Nguyễn Văn A' },
  { value: 'TEACHER_002', label: 'Giáo viên Trần Thị B' },
  { value: 'TEACHER_003', label: 'Giáo viên Lê Văn C' }
];

// TODO: SOURCE_OPTIONS sẽ được implement trong tương lai
// const SOURCE_OPTIONS = [
//   { value: 'SGK', label: 'Sách giáo khoa' },
//   { value: 'SBT', label: 'Sách bài tập' },
//   { value: 'DE_THI', label: 'Đề thi' },
//   { value: 'CUSTOM', label: 'Tự soạn' }
// ];

const POPULAR_TAGS = [
  'đạo hàm', 'tích phân', 'giới hạn', 'hình học', 'lượng giác',
  'phương trình', 'bất phương trình', 'hàm số', 'số phức', 'xác suất'
];

export function AdvancedFiltersSection({
  filters,
  onFiltersChange,
  isOpen,
  isLoading = false
}: AdvancedFiltersSectionProps) {
  const [contentSearch, setContentSearch] = useState(filters.keyword || '');
  const [usageRange, setUsageRange] = useState([
    filters.usageCount?.min || 0,
    filters.usageCount?.max || 100
  ]);

  // Debounce content search
  const debouncedContentSearch = useDebounce(contentSearch, 300);

  // Update filters when debounced search changes
  React.useEffect(() => {
    if (debouncedContentSearch !== filters.keyword) {
      onFiltersChange({ keyword: debouncedContentSearch });
    }
  }, [debouncedContentSearch, filters.keyword, onFiltersChange]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((key: keyof QuestionFilters, value: unknown) => {
    onFiltersChange({ [key]: value });
  }, [onFiltersChange]);

  /**
   * Handle media filter changes
   */
  const handleMediaFilterChange = useCallback((key: 'hasImages' | 'hasSolution' | 'hasAnswers', checked: boolean) => {
    // Set to undefined if unchecked to remove from filters
    handleFilterChange(key, checked ? true : undefined);
  }, [handleFilterChange]);

  /**
   * Handle usage count range change
   */
  const handleUsageRangeChange = useCallback((values: number[]) => {
    setUsageRange(values);
    handleFilterChange('usageCount', {
      min: values[0],
      max: values[1]
    });
  }, [handleFilterChange]);

  /**
   * Handle tag selection
   */
  const handleTagToggle = useCallback((tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
  }, [filters.tags, handleFilterChange]);

  /**
   * Reset all advanced filters
   */
  const handleResetFilters = useCallback(() => {
    setContentSearch('');
    setUsageRange([0, 100]);
    onFiltersChange({
      keyword: undefined,
      usageCount: undefined,
      source: undefined,
      hasImages: undefined,
      hasSolution: undefined,
      hasAnswers: undefined,
      tags: undefined,
      status: [],
      creator: [],
      feedback: undefined
    });
  }, [onFiltersChange]);

  /**
   * Get array value for multi-select
   */
  const getArrayValue = (key: keyof QuestionFilters): string => {
    const value = filters[key];
    if (Array.isArray(value)) {
      return value.length === 0 ? 'all' : String(value[0]);
    }
    return value ? String(value) : 'all';
  };

  if (!isOpen) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mt-4 space-y-6 admin-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Search className="h-5 w-5" />
          Bộ lọc nâng cao
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Search */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm nội dung
          </Label>
          <Input
            placeholder="Tìm kiếm trong nội dung câu hỏi..."
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Debouncing 300ms</p>
        </div>

        {/* Usage Count Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Lượt sử dụng ({usageRange[0]} - {usageRange[1]})
          </Label>
          <div className="px-2">
            <Slider
              value={usageRange}
              onValueChange={handleUsageRangeChange}
              max={100}
              min={0}
              step={1}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>100+</span>
          </div>
        </div>

        {/* Source Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nguồn câu hỏi
          </Label>
          <Input
            placeholder="Nhập nguồn câu hỏi (VD: SGK Toán 12, Đề thi THPT 2023...)"
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value || undefined)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Nhập tự do nguồn câu hỏi</p>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Trạng thái
          </Label>
          <Select
            value={getArrayValue('status')}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : [value])}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Creator Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Người tạo
          </Label>
          <Select
            value={getArrayValue('creator')}
            onValueChange={(value) => handleFilterChange('creator', value === 'all' ? undefined : [value])}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn người tạo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả người tạo</SelectItem>
              {CREATOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Media Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Bộ lọc media
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <EnhancedCheckbox
                id="hasImages"
                checked={filters.hasImages || false}
                onCheckedChange={(checked) => handleMediaFilterChange('hasImages', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="hasImages" className="text-sm cursor-pointer">Có hình ảnh</Label>
            </div>
            <div className="flex items-center space-x-2">
              <EnhancedCheckbox
                id="hasSolution"
                checked={filters.hasSolution || false}
                onCheckedChange={(checked) => handleMediaFilterChange('hasSolution', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="hasSolution" className="text-sm cursor-pointer">Có lời giải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <EnhancedCheckbox
                id="hasAnswers"
                checked={filters.hasAnswers || false}
                onCheckedChange={(checked) => handleMediaFilterChange('hasAnswers', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="hasAnswers" className="text-sm cursor-pointer">Có đáp án</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags phổ biến
        </Label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = filters.tags?.includes(tag) || false;
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
        {filters.tags && filters.tags.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Đã chọn: {filters.tags.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
