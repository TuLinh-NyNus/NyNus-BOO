"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props cho NavigationArrows component
 */
export interface NavigationArrowsProps {
  /** Có thể scroll sang trái */
  canScrollLeft: boolean;
  /** Có thể scroll sang phải */
  canScrollRight: boolean;
  /** Callback khi click scroll left */
  onScrollLeft: () => void;
  /** Callback khi click scroll right */
  onScrollRight: () => void;
  /** Custom className cho container */
  className?: string;
  /** Custom className cho buttons */
  buttonClassName?: string;
  /** Size của icons */
  iconSize?: number;
  /** Variant style */
  variant?: 'default' | 'features' | 'minimal';
  /** Labels cho accessibility */
  labels?: {
    left: string;
    right: string;
  };
  /** Disabled state */
  disabled?: boolean;
}

/**
 * NavigationArrows Component
 * Tái sử dụng cho horizontal scroll navigation
 * 
 * @param props - NavigationArrowsProps
 * @returns JSX.Element
 */
export function NavigationArrows({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  className,
  buttonClassName,
  iconSize = 20,
  variant = 'default',
  labels = {
    left: 'Trước',
    right: 'Sau'
  },
  disabled = false
}: NavigationArrowsProps): JSX.Element {
  
  // Variant styles
  const variantStyles = {
    default: {
      container: 'flex gap-2',
      button: 'p-3 rounded-full bg-card border border-border hover:bg-muted text-foreground transition-all disabled:opacity-50 disabled:pointer-events-none'
    },
    features: {
      container: 'flex gap-3',
      button: 'p-3 min-h-[48px] min-w-[48px] rounded-full bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 text-white backdrop-blur-sm transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1F47] focus-visible:outline-none'
    },
    minimal: {
      container: 'flex gap-1',
      button: 'p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 disabled:pointer-events-none'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      {/* Left Arrow Button */}
      <button
        onClick={onScrollLeft}
        disabled={disabled || !canScrollLeft}
        className={cn(styles.button, buttonClassName)}
        aria-label={labels.left}
        type="button"
      >
        <ChevronLeft 
          className={cn(
            "transition-colors duration-300",
            variant === 'features' ? "text-white" : "text-foreground"
          )} 
          size={iconSize} 
        />
      </button>

      {/* Right Arrow Button */}
      <button
        onClick={onScrollRight}
        disabled={disabled || !canScrollRight}
        className={cn(styles.button, buttonClassName)}
        aria-label={labels.right}
        type="button"
      >
        <ChevronRight 
          className={cn(
            "transition-colors duration-300",
            variant === 'features' ? "text-white" : "text-foreground"
          )} 
          size={iconSize} 
        />
      </button>
    </div>
  );
}

/**
 * Export default
 */
export default NavigationArrows;
