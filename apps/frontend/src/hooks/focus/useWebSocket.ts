/**
 * useWebSocket Hook - React Hook for Focus Room WebSocket
 * 
 * Auto-connects on mount, disconnects on unmount
 * Manages WebSocket state and provides message handling
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { focusWebSocketService } from '@/services/focus-websocket.service';

interface UseWebSocketOptions {
  roomId: string;
  token: string;
  autoConnect?: boolean;
}

interface ChatMessage {
  user_id: string;
  message: string;
  timestamp: number;
}

export function useWebSocket({ roomId, token, autoConnect = true }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const hasJoinedRoom = useRef(false);

  // Connect handler
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setIsReconnecting(false);

    // Auto-join room after connection
    if (roomId && !hasJoinedRoom.current) {
      focusWebSocketService.joinRoom(roomId);
      hasJoinedRoom.current = true;
    }
  }, [roomId]);

  // Disconnect handler
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsReconnecting(true);
    hasJoinedRoom.current = false;
  }, []);

  // New message handler
  const handleNewMessage = useCallback((data: ChatMessage) => {
    setMessages(prev => [...prev, data]);
  }, []);

  // User joined handler
  const handleUserJoined = useCallback((data: any) => {
    if (data.online_users) {
      setOnlineUsers(data.online_users);
    }
  }, []);

  // User left handler
  const handleUserLeft = useCallback((data: any) => {
    if (data.online_users) {
      setOnlineUsers(data.online_users);
    }
  }, []);

  // Connect/disconnect lifecycle
  useEffect(() => {
    if (!autoConnect || !token) return;

    // Connect
    focusWebSocketService.connect(token, roomId)
      .then(() => {
        console.log('[useWebSocket] Connected');
      })
      .catch(err => {
        console.error('[useWebSocket] Connection error:', err);
      });

    // Subscribe to events
    focusWebSocketService.on('connected', handleConnect);
    focusWebSocketService.on('disconnected', handleDisconnect);
    focusWebSocketService.on('new_message', handleNewMessage);
    focusWebSocketService.on('user_joined', handleUserJoined);
    focusWebSocketService.on('user_left', handleUserLeft);

    // Cleanup
    return () => {
      if (hasJoinedRoom.current && roomId) {
        focusWebSocketService.leaveRoom(roomId);
        hasJoinedRoom.current = false;
      }

      focusWebSocketService.off('connected', handleConnect);
      focusWebSocketService.off('disconnected', handleDisconnect);
      focusWebSocketService.off('new_message', handleNewMessage);
      focusWebSocketService.off('user_joined', handleUserJoined);
      focusWebSocketService.off('user_left', handleUserLeft);
      
      focusWebSocketService.disconnect();
    };
  }, [token, roomId, autoConnect, handleConnect, handleDisconnect, handleNewMessage, handleUserJoined, handleUserLeft]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (!isConnected) {
      console.error('[useWebSocket] Cannot send message - not connected');
      return;
    }

    focusWebSocketService.sendChatMessage(roomId, message);
  }, [isConnected, roomId]);

  // Join room function
  const joinRoom = useCallback((newRoomId: string) => {
    focusWebSocketService.joinRoom(newRoomId);
  }, []);

  // Leave room function
  const leaveRoom = useCallback((oldRoomId: string) => {
    focusWebSocketService.leaveRoom(oldRoomId);
  }, []);

  return {
    isConnected,
    isReconnecting,
    messages,
    onlineUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
}

