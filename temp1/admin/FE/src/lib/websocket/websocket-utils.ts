/**
 * WebSocket Utility Functions for NyNus Admin
 * Các hàm tiện ích cho WebSocket client implementation
 */

import {
  WebSocketConnectionState,
  WebSocketConnectionStatus,
  WebSocketError,
  QueuedEvent,
  WebSocketMetrics,
} from "./websocket-types";
import {
  CONNECTION_STATES,
  RECONNECTION_CONFIG,
  EVENT_QUEUE_CONFIG,
  STORAGE_KEYS,
} from "./websocket-constants";

/**
 * Calculate exponential backoff delay
 * Tính toán delay cho exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = RECONNECTION_CONFIG.INITIAL_DELAY,
  maxDelay: number = RECONNECTION_CONFIG.MAX_DELAY,
  multiplier: number = RECONNECTION_CONFIG.MULTIPLIER,
  jitter: number = RECONNECTION_CONFIG.JITTER
): number {
  // Calculate exponential delay
  const exponentialDelay = Math.min(baseDelay * Math.pow(multiplier, attempt - 1), maxDelay);

  // Add jitter to prevent thundering herd
  const jitterAmount = exponentialDelay * jitter;
  const jitterOffset = (Math.random() - 0.5) * 2 * jitterAmount;

  return Math.max(0, exponentialDelay + jitterOffset);
}

/**
 * Create initial connection status
 * Tạo trạng thái kết nối ban đầu
 */
export function createInitialConnectionStatus(): WebSocketConnectionStatus {
  return {
    state: CONNECTION_STATES.DISCONNECTED as WebSocketConnectionState,
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    hasError: false,
    error: undefined,
    lastConnectedAt: undefined,
    lastDisconnectedAt: undefined,
    reconnectAttempts: 0,
    maxReconnectAttempts: RECONNECTION_CONFIG.MAX_ATTEMPTS,
    nextReconnectDelay: RECONNECTION_CONFIG.INITIAL_DELAY,
  };
}

/**
 * Update connection status
 * Cập nhật trạng thái kết nối
 */
export function updateConnectionStatus(
  currentStatus: WebSocketConnectionStatus,
  newState: WebSocketConnectionState,
  error?: string
): WebSocketConnectionStatus {
  const now = new Date();

  const updatedStatus: WebSocketConnectionStatus = {
    ...currentStatus,
    state: newState,
    isConnected: newState === CONNECTION_STATES.CONNECTED,
    isConnecting: newState === CONNECTION_STATES.CONNECTING,
    isReconnecting: newState === CONNECTION_STATES.RECONNECTING,
    hasError: newState === CONNECTION_STATES.ERROR,
    error: error || (newState === CONNECTION_STATES.ERROR ? currentStatus.error : undefined),
  };

  // Update timestamps based on state
  switch (newState) {
    case CONNECTION_STATES.CONNECTED:
      updatedStatus.lastConnectedAt = now;
      updatedStatus.reconnectAttempts = 0;
      updatedStatus.nextReconnectDelay = RECONNECTION_CONFIG.INITIAL_DELAY;
      updatedStatus.error = undefined;
      break;

    case CONNECTION_STATES.DISCONNECTED:
    case CONNECTION_STATES.ERROR:
      updatedStatus.lastDisconnectedAt = now;
      break;

    case CONNECTION_STATES.RECONNECTING:
      updatedStatus.reconnectAttempts = currentStatus.reconnectAttempts + 1;
      updatedStatus.nextReconnectDelay = calculateBackoffDelay(updatedStatus.reconnectAttempts);
      break;
  }

  return updatedStatus;
}

/**
 * Format WebSocket error
 * Format lỗi WebSocket
 */
export function formatWebSocketError(error: any): WebSocketError {
  const timestamp = new Date().toISOString();

  if (error && typeof error === "object") {
    return {
      error: error.error || error.type || "UNKNOWN_ERROR",
      message: error.message || error.description || "An unknown error occurred",
      code: error.code,
      details: error.details,
      timestamp,
    };
  }

  if (typeof error === "string") {
    return {
      error: "WEBSOCKET_ERROR",
      message: error,
      timestamp,
    };
  }

  return {
    error: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
    timestamp,
  };
}

/**
 * Validate WebSocket URL
 * Validate URL WebSocket
 */
export function validateWebSocketUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:", "ws:", "wss:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate unique event ID
 * Tạo ID duy nhất cho event
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create queued event
 * Tạo event trong queue
 */
