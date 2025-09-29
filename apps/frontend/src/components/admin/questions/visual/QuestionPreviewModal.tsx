/**
 * Question Preview Modal Component
 * Full-screen modal cho question preview với navigation và zoom controls
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, Button } from '@/components/ui';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Printer,
  Share2
} from 'lucide-react';
import { QuestionCard } from '../display/QuestionCard';
import { Question } from '@/types/question';

/**
 * Props cho Question Preview Modal
 */
interface QuestionPreviewModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal handler */
  onClose: () => void;
  /** Current question */
  question: Question;
  /** All questions for navigation */
  questions?: Question[];
  /** Current question index */
  currentIndex?: number;
  /** Navigation handler */
  onNavigate?: (index: number) => void;
  /** Print handler */
  onPrint?: (question: Question) => void;
  /** Share handler */
  onShare?: (question: Question) => void;
}

/**
 * Question Preview Modal Component
 * Full-screen modal với navigation, zoom, và keyboard shortcuts
 */
export function QuestionPreviewModal({
  isOpen,
  onClose,
  question,
  questions = [],
  currentIndex = 0,
  onNavigate,
  onPrint,
  onShare
}: QuestionPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Keyboard shortcuts handler
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0 && onNavigate) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < questions.length - 1 && onNavigate) {
          onNavigate(currentIndex + 1);
        }
        break;
      case '+':
      case '=':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleZoomIn();
        }
        break;
      case '-':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleZoomOut();
        }
        break;
      case '0':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleZoomReset();
        }
        break;
      case 'p':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onPrint?.(question);
        }
        break;
    }
  }, [isOpen, currentIndex, questions.length, onNavigate, onClose, onPrint, question]);

  /**
   * Setup keyboard listeners
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Zoom controls
   */
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  /**
   * Navigation controls
   */
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < questions.length - 1;

  const handlePrevious = () => {
    if (canNavigatePrev && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canNavigateNext && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  /**
   * Fullscreen toggle
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          ${isFullscreen ? 'max-w-full h-full m-0 rounded-none' : 'max-w-6xl max-h-[90vh]'}
          p-0 overflow-hidden
        `}
      >
        {/* Header với controls */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canNavigatePrev}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </Button>
            
            <div className="text-sm text-muted-foreground px-2">
              {questions.length > 0 && (
                <span>{currentIndex + 1} / {questions.length}</span>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canNavigateNext}
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Question info */}
          <div className="flex-1 text-center">
            <h2 className="font-semibold text-lg truncate">
              Câu hỏi {question.questionCodeId}
            </h2>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <div className="text-xs px-2 min-w-[3rem] text-center">
                {zoomLevel}%
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Action buttons */}
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(question)}
                className="flex items-center gap-1"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">In</span>
              </Button>
            )}

            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(question)}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </Button>
            )}

            {/* Fullscreen toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content với zoom */}
        <div className="flex-1 overflow-auto p-6">
          <div 
            className="transition-transform duration-200 origin-top-left"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left'
            }}
          >
            <QuestionCard
              question={question}
              variant="detailed"
              showSolution={true}
              showMetadata={true}
              showActions={false}
              className="max-w-none"
            />
          </div>
        </div>

        {/* Footer với keyboard shortcuts */}
        <div className="border-t bg-muted/50 px-4 py-2">
          <div className="text-xs text-muted-foreground text-center">
            <span className="hidden md:inline">
              Phím tắt: ESC (đóng), ← → (điều hướng), Ctrl+/- (zoom), Ctrl+0 (reset), Ctrl+P (in)
            </span>
            <span className="md:hidden">
              Sử dụng các nút điều khiển ở trên
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
