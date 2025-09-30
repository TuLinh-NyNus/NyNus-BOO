/**
 * Mobile Navigation Component
 * Component điều hướng được tối ưu cho mobile theory interface
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  BookOpen,
  Search,
  Settings,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface ChapterInfo {
  id: string;
  title: string;
  path: string;
  order: number;
  isCompleted: boolean;
  progress: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right';
  distance: number;
  velocity: number;
}

export interface MobileNavigationProps {
  /** Current path */
  currentPath: string;
  
  /** Available chapters */
  chapters: ChapterInfo[];
  
  /** Navigation items cho bottom nav */
  navigationItems?: NavigationItem[];
  
  /** Enable swipe gestures */
  enableSwipeGestures?: boolean;
  
  /** Show bottom navigation bar */
  showBottomNav?: boolean;
  
  /** Show back to top button */
  showBackToTop?: boolean;
  
  /** Handler cho navigation */
  onNavigate: (path: string) => void;
  
  /** Handler cho swipe gestures */
  onSwipeGesture?: (gesture: SwipeGesture) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'home', label: 'Trang chủ', path: '/theory', icon: Home },
  { id: 'chapters', label: 'Chương', path: '/theory/chapters', icon: BookOpen },
  { id: 'search', label: 'Tìm kiếm', path: '/theory/search', icon: Search },
  { id: 'settings', label: 'Cài đặt', path: '/theory/settings', icon: Settings }
];

// ===== MAIN COMPONENT =====

export function MobileNavigation({
  currentPath,
  chapters,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
  enableSwipeGestures = true,
  showBottomNav = true,
  showBackToTop = true,
  onNavigate,
  onSwipeGesture,
  className
}: MobileNavigationProps) {
  
  // ===== STATE =====
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);

  // ===== REFS =====
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== COMPUTED VALUES =====
  
  const currentChapterIndex = chapters.findIndex(ch => ch.path === currentPath);
  const currentChapter = chapters[currentChapterIndex];
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;

  // ===== HANDLERS =====

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onNavigate(chapters[currentChapterIndex - 1].path);
    }
  }, [hasPrevious, onNavigate, chapters, currentChapterIndex]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(chapters[currentChapterIndex + 1].path);
    }
  }, [hasNext, onNavigate, chapters, currentChapterIndex]);

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

    // Check if it's a valid horizontal swipe
    if (distance > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        const direction = deltaX > 0 ? 'right' : 'left';
        
        const gesture: SwipeGesture = {
          direction,
          distance,
          velocity
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

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigationItemClick = useCallback((item: NavigationItem) => {
    onNavigate(item.path);
    setIsMenuOpen(false);
  }, [onNavigate]);

  // ===== EFFECTS =====

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTopButton(window.scrollY > 300);
    };

    if (showBackToTop) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showBackToTop]);

  // ===== RENDER HELPERS =====

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = item.path === currentPath || item.isActive;

    return (
      <Button
        key={item.id}
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={() => handleNavigationItemClick(item)}
        className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-xs">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs">
            {item.badge}
          </Badge>
        )}
      </Button>
    );
  };

  // ===== RENDER =====

  return (
    <div 
      ref={containerRef}
      className={cn("mobile-navigation", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation Bar */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="touch-target"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">Trước</span>
            </Button>

            {/* Current Chapter Info */}
            <div className="flex-1 mx-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="touch-target"
              >
                <Menu className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium text-sm truncate max-w-[150px]">
                    {currentChapter?.title || 'Chọn chương'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentChapterIndex + 1}/{chapters.length}
                  </div>
                </div>
              </Button>
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={!hasNext}
              className="touch-target"
            >
              <span className="hidden sm:inline mr-1">Tiếp</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Menu */}
      {isMenuOpen && (
        <Card className="mb-4">
          <CardContent className="p-2">
            <div className="max-h-64 overflow-y-auto">
              {chapters.map((chapter, index) => (
                <Button
                  key={chapter.id}
                  variant={chapter.path === currentPath ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onNavigate(chapter.path);
                    setIsMenuOpen(false);
                  }}
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
                    </div>

                    <div className="flex items-center gap-1">
                      {chapter.isCompleted && (
                        <Badge variant="secondary" className="text-xs">
                          ✓
                        </Badge>
                      )}
                      {chapter.progress > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {chapter.progress}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-around">
              {navigationItems.map(renderNavigationItem)}
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && showBackToTopButton && (
        <Button
          variant="default"
          size="sm"
          onClick={handleBackToTop}
          className="fixed bottom-20 right-4 z-40 rounded-full w-12 h-12 p-0"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Swipe Instructions */}
      {enableSwipeGestures && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            💡 Vuốt trái/phải để chuyển chương
          </p>
        </div>
      )}

      {/* Bottom padding để tránh overlap với bottom nav */}
      {showBottomNav && <div className="h-16" />}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Mobile Navigation
 * Phiên bản compact cho embedded use
 */
export function CompactMobileNavigation(props: MobileNavigationProps) {
  return (
    <MobileNavigation
      {...props}
      showBottomNav={false}
      showBackToTop={false}
      className={cn("compact-mobile-nav", props.className)}
    />
  );
}

/**
 * Full Mobile Navigation
 * Phiên bản đầy đủ với tất cả features
 */
export function FullMobileNavigation(props: MobileNavigationProps) {
  return (
    <MobileNavigation
      {...props}
      enableSwipeGestures={true}
      showBottomNav={true}
      showBackToTop={true}
      className={cn("full-mobile-nav", props.className)}
    />
  );
}
