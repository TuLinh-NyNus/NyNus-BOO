/**
 * Image Thumbnail Component
 * Hiển thị thumbnail của image với metadata overlay
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import { ImageThumbnailProps } from '../types';
import { ImageType, ImageStatus, QuestionImage } from '@/lib/mockdata/shared/core-types';
import { Eye, Download, FileImage, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

// ===== SIZE CONFIGURATIONS =====

const SIZE_CONFIGS = {
  sm: {
    container: 'w-20 h-20',
    image: 'w-16 h-16',
    badge: 'text-xs px-1',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'w-32 h-32',
    image: 'w-28 h-28',
    badge: 'text-xs px-2',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'w-48 h-48',
    image: 'w-44 h-44',
    badge: 'text-sm px-2',
    icon: 'h-5 w-5',
  },
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Get status icon và color
 */
function getStatusDisplay(status: ImageStatus) {
  switch (status) {
    case ImageStatus.UPLOADED:
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        color: 'bg-green-100 text-green-800',
        label: 'Uploaded',
      };
    case ImageStatus.UPLOADING:
      return {
        icon: <Loader className="h-3 w-3 animate-spin" />,
        color: 'bg-blue-100 text-blue-800',
        label: 'Uploading',
      };
    case ImageStatus.PENDING:
      return {
        icon: <Clock className="h-3 w-3" />,
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending',
      };
    case ImageStatus.FAILED:
      return {
        icon: <XCircle className="h-3 w-3" />,
        color: 'bg-red-100 text-red-800',
        label: 'Failed',
      };
    default:
      return {
        icon: <Clock className="h-3 w-3" />,
        color: 'bg-gray-100 text-gray-800',
        label: 'Unknown',
      };
  }
}

/**
 * Get image type display
 */
function getImageTypeDisplay(imageType: ImageType) {
  switch (imageType) {
    case ImageType.QUESTION:
      return {
        label: 'Q',
        color: 'bg-blue-100 text-blue-800',
        fullLabel: 'Question',
      };
    case ImageType.SOLUTION:
      return {
        label: 'S',
        color: 'bg-green-100 text-green-800',
        fullLabel: 'Solution',
      };
    default:
      return {
        label: '?',
        color: 'bg-gray-100 text-gray-800',
        fullLabel: 'Unknown',
      };
  }
}

/**
 * Get image URL for display
 */
function getImageUrl(image: QuestionImage): string {
  // Priority: driveUrl > imagePath > fallback
  if (image.driveUrl) {
    // Convert Google Drive view URL to direct image URL
    const fileId = image.driveFileId || image.driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?id=${fileId}`;
    }
    return image.driveUrl;
  }
  
  if (image.imagePath) {
    return image.imagePath;
  }
  
  // Fallback placeholder
  return '/images/placeholder-image.png';
}

// ===== MAIN COMPONENT =====

export function ImageThumbnail({
  image,
  size = 'md',
  onClick,
  showMetadata = true,
  className,
}: ImageThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const sizeConfig = SIZE_CONFIGS[size];
  const statusDisplay = getStatusDisplay(image.status);
  const typeDisplay = getImageTypeDisplay(image.imageType);
  const imageUrl = getImageUrl(image);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border-2 border-gray-200',
        'hover:border-blue-300 hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer',
        sizeConfig.container,
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        {!imageError ? (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader className={cn(sizeConfig.icon, 'animate-spin text-gray-400')} />
              </div>
            )}
            
            {/* Actual Image */}
            <Image
              src={imageUrl}
              alt={`${typeDisplay.fullLabel} image`}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          /* Error State */
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FileImage className={sizeConfig.icon} />
            <span className="text-xs mt-1">Error</span>
          </div>
        )}

        {/* Hover Overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Eye className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Metadata Overlay */}
      {showMetadata && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top badges */}
          <div className="absolute top-1 left-1 flex gap-1">
            {/* Image Type Badge */}
            <Badge 
              className={cn(
                sizeConfig.badge,
                typeDisplay.color,
                'font-mono font-bold'
              )}
            >
              {typeDisplay.label}
            </Badge>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-1 right-1 flex gap-1">
            {/* Status Badge */}
            <Badge 
              className={cn(
                sizeConfig.badge,
                statusDisplay.color,
                'flex items-center gap-1'
              )}
            >
              {statusDisplay.icon}
              {size === 'lg' && (
                <span>{statusDisplay.label}</span>
              )}
            </Badge>
          </div>
        </div>
      )}

      {/* Upload Progress (for uploading status) */}
      {image.status === ImageStatus.UPLOADING && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: '60%' }} // Mock progress
          />
        </div>
      )}
    </div>
  );
}

// ===== GRID VARIANT =====

export function ImageThumbnailGrid({
  images,
  size = 'md',
  onImageClick,
  showMetadata = true,
  className,
}: {
  images: QuestionImage[];
  size?: 'sm' | 'md' | 'lg';
  onImageClick?: (image: QuestionImage) => void;
  showMetadata?: boolean;
  className?: string;
}) {
  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileImage className="h-12 w-12 mx-auto mb-2" />
        <p>Chưa có hình ảnh nào</p>
      </div>
    );
  }

  const gridCols = {
    sm: 'grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
    md: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    lg: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-3',
      gridCols[size],
      className
    )}>
      {images.map((image) => (
        <ImageThumbnail
          key={image.id}
          image={image}
          size={size}
          onClick={() => onImageClick?.(image)}
          showMetadata={showMetadata}
        />
      ))}
    </div>
  );
}

// ===== EXPORTS =====

export default ImageThumbnail;
