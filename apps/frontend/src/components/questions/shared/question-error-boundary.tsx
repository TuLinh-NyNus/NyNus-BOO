/**
 * Public Question Error Boundary
 * Error boundary adapted cho public interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription } from "@/components/ui";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  // Search, // Unused for now
  // Wifi, // Unused for now
  WifiOff,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

// ===== TYPES =====

export interface PublicQuestionErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  retry?: () => void;
  retryCount: number;
  maxRetries: number;
  showErrorDetails?: boolean;
  className?: string;
}

export interface PublicQuestionErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  
  /** Custom fallback component */
  fallback?: React.ComponentType<PublicQuestionErrorFallbackProps>;
  
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

export interface PublicQuestionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  errorId: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 3000]; // Progressive delays

// ===== ERROR TYPES =====

enum PublicQuestionErrorType {
  NETWORK = 'NETWORK',
  LATEX = 'LATEX',
  CONTENT = 'CONTENT',
  LOADING = 'LOADING',
  UNKNOWN = 'UNKNOWN'
}

// ===== UTILITY FUNCTIONS =====

function determineErrorType(error: Error): PublicQuestionErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return PublicQuestionErrorType.NETWORK;
  }
  
  if (message.includes('latex') || message.includes('katex') || message.includes('math')) {
    return PublicQuestionErrorType.LATEX;
  }
  
  if (message.includes('content') || message.includes('question') || message.includes('data')) {
    return PublicQuestionErrorType.CONTENT;
  }
  
  if (message.includes('loading') || message.includes('timeout')) {
    return PublicQuestionErrorType.LOADING;
  }
  
  return PublicQuestionErrorType.UNKNOWN;
}

function getErrorMessage(errorType: PublicQuestionErrorType): string {
  switch (errorType) {
    case PublicQuestionErrorType.NETWORK:
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.';
    case PublicQuestionErrorType.LATEX:
      return 'Có lỗi khi hiển thị công thức toán học. Nội dung có thể không hiển thị đúng.';
    case PublicQuestionErrorType.CONTENT:
      return 'Không thể tải nội dung câu hỏi. Dữ liệu có thể bị lỗi hoặc không tồn tại.';
    case PublicQuestionErrorType.LOADING:
      return 'Quá trình tải dữ liệu mất quá nhiều thời gian. Vui lòng thử lại.';
    default:
      return 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
  }
}

function getErrorSuggestions(errorType: PublicQuestionErrorType): string[] {
  switch (errorType) {
    case PublicQuestionErrorType.NETWORK:
      return [
        'Kiểm tra kết nối internet',
        'Thử tải lại trang',
        'Kiểm tra tường lửa hoặc proxy'
      ];
    case PublicQuestionErrorType.LATEX:
      return [
        'Thử tải lại câu hỏi',
        'Kiểm tra trình duyệt có hỗ trợ JavaScript',
        'Xóa cache trình duyệt'
      ];
    case PublicQuestionErrorType.CONTENT:
      return [
        'Thử tải lại trang',
        'Kiểm tra đường dẫn câu hỏi',
        'Liên hệ hỗ trợ nếu vấn đề tiếp tục'
      ];
    case PublicQuestionErrorType.LOADING:
      return [
        'Thử lại với kết nối tốt hơn',
        'Đợi một lúc rồi thử lại',
        'Tải lại trang'
      ];
    default:
      return [
        'Tải lại trang',
        'Thử lại sau vài phút',
        'Liên hệ hỗ trợ kỹ thuật'
      ];
  }
}

// ===== ERROR FALLBACK COMPONENTS =====

/**
 * Compact Error Fallback cho inline errors
 */
function CompactPublicQuestionErrorFallback({
  error,
  resetError,
  retry,
  retryCount,
  maxRetries,
  className = ""
}: PublicQuestionErrorFallbackProps) {
  const errorType = determineErrorType(error);
  const message = getErrorMessage(errorType);
  
  return (
    <Alert variant="destructive" className={cn("compact-question-error-fallback", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
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

/**
 * Default Error Fallback cho standard errors
 */
function DefaultPublicQuestionErrorFallback({
  error,
  resetError,
  retry,
  retryCount,
  maxRetries,
  showErrorDetails = false,
  className = ""
}: PublicQuestionErrorFallbackProps) {
  const errorType = determineErrorType(error);
  const message = getErrorMessage(errorType);
  const suggestions = getErrorSuggestions(errorType);
  
  const getErrorIcon = () => {
    switch (errorType) {
      case PublicQuestionErrorType.NETWORK:
        return <WifiOff className="h-8 w-8 text-destructive" />;
      case PublicQuestionErrorType.LATEX:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case PublicQuestionErrorType.CONTENT:
        return <HelpCircle className="h-8 w-8 text-blue-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
    }
  };

  return (
    <Card className={cn("default-question-error-fallback border-destructive/20", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getErrorIcon()}
        </div>
        <CardTitle className="text-destructive">
          Không thể hiển thị câu hỏi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        
        {/* Suggestions */}
        <div className="text-left">
          <h4 className="font-medium text-sm mb-2">Gợi ý khắc phục:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-xs mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {retry && retryCount < maxRetries && (
            <Button variant="default" size="sm" onClick={retry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại ({maxRetries - retryCount} lần còn lại)
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={resetError}>
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
        
        {/* Error details for development */}
        {showErrorDetails && (
          <details className="text-left mt-4">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// ===== MAIN ERROR BOUNDARY COMPONENT =====

export class PublicQuestionErrorBoundary extends Component<
  PublicQuestionErrorBoundaryProps,
  PublicQuestionErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: PublicQuestionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PublicQuestionErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Component Did Catch
   * Business Logic: Catches errors trong question components
   * - Log error details với structured logging
   * - Update state để hiển thị error UI
   * - Call custom error handler nếu có
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error với structured logging
    logger.error('[PublicQuestionErrorBoundary] Error caught in question component', {
      operation: 'questionErrorBoundary',
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
        description: `PublicQuestionError: ${error.message}`,
        fatal: false,
        error_id: this.state.errorId,
        component_stack: errorInfo.componentStack
      });
    }
  };

  private resetError = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  private retryWithDelay = () => {
    const { enableRetry = true, maxRetries = DEFAULT_MAX_RETRIES, onRetry } = this.props;
    const { retryCount } = this.state;
    
    if (!enableRetry || retryCount >= maxRetries) {
      return;
    }
    
    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
      
      onRetry?.();
    }, delay);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
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
      const FallbackComponent = CustomFallback || DefaultPublicQuestionErrorFallback;
      
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

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Error Boundary cho inline errors
 */
export function CompactPublicQuestionErrorBoundary(props: PublicQuestionErrorBoundaryProps) {
  return (
    <PublicQuestionErrorBoundary
      {...props}
      fallback={CompactPublicQuestionErrorFallback}
      maxRetries={1}
      showErrorDetails={false}
      className={cn("compact-question-error-boundary", props.className)}
    />
  );
}

/**
 * Full Error Boundary với tất cả features
 */
export function FullPublicQuestionErrorBoundary(props: PublicQuestionErrorBoundaryProps) {
  return (
    <PublicQuestionErrorBoundary
      {...props}
      enableRetry={true}
      maxRetries={DEFAULT_MAX_RETRIES}
      showErrorDetails={process.env.NODE_ENV === 'development'}
      className={cn("full-question-error-boundary", props.className)}
    />
  );
}

// ===== DEFAULT EXPORTS =====

export default PublicQuestionErrorBoundary;
