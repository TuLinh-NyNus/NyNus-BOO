/**
 * WebSocket Constants for NyNus Admin
 * Các hằng số cho WebSocket client implementation
 */

import { WebSocketConfig } from "./websocket-types";

/**
 * Default WebSocket configuration
 * Cấu hình WebSocket mặc định
 */
export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  namespace: "/admin",
  autoConnect: true,
  enableReconnection: true,
  maxReconnectAttempts: 10,
  reconnectDelay: 1000, // 1 second
  maxReconnectDelay: 30000, // 30 seconds
  reconnectDelayMultiplier: 1.5,
  timeout: 20000, // 20 seconds
  forceNew: false,
};

/**
 * WebSocket event names
 * Tên các events WebSocket
 */
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",

  // Authentication events
  CONNECTED: "connected",
  CONNECTION_ERROR: "connection_error",
  AUTHENTICATION_ERROR: "authentication_error",
  PERMISSION_ERROR: "permission_error",

  // Subscription events
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  SUBSCRIPTION_SUCCESS: "subscription_success",
  SUBSCRIPTION_ERROR: "subscription_error",

  // Heartbeat events
  HEARTBEAT: "heartbeat",
  HEARTBEAT_RESPONSE: "heartbeat_response",

  // Admin events
  SECURITY_EVENT: "security_event",
  SECURITY_EVENT_BATCH: "security_event_batch",
  USER_ACTIVITY: "user_activity",
  USER_ACTIVITY_AGGREGATED: "user_activity_aggregated",
  USER_METRICS_UPDATE: "user_metrics_update",
  SYSTEM_METRICS: "system_metrics",
  ADMIN_NOTIFICATION: "admin_notification",
  BULK_OPERATION_PROGRESS: "bulk_operation_progress",
  DASHBOARD_UPDATE: "dashboard_update",
  DASHBOARD_INITIAL_DATA: "dashboard_initial_data",
} as const;

/**
 * WebSocket error codes
 * Mã lỗi WebSocket
 */
export const WEBSOCKET_ERROR_CODES = {
  CONNECTION_FAILED: "CONNECTION_FAILED",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  SUBSCRIPTION_FAILED: "SUBSCRIPTION_FAILED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
} as const;

/**
 * WebSocket connection states
 * Trạng thái kết nối WebSocket
 */
export const CONNECTION_STATES = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
} as const;

/**
 * Event subscription types
 * Loại subscription events
 */
export const SUBSCRIPTION_TYPES = {
  SECURITY_EVENTS: "security_events",
  USER_ACTIVITY: "user_activity",
  SYSTEM_METRICS: "system_metrics",
  ADMIN_NOTIFICATIONS: "admin_notifications",
  BULK_OPERATIONS: "bulk_operations",
  DASHBOARD_UPDATES: "dashboard_updates",
  ALL: "all",
} as const;

/**
 * Event severity levels
 * Mức độ nghiêm trọng của events
 */
export const EVENT_SEVERITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

/**
 * Security event types
 * Loại security events
 */
export const SECURITY_EVENT_TYPES = {
  LOGIN_ATTEMPT: "LOGIN_ATTEMPT",
  FAILED_LOGIN: "FAILED_LOGIN",
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  ROLE_CHANGED: "ROLE_CHANGED",
} as const;

/**
 * User activity types
 * Loại user activities
 */
export const USER_ACTIVITY_TYPES = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  COURSE_ACCESS: "COURSE_ACCESS",
  EXAM_START: "EXAM_START",
  EXAM_SUBMIT: "EXAM_SUBMIT",
} as const;

/**
 * System metrics types
 * Loại system metrics
 */
export const SYSTEM_METRICS_TYPES = {
  CPU_USAGE: "CPU_USAGE",
  MEMORY_USAGE: "MEMORY_USAGE",
  DISK_USAGE: "DISK_USAGE",
  NETWORK_TRAFFIC: "NETWORK_TRAFFIC",
  DATABASE_PERFORMANCE: "DATABASE_PERFORMANCE",
  API_RESPONSE_TIME: "API_RESPONSE_TIME",
} as const;

/**
 * Admin notification types
 * Loại admin notifications
 */
export const ADMIN_NOTIFICATION_TYPES = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;

/**
 * Bulk operation types
 * Loại bulk operations
 */
