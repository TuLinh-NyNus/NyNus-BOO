/**
 * Admin API Error Handler
 * Xử lý lỗi API admin với comprehensive error handling
 */

import { toast } from "sonner";

/**
 * Admin-specific error types
 * Các loại lỗi cụ thể cho admin
 */
export enum AdminErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  MAINTENANCE_ERROR = "MAINTENANCE_ERROR",
  DATA_CONFLICT_ERROR = "DATA_CONFLICT_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  SYSTEM_OVERLOAD = "SYSTEM_OVERLOAD",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Error severity levels
 * Mức độ nghiêm trọng của lỗi
 */
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Admin error interface
 * Interface lỗi admin
 */
export interface AdminError {
  type: AdminErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  recoverable: boolean;
  retryable: boolean;
  suggestions?: string[];
}

/**
 * Error recovery strategy
 * Chiến lược phục hồi lỗi
 */
interface ErrorRecoveryStrategy {
  canRecover: (error: AdminError) => boolean;
  recover: (error: AdminError, context?: any) => Promise<any>;
  fallback?: (error: AdminError, context?: any) => Promise<any>;
}

/**
 * Admin Error Handler Class
 * Class xử lý lỗi admin
 */
export class AdminErrorHandler {
  private recoveryStrategies: Map<AdminErrorType, ErrorRecoveryStrategy> = new Map();
  private errorLog: AdminError[] = [];
  private maxLogSize = 1000;

  constructor() {
    this.setupDefaultRecoveryStrategies();
  }

  /**
   * Handle error with comprehensive processing
   * Xử lý lỗi với processing toàn diện
   */
  async handleError(
    error: any,
    context?: {
      action?: string;
      resource?: string;
      userId?: string;
      requestId?: string;
    }
  ): Promise<AdminError> {
    const adminError = this.parseError(error, context);

    // Log error
    this.logError(adminError);

    // Show user notification
    this.showUserNotification(adminError);

    // Attempt recovery if possible
    if (adminError.recoverable) {
      try {
        await this.attemptRecovery(adminError, context);
      } catch (recoveryError) {
        console.error("Error recovery failed:", recoveryError);
      }
    }

    return adminError;
  }

