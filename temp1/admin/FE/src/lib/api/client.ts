/**
 * Enhanced Admin API Client for NyNus
 * Client API admin nâng cao cho NyNus với comprehensive error handling và performance monitoring
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
} from "axios";
import { toast } from "sonner";

import {
  ApiResponse,
  ApiError,
  EnhancedError,
  ErrorType,
  RequestInfo,
  AdminRequestOptions,
  LogLevel,
  ApiLogEntry,
  PerformanceMetrics,
} from "./types";
import {
  getApiClientConfig,
  ADMIN_ERROR_MESSAGES,
  HTTP_STATUS,
  PERFORMANCE_THRESHOLDS,
  ADMIN_SECURITY_CONFIG,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUTS,
} from "./config";
import {
  isTokenExpired,
  isTokenExpiringSoon,
  validateToken,
  createTokenRefreshScheduler,
  TokenSecurity,
} from "../utils/token.utils";
import {
  setAdminTokens,
  getAdminAccessToken,
  getAdminRefreshToken,
  clearAdminAuth,
  updateLastActivity,
} from "../utils/storage.utils";

/**
 * Request tracking utility for performance monitoring
 * Utility tracking request cho performance monitoring
 */
class RequestTracker {
  private requests = new Map<string, RequestInfo>();
  private requestCounter = 0;

  generateRequestId(): string {
    return `admin_req_${Date.now()}_${++this.requestCounter}`;
  }

  startRequest(requestId: string, url: string, method: string): void {
    this.requests.set(requestId, {
      id: requestId,
      url,
      method,
      startTime: Date.now(),
    });
  }

  endRequest(requestId: string, status: number, error = false): RequestInfo | null {
    const request = this.requests.get(requestId);
    if (request) {
      const endTime = Date.now();
      const duration = endTime - request.startTime;

      const updatedRequest = {
        ...request,
        endTime,
        duration,
        status,
        error,
      };

      this.requests.set(requestId, updatedRequest);

      // Clean up old requests (keep last 50 for admin)
      if (this.requests.size > 50) {
        const oldestKey = this.requests.keys().next().value;
        if (oldestKey) {
          this.requests.delete(oldestKey);
        }
      }

      return updatedRequest;
    }
    return null;
  }

  getRequest(requestId: string): RequestInfo | undefined {
    return this.requests.get(requestId);
  }

  getAllRequests(): RequestInfo[] {
    return Array.from(this.requests.values());
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return Array.from(this.requests.values())
      .filter((req) => req.duration !== undefined)
      .map((req) => ({
        requestId: req.id,
        url: req.url,
        method: req.method,
        duration: req.duration!,
        status: req.status!,
        timestamp: new Date(req.startTime).toISOString(),
        error: req.error || false,
      }));
  }
}

/**
 * API Logger for comprehensive request/response logging
 * Logger API cho logging request/response toàn diện
 */
class ApiLogger {
  private logs: ApiLogEntry[] = [];
  private maxLogs = 100;

  log(entry: Omit<ApiLogEntry, "timestamp">): void {
    const logEntry: ApiLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging in development
    if (process.env.NODE_ENV === "development") {
      try {
        // Ensure entry.level exists and is valid
        const level = entry.level || "info";
        const logMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";

        console[logMethod](`[Admin API ${level.toUpperCase()}]`, {
          requestId: entry.requestId || "unknown",
          method: entry.method || "UNKNOWN",
          url: entry.url || "unknown",
          message: entry.message || "No message",
          ...(entry.status && { status: entry.status }),
          ...(entry.duration && { duration: `${entry.duration}ms` }),
          ...(entry.context && { context: entry.context }),
        });
      } catch (error) {
        // Fallback logging if there's any issue
        console.error("[Admin API ERROR]", {
          error: error instanceof Error ? error.message : "Unknown logging error",
          originalEntry: entry,
        });
      }
    }
  }

