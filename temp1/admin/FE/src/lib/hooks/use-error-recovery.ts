/**
 * useErrorRecovery Hook
 * Hook cho error recovery mechanisms với comprehensive recovery strategies
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminError, AdminErrorType, ErrorSeverity } from "../api/utils/error-handler";
import { useAdminErrorContext } from "../error-handling/error-context";
import { useAdminAuth } from "../../hooks/use-admin-auth";

/**
 * Recovery strategy type
 * Loại recovery strategy
 */
type RecoveryStrategy =
  | "retry"
  | "refresh"
  | "redirect"
  | "fallback"
  | "logout"
  | "reload"
  | "ignore";

/**
 * Recovery options
 * Tùy chọn recovery
 */
interface RecoveryOptions {
  strategy?: RecoveryStrategy;
  maxAttempts?: number;
  delay?: number;
  fallbackData?: any;
  redirectPath?: string;
  onSuccess?: () => void;
  onFailure?: (error: AdminError) => void;
}

/**
 * Recovery state
 * Trạng thái recovery
 */
interface RecoveryState {
  isRecovering: boolean;
  recoveryAttempts: number;
  lastRecoveryTime: number | null;
  recoveryStrategy: RecoveryStrategy | null;
}

/**
 * useErrorRecovery Hook
 * Hook chính cho error recovery
 */
