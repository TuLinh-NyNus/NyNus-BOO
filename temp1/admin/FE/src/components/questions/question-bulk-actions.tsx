/**
 * Question Bulk Actions Component
 * Bulk operations cho question management với progress tracking
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Archive,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  FileDown,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Props for QuestionBulkActions component
 */
interface QuestionBulkActionsProps {
  selectedCount: number;
  onBulkOperation: (operation: string, questionIds: string[], options?: any) => Promise<void>;
  selectedQuestions: string[];
  canDelete?: boolean;
  canExport?: boolean;
  canChangeStatus?: boolean;
}

/**
 * Bulk operation progress state
 */
interface BulkProgress {
  isRunning: boolean;
  operation: string;
  current: number;
  total: number;
  errors: string[];
}

/**
 * Question Bulk Actions Component
 * Provides bulk operations với progress tracking và confirmation dialogs
 */
export function QuestionBulkActions({
  selectedCount,
  onBulkOperation,
  selectedQuestions,
  canDelete = false,
  canExport = true,
  canChangeStatus = false,
}: QuestionBulkActionsProps) {
  // Progress tracking state
  const [progress, setProgress] = useState<BulkProgress>({
    isRunning: false,
    operation: "",
    current: 0,
    total: 0,
    errors: [],
  });

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  /**
   * Execute bulk operation với progress tracking
   */
  const executeBulkOperation = async (operation: string, options?: any) => {
    try {
      setProgress({
        isRunning: true,
        operation,
        current: 0,
        total: selectedQuestions.length,
        errors: [],
      });

      // Simulate progress updates (in real implementation, this would come from API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => ({
          ...prev,
          current: Math.min(prev.current + 1, prev.total),
        }));
      }, 100);

      await onBulkOperation(operation, selectedQuestions, options);

      clearInterval(progressInterval);
      setProgress((prev) => ({ ...prev, current: prev.total, isRunning: false }));

      // Show success message
      toast.success(`Đã thực hiện ${operation} cho ${selectedCount} câu hỏi`);
    } catch (error) {
      console.error("Bulk operation error:", error);
      setProgress((prev) => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error instanceof Error ? error.message : "Unknown error"],
      }));
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    }
  };

  /**
   * Handle bulk delete với confirmation
   */
  const handleBulkDelete = async () => {
    setShowDeleteDialog(false);
    await executeBulkOperation("delete");
  };

  /**
   * Handle bulk status change
   */
  const handleBulkStatusChange = async () => {
    if (!newStatus) {
      toast.error("Vui lòng chọn trạng thái mới");
      return;
    }

    setShowStatusDialog(false);
    await executeBulkOperation("changeStatus", { status: newStatus });
    setNewStatus("");
  };

  /**
   * Handle bulk export
   */
  const handleBulkExport = async (format: string = "json") => {
    await executeBulkOperation("export", { format });
  };

  /**
   * Get operation display name
   */
  const getOperationDisplayName = (operation: string) => {
    switch (operation) {
      case "delete":
        return "xóa";
      case "export":
        return "xuất dữ liệu";
      case "changeStatus":
        return "thay đổi trạng thái";
      default:
        return operation;
    }
  };

  // Don't render if no questions selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="question-bulk-actions border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedCount} câu hỏi được chọn
            </Badge>

            {/* Progress Display */}
            {progress.isRunning && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Đang {getOperationDisplayName(progress.operation)}... ({progress.current}/
                  {progress.total})
                </span>
                <Progress value={(progress.current / progress.total) * 100} className="w-24 h-2" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Export Actions */}
            {canExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={progress.isRunning}>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất dữ liệu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkExport("json")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Xuất JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExport("csv")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Xuất CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExport("latex")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Xuất LaTeX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Status Change */}
            {canChangeStatus && (
              <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={progress.isRunning}>
                    <Settings className="h-4 w-4 mr-2" />
                    Đổi trạng thái
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thay đổi trạng thái câu hỏi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn muốn thay đổi trạng thái của {selectedCount} câu hỏi được chọn?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái mới" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Hoạt động
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Chờ duyệt
                          </div>
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Tạm ngưng
                          </div>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-gray-600" />
                            Lưu trữ
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkStatusChange}>Thay đổi</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete Action */}
            {canDelete && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={progress.isRunning}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa {selectedCount} câu hỏi được chọn? Hành động này
                      không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa {selectedCount} câu hỏi
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={progress.isRunning}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => executeBulkOperation("duplicate")}>
                  Sao chép câu hỏi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => executeBulkOperation("addToCollection")}>
                  Thêm vào bộ sưu tập
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => executeBulkOperation("analyze")}>
                  Phân tích thống kê
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error Display */}
        {progress.errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Có lỗi xảy ra:
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {progress.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Display */}
        {!progress.isRunning &&
          progress.current === progress.total &&
          progress.total > 0 &&
          progress.errors.length === 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Đã hoàn thành {getOperationDisplayName(progress.operation)} cho {progress.total} câu
                hỏi
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
