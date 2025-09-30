/**
 * Bottom Navigation Bar Component
 * Component thanh điều hướng dưới cùng cho theory interface
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Search,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface ChapterInfo {
  id: string;
  title: string;
  order: number;
  progress: number;
  isCompleted: boolean;
}

export interface NavigationAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

export interface BottomNavigationBarProps {
  /** Chapter hiện tại */
  currentChapter: string;
  
  /** Danh sách chapters */
  chapters: ChapterInfo[];
  
  /** Handler cho previous navigation */
  onPrevious: () => void;
  
  /** Handler cho next navigation */
  onNext: () => void;
  
  /** Handler cho menu toggle */
  onMenuToggle: () => void;
  
  /** Show progress indicator */
  showProgress?: boolean;
  
  /** Enable quick actions */
  enableQuickActions?: boolean;
  
  /** Custom navigation actions */
  customActions?: NavigationAction[];
  
  /** Show chapter info */
  showChapterInfo?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_QUICK_ACTIONS: NavigationAction[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: Home,
    onClick: () => window.location.href = '/theory'
  },
  {
    id: 'search',
    label: 'Tìm kiếm',
    icon: Search,
    onClick: () => window.location.href = '/theory/search'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    onClick: () => window.location.href = '/theory/settings'
  }
];

// ===== MAIN COMPONENT =====

export function BottomNavigationBar({
  currentChapter,
  chapters,
  onPrevious,
  onNext,
  onMenuToggle,
  showProgress = true,
  enableQuickActions = true,
  customActions = DEFAULT_QUICK_ACTIONS,
  showChapterInfo = true,
  className
}: BottomNavigationBarProps) {
  
  // ===== STATE =====
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ===== COMPUTED VALUES =====
  
  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter);
  const currentChapterInfo = chapters[currentChapterIndex];
  const hasPrevious = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;
  
  const overallProgress = chapters.length > 0 
    ? chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
    : 0;

  // ===== HANDLERS =====

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleActionClick = useCallback((action: NavigationAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsExpanded(false); // Collapse after action
    }
  }, []);

  // ===== EFFECTS =====

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // ===== RENDER HELPERS =====

  const renderQuickAction = (action: NavigationAction) => {
    const Icon = action.icon;
    
    return (
      <Button
        key={action.id}
        variant="ghost"
        size="sm"
        onClick={() => handleActionClick(action)}
        disabled={action.disabled}
        className="flex flex-col items-center gap-1 h-auto py-2 px-3 touch-target"
      >
        <Icon className="h-4 w-4" />
        <span className="text-xs">{action.label}</span>
        {action.badge && (
          <Badge variant="secondary" className="text-xs">
            {action.badge}
          </Badge>
        )}
      </Button>
    );
  };

  const renderProgressInfo = () => {
    if (!showProgress || !currentChapterInfo) return null;

    return (
      <div className="px-4 py-2 border-t bg-background/95">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Tiến độ chương</span>
          <span>{currentChapterInfo.progress}%</span>
        </div>
        <Progress value={currentChapterInfo.progress} className="h-1 mb-2" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Tổng tiến độ</span>
          <span>{overallProgress.toFixed(1)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1" />
      </div>
    );
  };

  // ===== RENDER =====

  return (
    <>
      {/* Main Bottom Navigation */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t transition-transform duration-300",
          {
            "translate-y-full": !isVisible,
            "translate-y-0": isVisible
          },
          className
        )}
      >
        {/* Expanded Quick Actions */}
        {isExpanded && enableQuickActions && (
          <div className="border-b bg-background/95">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-around">
                {customActions.map(renderQuickAction)}
              </div>
            </div>
          </div>
        )}

        {/* Progress Info */}
        {isExpanded && renderProgressInfo()}

        {/* Main Navigation Bar */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="flex items-center gap-2 touch-target"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Trước</span>
            </Button>

            {/* Center Content */}
            <div className="flex-1 mx-4">
              {showChapterInfo && currentChapterInfo ? (
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-[200px] mx-auto">
                    {currentChapterInfo.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Chương {currentChapterInfo.order} • {currentChapterInfo.progress}%
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    {currentChapterIndex + 1}/{chapters.length}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                className="touch-target"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Expand Button */}
              {enableQuickActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="touch-target"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              )}

              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="flex items-center gap-2 touch-target"
              >
                <span className="hidden sm:inline">Tiếp</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-16" />
    </>
  );
}

// ===== VARIANTS =====

/**
 * Compact Bottom Navigation Bar
 * Phiên bản compact cho embedded use
 */
export function CompactBottomNavigationBar(props: BottomNavigationBarProps) {
  return (
    <BottomNavigationBar
      {...props}
      showProgress={false}
      enableQuickActions={false}
      showChapterInfo={false}
      className={cn("compact-bottom-nav", props.className)}
    />
  );
}

/**
 * Full Bottom Navigation Bar
 * Phiên bản đầy đủ với tất cả features
 */
export function FullBottomNavigationBar(props: BottomNavigationBarProps) {
  return (
    <BottomNavigationBar
      {...props}
      showProgress={true}
      enableQuickActions={true}
      showChapterInfo={true}
      className={cn("full-bottom-nav", props.className)}
    />
  );
}

/**
 * Simple Bottom Navigation Bar
 * Phiên bản đơn giản chỉ có navigation
 */
export function SimpleBottomNavigationBar(props: BottomNavigationBarProps) {
  return (
    <BottomNavigationBar
      {...props}
      showProgress={false}
      enableQuickActions={false}
      showChapterInfo={true}
      customActions={[]}
      className={cn("simple-bottom-nav", props.className)}
    />
  );
}
