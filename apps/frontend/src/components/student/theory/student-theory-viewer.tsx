/**
 * Student Theory Viewer Component
 * Component xem nội dung lý thuyết cho học sinh với mobile-first design
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Menu,
  Bookmark,
  Share,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { MobileOptimizer } from "@/lib/theory/mobile-optimizer";

// ===== TYPES =====

export interface TheoryContent {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  chapter: string;
  estimatedReadTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  lastModified: Date;
}

export interface ReadingProgress {
  currentPosition: number;
  totalLength: number;
  percentage: number;
  timeSpent: number;
  lastReadAt: Date;
}

export interface StudentTheoryViewerProps {
  /** Nội dung lý thuyết để hiển thị */
  content: TheoryContent;
  
  /** Enable mobile optimization */
  enableMobileOptimization?: boolean;
  
  /** Show reading progress */
  showProgress?: boolean;
  
  /** Enable bookmark functionality */
  enableBookmarks?: boolean;
  
  /** Enable sharing */
  enableSharing?: boolean;
  
  /** Handler khi progress update */
  onProgressUpdate?: (progress: ReadingProgress) => void;
  
  /** Handler khi bookmark */
  onBookmark?: (contentId: string) => void;
  
  /** Handler khi share */
  onShare?: (contentId: string) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const PROGRESS_UPDATE_INTERVAL = 5000; // 5 seconds

// ===== MAIN COMPONENT =====

export function StudentTheoryViewer({
  content,
  enableMobileOptimization = true,
  showProgress = true,
  enableBookmarks = true,
  enableSharing = true,
  onProgressUpdate,
  onBookmark,
  onShare,
  className
}: StudentTheoryViewerProps) {
  
  // ===== STATE =====
  
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    currentPosition: 0,
    totalLength: content.content.length,
    percentage: 0,
    timeSpent: 0,
    lastReadAt: new Date()
  });
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // ===== HOOKS =====

  const performance = usePerformanceOptimization({
    componentName: 'StudentTheoryViewer',
    enabled: true,
    warningThreshold: 100
  });

  // ===== HANDLERS =====

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    setReadingProgress(prev => ({
      ...prev,
      currentPosition: scrollTop,
      percentage: Math.min(percentage, 100),
      lastReadAt: new Date()
    }));
  }, []);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(content.id);
  }, [isBookmarked, onBookmark, content.id]);

  const handleShare = useCallback(() => {
    onShare?.(content.id);
  }, [onShare, content.id]);

  const handleFontSizeChange = useCallback((delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  }, []);

  const optimizeContentForMobile = useCallback(async () => {
    if (!enableMobileOptimization) {
      setOptimizedContent(content.content);
      return;
    }

    setIsOptimizing(true);
    performance.startMeasurement();

    try {
      const optimizer = new MobileOptimizer({
        optimizeLatex: true,
        touchFriendlyNavigation: true,
        progressiveLoading: true,
        maxImageWidth: 800
      });

      await optimizer.optimizeContent(content.content);
      // MobileOptimizer returns optimization stats, not the HTML
      // For now, use original content with mobile CSS classes
      setOptimizedContent(content.content);
      
      performance.endMeasurement();
    } catch (error) {
      console.error('Mobile optimization failed:', error);
      setOptimizedContent(content.content);
    } finally {
      setIsOptimizing(false);
    }
  }, [content.content, enableMobileOptimization, performance]);

  // ===== EFFECTS =====

  useEffect(() => {
    optimizeContentForMobile();
  }, [optimizeContentForMobile]);

  useEffect(() => {
    // Update reading time
    const interval = setInterval(() => {
      setReadingProgress(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Report progress updates
    if (onProgressUpdate) {
      const interval = setInterval(() => {
        onProgressUpdate(readingProgress);
      }, PROGRESS_UPDATE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [readingProgress, onProgressUpdate]);

  // ===== RENDER HELPERS =====

  const formatReadTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getDifficultyBadge = (difficulty: TheoryContent['difficulty']) => {
    const variants = {
      easy: 'default',
      medium: 'secondary',
      hard: 'destructive'
    } as const;

    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };

    return (
      <Badge variant={variants[difficulty]} className="text-xs">
        {labels[difficulty]}
      </Badge>
    );
  };

  // ===== RENDER =====

  return (
    <div className={cn("student-theory-viewer h-full flex flex-col", className)}>
      {/* Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{content.subject}</Badge>
                  <Badge variant="outline">{content.grade}</Badge>
                  {getDifficultyBadge(content.difficulty)}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFontSizeChange(-2)}
                disabled={fontSize <= 12}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-xs text-muted-foreground min-w-[2rem] text-center">
                {fontSize}px
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFontSizeChange(2)}
                disabled={fontSize >= 24}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Action Buttons */}
              {enableBookmarks && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={isBookmarked ? 'text-yellow-600' : ''}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              )}

              {enableSharing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tiến độ đọc</span>
                <span>{readingProgress.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={readingProgress.percentage} className="h-1" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatReadTime(readingProgress.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>~{content.estimatedReadTime} phút</span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Content Area */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full p-0">
          <div
            className="h-full overflow-y-auto p-6"
            onScroll={handleScroll}
            style={{ fontSize: `${fontSize}px` }}
          >
            {isOptimizing ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Đang tối ưu nội dung cho mobile...</p>
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none mobile-optimized"
                dangerouslySetInnerHTML={{ __html: optimizedContent }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Bài trước
            </Button>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {readingProgress.percentage >= 100 ? 'Hoàn thành' : 'Đang đọc'}
              </span>
            </div>
            
            <Button variant="outline" size="sm">
              Bài tiếp
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Student Theory Viewer
 * Phiên bản compact cho mobile
 */
export function CompactStudentTheoryViewer(props: StudentTheoryViewerProps) {
  return (
    <StudentTheoryViewer
      {...props}
      showProgress={false}
      enableBookmarks={false}
      enableSharing={false}
      className={cn("compact-theory-viewer", props.className)}
    />
  );
}

/**
 * Full Student Theory Viewer
 * Phiên bản đầy đủ với tất cả features
 */
export function FullStudentTheoryViewer(props: StudentTheoryViewerProps) {
  return (
    <StudentTheoryViewer
      {...props}
      enableMobileOptimization={true}
      showProgress={true}
      enableBookmarks={true}
      enableSharing={true}
      className={cn("full-theory-viewer", props.className)}
    />
  );
}
