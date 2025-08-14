/**
 * Progress Tracker Component
 * Real-time progress tracking cho batch operations
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  FileText,
  CheckCircle,
  X,
  Download,
  Pause
} from 'lucide-react';

import type { BatchOperationProgress } from './services/batch-operations.service';
import type { BulkOperationResult } from '@/lib/types/admin/theory';

// ===== INTERFACES =====

interface ProgressTrackerProps {
  /** Progress data */
  progress: BatchOperationProgress | null;
  /** Operation result khi hoàn thành */
  result: BulkOperationResult | null;
  /** Có đang chạy operation */
  isRunning: boolean;
  /** Callback để cancel operation */
  onCancel?: () => void;
  /** Callback để pause operation */
  onPause?: () => void;
  /** Callback để resume operation */
  onResume?: () => void;
  /** Callback để download result */
  onDownload?: (result: BulkOperationResult) => void;
  /** Show detailed view */
  showDetails?: boolean;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format duration từ milliseconds
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format estimated time
 */
function formatEstimatedTime(date: Date | undefined): string {
  if (!date) return 'Calculating...';
  
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Almost done...';
  
  return formatDuration(diff);
}

/**
 * Get operation type display name
 */
function getOperationDisplayName(type: string): string {
  const names: Record<string, string> = {
    'parse_all': 'Parse All Files',
    'parse_grade': 'Parse Grade Files',
    'validate_syntax': 'Validate Syntax',
    'generate_backup': 'Generate Backup',
    'export_content': 'Export Content',
    'refresh_cache': 'Refresh Cache'
  };
  
  return names[type] || type;
}

// ===== MAIN COMPONENT =====

/**
 * Progress Tracker Component
 * Hiển thị real-time progress cho batch operations
 */
export function ProgressTracker({
  progress,
  result,
  isRunning,
  onCancel,
  onPause,
  onResume: _onResume,
  onDownload,
  showDetails = true
}: ProgressTrackerProps) {
  // Nếu không có progress và result, không hiển thị gì
  if (!progress && !result) {
    return null;
  }

  // Hiển thị result khi operation hoàn thành
  if (result && !isRunning) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Operation Completed
            </CardTitle>
            <Badge variant={result.errorCount > 0 ? "destructive" : "default"}>
              {getOperationDisplayName(result.operationType)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{result.skippedCount}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{result.totalFiles}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Duration và Output */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration: {formatDuration(result.duration)}
            </div>
            {result.outputPath && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Output: {result.outputPath}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {result.outputPath && onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(result)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Result
              </Button>
            )}
          </div>

          {/* Error Details */}
          {showDetails && result.errorFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 text-red-600">
                Errors ({result.errorFiles.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errorFiles.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded">
                    <div className="font-medium">{error.file}</div>
                    <div className="text-red-600">{error.error}</div>
                  </div>
                ))}
                {result.errorFiles.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    ... and {result.errorFiles.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Hiển thị progress khi operation đang chạy
  if (progress && isRunning) {
    const elapsed = Date.now() - progress.startTime.getTime();
    
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              Processing Files
            </CardTitle>
            <div className="flex items-center gap-2">
              {onPause && (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>

          {/* Current File */}
          <div className="text-sm">
            <div className="text-muted-foreground">Currently processing:</div>
            <div className="font-medium truncate">{progress.currentFile}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{progress.processedFiles}</div>
              <div className="text-xs text-muted-foreground">Processed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{progress.successCount}</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{progress.errorCount}</div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-lg font-bold">{progress.totalFiles}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Time Information */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Elapsed: {formatDuration(elapsed)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              ETA: {formatEstimatedTime(progress.estimatedEndTime)}
            </div>
          </div>

          {/* Speed Information */}
          {progress.processedFiles > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              Speed: {((progress.processedFiles / elapsed) * 1000 * 60).toFixed(1)} files/minute
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default ProgressTracker;
