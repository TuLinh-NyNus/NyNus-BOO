'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Core Error Boundary Component
 * Bắt và xử lý errors trong React component tree
 * 
 * @description
 * Implements advanced error boundary với auto-reset capabilities,
 * custom fallback UI, error logging, và recovery mechanisms
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Gọi optional error handler
    this.props.onError?.(error, errorInfo);

    // Optional: Send to error reporting service
    // reportErrorToService(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys = [], resetOnPropsChange } = this.props;
    const prevResetKeys = prevProps.resetKeys || [];
    
    // Reset error state khi resetKeys thay đổi
    if (this.state.hasError && 
        (resetKeys.length !== prevResetKeys.length ||
         resetKeys.some((key, i) => key !== prevResetKeys[i]))) {
      this.resetErrorBoundary();
    }
    
    // Reset khi children prop thay đổi
    if (resetOnPropsChange && 
        prevProps.children !== this.props.children && 
        this.state.hasError) {
      this.resetErrorBoundary();
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      // Sử dụng custom fallback hoặc default
      return this.props.fallback || (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

function DefaultErrorFallback({ error, resetErrorBoundary }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="text-center max-w-md">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Đã xảy ra lỗi
        </h2>
        
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {error?.message || 'Lỗi không xác định'}
        </p>
        
        <div className="space-x-2">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Tải lại trang
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="mt-2 p-2 text-xs bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Higher-Order Component wrapper cho Error Boundary
 * 
 * @param Component - Component cần wrap
 * @param errorBoundaryProps - Props cho Error Boundary
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = React.forwardRef<unknown, T>((props, ref) => {
    // Type assertion to fix TypeScript generic constraint issue
    const componentProps = { ...props, ref } as T & { ref?: React.Ref<unknown> };
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...componentProps} />
      </ErrorBoundary>
    );
  });

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
