/**
 * Gallery Filters Component
 * Filter controls cho image gallery với search và sorting
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import type { GalleryFilters } from '../types';
import { ImageType, ImageStatus } from '@/lib/mockdata/shared/core-types';
import {
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// ===== INTERFACES =====

export interface GalleryFiltersProps {
  /** Current filters */
  filters: GalleryFilters;
  /** Filter change callback */
  onFiltersChange: (filters: GalleryFilters) => void;
  /** Reset filters callback */
  onResetFilters: () => void;
  /** Show advanced filters */
  showAdvanced?: boolean;
  /** Custom className */
  className?: string;
}

// ===== FILTER OPTIONS =====

const IMAGE_TYPE_OPTIONS = [
  { value: ImageType.QUESTION, label: 'Câu hỏi', icon: '❓' },
  { value: ImageType.SOLUTION, label: 'Lời giải', icon: '✅' },
];

const STATUS_OPTIONS = [
  { value: ImageStatus.UPLOADED, label: 'Đã upload', icon: CheckCircle, color: 'text-green-600' },
  { value: ImageStatus.UPLOADING, label: 'Đang upload', icon: Clock, color: 'text-blue-600' },
  { value: ImageStatus.PENDING, label: 'Chờ xử lý', icon: Clock, color: 'text-yellow-600' },
  { value: ImageStatus.FAILED, label: 'Thất bại', icon: XCircle, color: 'text-red-600' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
  { value: 'size', label: 'Kích thước' },
  { value: 'name', label: 'Tên file' },
];

// ===== MAIN COMPONENT =====

export function GalleryFiltersComponent({
  filters,
  onFiltersChange,
  onResetFilters,
  showAdvanced = false,
  className,
}: GalleryFiltersProps) {
  // Handle filter changes
  const updateFilter = <K extends keyof GalleryFilters>(
    key: K,
    value: GalleryFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    updateFilter('searchQuery', value || undefined);
  };

  // Handle image type filter
  const handleImageTypeFilter = (type: ImageType) => {
    updateFilter('imageType', filters.imageType === type ? undefined : type);
  };

  // Handle status filter
  const handleStatusFilter = (status: ImageStatus) => {
    updateFilter('status', filters.status === status ? undefined : status);
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    updateFilter('sortBy', sortBy as 'createdAt' | 'updatedAt' | 'size' | 'name');
  };

  // Handle sort direction toggle
  const toggleSortDirection = () => {
    updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Count active filters
  const activeFilterCount = [
    filters.imageType,
    filters.status,
    filters.searchQuery,
    filters.dateRange,
  ].filter(Boolean).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên file..."
          value={filters.searchQuery || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {filters.searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Header */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc:</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* Image Type Filters */}
        {IMAGE_TYPE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.imageType === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleImageTypeFilter(option.value)}
            className="h-8"
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </Button>
        ))}

        {/* Status Filters */}
        {STATUS_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.value}
              variant={filters.status === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(option.value)}
              className="h-8"
            >
              <IconComponent className={cn('h-3 w-3 mr-1', option.color)} />
              {option.label}
            </Button>
          );
        })}

        {/* Reset Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-gray-500"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
        
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortDirection}
          className="h-8"
        >
          {filters.sortDirection === 'asc' ? (
            <SortAsc className="h-3 w-3" />
          ) : (
            <SortDesc className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-sm">Bộ lọc nâng cao</h4>
          
          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Từ ngày
              </label>
              <Input
                type="date"
                value={filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: date,
                    to: filters.dateRange?.to || new Date()
                  });
                }}
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Đến ngày
              </label>
              <Input
                type="date"
                value={filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: filters.dateRange?.from || new Date(),
                    to: date
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Đang lọc:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {filters.imageType && (
              <Badge variant="secondary" className="text-xs">
                {IMAGE_TYPE_OPTIONS.find(opt => opt.value === filters.imageType)?.label}
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                {STATUS_OPTIONS.find(opt => opt.value === filters.status)?.label}
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary" className="text-xs">
                &quot;{filters.searchQuery}&quot;
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Khoảng thời gian
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== EXPORTS =====

export default GalleryFiltersComponent;
