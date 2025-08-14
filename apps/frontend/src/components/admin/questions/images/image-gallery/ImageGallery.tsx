/**
 * Image Gallery Component
 * Gallery grid layout với filtering, selection và bulk operations
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { cn } from '@/lib/utils';
import type { ImageGalleryProps, GalleryFilters } from '../types';
import { DEFAULT_GALLERY_FILTERS } from '../types';
import { QuestionImage, ImageType, ImageStatus } from '@/lib/mockdata/shared/core-types';
import GalleryFiltersComponent from './GalleryFilters';
import ImageCard from './ImageCard';
import { ImagePreviewModal } from '../image-preview';
import { 
  Images, 
  Grid3X3, 
  List, 
  Download, 
  Trash2, 
  CheckSquare,
  FileImage,
  Loader
} from 'lucide-react';

// ===== MOCK DATA SERVICE =====

class ImageGalleryService {
  static async fetchImages(
    questionId?: string,
    questionCode?: string,
    filters?: GalleryFilters
  ): Promise<QuestionImage[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock images
    const mockImages: QuestionImage[] = Array.from({ length: 12 }, (_, index) => ({
      id: `img-${index + 1}`,
      questionId: questionId || `q-${Math.floor(index / 3) + 1}`,
      imageType: index % 2 === 0 ? ImageType.QUESTION : ImageType.SOLUTION,
      imagePath: `/uploads/mock/image-${index + 1}.webp`,
      driveUrl: `https://drive.google.com/file/d/mock-${index + 1}/view`,
      driveFileId: `mock-${index + 1}`,
      status: [ImageStatus.UPLOADED, ImageStatus.UPLOADING, ImageStatus.PENDING, ImageStatus.FAILED][index % 4],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }));
    
    // Apply filters
    let filteredImages = mockImages;
    
    if (filters?.imageType) {
      filteredImages = filteredImages.filter(img => img.imageType === filters.imageType);
    }
    
    if (filters?.status) {
      filteredImages = filteredImages.filter(img => img.status === filters.status);
    }
    
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        (img.imagePath?.toLowerCase().includes(query)) ||
        img.id.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      filteredImages.sort((a, b) => {
        let aValue: number | string, bValue: number | string;
        
        switch (filters.sortBy) {
          case 'createdAt':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'updatedAt':
            aValue = a.updatedAt.getTime();
            bValue = b.updatedAt.getTime();
            break;
          case 'name':
            aValue = (a.imagePath || '').toLowerCase();
            bValue = (b.imagePath || '').toLowerCase();
            break;
          default:
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
        }
        
        const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return filters.sortDirection === 'desc' ? -result : result;
      });
    }
    
    return filteredImages;
  }
}

// ===== MAIN COMPONENT =====

export function ImageGallery({
  questionId,
  questionCode,
  filters: initialFilters,
  onImageSelect,
  multiSelect = false,
  selectedImages = [],
  onSelectionChange,
  className,
}: ImageGalleryProps) {
  const [images, setImages] = useState<QuestionImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GalleryFilters>(
    initialFilters || DEFAULT_GALLERY_FILTERS
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewImage, setPreviewImage] = useState<QuestionImage | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set(selectedImages)
  );

  // Load images when filters change
  React.useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await ImageGalleryService.fetchImages(
          questionId,
          questionCode,
          filters
        );
        setImages(fetchedImages);
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [questionId, questionCode, filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: GalleryFilters) => {
    setFilters(newFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters(DEFAULT_GALLERY_FILTERS);
  };

  // Handle image selection
  const handleImageSelect = (imageId: string) => {
    if (multiSelect) {
      const newSelected = new Set(selectedImageIds);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      setSelectedImageIds(newSelected);
      
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelected));
      }
    } else {
      if (onImageSelect) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          onImageSelect(image);
        }
      }
    }
  };

  // Handle image preview
  const handleImagePreview = (image: QuestionImage) => {
    setPreviewImage(image);
  };

  // Handle image download
  const handleImageDownload = (image: QuestionImage) => {
    // Mock download
    console.log('Downloading image:', image.id);
    // In real implementation, would trigger download from Google Drive
  };

  // Handle image delete
  const handleImageDelete = (image: QuestionImage) => {
    // Mock delete
    console.log('Deleting image:', image.id);
    setImages(prev => prev.filter(img => img.id !== image.id));
  };

  // Handle bulk operations
  const handleBulkDownload = () => {
    const selectedImages = images.filter(img => selectedImageIds.has(img.id));
    console.log('Bulk downloading:', selectedImages.length, 'images');
  };

  const handleBulkDelete = () => {
    console.log('Bulk deleting:', selectedImageIds.size, 'images');
    setImages(prev => prev.filter(img => !selectedImageIds.has(img.id)));
    setSelectedImageIds(new Set());
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedImageIds.size === images.length) {
      setSelectedImageIds(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } else {
      const allIds = new Set(images.map(img => img.id));
      setSelectedImageIds(allIds);
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIds));
      }
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                Thư viện hình ảnh
              </CardTitle>
              <CardDescription>
                {loading ? 'Đang tải...' : `${images.length} hình ảnh`}
                {questionCode && (
                  <span className="ml-2 font-mono">• {questionCode}</span>
                )}
              </CardDescription>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <GalleryFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {multiSelect && selectedImageIds.size > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Đã chọn {selectedImageIds.size} hình ảnh
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedImageIds.size === images.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Đang tải hình ảnh...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có hình ảnh nào
              </h3>
              <p className="text-gray-600 mb-4">
                Chưa có hình ảnh nào phù hợp với bộ lọc hiện tại.
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            /* Image Grid */
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1'
            )}>
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  isSelected={selectedImageIds.has(image.id)}
                  onSelect={multiSelect ? handleImageSelect : undefined}
                  onPreview={() => handleImagePreview(image)}
                  onDownload={() => handleImageDownload(image)}
                  onDelete={() => handleImageDelete(image)}
                  showActions={true}
                  className={viewMode === 'list' ? 'flex-row' : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={() => handleImageDownload(previewImage)}
          onDelete={() => {
            handleImageDelete(previewImage);
            setPreviewImage(null);
          }}
        />
      )}
    </div>
  );
}

// ===== EXPORTS =====

export default ImageGallery;
