/**
 * Gallery Tab Component
 * Enhanced image gallery với admin features và bulk operations
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckSquare,
  Square,
  FileImage,
  AlertCircle,
  Info
} from 'lucide-react';

// Import existing image components
import { ImageGallery } from '@/components/admin/questions/images/image-gallery';
import { QuestionImage, ImageType, ImageStatus } from '@/lib/mockdata/shared/core-types';
import type { GalleryFilters } from '@/components/admin/questions/images/types';

// ===== TYPES =====

interface GalleryTabProps {
  questionId?: string;
  questionCode?: string;
  statistics?: {
    totalImages: number;
    pendingUploads: number;
    failedUploads: number;
  } | null;
  className?: string;
}

interface AdvancedFilters extends GalleryFilters {
  sizeRange?: {
    min: number;
    max: number;
  };
  questionCodes?: string[];
  tags?: string[];
}

// ===== FILTER COMPONENTS =====

function QuickFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: AdvancedFilters; 
  onFiltersChange: (filters: AdvancedFilters) => void;
}) {
  const quickFilterOptions = [
    { label: 'Tất cả', value: null, count: 2847 },
    { label: 'Câu hỏi', value: ImageType.QUESTION, count: 1523 },
    { label: 'Lời giải', value: ImageType.SOLUTION, count: 1324 },
    { label: 'Đã upload', value: ImageStatus.UPLOADED, count: 2698 },
    { label: 'Đang xử lý', value: ImageStatus.UPLOADING, count: 137 },
    { label: 'Lỗi', value: ImageStatus.FAILED, count: 12 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilterOptions.map((option) => (
        <Button
          key={option.label}
          variant={
            (option.value === null && !filters.imageType && !filters.status) ||
            filters.imageType === option.value ||
            filters.status === option.value
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() => {
            if (option.value === null) {
              onFiltersChange({ ...filters, imageType: undefined, status: undefined });
            } else if (Object.values(ImageType).includes(option.value as ImageType)) {
              onFiltersChange({ ...filters, imageType: option.value as ImageType });
            } else if (Object.values(ImageStatus).includes(option.value as ImageStatus)) {
              onFiltersChange({ ...filters, status: option.value as ImageStatus });
            }
          }}
          className="flex items-center gap-2"
        >
          {option.label}
          <Badge variant="secondary" className="text-xs">
            {option.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
}

function SearchAndSort({ 
  filters, 
  onFiltersChange,
  viewMode,
  onViewModeChange 
}: { 
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên file, mã câu hỏi..."
          value={filters.searchQuery || ''}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFiltersChange({
            ...filters,
            sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
          })}
        >
          {filters.sortDirection === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {/* View Mode */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== BULK OPERATIONS COMPONENT =====

function BulkOperationsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDownload,
  onBulkDelete,
  onBulkOptimize,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onBulkOptimize: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                Đã chọn {selectedCount} / {totalCount} hình ảnh
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
              >
                {selectedCount === totalCount ? (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    Bỏ chọn tất cả
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Chọn tất cả
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Tải xuống ({selectedCount})
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkOptimize}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Tối ưu hóa
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa ({selectedCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== MAIN GALLERY TAB COMPONENT =====

export default function GalleryTab({
  questionId,
  questionCode,
  statistics,
  className,
}: GalleryTabProps) {
  const [filters, setFilters] = useState<AdvancedFilters>({
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle bulk operations
  const handleSelectAll = () => {
    // In real implementation, would select all filtered images
    setSelectedImages(['img-1', 'img-2', 'img-3', 'img-4', 'img-5']);
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const handleBulkDownload = () => {
    console.log('Bulk downloading:', selectedImages.length, 'images');
    // In real implementation, would trigger bulk download
  };

  const handleBulkDelete = () => {
    console.log('Bulk deleting:', selectedImages.length, 'images');
    // In real implementation, would show confirmation dialog then delete
    setSelectedImages([]);
  };

  const handleBulkOptimize = () => {
    console.log('Bulk optimizing:', selectedImages.length, 'images');
    // In real implementation, would trigger Cloudinary optimization
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header với context info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Thư viện hình ảnh</h3>
          <p className="text-sm text-gray-600">
            Quản lý và tổ chức hình ảnh câu hỏi
            {questionCode && (
              <span className="ml-2 font-mono text-blue-600">• {questionCode}</span>
            )}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileImage className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số hình ảnh</p>
                  <p className="text-xl font-bold">{statistics.totalImages.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <RefreshCw className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang xử lý</p>
                  <p className="text-xl font-bold">{statistics.pendingUploads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lỗi upload</p>
                  <p className="text-xl font-bold">{statistics.failedUploads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Bộ lọc nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Search and Sort */}
      <Card>
        <CardContent className="py-4">
          <SearchAndSort
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <BulkOperationsBar
        selectedCount={selectedImages.length}
        totalCount={100} // Mock total count
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={handleBulkDelete}
        onBulkOptimize={handleBulkOptimize}
      />

      {/* Main Gallery */}
      <ImageGallery
        questionId={questionId}
        questionCode={questionCode}
        filters={filters}
        multiSelect={true}
        selectedImages={selectedImages}
        onSelectionChange={setSelectedImages}
        className="min-h-[600px]"
      />

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Mẹo sử dụng:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Sử dụng Ctrl/Cmd + Click để chọn nhiều hình ảnh</li>
                <li>• Kéo thả để upload hình ảnh mới trực tiếp vào gallery</li>
                <li>• Sử dụng bộ lọc nhanh để tìm kiếm theo loại và trạng thái</li>
                <li>• Tất cả hình ảnh được tự động tối ưu hóa bằng Cloudinary CDN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

