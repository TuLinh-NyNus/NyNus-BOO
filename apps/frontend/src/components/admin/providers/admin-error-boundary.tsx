/**
 * Admin Error Boundary
 * Error boundary component cho admin interface
 */

'use client';

import React, { Component } from 'react';
import { AdminErrorBoundaryProps, AdminErrorBoundaryState, AdminError } from '@/types/admin/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Admin Error Boundary Component
 * Error boundary để catch và handle errors trong admin interface
 */
export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  /**
   * Static method để catch errors
   * Method để catch errors và update state
   */
  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Component did catch
   * Method được gọi khi có error xảy ra
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('[AdminErrorBoundary] Error caught:', error);
    console.error('[AdminErrorBoundary] Error info:', errorInfo);

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  /**
   * Report error to monitoring service
   * Báo cáo error lên monitoring service
   */
  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Create admin error object
      const adminError: AdminError = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: error.message,
        type: 'error',
        timestamp: new Date(),
        source: 'AdminErrorBoundary',
        stack: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
          level: this.props.level || 'component',
          retryCount: this.state.retryCount,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown'
        }
      };

      // Log to console for development
      console.error('[AdminErrorBoundary] Admin Error:', adminError);

      // TODO: Send to monitoring service in production
      // Example: errorReportingService.report(adminError);
      
    } catch (reportingError) {
      console.error('[AdminErrorBoundary] Failed to report error:', reportingError);
    }
  };

  /**
   * Handle retry
   * Xử lý retry khi user click retry button
   */
  private handleRetry = () => {
    const { enableRetry = true } = this.props;
    
    if (!enableRetry) return;

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    console.log('[AdminErrorBoundary] Retrying... Attempt:', this.state.retryCount + 1);
  };

  /**
   * Handle go home
   * Xử lý khi user click go home button
   */
  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/3141592654/admin';
    }
  };

  /**
   * Handle reload page
   * Xử lý khi user click reload page button
   */
  private handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  /**
   * Get error level color
   * Lấy màu sắc theo error level
   */
  private getErrorLevelColor = () => {
    const { level = 'component' } = this.props;
    
    switch (level) {
      case 'critical':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'page':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'component':
      default:
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    }
  };

  /**
   * Get error title
   * Lấy title theo error level
   */
  private getErrorTitle = () => {
    const { level = 'component' } = this.props;
    
    switch (level) {
      case 'critical':
        return 'Lỗi nghiêm trọng';
      case 'page':
        return 'Lỗi trang';
      case 'component':
      default:
        return 'Lỗi thành phần';
    }
  };

  /**
   * Get error description
   * Lấy description theo error level
   */
  private getErrorDescription = () => {
    const { level = 'component' } = this.props;
    
    switch (level) {
      case 'critical':
        return 'Đã xảy ra lỗi nghiêm trọng trong hệ thống. Vui lòng liên hệ quản trị viên.';
      case 'page':
        return 'Không thể tải trang này. Vui lòng thử lại hoặc quay về trang chủ.';
      case 'component':
      default:
        return 'Một thành phần giao diện gặp sự cố. Bạn có thể thử lại hoặc tiếp tục sử dụng.';
    }
  };

  /**
   * Render error UI
   * Render giao diện khi có error
   */
  private renderErrorUI = () => {
    const { showErrorDetails = false, enableRetry = true, level = 'component' } = this.props;
    const { error, errorInfo, retryCount } = this.state;

    // Use fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const errorLevelColor = this.getErrorLevelColor();
    const errorTitle = this.getErrorTitle();
    const errorDescription = this.getErrorDescription();

    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className={`w-full max-w-lg ${errorLevelColor}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <CardTitle className="text-xl font-semibold">
              {errorTitle}
            </CardTitle>
            <CardDescription className="text-base">
              {errorDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-white/50 rounded-md border">
                <p className="text-sm font-medium text-gray-900">
                  {error.message}
                </p>
              </div>
            )}

            {/* Retry count */}
            {retryCount > 0 && (
              <div className="text-sm text-gray-600 text-center">
                Đã thử lại {retryCount} lần
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {enableRetry && (
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              )}
              
              <Button
                onClick={this.handleGoHome}
                className="flex-1"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
              
              {level === 'critical' && (
                <Button
                  onClick={this.handleReloadPage}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tải lại trang
                </Button>
              )}
            </div>

            {/* Error details (development only) */}
            {showErrorDetails && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Chi tiết lỗi (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-md text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.toString()}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Component will unmount
   * Cleanup khi component unmount
   */
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Render method
   * Main render method
   */
  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}
