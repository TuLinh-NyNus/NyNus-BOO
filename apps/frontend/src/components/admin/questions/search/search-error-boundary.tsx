/**
 * Search Error Boundary Component
 * Error boundary đặc biệt cho search functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';

// ===== TYPES =====

export interface SearchErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

export interface SearchErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component */
  fallback?: React.ComponentType<SearchErrorFallbackProps>;
  /** Error callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset callback */
  onReset?: () => void;
  /** Show detailed error info */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface SearchErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  retry?: () => void;
  showDetails?: boolean;
  className?: string;
}

// ===== ERROR FALLBACK COMPONENTS =====

/**
 * Default Search Error Fallback
 * Default error UI cho search errors
 */
export function DefaultSearchErrorFallback({
  error,
  errorInfo,
  resetError,
  retry,
  showDetails = false,
  className = ''
}: SearchErrorFallbackProps) {
  // ===== RENDER HELPERS =====

  /**
   * Get error type và message
   */
  const getErrorInfo = () => {
    const errorName = error.name || 'SearchError';
    const errorMessage = error.message || 'Đã xảy ra lỗi trong quá trình tìm kiếm';
    
    // Categorize error types
    let errorType = 'Lỗi tìm kiếm';
    let suggestion = 'Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'Lỗi kết nối';
      suggestion = 'Kiểm tra kết nối internet và thử lại.';
    } else if (errorMessage.includes('timeout')) {
      errorType = 'Lỗi timeout';
      suggestion = 'Tìm kiếm mất quá nhiều thời gian. Thử với từ khóa ngắn hơn.';
    } else if (errorMessage.includes('validation')) {
      errorType = 'Lỗi dữ liệu';
      suggestion = 'Kiểm tra lại từ khóa tìm kiếm và thử lại.';
    }
    
    return { errorName, errorMessage, errorType, suggestion };
  };

  const { errorName, errorMessage, errorType, suggestion } = getErrorInfo();

  // ===== MAIN RENDER =====

  return (
    <Card className={cn('search-error-fallback border-destructive/20', className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{errorType}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error message */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <p className="text-xs text-muted-foreground">
            {suggestion}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2">
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Thử lại
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetError}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {/* Detailed error info */}
        {showDetails && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Chi tiết lỗi (dành cho developer)
            </summary>
            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
              <div><strong>Error:</strong> {errorName}</div>
              <div><strong>Message:</strong> {errorMessage}</div>
              {errorInfo && (
                <div><strong>Stack:</strong> {errorInfo.componentStack}</div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Search Error Fallback
 * Compact error UI cho inline search errors
 */
export function CompactSearchErrorFallback({
  error,
  resetError,
  retry,
  className = ''
}: SearchErrorFallbackProps) {
  return (
    <div className={cn('compact-search-error-fallback flex items-center gap-2 p-2 border border-destructive/20 rounded', className)}>
      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
      <span className="text-sm text-destructive flex-1">
        Lỗi tìm kiếm: {error.message}
      </span>
      <div className="flex gap-1">
        {retry && (
          <Button variant="ghost" size="sm" onClick={retry}>
            <Search className="h-3 w-3" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={resetError}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ===== ERROR BOUNDARY CLASS =====

/**
 * Search Error Boundary Class
 * Error boundary đặc biệt cho search functionality
 */
export class SearchErrorBoundary extends Component<SearchErrorBoundaryProps, SearchErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: SearchErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SearchErrorBoundaryState {
    // Generate unique error ID
    const errorId = `search-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error với structured logging
    logger.error('[SearchErrorBoundary] Error caught in search component', {
      operation: 'searchErrorBoundary',
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      errorId: this.state.errorId,
    });

    // Update state với error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to monitoring service (if available)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: `SearchError: ${error.message}`,
        fatal: false,
        error_id: this.state.errorId
      });
    }
  }

  /**
   * Reset error state
   */
  resetError = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  /**
   * Retry with automatic reset
   */
  retryWithReset = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.resetError();
    } else {
      logger.warn('[SearchErrorBoundary] Max retries reached', {
        operation: 'searchErrorBoundary',
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
      });
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultSearchErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          retry={this.retryWithReset}
          showDetails={this.props.showDetails}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// ===== HOOK =====

/**
 * useSearchErrorHandler Hook
 * Hook để handle search errors
 */
export function useSearchErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const handleError = React.useCallback((error: Error) => {
    setError(error);
    logger.error('[SearchErrorHandler] Error in search handler', {
      operation: 'searchErrorHandler',
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    });
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const retryWithClear = React.useCallback((retryFn: () => void) => {
    clearError();
    try {
      retryFn();
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [clearError, handleError]);
  
  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    retryWithClear
  };
}

// ===== WRAPPER COMPONENTS =====

/**
 * Search Error Wrapper
 * Wrapper component với error boundary
 */
export function SearchErrorWrapper({
  children,
  fallback,
  onError,
  showDetails = false,
  className = ''
}: Omit<SearchErrorBoundaryProps, 'onReset'>) {
  return (
    <SearchErrorBoundary
      fallback={fallback}
      onError={onError}
      showDetails={showDetails}
      className={className}
    >
      {children}
    </SearchErrorBoundary>
  );
}

/**
 * Compact Search Error Wrapper
 * Wrapper với compact error fallback
 */
export function CompactSearchErrorWrapper({
  children,
  onError,
  className = ''
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}) {
  return (
    <SearchErrorBoundary
      fallback={CompactSearchErrorFallback}
      onError={onError}
      showDetails={false}
      className={className}
    >
      {children}
    </SearchErrorBoundary>
  );
}
