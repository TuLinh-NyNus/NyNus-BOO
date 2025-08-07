/**
 * WebSocket Types for NyNus Admin
 * Type definitions cho WebSocket client implementation
 */

import { Socket } from "socket.io-client";

/**
 * WebSocket connection states
 * Các trạng thái kết nối WebSocket
 */
export type WebSocketConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/**
 * WebSocket connection status
 * Trạng thái chi tiết của kết nối WebSocket
 */
export interface WebSocketConnectionStatus {
  state: WebSocketConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  error?: string;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  nextReconnectDelay: number;
}

/**
 * WebSocket configuration options
 * Tùy chọn cấu hình WebSocket
 */
export interface WebSocketConfig {
  url: string;
  namespace: string;
  autoConnect: boolean;
  enableReconnection: boolean;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  reconnectDelayMultiplier: number;
  timeout: number;
  forceNew: boolean;
}

/**
 * Admin user information for WebSocket
 * Thông tin admin user cho WebSocket
 */
export interface AdminWebSocketUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

/**
 * WebSocket authentication payload
 * Payload xác thực WebSocket
 */
export interface WebSocketAuthPayload {
  token: string;
  refreshToken?: string;
  metadata?: Record<string, any>;
}

/**
 * WebSocket connection response
 * Response khi kết nối WebSocket
 */
export interface WebSocketConnectionResponse {
  status: "connected" | "disconnected" | "error";
  message: string;
  connectionId?: string;
  user?: AdminWebSocketUser;
  timestamp: string;
}

/**
 * WebSocket error response
 * Response lỗi WebSocket
 */
export interface WebSocketError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Security event from WebSocket
 * Security event từ WebSocket
 */
export interface SecurityEvent {
  id: string;
  eventType:
    | "LOGIN_ATTEMPT"
    | "FAILED_LOGIN"
    | "SUSPICIOUS_ACTIVITY"
    | "ACCOUNT_LOCKED"
    | "PASSWORD_CHANGED"
    | "ROLE_CHANGED";
  userId: string;
  userEmail?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  metadata?: Record<string, any>;
}

/**
 * User activity event from WebSocket
 * User activity event từ WebSocket
 */
export interface UserActivityEvent {
  id: string;
  userId: string;
  userEmail?: string;
  activityType:
    | "LOGIN"
    | "LOGOUT"
    | "PROFILE_UPDATE"
    | "COURSE_ACCESS"
    | "EXAM_START"
    | "EXAM_SUBMIT";
  timestamp: string;
  resourceId?: string;
  resourceType?: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * System metrics event from WebSocket
 * System metrics event từ WebSocket
 */
export interface SystemMetricsEvent {
  id: string;
  metricType:
    | "CPU_USAGE"
    | "MEMORY_USAGE"
    | "DISK_USAGE"
    | "NETWORK_TRAFFIC"
    | "DATABASE_PERFORMANCE"
    | "API_RESPONSE_TIME";
  value: number;
  unit: string;
  threshold?: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Admin notification event from WebSocket
 * Admin notification event từ WebSocket
 */
export interface AdminNotificationEvent {
  id: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  autoHideAfter?: number;
  metadata?: Record<string, any>;
}

/**
 * Bulk operation progress event from WebSocket
 * Bulk operation progress event từ WebSocket
 */
export interface BulkOperationProgressEvent {
  id: string;
  operationType: "USER_BULK_UPDATE" | "USER_BULK_DELETE" | "ROLE_BULK_ASSIGN" | "EMAIL_BULK_SEND";
  status: "STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  failedItems: number;
  estimatedTimeRemaining?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Dashboard update event from WebSocket
 * Dashboard update event từ WebSocket
 */
export interface DashboardUpdateEvent {
  id: string;
  updateType: "METRICS_UPDATE" | "CHART_DATA_UPDATE" | "WIDGET_UPDATE";
  data: Record<string, any>;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration change event from WebSocket
 * Configuration change event từ WebSocket
 */
export interface ConfigurationChangeEvent {
  id: string;
  eventType:
    | "CONFIGURATION_UPDATED"
    | "CONFIGURATION_CREATED"
    | "CONFIGURATION_DELETED"
    | "CONFIGURATION_ROLLBACK";
  category: string;
  configKey: string;
  oldValue?: any;
  newValue?: any;
  changedBy: string;
  changedByEmail?: string;
  timestamp: string;
  changeReason?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration rollback event from WebSocket
 * Configuration rollback event từ WebSocket
 */
export interface ConfigurationRollbackEvent {
  id: string;
  configurationId: string;
  category: string;
  configKey: string;
  fromValue?: any;
  toValue?: any;
  rolledBackBy: string;
  rolledBackByEmail?: string;
  timestamp: string;
  rollbackReason?: string;
  targetHistoryId?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  metadata?: Record<string, any>;
}

/**
 * WebSocket event subscription
 * Subscription cho WebSocket events
 */
export interface WebSocketEventSubscription {
  eventType:
    | "security_events"
    | "user_activity"
    | "system_metrics"
    | "admin_notifications"
    | "bulk_operations"
    | "dashboard_updates"
    | "configuration_changes"
    | "all";
  severityLevels?: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
  userIds?: string[];
  eventSubTypes?: string[];
  metadata?: Record<string, any>;
  filters?: Record<string, any>;
}

/**
 * WebSocket event handlers
 * Event handlers cho WebSocket
 */
export interface WebSocketEventHandlers {
  onConnect?: (response: WebSocketConnectionResponse) => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: WebSocketError) => void;
  onReconnect?: (attemptNumber: number) => void;
  onReconnectAttempt?: (attemptNumber: number) => void;
  onReconnectError?: (error: any) => void;
  onReconnectFailed?: () => void;

