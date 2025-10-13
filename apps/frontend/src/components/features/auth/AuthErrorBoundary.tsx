/**
 * Authentication Error Boundary Component
 * Error boundary chuyên biệt cho authentication errors với graceful fallbacks
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn, Home, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isOnline: boolean;
}

interface ErrorType {
  type: 'auth' | 'network' | 'session' | 'permission' | 'unknown';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actions: ErrorAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: React.ComponentType<{ className?: string }>;
}

// ===== CONSTANTS =====

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

// ===== ERROR CLASSIFICATION =====

function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const _stack = error.stack?.toLowerCase() || '';

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401') || 
      message.includes('authentication') || message.includes('token')) {
    return {
      type: 'auth',
      title: 'Lỗi xác thực',
      description: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      icon: LogIn,
      severity: 'high',
      actions: [
        {
          label: 'Đăng nhập lại',
          action: () => window.location.href = '/login',
          variant: 'default',
          icon: LogIn
        },
        {
          label: 'Về trang chủ',
          action: () => window.location.href = '/',
          variant: 'outline',
          icon: Home
        }
      ]
    };
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || 
      message.includes('connection') || message.includes('timeout')) {
    return {
      type: 'network',
      title: 'Lỗi kết nối mạng',
      description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
      icon: WifiOff,
      severity: 'medium',
      actions: [
        {
          label: 'Thử lại',
          action: () => window.location.reload(),
          variant: 'default',
          icon: RefreshCw
        },
        {
          label: 'Về trang chủ',
          action: () => window.location.href = '/',
          variant: 'outline',
          icon: Home
        }
      ]
    };
  }

  // Session errors
  if (message.includes('session') || message.includes('expired') || 
      message.includes('invalid session')) {
    return {
      type: 'session',
      title: 'Phiên làm việc hết hạn',
      description: 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
      icon: AlertTriangle,
      severity: 'high',
      actions: [
        {
          label: 'Đăng nhập lại',
          action: () => window.location.href = '/login',
          variant: 'default',
          icon: LogIn
        }
      ]
    };
  }

  // Permission errors
  if (message.includes('forbidden') || message.includes('403') || 
      message.includes('permission') || message.includes('access denied')) {
    return {
      type: 'permission',
      title: 'Không có quyền truy cập',
      description: 'Bạn không có quyền truy cập vào tính năng này.',
      icon: AlertTriangle,
      severity: 'medium',
      actions: [
        {
          label: 'Về trang chủ',
          action: () => window.location.href = '/',
          variant: 'default',
          icon: Home
        }
      ]
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    title: 'Đã xảy ra lỗi',
    description: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.',
    icon: AlertTriangle,
    severity: 'medium',
    actions: [
      {
        label: 'Thử lại',
        action: () => window.location.reload(),
        variant: 'default',
        icon: RefreshCw
      },
      {
        label: 'Về trang chủ',
        action: () => window.location.href = '/',
        variant: 'outline',
        icon: Home
      }
    ]
  };
}

// ===== COMPONENT =====

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error for monitoring
    logger.error('[AuthErrorBoundary] Error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to error tracking service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineStatusChange);
      window.addEventListener('offline', this.handleOnlineStatusChange);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnlineStatusChange);
      window.removeEventListener('offline', this.handleOnlineStatusChange);
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  handleOnlineStatusChange = () => {
    this.setState({
      isOnline: navigator.onLine
    });

    // Auto-retry when coming back online
    if (navigator.onLine && this.state.hasError && this.state.retryCount < MAX_RETRY_COUNT) {
      this.handleRetry();
    }
  };

  /**
   * Handle retry logic with exponential backoff
   * Business Logic: Cho phép user retry khi gặp lỗi, tối đa 3 lần
   * Security: Exponential backoff để tránh spam retry
   */
  handleRetry = () => {
    const { retryCount, error } = this.state;

    if (retryCount >= MAX_RETRY_COUNT) {
      logger.warn('[AuthErrorBoundary] Max retry count reached', {
        operation: 'handleRetry',
        retryCount: MAX_RETRY_COUNT,
        errorType: error?.message,
      });
      return;
    }

    this.setState({
      retryCount: retryCount + 1
    });

    // Delay retry to avoid immediate re-error
    this.retryTimer = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }, RETRY_DELAY * (retryCount + 1)); // Exponential backoff
  };

  renderErrorUI() {
    const { error, isOnline, retryCount } = this.state;
    
    if (!error) return null;

    const errorType = classifyError(error);
    const IconComponent = errorType.icon;
    const canRetry = retryCount < MAX_RETRY_COUNT;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <IconComponent className="h-6 w-6 text-destructive" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <CardTitle className="text-xl font-semibold">
                {errorType.title}
              </CardTitle>
              <Badge 
                variant={errorType.severity === 'critical' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {errorType.severity}
              </Badge>
            </div>
            
            <CardDescription className="text-center">
              {errorType.description}
            </CardDescription>

            {/* Network status indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Đã kết nối</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Không có kết nối</span>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error actions */}
            <div className="flex flex-col gap-2">
              {errorType.actions.map((action, index) => {
                const ActionIcon = action.icon;
                
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    onClick={action.action}
                    className="w-full justify-center gap-2"
                    disabled={!isOnline && errorType.type === 'network'}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Retry information */}
            {canRetry && errorType.type !== 'auth' && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  disabled={!isOnline}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Thử lại ({MAX_RETRY_COUNT - retryCount} lần còn lại)
                </Button>
              </div>
            )}

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Chi tiết lỗi (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError) {
      return fallback || this.renderErrorUI();
    }

    return <div className={className}>{children}</div>;
  }
}

export default AuthErrorBoundary;
