/**
 * Admin Global Error Boundary
 * Error boundary toàn cục cho admin app với comprehensive error handling
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "sonner";

import {
  adminErrorHandler,
  AdminError,
  AdminErrorType,
  ErrorSeverity,
} from "../api/utils/error-handler";
import { adminRetryManager, ADMIN_RETRY_CONFIGS } from "../api/utils/retry-manager";

/**
 * Admin Error Boundary Props
 * Props cho Admin Error Boundary
 */
interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  retryAttempts?: number;
  showErrorDetails?: boolean;
  level?: "page" | "component" | "critical";
}

/**
 * Admin Error Boundary State
 * State cho Admin Error Boundary
 */
interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  adminError: AdminError | null;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Admin Error Boundary Component
 * Component error boundary toàn cục cho admin
 */
export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      adminError: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Admin Error Boundary caught an error:", error, errorInfo);

    // Process error through AdminErrorHandler
    const adminError = await adminErrorHandler.handleError(error, {
      action: "COMPONENT_RENDER",
      resource: "ADMIN_UI",
      requestId: `error_boundary_${Date.now()}`,
    });

    this.setState({
      error,
      errorInfo,
      adminError,
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Attempt automatic retry for recoverable errors
    if (
      this.props.enableRetry &&
      adminError.recoverable &&
      this.state.retryCount < (this.props.retryAttempts || 3)
    ) {
      this.scheduleRetry();
    }
  }

  /**
   * Schedule automatic retry
   * Lên lịch retry tự động
   */
  private scheduleRetry = () => {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  /**
   * Handle manual retry
   * Xử lý retry thủ công
   */
  private handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      adminError: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
    }));

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    toast.info("Đang thử tải lại...", {
      duration: 2000,
    });
  };

  /**
   * Handle error dismissal
   * Xử lý dismiss error
   */
  private handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      adminError: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  /**
   * Handle page reload
   * Xử lý reload trang
   */
  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  /**
   * Render error fallback UI
   * Render UI fallback cho error
   */
  private renderErrorFallback = (): ReactNode => {
    const { error, adminError, isRetrying, retryCount } = this.state;
    const {
      level = "component",
      enableRetry = true,
      retryAttempts = 3,
      showErrorDetails = false,
    } = this.props;

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const canRetry = enableRetry && retryCount < retryAttempts && adminError?.recoverable;
    const errorTitle = this.getErrorTitle(level, adminError);
    const errorMessage =
      adminError?.userMessage || error?.message || "Đã xảy ra lỗi không xác định";

    return (
      <div className="min-h-[200px] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className={`rounded-full p-3 ${this.getErrorIconColor(adminError?.severity)}`}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h3 className="text-lg font-semibold text-foreground">{errorTitle}</h3>

          {/* Error Message */}
          <p className="text-sm text-muted-foreground">{errorMessage}</p>

          {/* Error Suggestions */}
          {adminError?.suggestions && adminError.suggestions.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Gợi ý:</p>
              <ul className="list-disc list-inside space-y-1">
                {adminError.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang thử lại...
                  </>
                ) : (
                  `Thử lại (${retryCount}/${retryAttempts})`
                )}
              </button>
            )}

            {level === "critical" ? (
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Tải lại trang
              </button>
            ) : (
              <button
                onClick={this.handleDismiss}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Đóng
              </button>
            )}
          </div>

          {/* Error Details (Development) */}
          {showErrorDetails && process.env.NODE_ENV === "development" && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                Chi tiết lỗi (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
                {adminError && (
                  <div>
                    <strong>Admin Error:</strong>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(adminError, null, 2)}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  };

  /**
   * Get error title based on level and error type
   * Lấy title error dựa trên level và loại error
   */
  private getErrorTitle = (level: string, adminError: AdminError | null): string => {
    if (adminError?.type === AdminErrorType.AUTHENTICATION_ERROR) {
      return "Lỗi xác thực";
    }
    if (adminError?.type === AdminErrorType.AUTHORIZATION_ERROR) {
      return "Không có quyền truy cập";
    }
    if (adminError?.type === AdminErrorType.NETWORK_ERROR) {
      return "Lỗi kết nối mạng";
    }

    switch (level) {
      case "critical":
        return "Lỗi nghiêm trọng";
      case "page":
        return "Không thể tải trang";
      case "component":
      default:
        return "Không thể tải nội dung";
    }
  };

  /**
   * Get error icon color based on severity
   * Lấy màu icon error dựa trên severity
   */
  private getErrorIconColor = (severity?: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "bg-red-100 text-red-600";
      case ErrorSeverity.HIGH:
        return "bg-orange-100 text-orange-600";
      case ErrorSeverity.MEDIUM:
        return "bg-yellow-100 text-yellow-600";
      case ErrorSeverity.LOW:
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with admin error boundary
 * HOC để wrap components với admin error boundary
 */
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AdminErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => {
    return (
      <AdminErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withAdminErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