  /**
   * Parse raw error into AdminError
   * Parse lỗi thô thành AdminError
   */
  private parseError(error: any, context?: any): AdminError {
    const timestamp = new Date().toISOString();

    // Handle Axios errors
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return {
            type: AdminErrorType.AUTHENTICATION_ERROR,
            severity: ErrorSeverity.HIGH,
            message: data?.message || "Authentication failed",
            userMessage: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: false,
            suggestions: ["Đăng nhập lại", "Kiểm tra thông tin xác thực"],
          };

        case 403:
          return {
            type: AdminErrorType.AUTHORIZATION_ERROR,
            severity: ErrorSeverity.HIGH,
            message: data?.message || "Access forbidden",
            userMessage: "Bạn không có quyền thực hiện thao tác này.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: false,
            retryable: false,
            suggestions: ["Liên hệ quản trị viên để được cấp quyền"],
          };

        case 404:
          return {
            type: AdminErrorType.RESOURCE_NOT_FOUND,
            severity: ErrorSeverity.MEDIUM,
            message: data?.message || "Resource not found",
            userMessage: "Không tìm thấy tài nguyên được yêu cầu.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: false,
            retryable: false,
            suggestions: ["Kiểm tra lại đường dẫn", "Làm mới trang"],
          };

        case 409:
          return {
            type: AdminErrorType.DATA_CONFLICT_ERROR,
            severity: ErrorSeverity.MEDIUM,
            message: data?.message || "Data conflict",
            userMessage: "Dữ liệu đã bị thay đổi bởi người khác. Vui lòng làm mới và thử lại.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: true,
            suggestions: ["Làm mới dữ liệu", "Thử lại sau"],
          };

        case 422:
          return {
            type: AdminErrorType.VALIDATION_ERROR,
            severity: ErrorSeverity.MEDIUM,
            message: data?.message || "Validation failed",
            userMessage: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: false,
            suggestions: ["Kiểm tra lại dữ liệu nhập vào", "Đảm bảo các trường bắt buộc được điền"],
          };

        case 429:
          return {
            type: AdminErrorType.RATE_LIMIT_ERROR,
            severity: ErrorSeverity.MEDIUM,
            message: data?.message || "Rate limit exceeded",
            userMessage: "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: true,
            suggestions: ["Chờ một lúc rồi thử lại", "Giảm tần suất thao tác"],
          };

        case 503:
          return {
            type: AdminErrorType.MAINTENANCE_ERROR,
            severity: ErrorSeverity.HIGH,
            message: data?.message || "Service unavailable",
            userMessage: "Hệ thống đang bảo trì. Vui lòng thử lại sau.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: true,
            suggestions: ["Thử lại sau vài phút", "Kiểm tra thông báo bảo trì"],
          };

        default:
          return {
            type: AdminErrorType.SERVER_ERROR,
            severity: ErrorSeverity.HIGH,
            message: data?.message || `Server error: ${status}`,
            userMessage: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
            code: data?.code,
            details: data?.details,
            timestamp,
            requestId: context?.requestId,
            userId: context?.userId,
            action: context?.action,
            resource: context?.resource,
            recoverable: true,
            retryable: true,
            suggestions: ["Thử lại sau", "Liên hệ hỗ trợ kỹ thuật nếu lỗi tiếp tục"],
          };
      }
    }

    // Handle network errors
    if (error?.code === "NETWORK_ERROR" || error?.message?.includes("Network Error")) {
      return {
        type: AdminErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.HIGH,
        message: "Network connection failed",
        userMessage: "Không thể kết nối mạng. Vui lòng kiểm tra kết nối internet.",
        timestamp,
        requestId: context?.requestId,
        userId: context?.userId,
        action: context?.action,
        resource: context?.resource,
        recoverable: true,
        retryable: true,
        suggestions: ["Kiểm tra kết nối internet", "Thử lại sau"],
      };
    }

    // Handle timeout errors
    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      return {
        type: AdminErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: "Request timeout",
        userMessage: "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
        timestamp,
        requestId: context?.requestId,
        userId: context?.userId,
        action: context?.action,
        resource: context?.resource,
        recoverable: true,
        retryable: true,
        suggestions: ["Thử lại", "Kiểm tra kết nối mạng"],
      };
    }

    // Default unknown error
    return {
      type: AdminErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      message: error?.message || "Unknown error occurred",
      userMessage: "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
      details: error,
      timestamp,
      requestId: context?.requestId,
      userId: context?.userId,
      action: context?.action,
      resource: context?.resource,
      recoverable: true,
      retryable: true,
      suggestions: ["Thử lại", "Làm mới trang"],
    };
  }

  /**
   * Log error to internal log
   * Log lỗi vào log nội bộ
   */
  private logError(error: AdminError): void {
    this.errorLog.unshift(error);

    // Keep log size under limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log for development
    if (process.env.NODE_ENV === "development") {
      console.error("Admin Error:", error);
    }
  }

  /**
   * Show user notification
   * Hiển thị thông báo cho user
   */
  private showUserNotification(error: AdminError): void {
    const toastOptions = {
      description: error.suggestions?.[0] || "Vui lòng thử lại sau.",
      duration: error.severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.HIGH:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast.info(error.userMessage, toastOptions);
        break;
    }
  }

  /**
   * Attempt error recovery
   * Thử phục hồi lỗi
   */
  private async attemptRecovery(error: AdminError, context?: any): Promise<any> {
    const strategy = this.recoveryStrategies.get(error.type);

    if (strategy && strategy.canRecover(error)) {
      try {
        return await strategy.recover(error, context);
      } catch (recoveryError) {
        if (strategy.fallback) {
          return await strategy.fallback(error, context);
        }
        throw recoveryError;
      }
    }
  }

  /**
   * Setup default recovery strategies
   * Thiết lập strategies phục hồi mặc định
   */
  private setupDefaultRecoveryStrategies(): void {
    // Authentication error recovery
    this.recoveryStrategies.set(AdminErrorType.AUTHENTICATION_ERROR, {
      canRecover: () => true,
      recover: async (error, context) => {
        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      },
    });

    // Data conflict recovery
    this.recoveryStrategies.set(AdminErrorType.DATA_CONFLICT_ERROR, {
      canRecover: () => true,
      recover: async (error, context) => {
        // Refresh data and retry
        if (context?.refreshData) {
          await context.refreshData();
        }
      },
    });
  }

  /**
   * Get error statistics
   * Lấy thống kê lỗi
   */
  getErrorStats(): {
    total: number;
    byType: Record<AdminErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: AdminError[];
  } {
    const byType = {} as Record<AdminErrorType, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;

    this.errorLog.forEach((error) => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recent: this.errorLog.slice(0, 10),
    };
  }

  /**
   * Clear error log
   * Xóa log lỗi
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Default admin error handler instance
 * Instance error handler admin mặc định
 */
export const adminErrorHandler = new AdminErrorHandler();
