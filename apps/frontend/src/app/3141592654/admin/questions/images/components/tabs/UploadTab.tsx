/**
 * Upload Tab Component
 * Advanced upload management với batch operations và progress tracking
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileImage,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  Info,
  Zap,
  Cloud
} from 'lucide-react';

// Import existing upload component
import { ImageUploadComponent } from '@/components/admin/questions/images/image-upload';
import { QuestionImage } from '@/lib/mockdata/shared/core-types';

// ===== TYPES =====

interface UploadTabProps {
  questionId?: string;
  questionCode?: string;
  onUploadComplete?: () => void;
  className?: string;
}

interface BatchUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  progress: number;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

interface UploadStatistics {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalSize: number;
  uploadedSize: number;
  averageSpeed: number; // MB/s
  estimatedTimeRemaining: number; // seconds
}

// ===== UPLOAD QUEUE COMPONENT =====

function UploadQueueItem({ 
  item, 
  onRetry, 
  onPause, 
  onResume, 
  onRemove 
}: {
  item: BatchUploadItem;
  onRetry: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      case 'paused':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadTime = () => {
    if (!item.startTime) return '';
    if (item.status === 'completed' && item.endTime) {
      const duration = item.endTime.getTime() - item.startTime.getTime();
      return `${(duration / 1000).toFixed(1)}s`;
    }
    if (item.status === 'uploading') {
      const duration = Date.now() - item.startTime.getTime();
      return `${(duration / 1000).toFixed(1)}s`;
    }
    return '';
  };

  return (
    <div className={cn('p-4 rounded-lg border', getStatusColor())}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.file.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatFileSize(item.file.size)}</span>
              {getUploadTime() && (
                <>
                  <span>•</span>
                  <span>{getUploadTime()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={
            item.status === 'completed' ? 'default' :
            item.status === 'failed' ? 'destructive' :
            item.status === 'uploading' ? 'secondary' : 'outline'
          }>
            {item.status === 'pending' && 'Chờ xử lý'}
            {item.status === 'uploading' && 'Đang tải'}
            {item.status === 'completed' && 'Hoàn thành'}
            {item.status === 'failed' && 'Lỗi'}
            {item.status === 'paused' && 'Tạm dừng'}
          </Badge>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {item.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(item.id)}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            
            {item.status === 'uploading' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPause(item.id)}
              >
                <Pause className="h-3 w-3" />
              </Button>
            )}
            
            {item.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResume(item.id)}
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            
            {(item.status === 'pending' || item.status === 'failed' || item.status === 'completed') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {(item.status === 'uploading' || item.status === 'completed') && (
        <div className="space-y-1">
          <Progress value={item.progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{item.progress}%</span>
            {item.status === 'uploading' && (
              <span>Đang upload...</span>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {item.status === 'failed' && item.error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>{item.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== UPLOAD STATISTICS COMPONENT =====

function UploadStatistics({ stats }: { stats: UploadStatistics }) {
  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} MB/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{stats.completedFiles}</p>
        <p className="text-sm text-gray-600">Hoàn thành</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{stats.failedFiles}</p>
        <p className="text-sm text-gray-600">Lỗi</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{formatSpeed(stats.averageSpeed)}</p>
        <p className="text-sm text-gray-600">Tốc độ TB</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-600">{formatTime(stats.estimatedTimeRemaining)}</p>
        <p className="text-sm text-gray-600">Thời gian còn lại</p>
      </div>
    </div>
  );
}

// ===== MAIN UPLOAD TAB COMPONENT =====

export default function UploadTab({
  questionId,
  questionCode,
  onUploadComplete,
  className,
}: UploadTabProps) {
  const [uploadQueue, setUploadQueue] = useState<BatchUploadItem[]>([]);

  // Handle file selection from ImageUploadComponent
  const handleUploadComplete = useCallback((images: QuestionImage[]) => {
    console.log('Upload completed:', images.length, 'images');
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [onUploadComplete]);

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error);
  }, []);

  // Queue management functions
  const handleRetry = (id: string) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: 'pending', error: undefined }
        : item
    ));
  };

  const handlePause = (id: string) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: 'paused' }
        : item
    ));
  };

  const handleResume = (id: string) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: 'uploading' }
        : item
    ));
  };

  const handleRemove = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const handleClearFailed = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'failed'));
  };

  const handleRetryAll = () => {
    setUploadQueue(prev => prev.map(item => 
      item.status === 'failed'
        ? { ...item, status: 'pending', error: undefined }
        : item
    ));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upload hình ảnh</h3>
          <p className="text-sm text-gray-600">
            Upload và quản lý hình ảnh câu hỏi với Cloudinary CDN
            {questionCode && (
              <span className="ml-2 font-mono text-blue-600">• {questionCode}</span>
            )}
          </p>
        </div>
      </div>

      {/* Upload Statistics */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Thống kê upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UploadStatistics stats={{
              totalFiles: uploadQueue.length,
              completedFiles: uploadQueue.filter(item => item.status === 'completed').length,
              failedFiles: uploadQueue.filter(item => item.status === 'failed').length,
              totalSize: uploadQueue.reduce((sum, item) => sum + item.file.size, 0),
              uploadedSize: uploadQueue.reduce((sum, item) => sum + item.file.size, 0), // This will be updated as files complete
              averageSpeed: 0, // Placeholder, will be calculated
              estimatedTimeRemaining: 0, // Placeholder, will be calculated
            }} />
          </CardContent>
        </Card>
      )}

      {/* Main Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Tải lên hình ảnh mới
          </CardTitle>
          <CardDescription>
            Kéo thả hoặc chọn file để upload. Hỗ trợ PNG, JPG, WebP, SVG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploadComponent
            questionId={questionId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxFiles={20}
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-4 w-4" />
                Hàng đợi upload ({uploadQueue.length})
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryAll}
                  disabled={!uploadQueue.some(item => item.status === 'failed')}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Thử lại tất cả
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  disabled={!uploadQueue.some(item => item.status === 'completed')}
                >
                  Xóa hoàn thành
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFailed}
                  disabled={!uploadQueue.some(item => item.status === 'failed')}
                >
                  Xóa lỗi
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadQueue.map((item) => (
                <UploadQueueItem
                  key={item.id}
                  item={item}
                  onRetry={handleRetry}
                  onPause={handlePause}
                  onResume={handleResume}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cloudinary Features Info */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Cloud className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-2">Tính năng Cloudinary CDN:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Tự động tối ưu hóa WebP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Responsive image delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Global CDN distribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Automatic backup & versioning</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Hướng dẫn upload:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Kích thước tối đa: 10MB per file</li>
                <li>• Định dạng hỗ trợ: PNG, JPG, JPEG, WebP, SVG</li>
                <li>• Tên file nên chứa &quot;solution&quot; cho hình lời giải</li>
                <li>• Upload đồng thời tối đa 20 files</li>
                <li>• Hình ảnh sẽ được tự động tối ưu hóa và chuyển đổi WebP</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
