'use client';

/**
 * Library Error Boundary
 * Error boundary component để xử lý errors trong library pages
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LibraryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  className?: string;
}

interface LibraryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class LibraryErrorBoundary extends Component<
  LibraryErrorBoundaryProps,
  LibraryErrorBoundaryState
> {
  constructor(props: LibraryErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LibraryErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Library Error Boundary caught error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={cn('flex min-h-[400px] items-center justify-center p-4', this.props.className)}>
          <Card className="max-w-lg w-full p-12 text-center backdrop-blur-sm bg-background/95 border-border/60 shadow-lg">
            {/* Error Icon with Animation */}
            <div className="relative mb-8 inline-block">
              {/* Pulse Effect */}
              <div className="absolute inset-0 -m-4 rounded-full bg-destructive/10 animate-ping" />
              
              {/* Icon Container */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10 shadow-inner">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 backdrop-blur">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              {/* Decorative Dots */}
              <div className="absolute -right-2 top-2 h-2 w-2 rounded-full bg-destructive/30 animate-bounce" />
              <div className="absolute -left-1 bottom-4 h-2 w-2 rounded-full bg-destructive/20 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute right-4 bottom-1 h-2 w-2 rounded-full bg-destructive/25 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Oops! Có lỗi xảy ra
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Rất tiếc, đã xảy ra lỗi khi tải thư viện. Chúng tôi đã ghi nhận vấn đề và sẽ khắc phục sớm nhất.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                <summary className="cursor-pointer text-sm font-medium text-destructive mb-2">
                  Chi tiết lỗi (Dev Mode)
                </summary>
                <div className="text-xs font-mono text-muted-foreground space-y-2">
                  <div>
                    <strong className="text-foreground">Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-foreground">Stack:</strong>
                      <pre className="mt-1 overflow-auto max-h-32 text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
              <Link href="/library">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Về trang chủ thư viện
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-muted-foreground">
              Nếu lỗi vẫn tiếp tục, vui lòng{' '}
              <a href="/contact" className="text-primary hover:underline">
                liên hệ hỗ trợ
              </a>
              .
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LibraryErrorBoundary;

