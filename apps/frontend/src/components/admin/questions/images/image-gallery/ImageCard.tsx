/**
 * Image Card Component
 * Individual image card cho gallery với actions và metadata
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/form/button';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import { ImageCardProps } from '../types';
import { ImageType, ImageStatus, QuestionImage } from '@/lib/mockdata/shared/core-types';
import { formatFileSize } from '../image-upload/FileValidator';
import { 
  Eye, 
  Download, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  FileImage,
  Calendar
} from 'lucide-react';

// ===== HELPER FUNCTIONS =====

/**
 * Get image URL for display
 */
function getImageUrl(image: QuestionImage): string {
  // Priority: driveUrl (Cloudinary) > imagePath > fallback
  if (image.driveUrl) {
    // Cloudinary URLs are already direct image URLs
    // Format: https://res.cloudinary.com/cloud_name/image/upload/...
    if (image.driveUrl.includes('res.cloudinary.com')) {
      return image.driveUrl;
    }
    
    // Fallback for legacy Google Drive URLs (if still present)
    const fileId = image.driveFileId || image.driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?id=${fileId}`;
    }
    return image.driveUrl;
  }
  
  if (image.imagePath) {
    return image.imagePath;
  }
  
  return '/images/placeholder-image.svg';
}

/**
 * Get status display info
 */
function getStatusInfo(status: ImageStatus) {
  switch (status) {
    case ImageStatus.UPLOADED:
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Uploaded',
      };
    case ImageStatus.UPLOADING:
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Uploading',
      };
    case ImageStatus.PENDING:
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Pending',
      };
    case ImageStatus.FAILED:
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Failed',
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Unknown',
      };
  }
}

/**
 * Get image type info
 */
function getImageTypeInfo(imageType: ImageType) {
  switch (imageType) {
    case ImageType.QUESTION:
      return {
        label: 'Q',
        fullLabel: 'Question',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    case ImageType.SOLUTION:
      return {
        label: 'S',
        fullLabel: 'Solution',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    default:
      return {
        label: '?',
        fullLabel: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Extract filename from path or URL
 */
function getFileName(image: QuestionImage): string {
  if (image.imagePath) {
    return image.imagePath.split('/').pop() || 'unknown';
  }
  if (image.driveUrl) {
    return `drive-${image.driveFileId || 'unknown'}.webp`;
  }
  return 'unknown';
}

// ===== MAIN COMPONENT =====

export function ImageCard({
  image,
  isSelected = false,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  showActions = true,
  className,
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = getImageUrl(image);
  const statusInfo = getStatusInfo(image.status);
  const typeInfo = getImageTypeInfo(image.imageType);
  const fileName = getFileName(image);
  const StatusIcon = statusInfo.icon;

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleSelect = (checked: boolean) => {
    if (onSelect) {
      onSelect(image.id);
    }

    // Log selection state for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image ${image.id} ${checked ? 'selected' : 'deselected'}`);
    }
  };

  return (
    <div
      className={cn(
        'group relative bg-white border-2 rounded-lg overflow-hidden transition-all duration-200',
        'hover:border-blue-300 hover:shadow-lg',
        isSelected && 'border-blue-500 shadow-md',
        className
      )}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelect}
            className="bg-white/90 border-gray-300"
          />
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {!imageError ? (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* Actual Image */}
            <Image
              src={imageUrl}
              alt={`${typeInfo.fullLabel} image`}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          /* Error State */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <FileImage className="h-12 w-12 mb-2" />
            <span className="text-xs">Lỗi tải ảnh</span>
          </div>
        )}

        {/* Overlay Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPreview}
                  className="bg-white/90 hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              {onDownload && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDownload}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="bg-red-600/90 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={cn('flex items-center gap-1', statusInfo.bgColor, statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            <span className="text-xs">{statusInfo.label}</span>
          </Badge>
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge className={cn('font-mono font-bold', typeInfo.bgColor, typeInfo.color)}>
            {typeInfo.label}
          </Badge>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 space-y-2">
        {/* File Name */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium truncate flex-1" title={fileName}>
            {fileName}
          </h3>
          
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(image.createdAt)}</span>
          </div>
          
          <span>{formatFileSize(Math.floor(Math.random() * 2000000) + 100000)}</span>
        </div>

        {/* Type Label */}
        <div className="text-xs text-gray-600">
          {typeInfo.fullLabel}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && showActions && (
        <div className="absolute top-full right-3 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[120px]">
          {onPreview && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                onPreview();
                setShowMenu(false);
              }}
            >
              <Eye className="h-3 w-3" />
              Xem
            </button>
          )}
          
          {onDownload && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                onDownload();
                setShowMenu(false);
              }}
            >
              <Download className="h-3 w-3" />
              Tải xuống
            </button>
          )}
          
          {onDelete && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
            >
              <Trash2 className="h-3 w-3" />
              Xóa
            </button>
          )}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

// ===== EXPORTS =====

export default ImageCard;
