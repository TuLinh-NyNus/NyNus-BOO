/**
 * Bulk Operations Logic Hook
 * Logic xử lý các thao tác hàng loạt
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Import types từ lib/types

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
 * Hook for bulk operations logic
 */
export function useBulkOperationsLogic(
  selectedQuestions: string[],
  onOperationComplete?: () => void
) {
  const { toast } = useToast();
  
  // Progress state
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
   * Execute bulk operation with progress tracking
   */
  const executeBulkOperation = async (operation: string) => {
    const total = selectedQuestions.length;
    
    setProgress({
      isRunning: true,
      operation,
      current: 0,
      total,
      errors: [],
    });

    try {
      // Simulate bulk operation with progress
      for (let i = 0; i < total; i++) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setProgress(prev => ({
          ...prev,
          current: i + 1,
        }));
      }

      // Success
      toast({
        title: "Thành công",
        description: `Đã ${getOperationDisplayName(operation)} ${total} câu hỏi`,
      });

      onOperationComplete?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
      
      setProgress(prev => ({
        ...prev,
        errors: [...prev.errors, errorMessage],
      }));

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProgress(prev => ({
        ...prev,
        isRunning: false,
      }));
    }
  };

  /**
   * Handle bulk delete
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
    await executeBulkOperation("changeStatus");
  };

  /**
   * Handle bulk export
   */
  const handleBulkExport = async (format: string) => {
    await executeBulkOperation(`export-${format}`);
  };

  /**
   * Get operation display name
   */
  const getOperationDisplayName = (operation: string): string => {
    switch (operation) {
      case "delete":
        return "xóa";
      case "export-pdf":
      case "export-excel":
      case "export-json":
      case "export-print":
        return "xuất dữ liệu";
      case "changeStatus":
        return "thay đổi trạng thái";
      case "duplicate":
        return "sao chép";
      default:
        return operation;
    }
  };

  return {
    // State
    progress,
    showDeleteDialog,
    setShowDeleteDialog,
    showStatusDialog,
    setShowStatusDialog,
    newStatus,
    setNewStatus,

    // Actions
    executeBulkOperation,
    handleBulkDelete,
    handleBulkStatusChange,
    handleBulkExport,
    getOperationDisplayName,
  };
}
