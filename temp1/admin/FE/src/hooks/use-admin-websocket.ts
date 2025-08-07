/**
 * useAdminWebSocket Hook
 * Hook cho admin WebSocket connection management với authentication và reconnection
 */

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "./use-admin-auth";
import { useAdminAuth as useAdminAuthStore } from "../stores/auth.store";
import { WebSocketClient } from "../lib/websocket/websocket-client";
import {
  UseAdminWebSocketOptions,
  UseAdminWebSocketReturn,
  WebSocketConnectionStatus,
  WebSocketEventSubscription,
  WebSocketEventHandlers,
  WebSocketError,
} from "../lib/websocket/websocket-types";
import {
  DEFAULT_WEBSOCKET_CONFIG,
  DEFAULT_ADMIN_SUBSCRIPTIONS,
  TOAST_CONFIG,
} from "../lib/websocket/websocket-constants";
import {
  createInitialConnectionStatus,
  calculateUptime,
  formatUptime,
} from "../lib/websocket/websocket-utils";

/**
 * Main useAdminWebSocket hook
 * Hook useAdminWebSocket chính cho admin connections
 */
export function useAdminWebSocket(options: UseAdminWebSocketOptions = {}): UseAdminWebSocketReturn {
  const {
    autoConnect = true,
    enableReconnection = true,
    maxReconnectAttempts = 10,
    reconnectDelay = 1000,
    subscriptions = DEFAULT_ADMIN_SUBSCRIPTIONS,
    eventHandlers = {},
    onConnectionChange,
    onError,
  } = options;

  // Get admin authentication
  const { isAuthenticated, user, logout } = useAdminAuth();
  const { accessToken } = useAdminAuthStore();

  // WebSocket client reference
  const clientRef = useRef<WebSocketClient | null>(null);

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>(
    createInitialConnectionStatus()
  );

  // Active subscriptions state
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   * Xóa trạng thái lỗi
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle WebSocket errors
   * Xử lý lỗi WebSocket
   */
  const handleWebSocketError = useCallback(
    (wsError: WebSocketError) => {
      console.error("WebSocket error:", wsError);
      setError(wsError.message);

      // Show toast notification for critical errors
      if (wsError.error === "AUTHENTICATION_FAILED" || wsError.error === "TOKEN_EXPIRED") {
        toast.error("Phiên đăng nhập đã hết hạn", {
          description: "Vui lòng đăng nhập lại để tiếp tục",
          duration: TOAST_CONFIG.DURATION.ERROR,
        });

        // Auto logout on authentication errors
        logout();
      } else if (wsError.error === "CONNECTION_FAILED") {
        toast.error("Không thể kết nối WebSocket", {
          description: "Hệ thống sẽ tự động thử kết nối lại",
          duration: TOAST_CONFIG.DURATION.WARNING,
        });
      }

      if (onError) {
        onError(wsError);
      }
    },
    [onError, logout]
  );

  /**
   * Handle connection status changes
   * Xử lý thay đổi trạng thái kết nối
   */
  const handleConnectionStatusChange = useCallback(
    (status: WebSocketConnectionStatus) => {
      setConnectionStatus(status);

      if (onConnectionChange) {
        onConnectionChange(status);
      }

      // Show connection status notifications
      if (status.state === "connected") {
        toast.success("Kết nối WebSocket thành công", {
          description: "Bạn sẽ nhận được cập nhật real-time",
          duration: TOAST_CONFIG.DURATION.SUCCESS,
        });
        clearError();
      } else if (status.state === "error" && status.error) {
        setError(status.error);
      }
    },
    [onConnectionChange, clearError]
  );

  /**
   * Create WebSocket event handlers
   * Tạo event handlers cho WebSocket
   */
  const createEventHandlers = useCallback((): WebSocketEventHandlers => {
    return {
      ...eventHandlers,
      onError: handleWebSocketError,
      onConnect: (response) => {
        console.log("WebSocket connected:", response);
        if (eventHandlers.onConnect) {
          eventHandlers.onConnect(response);
        }
      },
      onDisconnect: (reason) => {
        console.log("WebSocket disconnected:", reason);
        if (eventHandlers.onDisconnect) {
          eventHandlers.onDisconnect(reason);
        }
      },
      onReconnect: (attemptNumber) => {
        console.log("WebSocket reconnected after", attemptNumber, "attempts");
        toast.success("Đã kết nối lại WebSocket", {
          description: `Kết nối lại thành công sau ${attemptNumber} lần thử`,
          duration: TOAST_CONFIG.DURATION.SUCCESS,
        });
        if (eventHandlers.onReconnect) {
          eventHandlers.onReconnect(attemptNumber);
        }
      },
      onReconnectAttempt: (attemptNumber) => {
        console.log("WebSocket reconnect attempt:", attemptNumber);
        if (eventHandlers.onReconnectAttempt) {
          eventHandlers.onReconnectAttempt(attemptNumber);
        }
      },
      onReconnectFailed: () => {
        toast.error("Không thể kết nối lại WebSocket", {
          description: "Vui lòng tải lại trang để thử lại",
          duration: TOAST_CONFIG.DURATION.ERROR,
        });
        if (eventHandlers.onReconnectFailed) {
          eventHandlers.onReconnectFailed();
        }
      },
    };
  }, [eventHandlers, handleWebSocketError]);

  /**
   * Connect to WebSocket
   * Kết nối tới WebSocket
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated || !accessToken || !user) {
      console.warn("Cannot connect WebSocket: not authenticated");
      return;
    }

    if (clientRef.current) {
      console.warn("WebSocket client already exists");
      return;
    }

    try {
      // Create WebSocket client
      const client = new WebSocketClient(
        {
          ...DEFAULT_WEBSOCKET_CONFIG,
          enableReconnection,
          maxReconnectAttempts,
          reconnectDelay,
        },
        createEventHandlers()
      );

      clientRef.current = client;

      // Monitor connection status
      const statusInterval = setInterval(() => {
        if (clientRef.current) {
          const status = clientRef.current.getConnectionStatus();
          handleConnectionStatusChange(status);
        }
      }, 1000);

      // Cleanup interval when client is destroyed
      const originalDestroy = client.destroy.bind(client);
      client.destroy = () => {
        clearInterval(statusInterval);
        originalDestroy();
      };

      // Connect with authentication
      await client.connect({
        token: accessToken,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
        },
      });

      // Subscribe to default events
      for (const subscription of subscriptions) {
        await client.subscribe(subscription as any);
        setActiveSubscriptions((prev) => [...prev, subscription.eventType]);
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      handleWebSocketError({
        error: "CONNECTION_FAILED",
        message: error instanceof Error ? error.message : "Failed to connect",
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    isAuthenticated,
    accessToken,
    user,
    enableReconnection,
    maxReconnectAttempts,
    reconnectDelay,
    subscriptions,
    createEventHandlers,
    handleConnectionStatusChange,
    handleWebSocketError,
  ]);

  /**
   * Disconnect from WebSocket
   * Ngắt kết nối từ WebSocket
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.destroy();
      clientRef.current = null;
      setActiveSubscriptions([]);
      setConnectionStatus(createInitialConnectionStatus());
      clearError();
    }
  }, [clearError]);

  /**
   * Reconnect WebSocket
   * Kết nối lại WebSocket
   */
  const reconnect = useCallback(async () => {
    disconnect();
    await connect();
  }, [disconnect, connect]);

  /**
   * Subscribe to event type
   * Subscribe vào loại event
   */
  const subscribe = useCallback(
    async (subscription: WebSocketEventSubscription): Promise<boolean> => {
      if (!clientRef.current) {
        console.warn("Cannot subscribe: WebSocket not connected");
        return false;
      }

      try {
        const success = await clientRef.current.subscribe(subscription);
        if (success) {
          setActiveSubscriptions((prev) =>
            prev.includes(subscription.eventType) ? prev : [...prev, subscription.eventType]
          );
        }
        return success;
      } catch (error) {
        console.error("Failed to subscribe:", error);
        return false;
      }
    },
    []
  );

  /**
   * Unsubscribe from event type
   * Unsubscribe từ loại event
   */
  const unsubscribe = useCallback(async (eventType: string): Promise<boolean> => {
    if (!clientRef.current) {
      console.warn("Cannot unsubscribe: WebSocket not connected");
      return false;
    }

    try {
      const success = await clientRef.current.unsubscribe(eventType);
      if (success) {
        setActiveSubscriptions((prev) => prev.filter((type) => type !== eventType));
      }
      return success;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  }, []);

  /**
   * Get active subscriptions
   * Lấy danh sách subscriptions đang hoạt động
   */
  const getActiveSubscriptions = useCallback((): string[] => {
    return [...activeSubscriptions];
  }, [activeSubscriptions]);

  /**
   * Emit event to server
   * Gửi event tới server
   */
  const emit = useCallback((event: string, data?: any) => {
    if (!clientRef.current) {
      console.warn("Cannot emit: WebSocket not connected");
      return;
    }

    clientRef.current.emit(event, data);
  }, []);

  /**
   * Get connection statistics
   * Lấy thống kê kết nối
   */
  const getConnectionStats = useCallback(() => {
    const connectedAt = connectionStatus.lastConnectedAt;
    const disconnectedAt = connectionStatus.lastDisconnectedAt;
    const uptime = connectedAt ? calculateUptime(connectedAt) : 0;

    return {
      connectedAt,
      disconnectedAt,
      reconnectAttempts: connectionStatus.reconnectAttempts,
      totalReconnects: clientRef.current?.getMetrics().totalReconnections || 0,
      uptime,
    };
  }, [connectionStatus]);

  /**
   * Auto-connect when authenticated
   * Tự động kết nối khi đã xác thực
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && accessToken && !clientRef.current) {
      connect();
    }
  }, [autoConnect, isAuthenticated, accessToken, connect]);

  /**
   * Disconnect when authentication lost
   * Ngắt kết nối khi mất xác thực
   */
  useEffect(() => {
    if (!isAuthenticated && clientRef.current) {
      disconnect();
    }
  }, [isAuthenticated, disconnect]);

  /**
   * Cleanup on unmount
   * Cleanup khi unmount
   */
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, []);

  // Computed values
  const isConnected = connectionStatus.state === "connected";
  const isConnecting = connectionStatus.state === "connecting";
  const isReconnecting = connectionStatus.state === "reconnecting";
  const hasError = connectionStatus.state === "error";

  return {
    // Connection state
    socket: clientRef.current?.socket || null,
    connectionStatus,
    isConnected,
    isConnecting,
    isReconnecting,
    hasError,
    error,

    // Connection actions
    connect,
    disconnect,
    reconnect,

    // Subscription management
    subscribe,
    unsubscribe,
    getActiveSubscriptions,

    // Event emission
    emit,

    // Utility methods
    clearError,
    getConnectionStats,
  };
}
