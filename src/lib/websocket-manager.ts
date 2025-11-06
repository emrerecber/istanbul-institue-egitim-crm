// WebSocket Connection Manager for Real-time Features
export type WebSocketEvent = 
  | 'audit_progress'
  | 'audit_completed'
  | 'notification'
  | 'chat_message'
  | 'user_online'
  | 'user_offline'
  | 'admin_alert';

export interface WebSocketMessage {
  type: WebSocketEvent;
  payload: any;
  timestamp: number;
  userId?: string;
}

export interface AuditProgressData {
  auditId: string;
  status: 'pending' | 'in_progress' | 'analyzing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number;
  completedSteps: string[];
  errors?: string[];
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  persistent?: boolean;
  userId: string;
}

export interface ChatMessageData {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'system';
  message: string;
  timestamp: number;
  roomId?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

type EventCallback = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private eventListeners = new Map<WebSocketEvent, Set<EventCallback>>();
  private connectionPromise: Promise<void> | null = null;
  private userId: string | null = null;
  private sessionToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  // Initialize WebSocket connection
  async connect(userId: string, sessionToken: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.userId = userId;
    this.sessionToken = sessionToken;

    this.connectionPromise = this.establishConnection();
    return this.connectionPromise;
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('WebSocket not available in server environment'));
        return;
      }

      try {
        this.isConnecting = true;
        
        // In production, use WSS and your actual WebSocket server
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? `wss://your-domain.com/ws?token=${this.sessionToken}&userId=${this.userId}`
          : `ws://localhost:3001/ws?token=${this.sessionToken}&userId=${this.userId}`;
          
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.stopHeartbeat();
          this.isConnecting = false;
          this.connectionPromise = null;

          // Attempt to reconnect unless it was a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.connectionPromise = null;
          
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId && this.sessionToken) {
        this.connect(this.userId, this.sessionToken).catch(() => {
          this.attemptReconnect();
        });
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.payload);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${message.type}:`, error);
        }
      });
    }
  }

  // Send message through WebSocket
  send(type: WebSocketEvent, payload: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
        userId: this.userId || undefined
      };

      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }

    console.warn('WebSocket not connected, message not sent:', type, payload);
    return false;
  }

  // Event listener management
  on(event: WebSocketEvent, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: WebSocketEvent, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event?: WebSocketEvent): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    this.stopHeartbeat();
    this.removeAllListeners();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.connectionPromise = null;
    this.userId = null;
    this.sessionToken = null;
    this.reconnectAttempts = 0;
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Specific methods for different features
  
  // Audit progress tracking
  subscribeToAuditProgress(auditId: string, callback: (progress: AuditProgressData) => void): void {
    this.on('audit_progress', (data: AuditProgressData) => {
      if (data.auditId === auditId) {
        callback(data);
      }
    });

    // Subscribe to specific audit
    this.send('subscribe_audit', { auditId });
  }

  unsubscribeFromAuditProgress(auditId: string): void {
    this.send('unsubscribe_audit', { auditId });
  }

  // Notifications
  subscribeToNotifications(callback: (notification: NotificationData) => void): void {
    this.on('notification', callback);
  }

  markNotificationAsRead(notificationId: string): void {
    this.send('mark_notification_read', { notificationId });
  }

  // Chat functionality
  joinChatRoom(roomId: string): void {
    this.send('join_chat_room', { roomId });
  }

  leaveChatRoom(roomId: string): void {
    this.send('leave_chat_room', { roomId });
  }

  sendChatMessage(roomId: string, message: string, attachments?: Array<{ name: string; url: string; type: string }>): void {
    this.send('chat_message', {
      roomId,
      message,
      attachments: attachments || []
    });
  }

  subscribeToChatMessages(roomId: string, callback: (message: ChatMessageData) => void): void {
    this.on('chat_message', (data: ChatMessageData) => {
      if (!roomId || data.roomId === roomId) {
        callback(data);
      }
    });
  }

  // Admin features
  subscribeToAdminAlerts(callback: (alert: any) => void): void {
    this.on('admin_alert', callback);
  }

  // User presence
  updateUserStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.send('user_status_update', { status });
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
};

// React hook for using WebSocket
export const useWebSocket = () => {
  return getWebSocketManager();
};

export default WebSocketManager;