  getLogs(level?: LogLevel): ApiLogEntry[] {
    return level ? this.logs.filter((log) => log.level === level) : this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Main Admin API Client class
 * Class Admin API Client chính
 */
export class AdminApiClient {
  private client: AxiosInstance;
  private config = getApiClientConfig();
  private requestTracker = new RequestTracker();
  private logger = new ApiLogger();
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private tokenRefreshScheduler: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      withCredentials: true,
      headers: DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   * Thiết lập interceptors cho request và response
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const requestId = this.requestTracker.generateRequestId();
        (config as any).metadata = { requestId, startTime: Date.now() };

        // Start request tracking
        this.requestTracker.startRequest(
          requestId,
          config.url || "",
          (config.method || "GET").toUpperCase()
        );

        // Add request headers
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }

        config.headers.set("X-Request-ID", requestId);
        config.headers.set("X-Timestamp", new Date().toISOString());

        // Add authentication token with validation
        const token = this.getAccessToken();
        if (token) {
          // Validate token before using
          const validation = validateToken(token);
          if (validation.isValid) {
            config.headers.set("Authorization", `Bearer ${token}`);

            // Update last activity
            updateLastActivity();

            // Schedule token refresh if needed
            // this.scheduleTokenRefreshIfNeeded(token); // TODO: Fix method access
          } else {
            // Token is invalid, clear it
            this.clearTokens();
            this.logger.log({
              requestId,
              level: "warn",
              message: `Invalid token detected: ${validation.error}`,
              method: config.method?.toUpperCase() || "GET",
              url: config.url || "",
              context: { tokenValidation: validation },
            });
          }
        }

        // Log request
        if (this.config.enableLogging) {
          this.logger.log({
            requestId,
            level: "info",
            message: `Request started: ${config.method?.toUpperCase()} ${config.url}`,
            method: config.method?.toUpperCase() || "GET",
            url: config.url || "",
            context: {
              headers: this.sanitizeHeaders(config.headers),
              data: config.data ? this.sanitizeRequestData(config.data) : undefined,
            },
          });
        }

        return config;
      },
      (error) => {
        this.logger.log({
          requestId: "unknown",
          level: "error",
          message: `Request setup failed: ${error.message}`,
          method: "UNKNOWN",
          url: "unknown",
          context: { error: error.message },
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const requestId = (response.config as any)?.metadata?.requestId;
        const startTime = (response.config as any)?.metadata?.startTime;

        if (requestId) {
          const requestInfo = this.requestTracker.endRequest(requestId, response.status);

          if (this.config.enableLogging && requestInfo) {
            const duration = requestInfo.duration || 0;
            const performanceLevel = this.getPerformanceLevel(duration);

            this.logger.log({
              requestId,
              level: performanceLevel === "slow" ? "warn" : "info",
              message: `Request completed: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
              method: response.config.method?.toUpperCase() || "GET",
              url: response.config.url || "",
              status: response.status,
              duration,
              context: {
                performance: performanceLevel,
                responseSize: JSON.stringify(response.data).length,
              },
            });
          }
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const requestId = originalRequest?.metadata?.requestId;
        const status = error.response?.status || 0;

        // Track failed response
        if (requestId) {
          this.requestTracker.endRequest(requestId, status, true);
        }

        // Log error
        if (this.config.enableLogging) {
          this.logger.log({
            requestId: requestId || "unknown",
            level: "error",
            message: `Request failed: ${status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
            method: originalRequest?.method?.toUpperCase() || "UNKNOWN",
            url: originalRequest?.url || "unknown",
            status,
            error: true,
            context: {
              errorMessage: error.message,
              responseData: error.response?.data,
            },
          });
        }

        // Handle specific error cases
        return this.handleResponseError(error, originalRequest);
      }
    );
  }

  /**
   * Handle response errors with retry logic and token refresh
   * Xử lý lỗi response với retry logic và token refresh
   */
  private async handleResponseError(error: AxiosError, originalRequest: any): Promise<any> {
    const status = error.response?.status;

    // Handle authentication errors
    if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        await this.refreshToken();
        this.processQueue(null);
        return this.client(originalRequest);
      } catch (refreshError) {
        this.processQueue(refreshError);
        this.handleAuthenticationFailure();
        throw this.createEnhancedError(error, "AUTHENTICATION_ERROR");
      } finally {
        this.isRefreshing = false;
      }
    }

    // Handle admin permission errors
    if (status === HTTP_STATUS.FORBIDDEN) {
      this.handlePermissionError();
      throw this.createEnhancedError(error, "AUTHORIZATION_ERROR");
    }

    // Handle rate limiting
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      const retryAfter = error.response?.headers["retry-after"];
      if (retryAfter) {
        await this.delay(parseInt(retryAfter) * 1000);
        return this.client(originalRequest);
      }
      throw this.createEnhancedError(error, "RATE_LIMIT_ERROR");
    }

