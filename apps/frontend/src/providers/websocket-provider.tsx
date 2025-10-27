/**
 * WebSocket Provider
 * React context provider for WebSocket connection
 * Phase 4 - Task 4.2: WebSocket Provider
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getWebSocketService, WebSocketNotification, WebSocketMessage } from '@/services/websocket/notification-websocket.service';
import { useAuth } from '@/contexts/auth-context-grpc';

/**
 * WebSocket Context Value
 * Implements task 4.2.1: Create React Context
 */
interface WebSocketContextValue {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketNotification | null;
  send: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

/**
 * WebSocket Provider Component
 * Implements task 4.2.2: Provider component
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketNotification | null>(null);
  // Lazy initialization - only create service on client-side
  const [wsService] = useState(() => {
    // SSR safe: only initialize service in browser
    if (typeof window === 'undefined') {
      return null;
    }
    return getWebSocketService();
  });

  /**
   * Connect to WebSocket when authenticated
   * Implements task 4.2.2: Connect on mount (if authenticated)
   */
  useEffect(() => {
    // SSR safe: early return if service not initialized
    if (!wsService) {
      return;
    }

    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (isConnected) {
        wsService.disconnect();
      }
      return;
    }

    // SSR-safe: Skip on server-side rendering
    if (typeof window === 'undefined') {
      console.log('[WS Provider] Server-side rendering, skipping WebSocket');
      return;
    }

    // Get token from storage
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('[WS Provider] No access token available');
      return;
    }

    // Connect to WebSocket
    console.log('[WS Provider] Connecting to WebSocket');
    wsService.connect(token).catch(error => {
      console.error('[WS Provider] Connection failed:', error);
    });

    // Subscribe to connection events
    const unsubConnected = wsService.on('connected', () => {
      console.log('[WS Provider] Connected');
      setIsConnected(true);
      setConnectionState('connected');
    });

    const unsubDisconnected = wsService.on('disconnected', () => {
      console.log('[WS Provider] Disconnected');
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    const unsubConnecting = wsService.on('connecting', () => {
      console.log('[WS Provider] Connecting...');
      setConnectionState('connecting');
    });

    const unsubNotification = wsService.on('notification', (data: WebSocketNotification) => {
      console.log('[WS Provider] Notification received:', data);
      setLastMessage(data);
    });

    const unsubError = wsService.on('error', (error: any) => {
      console.error('[WS Provider] Error:', error);
    });

    // Cleanup on unmount (task 4.2.2: Disconnect on unmount)
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubConnecting();
      unsubNotification();
      unsubError();
      wsService.disconnect();
    };
  }, [isAuthenticated, user, wsService, isConnected]);

  /**
   * Reconnect function
   * Implements task 4.2.4: Reconnect on token refresh
   */
  const reconnect = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('[WS Provider] No token for reconnect');
      return;
    }

    wsService.disconnect();
    wsService.connect(token).catch(error => {
      console.error('[WS Provider] Reconnect failed:', error);
    });
  }, [wsService]);

  /**
   * Send message function
   */
  const send = useCallback((message: WebSocketMessage) => {
    wsService.send(message);
  }, [wsService]);

  const value: WebSocketContextValue = {
    isConnected,
    connectionState,
    lastMessage,
    send,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to use WebSocket context
 * Implements task 4.2.3: Hook useWebSocket()
 */
export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  
  return context;
}

export default WebSocketProvider;

