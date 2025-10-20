/**
 * Theory Error Boundary Component
 * Error boundary được tối ưu cho theory components với retry mechanisms
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  BookOpen,
  Wifi,
  Code,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

// ===== TYPES =====

export interface TheoryErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  retry?: () => void;
  retryCount: number;
  maxRetries: number;
  showErrorDetails?: boolean;
  className?: string;
}

export interface TheoryErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  
  /** Custom fallback component */
  fallback?: React.ComponentType<TheoryErrorFallbackProps>;
  
  /** Error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /** Enable automatic retry */
  enableRetry?: boolean;
  
  /** Maximum retry attempts */
  maxRetries?: number;
  
  /** Show detailed error information */
  showErrorDetails?: boolean;
  
  /** Custom retry handler */
  onRetry?: () => void;
  
  /** Custom CSS classes */
  className?: string;
}

export interface TheoryErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  errorId: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// ===== ERROR TYPES =====

enum TheoryErrorType {
  NETWORK = 'network',
  LATEX = 'latex',
  CONTENT = 'content',
  NAVIGATION = 'navigation',
  UNKNOWN = 'unknown'
}

// ===== UTILITY FUNCTIONS =====

function determineErrorType(error: Error): TheoryErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return TheoryErrorType.NETWORK;
  }
  
  if (message.includes('latex') || message.includes('katex') || message.includes('math')) {
    return TheoryErrorType.LATEX;
  }
  
  if (message.includes('content') || message.includes('chapter') || message.includes('theory')) {
    return TheoryErrorType.CONTENT;
  }
  
  if (message.includes('navigation') || message.includes('route') || message.includes('path')) {
    return TheoryErrorType.NAVIGATION;
  }
  
  return TheoryErrorType.UNKNOWN;
}

function getErrorIcon(errorType: TheoryErrorType) {
  switch (errorType) {
    case TheoryErrorType.NETWORK:
      return Wifi;
    case TheoryErrorType.LATEX:
      return Code;
    case TheoryErrorType.CONTENT:
      return BookOpen;
    case TheoryErrorType.NAVIGATION:
      return Home;
    default:
      return AlertTriangle;
  }
}

function getUserFriendlyMessage(errorType: TheoryErrorType): string {
  switch (errorType) {
    case TheoryErrorType.NETWORK:
      return 'Không thể kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
    case TheoryErrorType.LATEX:
      return 'Có lỗi khi hiển thị công thức toán học. Nội dung có thể chứa lỗi cú pháp.';
    case TheoryErrorType.CONTENT:
      return 'Không thể tải nội dung lý thuyết. Vui lòng thử lại sau.';
    case TheoryErrorType.NAVIGATION:
      return 'Có lỗi khi điều hướng. Vui lòng thử lại hoặc về trang chủ.';
    default:
      return 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.';
  }
}

function getRecoverySuggestions(errorType: TheoryErrorType): string[] {
  switch (errorType) {
    case TheoryErrorType.NETWORK:
      return [
        'Kiểm tra kết nối internet',
        'Thử tải lại trang',
        'Kiểm tra cài đặt mạng'
      ];
    case TheoryErrorType.LATEX:
      return [
        'Báo cáo lỗi nội dung',
        'Bỏ qua phần có lỗi',
        'Xem phiên bản đơn giản'
      ];
    case TheoryErrorType.CONTENT:
      return [
        'Thử tải lại nội dung',
        'Chọn chương khác',
        'Về trang danh sách'
      ];
    case TheoryErrorType.NAVIGATION:
      return [
        'Về trang chủ',
        'Sử dụng menu điều hướng',
        'Thử đường dẫn khác'
      ];
    default:
      return [
        'Tải lại trang',
        'Xóa cache trình duyệt',
        'Liên hệ hỗ trợ'
      ];
  }
}

// ===== ERROR FALLBACK COMPONENTS =====

/**
 * Default Theory Error Fallback
 */
