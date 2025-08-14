/**
 * Upload Queue Component
 * Component quản lý hàng đợi upload với batch operations
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Checkbox } from '@/components/ui/form/checkbox';
import { cn } from '@/lib/utils';
import { UploadQueueItem, UploadStatus } from '../types';
import StatusIndicator from './StatusIndicator';
import { formatFileSize } from '../image-upload/FileValidator';
import {
  List,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  FileImage
} from 'lucide-react';

// ===== INTERFACES =====

export interface UploadQueueProps {
  /** Upload queue items */
  queue: UploadQueueItem[];
  /** Is queue processing */
  isProcessing?: boolean;
  /** Start queue processing */
  onStartQueue?: () => void;
  /** Pause queue processing */
  onPauseQueue?: () => void;
  /** Retry specific item */
  onRetryItem?: (itemId: string) => void;
  /** Remove item from queue */
  onRemoveItem?: (itemId: string) => void;
  /** Retry multiple items */
  onRetryMultiple?: (itemIds: string[]) => void;
  /** Remove multiple items */
  onRemoveMultiple?: (itemIds: string[]) => void;
  /** Clear completed items */
  onClearCompleted?: () => void;
  /** Custom className */
  className?: string;
}

// ===== MAIN COMPONENT =====

export function UploadQueue({
  queue,
  isProcessing = false,
  onStartQueue,
  onPauseQueue,
  onRetryItem,
  onRemoveItem,
  onRetryMultiple,
  onRemoveMultiple,
  onClearCompleted,
  className,
}: UploadQueueProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Calculate queue statistics
  const stats = {
    total: queue.length,
    pending: queue.filter(item => item.status === UploadStatus.PENDING).length,
    uploading: queue.filter(item => item.status === UploadStatus.UPLOADING).length,
    processing: queue.filter(item => item.status === UploadStatus.PROCESSING).length,
    completed: queue.filter(item => item.status === UploadStatus.COMPLETED).length,
    failed: queue.filter(item => item.status === UploadStatus.FAILED).length,
    cancelled: queue.filter(item => item.status === UploadStatus.CANCELLED).length,
  };

  // Handle item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(queue.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle batch operations
  const handleBatchRetry = () => {
    if (onRetryMultiple && selectedItems.size > 0) {
      onRetryMultiple(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  const handleBatchRemove = () => {
    if (onRemoveMultiple && selectedItems.size > 0) {
      onRemoveMultiple(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  // Filter items for different sections
  const activeItems = queue.filter(item => 
    item.status === UploadStatus.PENDING || 
    item.status === UploadStatus.UPLOADING || 
    item.status === UploadStatus.PROCESSING
  );

  const completedItems = queue.filter(item => 
    item.status === UploadStatus.COMPLETED
  );

  const failedItems = queue.filter(item => 
    item.status === UploadStatus.FAILED || 
    item.status === UploadStatus.CANCELLED
  );

  if (queue.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="text-center py-8">
          <List className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Hàng đợi upload trống</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Hàng đợi Upload
            </CardTitle>
            <CardDescription>
              {stats.total} files • {stats.pending} chờ • {stats.uploading + stats.processing} đang xử lý
            </CardDescription>
          </div>

          {/* Queue Controls */}
          <div className="flex items-center gap-2">
            {!isProcessing && stats.pending > 0 && onStartQueue && (
              <Button
                variant="default"
                size="sm"
                onClick={onStartQueue}
              >
                <Play className="h-4 w-4 mr-1" />
                Bắt đầu
              </Button>
            )}

            {isProcessing && onPauseQueue && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPauseQueue}
              >
                <Pause className="h-4 w-4 mr-1" />
                Tạm dừng
              </Button>
            )}

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
        {/* Batch Operations */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              Đã chọn {selectedItems.size} items
            </span>
            <div className="flex items-center gap-2">
              {onRetryMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Thử lại
                </Button>
              )}
              {onRemoveMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchRemove}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Select All */}
        {queue.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selectedItems.size === queue.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-gray-600">Chọn tất cả</span>
          </div>
        )}

        {/* Active Items */}
        {activeItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-blue-700">
              Đang xử lý ({activeItems.length})
            </h4>
            {activeItems.map(item => (
              <QueueItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleItemSelect}
                onRetry={onRetryItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}

        {/* Failed Items */}
        {failedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-red-700">
              Thất bại ({failedItems.length})
            </h4>
            {failedItems.map(item => (
              <QueueItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleItemSelect}
                onRetry={onRetryItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-green-700">
              Hoàn thành ({completedItems.length})
            </h4>
            {completedItems.map(item => (
              <QueueItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleItemSelect}
                onRetry={onRetryItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== QUEUE ITEM COMPONENT =====

function QueueItem({
  item,
  isSelected,
  onSelect,
  onRetry,
  onRemove,
}: {
  item: UploadQueueItem;
  isSelected: boolean;
  onSelect: (itemId: string, checked: boolean) => void;
  onRetry?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 border rounded-lg transition-colors',
      isSelected && 'bg-blue-50 border-blue-300'
    )}>
      {/* Selection Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
      />

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
        
        <StatusIndicator
          status={item.status}
          progress={item.progress}
          error={item.error}
          size="sm"
        />
      </div>

      {/* Actions */}
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
        
        {onRemove && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== EXPORTS =====

export default UploadQueue;
