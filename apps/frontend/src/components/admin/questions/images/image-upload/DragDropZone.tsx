/**
 * Drag Drop Zone Component
 * Drag-and-drop interface cho file upload với visual feedback
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/form/button';
import { cn } from '@/lib/utils';
import { DragDropZoneProps } from '../types';
import { Upload, FileImage } from 'lucide-react';

// ===== MAIN COMPONENT =====

export function DragDropZone({
  onFilesDropped,
  onFilesSelected,
  accept = 'image/*',
  maxFiles = 10,
  isUploading = false,
  className,
  children,
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    if (isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const limitedFiles = imageFiles.slice(0, maxFiles);
      onFilesDropped(limitedFiles);

      // Debug info for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Drag drop completed. Counter was: ${dragCounter}, Files: ${limitedFiles.length}`);
      }
    }
  }, [isUploading, maxFiles, onFilesDropped, dragCounter]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const limitedFiles = files.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
    
    // Reset input value để cho phép chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxFiles, onFilesSelected]);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all duration-200',
        'hover:border-primary hover:bg-primary/5',
        'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        isDragOver && 'border-primary bg-primary/10 scale-[1.02]',
        isUploading && 'opacity-50 cursor-not-allowed',
        !isUploading && 'cursor-pointer',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Thả files vào đây
            </p>
            <p className="text-sm text-muted-foreground">
              Tối đa {maxFiles} files
            </p>
          </div>
        </div>
      )}
      
      {/* Default content */}
      {children || (
        <div className="p-8 text-center">
          <div className="mb-4">
            <FileImage className="h-16 w-16 mx-auto text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-medium text-foreground mb-2">
            {isUploading ? 'Đang upload...' : 'Upload hình ảnh'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            Kéo thả files vào đây hoặc click để chọn
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Hỗ trợ: PNG, JPG, WebP, SVG</p>
            <p>Tối đa: {maxFiles} files, 10MB mỗi file</p>
          </div>
          
          {!isUploading && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Chọn files
            </Button>
          )}
        </div>
      )}
      
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-foreground">Đang upload...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== COMPACT VARIANT =====

export function CompactDragDropZone({
  onFilesDropped,
  onFilesSelected,
  accept = 'image/*',
  maxFiles = 5,
  isUploading = false,
  className,
}: Omit<DragDropZoneProps, 'children'>) {
  return (
    <DragDropZone
      onFilesDropped={onFilesDropped}
      onFilesSelected={onFilesSelected}
      accept={accept}
      maxFiles={maxFiles}
      isUploading={isUploading}
      className={cn('p-4', className)}
    >
      <div className="flex items-center gap-3">
        <FileImage className="h-8 w-8 text-gray-400 flex-shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">
            {isUploading ? 'Đang upload...' : 'Thêm hình ảnh'}
          </p>
          <p className="text-xs text-gray-500">
            Kéo thả hoặc click để chọn (tối đa {maxFiles} files)
          </p>
        </div>
        {!isUploading && (
          <Upload className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </DragDropZone>
  );
}

// ===== EXPORTS =====

export default DragDropZone;
