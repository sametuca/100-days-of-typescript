/**
 * Day 52: WebSocket Client SDK Example
 * 
 * This is a TypeScript/JavaScript client for connecting to the WebSocket server.
 * Use this in your frontend application (React, Vue, Angular, etc.)
 */

import { io, Socket } from 'socket.io-client';

interface UserPresence {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentTask?: string;
}

interface TaskUpdate {
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  task: any;
  userId: string;
  username: string;
  timestamp: Date;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface RealtimeClientOptions {
  url: string;
  token: string;
  autoReconnect?: boolean;
  reconnectionAttempts?: number;
}

export class RealtimeClient {
  private socket: Socket | null = null;
  private token: string;
  private url: string;
  private currentUserId?: string;
  private currentTaskId?: string;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(options: RealtimeClientOptions) {
    this.url = options.url;
    this.token = options.token;
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        // Connection events
        this.socket.on('connect', () => {
          console.log('[Realtime] Connected to server');
          this.authenticate();
        });

        this.socket.on('authenticated', (data: { success: boolean }) => {
          if (data.success) {
            console.log('[Realtime] Authenticated successfully');
            this.setupEventListeners();
            resolve();
          } else {
            console.error('[Realtime] Authentication failed');
            reject(new Error('Authentication failed'));
          }
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('[Realtime] Disconnected:', reason);
          this.emit('disconnected', { reason });
        });

        this.socket.on('connect_error', (error: Error) => {
          console.error('[Realtime] Connection error:', error);
          this.emit('error', { error });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Authenticate with server
   */
  private authenticate(): void {
    if (this.socket) {
      this.socket.emit('authenticate', this.token);
    }
  }

  /**
   * Setup event listeners for WebSocket events
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // User presence events
    this.socket.on('user:online', (presence: UserPresence) => {
      this.emit('user:online', presence);
    });

    this.socket.on('user:offline', (presence: UserPresence) => {
      this.emit('user:offline', presence);
    });

    this.socket.on('presence:update', (presence: UserPresence) => {
      this.emit('presence:update', presence);
    });

    this.socket.on('presence:list', (users: UserPresence[]) => {
      this.emit('presence:list', users);
    });

    // Task events
    this.socket.on('task:updated', (update: TaskUpdate) => {
      this.emit('task:updated', update);
    });

    this.socket.on('task:user_joined', (data: any) => {
      this.emit('task:user_joined', data);
    });

    this.socket.on('task:user_left', (data: any) => {
      this.emit('task:user_left', data);
    });

    this.socket.on('task:typing', (data: any) => {
      this.emit('task:typing', data);
    });

    // Notifications
    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification);
    });

    // Activity feed
    this.socket.on('activity:feed', (activity: any) => {
      this.emit('activity:feed', activity);
    });
  }

  /**
   * Join a task room
   */
  public joinTask(taskId: string): void {
    if (this.socket) {
      this.currentTaskId = taskId;
      this.socket.emit('task:join', taskId);
      console.log('[Realtime] Joined task:', taskId);
    }
  }

  /**
   * Leave current task room
   */
  public leaveTask(taskId?: string): void {
    if (this.socket) {
      const id = taskId || this.currentTaskId;
      if (id) {
        this.socket.emit('task:leave', id);
        console.log('[Realtime] Left task:', id);
        if (id === this.currentTaskId) {
          this.currentTaskId = undefined;
        }
      }
    }
  }

  /**
   * Send typing indicator
   */
  public setTyping(taskId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('task:typing', { taskId, isTyping });
    }
  }

  /**
   * Update presence status
   */
  public updatePresence(status: 'online' | 'away'): void {
    if (this.socket) {
      this.socket.emit('presence:update', status);
    }
  }

  /**
   * Register event handler
   */
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Unregister event handler
   */
  public off(event: string, handler?: Function): void {
    if (!handler) {
      this.eventHandlers.delete(event);
    } else {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  /**
   * Emit event to local handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[Realtime] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Realtime] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Example Usage:

/*
// 1. Initialize client
const realtimeClient = new RealtimeClient({
  url: 'http://localhost:3000',
  token: 'your-jwt-token-here'
});

// 2. Connect
await realtimeClient.connect();

// 3. Listen to events
realtimeClient.on('user:online', (presence) => {
  console.log('User came online:', presence.username);
});

realtimeClient.on('task:updated', (update) => {
  console.log('Task updated:', update.task.id, update.action);
  // Update your UI here
});

realtimeClient.on('notification', (notification) => {
  console.log('New notification:', notification.message);
  // Show notification toast
});

realtimeClient.on('presence:list', (users) => {
  console.log('Online users:', users.length);
  // Update online users list in UI
});

realtimeClient.on('task:typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.username} is typing...`);
  }
});

// 4. Join task room when user opens a task
realtimeClient.joinTask('task_123');

// 5. Send typing indicator
let typingTimeout: any;
const handleInputChange = () => {
  realtimeClient.setTyping('task_123', true);
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    realtimeClient.setTyping('task_123', false);
  }, 1000);
};

// 6. Update presence when user goes away
window.addEventListener('blur', () => {
  realtimeClient.updatePresence('away');
});

window.addEventListener('focus', () => {
  realtimeClient.updatePresence('online');
});

// 7. Leave task when done
realtimeClient.leaveTask('task_123');

// 8. Clean up on unmount/exit
realtimeClient.disconnect();
*/

// React Hook Example:
/*
import { useEffect, useState } from 'react';

export function useRealtime(token: string) {
  const [client, setClient] = useState<RealtimeClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const rtClient = new RealtimeClient({
      url: process.env.REACT_APP_WS_URL || 'http://localhost:3000',
      token
    });

    rtClient.connect().then(() => {
      setClient(rtClient);
      setIsConnected(true);
    });

    rtClient.on('presence:list', (users: UserPresence[]) => {
      setOnlineUsers(users);
    });

    rtClient.on('user:online', (user: UserPresence) => {
      setOnlineUsers(prev => [...prev, user]);
    });

    rtClient.on('user:offline', (user: UserPresence) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    return () => {
      rtClient.disconnect();
    };
  }, [token]);

  return { client, isConnected, onlineUsers };
}
*/

export default RealtimeClient;
