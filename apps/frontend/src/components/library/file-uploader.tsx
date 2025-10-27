'use client';

/**
 * Library File Uploader Component
 * Drag-drop, file picker, validation, progress tracking
 */

import { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
export interface FileUploadResult {
  fileUrl: string;
  fileId: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
}

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // bytes
  onUploadComplete?: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  uploadType?: 'book' | 'exam' | 'video' | 'image';
}

// Constants
const FILE_TYPE_CONFIG = {
  book: {
    accept: '.pdf,application/pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FileText,
    label: 'PDF sách/tài liệu',
  },
  exam: {
    accept: '.pdf,application/pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FileText,
    label: 'PDF đề thi',
  },
  video: {
    accept: 'video/*,.mp4,.avi,.mov',
    maxSize: 500 * 1024 * 1024, // 500MB
    icon: Video,
    label: 'Video bài giảng',
  },
  image: {
    accept: 'image/*,.jpg,.jpeg,.png,.gif,.webp',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: ImageIcon,
    label: 'Ảnh/hình minh họa',
  },
};

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate file
 */
function validateFile(file: File, maxSize: number, acceptedTypes: string): string | null {
  // Check file size
  if (file.size > maxSize) {
    return `File quá lớn. Kích thước tối đa: ${formatFileSize(maxSize)}`;
  }

  // Check file type
  const acceptList = acceptedTypes.split(',').map(t => t.trim().toLowerCase());
  const fileExt = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  const fileType = file.type.toLowerCase();

  const isValidType = acceptList.some(accept => {
    if (accept.startsWith('.')) {
      return fileExt === accept;
    }
    if (accept.endsWith('/*')) {
      const category = accept.split('/')[0];
      return fileType.startsWith(category + '/');
    }
    return fileType === accept;
  });

  if (!isValidType) {
    return `Định dạng file không được hỗ trợ. Chấp nhận: ${acceptedTypes}`;
  }

  return null;
}

/**
 * Simulate file upload (TODO: Replace with actual backend API)
 */
async function simulateUpload(file: File, onProgress: (progress: number) => void): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        clearInterval(interval);
        onProgress(100);
        
        // Simulate upload result
        setTimeout(() => {
          resolve({
            fileUrl: URL.createObjectURL(file),
            fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileType: file.type,
            fileSize: file.size,
            thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          });
        }, 500);
      } else {
        onProgress(progress);
      }
    }, 200);

    // Simulate error (5% chance)
    if (Math.random() < 0.05) {
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Upload failed. Please try again.'));
      }, 2000);
    }
  });
}

export function LibraryFileUploader({
  accept,
  maxSize,
  onUploadComplete,
  onUploadError,
  disabled,
  uploadType = 'book',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_TYPE_CONFIG[uploadType];
  const acceptTypes = accept || config.accept;
  const maxFileSize = maxSize || config.maxSize;
  const Icon = config.icon;

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    // Reset state
    setErrorMessage('');
    setUploadProgress(0);
    setUploadStatus('idle');

    // Validate file
    const validationError = validateFile(file, maxFileSize, acceptTypes);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStatus('error');
      if (onUploadError) {
        onUploadError(validationError);
      }
      return;
    }

    // Set selected file
    setSelectedFile(file);
    setUploadStatus('uploading');

    try {
      // TODO: Replace with actual backend API call
      const result = await simulateUpload(file, setUploadProgress);
      
      setUploadStatus('success');
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(errorMsg);
      setUploadStatus('error');
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    }
  }, [acceptTypes, maxFileSize, onUploadComplete, onUploadError]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploadStatus === 'uploading') return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, uploadStatus, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to select file
  const handleClick = () => {
    if (!disabled && uploadStatus !== 'uploading') {
      fileInputRef.current?.click();
    }
  };

  // Handle remove file
  const handleRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all',
          'cursor-pointer bg-muted/40 hover:bg-muted/60',
          isDragging && 'border-primary bg-primary/10 scale-[1.02]',
          disabled && 'cursor-not-allowed opacity-50',
          uploadStatus === 'uploading' && 'cursor-wait',
          uploadStatus === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950/20',
          uploadStatus === 'error' && 'border-destructive bg-destructive/10'
        )}
      >
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          {/* Icon */}
          {uploadStatus === 'uploading' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {uploadStatus === 'success' && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {uploadStatus === 'error' && (
            <AlertCircle className="h-12 w-12 text-destructive" />
          )}
          {uploadStatus === 'idle' && (
            <div className={cn(
              'rounded-full p-3 transition-colors',
              'bg-primary/10 text-primary',
              isDragging && 'bg-primary text-primary-foreground'
            )}>
              {isDragging ? <Upload className="h-8 w-8" /> : <Icon className="h-8 w-8" />}
            </div>
          )}

          {/* Text */}
          <div>
            {uploadStatus === 'idle' && (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {isDragging ? 'Thả file vào đây' : 'Kéo thả hoặc click để chọn file'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {config.label} • Tối đa {formatFileSize(maxFileSize)}
                </p>
              </>
            )}
            
            {uploadStatus === 'uploading' && selectedFile && (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Đang tải lên...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              </>
            )}

            {uploadStatus === 'success' && selectedFile && (
              <>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Tải lên thành công!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              </>
            )}

            {uploadStatus === 'error' && (
              <>
                <p className="text-sm font-semibold text-destructive">
                  Tải lên thất bại
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {errorMessage}
                </p>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="w-full max-w-xs">
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground text-center">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {/* Remove Button */}
          {(uploadStatus === 'success' || uploadStatus === 'error') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="mt-2"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa và chọn lại
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleInputChange}
        disabled={disabled || uploadStatus === 'uploading'}
        className="hidden"
      />

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Lưu ý:</span> Hỗ trợ {acceptTypes.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}. 
        Kích thước tối đa {formatFileSize(maxFileSize)}.
      </p>
    </div>
  );
}

export default LibraryFileUploader;

