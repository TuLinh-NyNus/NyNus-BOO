/**
 * Question Bulk Actions Component
 * Thao tác hàng loạt (cập nhật trạng thái, xóa nhiều câu hỏi)
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
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/feedback/use-toast";

// Import types từ lib/types
import { QuestionStatus } from "@/types/question";

/**
 * Props for QuestionBulkActions component
 */
interface QuestionBulkActionsProps {
  selectedCount: number;
  onBulkOperation: (operation: string, questionIds: string[], options?: Record<string, unknown>) => Promise<void>;
  selectedQuestions: string[];
  canDelete?: boolean;
  canExport?: boolean;
  canChangeStatus?: boolean;
}

/**
 * Bulk operation progress state - trạng thái tiến trình thao tác hàng loạt
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
  const { toast } = useToast();

  // Progress tracking state - trạng thái theo dõi tiến trình
  const [progress, setProgress] = useState<BulkProgress>({
    isRunning: false,
    operation: "",
    current: 0,
    total: 0,
    errors: [],
  });

  // Dialog states - trạng thái các dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  /**
   * Execute bulk operation với progress tracking
   */
  const executeBulkOperation = async (operation: string, options?: Record<string, unknown>) => {
    try {
      setProgress({
        isRunning: true,
        operation,
        current: 0,
        total: selectedQuestions.length,
        errors: [],
      });

      // Simulate progress updates (trong thực tế sẽ nhận từ API)
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
      toast({
        title: "Thành công",
        description: `Đã thực hiện ${getOperationDisplayName(operation)} cho ${selectedCount} câu hỏi`,
        variant: "default",
      });
    } catch (error) {
      console.error("Bulk operation error:", error);
      setProgress((prev) => ({
        ...prev,
        isRunning: false,
        errors: [...prev.errors, error instanceof Error ? error.message : "Unknown error"],
      }));
      
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thực hiện thao tác",
        variant: "destructive",
      });
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
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn trạng thái mới",
        variant: "destructive",
      });
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
   * Get operation display name - lấy tên hiển thị của thao tác
   */
  const getOperationDisplayName = (operation: string) => {
    switch (operation) {
      case "delete":
        return "xóa";
      case "export":
        return "xuất dữ liệu";
      case "changeStatus":
        return "thay đổi trạng thái";
      case "duplicate":
        return "sao chép";
      case "addToCollection":
        return "thêm vào bộ sưu tập";
      case "analyze":
        return "phân tích";
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
          {/* Selection Info - thông tin lựa chọn */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedCount} câu hỏi được chọn
            </Badge>

            {/* Progress Display - hiển thị tiến trình */}
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

          {/* Action Buttons - các nút thao tác */}
          <div className="flex items-center gap-2">
            {/* Export Actions - thao tác xuất dữ liệu */}
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

            {/* Status Change - thay đổi trạng thái */}
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
                    <AlertDialogAction onClick={handleBulkStatusChange}>
                      Thay đổi trạng thái
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Delete Action - thao tác xóa */}
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

            {/* More Actions - thêm thao tác */}
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

        {/* Error Display - hiển thị lỗi */}
        {progress.errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Có lỗi xảy ra:</span>
            </div>
            <ul className="mt-2 text-sm text-red-700">
              {progress.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
