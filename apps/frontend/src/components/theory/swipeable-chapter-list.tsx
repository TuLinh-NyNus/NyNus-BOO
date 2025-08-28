/**
 * Swipeable Chapter List Component
 * Component danh sách chương có thể vuốt ngang với horizontal scrolling
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
  BookOpen,
  CheckCircle,
  Clock,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

// ===== TYPES =====

export interface ChapterInfo {
  id: string;
  title: string;
  description?: string;
  order: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
  progress: number;
  isLocked?: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right';
  distance: number;
  velocity: number;
  startX: number;
  endX: number;
}

export interface SwipeableChapterListProps {
  /** Danh sách chapters */
  chapters: ChapterInfo[];
  
  /** Chapter hiện tại */
  currentChapter: string;
  
  /** Handler khi thay đổi chapter */
  onChapterChange: (chapterId: string) => void;
  
  /** Enable horizontal scrolling */
  enableHorizontalScroll?: boolean;
  
  /** Enable touch gestures */
  enableTouchGestures?: boolean;
  
  /** Show progress indicators */
  showProgress?: boolean;
  
  /** Number of items visible per view */
  itemsPerView?: number;
  
  /** Handler cho swipe gestures */
  onSwipeGesture?: (gesture: SwipeGesture) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const DEFAULT_ITEMS_PER_VIEW = 2.5; // Show 2.5 items để hint có thêm content

// ===== MAIN COMPONENT =====

export function SwipeableChapterList({
  chapters,
  currentChapter,
  onChapterChange,
  enableHorizontalScroll = true,
  enableTouchGestures = true,
  showProgress = true,
  itemsPerView = DEFAULT_ITEMS_PER_VIEW,
  onSwipeGesture,
  className
}: SwipeableChapterListProps) {
  
  // ===== STATE =====
  
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [isAnimating, setIsAnimating] = useState(false);

  // ===== REFS =====
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // ===== HOOKS =====

  const { containerRef, scrollState, scroll } = useHorizontalScroll({
    scrollAmount: 0.8,
    scrollThreshold: 10,
    scrollDelay: 300
  });

  // ===== COMPUTED VALUES =====
  
  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter);
  const currentChapterInfo = chapters[currentChapterIndex];

  // ===== HANDLERS =====

  const handleChapterSelect = useCallback((chapterId: string) => {
    if (chapterId === currentChapter || isAnimating) return;
    
    setIsAnimating(true);
    setSelectedChapter(chapterId);
    onChapterChange(chapterId);
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [currentChapter, isAnimating, onChapterChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [enableTouchGestures]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if it's a valid horizontal swipe
    if (distance > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        const direction = deltaX > 0 ? 'right' : 'left';
        
        const gesture: SwipeGesture = {
          direction,
          distance,
          velocity,
          startX: touchStartRef.current.x,
          endX: touch.clientX
        };
        
        onSwipeGesture?.(gesture);

        // Handle horizontal scroll
        if (enableHorizontalScroll) {
          if (direction === 'left' && scrollState.canScrollRight) {
            scroll('right');
          } else if (direction === 'right' && scrollState.canScrollLeft) {
            scroll('left');
          }
        }
      }
    }

    touchStartRef.current = null;
  }, [enableTouchGestures, onSwipeGesture, enableHorizontalScroll, scrollState, scroll]);

  // ===== EFFECTS =====

  useEffect(() => {
    setSelectedChapter(currentChapter);
  }, [currentChapter]);

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

  const formatTime = (minutes: number) => `${minutes} phút`;

  const renderChapterItem = (chapter: ChapterInfo, index: number) => {
    const isActive = chapter.id === currentChapter;
    const isSelected = chapter.id === selectedChapter;
    const isDisabled = chapter.isLocked;

    return (
      <Card
        key={chapter.id}
        className={cn(
          "flex-shrink-0 cursor-pointer transition-all duration-300",
          "hover:shadow-md",
          {
            "ring-2 ring-primary": isActive,
            "opacity-50 cursor-not-allowed": isDisabled,
            "scale-105": isSelected && isAnimating
          }
        )}
        style={{
          width: `calc(${100 / itemsPerView}% - 0.75rem)`,
          minWidth: '280px'
        }}
        onClick={() => !isDisabled && handleChapterSelect(chapter.id)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                  isActive ? "bg-primary" : "bg-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                <div className="flex items-center gap-1">
                  {chapter.isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {!chapter.isCompleted && !isDisabled && (
                    <Play className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {getDifficultyBadge(chapter.difficulty)}
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {chapter.title}
              </h3>
              {chapter.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {chapter.description}
                </p>
              )}
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiến độ</span>
                  <span>{chapter.progress}%</span>
                </div>
                <Progress value={chapter.progress} className="h-1" />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(chapter.estimatedTime)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>Chương {chapter.order}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== RENDER =====

  return (
    <div className={cn("swipeable-chapter-list", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Danh sách chương</h2>
          <p className="text-sm text-muted-foreground">
            {chapters.length} chương • {chapters.filter(ch => ch.isCompleted).length} hoàn thành
          </p>
        </div>

        {/* Navigation Arrows */}
        {enableHorizontalScroll && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              disabled={!scrollState.canScrollLeft || scrollState.isScrolling}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              disabled={!scrollState.canScrollRight || scrollState.isScrolling}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Chapter List */}
      <div
        ref={containerRef}
        className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide",
          {
            "scroll-smooth": enableHorizontalScroll
          }
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {chapters.map((chapter, index) => renderChapterItem(chapter, index))}
      </div>

      {/* Current Chapter Info */}
      {currentChapterInfo && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Đang học:</span>
            <span>{currentChapterInfo.title}</span>
            <Badge variant="outline" className="text-xs">
              {currentChapterInfo.progress}% hoàn thành
            </Badge>
          </div>
        </div>
      )}

      {/* Touch Instructions */}
      {enableTouchGestures && (
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            💡 Vuốt trái/phải để cuộn danh sách, chạm để chọn chương
          </p>
        </div>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Swipeable Chapter List
 * Phiên bản compact cho sidebar
 */
export function CompactSwipeableChapterList(props: SwipeableChapterListProps) {
  return (
    <SwipeableChapterList
      {...props}
      showProgress={false}
      itemsPerView={1.5}
      className={cn("compact-chapter-list", props.className)}
    />
  );
}

/**
 * Full Swipeable Chapter List
 * Phiên bản đầy đủ với tất cả features
 */
export function FullSwipeableChapterList(props: SwipeableChapterListProps) {
  return (
    <SwipeableChapterList
      {...props}
      enableHorizontalScroll={true}
      enableTouchGestures={true}
      showProgress={true}
      itemsPerView={2.5}
      className={cn("full-chapter-list", props.className)}
    />
  );
}
