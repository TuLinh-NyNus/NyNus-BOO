/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent banner
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateConsent } from '@/lib/analytics';

// ===== CONSTANTS =====

const CONSENT_COOKIE_NAME = 'nynus_cookie_consent';

// ===== TYPES =====

export interface CookieConsentProps {
  /** Custom className */
  className?: string;
  /** Position of banner */
  position?: 'bottom' | 'top';
  /** Show privacy policy link */
  showPrivacyLink?: boolean;
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Set cookie consent in localStorage
 */
function setConsentCookie(accepted: boolean): void {
  const consent = {
    accepted,
    timestamp: new Date().toISOString(),
    version: '1.0',
  };
  
  try {
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consent));
  } catch (error) {
    console.error('Error saving consent:', error);
  }
}

/**
 * Get cookie consent from localStorage
 */
function getConsentCookie(): boolean | null {
  try {
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!consent) return null;
    
    const parsed = JSON.parse(consent);
    return parsed.accepted;
  } catch (error) {
    console.error('Error reading consent:', error);
    return null;
  }
}

// ===== MAIN COMPONENT =====

/**
 * Cookie Consent Banner Component
 * Hiển thị banner xin phép sử dụng cookies theo GDPR
 * 
 * @example
 * ```tsx
 * <CookieConsent 
 *   position="bottom"
 *   showPrivacyLink={true}
 *   privacyPolicyUrl="/privacy"
 * />
 * ```
 */
export function CookieConsent({
  className,
  position = 'bottom',
  showPrivacyLink = true,
  privacyPolicyUrl = '/privacy',
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Check consent status on mount
  useEffect(() => {
    const consent = getConsentCookie();
    if (consent === null) {
      // No consent yet, show banner
      setIsVisible(true);
    } else {
      // Already consented, update GA4
      updateConsent(consent);
    }
  }, []);

  // Handle accept
  const handleAccept = () => {
    setConsentCookie(true);
    updateConsent(true);
    closeBanner();
  };

  // Handle decline
  const handleDecline = () => {
    setConsentCookie(false);
    updateConsent(false);
    closeBanner();
  };

  // Close banner with animation
  const closeBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 p-4 transition-all duration-300',
        position === 'bottom' ? 'bottom-0' : 'top-0',
        isClosing && (position === 'bottom' ? 'translate-y-full' : '-translate-y-full'),
        'animate-in',
        position === 'bottom' ? 'slide-in-from-bottom' : 'slide-in-from-top',
        className
      )}
    >
      <div className="container mx-auto max-w-6xl">
        <div
          className={cn(
            'relative flex flex-col gap-4 rounded-lg border p-6 shadow-lg',
            'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
            'dark:border-border dark:bg-card/95',
            'md:flex-row md:items-center md:gap-6'
          )}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chúng tôi sử dụng cookies
            </h3>
            <p className="text-sm text-muted-foreground">
              Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng và phân tích lưu lượng truy cập.
              Bằng cách nhấp &quot;Chấp nhận&quot;, bạn đồng ý với việc sử dụng cookies của chúng tôi.
              {showPrivacyLink && (
                <>
                  {' '}
                  <a
                    href={privacyPolicyUrl}
                    className="underline hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tìm hiểu thêm
                  </a>
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="order-2 sm:order-1"
            >
              Từ chối
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="order-1 sm:order-2"
            >
              Chấp nhận
            </Button>
          </div>

          {/* Close button */}
          <button
            onClick={closeBanner}
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity',
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'md:right-6 md:top-6'
            )}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  const consent = getConsentCookie();
  return consent === true;
}

/**
 * Reset consent (for testing)
 */
export function resetConsent(): void {
  try {
    localStorage.removeItem(CONSENT_COOKIE_NAME);
  } catch (error) {
    console.error('Error resetting consent:', error);
  }
}

// ===== EXPORTS =====
export default CookieConsent;

