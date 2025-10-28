/**
 * Version Timeline Item Component
 * Single item trong version history timeline
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  GitBranch,
  Eye,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface QuestionVersion {
  id: string;
  versionNumber: number;
  questionId: string;
  content: string;
  structuredAnswers?: Record<string, unknown>;
  changedBy: string;
  changedByName?: string;
  changeReason?: string;
  changedAt: string;
  isCurrent?: boolean;
}

export interface VersionTimelineItemProps {
  /** Version data */
  version: QuestionVersion;
  /** Whether this is the current version */
  isCurrent?: boolean;
  /** Whether this is the first version */
  isFirst?: boolean;
  /** Whether this is the last version */
  isLast?: boolean;
  /** Callback when preview clicked */
  onPreview?: (version: QuestionVersion) => void;
  /** Callback when revert clicked */
  onRevert?: (version: QuestionVersion) => void;
  /** Callback when compare clicked */
  onCompare?: (version: QuestionVersion) => void;
  /** Whether revert is disabled */
  disableRevert?: boolean;
  /** Custom className */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Format timestamp to readable format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Vừa xong';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} phút trước`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} giờ trước`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ngày trước`;
  }
  
  // Format as date
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get change summary from content diff
 */
function getChangeSummary(version: QuestionVersion): string {
  if (version.changeReason) {
    return version.changeReason;
  }
  
  // Default summary
  return 'Cập nhật nội dung câu hỏi';
}

// ===== MAIN COMPONENT =====

/**
 * Version Timeline Item Component
 * Hiển thị một version trong timeline
 * 
 * @example
 * ```tsx
 * <VersionTimelineItem
 *   version={version}
 *   isCurrent={version.versionNumber === currentVersion}
 *   onPreview={handlePreview}
 *   onRevert={handleRevert}
 * />
 * ```
 */
export function VersionTimelineItem({
  version,
  isCurrent = false,
  isFirst = false,
  isLast = false,
  onPreview,
  onRevert,
  onCompare,
  disableRevert = false,
  className,
}: VersionTimelineItemProps) {
  const changeSummary = getChangeSummary(version);
  const relativeTime = formatTimestamp(version.changedAt);

  return (
    <div className={cn('relative flex gap-4 pb-8', className)}>
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 w-px h-full bg-border" />
      )}

      {/* Timeline Dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2',
            isCurrent
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background dark:bg-card'
          )}
        >
          {isCurrent ? (
            <GitBranch className="h-4 w-4" />
          ) : (
            <span className="text-xs font-medium">v{version.versionNumber}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'rounded-lg border p-4 transition-colors',
            'bg-card dark:bg-card',
            isCurrent && 'border-primary bg-primary/5 dark:bg-primary/10'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              {/* Version Info */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">
                  Version {version.versionNumber}
                </h4>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Hiện tại
                  </Badge>
                )}
                {isFirst && (
                  <Badge variant="outline" className="text-xs">
                    Phiên bản đầu
                  </Badge>
                )}
              </div>

              {/* Change Summary */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {changeSummary}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
            {/* Author */}
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{version.changedByName || 'Unknown'}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{relativeTime}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Preview */}
            {onPreview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPreview(version)}
                className="h-8 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Xem
              </Button>
            )}

            {/* Compare */}
            {onCompare && !isFirst && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompare(version)}
                className="h-8 text-xs"
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                So sánh
              </Button>
            )}

            {/* Revert */}
            {onRevert && !isCurrent && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onRevert(version)}
                disabled={disableRevert}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Khôi phục
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== EXPORTS =====
export default VersionTimelineItem;

