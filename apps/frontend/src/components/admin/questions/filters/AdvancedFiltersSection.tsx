/**
 * Advanced Filters Section Component
 * Section nâng cao với các filters chi tiết
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, User, Tag, Database } from 'lucide-react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Checkbox,
  Label,
  Slider
} from '@/components/ui';
import { QuestionFilters, QuestionStatus } from '@/lib/types/question';
import { useDebounceFilter } from '@/hooks/useFilterUrlSync';

// ===== CONSTANTS =====

const SOURCE_OPTIONS = [
  { value: '', label: 'Tất cả nguồn' },
  { value: 'manual', label: 'Nhập thủ công' },
  { value: 'import', label: 'Import file' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'auto', label: 'Tự động' }
];

const CREATOR_OPTIONS = [
  { value: '', label: 'Tất cả người tạo' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher1', label: 'Giáo viên A' },
  { value: 'teacher2', label: 'Giáo viên B' },
  { value: 'system', label: 'Hệ thống' }
];

const POPULAR_TAGS = [
  'cơ bản', 'nâng cao', 'ôn tập', 'kiểm tra', 'thi thử',
  'đại số', 'hình học', 'giải tích', 'xác suất', 'thống kê'
];

// ===== INTERFACES =====

interface AdvancedFiltersSectionProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  onResetFilters: () => void;
  isOpen: boolean;
}

// ===== MAIN COMPONENT =====

/**
 * Advanced Filters Section Component
 * Collapsible section với advanced filters
 */
export function AdvancedFiltersSection({
  filters,
  onFiltersChange,
  onResetFilters,
  isOpen
}: AdvancedFiltersSectionProps) {
  // Local state cho content search với debouncing
  const [contentSearch, setContentSearch] = useState(filters.globalSearch || '');
  const debouncedContentSearch = useDebounceFilter(contentSearch, 300);

  // Local state cho tags input
  const [tagInput, setTagInput] = useState('');

  // Usage count range state
  const [usageRange, setUsageRange] = useState([
    filters.usageCount?.min || 0,
    filters.usageCount?.max || 100
  ]);

  /**
   * Update debounced content search
   */
  useEffect(() => {
    if (debouncedContentSearch !== filters.globalSearch) {
      onFiltersChange({ globalSearch: debouncedContentSearch || undefined });
    }
  }, [debouncedContentSearch, filters.globalSearch, onFiltersChange]);

  /**
   * Handle tag input
   */
  const handleTagAdd = (tag: string) => {
    if (!tag.trim()) return;
    
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag.trim())) {
      onFiltersChange({ tags: [...currentTags, tag.trim()] });
    }
    setTagInput('');
  };

  /**
   * Handle tag removal
   */
  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = filters.tags || [];
    onFiltersChange({ tags: currentTags.filter(tag => tag !== tagToRemove) });
  };

  /**
   * Handle usage count range change
   */
  const handleUsageRangeChange = (values: number[]) => {
    setUsageRange(values);
    onFiltersChange({
      usageCount: {
        min: values[0] > 0 ? values[0] : undefined,
        max: values[1] < 100 ? values[1] : undefined
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Content Search */}
        <div className="lg:col-span-3">
          <Label className="text-sm font-medium mb-2 block">
            <Search className="inline h-4 w-4 mr-1" />
            Tìm kiếm nội dung
          </Label>
          <Input
            placeholder="Tìm kiếm trong nội dung câu hỏi, lời giải..."
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Usage Count Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Lượt sử dụng: {usageRange[0]} - {usageRange[1]}
          </Label>
          <div className="px-2">
            <Slider
              value={usageRange}
              onValueChange={handleUsageRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Source */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            <Database className="inline h-4 w-4 mr-1" />
            Nguồn
          </Label>
          <Select
            value={filters.source?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ source: value ? [value] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nguồn" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Trạng thái</Label>
          <Select
            value={filters.status?.toString() || ''}
            onValueChange={(value) => onFiltersChange({ status: value ? value as QuestionStatus : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả trạng thái</SelectItem>
              <SelectItem value={QuestionStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={QuestionStatus.PENDING}>Chờ duyệt</SelectItem>
              <SelectItem value={QuestionStatus.INACTIVE}>Không hoạt động</SelectItem>
              <SelectItem value={QuestionStatus.ARCHIVED}>Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Creator */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            <User className="inline h-4 w-4 mr-1" />
            Người tạo
          </Label>
          <Select
            value={filters.creator?.[0] || ''}
            onValueChange={(value) => onFiltersChange({ creator: value ? [value] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn người tạo" />
            </SelectTrigger>
            <SelectContent>
              {CREATOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Media Filters */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Nội dung đa phương tiện</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasImages"
                checked={filters.hasImages || false}
                onCheckedChange={(checked) => onFiltersChange({ hasImages: checked ? true : undefined })}
              />
              <Label htmlFor="hasImages" className="text-sm">Có hình ảnh</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSolution"
                checked={filters.hasSolution || false}
                onCheckedChange={(checked) => onFiltersChange({ hasSolution: checked ? true : undefined })}
              />
              <Label htmlFor="hasSolution" className="text-sm">Có lời giải</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAnswers"
                checked={filters.hasAnswers || false}
                onCheckedChange={(checked) => onFiltersChange({ hasAnswers: checked ? true : undefined })}
              />
              <Label htmlFor="hasAnswers" className="text-sm">Có đáp án</Label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="lg:col-span-2">
          <Label className="text-sm font-medium mb-2 block">
            <Tag className="inline h-4 w-4 mr-1" />
            Tags
          </Label>
          
          {/* Tag Input */}
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Nhập tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd(tagInput);
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleTagAdd(tagInput)}
              disabled={!tagInput.trim()}
            >
              Thêm
            </Button>
          </div>

          {/* Popular Tags */}
          <div className="mb-2">
            <Label className="text-xs text-gray-500 mb-1 block">Tags phổ biến:</Label>
            <div className="flex flex-wrap gap-1">
              {POPULAR_TAGS.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleTagAdd(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Tags */}
          {filters.tags && filters.tags.length > 0 && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Tags đã chọn:</Label>
              <div className="flex flex-wrap gap-1">
                {filters.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-3 flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa tất cả bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}
