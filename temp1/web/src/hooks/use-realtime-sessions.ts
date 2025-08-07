'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

// Types
export interface SessionEvent {
  type: 'SESSION_CREATED' | 'SESSION_TERMINATED' | 'SESSION_UPDATED' | 'SECURITY_VIOLATION';
  sessionId: string;
  userId?: string;
  data: any;
  timestamp: string;
}

export interface RealtimeStats {
  activeSessions: number;
  activeUsers: number;
  recentEvents: SessionEvent[];
  securityAlerts: number;
}

/**
 * Custom hook for real-time session monitoring
 * Provides WebSocket-based real-time updates for admin session management
 */
export function useRealtimeSessions() {
  const { toast } = useToast();
  
  // State
  const [connected, setConnected] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    activeSessions: 0,
    activeUsers: 0,
    recentEvents: [],
    securityAlerts: 0,
  });
  const [events, setEvents] = useState<SessionEvent[]>([]);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No access token found for WebSocket connection');
        return;
      }

      // In production, this would be the actual WebSocket endpoint
      const wsUrl = `ws://localhost:5000/ws/admin/sessions?token=${token}`;
      
      // For development, we'll simulate WebSocket connection
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // Simulate connection success
      setConnected(true);
      reconnectAttempts.current = 0;
      
      // Simulate receiving real-time data
      simulateRealtimeData();
      
      toast({
        title: 'Kết nối thành công',
        description: 'Real-time monitoring đã được kích hoạt',
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      scheduleReconnect();
    }
  }, [toast]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnected(false);
  }, []);

  /**
   * Schedule reconnection attempt
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast({
        title: 'Lỗi kết nối',
        description: 'Không thể kết nối đến server. Vui lòng refresh trang.',
        variant: 'destructive',
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
      connect();
    }, delay);
  }, [connect, toast]);

  /**
   * Simulate real-time data for development
   */
  const simulateRealtimeData = useCallback(() => {
    // Simulate periodic updates
    const interval = setInterval(() => {
      if (!connected) {
        clearInterval(interval);
        return;
      }

      // Generate random session event
      const eventTypes: SessionEvent['type'][] = [
        'SESSION_CREATED',
        'SESSION_TERMINATED', 
        'SESSION_UPDATED',
        'SECURITY_VIOLATION'
      ];
      
      const randomEvent: SessionEvent = {
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        data: {
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          reason: 'Simulated event for development',
        },
        timestamp: new Date().toISOString(),
      };

      // Update events
      setEvents(prev => [randomEvent, ...prev.slice(0, 49)]); // Keep last 50 events

      // Update stats
      setRealtimeStats(prev => ({
        activeSessions: prev.activeSessions + (randomEvent.type === 'SESSION_CREATED' ? 1 : 
                       randomEvent.type === 'SESSION_TERMINATED' ? -1 : 0),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        recentEvents: [randomEvent, ...prev.recentEvents.slice(0, 9)], // Keep last 10 events
        securityAlerts: prev.securityAlerts + (randomEvent.type === 'SECURITY_VIOLATION' ? 1 : 0),
      }));

      // Show toast for security violations
      if (randomEvent.type === 'SECURITY_VIOLATION') {
        toast({
          title: '🚨 Cảnh báo bảo mật',
          description: `Phát hiện vi phạm từ IP ${randomEvent.data.ipAddress}`,
          variant: 'destructive',
        });
      }

    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

    return () => clearInterval(interval);
  }, [connected, toast]);

  /**
   * Send message to WebSocket server
   */
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  /**
   * Subscribe to specific session events
   */
  const subscribeToSession = useCallback((sessionId: string) => {
    sendMessage({
      type: 'SUBSCRIBE_SESSION',
      sessionId,
    });
  }, [sendMessage]);

  /**
   * Unsubscribe from session events
   */
  const unsubscribeFromSession = useCallback((sessionId: string) => {
    sendMessage({
      type: 'UNSUBSCRIBE_SESSION',
      sessionId,
    });
  }, [sendMessage]);

  /**
   * Subscribe to user events
   */
  const subscribeToUser = useCallback((userId: string) => {
    sendMessage({
      type: 'SUBSCRIBE_USER',
      userId,
    });
  }, [sendMessage]);

  /**
   * Get events by type
   */
  const getEventsByType = useCallback((type: SessionEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  /**
   * Get recent security violations
   */
  const getSecurityViolations = useCallback(() => {
    return events.filter(event => event.type === 'SECURITY_VIOLATION');
  }, [events]);

  /**
   * Clear events
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
    setRealtimeStats(prev => ({
      ...prev,
      recentEvents: [],
      securityAlerts: 0,
    }));
  }, []);

  /**
   * Get connection status
   */
  const getConnectionStatus = useCallback(() => {
    return {
      connected,
      reconnectAttempts: reconnectAttempts.current,
      maxReconnectAttempts,
    };
  }, [connected]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    connected,
    
    // Real-time data
    realtimeStats,
    events,
    
    // Connection management
    connect,
    disconnect,
    getConnectionStatus,
    
    // Event subscriptions
    subscribeToSession,
    unsubscribeFromSession,
    subscribeToUser,
    
    // Event filtering
    getEventsByType,
    getSecurityViolations,
    
    // Utilities
    clearEvents,
    sendMessage,
  };
}
