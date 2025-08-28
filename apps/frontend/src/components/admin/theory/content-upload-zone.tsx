/**
 * Content Upload Zone Component
 * Component upload nội dung theory với drag & drop, validation và batch upload
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'validating' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
  metadata?: {
    subject?: string;
    grade?: string;
    chapter?: string;
    hasLatex?: boolean;
    latexCount?: number;
  };
}

export interface UploadStats {
  totalFiles: number;
  successFiles: number;
  errorFiles: number;
  totalSize: number;
  uploadedSize: number;
}

export interface ContentUploadZoneProps {
  /** Handler để upload files */
  onFileUpload: (files: File[]) => Promise<void>;
  
  /** Danh sách files đã upload */
  uploadedFiles: UploadFile[];
  
  /** Handler để remove file */
  onRemoveFile: (fileId: string) => void;
  
  /** Handler để retry upload file */
  onRetryFile: (fileId: string) => Promise<void>;
  
  /** Handler để preview file */
  onPreviewFile?: (fileId: string) => void;
  
  /** Loading state cho upload process */
  isUploading?: boolean;
  
  /** Maximum file size in MB */
  maxFileSize?: number;
  
  /** Accepted file types */
  acceptedTypes?: string[];
  
  /** Show upload statistics */
  showStats?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_FILE_SIZE = 10; // MB
const DEFAULT_ACCEPTED_TYPES = ['.md', '.markdown'];

// ===== MAIN COMPONENT =====

export function ContentUploadZone({
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  onRetryFile,
  onPreviewFile,
  isUploading = false,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  showStats = true,
  className
}: ContentUploadZoneProps) {
  
  // ===== STATE =====
  
  const [isDragOver, setIsDragOver] = useState(false);

  // ===== COMPUTED VALUES =====

  const uploadStats: UploadStats = {
    totalFiles: uploadedFiles.length,
    successFiles: uploadedFiles.filter(f => f.status === 'success').length,
    errorFiles: uploadedFiles.filter(f => f.status === 'error').length,
    totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0),
    uploadedSize: uploadedFiles.reduce((sum, f) => 
      f.status === 'success' ? sum + f.size : sum, 0
    )
  };

  // ===== HANDLERS =====

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = acceptedTypes.some(type =>
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      // Show validation error for invalid files
      console.warn('Some files were rejected due to type or size constraints');
    }

    if (validFiles.length > 0) {
      await onFileUpload(validFiles);
    }
  }, [acceptedTypes, maxFileSize, onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  }, [handleFileUpload]);



  // ===== RENDER HELPERS =====

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'validating':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    const variants = {
      pending: 'secondary',
      uploading: 'default',
      validating: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      pending: 'Pending',
      uploading: 'Uploading',
      validating: 'Validating',
      success: 'Success',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  // ===== RENDER =====

  return (
    <div className={cn("content-upload-zone space-y-4", className)}>
      {/* Upload Statistics */}
      {showStats && uploadedFiles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{uploadStats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">Total Files</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{uploadStats.successFiles}</div>
              <p className="text-xs text-muted-foreground">Success</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{uploadStats.errorFiles}</div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {uploadStats.totalFiles > 0 
                  ? Math.round((uploadStats.successFiles / uploadStats.totalFiles) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Theory Content
          </CardTitle>
          <CardDescription>
            Drag & drop hoặc click để chọn file Markdown (.md) chứa nội dung lý thuyết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
              ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {isDragOver ? 'Drop files here' : 'Upload theory content'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop files here, or click to select files
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Supports: {acceptedTypes.join(', ')} files</p>
              <p>Max size: {maxFileSize}MB per file</p>
            </div>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {isUploading && (
            <Alert className="mt-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Uploading and validating files... Please wait.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
            <CardDescription>
              Quản lý và xem trạng thái các file đã upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {getStatusIcon(file.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      {getStatusBadge(file.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.metadata?.subject && (
                        <Badge variant="outline" className="text-xs">
                          {file.metadata.subject}
                        </Badge>
                      )}
                      {file.metadata?.grade && (
                        <Badge variant="outline" className="text-xs">
                          {file.metadata.grade}
                        </Badge>
                      )}
                      {file.metadata?.hasLatex && (
                        <span className="text-xs">
                          {file.metadata.latexCount} LaTeX expressions
                        </span>
                      )}
                    </div>

                    {(file.status === 'uploading' || file.status === 'validating') && (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    )}

                    {file.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {file.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetryFile(file.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {file.status === 'success' && onPreviewFile && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onPreviewFile(file.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Upload Zone
 * Phiên bản compact cho sidebar
 */
export function CompactContentUploadZone(props: ContentUploadZoneProps) {
  return (
    <ContentUploadZone
      {...props}
      showStats={false}
      className={cn("compact-upload-zone", props.className)}
    />
  );
}
