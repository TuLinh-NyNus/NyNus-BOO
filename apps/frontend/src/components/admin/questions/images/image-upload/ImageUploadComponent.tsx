/**
 * Image Upload Component
 * Main component cho image upload với integration tới Google Drive API
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
// Alert component replaced with Card for consistency
import { cn } from '@/lib/utils';
import { ImageUploadProps, UploadQueueItem, UploadStatus, DEFAULT_UPLOAD_CONFIG } from '../types';
import { QuestionImage, ImageType, ImageStatus } from '@/lib/mockdata/shared/core-types';
import DragDropZone from './DragDropZone';
import FileValidator, { validateFiles } from './FileValidator';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

// ===== MOCK API SERVICE =====

class ImageUploadService {
  static async uploadImage(file: File, questionId?: string, _questionCode?: string): Promise<QuestionImage> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate random failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Upload failed: Network error');
    }
    
    // Generate mock QuestionImage
    const mockImage: QuestionImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      questionId: questionId || `q-${Date.now()}`,
      imageType: file.name.toLowerCase().includes('solution') ? ImageType.SOLUTION : ImageType.QUESTION,
      imagePath: `/uploads/temp/${file.name}`,
      driveUrl: `https://drive.google.com/file/d/mock-${Date.now()}/view`,
      driveFileId: `mock-${Date.now()}`,
      status: ImageStatus.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return mockImage;
  }
}

// ===== MAIN COMPONENT =====

export function ImageUploadComponent({
  questionId,
  onUploadComplete,
  onUploadError,
  maxFiles = DEFAULT_UPLOAD_CONFIG.maxFiles,
  acceptedTypes = DEFAULT_UPLOAD_CONFIG.acceptedTypes,
  className,
}: Omit<ImageUploadProps, 'questionCode'>) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<QuestionImage[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Validate selected files
  const validationResults = validateFiles(selectedFiles);
  const validFiles = selectedFiles.filter((_, index) => validationResults[index].isValid);
  const hasValidFiles = validFiles.length > 0;

  // Handle file selection
  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setGlobalError(null);
  }, []);

  // Handle upload start
  const handleUploadStart = useCallback(async () => {
    if (!hasValidFiles || isUploading) return;

    setIsUploading(true);
    setGlobalError(null);
    setUploadResults([]);

    // Initialize upload queue
    const initialQueue: UploadQueueItem[] = validFiles.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: UploadStatus.PENDING,
      startTime: new Date(),
    }));

    setUploadQueue(initialQueue);

    // Process uploads sequentially
    const results: QuestionImage[] = [];
    
    for (let i = 0; i < initialQueue.length; i++) {
      const item = initialQueue[i];
      
      try {
        // Update status to uploading
        setUploadQueue(prev => prev.map(q => 
          q.id === item.id 
            ? { ...q, status: UploadStatus.UPLOADING, progress: 0 }
            : q
        ));

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadQueue(prev => prev.map(q => 
            q.id === item.id && q.progress < 90
              ? { ...q, progress: q.progress + 10 }
              : q
          ));
        }, 200);

        // Upload file
        const result = await ImageUploadService.uploadImage(item.file, questionId);
        
        clearInterval(progressInterval);
        
        // Update status to completed
        setUploadQueue(prev => prev.map(q => 
          q.id === item.id 
            ? { 
                ...q, 
                status: UploadStatus.COMPLETED, 
                progress: 100,
                endTime: new Date(),
                result 
              }
            : q
        ));

        results.push(result);

      } catch (error) {
        // Update status to failed
        setUploadQueue(prev => prev.map(q => 
          q.id === item.id 
            ? { 
                ...q, 
                status: UploadStatus.FAILED, 
                endTime: new Date(),
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : q
        ));

        if (onUploadError) {
          onUploadError(error instanceof Error ? error.message : 'Upload failed');
        }
      }
    }

    setIsUploading(false);
    setUploadResults(results);

    // Call completion callback
    if (results.length > 0 && onUploadComplete) {
      onUploadComplete(results);
    }

    // Clear selected files after successful upload
    if (results.length === validFiles.length) {
      setSelectedFiles([]);
    }
  }, [hasValidFiles, isUploading, validFiles, questionId, onUploadComplete, onUploadError]);

  // Handle retry upload
  const handleRetryUpload = useCallback((itemId: string) => {
    // Find failed item and retry
    const failedItem = uploadQueue.find(item => item.id === itemId && item.status === UploadStatus.FAILED);
    if (failedItem) {
      // Reset status and retry
      setUploadQueue(prev => prev.map(q => 
        q.id === itemId 
          ? { ...q, status: UploadStatus.PENDING, error: undefined, progress: 0 }
          : q
      ));
      
      // Trigger single file upload (simplified for demo)
      console.log('Retrying upload for:', failedItem.file.name);
    }
  }, [uploadQueue]);

  // Handle clear completed
  const handleClearCompleted = useCallback(() => {
    setUploadQueue(prev => prev.filter(item => 
      item.status !== UploadStatus.COMPLETED && item.status !== UploadStatus.FAILED
    ));
    setUploadResults([]);
  }, []);

  // Calculate overall progress
  const overallProgress = uploadQueue.length > 0 
    ? uploadQueue.reduce((sum, item) => sum + item.progress, 0) / uploadQueue.length
    : 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Hình ảnh
        </CardTitle>
        <CardDescription>
          Upload hình ảnh cho câu hỏi. Files sẽ được tự động tổ chức theo cấu trúc MapCode.
          {questionId && (
            <span className="block mt-1 font-mono text-sm">
              Question ID: {questionId}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Drag Drop Zone */}
        <DragDropZone
          onFilesDropped={handleFilesSelected}
          onFilesSelected={handleFilesSelected}
          accept={acceptedTypes.join(',')}
          maxFiles={maxFiles}
          isUploading={isUploading}
        />

        {/* File Validation */}
        {selectedFiles.length > 0 && (
          <FileValidator
            files={selectedFiles}
            validationResults={validationResults}
            showDetails={true}
          />
        )}

        {/* Upload Controls */}
        {hasValidFiles && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {validFiles.length} file{validFiles.length > 1 ? 's' : ''} sẵn sàng upload
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUploadStart}
                disabled={!hasValidFiles || isUploading}
              >
                {isUploading ? 'Đang upload...' : 'Bắt đầu upload'}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadQueue.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Tiến trình upload</h4>
              <div className="text-sm text-gray-600">
                {Math.round(overallProgress)}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            {/* Upload Queue Items */}
            <div className="space-y-2">
              {uploadQueue.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {item.status === UploadStatus.COMPLETED && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {item.status === UploadStatus.FAILED && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {(item.status === UploadStatus.UPLOADING || item.status === UploadStatus.PENDING) && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.status === UploadStatus.COMPLETED && 'Upload thành công'}
                      {item.status === UploadStatus.FAILED && `Lỗi: ${item.error}`}
                      {item.status === UploadStatus.UPLOADING && `Đang upload... ${item.progress}%`}
                      {item.status === UploadStatus.PENDING && 'Đang chờ...'}
                    </div>
                  </div>

                  {item.status === UploadStatus.FAILED && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryUpload(item.id)}
                    >
                      Thử lại
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Clear Completed Button */}
            {uploadQueue.some(item => 
              item.status === UploadStatus.COMPLETED || item.status === UploadStatus.FAILED
            ) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompleted}
              >
                Xóa hoàn thành
              </Button>
            )}
          </div>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                Đã upload thành công {uploadResults.length} hình ảnh.
                Files đã được lưu vào Google Drive và sẵn sàng sử dụng.
              </span>
            </div>
          </div>
        )}

        {/* Global Error */}
        {globalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{globalError}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== EXPORTS =====

export default ImageUploadComponent;
