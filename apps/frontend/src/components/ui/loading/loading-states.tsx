/**
 * Loading States Component
 * Centralized loading states cho toàn bộ application
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Loader2, Search, Database, Upload, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface LoadingStateProps {
  /** Loading variant */
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';
  /** Loading size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Loading message */
  message?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Additional CSS classes */
  className?: string;
}

export interface SpecializedLoadingProps {
  /** Loading message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ===== CONSTANTS =====

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

// ===== COMPONENTS =====

/**
 * Spinner Loading Component
 */
export function SpinnerLoading({ 
  size = 'md', 
  message, 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', SIZE_CLASSES[size])} />
      {message && (
        <span className={cn('text-muted-foreground', TEXT_SIZE_CLASSES[size])}>
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * Dots Loading Component
 */
export function DotsLoading({ 
  size = 'md', 
  message, 
  className = '' 
}: SpecializedLoadingProps) {
  const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <div className={cn('bg-primary rounded-full animate-bounce', dotSize)} 
             style={{ animationDelay: '0ms' }} />
        <div className={cn('bg-primary rounded-full animate-bounce', dotSize)} 
             style={{ animationDelay: '150ms' }} />
        <div className={cn('bg-primary rounded-full animate-bounce', dotSize)} 
             style={{ animationDelay: '300ms' }} />
      </div>
      {message && (
        <span className={cn('text-muted-foreground', TEXT_SIZE_CLASSES[size])}>
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * Pulse Loading Component
 */
export function PulseLoading({ 
  size = 'md', 
  message, 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('bg-primary rounded-full animate-pulse', SIZE_CLASSES[size])} />
      {message && (
        <span className={cn('text-muted-foreground animate-pulse', TEXT_SIZE_CLASSES[size])}>
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * Progress Loading Component
 */
export function ProgressLoading({ 
  progress = 0, 
  message, 
  size = 'md',
  className = '' 
}: SpecializedLoadingProps & { progress?: number }) {
  const height = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';
  
  return (
    <div className={cn('w-full space-y-2', className)}>
      {message && (
        <div className="flex items-center justify-between">
          <span className={cn('text-muted-foreground', TEXT_SIZE_CLASSES[size])}>
            {message}
          </span>
          <span className={cn('text-muted-foreground', TEXT_SIZE_CLASSES[size])}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', height)}>
        <div 
          className="bg-primary transition-all duration-300 ease-out h-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Main Loading State Component
 */
export function LoadingState({
  variant = 'spinner',
  size = 'md',
  message,
  showIcon = true,
  icon,
  progress = 0,
  className = ''
}: LoadingStateProps) {
  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoading size={size} message={message} />;
        
      case 'pulse':
        return <PulseLoading size={size} message={message} />;
        
      case 'progress':
        return <ProgressLoading progress={progress} message={message} size={size} />;
        
      case 'spinner':
      default:
        return (
          <div className="flex items-center gap-2">
            {showIcon && (
              icon || <Loader2 className={cn('animate-spin', SIZE_CLASSES[size])} />
            )}
            {message && (
              <span className={cn('text-muted-foreground', TEXT_SIZE_CLASSES[size])}>
                {message}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className={cn('loading-state', className)}>
      {renderLoading()}
    </div>
  );
}

// ===== SPECIALIZED LOADING COMPONENTS =====

/**
 * Search Loading Component
 */
export function SearchLoading({ 
  message = 'Đang tìm kiếm...', 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <LoadingState
      variant="spinner"
      size="md"
      message={message}
      icon={<Search className="h-4 w-4 animate-pulse" />}
      className={cn('search-loading', className)}
    />
  );
}

/**
 * Data Loading Component
 */
export function DataLoading({ 
  message = 'Đang tải dữ liệu...', 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <LoadingState
      variant="spinner"
      size="md"
      message={message}
      icon={<Database className="h-4 w-4 animate-spin" />}
      className={cn('data-loading', className)}
    />
  );
}

/**
 * Content Loading Component
 */
export function ContentLoading({ 
  message = 'Đang tải nội dung...', 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <LoadingState
      variant="dots"
      size="md"
      message={message}
      className={cn('content-loading', className)}
    />
  );
}

/**
 * Upload Loading Component
 */
export function UploadLoading({ 
  progress = 0,
  message = 'Đang tải lên...', 
  className = '' 
}: SpecializedLoadingProps & { progress?: number }) {
  return (
    <div className={cn('upload-loading space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 animate-bounce" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      <ProgressLoading progress={progress} size="sm" />
    </div>
  );
}

/**
 * Download Loading Component
 */
export function DownloadLoading({ 
  progress = 0,
  message = 'Đang tải xuống...', 
  className = '' 
}: SpecializedLoadingProps & { progress?: number }) {
  return (
    <div className={cn('download-loading space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 animate-bounce" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      <ProgressLoading progress={progress} size="sm" />
    </div>
  );
}

/**
 * Page Loading Component
 */
export function PageLoading({ 
  message = 'Đang tải trang...', 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <div className={cn('page-loading flex items-center justify-center min-h-[200px]', className)}>
      <LoadingState
        variant="spinner"
        size="lg"
        message={message}
        className="flex-col gap-4"
      />
    </div>
  );
}

/**
 * Inline Loading Component
 */
export function InlineLoading({ 
  message, 
  size = 'sm',
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <LoadingState
      variant="spinner"
      size={size}
      message={message}
      className={cn('inline-loading inline-flex', className)}
    />
  );
}

/**
 * Full Screen Loading Component
 */
export function FullScreenLoading({ 
  message = 'Đang tải...', 
  className = '' 
}: SpecializedLoadingProps) {
  return (
    <div className={cn(
      'fullscreen-loading fixed inset-0 bg-background/80 backdrop-blur-sm',
      'flex items-center justify-center z-50',
      className
    )}>
      <LoadingState
        variant="spinner"
        size="xl"
        message={message}
        className="flex-col gap-4"
      />
    </div>
  );
}
