import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SecurityAlertType = 'warning' | 'error' | 'info' | 'success';

interface SecurityAlertBannerProps {
  type: SecurityAlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

const alertConfig: Record<SecurityAlertType, {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive';
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = {
  warning: {
    icon: AlertTriangle,
    variant: 'default',
    bgColor: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
  },
  error: {
    icon: AlertTriangle,
    variant: 'destructive',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
  info: {
    icon: Info,
    variant: 'default',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
  success: {
    icon: Shield,
    variant: 'default',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
  },
};

export function SecurityAlertBanner({
  type,
  title,
  message,
  onDismiss,
  className = '',
  showIcon = true,
}: SecurityAlertBannerProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={cn(
        config.bgColor,
        'relative pr-10',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn('h-4 w-4', config.iconColor)} />
      )}
      
      <AlertDescription className={config.textColor}>
        {title && (
          <div className="font-semibold mb-1">{title}</div>
        )}
        <div className="text-sm">{message}</div>
      </AlertDescription>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'absolute right-2 top-2 p-1 rounded-sm opacity-70 transition-opacity hover:opacity-100',
            config.textColor
          )}
          aria-label="Đóng thông báo"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Alert>
  );
}

// Preset components for common security alerts
export function SecurityWarning({ message, onDismiss, ...props }: Omit<SecurityAlertBannerProps, 'type'>) {
  return (
    <SecurityAlertBanner
      type="warning"
      title="Cảnh báo bảo mật"
      message={message}
      onDismiss={onDismiss}
      {...props}
    />
  );
}

export function SecurityError({ message, onDismiss, ...props }: Omit<SecurityAlertBannerProps, 'type'>) {
  return (
    <SecurityAlertBanner
      type="error"
      title="Lỗi bảo mật"
      message={message}
      onDismiss={onDismiss}
      {...props}
    />
  );
}

export function SecurityInfo({ message, onDismiss, ...props }: Omit<SecurityAlertBannerProps, 'type'>) {
  return (
    <SecurityAlertBanner
      type="info"
      title="Thông tin bảo mật"
      message={message}
      onDismiss={onDismiss}
      {...props}
    />
  );
}