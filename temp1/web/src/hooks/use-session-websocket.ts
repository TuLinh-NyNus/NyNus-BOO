'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { useToast } from '@/hooks/use-toast';

interface SessionUpdate {
  type: 'SESSION_CREATED' | 'SESSION_TERMINATED' | 'SESSION_UPDATED' | 'IP_VIOLATION';
  userId: string;
  sessionId?: string;
  data: any;
}

interface SessionStats {
  totalActiveSessions: number;
  uniqueActiveUsers: number;
  uniqueActiveIPs: number;
  recentViolations: number;
  timestamp: string;
}

interface IPViolationAlert {
  userId: string;
  ipAddress: string;
  sessionCount: number;
  timestamp: string;
}

interface UseSessionWebSocketOptions {
  autoConnect?: boolean;
  onSessionUpdate?: (update: SessionUpdate) => void;
  onStatsUpdate?: (stats: SessionStats) => void;
  onIPViolation?: (alert: IPViolationAlert) => void;
}

export function useSessionWebSocket(Options: UseSessionWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onSessionUpdate,
    onStatsUpdate,
    onIPViolation,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!autoConnect) return;

    connect();

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  const connect = () => {
    if (socketRef.current?.connected) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      socketRef.current = io(`${apiUrl}/admin-sessions`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Request initial stats
        socket.emit('get-session-stats');
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          setTimeout(() => {
            socket.connect();
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // Session update events
      socket.on('session-update', (update: SessionUpdate) => {
        console.log('Session update received:', update);
        onSessionUpdate?.(update);
        
        // Show toast for important updates
        if (update.type === 'IP_VIOLATION') {
          toast({
            title: 'Vi phạm IP',
            description: `User ${update.userId} có quá nhiều IP đồng thời`,
            variant: 'destructive',
          });
        }
      });

      // Stats update events
      socket.on('session-stats', (newStats: SessionStats) => {
        console.log('Session stats received:', newStats);
        setStats(newStats);
        onStatsUpdate?.(newStats);
      });

      // IP violation alerts
      socket.on('ip-violation-alert', (alert: IPViolationAlert) => {
        console.log('IP violation alert:', alert);
        onIPViolation?.(alert);
        
        toast({
          title: 'Cảnh báo vi phạm IP',
          description: `User ${alert.userId} đang sử dụng ${alert.sessionCount} IP addresses từ ${alert.ipAddress}`,
          variant: 'destructive',
        });
      });

      // User sessions update
      socket.on('user-sessions-update', (data: { userId: string; sessions?: any; update?: SessionUpdate }) => {
        console.log('User sessions update:', data);
        // This will be handled by specific components
      });

      socket.on('error', (error: { message: string }) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Lỗi WebSocket',
          description: error.message,
          variant: 'destructive',
        });
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  const subscribeToUserSessions = (userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe-user-sessions', { userId });
    }
  };

  const unsubscribeFromUserSessions = (userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe-user-sessions', { userId });
    }
  };

  const requestStats = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get-session-stats');
    }
  };

  return {
    isConnected,
    connectionError,
    stats,
    connect,
    disconnect,
    subscribeToUserSessions,
    unsubscribeFromUserSessions,
    requestStats,
    socket: socketRef.current,
  };
}
