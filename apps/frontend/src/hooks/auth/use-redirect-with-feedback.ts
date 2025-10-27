/**
 * useRedirectWithFeedback Hook
 * =============================
 * 
 * Custom hook để redirect với UX feedback (toast + loading overlay)
 * Cải thiện trải nghiệm người dùng khi chuyển hướng authentication
 * 
 * Features:
 * - Show toast notification trước khi redirect
 * - Show loading overlay với animation
 * - Configurable delay để animation hoàn thành
 * - Type-safe redirect functions
 * - Auto cleanup
 * 
 * Usage:
 * ```tsx
 * const { redirectToLogin, redirectToDashboard } = useRedirectWithFeedback();
 * 
 * // Redirect to login with feedback
 * redirectToLogin('/dashboard');
 * 
 * // Redirect to dashboard with custom message
 * redirectToDashboard({ message: 'Đăng nhập thành công!' });
 * ```
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { redirectToast } from '@/components/ui/feedback/enhanced-toast';

// ===== TYPES =====

export interface RedirectOptions {
  /** Custom message to display in toast */
  message?: string;
  /** Custom description for toast */
  description?: string;
  /** Show loading overlay */
  showLoading?: boolean;
  /** Delay before redirect (ms) - allows animation to complete */
  delay?: number;
  /** Variant for loading overlay */
  variant?: 'login' | 'dashboard' | 'unauthorized' | 'default';
}

export interface RedirectState {
  /** Is redirect in progress */
  isRedirecting: boolean;
  /** Redirect variant */
  variant: RedirectOptions['variant'];
  /** Custom message */
  message?: string;
  /** Custom description */
  description?: string;
}

export interface UseRedirectWithFeedbackReturn {
  /** Redirect to login page with feedback */
  redirectToLogin: (callbackUrl?: string, options?: RedirectOptions) => void;
  /** Redirect to dashboard with feedback */
  redirectToDashboard: (options?: RedirectOptions) => void;
  /** Redirect to any URL with feedback */
  redirectWithFeedback: (url: string, options?: RedirectOptions) => void;
  /** Current redirect state */
  redirectState: RedirectState;
  /** Cancel pending redirect */
  cancelRedirect: () => void;
}

// ===== CONSTANTS =====

const DEFAULT_DELAY = 200; // 200ms - enough for toast to show
const DEFAULT_OPTIONS: RedirectOptions = {
  showLoading: true,
  delay: DEFAULT_DELAY,
  variant: 'default',
};

// ===== HOOK =====

/**
 * useRedirectWithFeedback Hook
 * 
 * Business Logic:
 * 1. Show toast notification
 * 2. Update redirect state (triggers loading overlay)
 * 3. Wait for delay (animation time)
 * 4. Execute redirect
 * 5. Cleanup state
 * 
 * Technical Implementation:
 * - Uses useRouter for navigation
 * - Uses useState for redirect state
 * - Uses useRef for timeout cleanup
 * - Uses useCallback for stable function references
 * - Auto cleanup on unmount
 */
export function useRedirectWithFeedback(): UseRedirectWithFeedbackReturn {
  const router = useRouter();
  const [redirectState, setRedirectState] = useState<RedirectState>({
    isRedirecting: false,
    variant: 'default',
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Cancel pending redirect
   */
  const cancelRedirect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRedirectState({
      isRedirecting: false,
      variant: 'default',
    });
  }, []);

  /**
   * Core redirect function with feedback
   * 
   * @param url - Target URL
   * @param options - Redirect options
   */
  const redirectWithFeedback = useCallback(
    (url: string, options: RedirectOptions = {}) => {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const { message, description, showLoading, delay, variant } = mergedOptions;

      // Step 1: Show toast notification
      // Business Logic: Thông báo cho user biết đang chuyển hướng
      if (message || description) {
        // Custom toast if message provided
        redirectToast.redirectingToPage(message || 'trang mới');
      }

      // Step 2: Update redirect state (triggers loading overlay if enabled)
      if (showLoading) {
        setRedirectState({
          isRedirecting: true,
          variant: variant || 'default',
          message,
          description,
        });
      }

      // Step 3: Wait for delay, then redirect
      // Technical: Cho phép animation hoàn thành trước khi redirect
      timeoutRef.current = setTimeout(() => {
        // Step 4: Execute redirect
        router.push(url);

        // Step 5: Cleanup state after redirect
        // Note: Component may unmount before this runs (expected)
        setRedirectState({
          isRedirecting: false,
          variant: 'default',
        });
      }, delay || DEFAULT_DELAY);
    },
    [router]
  );

  /**
   * Redirect to login page
   * 
   * Business Logic:
   * - Chuyển hướng user đến trang đăng nhập
   * - Lưu callbackUrl để redirect lại sau khi đăng nhập
   * 
   * @param callbackUrl - URL to redirect after login
   * @param options - Redirect options
   */
  const redirectToLogin = useCallback(
    (callbackUrl?: string, options: RedirectOptions = {}) => {
      // Show login-specific toast
      redirectToast.redirectingToLogin();

      // Build login URL with callback
      const loginUrl = callbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/login';

      // Redirect with login variant
      redirectWithFeedback(loginUrl, {
        ...options,
        variant: 'login',
      });
    },
    [redirectWithFeedback]
  );

  /**
   * Redirect to dashboard
   * 
   * Business Logic:
   * - Chuyển hướng user đến dashboard (trang chủ sau đăng nhập)
   * 
   * @param options - Redirect options
   */
  const redirectToDashboard = useCallback(
    (options: RedirectOptions = {}) => {
      // Show dashboard-specific toast
      redirectToast.redirectingToDashboard();

      // Redirect with dashboard variant
      redirectWithFeedback('/dashboard', {
        ...options,
        variant: 'dashboard',
      });
    },
    [redirectWithFeedback]
  );

  return {
    redirectToLogin,
    redirectToDashboard,
    redirectWithFeedback,
    redirectState,
    cancelRedirect,
  };
}

// ===== EXPORT =====

export default useRedirectWithFeedback;

