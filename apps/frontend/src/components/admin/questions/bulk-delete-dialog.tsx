/**
 * Bulk Delete Dialog Component
 * Confirmation dialog cho bulk delete operations
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface BulkDeleteDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Number of selected questions */
  selectedCount: number;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when confirm clicked */
  onConfirm: () => Promise<void>;
  /** Whether operation is in progress */
  isLoading?: boolean;
}

// ===== MAIN COMPONENT =====

/**
 * Bulk Delete Dialog Component
 * Confirmation dialog với warning
 * 
 * @example
 * ```tsx
 * <BulkDeleteDialog
 *   isOpen={showDialog}
 *   selectedCount={5}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleBulkDelete}
 * />
 * ```
 */
export function BulkDeleteDialog({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
  isLoading = false,
}: BulkDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-destructive/10 dark:bg-destructive/20'
            )}>
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Xác nhận xóa
              </AlertDialogTitle>
            </div>
          </div>
          
          <AlertDialogDescription className="text-left pt-4">
            Bạn đang chuẩn bị xóa{' '}
            <Badge variant="destructive" className="mx-1">
              {selectedCount}
            </Badge>
            câu hỏi.
            
            <div className={cn(
              'mt-4 p-3 rounded-md',
              'bg-destructive/5 border border-destructive/20',
              'dark:bg-destructive/10 dark:border-destructive/30'
            )}>
              <p className="text-sm font-medium text-destructive mb-2">
                ⚠️ Cảnh báo:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Hành động này không thể hoàn tác</li>
                <li>Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn</li>
                <li>Câu hỏi đã xóa không thể khôi phục</li>
              </ul>
            </div>

            <p className="mt-4 text-sm">
              Vui lòng xác nhận bạn muốn tiếp tục.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xác nhận xóa'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ===== EXPORTS =====
export default BulkDeleteDialog;