export const BULK_OPERATION_TYPES = {
  USER_BULK_UPDATE: "USER_BULK_UPDATE",
  USER_BULK_DELETE: "USER_BULK_DELETE",
  ROLE_BULK_ASSIGN: "ROLE_BULK_ASSIGN",
  EMAIL_BULK_SEND: "EMAIL_BULK_SEND",
} as const;

/**
 * Bulk operation statuses
 * Trạng thái bulk operations
 */
export const BULK_OPERATION_STATUSES = {
  STARTED: "STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

/**
 * Dashboard update types
 * Loại dashboard updates
 */
export const DASHBOARD_UPDATE_TYPES = {
  METRICS_UPDATE: "METRICS_UPDATE",
  CHART_DATA_UPDATE: "CHART_DATA_UPDATE",
  WIDGET_UPDATE: "WIDGET_UPDATE",
} as const;

/**
 * Reconnection configuration
 * Cấu hình reconnection
 */
export const RECONNECTION_CONFIG = {
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  MULTIPLIER: 1.5,
  MAX_ATTEMPTS: 10,
  JITTER: 0.1, // 10% jitter
} as const;

/**
 * Heartbeat configuration
 * Cấu hình heartbeat
 */
export const HEARTBEAT_CONFIG = {
  INTERVAL: 30000, // 30 seconds
  TIMEOUT: 5000, // 5 seconds
  MAX_MISSED: 3, // Max missed heartbeats before disconnect
} as const;

/**
 * Event queue configuration
 * Cấu hình event queue
 */
export const EVENT_QUEUE_CONFIG = {
  MAX_SIZE: 1000, // Maximum events in queue
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
  CLEANUP_INTERVAL: 60000, // 1 minute
  MAX_AGE: 300000, // 5 minutes
} as const;

/**
 * Performance thresholds
 * Ngưỡng hiệu suất
 */
export const PERFORMANCE_THRESHOLDS = {
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  RESPONSE_TIMEOUT: 5000, // 5 seconds
  MAX_LATENCY: 1000, // 1 second
  MAX_RECONNECT_TIME: 60000, // 1 minute
} as const;

/**
 * Local storage keys
 * Keys cho local storage
 */
export const STORAGE_KEYS = {
  WEBSOCKET_CONFIG: "nynus_admin_websocket_config",
  CONNECTION_STATS: "nynus_admin_connection_stats",
  EVENT_PREFERENCES: "nynus_admin_event_preferences",
  SUBSCRIPTION_STATE: "nynus_admin_subscription_state",
} as const;

/**
 * Default event subscriptions for admin
 * Subscriptions mặc định cho admin
 */
export const DEFAULT_ADMIN_SUBSCRIPTIONS = [
  {
    eventType: SUBSCRIPTION_TYPES.SECURITY_EVENTS,
    severityLevels: [EVENT_SEVERITY_LEVELS.HIGH, EVENT_SEVERITY_LEVELS.CRITICAL],
  },
  {
    eventType: SUBSCRIPTION_TYPES.ADMIN_NOTIFICATIONS,
  },
  {
    eventType: SUBSCRIPTION_TYPES.BULK_OPERATIONS,
  },
  {
    eventType: SUBSCRIPTION_TYPES.DASHBOARD_UPDATES,
  },
] as const;

/**
 * Toast notification configuration
 * Cấu hình toast notifications
 */
export const TOAST_CONFIG = {
  DURATION: {
    INFO: 4000, // 4 seconds
    SUCCESS: 3000, // 3 seconds
    WARNING: 6000, // 6 seconds
    ERROR: 8000, // 8 seconds
    CRITICAL: 0, // No auto-hide
  },
  POSITION: "top-right",
  MAX_TOASTS: 5,
} as const;

/**
 * Sound notification configuration
 * Cấu hình sound notifications
 */
export const SOUND_CONFIG = {
  ENABLED: true,
  VOLUME: 0.5,
  SOUNDS: {
    SECURITY_ALERT: "/sounds/security-alert.mp3",
    NOTIFICATION: "/sounds/notification.mp3",
    ERROR: "/sounds/error.mp3",
    SUCCESS: "/sounds/success.mp3",
  },
} as const;

/**
 * WebSocket client options
 * Tùy chọn WebSocket client
 */
export const SOCKET_IO_OPTIONS = {
  transports: ["websocket", "polling"],
  upgrade: true,
  rememberUpgrade: true,
  timeout: PERFORMANCE_THRESHOLDS.CONNECTION_TIMEOUT,
  forceNew: false,
  multiplex: true,
  autoConnect: false, // We'll handle connection manually
} as const;
