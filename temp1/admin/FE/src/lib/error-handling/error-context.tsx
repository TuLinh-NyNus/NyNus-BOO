/**
 * Admin Error Context
 * Context quản lý error state toàn cục cho admin app
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

import {
  adminErrorHandler,
  AdminError,
  AdminErrorType,
  ErrorSeverity,
} from "../api/utils/error-handler";
import { adminRetryManager } from "../api/utils/retry-manager";

/**
 * Error context state
 * State của error context
 */
interface ErrorContextState {
  errors: AdminError[];
  globalError: AdminError | null;
  isRecovering: boolean;
  errorStats: {
    total: number;
    byType: Record<AdminErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
  };
  lastErrorTime: number | null;
  recoveryAttempts: number;
}

/**
 * Error context actions
 * Actions của error context
 */
type ErrorContextAction =
  | { type: "ADD_ERROR"; error: AdminError }
  | { type: "REMOVE_ERROR"; errorId: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_GLOBAL_ERROR"; error: AdminError | null }
  | { type: "SET_RECOVERING"; isRecovering: boolean }
  | { type: "INCREMENT_RECOVERY_ATTEMPTS" }
  | { type: "RESET_RECOVERY_ATTEMPTS" }
  | { type: "UPDATE_STATS"; stats: ErrorContextState["errorStats"] };

/**
 * Error context value
 * Giá trị của error context
 */
interface ErrorContextValue {
  state: ErrorContextState;

  // Error management
  addError: (error: any, context?: any) => Promise<AdminError>;
  removeError: (errorId: string) => void;
  clearErrors: () => void;

  // Global error management
  setGlobalError: (error: AdminError | null) => void;

  // Recovery management
  attemptRecovery: (error: AdminError) => Promise<boolean>;
  retryLastOperation: () => Promise<void>;

  // Error reporting
  reportError: (error: AdminError, additionalContext?: any) => void;
  getErrorStats: () => ErrorContextState["errorStats"];

  // Utility methods
  hasErrors: () => boolean;
  hasCriticalErrors: () => boolean;
  getRecentErrors: (count?: number) => AdminError[];
}

/**
 * Initial state
 * State ban đầu
 */
const initialState: ErrorContextState = {
  errors: [],
  globalError: null,
  isRecovering: false,
  errorStats: {
    total: 0,
    byType: {} as Record<AdminErrorType, number>,
    bySeverity: {} as Record<ErrorSeverity, number>,
  },
  lastErrorTime: null,
  recoveryAttempts: 0,
};

/**
 * Error context reducer
 * Reducer cho error context
 */
function createErrorContextReducer(maxErrors: number) {
  return function errorContextReducer(
    state: ErrorContextState,
    action: ErrorContextAction
  ): ErrorContextState {
    switch (action.type) {
      case "ADD_ERROR":
        let newErrors = [...state.errors, action.error];

        // Limit number of stored errors
        if (newErrors.length > maxErrors) {
          newErrors = newErrors.slice(-maxErrors); // Keep only the latest errors
        }

        return {
          ...state,
          errors: newErrors,
          lastErrorTime: Date.now(),
          errorStats: calculateErrorStats(newErrors),
        };

      case "REMOVE_ERROR":
        const filteredErrors = state.errors.filter(
          (error) => `${error.timestamp}_${error.type}` !== action.errorId
        );
        return {
          ...state,
          errors: filteredErrors,
          errorStats: calculateErrorStats(filteredErrors),
        };

      case "CLEAR_ERRORS":
        return {
          ...state,
          errors: [],
          errorStats: {
            total: 0,
            byType: {} as Record<AdminErrorType, number>,
            bySeverity: {} as Record<ErrorSeverity, number>,
          },
        };

      case "SET_GLOBAL_ERROR":
        return {
          ...state,
          globalError: action.error,
        };

      case "SET_RECOVERING":
        return {
          ...state,
          isRecovering: action.isRecovering,
        };

      case "INCREMENT_RECOVERY_ATTEMPTS":
        return {
          ...state,
          recoveryAttempts: state.recoveryAttempts + 1,
        };

      case "RESET_RECOVERY_ATTEMPTS":
        return {
          ...state,
          recoveryAttempts: 0,
        };

      case "UPDATE_STATS":
        return {
          ...state,
          errorStats: action.stats,
        };

      default:
        return state;
    }
  };
}

/**
 * Calculate error statistics
 * Tính toán thống kê lỗi
 */
function calculateErrorStats(errors: AdminError[]): ErrorContextState["errorStats"] {
  const byType = {} as Record<AdminErrorType, number>;
  const bySeverity = {} as Record<ErrorSeverity, number>;

  errors.forEach((error) => {
    byType[error.type] = (byType[error.type] || 0) + 1;
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
  });

  return {
    total: errors.length,
    byType,
    bySeverity,
  };
}

/**
 * Create error context
 * Tạo error context
 */
const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

/**
 * Error context provider props
 * Props cho error context provider
 */
interface ErrorContextProviderProps {
  children: ReactNode;
  maxErrors?: number;
  enablePersistence?: boolean;
  enableReporting?: boolean;
}

/**
 * Admin Error Context Provider
 * Provider cho admin error context
 */
export function AdminErrorContextProvider({
  children,
  maxErrors = 100,
  enablePersistence = true,
  enableReporting = true,
}: ErrorContextProviderProps) {
  const [state, dispatch] = useReducer(createErrorContextReducer(maxErrors), initialState);

  /**
   * Add error to context
   * Thêm error vào context
   */
  const addError = useCallback(
    async (error: any, context?: any): Promise<AdminError> => {
      const adminError = await adminErrorHandler.handleError(error, context);

      dispatch({ type: "ADD_ERROR", error: adminError });

      // Report error if enabled
      if (enableReporting) {
        reportError(adminError, context);
      }

      return adminError;
    },
    [maxErrors, enableReporting]
  ); // Remove state.errors.length dependency

  /**
   * Remove error from context
   * Xóa error khỏi context
   */
  const removeError = useCallback((errorId: string) => {
    dispatch({ type: "REMOVE_ERROR", errorId });
  }, []);

  /**
   * Clear all errors
   * Xóa tất cả errors
   */
  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  /**
   * Set global error
   * Set global error
   */
  const setGlobalError = useCallback((error: AdminError | null) => {
    dispatch({ type: "SET_GLOBAL_ERROR", error });
  }, []);

  /**
   * Attempt error recovery
   * Thử phục hồi lỗi
   */
  const attemptRecovery = useCallback(async (error: AdminError): Promise<boolean> => {
    if (!error.recoverable) {
      return false;
    }

    dispatch({ type: "SET_RECOVERING", isRecovering: true });
    dispatch({ type: "INCREMENT_RECOVERY_ATTEMPTS" });

    try {
      // Use AdminErrorHandler's recovery mechanism
      await adminErrorHandler.handleError(error, {
        action: "RECOVERY_ATTEMPT",
        requestId: `recovery_${Date.now()}`,
      });

      dispatch({ type: "RESET_RECOVERY_ATTEMPTS" });
      toast.success("Đã khôi phục thành công!");
      return true;
    } catch (recoveryError) {
      console.error("Recovery failed:", recoveryError);
      toast.error("Không thể khôi phục. Vui lòng thử lại.");
      return false;
    } finally {
      dispatch({ type: "SET_RECOVERING", isRecovering: false });
    }
  }, []);

  /**
   * Retry last operation
   * Thử lại operation cuối
   */
  const retryLastOperation = useCallback(async () => {
    const lastError = state.errors[state.errors.length - 1];
    if (!lastError || !lastError.retryable) {
      toast.warning("Không có operation nào để thử lại.");
      return;
    }

    await attemptRecovery(lastError);
  }, [state.errors, attemptRecovery]);

  /**
   * Report error for analytics/monitoring
   * Báo cáo error cho analytics/monitoring
   */
  const reportError = useCallback(
    (error: AdminError, additionalContext?: any) => {
      if (!enableReporting) return;

      // In production, this would send to monitoring service
      if (process.env.NODE_ENV === "development") {
        console.group("🚨 Admin Error Report");
        console.error("Error:", error);
        console.log("Additional Context:", additionalContext);
        console.log("Error Stats:", state.errorStats);
        console.groupEnd();
      }

      // Could integrate with services like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error, { extra: additionalContext });
    },
    [enableReporting, state.errorStats]
  );

  /**
   * Get error statistics
   * Lấy thống kê lỗi
   */
  const getErrorStats = useCallback(() => {
    return state.errorStats;
  }, [state.errorStats]);

  /**
   * Check if has errors
   * Kiểm tra có errors không
   */
  const hasErrors = useCallback(() => {
    return state.errors.length > 0;
  }, [state.errors.length]);

  /**
   * Check if has critical errors
   * Kiểm tra có critical errors không
   */
  const hasCriticalErrors = useCallback(() => {
    return state.errors.some((error) => error.severity === ErrorSeverity.CRITICAL);
  }, [state.errors]);

  /**
   * Get recent errors
   * Lấy errors gần đây
   */
  const getRecentErrors = useCallback(
    (count: number = 5) => {
      return state.errors.slice(-count).reverse();
    },
    [state.errors]
  );

  /**
   * Persist errors to localStorage
   * Lưu errors vào localStorage
   */
  useEffect(() => {
    if (!enablePersistence || typeof window === "undefined") return;

    try {
      const errorData = {
        errors: state.errors.slice(-10), // Only persist last 10 errors
        timestamp: Date.now(),
      };
      localStorage.setItem("admin_error_context", JSON.stringify(errorData));
    } catch (error) {
      console.warn("Failed to persist error context:", error);
    }
  }, [state.errors, enablePersistence]);

  /**
   * Load persisted errors on mount
   * Load errors đã lưu khi mount
   */
  useEffect(() => {
    if (!enablePersistence || typeof window === "undefined") return;

    try {
      const persistedData = localStorage.getItem("admin_error_context");
      if (persistedData) {
        const { errors, timestamp } = JSON.parse(persistedData);

        // Only load errors from last 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          errors.forEach((error: AdminError) => {
            dispatch({ type: "ADD_ERROR", error });
          });
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted error context:", error);
    }
  }, [enablePersistence]);

  const contextValue: ErrorContextValue = {
    state,
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    attemptRecovery,
    retryLastOperation,
    reportError,
    getErrorStats,
    hasErrors,
    hasCriticalErrors,
    getRecentErrors,
  };

  return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
}

/**
 * Hook to use admin error context
 * Hook để sử dụng admin error context
 */
export function useAdminErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error("useAdminErrorContext must be used within AdminErrorContextProvider");
  }

  return context;
}
