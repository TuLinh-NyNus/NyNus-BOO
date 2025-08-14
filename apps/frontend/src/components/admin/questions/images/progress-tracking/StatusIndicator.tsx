/**
 * Status Indicator Component
 * Hiển thị status của upload với icons và progress
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import { StatusIndicatorProps, UploadStatus } from '../types';
import { 
  Clock, 
  Upload, 
  Loader, 
  CheckCircle, 
  XCircle, 
  StopCircle,
  AlertTriangle 
} from 'lucide-react';

// ===== SIZE CONFIGURATIONS =====

const SIZE_CONFIGS = {
  sm: {
    icon: 'h-3 w-3',
    badge: 'text-xs px-1.5 py-0.5',
    progress: 'h-1',
  },
  md: {
    icon: 'h-4 w-4',
    badge: 'text-sm px-2 py-1',
    progress: 'h-2',
  },
  lg: {
    icon: 'h-5 w-5',
    badge: 'text-base px-3 py-1.5',
    progress: 'h-3',
  },
} as const;

// ===== STATUS CONFIGURATIONS =====

const STATUS_CONFIGS = {
  [UploadStatus.PENDING]: {
    icon: Clock,
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    progressColor: 'bg-yellow-500',
  },
  [UploadStatus.UPLOADING]: {
    icon: Upload,
    label: 'Đang upload',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    progressColor: 'bg-blue-500',
  },
  [UploadStatus.PROCESSING]: {
    icon: Loader,
    label: 'Đang xử lý',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    progressColor: 'bg-purple-500',
  },
  [UploadStatus.COMPLETED]: {
    icon: CheckCircle,
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-800 border-green-200',
    progressColor: 'bg-green-500',
  },
  [UploadStatus.FAILED]: {
    icon: XCircle,
    label: 'Thất bại',
    color: 'bg-red-100 text-red-800 border-red-200',
    progressColor: 'bg-red-500',
  },
  [UploadStatus.CANCELLED]: {
    icon: StopCircle,
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    progressColor: 'bg-gray-500',
  },
} as const;

// ===== MAIN COMPONENT =====

export function StatusIndicator({
  status,
  progress = 0,
  error,
  size = 'md',
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const sizeConfig = SIZE_CONFIGS[size];
  const statusConfig = STATUS_CONFIGS[status];
  const IconComponent = statusConfig.icon;

  // Determine if icon should animate
  const shouldAnimate = status === UploadStatus.UPLOADING || status === UploadStatus.PROCESSING;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status Badge */}
      <Badge 
        className={cn(
          'flex items-center gap-1.5 border',
          sizeConfig.badge,
          statusConfig.color
        )}
      >
        <IconComponent 
          className={cn(
            sizeConfig.icon,
            shouldAnimate && 'animate-spin'
          )} 
        />
        {showLabel && (
          <span>{statusConfig.label}</span>
        )}
      </Badge>

      {/* Progress Bar (for uploading/processing status) */}
      {(status === UploadStatus.UPLOADING || status === UploadStatus.PROCESSING) && progress > 0 && (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn('flex-1 bg-gray-200 rounded-full overflow-hidden', sizeConfig.progress)}>
            <div 
              className={cn(
                'transition-all duration-300 rounded-full',
                sizeConfig.progress,
                statusConfig.progressColor
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 font-mono min-w-[3ch]">
            {Math.round(progress)}%
          </span>
        </div>
      )}

      {/* Error Message */}
      {status === UploadStatus.FAILED && error && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs truncate max-w-[200px]" title={error}>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

// ===== COMPACT VARIANT =====

export function CompactStatusIndicator({
  status,
  progress,
  size = 'sm',
  className,
}: {
  status: UploadStatus;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusIndicator
      status={status}
      progress={progress}
      size={size}
      showLabel={false}
      className={className}
    />
  );
}

// ===== STATUS SUMMARY COMPONENT =====

export function StatusSummary({
  statuses,
  className,
}: {
  statuses: UploadStatus[];
  className?: string;
}) {
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<UploadStatus, number>);

  const totalCount = statuses.length;
  const completedCount = statusCounts[UploadStatus.COMPLETED] || 0;
  const failedCount = statusCounts[UploadStatus.FAILED] || 0;
  const activeCount = (statusCounts[UploadStatus.UPLOADING] || 0) + 
                     (statusCounts[UploadStatus.PROCESSING] || 0);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <span className="text-gray-600">
        Tổng: {totalCount}
      </span>

      {completedCount > 0 && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>{completedCount}</span>
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Loader className="h-3 w-3 animate-spin" />
          <span>{activeCount}</span>
        </div>
      )}

      {failedCount > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="h-3 w-3" />
          <span>{failedCount}</span>
        </div>
      )}

      {/* Overall Progress */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${(completedCount / totalCount) * 100}%` 
              }}
            />
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {Math.round((completedCount / totalCount) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ===== EXPORTS =====

export default StatusIndicator;