  // Event-specific handlers
  onSecurityEvent?: (event: SecurityEvent) => void;
  onUserActivity?: (event: UserActivityEvent) => void;
  onSystemMetrics?: (event: SystemMetricsEvent) => void;
  onAdminNotification?: (event: AdminNotificationEvent) => void;
  onBulkOperationProgress?: (event: BulkOperationProgressEvent) => void;
  onDashboardUpdate?: (event: DashboardUpdateEvent) => void;
  onConfigurationChange?: (event: ConfigurationChangeEvent) => void;
  onConfigurationRollback?: (event: ConfigurationRollbackEvent) => void;

  // Aggregated events
  onSecurityEventBatch?: (events: SecurityEvent[]) => void;
  onUserActivityAggregated?: (data: any) => void;
  onUserMetricsUpdate?: (metrics: any) => void;
}

/**
 * WebSocket hook options
 * Tùy chọn cho WebSocket hook
 */
export interface UseAdminWebSocketOptions {
  autoConnect?: boolean;
  enableReconnection?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  subscriptions?: WebSocketEventSubscription[];
  eventHandlers?: WebSocketEventHandlers;
  onConnectionChange?: (status: WebSocketConnectionStatus) => void;
  onError?: (error: WebSocketError) => void;
}

/**
 * WebSocket hook return type
 * Return type cho WebSocket hook
 */
export interface UseAdminWebSocketReturn {
  // Connection state
  socket: Socket | null;
  connectionStatus: WebSocketConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  error: string | null;

  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Subscription management
  subscribe: (subscription: WebSocketEventSubscription) => Promise<boolean>;
  unsubscribe: (eventType: string) => Promise<boolean>;
  getActiveSubscriptions: () => string[];

  // Event emission
  emit: (event: string, data?: any) => void;

  // Utility methods
  clearError: () => void;
  getConnectionStats: () => {
    connectedAt?: Date;
    disconnectedAt?: Date;
    reconnectAttempts: number;
    totalReconnects: number;
    uptime: number;
  };
}

/**
 * WebSocket context type
 * Type cho WebSocket context
 */
export interface WebSocketContextType {
  webSocket: UseAdminWebSocketReturn;
  isProviderReady: boolean;
}

/**
 * Event queue item
 * Item trong event queue
 */
export interface QueuedEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

/**
 * WebSocket metrics
 * Metrics cho WebSocket connection
 */
export interface WebSocketMetrics {
  totalConnections: number;
  totalReconnections: number;
  totalErrors: number;
  averageLatency: number;
  uptime: number;
  lastEventReceived?: Date;
  eventsReceived: number;
  eventsSent: number;
}
