/**
 * Bulk Action Buttons Component
 * Các nút thao tác hàng loạt
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Button,
} from "@/components/ui";
import {
  Settings,
  Trash2,
} from "lucide-react";

/**
 * Props for BulkActionButtons component
 */
interface BulkActionButtonsProps {
  selectedCount: number;
  canChangeStatus: boolean;
  canDelete: boolean;
  isRunning: boolean;
  onStatusChange: () => void;
  onDelete: () => void;
}

/**
 * Bulk Action Buttons Component
 * Specialized component cho action buttons
 */
export function BulkActionButtons({
  selectedCount,
  canChangeStatus,
  canDelete,
  isRunning,
  onStatusChange,
  onDelete,
}: BulkActionButtonsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Change */}
      {canChangeStatus && (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isRunning}
          onClick={onStatusChange}
        >
          <Settings className="h-4 w-4 mr-2" />
          Đổi trạng thái
        </Button>
      )}

      {/* Delete Action */}
      {canDelete && (
        <Button 
          variant="destructive" 
          size="sm" 
          disabled={isRunning}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </Button>
      )}
    </div>
  );
}
