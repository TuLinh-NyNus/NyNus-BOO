/**
 * Admin Theory Upload Page
 * Trang upload nội dung lý thuyết với bulk upload, validation và preview
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  FolderOpen,
  Zap,
  Clock,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

// ===== TYPES =====

interface UploadFile {
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

interface UploadStats {
  totalFiles: number;
  successFiles: number;
  errorFiles: number;
  totalSize: number;
  uploadedSize: number;
}

// ===== MOCK DATA =====

const mockUploadedFiles: UploadFile[] = [
  {
    id: '1',
    name: 'bài-1-hàm-số.md',
    size: 15420,
    type: 'text/markdown',
    status: 'success',
    progress: 100,
    metadata: {
      subject: 'TOÁN',
      grade: 'LỚP-12',
      chapter: 'Hàm số',
      hasLatex: true,
      latexCount: 15
    }
  },
  {
    id: '2',
    name: 'bài-2-đạo-hàm.md',
    size: 22100,
    type: 'text/markdown',
    status: 'validating',
    progress: 75,
    metadata: {
      subject: 'TOÁN',
      grade: 'LỚP-12',
      chapter: 'Đạo hàm',
      hasLatex: true,
      latexCount: 28
    }
  },
  {
    id: '3',
    name: 'invalid-content.md',
    size: 5200,
    type: 'text/markdown',
    status: 'error',
    progress: 100,
    error: 'LaTeX syntax error at line 15: \\frac{1}{0}',
    metadata: {
      subject: 'TOÁN',
      grade: 'LỚP-11',
      hasLatex: true,
      latexCount: 8
    }
  }
];

// ===== MAIN COMPONENT =====

export default function AdminTheoryUploadPage() {
  // ===== STATE =====
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>(mockUploadedFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      const uploadFile: UploadFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, uploadFile]);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          )
        );
      }

      // Simulate validation
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: 'validating',
                metadata: {
                  subject: 'TOÁN',
                  grade: 'LỚP-12',
                  hasLatex: file.name.includes('.md'),
                  latexCount: Math.floor(Math.random() * 20)
                }
              }
            : f
        )
      );

      // Final status
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { 
                ...f, 
                status: Math.random() > 0.8 ? 'error' : 'success',
                error: Math.random() > 0.8 ? 'LaTeX validation failed' : undefined
              }
            : f
        )
      );
    }

    setIsUploading(false);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleRetryFile = async (fileId: string) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );

    // Simulate retry
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, progress }
            : f
        )
      );
    }

    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success' }
          : f
      )
    );
  };

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
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Nội dung Lý thuyết</h1>
          <p className="text-muted-foreground">
            Tải lên và quản lý nội dung lý thuyết với validation tự động
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/3141592654/admin/theory">
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Back to Theory
            </Button>
          </Link>
          
          <Link href="/3141592654/admin/theory/preview">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Upload Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(uploadStats.totalSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{uploadStats.successFiles}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(uploadStats.uploadedSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{uploadStats.errorFiles}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {uploadStats.totalFiles > 0 
                ? Math.round((uploadStats.successFiles / uploadStats.totalFiles) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manage">Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Content Files
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
                <p className="text-sm text-muted-foreground">
                  Supports: .md files with LaTeX content
                </p>
                
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".md,.markdown"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {isUploading && (
                <Alert className="mt-4">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Uploading and validating files... Please wait.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* File Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Uploaded Files
              </CardTitle>
              <CardDescription>
                Quản lý và xem trạng thái các file đã upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
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

                        {file.status === 'uploading' || file.status === 'validating' ? (
                          <Progress value={file.progress} className="h-1 mt-2" />
                        ) : null}

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
                            onClick={() => handleRetryFile(file.id)}
                          >
                            Retry
                          </Button>
                        )}
                        
                        {file.status === 'success' && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