export function useErrorRecovery() {
  const router = useRouter();
  const { logout } = useAdminAuth();
  const errorContext = useAdminErrorContext();

  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    recoveryAttempts: 0,
    lastRecoveryTime: null,
    recoveryStrategy: null,
  });

  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Determine recovery strategy based on error
   * Xác định recovery strategy dựa trên error
   */
  const determineRecoveryStrategy = useCallback((error: AdminError): RecoveryStrategy => {
    switch (error.type) {
      case AdminErrorType.AUTHENTICATION_ERROR:
        return "logout";

      case AdminErrorType.AUTHORIZATION_ERROR:
        return "redirect";

      case AdminErrorType.NETWORK_ERROR:
        return "retry";

      case AdminErrorType.RATE_LIMIT_ERROR:
        return "retry";

      case AdminErrorType.SERVER_ERROR:
        return "retry";

      case AdminErrorType.MAINTENANCE_ERROR:
        return "refresh";

      case AdminErrorType.DATA_CONFLICT_ERROR:
        return "refresh";

      case AdminErrorType.RESOURCE_NOT_FOUND:
        return "redirect";

      case AdminErrorType.VALIDATION_ERROR:
        return "fallback";

      case AdminErrorType.SYSTEM_OVERLOAD:
        return "retry";

      case AdminErrorType.UNKNOWN_ERROR:
      default:
        return error.severity === ErrorSeverity.CRITICAL ? "reload" : "retry";
    }
  }, []);

  /**
   * Execute recovery strategy
   * Thực hiện recovery strategy
   */
  const executeRecoveryStrategy = useCallback(
    async (
      error: AdminError,
      strategy: RecoveryStrategy,
      options: RecoveryOptions = {}
    ): Promise<boolean> => {
      const {
        maxAttempts = 3,
        delay = 1000,
        fallbackData,
        redirectPath,
        onSuccess,
        onFailure,
      } = options;

      setRecoveryState((prev) => ({
        ...prev,
        isRecovering: true,
        recoveryStrategy: strategy,
      }));

      try {
        switch (strategy) {
          case "retry":
            return await executeRetryStrategy(error, maxAttempts, delay);

          case "refresh":
            return await executeRefreshStrategy(error);

          case "redirect":
            return await executeRedirectStrategy(error, redirectPath);

          case "fallback":
            return await executeFallbackStrategy(error, fallbackData);

          case "logout":
            return await executeLogoutStrategy(error);

          case "reload":
            return await executeReloadStrategy(error);

          case "ignore":
            return true;

          default:
            console.warn(`Unknown recovery strategy: ${strategy}`);
            return false;
        }
      } catch (recoveryError) {
        console.error("Recovery strategy failed:", recoveryError);
        onFailure?.(error);
        return false;
      } finally {
        setRecoveryState((prev) => ({
          ...prev,
          isRecovering: false,
          lastRecoveryTime: Date.now(),
          recoveryAttempts: prev.recoveryAttempts + 1,
        }));
      }
    },
    []
  );

  /**
   * Execute retry strategy
   * Thực hiện retry strategy
   */
  const executeRetryStrategy = useCallback(
    async (error: AdminError, maxAttempts: number, delay: number): Promise<boolean> => {
      if (recoveryState.recoveryAttempts >= maxAttempts) {
        toast.error("Đã thử tối đa số lần cho phép. Vui lòng tải lại trang.");
        return false;
      }

      // Wait before retry
      await new Promise((resolve) =>
        setTimeout(resolve, delay * (recoveryState.recoveryAttempts + 1))
      );

      try {
        // Attempt recovery through error context
        const recovered = await errorContext.attemptRecovery(error);

        if (recovered) {
          toast.success("Đã khôi phục thành công!");
          return true;
        } else {
          toast.warning(`Thử lại lần ${recoveryState.recoveryAttempts + 1}/${maxAttempts}...`);
          return false;
        }
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        return false;
      }
    },
    [recoveryState.recoveryAttempts, errorContext]
  );

  /**
   * Execute refresh strategy
   * Thực hiện refresh strategy
   */
  const executeRefreshStrategy = useCallback(
    async (error: AdminError): Promise<boolean> => {
      try {
        // Clear error state
        errorContext.clearErrors();

        // Refresh current page data
        if (typeof window !== "undefined") {
          // Trigger a soft refresh by reloading router
          router.refresh();
          toast.info("Đang làm mới dữ liệu...");
          return true;
        }

        return false;
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
        return false;
      }
    },
    [errorContext, router]
  );

  /**
   * Execute redirect strategy
   * Thực hiện redirect strategy
   */
  const executeRedirectStrategy = useCallback(
    async (error: AdminError, redirectPath?: string): Promise<boolean> => {
      try {
        let targetPath = redirectPath;

        if (!targetPath) {
          // Determine redirect path based on error type
          switch (error.type) {
            case AdminErrorType.AUTHORIZATION_ERROR:
              targetPath = "/admin";
              break;
            case AdminErrorType.RESOURCE_NOT_FOUND:
              targetPath = "/admin";
              break;
            default:
              targetPath = "/admin";
          }
        }

        toast.info("Đang chuyển hướng...");
        router.push(targetPath);
        return true;
      } catch (redirectError) {
        console.error("Redirect failed:", redirectError);
        return false;
      }
    },
    [router]
  );

  /**
   * Execute fallback strategy
   * Thực hiện fallback strategy
   */
  const executeFallbackStrategy = useCallback(
    async (error: AdminError, fallbackData?: any): Promise<boolean> => {
      try {
        // Clear the specific error
        errorContext.removeError(`${error.timestamp}_${error.type}`);

        if (fallbackData) {
          // Use fallback data (this would need to be handled by the component)
          toast.info("Sử dụng dữ liệu dự phòng.");
        } else {
          toast.info("Đã bỏ qua lỗi và tiếp tục.");
        }

        return true;
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        return false;
      }
    },
    [errorContext]
  );

  /**
   * Execute logout strategy
   * Thực hiện logout strategy
   */
  const executeLogoutStrategy = useCallback(
    async (error: AdminError): Promise<boolean> => {
      try {
        toast.warning("Phiên đăng nhập không hợp lệ. Đang đăng xuất...");
        await logout();
        return true;
      } catch (logoutError) {
        console.error("Logout failed:", logoutError);
        return false;
      }
    },
    [logout]
  );

  /**
   * Execute reload strategy
   * Thực hiện reload strategy
   */
  const executeReloadStrategy = useCallback(async (error: AdminError): Promise<boolean> => {
    try {
      toast.warning("Đang tải lại trang do lỗi nghiêm trọng...");

      // Give user time to read the message
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 2000);

      return true;
    } catch (reloadError) {
      console.error("Reload failed:", reloadError);
      return false;
    }
  }, []);

  /**
   * Recover from error with automatic strategy selection
   * Phục hồi từ error với automatic strategy selection
   */
  const recoverFromError = useCallback(
    async (error: AdminError, options: RecoveryOptions = {}): Promise<boolean> => {
      const strategy = options.strategy || determineRecoveryStrategy(error);
      return executeRecoveryStrategy(error, strategy, options);
    },
    [determineRecoveryStrategy, executeRecoveryStrategy]
  );

  /**
   * Recover from multiple errors
   * Phục hồi từ nhiều errors
   */
  const recoverFromErrors = useCallback(
    async (errors: AdminError[], options: RecoveryOptions = {}): Promise<boolean[]> => {
      const results = await Promise.allSettled(
        errors.map((error) => recoverFromError(error, options))
      );

      return results.map((result) => (result.status === "fulfilled" ? result.value : false));
    },
    [recoverFromError]
  );

  /**
   * Schedule automatic recovery
   * Lên lịch recovery tự động
   */
  const scheduleRecovery = useCallback(
    (error: AdminError, delay: number = 5000, options: RecoveryOptions = {}) => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }

      recoveryTimeoutRef.current = setTimeout(() => {
        recoverFromError(error, options);
      }, delay);

      return () => {
        if (recoveryTimeoutRef.current) {
          clearTimeout(recoveryTimeoutRef.current);
          recoveryTimeoutRef.current = null;
        }
      };
    },
    [recoverFromError]
  );

  /**
   * Check if can recover from error
   * Kiểm tra có thể recover từ error không
   */
  const canRecover = useCallback(
    (error: AdminError): boolean => {
      return error.recoverable && recoveryState.recoveryAttempts < 5;
    },
    [recoveryState.recoveryAttempts]
  );

  /**
   * Reset recovery state
   * Reset trạng thái recovery
   */
  const resetRecoveryState = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      recoveryAttempts: 0,
      lastRecoveryTime: null,
      recoveryStrategy: null,
    });

    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Recovery state
    recoveryState,

    // Recovery methods
    recoverFromError,
    recoverFromErrors,
    scheduleRecovery,

    // Strategy methods
    determineRecoveryStrategy,
    executeRecoveryStrategy,

    // Utility methods
    canRecover,
    resetRecoveryState,
  };
}

/**
 * useGracefulDegradation Hook
 * Hook cho graceful degradation
 */
export function useGracefulDegradation() {
  const [isOffline, setIsOffline] = useState(false);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);
  const [degradationLevel, setDegradationLevel] = useState<"none" | "partial" | "minimal">("none");

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const enableDegradation = useCallback((level: "partial" | "minimal") => {
    setDegradationLevel(level);
    toast.warning(
      level === "partial"
        ? "Một số tính năng có thể bị hạn chế do sự cố hệ thống."
        : "Chế độ tối thiểu: Chỉ các tính năng cơ bản khả dụng."
    );
  }, []);

  const disableDegradation = useCallback(() => {
    setDegradationLevel("none");
    toast.success("Tất cả tính năng đã được khôi phục.");
  }, []);

  return {
    isOffline,
    isServiceUnavailable,
    degradationLevel,
    enableDegradation,
    disableDegradation,
    setIsServiceUnavailable,
  };
}
