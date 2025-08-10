/**
 * Bulk Confirmation Dialogs Component
 * Dialogs xác nhận cho thao tác hàng loạt
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  CheckCircle,
  Clock,
  XCircle,
  Archive,
} from "lucide-react";

// Import types từ lib/types
import { QuestionStatus } from "@/lib/types/question";

/**
 * Props for BulkConfirmationDialogs component
 */
interface BulkConfirmationDialogsProps {
  selectedCount: number;
  showDeleteDialog: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
  showStatusDialog: boolean;
  onStatusDialogChange: (open: boolean) => void;
  newStatus: string;
  onStatusChange: (status: string) => void;
  onStatusConfirm: () => void;
}

/**
 * Bulk Confirmation Dialogs Component
 * Specialized dialogs cho bulk operations
 */
export function BulkConfirmationDialogs({
  selectedCount,
  showDeleteDialog,
  onDeleteDialogChange,
  onDeleteConfirm,
  showStatusDialog,
  onStatusDialogChange,
  newStatus,
  onStatusChange,
  onStatusConfirm,
}: BulkConfirmationDialogsProps) {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedCount} câu hỏi được chọn? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa {selectedCount} câu hỏi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={onStatusDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thay đổi trạng thái</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn muốn thay đổi trạng thái của {selectedCount} câu hỏi được chọn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái mới" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionStatus.ACTIVE}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Hoạt động
                  </div>
                </SelectItem>
                <SelectItem value={QuestionStatus.PENDING}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Chờ duyệt
                  </div>
                </SelectItem>
                <SelectItem value={QuestionStatus.INACTIVE}>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Tạm ngưng
                  </div>
                </SelectItem>
                <SelectItem value={QuestionStatus.ARCHIVED}>
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-gray-500" />
                    Lưu trữ
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onStatusConfirm}>
              Thay đổi trạng thái
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
