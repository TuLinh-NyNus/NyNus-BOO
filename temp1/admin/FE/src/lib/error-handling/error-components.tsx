/**
 * Admin Error UI Components
 * Các component UI cho error handling trong admin app
 */

"use client";

import React from "react";
import { toast } from "sonner";

import { AdminError, AdminErrorType, ErrorSeverity } from "../api/utils/error-handler";
import { useAdminErrorContext } from "./error-context";

/**
 * Admin Error State Props
 * Props cho Admin Error State
 */
interface AdminErrorStateProps {
  error?: AdminError | Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showDetails?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Admin Error State Component
 * Component hiển thị error state với retry functionality
 */
export function AdminErrorState({
  error,
  title,
  description,
  onRetry,
  onDismiss,
  retryLabel = "Thử lại",
  dismissLabel = "Đóng",
  showDetails = false,
  className = "",
  size = "md",
}: AdminErrorStateProps) {
  const { attemptRecovery } = useAdminErrorContext();

  // Parse error information
  const errorInfo = React.useMemo(() => {
    if (!error) {
      return {
        title: title || "Đã xảy ra lỗi",
        message: description || "Không thể tải dữ liệu. Vui lòng thử lại.",
        severity: ErrorSeverity.MEDIUM,
        type: AdminErrorType.UNKNOWN_ERROR,
        recoverable: true,
      };
    }

    if (typeof error === "string") {
      return {
        title: title || "Đã xảy ra lỗi",
        message: error,
        severity: ErrorSeverity.MEDIUM,
        type: AdminErrorType.UNKNOWN_ERROR,
        recoverable: true,
      };
    }

    if (error instanceof Error) {
      return {
        title: title || "Đã xảy ra lỗi",
        message: description || error.message,
        severity: ErrorSeverity.MEDIUM,
        type: AdminErrorType.UNKNOWN_ERROR,
        recoverable: true,
      };
    }

    // AdminError
    return {
      title: title || getErrorTitle(error.type),
      message: description || error.userMessage,
      severity: error.severity,
      type: error.type,
      recoverable: error.recoverable,
      suggestions: error.suggestions,
    };
  }, [error, title, description]);

  const handleRetry = async () => {
    try {
      if (onRetry) {
        await onRetry();
      } else if (error && typeof error === "object" && "type" in error) {
        await attemptRecovery(error as AdminError);
      }
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      toast.error("Thử lại thất bại. Vui lòng kiểm tra lại.");
    }
  };

  const sizeClasses = {
    sm: "p-4 space-y-2",
    md: "p-6 space-y-4",
    lg: "p-8 space-y-6",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`max-w-md w-full text-center ${sizeClasses[size]}`}>
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className={`rounded-full p-3 ${getErrorIconColor(errorInfo.severity)}`}>
            <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <h3
          className={`font-semibold text-foreground ${size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-base"}`}
        >
          {errorInfo.title}
        </h3>

        {/* Error Message */}
        <p className={`text-muted-foreground ${size === "lg" ? "text-base" : "text-sm"}`}>
          {errorInfo.message}
        </p>

        {/* Error Suggestions */}
        {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
          <div className={`text-muted-foreground ${size === "lg" ? "text-sm" : "text-xs"}`}>
            <p className="font-medium mb-1">Gợi ý:</p>
            <ul className="list-disc list-inside space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {errorInfo.recoverable && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              {retryLabel}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {dismissLabel}
            </button>
          )}
        </div>

        {/* Error Details (Development) */}
        {showDetails &&
          process.env.NODE_ENV === "development" &&
          error &&
          typeof error === "object" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                Chi tiết lỗi (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
              </div>
            </details>
          )}
      </div>
    </div>
  );
}

/**
 * Admin Loading Error Props
 * Props cho Admin Loading Error
 */
interface AdminLoadingErrorProps {
  message?: string;
  onRetry?: () => void | Promise<void>;
  className?: string;
}

/**
 * Admin Loading Error Component
 * Component cho loading failures
 */
