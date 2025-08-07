'use client';

import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress
} from '@/components/ui';
import logger from '@/lib/utils/logger';

/**
 * Auto Logout Warning Component
 * 
 * Hiển thị cảnh báo trước khi tự động đăng xuất:
 * - Countdown timer
 * - Tùy chọn gia hạn session
 * - Tự động đăng xuất khi hết thời gian
 * - Visual progress indicator
 */

interface AutoLogoutWarningProps {
  // Thời gian cảnh báo trước khi logout (seconds)
  warningTime?: number;
  // Callback khi user chọn gia hạn session
  onExtendSession?: () => Promise<void>;
  // Callback khi logout
  onLogout?: () => Promise<void>;
  // Session expiry time - có thể là Date, string, hoặc null
  sessionExpiresAt?: Date | string | null;
}

export function AutoLogoutWarning({
  warningTime = 300, // 5 minutes default
  onExtendSession,
  onLogout,
  sessionExpiresAt,
}: AutoLogoutWarningProps): JSX.Element | null {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExtending, setIsExtending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Tính toán thời gian còn lại
  const calculateTimeLeft = useCallback(() => {
    if (!sessionExpiresAt) return 0;

    try {
      const now = new Date().getTime();
      // Xử lý cả Date object và string
      const expiryTime = sessionExpiresAt instanceof Date
        ? sessionExpiresAt.getTime()
        : new Date(sessionExpiresAt).getTime();

      // Kiểm tra validity của date
      if (isNaN(expiryTime)) {
        logger.warn('Invalid sessionExpiresAt value:', sessionExpiresAt);
        return 0;
      }

      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      return remaining;
    } catch (error) {
      logger.error('Error calculating time left:', error);
      return 0;
    }
  }, [sessionExpiresAt]);

  // Effect để theo dõi thời gian session
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Hiển thị warning khi còn warningTime giây
      if (remaining <= warningTime && remaining > 0 && !isOpen) {
        setIsOpen(true);
      }

      // Auto logout khi hết thời gian
      if (remaining <= 0) {
        handleAutoLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt, warningTime, isOpen, calculateTimeLeft]);

  // Format thời gian hiển thị
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Tính progress percentage
  const getProgressPercentage = (): number => {
    if (timeLeft <= 0) return 0;
    return (timeLeft / warningTime) * 100;
  };

  // Xử lý gia hạn session
  const handleExtendSession = async () => {
    if (!onExtendSession) return;

    setIsExtending(true);
    try {
      await onExtendSession();
      setIsOpen(false);
      setTimeLeft(0);
    } catch (error) {
      logger.error('Failed to extend session:', error);
      // Có thể hiển thị toast error ở đây
    } finally {
      setIsExtending(false);
    }
  };

  // Xử lý logout thủ công
  const handleManualLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
      router.push('/auth/login');
    } catch (error) {
      logger.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Xử lý auto logout
  const handleAutoLogout = async () => {
    setIsOpen(false);
    try {
      if (onLogout) {
        await onLogout();
      }
      router.push('/auth/login?reason=session_expired');
    } catch (error) {
      logger.error('Failed to auto logout:', error);
      router.push('/auth/login?reason=session_expired');
    }
  };

  // Đóng dialog (chỉ khi còn thời gian)
  const handleClose = () => {
    if (timeLeft > 0) {
      setIsOpen(false);
    }
  };

  if (!isOpen || timeLeft <= 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Cảnh báo hết phiên đăng nhập
          </DialogTitle>
          <DialogDescription>
            Phiên đăng nhập của bạn sắp hết hạn. Bạn có muốn gia hạn không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Countdown display */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-orange-600">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Thời gian còn lại
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={getProgressPercentage()} 
              className="h-2"
            />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(getProgressPercentage())}% thời gian còn lại
            </p>
          </div>

          {/* Warning message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Lưu ý:</strong> Nếu không có hành động nào, bạn sẽ được tự động đăng xuất 
              để bảo mật tài khoản.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleManualLogout}
            disabled={isExtending || isLoggingOut}
            className="w-full sm:w-auto"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng xuất...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất ngay
              </>
            )}
          </Button>
          
          <Button
            onClick={handleExtendSession}
            disabled={isExtending || isLoggingOut || !onExtendSession}
            className="w-full sm:w-auto"
          >
            {isExtending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang gia hạn...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Gia hạn phiên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook để sử dụng auto logout warning
export function useAutoLogoutWarning({
  warningTime = 300,
  onExtendSession,
  onLogout,
}: {
  warningTime?: number;
  onExtendSession?: () => Promise<void>;
  onLogout?: () => Promise<void>;
}): {
  showWarning: boolean;
  timeRemaining: number;
  extendSession: () => void;
  logout: () => void;
  sessionExpiresAt: Date | string | null;
  updateSessionExpiry: (expiresAt: Date | string) => void;
  clearSessionExpiry: () => void;
  AutoLogoutWarningComponent: () => JSX.Element | null;
} {
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | string | null>(null);

  // Update session expiry time - hỗ trợ cả Date và string
  const updateSessionExpiry = useCallback((expiresAt: Date | string) => {
    setSessionExpiresAt(expiresAt);
  }, []);

  // Clear session expiry
  const clearSessionExpiry = useCallback(() => {
    setSessionExpiresAt(null);
  }, []);

  return {
    showWarning: false, // Placeholder - implement actual logic
    timeRemaining: 0, // Placeholder - implement actual logic
    extendSession: () => {}, // Placeholder - implement actual logic
    logout: () => {}, // Placeholder - implement actual logic
    sessionExpiresAt,
    updateSessionExpiry,
    clearSessionExpiry,
    AutoLogoutWarningComponent: () => (
      <AutoLogoutWarning
        warningTime={warningTime}
        onExtendSession={onExtendSession}
        onLogout={onLogout}
        sessionExpiresAt={sessionExpiresAt}
      />
    ),
  };
}
