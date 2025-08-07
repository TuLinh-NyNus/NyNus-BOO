/**
 * WebSocket Client Wrapper for NyNus Admin
 * Wrapper cho Socket.IO client với authentication và reconnection logic
 */

import { io, Socket } from "socket.io-client";
import {
  WebSocketConfig,
  WebSocketConnectionState,
  WebSocketConnectionStatus,
  WebSocketAuthPayload,
  WebSocketEventHandlers,
  WebSocketEventSubscription,
  QueuedEvent,
  WebSocketMetrics,
} from "./websocket-types";
import {
  DEFAULT_WEBSOCKET_CONFIG,
  WEBSOCKET_EVENTS,
  CONNECTION_STATES,
  SOCKET_IO_OPTIONS,
  EVENT_QUEUE_CONFIG,
  HEARTBEAT_CONFIG,
} from "./websocket-constants";
import {
  calculateBackoffDelay,
  createInitialConnectionStatus,
  updateConnectionStatus,
  formatWebSocketError,
  createQueuedEvent,
  filterExpiredEvents,
  saveConnectionStats,
  getConnectionStats,
  getOptimalTransport,
} from "./websocket-utils";

/**
 * WebSocket Client Class
 * Class quản lý WebSocket connection với advanced features
 */
export class WebSocketClient {
  public socket: Socket | null = null;
  private config: WebSocketConfig;
  private connectionStatus: WebSocketConnectionStatus;
  private eventHandlers: WebSocketEventHandlers;
  private eventQueue: QueuedEvent[] = [];
  private metrics: WebSocketMetrics;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private queueCleanupTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(config: Partial<WebSocketConfig> = {}, eventHandlers: WebSocketEventHandlers = {}) {
    this.config = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
    this.eventHandlers = eventHandlers;
    this.connectionStatus = createInitialConnectionStatus();
    this.metrics = {
      totalConnections: 0,
      totalReconnections: 0,
      totalErrors: 0,
      averageLatency: 0,
      uptime: 0,
      eventsReceived: 0,
      eventsSent: 0,
      ...getConnectionStats(),
    };

    // Start queue cleanup timer
    this.startQueueCleanup();
  }

