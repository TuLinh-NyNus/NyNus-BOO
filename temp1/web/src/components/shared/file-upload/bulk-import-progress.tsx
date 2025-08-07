'use client';

import { CheckCircle, XCircle, Clock, Upload } from 'lucide-react';
import React from 'react';

import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { ImportProgress } from '@/lib/bulk-import-optimizer';

interface BulkImportProgressProps {
  progress: ImportProgress;
  isVisible: boolean;
}

export function BulkImportProgress({ progress, isVisible }: BulkImportProgressProps): JSX.Element | null {
  if (!isVisible) return null;

  const progressPercentage = progress.totalQuestions > 0 
    ? Math.round((progress.processedQuestions / progress.totalQuestions) * 100)
    : 0;

  const batchProgressPercentage = progress.totalBatches > 0
    ? Math.round((progress.currentBatch / progress.totalBatches) * 100)
    : 0;

  const getStatusIcon = (): JSX.Element => {
    switch (progress.status) {
      case 'parsing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'uploading':
        return <Upload className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (): string => {
    switch (progress.status) {
      case 'parsing':
        return 'bg-blue-500';
      case 'uploading':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'parsing':
        return 'Đang phân tích file...';
      case 'uploading':
        return 'Đang upload câu hỏi...';
      case 'completed':
        return 'Hoàn thành!';
      case 'error':
        return 'Có lỗi xảy ra';
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span>Tiến trình import câu hỏi</span>
          <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tổng quan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress.totalQuestions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Tổng câu hỏi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.successCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Thành công</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {progress.errorCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Lỗi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {progress.processedQuestions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Đã xử lý</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {/* Tiến trình tổng thể */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Tiến trình tổng thể</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {progress.processedQuestions.toLocaleString()} / {progress.totalQuestions.toLocaleString()} câu hỏi
            </div>
          </div>

          {/* Tiến trình batch */}
          {progress.totalBatches > 1 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tiến trình batch</span>
                <span>{batchProgressPercentage}%</span>
              </div>
              <Progress 
                value={batchProgressPercentage} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                Batch {progress.currentBatch} / {progress.totalBatches}
              </div>
            </div>
          )}
        </div>

        {/* Thông báo hiện tại */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">
            {progress.message}
          </div>
        </div>

        {/* Thống kê chi tiết */}
        {progress.status === 'uploading' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">Tỷ lệ thành công</div>
              <div className="text-green-600">
                {progress.totalQuestions > 0 
                  ? Math.round((progress.successCount / progress.processedQuestions) * 100) || 0
                  : 0}%
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-medium text-red-800">Tỷ lệ lỗi</div>
              <div className="text-red-600">
                {progress.totalQuestions > 0 
                  ? Math.round((progress.errorCount / progress.processedQuestions) * 100) || 0
                  : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Ước tính thời gian còn lại */}
        {progress.status === 'uploading' && progress.processedQuestions > 0 && (
          <div className="text-sm text-gray-600 text-center">
            <Clock className="h-4 w-4 inline mr-1" />
            Ước tính thời gian còn lại: {
              Math.ceil((progress.totalQuestions - progress.processedQuestions) / 100 * 2)
            } phút
          </div>
        )}

        {/* Kết quả cuối cùng */}
        {progress.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <CheckCircle className="h-5 w-5" />
              Import hoàn thành!
            </div>
            <div className="text-sm text-green-700">
              Đã import thành công {progress.successCount.toLocaleString()} / {progress.totalQuestions.toLocaleString()} câu hỏi
              {progress.errorCount > 0 && (
                <span className="text-red-600">
                  {' '}({progress.errorCount} lỗi)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lỗi */}
        {progress.status === 'error' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <XCircle className="h-5 w-5" />
              Có lỗi xảy ra
            </div>
            <div className="text-sm text-red-700">
              {progress.message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BulkImportProgress;
