import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, AlertTriangle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionInfo {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceName: string;
  location: string;
  lastActivity: Date;
  isCurrent?: boolean;
}

interface SessionLimitWarningProps {
  currentSessionCount: number;
  maxSessions?: number;
  sessions?: SessionInfo[];
  onViewSessions?: () => void;
  onTerminateOldest?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'warning' | 'error';
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Monitor,
};

export function SessionLimitWarning({
  currentSessionCount,
  maxSessions = 3,
  sessions = [],
  onViewSessions,
  onTerminateOldest,
  onDismiss,
  className,
  variant = 'warning',
}: SessionLimitWarningProps) {
  const isAtLimit = currentSessionCount >= maxSessions;
  const isOverLimit = currentSessionCount > maxSessions;

  const getAlertVariant = () => {
    if (variant === 'error' || isOverLimit) return 'destructive';
    return 'default';
  };

  const getBgColor = () => {
    if (variant === 'error' || isOverLimit) {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-orange-50 border-orange-200';
  };

  const getTextColor = () => {
    if (variant === 'error' || isOverLimit) {
      return 'text-red-800';
    }
    return 'text-orange-800';
  };

  const getTitle = () => {
    if (isOverLimit) {
      return 'Vượt quá giới hạn phiên đăng nhập';
    }
    if (isAtLimit) {
      return 'Đã đạt giới hạn phiên đăng nhập';
    }
    return 'Sắp đạt giới hạn phiên đăng nhập';
  };

  const getMessage = () => {
    if (isOverLimit) {
      return `Bạn có ${currentSessionCount} phiên đăng nhập đang hoạt động, vượt quá giới hạn cho phép (${maxSessions}). Một số phiên cũ có thể bị ngắt kết nối tự động.`;
    }
    if (isAtLimit) {
      return `Bạn đã sử dụng tối đa ${maxSessions} phiên đăng nhập đồng thời. Để đăng nhập trên thiết bị mới, bạn cần kết thúc một phiên hiện tại.`;
    }
    return `Bạn đang sử dụng ${currentSessionCount}/${maxSessions} phiên đăng nhập. Sắp đạt giới hạn cho phép.`;
  };

  return (
    <Alert
      variant={getAlertVariant()}
      className={cn(
        getBgColor(),
        'border-l-4',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      
      <AlertDescription className={getTextColor()}>
        <div className="space-y-3">
          {/* Title and message */}
          <div>
            <div className="font-semibold mb-1">{getTitle()}</div>
            <div className="text-sm">{getMessage()}</div>
          </div>

          {/* Session list (if provided and not too many) */}
          {sessions.length > 0 && sessions.length <= 5 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Phiên đang hoạt động:</div>
              <div className="space-y-1">
                {sessions.map((session) => {
                  const DeviceIcon = deviceIcons[session.deviceType];
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 bg-white/50 rounded text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <DeviceIcon className="h-3 w-3" />
                        <span className="font-medium">{session.deviceName}</span>
                        {session.isCurrent && (
                          <span className="text-blue-600">(Hiện tại)</span>
                        )}
                      </div>
                      <span className="text-gray-600">{session.location}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {onViewSessions && (
              <Button
                size="sm"
                variant="outline"
                onClick={onViewSessions}
                className="text-xs"
              >
                <Monitor className="h-3 w-3 mr-1" />
                Quản lý phiên
              </Button>
            )}
            
            {onTerminateOldest && isAtLimit && (
              <Button
                size="sm"
                variant="outline"
                onClick={onTerminateOldest}
                className="text-xs"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Kết thúc phiên cũ nhất
              </Button>
            )}

            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-xs ml-auto"
              >
                Đóng
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Preset components for common scenarios
export function SessionLimitReachedWarning({
  sessions,
  onViewSessions,
  onTerminateOldest,
  ...props
}: Omit<SessionLimitWarningProps, 'currentSessionCount' | 'variant'> & { sessions: SessionInfo[] }) {
  return (
    <SessionLimitWarning
      currentSessionCount={3}
      maxSessions={3}
      sessions={sessions}
      variant="warning"
      onViewSessions={onViewSessions}
      onTerminateOldest={onTerminateOldest}
      {...props}
    />
  );
}

export function SessionLimitExceededError({
  sessions,
  currentSessionCount,
  onViewSessions,
  ...props
}: Omit<SessionLimitWarningProps, 'variant'> & { 
  sessions: SessionInfo[];
  currentSessionCount: number;
}) {
  return (
    <SessionLimitWarning
      currentSessionCount={currentSessionCount}
      maxSessions={3}
      sessions={sessions}
      variant="error"
      onViewSessions={onViewSessions}
      {...props}
    />
  );
}