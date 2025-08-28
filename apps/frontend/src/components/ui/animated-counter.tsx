/**
 * Animated Counter Component
 * Smooth number animation component với customizable formatting
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

/**
 * Animated Counter Props Interface
 * Props cho AnimatedCounter component
 */
export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  startValue?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'easeOutQuart';
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  className?: string;
}

// ===== EASING FUNCTIONS =====

/**
 * Easing functions cho smooth animations
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4)
};

// ===== MAIN COMPONENT =====

/**
 * Animated Counter Component
 * Smooth number animation với customizable formatting và easing
 * 
 * Features:
 * - Smooth number transitions với multiple easing options
 * - Customizable formatting functions
 * - Prefix và suffix support
 * - Performance optimized với requestAnimationFrame
 * - TypeScript strict compliance
 * - Accessibility support
 */
export function AnimatedCounter({
  value,
  duration = 1500,
  formatter = (val: number) => val.toString(),
  prefix = '',
  suffix = '',
  startValue = 0,
  easing = 'easeOutQuart',
  onAnimationStart,
  onAnimationEnd,
  className
}: AnimatedCounterProps) {
  // ===== STATE =====
  
  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // ===== REFS =====
  
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number>(startValue);
  
  // ===== ANIMATION LOGIC =====
  
  /**
   * Animation frame function
   * Handle smooth number transitions
   */
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      onAnimationStart?.();
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing function
    const easedProgress = easingFunctions[easing](progress);

    // Calculate current value
    const difference = value - startValueRef.current;
    const newValue = startValueRef.current + (difference * easedProgress);

    setCurrentValue(newValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setCurrentValue(value);
      setIsAnimating(false);
      onAnimationEnd?.();
    }
  }, [duration, easing, value, onAnimationStart, onAnimationEnd]);
  
  /**
   * Start animation
   * Initialize và start the animation
   */
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startTimeRef.current = undefined;
    startValueRef.current = currentValue;
    setIsAnimating(true);

    animationRef.current = requestAnimationFrame(animate);
  }, [currentValue, animate]);
  
  // ===== EFFECTS =====
  
  /**
   * Value change effect
   * Start animation when value changes
   */
  useEffect(() => {
    if (value !== currentValue) {
      startAnimation();
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, currentValue, startAnimation]);
  
  /**
   * Cleanup effect
   * Cancel animation on unmount
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // ===== RENDER HELPERS =====
  
  /**
   * Format display value
   * Apply formatter và add prefix/suffix
   */
  const getDisplayValue = () => {
    const formattedValue = formatter(currentValue);
    return `${prefix}${formattedValue}${suffix}`;
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <span
      className={cn(
        'animated-counter',
        'tabular-nums', // Monospace numbers cho consistent width
        isAnimating && 'animating',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${prefix}${formatter(value)}${suffix}`}
    >
      {getDisplayValue()}
    </span>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Number Counter
 * Counter cho simple numbers
 */
export function NumberCounter(props: Omit<AnimatedCounterProps, 'formatter'>) {
  return (
    <AnimatedCounter
      {...props}
      formatter={(value) => Math.round(value).toLocaleString()}
    />
  );
}

/**
 * Percentage Counter
 * Counter cho percentages
 */
export function PercentageCounter(props: Omit<AnimatedCounterProps, 'formatter' | 'suffix'>) {
  return (
    <AnimatedCounter
      {...props}
      formatter={(value) => (Math.round(value * 10) / 10).toString()}
      suffix="%"
    />
  );
}

/**
 * Currency Counter
 * Counter cho currency values
 */
export function CurrencyCounter(props: Omit<AnimatedCounterProps, 'formatter' | 'prefix'>) {
  return (
    <AnimatedCounter
      {...props}
      formatter={(value) => Math.round(value).toLocaleString()}
      prefix="$"
    />
  );
}

/**
 * Decimal Counter
 * Counter cho decimal numbers
 */
export function DecimalCounter(props: Omit<AnimatedCounterProps, 'formatter'> & { decimals?: number }) {
  const { decimals = 1, ...restProps } = props;
  
  return (
    <AnimatedCounter
      {...restProps}
      formatter={(value) => value.toFixed(decimals)}
    />
  );
}

/**
 * Rating Counter
 * Counter cho rating values (0-5 với 1 decimal)
 */
export function RatingCounter(props: Omit<AnimatedCounterProps, 'formatter'>) {
  return (
    <AnimatedCounter
      {...props}
      formatter={(value) => Math.max(0, Math.min(5, value)).toFixed(1)}
    />
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create custom formatter
 * Helper function để create custom formatters
 */
export function createCustomFormatter(
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
) {
  const {
    decimals,
    prefix = '',
    suffix = '',
    locale = 'vi-VN',
    minimumFractionDigits,
    maximumFractionDigits
  } = options;
  
  return (value: number) => {
    let formattedValue: string;
    
    if (decimals !== undefined) {
      formattedValue = value.toFixed(decimals);
    } else {
      formattedValue = value.toLocaleString(locale, {
        minimumFractionDigits,
        maximumFractionDigits
      });
    }
    
    return `${prefix}${formattedValue}${suffix}`;
  };
}

/**
 * Create duration based on value difference
 * Helper function để calculate optimal animation duration
 */
export function calculateOptimalDuration(
  startValue: number,
  endValue: number,
  baseDuration: number = 1500,
  maxDuration: number = 3000
): number {
  const difference = Math.abs(endValue - startValue);
  
  if (difference === 0) return 0;
  if (difference < 10) return baseDuration * 0.5;
  if (difference < 100) return baseDuration;
  if (difference < 1000) return baseDuration * 1.5;
  
  return Math.min(baseDuration * 2, maxDuration);
}

// ===== EXPORTS =====

export default AnimatedCounter;
