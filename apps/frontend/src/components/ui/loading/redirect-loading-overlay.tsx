/**
 * Redirect Loading Overlay Component
 * ===================================
 * 
 * Full-screen loading overlay hiển thị khi redirect authentication
 * Cải thiện UX bằng cách show feedback trước khi chuyển trang
 * 
 * Features:
 * - Smooth fade-in/fade-out animations (Framer Motion)
 * - Backdrop blur effect
 * - Customizable message
 * - Auto-hide sau redirect
 * - Mobile responsive
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn, Home, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface RedirectLoadingOverlayProps {
  /** Hiển thị overlay */
  isVisible: boolean;
  /** Thông điệp hiển thị */
  message?: string;
  /** Mô tả chi tiết */
  description?: string;
  /** Loại redirect */
  variant?: 'login' | 'dashboard' | 'unauthorized' | 'default';
  /** Custom className */
  className?: string;
}

// ===== CONSTANTS =====

const ANIMATION_DURATION = 0.25; // 250ms - fast and smooth

const VARIANT_CONFIG = {
  login: {
    icon: LogIn,
    defaultMessage: 'Đang chuyển hướng...',
    defaultDescription: 'Bạn sẽ được chuyển đến trang đăng nhập',
    iconColor: 'text-blue-500',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-cyan-500/20',
  },
  dashboard: {
    icon: Home,
    defaultMessage: 'Đang chuyển hướng...',
    defaultDescription: 'Bạn sẽ được chuyển đến trang chủ',
    iconColor: 'text-green-500',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-emerald-500/20',
  },
  unauthorized: {
    icon: Shield,
    defaultMessage: 'Không có quyền truy cập',
    defaultDescription: 'Bạn sẽ được chuyển hướng đến trang phù hợp',
    iconColor: 'text-orange-500',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-red-500/20',
  },
  default: {
    icon: Loader2,
    defaultMessage: 'Đang chuyển hướng...',
    defaultDescription: 'Vui lòng đợi trong giây lát',
    iconColor: 'text-primary',
    gradientFrom: 'from-primary/20',
    gradientTo: 'to-primary/10',
  },
} as const;

// ===== ANIMATIONS =====

const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

// ===== COMPONENT =====

/**
 * Redirect Loading Overlay Component
 * 
 * Business Logic:
 * - Hiển thị overlay khi isVisible = true
 * - Tự động fade-out khi isVisible = false
 * - Sử dụng AnimatePresence để handle mount/unmount animations
 * 
 * Technical Implementation:
 * - Framer Motion cho smooth animations
 * - Backdrop blur cho modern look
 * - Fixed positioning để cover toàn màn hình
 * - z-index 9999 để luôn ở trên cùng
 */
export function RedirectLoadingOverlay({
  isVisible,
  message,
  description,
  variant = 'default',
  className,
}: RedirectLoadingOverlayProps): JSX.Element | null {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const displayMessage = message || config.defaultMessage;
  const displayDescription = description || config.defaultDescription;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{
            duration: ANIMATION_DURATION,
            ease: 'easeInOut',
          }}
          className={cn(
            // Layout
            'fixed inset-0 z-[9999]',
            // Background
            'bg-background/80 backdrop-blur-md',
            // Flexbox centering
            'flex items-center justify-center',
            // Prevent interaction
            'pointer-events-auto',
            className
          )}
          // Prevent scroll when overlay is visible
          style={{ overflow: 'hidden' }}
        >
          {/* Content Card */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{
              duration: ANIMATION_DURATION,
              ease: 'easeOut',
              delay: 0.05,
            }}
            className={cn(
              // Layout
              'relative',
              'max-w-sm w-full mx-4',
              // Background with gradient
              'bg-card/95 backdrop-blur-xl',
              `bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo}`,
              // Border
              'border border-border/50',
              // Rounded corners
              'rounded-2xl',
              // Shadow
              'shadow-2xl',
              // Padding
              'p-8',
              // Text alignment
              'text-center'
            )}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={cn(
                  'relative',
                  'w-16 h-16',
                  'rounded-full',
                  'bg-background/50',
                  'flex items-center justify-center',
                  'border border-border/30'
                )}
              >
                <Icon
                  className={cn(
                    'w-8 h-8',
                    config.iconColor,
                    variant === 'default' && 'animate-spin'
                  )}
                />
              </div>
            </div>

            {/* Message */}
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {displayMessage}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {displayDescription}
            </p>

            {/* Loading Dots Animation */}
            <div className="flex justify-center items-center gap-1.5 mt-6">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={cn('w-2 h-2 rounded-full', config.iconColor.replace('text-', 'bg-'))}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Login Redirect Overlay
 */
export function LoginRedirectOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <RedirectLoadingOverlay
      isVisible={isVisible}
      variant="login"
    />
  );
}

/**
 * Dashboard Redirect Overlay
 */
export function DashboardRedirectOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <RedirectLoadingOverlay
      isVisible={isVisible}
      variant="dashboard"
    />
  );
}

/**
 * Unauthorized Redirect Overlay
 */
export function UnauthorizedRedirectOverlay({ isVisible }: { isVisible: boolean }) {
  return (
    <RedirectLoadingOverlay
      isVisible={isVisible}
      variant="unauthorized"
    />
  );
}

