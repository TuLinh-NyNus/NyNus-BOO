"use client";

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props cho ScrollIndicators component
 */
export interface ScrollIndicatorsProps {
  /** Tổng số items */
  totalItems: number;
  /** Index hiện tại đang visible */
  currentIndex: number;
  /** Số items visible cùng lúc */
  visibleItems?: number;
  /** Custom className */
  className?: string;
  /** Variant style */
  variant?: 'dots' | 'progress' | 'minimal';
  /** Callback khi click vào indicator */
  onIndicatorClick?: (index: number) => void;
  /** Màu sắc */
  color?: 'white' | 'primary' | 'muted';
}

/**
 * ScrollIndicators Component
 * Hiển thị progress/dots cho horizontal scroll
 * 
 * @param props - ScrollIndicatorsProps
 * @returns JSX.Element
 */
export function ScrollIndicators({
  totalItems,
  currentIndex,
  visibleItems = 1,
  className,
  variant = 'dots',
  onIndicatorClick,
  color = 'white'
}: ScrollIndicatorsProps): JSX.Element {
  
  // Tính toán số indicators cần hiển thị
  const indicatorCount = Math.ceil(totalItems / visibleItems);
  const activeIndicator = Math.floor(currentIndex / visibleItems);

  // Color variants
  const colorVariants = {
    white: {
      active: 'bg-white',
      inactive: 'bg-white/30',
      progress: 'bg-white'
    },
    primary: {
      active: 'bg-primary',
      inactive: 'bg-primary/30',
      progress: 'bg-primary'
    },
    muted: {
      active: 'bg-foreground',
      inactive: 'bg-muted-foreground/30',
      progress: 'bg-foreground'
    }
  };

  const colors = colorVariants[color];

  // Render dots variant
  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {Array.from({ length: indicatorCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => onIndicatorClick?.(index * visibleItems)}
            className={cn(
              "relative min-h-[44px] min-w-[44px] flex items-center justify-center",
              onIndicatorClick && "hover:scale-125 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndicator ? colors.active : colors.inactive
            )} />
          </button>
        ))}
      </div>
    );
  }

  // Render progress variant
  if (variant === 'progress') {
    const progressPercentage = ((activeIndicator + 1) / indicatorCount) * 100;
    
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className={cn("text-xs font-medium", 
          color === 'white' ? 'text-white/70' : 'text-muted-foreground'
        )}>
          {activeIndicator + 1} / {indicatorCount}
        </span>
        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300 rounded-full", colors.progress)}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: indicatorCount }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              index === activeIndicator 
                ? cn("w-6", colors.active)
                : cn("w-2", colors.inactive)
            )}
          />
        ))}
      </div>
    );
  }

  return <div />;
}

/**
 * Export default
 */
export default ScrollIndicators;
