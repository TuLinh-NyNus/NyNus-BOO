/**
 * Mock WebSocket Provider
 * Provider để mock WebSocket functionality cho admin interface
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { MockWebSocketContextValue, WebSocketNotification, WebSocketMessage } from '@/types/admin/layout';

/**
 * Mock WebSocket Context
 * Context cho MockWebSocketProvider
 */
const MockWebSocketContext = createContext<MockWebSocketContextValue | undefined>(undefined);

/**
 * Mock WebSocket Provider Props
 * Props cho MockWebSocketProvider
 */
interface MockWebSocketProviderProps {
  children: ReactNode;
  enableNotifications?: boolean;
  enableSounds?: boolean;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Mock WebSocket Provider Component
 * Provider component để simulate WebSocket functionality
 */
export function MockWebSocketProvider({
  children,
  enableNotifications = true,
  enableSounds = false,
  autoConnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 3
}: MockWebSocketProviderProps) {
  // State management
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  /**
   * Simulate connection
   * Mô phỏng kết nối WebSocket
   */
  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    setIsConnected(false);

    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
      setReconnectAttempts(0);
      
      console.log('[MockWebSocket] Connected successfully');
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  }, []);

  /**
   * Simulate disconnection
   * Mô phỏng ngắt kết nối WebSocket
   */
  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    setIsConnected(false);
    
    console.log('[MockWebSocket] Disconnected');
  }, []);

  /**
   * Simulate reconnection
   * Mô phỏng kết nối lại WebSocket
   */
  const reconnect = useCallback(() => {
    if (reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1);
      console.log(`[MockWebSocket] Reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
      
      setTimeout(() => {
        connect();
      }, reconnectInterval);
    } else {
      setConnectionStatus('error');
      console.error('[MockWebSocket] Max reconnection attempts reached');
    }
  }, [reconnectAttempts, maxReconnectAttempts, reconnectInterval, connect]);

  /**
   * Send message
   * Mô phỏng gửi message qua WebSocket
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!isConnected) {
      console.warn('[MockWebSocket] Cannot send message: not connected');
      return;
    }

    console.log('[MockWebSocket] Sending message:', message);
    
    // Simulate message echo
    setTimeout(() => {
      const echoMessage: WebSocketMessage = {
        id: `echo-${Date.now()}`,
        type: 'response',
        data: { echo: message, status: 'received' },
        timestamp: new Date()
      };
      setLastMessage(echoMessage);
    }, 100 + Math.random() * 500); // 100-600ms delay
  }, [isConnected]);

  /**
   * Add notification
   * Thêm notification mới
   */
  const addNotification = useCallback((notification: Omit<WebSocketNotification, 'id' | 'timestamp'>) => {
    const newNotification: WebSocketNotification = {
      ...notification,
      id: `ws-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
    
    // Play sound if enabled
    if (enableSounds && typeof window !== 'undefined') {
      // Simulate notification sound
      console.log('[MockWebSocket] 🔔 Notification sound played');
    }

    console.log('[MockWebSocket] New notification:', newNotification);
  }, [enableSounds]);

  /**
   * Simulate incoming messages
   * Mô phỏng messages đến từ server
   */
  useEffect(() => {
    if (!isConnected || !enableNotifications) return;

    const interval = setInterval(() => {
      // Random chance to receive a notification
      if (Math.random() < 0.1) { // 10% chance every interval
        const notificationTypes = ['info', 'warning', 'error', 'success'] as const;
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const sampleNotifications = {
          info: {
            title: 'Thông tin hệ thống',
            message: `Có ${Math.floor(Math.random() * 10) + 1} người dùng mới đăng ký`,
            type: 'info' as const,
            read: false,
            actionUrl: '/3141592654/admin/users'
          },
          warning: {
            title: 'Cảnh báo hiệu suất',
            message: 'Database response time cao hơn bình thường',
            type: 'warning' as const,
            read: false,
            actionUrl: '/3141592654/admin/analytics'
          },
          error: {
            title: 'Lỗi hệ thống',
            message: 'Phát hiện lỗi trong quá trình xử lý dữ liệu',
            type: 'error' as const,
            read: false,
            actionUrl: '/3141592654/admin/settings'
          },
          success: {
            title: 'Thành công',
            message: 'Backup dữ liệu đã hoàn thành',
            type: 'success' as const,
            read: false,
            actionUrl: '/3141592654/admin/settings'
          }
        };

        addNotification(sampleNotifications[randomType]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected, enableNotifications, addNotification]);

  /**
   * Auto connect on mount
   * Tự động kết nối khi component mount
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  /**
   * Handle connection errors and reconnection
   * Xử lý lỗi kết nối và kết nối lại
   */
  useEffect(() => {
    if (connectionStatus === 'error' && reconnectAttempts < maxReconnectAttempts) {
      const timeout = setTimeout(() => {
        reconnect();
      }, reconnectInterval);

      return () => clearTimeout(timeout);
    }
  }, [connectionStatus, reconnectAttempts, maxReconnectAttempts, reconnectInterval, reconnect]);

  // Context value
  const contextValue: MockWebSocketContextValue = {
    isConnected,
    connectionStatus,
    lastMessage,
    notifications,
    sendMessage,
    connect,
    disconnect,
    reconnect
  };

  return (
    <MockWebSocketContext.Provider value={contextValue}>
      {children}
    </MockWebSocketContext.Provider>
  );
}

/**
 * Use Mock WebSocket Hook
 * Hook để sử dụng MockWebSocket context
 */
export function useMockWebSocket(): MockWebSocketContextValue {
  const context = useContext(MockWebSocketContext);
  
  if (context === undefined) {
    throw new Error('useMockWebSocket must be used within a MockWebSocketProvider');
  }
  
  return context;
}

/**
 * Use WebSocket Notifications Hook
 * Hook để sử dụng WebSocket notifications
 */
export function useWebSocketNotifications() {
  const { notifications } = useMockWebSocket();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const latestNotification = notifications[0] || null;
  
  return {
    notifications,
    unreadCount,
    latestNotification
  };
}

/**
 * Use WebSocket Connection Hook
 * Hook để sử dụng WebSocket connection status
 */
export function useWebSocketConnection() {
  const { isConnected, connectionStatus, connect, disconnect, reconnect } = useMockWebSocket();
  
  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    reconnect,
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
    hasError: connectionStatus === 'error'
  };
}