export function AdminLoadingError({
  message = "Không thể tải dữ liệu",
  onRetry,
  className = "",
}: AdminLoadingErrorProps) {
  return (
    <AdminErrorState
      title="Lỗi tải dữ liệu"
      description={message}
      onRetry={onRetry}
      retryLabel="Tải lại"
      size="sm"
      className={className}
    />
  );
}

/**
 * Admin Fallback Error Props
 * Props cho Admin Fallback Error
 */
interface AdminFallbackErrorProps {
  error?: Error;
  resetError?: () => void;
  className?: string;
}

/**
 * Admin Fallback Error Component
 * Component cho critical errors
 */
export function AdminFallbackError({ error, resetError, className = "" }: AdminFallbackErrorProps) {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
      <AdminErrorState
        error={error}
        title="Lỗi nghiêm trọng"
        description="Ứng dụng gặp lỗi nghiêm trọng và không thể tiếp tục hoạt động."
        onRetry={resetError || handleReload}
        retryLabel={resetError ? "Thử lại" : "Tải lại trang"}
        showDetails={true}
        size="lg"
      />
    </div>
  );
}

/**
 * Admin Network Error Props
 * Props cho Admin Network Error
 */
interface AdminNetworkErrorProps {
  onRetry?: () => void | Promise<void>;
  className?: string;
}

/**
 * Admin Network Error Component
 * Component cho network errors
 */
export function AdminNetworkError({ onRetry, className = "" }: AdminNetworkErrorProps) {
  return (
    <AdminErrorState
      title="Lỗi kết nối mạng"
      description="Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại."
      onRetry={onRetry}
      retryLabel="Thử kết nối lại"
      className={className}
    />
  );
}

/**
 * Admin Permission Error Props
 * Props cho Admin Permission Error
 */
interface AdminPermissionErrorProps {
  message?: string;
  onGoBack?: () => void;
  className?: string;
}

/**
 * Admin Permission Error Component
 * Component cho permission errors
 */
export function AdminPermissionError({
  message = "Bạn không có quyền truy cập trang này.",
  onGoBack,
  className = "",
}: AdminPermissionErrorProps) {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <AdminErrorState
      title="Không có quyền truy cập"
      description={message}
      onRetry={handleGoBack}
      retryLabel="Quay lại"
      className={className}
    />
  );
}

/**
 * Utility functions
 * Các hàm tiện ích
 */

/**
 * Get error title based on error type
 * Lấy title error dựa trên loại error
 */
function getErrorTitle(errorType: AdminErrorType): string {
  switch (errorType) {
    case AdminErrorType.AUTHENTICATION_ERROR:
      return "Lỗi xác thực";
    case AdminErrorType.AUTHORIZATION_ERROR:
      return "Không có quyền truy cập";
    case AdminErrorType.VALIDATION_ERROR:
      return "Dữ liệu không hợp lệ";
    case AdminErrorType.NETWORK_ERROR:
      return "Lỗi kết nối mạng";
    case AdminErrorType.SERVER_ERROR:
      return "Lỗi máy chủ";
    case AdminErrorType.RATE_LIMIT_ERROR:
      return "Quá nhiều yêu cầu";
    case AdminErrorType.MAINTENANCE_ERROR:
      return "Hệ thống bảo trì";
    case AdminErrorType.DATA_CONFLICT_ERROR:
      return "Xung đột dữ liệu";
    case AdminErrorType.RESOURCE_NOT_FOUND:
      return "Không tìm thấy";
    case AdminErrorType.PERMISSION_DENIED:
      return "Từ chối quyền truy cập";
    case AdminErrorType.SYSTEM_OVERLOAD:
      return "Hệ thống quá tải";
    case AdminErrorType.UNKNOWN_ERROR:
    default:
      return "Đã xảy ra lỗi";
  }
}

/**
 * Get error icon color based on severity
 * Lấy màu icon error dựa trên severity
 */
function getErrorIconColor(severity: ErrorSeverity): string {
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
}
