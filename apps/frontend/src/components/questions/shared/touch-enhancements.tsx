/**
 * Touch Enhancements Component
 * Enhanced touch interactions cho mobile question interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface TouchEnhancementsProps {
  /** Enable touch feedback */
  enableFeedback?: boolean;
  
  /** Enable swipe gestures */
  enableSwipe?: boolean;
  
  /** Enable long press */
  enableLongPress?: boolean;
  
  /** Touch feedback duration (ms) */
  feedbackDuration?: number;
  
  /** Long press duration (ms) */
  longPressDuration?: number;
  
  /** Swipe threshold (px) */
  swipeThreshold?: number;
  
  /** Children components */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Touch feedback callback */
  onTouchFeedback?: () => void;
  
  /** Swipe callbacks */
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  
  /** Long press callback */
  onLongPress?: () => void;
}

export interface TouchState {
  isPressed: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

// ===== CONSTANTS =====

const DEFAULT_FEEDBACK_DURATION = 150;
const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_SWIPE_THRESHOLD = 50;

// ===== MAIN COMPONENT =====

/**
 * Touch Enhancements Component
 * Wrapper component để enhance touch interactions
 * 
 * Features:
 * - Touch feedback với visual indication
 * - Swipe gesture detection
 * - Long press detection
 * - Optimized cho mobile performance
 */
export function TouchEnhancements({
  enableFeedback = true,
  enableSwipe = false,
  enableLongPress = false,
  feedbackDuration = DEFAULT_FEEDBACK_DURATION,
  longPressDuration = DEFAULT_LONG_PRESS_DURATION,
  swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
  children,
  className,
  onTouchFeedback,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress
}: TouchEnhancementsProps) {
  // ===== STATE =====
  
  const [touchState, setTouchState] = useState<TouchState>({
    isPressed: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
  });
  
  const [showFeedback, setShowFeedback] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== HANDLERS =====

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchState({
      isPressed: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
    });

    // Show touch feedback
    if (enableFeedback) {
      setShowFeedback(true);
      onTouchFeedback?.();
      
      // Clear existing feedback timer
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    }

    // Start long press timer
    if (enableLongPress && onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
      }, longPressDuration);
    }
  }, [enableFeedback, enableLongPress, longPressDuration, onTouchFeedback, onLongPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));

    // Cancel long press if moved too much
    if (enableLongPress && longPressTimerRef.current) {
      const deltaX = Math.abs(touch.clientX - touchState.startX);
      const deltaY = Math.abs(touch.clientY - touchState.startY);
      
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [enableLongPress, touchState.startX, touchState.startY]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    const { startX, startY, currentX, currentY } = touchState;
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Hide touch feedback
    if (enableFeedback) {
      feedbackTimerRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, feedbackDuration);
    }

    // Detect swipe gestures
    if (enableSwipe) {
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    }

    setTouchState(prev => ({
      ...prev,
      isPressed: false,
    }));
  }, [touchState, enableFeedback, enableSwipe, feedbackDuration, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // ===== CLEANUP =====

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // ===== COMPUTED VALUES =====

  const containerClasses = cn(
    'touch-enhanced',
    {
      'touch-pressed': touchState.isPressed,
      'touch-feedback': showFeedback && enableFeedback,
    },
    className
  );

  // ===== RENDER =====

  return (
    <div
      className={containerClasses}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        // Touch feedback styles
        ...(showFeedback && enableFeedback && {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          transform: 'scale(0.98)',
          transition: 'all 0.1s ease-out',
        }),
      }}
    >
      {children}
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Touch Card Component
 * Card với enhanced touch interactions
 */
export function TouchCard({ children, className, ...props }: TouchEnhancementsProps) {
  return (
    <TouchEnhancements
      {...props}
      enableFeedback={true}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    >
      {children}
    </TouchEnhancements>
  );
}

/**
 * Swipeable Component
 * Component với swipe gesture support
 */
export function SwipeableComponent({ children, className, ...props }: TouchEnhancementsProps) {
  return (
    <TouchEnhancements
      {...props}
      enableSwipe={true}
      enableFeedback={true}
      className={cn('swipeable', className)}
    >
      {children}
    </TouchEnhancements>
  );
}

/**
 * Long Press Component
 * Component với long press support
 */
export function LongPressComponent({ children, className, ...props }: TouchEnhancementsProps) {
  return (
    <TouchEnhancements
      {...props}
      enableLongPress={true}
      enableFeedback={true}
      className={cn('long-pressable', className)}
    >
      {children}
    </TouchEnhancements>
  );
}

// ===== DEFAULT EXPORT =====

export default TouchEnhancements;
