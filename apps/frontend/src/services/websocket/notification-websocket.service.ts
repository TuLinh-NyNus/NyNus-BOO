/**
 * Notification WebSocket Service
 * Real-time notification delivery via WebSocket
 * Phase 4 - Task 4.1: WebSocket Service
 */

// EventEmitter for TypeScript
type EventCallback = (data: unknown) => void;

interface EventEmitter {
  on(event: string, callback: EventCallback): () => void;
  emit(event: string, data: unknown): void;
  removeAllListeners(event?: string): void;
}

class SimpleEventEmitter implements EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: string, data: unknown): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export interface WebSocketMessage {
  type: string;
  payload?: Record<string, unknown>;
}

export interface WebSocketNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  is_read?: boolean;
  expires_at?: string;
}

export interface WebSocketResponse {
  type: string;
  success: boolean;
  message?: string;
  data?: unknown;
  timestamp: string;
}

/**
 * NotificationWebSocketService class
 * Implements task 4.1.1: Create NotificationWebSocketService class
 */
export class NotificationWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private messageQueue: WebSocketMessage[] = [];
  private eventEmitter: EventEmitter;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private url: string;
  private token: string | null = null;
  
  // Connection state
  private _isConnected = false;
  private _connectionState: 'connecting' | 'connected' | 'disconnected' = 'disconnected';

  constructor(url?: string) {
    this.url = url || this.getWebSocketURL();
    this.eventEmitter = new SimpleEventEmitter();
  }

  /**
   * Get WebSocket URL from environment or default
   */
  private getWebSocketURL(): string {
    // SSR safe: Check if we're in browser environment
    if (typeof window === 'undefined') {
      // Return a placeholder URL for SSR
      // Will be properly set when connect() is called on client
      return 'ws://localhost:8081/api/v1/ws/notifications';
    }
    
    // Try environment variable first
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    
    // Default to localhost for development
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = process.env.NEXT_PUBLIC_WS_PORT || '8081';
    
    return `${protocol}//${host}:${port}/api/v1/ws/notifications`;
  }

  /**
   * Connect to WebSocket server
   * Implements task 4.1.2: Connection management - connect
   */
  async connect(token: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    this.token = token;
    this._connectionState = 'connecting';
    this.eventEmitter.emit('connecting', {});

    return new Promise((resolve, reject) => {
      try {
        // Add token to URL as query parameter
        const urlWithToken = `${this.url}?token=${encodeURIComponent(token)}`;
        
        this.ws = new WebSocket(urlWithToken);

        this.ws.onopen = () => {
          console.log('[WS] Connected');
          this._isConnected = true;
          this._connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Start heartbeat (task 4.1.5)
          this.startHeartbeat();
          
          // Flush queued messages (task 4.1.3)
          this.flushMessageQueue();
          
          this.eventEmitter.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error);
          this.eventEmitter.emit('error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WS] Disconnected:', event.code, event.reason);
          this._isConnected = false;
          this._connectionState = 'disconnected';
          
          this.stopHeartbeat();
          this.eventEmitter.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Auto-reconnect if not a normal closure (task 4.1.2)
          if (event.code !== 1000 && this.token) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error('[WS] Connection error:', error);
        this.eventEmitter.emit('error', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   * Implements task 4.1.2: Connection management - disconnect
   */
  disconnect(): void {
    console.log('[WS] Disconnecting');
    
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this._isConnected = false;
    this._connectionState = 'disconnected';
    this.token = null;
  }

  /**
   * Reconnect to WebSocket server
   * Implements task 4.1.2: Connection management - reconnect with exponential backoff
   */
  private async reconnect(): Promise<void> {
    if (!this.token) {
      console.log('[WS] No token available, cannot reconnect');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      this.eventEmitter.emit('max_reconnect_reached', {});
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    try {
      await this.connect(this.token);
    } catch (error) {
      console.error('[WS] Reconnect failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    
    // Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`[WS] Reconnecting in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Send message to WebSocket server
   * Implements task 4.1.3: Message handling - send
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('[WS] Not connected, queueing message');
      // Queue message when disconnected (task 4.1.3)
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[WS] Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages
   * Implements task 4.1.3: Flush queue on reconnect
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`[WS] Flushing ${this.messageQueue.length} queued messages`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(message => {
      this.send(message);
    });
  }

  /**
   * Handle incoming message
   * Implements task 4.1.3: Message handling - receive with TypeScript types
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketResponse = JSON.parse(data);
      
      // Route based on message type (task 4.1.4: Events)
      switch (message.type) {
        case 'notification':
          this.eventEmitter.emit('notification', message.data);
          break;
          
        case 'connected':
          console.log('[WS] Welcome message received');
          break;
          
        case 'pong':
          // Heartbeat response
          break;
          
        case 'error':
          console.error('[WS] Server error:', message.message);
          this.eventEmitter.emit('error', new Error(message.message));
          break;
          
        default:
          console.log('[WS] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[WS] Failed to parse message:', error);
      this.eventEmitter.emit('error', error);
    }
  }

  /**
   * Start heartbeat
   * Implements task 4.1.5: Heartbeat - send ping every 25s
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 25000); // 25 seconds
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
   * Subscribe to events
   * Implements task 4.1.4: Event emitter
   */
  on(event: 'notification' | 'connected' | 'disconnected' | 'error' | 'connecting' | 'max_reconnect_reached', callback: EventCallback): () => void {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Get connection state
   */
  get connectionState(): 'connecting' | 'connected' | 'disconnected' {
    return this._connectionState;
  }

  /**
   * Mark notification as read via WebSocket
   */
  markAsRead(notificationId: string): void {
    this.send({
      type: 'mark_read',
      payload: { notification_id: notificationId }
    });
  }

  /**
   * Subscribe to topics
   */
  subscribe(topics: string[]): void {
    this.send({
      type: 'subscribe',
      payload: { topics }
    });
  }

  /**
   * Unsubscribe from topics
   */
  unsubscribe(topics: string[]): void {
    this.send({
      type: 'unsubscribe',
      payload: { topics }
    });
  }
}

// Singleton instance
let wsServiceInstance: NotificationWebSocketService | null = null;

/**
 * Get singleton WebSocket service instance
 */
export function getWebSocketService(): NotificationWebSocketService {
  if (!wsServiceInstance) {
    wsServiceInstance = new NotificationWebSocketService();
  }
  return wsServiceInstance;
}

export default NotificationWebSocketService;

