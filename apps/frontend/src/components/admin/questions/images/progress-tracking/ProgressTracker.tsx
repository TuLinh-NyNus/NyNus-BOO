/**
 * Progress Tracker Component
 * Component theo dõi tiến trình upload real-time với queue management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { cn } from '@/lib/utils';
import { ProgressTrackerProps, UploadStatus } from '../types';
import StatusIndicator, { StatusSummary } from './StatusIndicator';
import { formatFileSize } from '../image-upload/FileValidator';
import { 
  BarChart3, 
  RefreshCw, 
  X, 
  Trash2, 
  CheckCircle, 
  Clock,
  FileImage,
  AlertCircle
} from 'lucide-react';

// ===== HELPER FUNCTIONS =====

/**
 * Calculate upload duration
 */
function calculateDuration(startTime: Date, endTime?: Date): string {
  const end = endTime || new Date();
  const durationMs = end.getTime() - startTime.getTime();
  const seconds = Math.floor(durationMs / 1000);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get estimated time remaining
 */
function getEstimatedTimeRemaining(
  completedItems: number,
  totalItems: number,
  averageDuration: number
): string {
  if (completedItems === 0) return 'Đang tính toán...';
  
  const remainingItems = totalItems - completedItems;
  const estimatedMs = remainingItems * averageDuration;
  const estimatedSeconds = Math.floor(estimatedMs / 1000);
  
  if (estimatedSeconds < 60) {
    return `~${estimatedSeconds}s`;
  }
  
  const minutes = Math.floor(estimatedSeconds / 60);
  return `~${minutes}m`;
}

// ===== MAIN COMPONENT =====

export function ProgressTracker({
  uploadQueue,
  overallProgress,
  showDetails = true,
  onRetry,
  onCancel,
  onClearCompleted,
  className,
}: ProgressTrackerProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = uploadQueue.length;
    const completed = uploadQueue.filter(item => item.status === UploadStatus.COMPLETED).length;
    const failed = uploadQueue.filter(item => item.status === UploadStatus.FAILED).length;
    const active = uploadQueue.filter(item => 
      item.status === UploadStatus.UPLOADING || 
      item.status === UploadStatus.PROCESSING
    ).length;
    const pending = uploadQueue.filter(item => item.status === UploadStatus.PENDING).length;
    
    // Calculate average duration for completed items
    const completedItems = uploadQueue.filter(item => 
      item.status === UploadStatus.COMPLETED && item.endTime
    );
    const averageDuration = completedItems.length > 0
      ? completedItems.reduce((sum, item) => {
          const duration = item.endTime!.getTime() - item.startTime.getTime();
          return sum + duration;
        }, 0) / completedItems.length
      : 0;
    
    // Calculate total file size
    const totalSize = uploadQueue.reduce((sum, item) => sum + item.file.size, 0);
    const completedSize = uploadQueue
      .filter(item => item.status === UploadStatus.COMPLETED)
      .reduce((sum, item) => sum + item.file.size, 0);
    
    return {
      total,
      completed,
      failed,
      active,
      pending,
      averageDuration,
      totalSize,
      completedSize,
      successRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [uploadQueue]);

  if (uploadQueue.length === 0) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tiến trình Upload
            </CardTitle>
            <CardDescription>
              {stats.completed}/{stats.total} files hoàn thành
              {stats.averageDuration > 0 && stats.active > 0 && (
                <span className="ml-2">
                  • ETA: {getEstimatedTimeRemaining(stats.completed, stats.total, stats.averageDuration)}
                </span>
              )}
            </CardDescription>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onClearCompleted && (stats.completed > 0 || stats.failed > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa hoàn thành
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Tổng tiến trình</span>
            <span className="font-mono">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Status Summary */}
        <StatusSummary 
          statuses={uploadQueue.map(item => item.status)}
        />

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Tổng files</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">{stats.completed}</div>
            <div className="text-green-600">Hoàn thành</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">{stats.active}</div>
            <div className="text-blue-600">Đang xử lý</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-700">{stats.failed}</div>
            <div className="text-red-600">Thất bại</div>
          </div>
        </div>

        {/* File Size Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Dung lượng đã upload</span>
            <span>{formatFileSize(stats.completedSize)} / {formatFileSize(stats.totalSize)}</span>
          </div>
          <Progress 
            value={stats.totalSize > 0 ? (stats.completedSize / stats.totalSize) * 100 : 0} 
            className="h-1.5" 
          />
        </div>

        {/* Detailed Queue Items */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Chi tiết files</h4>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg transition-colors',
                    item.status === UploadStatus.COMPLETED && 'bg-green-50 border-green-200',
                    item.status === UploadStatus.FAILED && 'bg-red-50 border-red-200',
                    (item.status === UploadStatus.UPLOADING || item.status === UploadStatus.PROCESSING) && 'bg-blue-50 border-blue-200'
                  )}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <FileImage className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {item.file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>
                    
                    {/* Status and Progress */}
                    <StatusIndicator
                      status={item.status}
                      progress={item.progress}
                      error={item.error}
                      size="sm"
                    />
                    
                    {/* Duration */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {calculateDuration(item.startTime, item.endTime)}
                      </span>
                      {item.status === UploadStatus.COMPLETED && item.result && (
                        <>
                          <span>•</span>
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Đã lưu vào Drive</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {item.status === UploadStatus.FAILED && onRetry && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetry(item.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {(item.status === UploadStatus.PENDING || 
                      item.status === UploadStatus.UPLOADING) && onCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancel(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Rate */}
        {stats.total > 0 && (stats.completed > 0 || stats.failed > 0) && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span>Tỷ lệ thành công:</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-medium',
                stats.successRate >= 90 ? 'text-green-600' : 
                stats.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {stats.successRate.toFixed(1)}%
              </span>
              {stats.successRate >= 90 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== EXPORTS =====

export default ProgressTracker;
