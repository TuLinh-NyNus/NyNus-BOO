/**
 * Image Metadata Component
 * Hiển thị metadata chi tiết của image
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/display/badge';
import { Separator } from '@/components/ui/display/separator';
import { cn } from '@/lib/utils';
import { ImageMetadataProps } from '../types';
import { ImageType, ImageStatus, QuestionImage } from '@/lib/mockdata/shared/core-types';
import { formatFileSize } from '../image-upload/FileValidator';
import { 
  Calendar, 
  FileImage, 
  Link, 
  Database, 
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle
} from 'lucide-react';

// ===== HELPER FUNCTIONS =====

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get status display info
 */
function getStatusInfo(status: ImageStatus) {
  switch (status) {
    case ImageStatus.UPLOADED:
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Đã upload',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case ImageStatus.UPLOADING:
      return {
        icon: <Loader className="h-4 w-4 animate-spin" />,
        label: 'Đang upload',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    case ImageStatus.PENDING:
      return {
        icon: <Clock className="h-4 w-4" />,
        label: 'Chờ xử lý',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      };
    case ImageStatus.FAILED:
      return {
        icon: <XCircle className="h-4 w-4" />,
        label: 'Upload thất bại',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    default:
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Không xác định',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
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
        label: 'Hình ảnh câu hỏi',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
    case ImageType.SOLUTION:
      return {
        label: 'Hình ảnh lời giải',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    default:
      return {
        label: 'Loại không xác định',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
  }
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

/**
 * Estimate file size (mock for demo)
 */
function getEstimatedFileSize(): string {
  // Mock file size between 100KB - 2MB
  const sizeBytes = Math.floor(Math.random() * (2 * 1024 * 1024 - 100 * 1024)) + 100 * 1024;
  return formatFileSize(sizeBytes);
}

// ===== MAIN COMPONENT =====

export function ImageMetadata({
  image,
  layout = 'vertical',
  showDetails = true,
  className,
}: ImageMetadataProps) {
  const statusInfo = getStatusInfo(image.status);
  const typeInfo = getImageTypeInfo(image.imageType);
  const fileName = getFileName(image);
  const estimatedSize = getEstimatedFileSize();

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-4 p-3 bg-gray-50 rounded-lg', className)}>
        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileImage className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium truncate">{fileName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{estimatedSize}</span>
            <span>•</span>
            <span>{formatDate(image.createdAt)}</span>
          </div>
        </div>

        {/* Status & Type */}
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs', typeInfo.bgColor, typeInfo.color)}>
            {typeInfo.label}
          </Badge>
          <Badge className={cn('text-xs flex items-center gap-1', statusInfo.bgColor, statusInfo.color)}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileImage className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Thông tin hình ảnh</h3>
      </div>

      {/* Basic Information */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Loại hình ảnh
            </label>
            <Badge className={cn('mt-1', typeInfo.bgColor, typeInfo.color)}>
              {typeInfo.label}
            </Badge>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Trạng thái
            </label>
            <Badge className={cn('mt-1 flex items-center gap-1 w-fit', statusInfo.bgColor, statusInfo.color)}>
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Tên file
          </label>
          <p className="text-sm font-mono mt-1 break-all">{fileName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Kích thước
            </label>
            <p className="text-sm mt-1">{estimatedSize}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Định dạng
            </label>
            <p className="text-sm mt-1">WebP</p>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          <Separator />

          {/* Detailed Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Chi tiết kỹ thuật</h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Tạo:</span>
                <span>{formatDate(image.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Cập nhật:</span>
                <span>{formatDate(image.updatedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{image.id}</span>
              </div>

              {image.questionId && (
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Câu hỏi:</span>
                  <span className="font-mono text-xs">{image.questionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Google Drive Information */}
          {(image.driveUrl || image.driveFileId) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Google Drive</h4>
                
                <div className="space-y-2 text-sm">
                  {image.driveFileId && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        File ID
                      </label>
                      <p className="font-mono text-xs mt-1 break-all">{image.driveFileId}</p>
                    </div>
                  )}

                  {image.driveUrl && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Drive URL
                      </label>
                      <a 
                        href={image.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs mt-1 block break-all"
                      >
                        {image.driveUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ===== COMPACT VARIANT =====

export function CompactImageMetadata({
  image,
  className,
}: {
  image: QuestionImage;
  className?: string;
}) {
  const statusInfo = getStatusInfo(image.status);
  const typeInfo = getImageTypeInfo(image.imageType);

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <Badge className={cn('px-1 py-0.5', typeInfo.bgColor, typeInfo.color)}>
        {image.imageType === ImageType.QUESTION ? 'Q' : 'S'}
      </Badge>
      <Badge className={cn('px-1 py-0.5 flex items-center gap-1', statusInfo.bgColor, statusInfo.color)}>
        {statusInfo.icon}
      </Badge>
      <span className="text-gray-500 truncate">
        {getFileName(image)}
      </span>
    </div>
  );
}

// ===== EXPORTS =====

export default ImageMetadata;