    // Handle retry logic for server errors
    if (this.shouldRetry(error) && !originalRequest._retryCount) {
      return this.retryRequest(originalRequest, error);
    }

    // Create enhanced error for all other cases
    throw this.createEnhancedError(error, this.getErrorType(error));
  }

  /**
   * Process queued requests after token refresh
   * Xử lý các request đã queue sau khi refresh token
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Retry request with exponential backoff
   * Retry request với exponential backoff
   */
  private async retryRequest(originalRequest: any, error: AxiosError): Promise<any> {
    const retryConfig = this.config.retryConfig;
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    if (originalRequest._retryCount > retryConfig.maxRetries) {
      throw this.createEnhancedError(error, "SERVER_ERROR");
    }

    const delay = retryConfig.exponentialBackoff
      ? retryConfig.retryDelay * Math.pow(2, originalRequest._retryCount - 1)
      : retryConfig.retryDelay;

    await this.delay(delay);

    this.logger.log({
      requestId: originalRequest.metadata?.requestId || "unknown",
      level: "warn",
      message: `Retrying request (attempt ${originalRequest._retryCount}/${retryConfig.maxRetries})`,
      method: originalRequest.method?.toUpperCase() || "UNKNOWN",
      url: originalRequest.url || "unknown",
      context: { retryDelay: delay, attempt: originalRequest._retryCount },
    });

    return this.client(originalRequest);
  }

  /**
   * Check if request should be retried
   * Kiểm tra xem request có nên retry không
   */
  private shouldRetry(error: AxiosError): boolean {
    return this.config.retryConfig.retryCondition(error);
  }

  /**
   * Create enhanced error with additional context
   * Tạo enhanced error với context bổ sung
   */
  private createEnhancedError(error: AxiosError, type: ErrorType): EnhancedError {
    const enhancedError = new Error(this.getErrorMessage(type)) as EnhancedError;
    enhancedError.type = type;
    enhancedError.statusCode = error.response?.status;
    enhancedError.originalError = error;
    enhancedError.requestId = (error.config as any)?.metadata?.requestId;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.context = {
      url: error.config?.url,
      method: error.config?.method,
      responseData: error.response?.data,
    };

    return enhancedError;
  }

  /**
   * Get error type from axios error
   * Lấy error type từ axios error
   */
  private getErrorType(error: AxiosError): ErrorType {
    if (error.code === "ECONNABORTED" || error.code === "TIMEOUT") {
      return "TIMEOUT_ERROR";
    }
    if (error.code === "NETWORK_ERROR" || !error.response) {
      return "NETWORK_ERROR";
    }

    const status = error.response.status;
    if (status === HTTP_STATUS.UNAUTHORIZED) return "AUTHENTICATION_ERROR";
    if (status === HTTP_STATUS.FORBIDDEN) return "AUTHORIZATION_ERROR";
    if (status === HTTP_STATUS.NOT_FOUND) return "RESOURCE_NOT_FOUND";
    if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY) return "VALIDATION_ERROR";
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) return "RATE_LIMIT_ERROR";
    if (status >= 500) return "SERVER_ERROR";

    return "UNKNOWN_ERROR";
  }

  /**
   * Get user-friendly error message
   * Lấy thông báo lỗi thân thiện với user
   */
  private getErrorMessage(type: ErrorType): string {
    return ADMIN_ERROR_MESSAGES[type] || ADMIN_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  /**
   * Get performance level based on duration
   * Lấy mức hiệu suất dựa trên duration
   */
  private getPerformanceLevel(duration: number): "fast" | "normal" | "slow" | "very_slow" {
    if (duration < PERFORMANCE_THRESHOLDS.FAST) return "fast";
    if (duration < PERFORMANCE_THRESHOLDS.NORMAL) return "normal";
    if (duration < PERFORMANCE_THRESHOLDS.SLOW) return "slow";
    return "very_slow";
  }

  /**
   * Utility methods
   * Các phương thức tiện ích
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

    Object.keys(headers).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = headers[key];
      }
    });

    return sanitized;
  }

  private sanitizeRequestData(data: any): any {
    if (typeof data !== "object" || data === null) return data;

    const sensitiveFields = ["password", "token", "secret", "key"];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Enhanced token management methods
   * Các phương thức quản lý token nâng cao
   */
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return getAdminAccessToken();
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return getAdminRefreshToken();
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    // Validate tokens before storing
    if (
      TokenSecurity.isSuspiciousToken(accessToken) ||
      TokenSecurity.isSuspiciousToken(refreshToken)
    ) {
      this.logger.log({
        requestId: "token_validation",
        level: "error",
        message: "Suspicious tokens detected, not storing",
        method: "TOKEN_MANAGEMENT",
        url: "internal",
        context: {
          accessTokenFingerprint: TokenSecurity.generateTokenFingerprint(accessToken),
          refreshTokenFingerprint: TokenSecurity.generateTokenFingerprint(refreshToken),
        },
      });
      return;
    }

    setAdminTokens(accessToken, refreshToken);

    // Schedule token refresh
    // this.scheduleTokenRefreshIfNeeded(accessToken); // TODO: Fix method access

    this.logger.log({
      requestId: "token_management",
      level: "info",
      message: "Tokens updated successfully",
      method: "TOKEN_MANAGEMENT",
      url: "internal",
      context: {
        accessTokenFingerprint: TokenSecurity.generateTokenFingerprint(accessToken),
      },
    });
  }

  private clearTokens(): void {
    if (typeof window === "undefined") return;

    // Clear token refresh scheduler
    if (this.tokenRefreshScheduler) {
      this.tokenRefreshScheduler();
      this.tokenRefreshScheduler = null;
    }

    clearAdminAuth();

    this.logger.log({
      requestId: "token_management",
      level: "info",
      message: "Tokens cleared",
      method: "TOKEN_MANAGEMENT",
      url: "internal",
    });
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Validate refresh token
    if (isTokenExpired(refreshToken)) {
      throw new Error("Refresh token is expired");
    }

    this.logger.log({
      requestId: "token_refresh",
      level: "info",
      message: "Starting token refresh",
      method: "TOKEN_REFRESH",
      url: `${this.config.baseURL}/auth/refresh`,
    });

    const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    this.setTokens(accessToken, newRefreshToken);

    this.logger.log({
      requestId: "token_refresh",
      level: "info",
      message: "Token refresh completed successfully",
      method: "TOKEN_REFRESH",
      url: `${this.config.baseURL}/auth/refresh`,
    });
  }

  /**
   * Schedule token refresh if needed
   * Lên lịch refresh token nếu cần
   */
  private scheduleTokenRefreshIfNeeded(token: string): void {
    // Clear existing scheduler
    if (this.tokenRefreshScheduler) {
      this.tokenRefreshScheduler();
      this.tokenRefreshScheduler = null;
    }

    // Check if token needs refresh soon
    if (isTokenExpiringSoon(token, this.config.tokenRefreshThreshold)) {
      this.tokenRefreshScheduler = createTokenRefreshScheduler(
        token,
        async () => {
          try {
            await this.refreshToken();
          } catch (error) {
            this.logger.log({
              requestId: "scheduled_refresh",
              level: "error",
              message: `Scheduled token refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              method: "TOKEN_REFRESH",
              url: "internal",
              error: true,
            });
          }
        },
        this.config.tokenRefreshThreshold
      );

      if (this.tokenRefreshScheduler) {
        this.logger.log({
          requestId: "token_scheduler",
          level: "info",
          message: "Token refresh scheduled",
          method: "TOKEN_MANAGEMENT",
          url: "internal",
        });
      }
    }
  }

  private handleAuthenticationFailure(): void {
    this.clearTokens();

    // Show user-friendly message
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }

  private handlePermissionError(): void {
    toast.error("Bạn không có quyền thực hiện thao tác này.");
  }

  /**
   * Public API methods
   * Các phương thức API public
   */

  /**
   * Generic GET request
   * Request GET tổng quát
   */
  async get<T = any>(url: string, options: AdminRequestOptions = {}): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: "GET",
      url,
      timeout: options.timeout || REQUEST_TIMEOUTS.DEFAULT,
      headers: options.headers,
      params: options.params,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Generic POST request
   * Request POST tổng quát
   */
  async post<T = any>(
    url: string,
    data?: any,
    options: AdminRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: "POST",
      url,
      data,
      timeout: options.timeout || REQUEST_TIMEOUTS.DEFAULT,
      headers: options.headers,
      params: options.params,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Generic PUT request
   * Request PUT tổng quát
   */
  async put<T = any>(
    url: string,
    data?: any,
    options: AdminRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: "PUT",
      url,
      data,
      timeout: options.timeout || REQUEST_TIMEOUTS.DEFAULT,
      headers: options.headers,
      params: options.params,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Generic DELETE request
   * Request DELETE tổng quát
   */
  async delete<T = any>(url: string, options: AdminRequestOptions = {}): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: "DELETE",
      url,
      timeout: options.timeout || REQUEST_TIMEOUTS.DEFAULT,
      headers: options.headers,
      params: options.params,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Generic PATCH request
   * Request PATCH tổng quát
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options: AdminRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: "PATCH",
      url,
      data,
      timeout: options.timeout || REQUEST_TIMEOUTS.DEFAULT,
      headers: options.headers,
      params: options.params,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   * Upload file với progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    options: AdminRequestOptions & {
      onUploadProgress?: (progressEvent: any) => void;
    } = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      method: "POST",
      url,
      data: formData,
      timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
      headers: {
        "Content-Type": "multipart/form-data",
        ...options.headers,
      },
      onUploadProgress: options.onUploadProgress,
      signal: options.signal,
    };

    const response = await this.client.request<ApiResponse<T>>(config);
    return response.data;
  }

  /**
   * Download file with progress tracking
   * Download file với progress tracking
   */
  async downloadFile(
    url: string,
    options: AdminRequestOptions & {
      onDownloadProgress?: (progressEvent: any) => void;
    } = {}
  ): Promise<Blob> {
    const config: AxiosRequestConfig = {
      method: "GET",
      url,
      responseType: "blob",
      timeout: REQUEST_TIMEOUTS.EXPORT_OPERATIONS,
      headers: options.headers,
      params: options.params,
      onDownloadProgress: options.onDownloadProgress,
      signal: options.signal,
    };

    const response = await this.client.request<Blob>(config);
    return response.data;
  }

  /**
   * Utility methods for debugging and monitoring
   * Các phương thức tiện ích cho debugging và monitoring
   */

  /**
   * Get performance metrics
   * Lấy metrics hiệu suất
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.requestTracker.getPerformanceMetrics();
  }

  /**
   * Get API logs
   * Lấy logs API
   */
  getLogs(level?: LogLevel): ApiLogEntry[] {
    return this.logger.getLogs(level);
  }

  /**
   * Clear logs
   * Xóa logs
   */
  clearLogs(): void {
    this.logger.clearLogs();
  }

  /**
   * Get current configuration
   * Lấy cấu hình hiện tại
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }

  /**
   * Check if client is authenticated
   * Kiểm tra xem client có được xác thực không
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Manually clear authentication
   * Xóa xác thực thủ công
   */
  clearAuthentication(): void {
    this.clearTokens();
  }

  /**
   * Get request statistics
   * Lấy thống kê request
   */
  getRequestStats(): {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    slowRequests: number;
  } {
    const metrics = this.getPerformanceMetrics();
    const total = metrics.length;
    const successful = metrics.filter((m) => !m.error).length;
    const failed = total - successful;
    const averageResponseTime =
      total > 0 ? metrics.reduce((sum, m) => sum + m.duration, 0) / total : 0;
    const slowRequests = metrics.filter((m) => m.duration > PERFORMANCE_THRESHOLDS.SLOW).length;

    return {
      total,
      successful,
      failed,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
    };
  }

  /**
   * Health check endpoint
   * Endpoint kiểm tra sức khỏe
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.get("/health", {
        timeout: REQUEST_TIMEOUTS.HEALTH_CHECK,
      });
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Create and export singleton instance
 * Tạo và export singleton instance
 */
export const adminApiClient = new AdminApiClient();

/**
 * Export types for external use
 * Export types để sử dụng bên ngoài
 */
export type {
  ApiResponse,
  ApiError,
  EnhancedError,
  ErrorType,
  AdminRequestOptions,
  LogLevel,
  ApiLogEntry,
  PerformanceMetrics,
} from "./types";
