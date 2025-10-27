/**
 * Page Transition Component
 * =========================
 * 
 * Smooth page transitions using Framer Motion
 * Cải thiện UX khi chuyển trang với fade-in/fade-out animations
 * 
 * Features:
 * - Fade-in animation khi page load
 * - Fade-out animation khi page unload
 * - Fast duration (250ms) cho smooth experience
 * - Không block navigation
 * - Mobile responsive
 * 
 * Usage:
 * ```tsx
 * // Wrap page content
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// ===== TYPES =====

export interface PageTransitionProps {
  /** Page content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Animation duration (ms) */
  duration?: number;
  /** Enable/disable transition */
  enabled?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_DURATION = 0.25; // 250ms - fast and smooth

// ===== ANIMATIONS =====

/**
 * Page transition variants
 *
 * Technical Implementation:
 * - initial: Fade-out + slight upward movement
 * - animate: Fade-in + return to normal position
 * - exit: Fade-out + slight downward movement
 *
 * Note: Transition config moved to motion.div to avoid TypeScript errors
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

// ===== COMPONENT =====

/**
 * Page Transition Component
 * 
 * Business Logic:
 * - Wrap page content với fade animations
 * - Sử dụng pathname làm key để trigger animation khi route change
 * - AnimatePresence handle mount/unmount animations
 * 
 * Technical Implementation:
 * - Framer Motion cho smooth animations
 * - usePathname để detect route changes
 * - mode="wait" để đợi exit animation hoàn thành trước khi show new page
 */
export function PageTransition({
  children,
  className,
  duration = DEFAULT_DURATION,
  enabled = true,
}: PageTransitionProps): JSX.Element {
  const pathname = usePathname();

  // If transitions disabled, render children directly
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: 'easeInOut',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Fast Page Transition (150ms)
 * Cho các trang cần transition nhanh hơn
 */
export function FastPageTransition({
  children,
  className,
}: Omit<PageTransitionProps, 'duration' | 'enabled'>): JSX.Element {
  return (
    <PageTransition duration={0.15} className={className}>
      {children}
    </PageTransition>
  );
}

/**
 * Slow Page Transition (400ms)
 * Cho các trang cần transition chậm hơn (hero pages, landing pages)
 */
export function SlowPageTransition({
  children,
  className,
}: Omit<PageTransitionProps, 'duration' | 'enabled'>): JSX.Element {
  return (
    <PageTransition duration={0.4} className={className}>
      {children}
    </PageTransition>
  );
}

/**
 * No Transition
 * Disable transitions cho specific pages
 */
export function NoTransition({
  children,
  className,
}: Omit<PageTransitionProps, 'duration' | 'enabled'>): JSX.Element {
  return (
    <PageTransition enabled={false} className={className}>
      {children}
    </PageTransition>
  );
}

// ===== EXPORT =====

export default PageTransition;

