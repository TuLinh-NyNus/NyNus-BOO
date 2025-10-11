/**
 * Notification Badge Component
 * Hiển thị số lượng notification với animation và accessibility support
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface NotificationBadgeProps {
  /** Số lượng notification */
  count: number;
  /** Hiển thị badge khi count = 0 */
  showZero?: boolean;
  /** Số tối đa hiển thị (vượt quá sẽ hiển thị "99+") */
  maxCount?: number;
  /** Kích thước badge */
  size?: 'sm' | 'md' | 'lg';
  /** Variant màu sắc */
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  /** Animation khi có notification mới */
  animate?: boolean;
  /** Pulse animation cho notification mới */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label cho accessibility */
  ariaLabel?: string;
  /** Click handler */
  onClick?: () => void;
}

// ===== CONSTANTS =====

const SIZE_CONFIG = {
  sm: {
    badge: 'h-4 w-4 text-[10px] min-w-[16px]',
    dot: 'h-2 w-2'
  },
  md: {
    badge: 'h-5 w-5 text-xs min-w-[20px]',
    dot: 'h-2.5 w-2.5'
  },
  lg: {
    badge: 'h-6 w-6 text-sm min-w-[24px]',
    dot: 'h-3 w-3'
  }
} as const;

const VARIANT_CONFIG = {
  default: 'bg-primary text-primary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  warning: 'bg-yellow-500 text-yellow-50',
  success: 'bg-green-500 text-green-50'
} as const;

// ===== COMPONENT =====

export const NotificationBadge = memo<NotificationBadgeProps>(({
  count,
  showZero = false,
  maxCount = 99,
  size = 'md',
  variant = 'destructive',
  animate = true,
  pulse = false,
  className = '',
  ariaLabel,
  onClick
}) => {
  // ===== STATE =====
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  // ===== EFFECTS =====

  // Trigger animation khi count thay đổi
  useEffect(() => {
    if (animate && count > prevCount && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, prevCount, animate]);

  // ===== COMPUTED VALUES =====

  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  // Không hiển thị nếu count = 0 và showZero = false
  if (count === 0 && !showZero) {
    return null;
  }

  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Chỉ hiển thị dot nếu count = 0 nhưng showZero = true
  const showDot = count === 0 && showZero;

  // ===== RENDER =====

  const badgeClasses = cn(
    // Base styles
    'inline-flex items-center justify-center rounded-full font-medium',
    'border-2 border-background shadow-sm',
    
    // Size styles
    showDot ? sizeConfig.dot : sizeConfig.badge,
    
    // Variant styles
    variantConfig,
    
    // Animation styles
    {
      'animate-bounce': isAnimating,
      'animate-pulse': pulse && count > 0,
      'scale-110': isAnimating,
      'transition-all duration-300 ease-out': animate,
    },
    
    // Interactive styles
    {
      'cursor-pointer hover:scale-105 active:scale-95': onClick,
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1': onClick,
    },
    
    className
  );

  const Component = onClick ? 'button' : 'span';
  const componentProps = onClick ? {
    onClick,
    'aria-label': ariaLabel || `${count} thông báo chưa đọc`,
    role: 'button',
    tabIndex: 0,
    type: 'button' as const
  } : {
    'aria-label': ariaLabel || `${count} thông báo chưa đọc`,
    role: 'status',
    'aria-live': 'polite' as const
  };

  return (
    <Component 
      className={badgeClasses}
      {...componentProps}
    >
      {!showDot && (
        <span className="leading-none">
          {displayCount}
        </span>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">
        {count === 0 
          ? 'Không có thông báo mới'
          : count === 1 
            ? '1 thông báo chưa đọc'
            : `${count} thông báo chưa đọc`
        }
      </span>
    </Component>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

// ===== EXPORT =====

export default NotificationBadge;

// ===== UTILITY HOOKS =====

/**
 * Hook để quản lý notification count với animation
 */
export const useNotificationBadge = (initialCount = 0) => {
  const [count, setCount] = useState(initialCount);
  const [isNew, setIsNew] = useState(false);

  const incrementCount = (amount = 1) => {
    setCount(prev => prev + amount);
    setIsNew(true);
    
    // Reset isNew sau 3 giây
    setTimeout(() => setIsNew(false), 3000);
  };

  const decrementCount = (amount = 1) => {
    setCount(prev => Math.max(0, prev - amount));
  };

  const resetCount = () => {
    setCount(0);
    setIsNew(false);
  };

  const setCountValue = (newCount: number) => {
    const wasZero = count === 0;
    setCount(Math.max(0, newCount));
    
    if (wasZero && newCount > 0) {
      setIsNew(true);
      setTimeout(() => setIsNew(false), 3000);
    }
  };

  return {
    count,
    isNew,
    incrementCount,
    decrementCount,
    resetCount,
    setCount: setCountValue
  };
};

// ===== EXAMPLES =====

/**
 * Example usage:
 * 
 * // Basic usage
 * <NotificationBadge count={5} />
 * 
 * // With custom styling
 * <NotificationBadge 
 *   count={12} 
 *   size="lg" 
 *   variant="warning"
 *   pulse={true}
 * />
 * 
 * // With click handler
 * <NotificationBadge 
 *   count={3} 
 *   onClick={() => openNotifications()}
 *   ariaLabel="Mở danh sách thông báo"
 * />
 * 
 * // Using hook
 * const { count, incrementCount, resetCount } = useNotificationBadge(0);
 * 
 * <NotificationBadge 
 *   count={count}
 *   onClick={resetCount}
 * />
 */
