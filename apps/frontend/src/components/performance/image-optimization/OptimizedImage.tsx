/**
 * Optimized Image Component
 * Next.js Image optimization cho question content với lazy loading và WebP support
 * Tối ưu performance và bandwidth cho images trong câu hỏi
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2, ImageOff } from 'lucide-react';

// ===== TYPES =====

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

export interface QuestionImageProps extends OptimizedImageProps {
  questionId?: string;
  imageType?: 'diagram' | 'chart' | 'photo' | 'illustration';
  maxWidth?: number;
  maxHeight?: number;
}

// ===== CONSTANTS =====

const DEFAULT_QUALITY = 85;
const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

// ===== OPTIMIZED IMAGE COMPONENT =====

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = DEFAULT_QUALITY,
  placeholder = 'empty',
  blurDataURL,
  sizes = DEFAULT_SIZES,
  fill = false,
  objectFit = 'contain',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Error fallback
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <ImageOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Không thể tải hình ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Optimized Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          objectFit: objectFit,
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

// ===== QUESTION IMAGE COMPONENT =====

export const QuestionImage: React.FC<QuestionImageProps> = ({
  src,
  alt,
  questionId,
  imageType = 'illustration',
  maxWidth = 800,
  maxHeight = 600,
  className = '',
  priority = false,
  ...props
}) => {
  // Generate optimized sizes based on image type
  const getOptimizedSizes = (type: string): string => {
    switch (type) {
      case 'diagram':
      case 'chart':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw';
      case 'photo':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw';
      default:
        return DEFAULT_SIZES;
    }
  };

  // Generate blur placeholder for better UX
  const generateBlurDataURL = (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create simple gradient blur placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  };

  const optimizedProps = {
    ...props,
    src,
    alt: alt || `Hình ảnh câu hỏi ${questionId || ''}`,
    sizes: getOptimizedSizes(imageType),
    priority,
    className: `max-w-full h-auto rounded-lg shadow-sm ${className}`,
    style: {
      maxWidth: `${maxWidth}px`,
      maxHeight: `${maxHeight}px`,
    },
  };

  // Add blur placeholder for non-priority images
  if (!priority && props.width && props.height) {
    optimizedProps.placeholder = 'blur';
    optimizedProps.blurDataURL = generateBlurDataURL(props.width, props.height);
  }

  return <OptimizedImage {...optimizedProps} />;
};

// ===== IMAGE GALLERY COMPONENT =====

export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  questionId?: string;
  className?: string;
}

export const QuestionImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  questionId,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className={className}>
        <QuestionImage
          src={images[0].src}
          alt={images[0].alt}
          questionId={questionId}
          priority={true}
        />
        {images[0].caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            {images[0].caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image */}
      <div className="relative">
        <QuestionImage
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          questionId={questionId}
          priority={selectedIndex === 0}
        />
        {images[selectedIndex].caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            {images[selectedIndex].caption}
          </p>
        )}
      </div>

      {/* Thumbnail navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              index === selectedIndex
                ? 'border-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <OptimizedImage
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              width={64}
              height={64}
              objectFit="cover"
              className="w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate responsive image sizes for different screen sizes
 */
export const generateResponsiveSizes = (
  mobile: number,
  tablet: number,
  desktop: number
): string => {
  return `(max-width: 768px) ${mobile}px, (max-width: 1200px) ${tablet}px, ${desktop}px`;
};

/**
 * Calculate optimal image dimensions based on container
 */
export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too wide
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Scale down if too tall
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Check if image format supports optimization
 */
export const supportsOptimization = (src: string): boolean => {
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  return supportedFormats.some(format => src.toLowerCase().includes(format));
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (baseSrc: string, widths: number[]): string => {
  return widths
    .map(width => `${baseSrc}?w=${width} ${width}w`)
    .join(', ');
};