function DefaultTheoryErrorFallback({
  error,
  resetError,
  retry,
  retryCount,
  maxRetries,
  showErrorDetails = false,
  className
}: TheoryErrorFallbackProps) {
  const errorType = determineErrorType(error);
  const ErrorIcon = getErrorIcon(errorType);
  const message = getUserFriendlyMessage(errorType);
  const suggestions = getRecoverySuggestions(errorType);
  
  return (
    <div className={cn("theory-error-fallback", className)}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ErrorIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <CardTitle className="text-xl font-semibold">
            Lỗi Theory System
          </CardTitle>
          
          <CardDescription className="text-base">
            {message}
          </CardDescription>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Loại lỗi: {errorType}
            </Badge>
            {retryCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                Đã thử: {retryCount}/{maxRetries}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Recovery Suggestions */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Gợi ý khắc phục:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Error Details */}
          {showErrorDetails && (
            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    Chi tiết lỗi (dành cho developer)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                    <div><strong>Message:</strong> {error.message}</div>
                    <div><strong>Name:</strong> {error.name}</div>
                    {error.stack && (
                      <div className="mt-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {retry && retryCount < maxRetries && (
              <Button 
                onClick={retry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại ({maxRetries - retryCount} lần còn lại)
              </Button>
            )}
            
            <Button 
              onClick={resetError}
              className="flex-1"
              variant={retry && retryCount < maxRetries ? "outline" : "default"}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại component
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/theory'}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact Theory Error Fallback
 */
function CompactTheoryErrorFallback({
  error,
  resetError,
  retry,
  retryCount,
  maxRetries,
  className
}: TheoryErrorFallbackProps) {
  const errorType = determineErrorType(error);
  const message = getUserFriendlyMessage(errorType);
  
  return (
    <Alert variant="destructive" className={cn("compact-theory-error", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="flex-1">{message}</span>
        <div className="flex gap-1 ml-2">
          {retry && retryCount < maxRetries && (
            <Button variant="ghost" size="sm" onClick={retry}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetError}>
            <Home className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// ===== MAIN COMPONENT =====

export class TheoryErrorBoundary extends Component<
  TheoryErrorBoundaryProps,
  TheoryErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: TheoryErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<TheoryErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `theory-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[TheoryErrorBoundary] Error caught in theory component', {
      operation: 'theoryErrorBoundary',
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to monitoring service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to monitoring service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: `TheoryError: ${error.message}`,
        fatal: false,
        error_id: this.state.errorId,
        component_stack: errorInfo.componentStack
      });
    }
  };

  resetError = () => {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  retryWithDelay = () => {
    const { enableRetry = true, maxRetries = DEFAULT_MAX_RETRIES } = this.props;
    const { retryCount } = this.state;
    
    if (!enableRetry || retryCount >= maxRetries) {
      return;
    }
    
    const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
    
    const timeout = setTimeout(() => {
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1
      }));
      
      // Call custom retry handler
      this.props.onRetry?.();
      
      // Reset error state to trigger re-render
      this.resetError();
    }, delay);
    
    this.retryTimeouts.push(timeout);
  };

  componentWillUnmount() {
    // Clear timeouts on unmount
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  render() {
    const { 
      children, 
      fallback: CustomFallback, 
      maxRetries = DEFAULT_MAX_RETRIES,
      showErrorDetails = false,
      className 
    } = this.props;
    
    const { hasError, error, errorInfo, retryCount } = this.state;

    if (hasError && error) {
      const FallbackComponent = CustomFallback || DefaultTheoryErrorFallback;
      
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          retry={this.retryWithDelay}
          retryCount={retryCount}
          maxRetries={maxRetries}
          showErrorDetails={showErrorDetails}
          className={className}
        />
      );
    }

    return children;
  }
}

// ===== VARIANTS =====

/**
 * Compact Theory Error Boundary
 * Phiên bản compact cho inline errors
 */
export function CompactTheoryErrorBoundary(props: TheoryErrorBoundaryProps) {
  return (
    <TheoryErrorBoundary
      {...props}
      fallback={CompactTheoryErrorFallback}
      maxRetries={1}
      showErrorDetails={false}
      className={cn("compact-theory-error-boundary", props.className)}
    />
  );
}

/**
 * Full Theory Error Boundary
 * Phiên bản đầy đủ với tất cả features
 */
export function FullTheoryErrorBoundary(props: TheoryErrorBoundaryProps) {
  return (
    <TheoryErrorBoundary
      {...props}
      enableRetry={true}
      maxRetries={DEFAULT_MAX_RETRIES}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      className={cn("full-theory-error-boundary", props.className)}
    />
  );
}
