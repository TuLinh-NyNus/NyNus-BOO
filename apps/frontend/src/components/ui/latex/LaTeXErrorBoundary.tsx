/**
 * LaTeX Error Boundary Component
 * Error boundary cho LaTeX rendering với fallback UI
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Props cho LaTeX Error Boundary
 */
interface LaTeXErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State cho Error Boundary
 */
interface LaTeXErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * LaTeX Error Boundary Component
 * Bắt và xử lý errors trong LaTeX rendering
 */
export class LaTeXErrorBoundary extends Component<
  LaTeXErrorBoundaryProps,
  LaTeXErrorBoundaryState
> {
  constructor(props: LaTeXErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Catch errors trong component tree
   */
  static getDerivedStateFromError(error: Error): LaTeXErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LaTeX rendering error:', error);
    console.error('Error info:', errorInfo);
    
    // Call custom error handler nếu có
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  /**
   * Reset error state
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Render fallback UI khi có error
   */
  renderErrorFallback() {
    const { fallback, showErrorDetails } = this.props;
    const { error, errorInfo } = this.state;

    // Custom fallback nếu có
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <Alert variant="destructive" className="my-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>Lỗi hiển thị LaTeX</span>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1 text-sm hover:underline"
              type="button"
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </button>
          </div>
          
          {showErrorDetails && error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">
                Chi tiết lỗi
              </summary>
              <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                <div className="mb-1">
                  <strong>Error:</strong> {error.message}
                </div>
                {errorInfo && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

/**
 * Hook wrapper cho functional components
 */
export function withLaTeXErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<LaTeXErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <LaTeXErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </LaTeXErrorBoundary>
    );
  };
}

/**
 * Simple error fallback component
 */
export function LaTeXErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: string; 
  resetError?: () => void; 
}) {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      <AlertTriangle className="h-3 w-3" />
      <span>LaTeX Error</span>
      {error && (
        <span className="text-xs opacity-75">({error})</span>
      )}
      {resetError && (
        <button
          onClick={resetError}
          className="ml-1 hover:underline text-xs"
          type="button"
        >
          Retry
        </button>
      )}
    </div>
  );
}
