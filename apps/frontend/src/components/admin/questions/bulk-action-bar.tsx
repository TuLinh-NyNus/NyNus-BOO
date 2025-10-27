/**
 * Bulk Action Bar Component
 * Action bar hiển thị khi có questions được chọn
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
  Edit,
  Trash2,
  X,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items */
  totalCount: number;
  /** Callback when edit action clicked */
  onEdit?: () => void;
  /** Callback when delete action clicked */
  onDelete?: () => void;
  /** Callback when clear selection clicked */
  onClearSelection?: () => void;
  /** Whether actions are disabled (e.g., during operation) */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

// ===== MAIN COMPONENT =====

/**
 * Bulk Action Bar Component
 * Floating action bar cho bulk operations
 * 
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={5}
 *   totalCount={20}
 *   onEdit={() => setShowBulkEditModal(true)}
 *   onDelete={() => setShowBulkDeleteDialog(true)}
 *   onClearSelection={() => setSelectedIds([])}
 * />
 * ```
 */
export function BulkActionBar({
  selectedCount,
  totalCount,
  onEdit,
  onDelete,
  onClearSelection,
  disabled = false,
  className,
}: BulkActionBarProps) {
  // Don't render if no items selected
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4 px-6 py-4 rounded-lg shadow-lg',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90',
          'border border-border',
          'dark:bg-card/95 dark:border-border'
        )}
      >
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            Đã chọn{' '}
            <Badge variant="secondary" className="mx-1">
              {selectedCount}
            </Badge>
            {' '}/ {totalCount} câu hỏi
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa</span>
            </Button>
          )}

          {/* Clear Selection Button */}
          {onClearSelection && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={disabled}
              className="flex items-center gap-2"
              title="Bỏ chọn tất cả"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== EXPORTS =====
export default BulkActionBar;

