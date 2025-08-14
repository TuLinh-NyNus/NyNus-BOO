/**
 * Image Preview Modal Component
 * Modal để preview image với zoom controls và actions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/form/button';
import { cn } from '@/lib/utils';
import { ImagePreviewProps } from '../types';
import { QuestionImage } from '@/lib/mockdata/shared/core-types';
import ImageMetadata from './ImageMetadata';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Trash2, 
  Edit, 
  Maximize,
  Minimize,
  Move
} from 'lucide-react';

// ===== INTERFACES =====

interface ZoomState {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

// ===== CONSTANTS =====

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

// ===== HELPER FUNCTIONS =====

/**
 * Get image URL for preview
 */
function getPreviewImageUrl(image: QuestionImage): string {
  if (image.driveUrl) {
    const fileId = image.driveFileId || image.driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?id=${fileId}`;
    }
    return image.driveUrl;
  }
  
  if (image.imagePath) {
    return image.imagePath;
  }
  
  return '/images/placeholder-image.png';
}

// ===== MAIN COMPONENT =====

export function ImagePreviewModal({
  image,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onEdit,
}: ImagePreviewProps) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMetadata, setShowMetadata] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getPreviewImageUrl(image);

  // Reset zoom when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setZoomState({ scale: 1, x: 0, y: 0, rotation: 0 });
      setImageError(false);
    }
  }, [isOpen]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_ZOOM),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_ZOOM),
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomState({ scale: 1, x: 0, y: 0, rotation: 0 });
  }, []);

  const handleRotate = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  }, []);

  // Drag functions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomState.scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoomState.x, y: e.clientY - zoomState.y });
    }
  }, [zoomState.scale, zoomState.x, zoomState.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setZoomState(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        case 'r':
          e.preventDefault();
          handleRotate();
          break;
        case 'f':
          e.preventDefault();
          setIsFullscreen(prev => !prev);
          break;
        case 'm':
          e.preventDefault();
          setShowMetadata(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleZoomReset, handleRotate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* Modal Container */}
      <div className={cn(
        'relative bg-white rounded-lg shadow-xl overflow-hidden',
        isFullscreen ? 'w-full h-full' : 'w-[90vw] h-[90vh] max-w-6xl'
      )}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold truncate">
                {image.imageType === 'QUESTION' ? 'Hình ảnh câu hỏi' : 'Hình ảnh lời giải'}
              </h2>
              <span className="text-sm text-gray-500">
                {Math.round(zoomState.scale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomState.scale <= MIN_ZOOM}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomReset}
              >
                1:1
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomState.scale >= MAX_ZOOM}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Rotate */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              {/* Metadata Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                Info
              </Button>

              {/* Close */}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full pt-20">
          {/* Image Area */}
          <div className="flex-1 relative overflow-hidden bg-gray-100">
            <div
              className="w-full h-full flex items-center justify-center cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {!imageError ? (
                <div
                  className="relative transition-transform duration-200"
                  style={{
                    transform: `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale}) rotate(${zoomState.rotation}deg)`,
                    cursor: zoomState.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="max-w-none"
                    onError={() => setImageError(true)}
                    priority
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p>Không thể tải hình ảnh</p>
                </div>
              )}
            </div>

            {/* Zoom Indicator */}
            {zoomState.scale > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                <Move className="h-3 w-3 inline mr-1" />
                Kéo để di chuyển
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          {showMetadata && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <ImageMetadata 
                image={image}
                showDetails={true}
              />

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {onDownload && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-6 text-xs text-gray-500">
                <h4 className="font-medium mb-2">Phím tắt:</h4>
                <div className="space-y-1">
                  <div>ESC: Đóng</div>
                  <div>+/-: Zoom in/out</div>
                  <div>0: Reset zoom</div>
                  <div>R: Xoay</div>
                  <div>F: Fullscreen</div>
                  <div>M: Toggle metadata</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== EXPORTS =====

export default ImagePreviewModal;
