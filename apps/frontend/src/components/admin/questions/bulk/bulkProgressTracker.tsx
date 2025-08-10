/**
 * Bulk Progress Tracker Component
 * Hiển thị tiến trình thao tác hàng loạt
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Progress,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { 
  Loader2, 
  AlertTriangle 
} from "lucide-react";

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
 * Props for BulkProgressTracker component
 */
interface BulkProgressTrackerProps {
  progress: BulkProgress;
  getOperationDisplayName: (operation: string) => string;
}

/**
 * Bulk Progress Tracker Component
 * Specialized component cho progress tracking
 */
export function BulkProgressTracker({
  progress,
  getOperationDisplayName,
}: BulkProgressTrackerProps) {
  if (!progress.isRunning && progress.errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
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

      {/* Error Display */}
      {progress.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Có lỗi xảy ra:</div>
              <ul className="text-sm">
                {progress.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
