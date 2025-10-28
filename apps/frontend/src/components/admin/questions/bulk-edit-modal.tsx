/**
 * Bulk Edit Modal Component
 * Modal để chỉnh sửa nhiều câu hỏi cùng lúc
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
} from '@/components/ui';
import { Loader2, AlertCircle } from 'lucide-react';
import { QuestionStatus, QuestionDifficulty } from '@/types/question';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface BulkEditData {
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  addTags?: string[];
  removeTags?: string[];
}

export interface BulkEditModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Number of selected questions */
  selectedCount: number;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when save clicked */
  onSave: (data: BulkEditData) => Promise<void>;
  /** Whether operation is in progress */
  isLoading?: boolean;
}

// ===== CONSTANTS =====

const STATUS_OPTIONS = [
  { value: QuestionStatus.DRAFT, label: 'Nháp', color: 'bg-gray-500' },
  { value: QuestionStatus.PENDING, label: 'Chờ duyệt', color: 'bg-yellow-500' },
  { value: QuestionStatus.ACTIVE, label: 'Hoạt động', color: 'bg-green-500' },
  { value: QuestionStatus.INACTIVE, label: 'Không hoạt động', color: 'bg-red-500' },
  { value: QuestionStatus.ARCHIVED, label: 'Lưu trữ', color: 'bg-gray-400' },
];

const DIFFICULTY_OPTIONS = [
  { value: QuestionDifficulty.EASY, label: 'Dễ', color: 'bg-green-500' },
  { value: QuestionDifficulty.MEDIUM, label: 'Trung bình', color: 'bg-yellow-500' },
  { value: QuestionDifficulty.HARD, label: 'Khó', color: 'bg-red-500' },
];

// ===== MAIN COMPONENT =====

/**
 * Bulk Edit Modal Component
 * Modal để bulk edit questions
 * 
 * @example
 * ```tsx
 * <BulkEditModal
 *   isOpen={showModal}
 *   selectedCount={5}
 *   onClose={() => setShowModal(false)}
 *   onSave={handleBulkUpdate}
 * />
 * ```
 */
export function BulkEditModal({
  isOpen,
  selectedCount,
  onClose,
  onSave,
  isLoading = false,
}: BulkEditModalProps) {
  // ===== STATE =====
  const [status, setStatus] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // ===== HANDLERS =====
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setHasChanges(true);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    const editData: BulkEditData = {};
    
    if (status && status !== 'no-change') {
      editData.status = status as QuestionStatus;
    }
    
    if (difficulty && difficulty !== 'no-change') {
      editData.difficulty = difficulty as QuestionDifficulty;
    }

    await onSave(editData);
    
    // Reset form
    setStatus('');
    setDifficulty('');
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Reset form
    setStatus('');
    setDifficulty('');
    setHasChanges(false);
    onClose();
  };

  // ===== RENDER =====
  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chỉnh sửa hàng loạt
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho{' '}
            <Badge variant="secondary" className="mx-1">
              {selectedCount}
            </Badge>
            câu hỏi đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Alert */}
          <div className={cn(
            'flex items-start gap-2 p-3 rounded-md',
            'bg-amber-50 border border-amber-200',
            'dark:bg-amber-950/30 dark:border-amber-800'
          )}>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Các thay đổi sẽ được áp dụng cho tất cả câu hỏi đã chọn. 
              Chỉ các trường được chọn sẽ được cập nhật.
            </p>
          </div>

          <Separator />

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Không thay đổi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">
                  <span className="text-muted-foreground">Không thay đổi</span>
                </SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Trạng thái mới sẽ được áp dụng cho tất cả câu hỏi
            </p>
          </div>

          {/* Difficulty Field */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Độ khó</Label>
            <Select value={difficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Không thay đổi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">
                  <span className="text-muted-foreground">Không thay đổi</span>
                </SelectItem>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Độ khó mới sẽ được áp dụng cho tất cả câu hỏi
            </p>
          </div>

          {/* Future: Tags management would go here */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== EXPORTS =====
export default BulkEditModal;