export function createQueuedEvent(
  type: string,
  data: any,
  maxRetries: number = EVENT_QUEUE_CONFIG.MAX_RETRY_ATTEMPTS
): QueuedEvent {
  return {
    id: generateEventId(),
    type,
    data,
    timestamp: new Date(),
    retryCount: 0,
    maxRetries,
  };
}

/**
 * Check if event is expired
 * Kiểm tra event đã hết hạn chưa
 */
export function isEventExpired(
  event: QueuedEvent,
  maxAge: number = EVENT_QUEUE_CONFIG.MAX_AGE
): boolean {
  return Date.now() - event.timestamp.getTime() > maxAge;
}

/**
 * Filter expired events from queue
 * Lọc bỏ events đã hết hạn từ queue
 */
export function filterExpiredEvents(events: QueuedEvent[]): QueuedEvent[] {
  return events.filter((event) => !isEventExpired(event));
}

/**
 * Calculate connection uptime
 * Tính thời gian kết nối
 */
export function calculateUptime(connectedAt?: Date): number {
  if (!connectedAt) return 0;
  return Date.now() - connectedAt.getTime();
}

/**
 * Format uptime duration
 * Format thời gian kết nối
 */
export function formatUptime(uptime: number): string {
  const seconds = Math.floor(uptime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get connection status color
 * Lấy màu cho trạng thái kết nối
 */
export function getConnectionStatusColor(state: WebSocketConnectionState): string {
  switch (state) {
    case CONNECTION_STATES.CONNECTED:
      return "green";
    case CONNECTION_STATES.CONNECTING:
    case CONNECTION_STATES.RECONNECTING:
      return "yellow";
    case CONNECTION_STATES.ERROR:
      return "red";
    case CONNECTION_STATES.DISCONNECTED:
    default:
      return "gray";
  }
}

/**
 * Get connection status text
 * Lấy text cho trạng thái kết nối
 */
export function getConnectionStatusText(state: WebSocketConnectionState): string {
  switch (state) {
    case CONNECTION_STATES.CONNECTED:
      return "Đã kết nối";
    case CONNECTION_STATES.CONNECTING:
      return "Đang kết nối...";
    case CONNECTION_STATES.RECONNECTING:
      return "Đang kết nối lại...";
    case CONNECTION_STATES.ERROR:
      return "Lỗi kết nối";
    case CONNECTION_STATES.DISCONNECTED:
    default:
      return "Chưa kết nối";
  }
}

/**
 * Save connection stats to localStorage
 * Lưu thống kê kết nối vào localStorage
 */
export function saveConnectionStats(stats: Partial<WebSocketMetrics>): void {
  try {
    const existingStats = getConnectionStats();
    const updatedStats = { ...existingStats, ...stats };
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATS, JSON.stringify(updatedStats));
  } catch (error) {
    console.warn("Failed to save connection stats:", error);
  }
}

/**
 * Get connection stats from localStorage
 * Lấy thống kê kết nối từ localStorage
 */
export function getConnectionStats(): Partial<WebSocketMetrics> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONNECTION_STATS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn("Failed to load connection stats:", error);
    return {};
  }
}

/**
 * Clear connection stats
 * Xóa thống kê kết nối
 */
export function clearConnectionStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATS);
  } catch (error) {
    console.warn("Failed to clear connection stats:", error);
  }
}

/**
 * Debounce function
 * Hàm debounce
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 * Hàm throttle
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Check if browser supports WebSocket
 * Kiểm tra browser có hỗ trợ WebSocket không
 */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== "undefined" || typeof window !== "undefined";
}

/**
 * Get optimal transport method
 * Lấy phương thức transport tối ưu
 */
export function getOptimalTransport(): string[] {
  if (typeof window === "undefined") {
    return ["polling"];
  }

  // Check for WebSocket support
  if (isWebSocketSupported()) {
    return ["websocket", "polling"];
  }

  return ["polling"];
}

/**
 * Create WebSocket URL with namespace
 * Tạo URL WebSocket với namespace
 */
export function createWebSocketUrl(baseUrl: string, namespace: string): string {
  const url = new URL(baseUrl);

  // Convert HTTP to WebSocket protocol
  if (url.protocol === "http:") {
    url.protocol = "ws:";
  } else if (url.protocol === "https:") {
    url.protocol = "wss:";
  }

  return `${url.origin}${namespace}`;
}
