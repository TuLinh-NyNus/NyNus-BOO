/**
 * File Validator Component
 * Validates files trước khi upload và hiển thị validation results
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/display/badge';
import { Card, CardContent } from '@/components/ui/display/card';
import { cn } from '@/lib/utils';
import { FileValidationResult, DEFAULT_UPLOAD_CONFIG } from '../types';
import { CheckCircle, XCircle, AlertTriangle, FileImage } from 'lucide-react';

// ===== INTERFACES =====

export interface FileValidatorProps {
  /** Files để validate */
  files: File[];
  /** Validation results */
  validationResults: FileValidationResult[];
  /** Show detailed validation info */
  showDetails?: boolean;
  /** Custom className */
  className?: string;
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate single file
 */
export function validateFile(file: File): FileValidationResult {
  const config = DEFAULT_UPLOAD_CONFIG;
  
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      isValid: false,
      error: `File quá lớn. Tối đa ${formatFileSize(config.maxFileSize)}`,
      formattedSize: formatFileSize(file.size),
      fileType: file.type || 'unknown',
    };
  }
  
  // Check file type
  if (!config.acceptedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${config.acceptedTypes.join(', ')}`,
      formattedSize: formatFileSize(file.size),
      fileType: file.type || 'unknown',
    };
  }
  
  // Check file name
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: 'Tên file quá dài (tối đa 255 ký tự)',
      formattedSize: formatFileSize(file.size),
      fileType: file.type,
    };
  }
  
  // File is valid
  return {
    isValid: true,
    formattedSize: formatFileSize(file.size),
    fileType: file.type,
  };
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): FileValidationResult[] {
  const config = DEFAULT_UPLOAD_CONFIG;
  
  // Check total files count
  if (files.length > config.maxFiles) {
    return files.map((file, index) => ({
      isValid: index < config.maxFiles,
      error: index >= config.maxFiles ? `Vượt quá giới hạn ${config.maxFiles} files` : undefined,
      formattedSize: formatFileSize(file.size),
      fileType: file.type || 'unknown',
    }));
  }
  
  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = config.maxFileSize * config.maxFiles;
  
  if (totalSize > maxTotalSize) {
    return files.map(file => ({
      isValid: false,
      error: `Tổng dung lượng vượt quá ${formatFileSize(maxTotalSize)}`,
      formattedSize: formatFileSize(file.size),
      fileType: file.type || 'unknown',
    }));
  }
  
  // Check duplicate names
  const fileNames = files.map(f => f.name.toLowerCase());
  const duplicateNames = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  
  // Validate each file individually
  return files.map(file => {
    const individualResult = validateFile(file);
    
    // Check for duplicate names
    if (duplicateNames.includes(file.name.toLowerCase())) {
      return {
        ...individualResult,
        isValid: false,
        error: 'Tên file bị trùng lặp',
      };
    }
    
    return individualResult;
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon
 */
function getFileTypeIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <FileImage className="h-4 w-4" />;
  }
  return <FileImage className="h-4 w-4" />;
}

/**
 * Get validation status icon
 */
function getValidationIcon(isValid: boolean, hasError: boolean) {
  if (isValid) {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  }
  if (hasError) {
    return <XCircle className="h-4 w-4 text-red-600" />;
  }
  return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
}

// ===== MAIN COMPONENT =====

export function FileValidator({
  files,
  validationResults,
  showDetails = true,
  className,
}: FileValidatorProps) {
  const validFiles = validationResults.filter(result => result.isValid);
  const invalidFiles = validationResults.filter(result => !result.isValid);
  
  if (files.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {files.length} file{files.length > 1 ? 's' : ''} được chọn
          </span>
          {validFiles.length > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              {validFiles.length} hợp lệ
            </Badge>
          )}
          {invalidFiles.length > 0 && (
            <Badge variant="destructive">
              {invalidFiles.length} lỗi
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          Tổng: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
        </div>
      </div>
      
      {/* Error Summary */}
      {invalidFiles.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">
                {invalidFiles.length} file{invalidFiles.length > 1 ? 's' : ''} không hợp lệ.
                Vui lòng kiểm tra và sửa lỗi trước khi upload.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Detailed File List */}
      {showDetails && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const result = validationResults[index];
            
            return (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  result.isValid 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                )}
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileTypeIcon(result.fileType)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {result.fileType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {result.formattedSize}
                    </span>
                    {result.error && (
                      <span className="text-xs text-red-600">
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Validation Status */}
                <div className="flex-shrink-0">
                  {getValidationIcon(result.isValid, !!result.error)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Upload Guidelines */}
      {validFiles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {validFiles.length} file{validFiles.length > 1 ? 's' : ''} sẵn sàng upload.
                Files sẽ được tự động tổ chức theo cấu trúc MapCode.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== EXPORTS =====

export default FileValidator;
