/**
 * Token Expiry Notification Component
 * ===================================
 * 
 * Displays warning when JWT token is about to expire
 * Provides proactive notification to users before token expiry
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 1 Quick Fix
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/auth-context-grpc';

/**
 * Token expiry warning thresholds (in seconds)
 */
const WARNING_THRESHOLDS = {
  CRITICAL: 2 * 60, // 2 minutes - show critical warning
  WARNING: 5 * 60,  // 5 minutes - show warning
  INFO: 10 * 60,    // 10 minutes - show info
} as const;

/**
 * Notification severity levels
 */
type NotificationSeverity = 'info' | 'warning' | 'critical';

/**
 * Notification state interface
 */
interface NotificationState {
  show: boolean;
  severity: NotificationSeverity;
  timeLeft: number;
  message: string;
}

/**
 * Token Expiry Notification Component
 */
export function TokenExpiryNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    severity: 'info',
    timeLeft: 0,
    message: '',
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, refreshToken } = useAuth();

  /**
   * Format time remaining in human-readable format
   */
  const formatTimeLeft = useCallback((seconds: number): string => {
    if (seconds <= 0) return '0 giây';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} phút ${remainingSeconds} giây`;
    }
    return `${remainingSeconds} giây`;
  }, []);

  /**
   * Get notification severity based on time left
   */
  const getSeverity = useCallback((timeLeft: number): NotificationSeverity => {
    if (timeLeft <= WARNING_THRESHOLDS.CRITICAL) return 'critical';
    if (timeLeft <= WARNING_THRESHOLDS.WARNING) return 'warning';
    return 'info';
  }, []);

  /**
   * Get notification message based on severity
   */
  const getMessage = useCallback((severity: NotificationSeverity, timeLeft: number): string => {
    const timeString = formatTimeLeft(timeLeft);
    
    switch (severity) {
      case 'critical':
        return `Phiên đăng nhập sẽ hết hạn trong ${timeString}. Vui lòng lưu công việc ngay!`;
      case 'warning':
        return `Phiên đăng nhập sẽ hết hạn trong ${timeString}. Hệ thống sẽ tự động làm mới.`;
      case 'info':
        return `Phiên đăng nhập còn ${timeString}. Hệ thống sẽ tự động làm mới khi cần.`;
      default:
        return `Phiên đăng nhập còn ${timeString}.`;
    }
  }, [formatTimeLeft]);

  /**
   * Check token expiry and update notification state
   */
  const checkTokenExpiry = useCallback(() => {
    // Only check if user is authenticated
    if (!user) {
      setNotification(prev => ({ ...prev, show: false }));
      return;
    }

    const token = AuthHelpers.getAccessToken();
    if (!token) {
      setNotification(prev => ({ ...prev, show: false }));
      return;
    }

    const expiration = AuthHelpers.getTokenExpiration(token);
    if (!expiration) {
      setNotification(prev => ({ ...prev, show: false }));
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = expiration - currentTime;

    // Don't show notification if token has plenty of time left
    if (timeLeft > WARNING_THRESHOLDS.INFO) {
      setNotification(prev => ({ ...prev, show: false }));
      return;
    }

    // Token is expiring soon - show notification
    const severity = getSeverity(timeLeft);
    const message = getMessage(severity, timeLeft);

    setNotification({
      show: true,
      severity,
      timeLeft,
      message,
    });

    logger.debug('[TokenExpiryNotification] Token expiry check', {
      timeLeft,
      severity,
      expiration,
      currentTime,
    });
  }, [user, getSeverity, getMessage]);

  /**
   * Handle manual token refresh
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      logger.info('[TokenExpiryNotification] Manual token refresh triggered');
      
      await refreshToken();
      
      // Hide notification after successful refresh
      setNotification(prev => ({ ...prev, show: false }));
      
      logger.info('[TokenExpiryNotification] Manual token refresh successful');
    } catch (error) {
      logger.error('[TokenExpiryNotification] Manual token refresh failed:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      // Don't hide notification on error - let user try again
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshToken]);

  /**
   * Handle notification dismiss
   */
  const handleDismiss = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
    logger.debug('[TokenExpiryNotification] Notification dismissed by user');
  }, []);

  /**
   * Set up token expiry checking interval
   */
  useEffect(() => {
    // Initial check
    checkTokenExpiry();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [checkTokenExpiry]);

  // Don't render if notification should not be shown
  if (!notification.show) {
    return null;
  }

  // Get alert styling based on severity
  const getAlertClassName = (severity: NotificationSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100';
      default:
        return '';
    }
  };

  // Get icon based on severity
  const getIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Alert 
      className={`fixed top-4 right-4 z-50 max-w-md shadow-lg ${getAlertClassName(notification.severity)}`}
    >
      {getIcon(notification.severity)}
      <AlertTitle className="flex items-center justify-between">
        <span>Thông báo phiên đăng nhập</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p className="text-sm">
            {notification.message}
          </p>
          
          {/* Show refresh button for warning and critical states */}
          {(notification.severity === 'warning' || notification.severity === 'critical') && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Đang làm mới...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Làm mới ngay
                  </>
                )}
              </Button>
              
              {notification.severity === 'critical' && (
                <span className="text-xs font-medium">
                  Khuyến nghị lưu công việc!
                </span>
              )}
            </div>
          )}
          
          {/* Show countdown for critical state */}
          {notification.severity === 'critical' && (
            <div className="text-xs font-mono bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
              Còn lại: {formatTimeLeft(notification.timeLeft)}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Export component and types
 */
export type { NotificationSeverity };
export default TokenExpiryNotification;