  /**
   * Connect to WebSocket server
   * Kết nối tới WebSocket server
   */
  async connect(authPayload: WebSocketAuthPayload): Promise<void> {
    if (this.isDestroyed) {
      throw new Error("WebSocket client has been destroyed");
    }

    if (this.socket?.connected) {
      console.warn("WebSocket already connected");
      return;
    }

    try {
      this.updateConnectionStatus(CONNECTION_STATES.CONNECTING);

      // Create socket connection
      this.socket = io(`${this.config.url}${this.config.namespace}`, {
        ...SOCKET_IO_OPTIONS,
        transports: getOptimalTransport(),
        auth: authPayload,
        timeout: this.config.timeout,
        forceNew: this.config.forceNew,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Wait for connection
      await this.waitForConnection();

      // Start heartbeat
      this.startHeartbeat();

      // Process queued events
      await this.processEventQueue();

      this.metrics.totalConnections++;
      this.saveMetrics();
    } catch (error) {
      const formattedError = formatWebSocketError(error);
      this.updateConnectionStatus(CONNECTION_STATES.ERROR, formattedError.message);
      this.metrics.totalErrors++;
      this.saveMetrics();

      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(formattedError);
      }

      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   * Ngắt kết nối từ WebSocket server
   */
  disconnect(): void {
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
  }

  /**
   * Reconnect to WebSocket server
   * Kết nối lại tới WebSocket server
   */
  async reconnect(authPayload: WebSocketAuthPayload): Promise<void> {
    if (this.isDestroyed) return;

    this.disconnect();

    // Wait for reconnect delay
    const delay = calculateBackoffDelay(this.connectionStatus.reconnectAttempts);
    await new Promise((resolve) => setTimeout(resolve, delay));

    this.updateConnectionStatus(CONNECTION_STATES.RECONNECTING);

    try {
      await this.connect(authPayload);
      this.metrics.totalReconnections++;
      this.saveMetrics();

      if (this.eventHandlers.onReconnect) {
        this.eventHandlers.onReconnect(this.connectionStatus.reconnectAttempts);
      }
    } catch (error) {
      if (this.eventHandlers.onReconnectError) {
        this.eventHandlers.onReconnectError(error);
      }

      // Schedule next reconnect attempt
      if (this.connectionStatus.reconnectAttempts < this.connectionStatus.maxReconnectAttempts) {
        this.scheduleReconnect(authPayload);
      } else {
        if (this.eventHandlers.onReconnectFailed) {
          this.eventHandlers.onReconnectFailed();
        }
      }
    }
  }

  /**
   * Subscribe to event type
   * Subscribe vào loại event
   */
  async subscribe(subscription: WebSocketEventSubscription): Promise<boolean> {
    if (!this.socket?.connected) {
      // Queue subscription for later
      this.eventQueue.push(createQueuedEvent("subscribe", subscription));
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.socket!.once(WEBSOCKET_EVENTS.SUBSCRIPTION_SUCCESS, () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket!.once(WEBSOCKET_EVENTS.SUBSCRIPTION_ERROR, () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket!.emit(WEBSOCKET_EVENTS.SUBSCRIBE, subscription);
    });
  }

  /**
   * Unsubscribe from event type
   * Unsubscribe từ loại event
   */
  async unsubscribe(eventType: string): Promise<boolean> {
    if (!this.socket?.connected) {
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.socket!.once(WEBSOCKET_EVENTS.SUBSCRIPTION_SUCCESS, () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.socket!.once(WEBSOCKET_EVENTS.SUBSCRIPTION_ERROR, () => {
        clearTimeout(timeout);
        resolve(false);
      });

      this.socket!.emit(WEBSOCKET_EVENTS.UNSUBSCRIBE, { eventType });
    });
  }

  /**
   * Emit event to server
   * Gửi event tới server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      // Queue event for later
      this.eventQueue.push(createQueuedEvent(event, data));
      return;
    }

    this.socket.emit(event, data);
    this.metrics.eventsSent++;
  }

  /**
   * Get connection status
   * Lấy trạng thái kết nối
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get connection metrics
   * Lấy metrics kết nối
   */
  getMetrics(): WebSocketMetrics {
    return { ...this.metrics };
  }

  /**
   * Destroy client
   * Hủy client
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.clearReconnectTimer();
    this.stopQueueCleanup();
    this.eventQueue = [];
  }

  /**
   * Setup event listeners
   * Thiết lập event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(WEBSOCKET_EVENTS.CONNECT, () => {
      this.updateConnectionStatus(CONNECTION_STATES.CONNECTED);
      if (this.eventHandlers.onConnect) {
        this.eventHandlers.onConnect({
          status: "connected",
          message: "Connected to admin WebSocket",
          connectionId: this.socket!.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.DISCONNECT, (reason: string) => {
      this.updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
      this.stopHeartbeat();
      if (this.eventHandlers.onDisconnect) {
        this.eventHandlers.onDisconnect(reason);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.CONNECT_ERROR, (error: any) => {
      const formattedError = formatWebSocketError(error);
      this.updateConnectionStatus(CONNECTION_STATES.ERROR, formattedError.message);
      this.metrics.totalErrors++;
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(formattedError);
      }
    });

    // Admin-specific events
    this.socket.on(WEBSOCKET_EVENTS.SECURITY_EVENT, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onSecurityEvent) {
        this.eventHandlers.onSecurityEvent(event);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.SECURITY_EVENT_BATCH, (events) => {
      this.metrics.eventsReceived += events.length;
      if (this.eventHandlers.onSecurityEventBatch) {
        this.eventHandlers.onSecurityEventBatch(events);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.USER_ACTIVITY, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onUserActivity) {
        this.eventHandlers.onUserActivity(event);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.USER_ACTIVITY_AGGREGATED, (data) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onUserActivityAggregated) {
        this.eventHandlers.onUserActivityAggregated(data);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.USER_METRICS_UPDATE, (metrics) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onUserMetricsUpdate) {
        this.eventHandlers.onUserMetricsUpdate(metrics);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.SYSTEM_METRICS, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onSystemMetrics) {
        this.eventHandlers.onSystemMetrics(event);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.ADMIN_NOTIFICATION, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onAdminNotification) {
        this.eventHandlers.onAdminNotification(event);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.BULK_OPERATION_PROGRESS, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onBulkOperationProgress) {
        this.eventHandlers.onBulkOperationProgress(event);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.DASHBOARD_UPDATE, (event) => {
      this.metrics.eventsReceived++;
      if (this.eventHandlers.onDashboardUpdate) {
        this.eventHandlers.onDashboardUpdate(event);
      }
    });

    // Heartbeat response
    this.socket.on(WEBSOCKET_EVENTS.HEARTBEAT_RESPONSE, () => {
      // Heartbeat acknowledged
    });
  }

  /**
   * Wait for connection to be established
   * Chờ kết nối được thiết lập
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, this.config.timeout);

      this.socket.once(WEBSOCKET_EVENTS.CONNECT, () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once(WEBSOCKET_EVENTS.CONNECT_ERROR, (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Update connection status
   * Cập nhật trạng thái kết nối
   */
  private updateConnectionStatus(state: WebSocketConnectionState, error?: string): void {
    this.connectionStatus = updateConnectionStatus(this.connectionStatus, state, error);
  }

  /**
   * Schedule reconnect attempt
   * Lên lịch thử kết nối lại
   */
  private scheduleReconnect(authPayload: WebSocketAuthPayload): void {
    if (this.reconnectTimer) return;

    const delay = this.connectionStatus.nextReconnectDelay;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.eventHandlers.onReconnectAttempt) {
        this.eventHandlers.onReconnectAttempt(this.connectionStatus.reconnectAttempts + 1);
      }
      this.reconnect(authPayload);
    }, delay);
  }

  /**
   * Clear reconnect timer
   * Xóa timer reconnect
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat
   * Bắt đầu heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit(WEBSOCKET_EVENTS.HEARTBEAT, {
          timestamp: new Date().toISOString(),
        });
      }
    }, HEARTBEAT_CONFIG.INTERVAL);
  }

  /**
   * Stop heartbeat
   * Dừng heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Process queued events
   * Xử lý events trong queue
   */
  private async processEventQueue(): Promise<void> {
    if (!this.socket?.connected || this.eventQueue.length === 0) return;

    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of eventsToProcess) {
      try {
        if (event.type === "subscribe") {
          await this.subscribe(event.data);
        } else {
          this.socket.emit(event.type, event.data);
        }
      } catch (error) {
        // Re-queue failed events if they haven't exceeded retry limit
        if (event.retryCount < event.maxRetries) {
          event.retryCount++;
          this.eventQueue.push(event);
        }
      }
    }
  }

  /**
   * Start queue cleanup
   * Bắt đầu cleanup queue
   */
  private startQueueCleanup(): void {
    this.queueCleanupTimer = setInterval(() => {
      this.eventQueue = filterExpiredEvents(this.eventQueue);

      // Limit queue size
      if (this.eventQueue.length > EVENT_QUEUE_CONFIG.MAX_SIZE) {
        this.eventQueue = this.eventQueue.slice(-EVENT_QUEUE_CONFIG.MAX_SIZE);
      }
    }, EVENT_QUEUE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Stop queue cleanup
   * Dừng cleanup queue
   */
  private stopQueueCleanup(): void {
    if (this.queueCleanupTimer) {
      clearInterval(this.queueCleanupTimer);
      this.queueCleanupTimer = null;
    }
  }

  /**
   * Save metrics to localStorage
   * Lưu metrics vào localStorage
   */
  private saveMetrics(): void {
    saveConnectionStats(this.metrics);
  }
}
