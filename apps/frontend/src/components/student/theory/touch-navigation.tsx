/**
 * Touch Navigation Component
 * Component điều hướng touch-friendly cho student theory interface
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface ChapterInfo {
  id: string;
  title: string;
  description?: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
  progress: number;
  order: number;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface TouchNavigationProps {
  /** Danh sách chapters */
  chapters: ChapterInfo[];
  
  /** Chapter hiện tại */
  currentChapter: string;
  
  /** Handler khi thay đổi chapter */
  onChapterChange: (chapterId: string) => void;
  
  /** Enable swipe gestures */
  enableSwipeGestures?: boolean;
  
  /** Show progress indicators */
  showProgress?: boolean;
  
  /** Enable chapter menu */
  enableChapterMenu?: boolean;
  
  /** Handler cho swipe gestures */
  onSwipeGesture?: (gesture: SwipeGesture) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for swipe
const ANIMATION_DURATION = 300;

// ===== MAIN COMPONENT =====

export function TouchNavigation({
  chapters,
  currentChapter,
  onChapterChange,
  enableSwipeGestures = true,
  showProgress = true,
  enableChapterMenu = true,
  onSwipeGesture,
  className
}: TouchNavigationProps) {
  
  // ===== STATE =====
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // ===== REFS =====
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== COMPUTED VALUES =====
  
  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter);
  const currentChapterInfo = chapters[currentChapterIndex];
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;
  
  const overallProgress = chapters.length > 0 
    ? chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
    : 0;

  // ===== HANDLERS =====

  const handlePrevious = useCallback(() => {
    if (hasPrevious && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('right');
      
      setTimeout(() => {
        onChapterChange(chapters[currentChapterIndex - 1].id);
        setIsAnimating(false);
        setSwipeDirection(null);
      }, ANIMATION_DURATION);
    }
  }, [hasPrevious, isAnimating, onChapterChange, chapters, currentChapterIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('left');
      
      setTimeout(() => {
        onChapterChange(chapters[currentChapterIndex + 1].id);
        setIsAnimating(false);
        setSwipeDirection(null);
      }, ANIMATION_DURATION);
    }
  }, [hasNext, isAnimating, onChapterChange, chapters, currentChapterIndex]);

  const handleChapterSelect = useCallback((chapterId: string) => {
    if (chapterId !== currentChapter && !isAnimating) {
      onChapterChange(chapterId);
      setIsMenuOpen(false);
    }
  }, [currentChapter, isAnimating, onChapterChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [enableSwipeGestures]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableSwipeGestures || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if it's a valid swipe
    if (distance > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        const direction = deltaX > 0 ? 'right' : 'left';
        
        const gesture: SwipeGesture = {
          direction,
          distance,
          velocity,
          duration: deltaTime
        };
        
        onSwipeGesture?.(gesture);

        // Handle navigation
        if (direction === 'right' && hasPrevious) {
          handlePrevious();
        } else if (direction === 'left' && hasNext) {
          handleNext();
        }
      }
    }

    touchStartRef.current = null;
  }, [enableSwipeGestures, onSwipeGesture, hasPrevious, hasNext, handlePrevious, handleNext]);

  // ===== EFFECTS =====

  useEffect(() => {
    // Prevent default touch behaviors on the container
    const container = containerRef.current;
    if (container && enableSwipeGestures) {
      const preventDefault = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      container.addEventListener('touchmove', preventDefault, { passive: false });
      return () => {
        container.removeEventListener('touchmove', preventDefault);
      };
    }
  }, [enableSwipeGestures]);

  // ===== RENDER HELPERS =====

  const getDifficultyBadge = (difficulty: ChapterInfo['difficulty']) => {
    const variants = {
      easy: 'default',
      medium: 'secondary',
      hard: 'destructive'
    } as const;

    const labels = {
      easy: 'Dễ',
      medium: 'TB',
      hard: 'Khó'
    };

    return (
      <Badge variant={variants[difficulty]} className="text-xs">
        {labels[difficulty]}
      </Badge>
    );
  };

  const formatTime = (minutes: number) => {
    return `${minutes} phút`;
  };

  // ===== RENDER =====

  return (
    <div 
      ref={containerRef}
      className={cn("touch-navigation", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Navigation Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={!hasPrevious || isAnimating}
              className="touch-target"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">Trước</span>
            </Button>

            {/* Current Chapter Info */}
            <div className="flex-1 mx-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {enableChapterMenu && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="touch-target"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                
                <div>
                  <h3 className="font-medium text-sm truncate max-w-[200px]">
                    {currentChapterInfo?.title || 'Chương không tìm thấy'}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {currentChapterIndex + 1}/{chapters.length}
                    </span>
                    {currentChapterInfo && (
                      <>
                        {getDifficultyBadge(currentChapterInfo.difficulty)}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(currentChapterInfo.estimatedTime)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {showProgress && currentChapterInfo && (
                <div className="mt-2">
                  <Progress value={currentChapterInfo.progress} className="h-1" />
                </div>
              )}
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={!hasNext || isAnimating}
              className="touch-target"
            >
              <span className="hidden sm:inline mr-1">Tiếp</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Overall Progress */}
          {showProgress && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Tiến độ tổng thể</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chapter Menu */}
      {isMenuOpen && enableChapterMenu && (
        <Card className="mt-2">
          <CardContent className="p-2">
            <div className="max-h-64 overflow-y-auto">
              {chapters.map((chapter, index) => (
                <Button
                  key={chapter.id}
                  variant={chapter.id === currentChapter ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleChapterSelect(chapter.id)}
                  className="w-full justify-start mb-1 touch-target"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-muted-foreground min-w-[1.5rem]">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm truncate">
                        {chapter.title}
                      </div>
                      {chapter.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {chapter.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {chapter.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {getDifficultyBadge(chapter.difficulty)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swipe Animation Overlay */}
      {isAnimating && swipeDirection && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div 
            className={cn(
              "absolute inset-0 bg-primary/10 transition-transform duration-300",
              {
                "translate-x-full": swipeDirection === 'left',
                "-translate-x-full": swipeDirection === 'right'
              }
            )}
          />
        </div>
      )}

      {/* Touch Instructions */}
      {enableSwipeGestures && (
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Vuốt trái/phải để chuyển chương, chạm menu để xem tất cả
          </p>
        </div>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Touch Navigation
 * Phiên bản compact cho mobile
 */
export function CompactTouchNavigation(props: TouchNavigationProps) {
  return (
    <TouchNavigation
      {...props}
      showProgress={false}
      enableChapterMenu={false}
      className={cn("compact-touch-nav", props.className)}
    />
  );
}

/**
 * Full Touch Navigation
 * Phiên bản đầy đủ với tất cả features
 */
export function FullTouchNavigation(props: TouchNavigationProps) {
  return (
    <TouchNavigation
      {...props}
      enableSwipeGestures={true}
      showProgress={true}
      enableChapterMenu={true}
      className={cn("full-touch-nav", props.className)}
    />
  );
}
