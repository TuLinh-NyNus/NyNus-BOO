/**
 * Focus Room WebSocket Service
 * 
 * Features:
 * - WebSocket connection management
 * - Auto-reconnect with exponential backoff
 * - Event-based message handling
 * - Heartbeat ping/pong
 * - JWT authentication
 * - Error handling & logging
 */

type EventType = 'connected' | 'disconnected' | 'error' | 'message' | 'user_joined' | 'user_left' | 'new_message' | 'focus_started' | 'focus_ended' | 'presence_update';

type EventHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  payload?: Record<string, any>;
}

interface WebSocketResponse {
  type: string;
  success: boolean;
  message?: string;
  data?: any;
  timestamp: number;
}

export class FocusWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Map<EventType, EventHandler[]> = new Map();
  private isManualDisconnect = false;

  constructor() {
    // Use environment variable or default
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/api/v1/ws';
    this.url = wsUrl;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(token: string, roomId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Already connected');
        resolve();
        return;
      }

      this.token = token;
      this.isManualDisconnect = false;

      try {
        // Add token as query parameter
        const wsUrlWithToken = `${this.url}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrlWithToken);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.emit('error', { error });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Disconnected', event.code, event.reason);
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Auto-reconnect if not manual disconnect
          if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  /**
   * Send a message to server
   */
  public send(type: string, payload?: Record<string, any>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send message - not connected');
      throw new Error('WebSocket not connected');
    }

    const message: WebSocketMessage = { type, payload };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Join a Focus Room
   */
  public joinRoom(roomId: string): void {
    this.send('join_room', { room_id: roomId });
  }

  /**
   * Leave a Focus Room
   */
  public leaveRoom(roomId: string): void {
    this.send('leave_room', { room_id: roomId });
  }

  /**
   * Send a chat message
   */
  public sendChatMessage(roomId: string, message: string): void {
    this.send('send_message', { room_id: roomId, message });
  }

  /**
   * Notify focus session start
   */
  public notifyFocusStart(roomId: string, task?: string): void {
    this.send('focus_start', { room_id: roomId, task });
  }

  /**
   * Notify focus session end
   */
  public notifyFocusEnd(roomId: string, duration?: number): void {
    this.send('focus_end', { room_id: roomId, duration });
  }

  /**
   * Subscribe to events
   */
  public on(event: EventType, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Unsubscribe from events
   */
  public off(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const response: WebSocketResponse = JSON.parse(data);
      
      // Emit specific event based on message type
      this.emit(response.type as EventType, response.data || response);
      
      // Also emit general 'message' event
      this.emit('message', response);
      
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(event: EventType, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Start heartbeat ping/pong
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping');
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 16000);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.token) {
        this.connect(this.token).catch(err => {
          console.error('[WebSocket] Reconnect failed:', err);
        });
      }
    }, delay);
  }
}

// Export singleton instance
export const focusWebSocketService = new FocusWebSocketService();

