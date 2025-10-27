/**
 * Version Revert Dialog Component
 * Confirmation dialog cho version revert
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionVersion } from './version-timeline-item';

// ===== TYPES =====

export interface VersionRevertDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Version to revert to */
  version: QuestionVersion;
  /** Current version number */
  currentVersion: number;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when confirm clicked */
  onConfirm: (reason: string) => Promise<void>;
  /** Whether operation is in progress */
  isLoading?: boolean;
}

// ===== MAIN COMPONENT =====

/**
 * Version Revert Dialog Component
 * Confirmation dialog với reason input
 * 
 * @example
 * ```tsx
 * <VersionRevertDialog
 *   isOpen={showDialog}
 *   version={selectedVersion}
 *   currentVersion={5}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleRevert}
 * />
 * ```
 */
export function VersionRevertDialog({
  isOpen,
  version,
  currentVersion,
  onClose,
  onConfirm,
  isLoading = false,
}: VersionRevertDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    // Validate reason
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do khôi phục');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự');
      return;
    }

    setError('');
    await onConfirm(reason.trim());
    
    // Reset form
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-amber-100 dark:bg-amber-900/30'
            )}>
              <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Khôi phục phiên bản
              </AlertDialogTitle>
            </div>
          </div>
          
          <AlertDialogDescription className="text-left pt-4 space-y-4">
            <p>
              Bạn đang chuẩn bị khôi phục về{' '}
              <span className="font-semibold text-foreground">
                Version {version.versionNumber}
              </span>
              . Hành động này sẽ tạo một phiên bản mới (v{currentVersion + 1}) với nội dung từ phiên bản đã chọn.
            </p>

            <div className={cn(
              'p-3 rounded-md',
              'bg-amber-50 border border-amber-200',
              'dark:bg-amber-950/20 dark:border-amber-800/50'
            )}>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Lưu ý:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Phiên bản hiện tại sẽ được lưu trong lịch sử</li>
                <li>Bạn có thể khôi phục lại bất kỳ lúc nào</li>
                <li>Tất cả thay đổi đều được ghi nhận</li>
              </ul>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Lý do khôi phục <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="Ví dụ: Khôi phục nội dung đúng trước khi sửa lỗi..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                className={cn(
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Giải thích tại sao bạn khôi phục phiên bản này (tối thiểu 10 ký tự)
              </p>
            </div>

            {/* Version Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Từ phiên bản:</span>
                <span className="font-medium">v{currentVersion} (hiện tại)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khôi phục về:</span>
                <span className="font-medium">v{version.versionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sẽ tạo:</span>
                <span className="font-medium">v{currentVersion + 1} (mới)</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang khôi phục...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Khôi phục
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ===== EXPORTS =====
export default VersionRevertDialog;

