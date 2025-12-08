// Day 27: WebSocket Real-time Notifications
// Day 52: Enhanced with Collaboration & Presence Features

import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtPayload, Task } from '../types';
import { JwtUtil } from '../utils/jwt';
import logger from '../utils/logger';

interface SocketUser extends JwtPayload {
  socketId: string;
  username?: string;
}

interface UserPresence {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentTask?: string;
}

interface TypingIndicator {
  userId: string;
  username: string;
  taskId: string;
  isTyping: boolean;
}

interface TaskUpdate {
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  task: Partial<Task>;
  userId: string;
  username: string;
  timestamp: Date;
}

export class WebSocketService {
  private io: Server;
  private connectedUsers = new Map<string, SocketUser>();
  private userPresence = new Map<string, UserPresence>(); // Day 52: Presence tracking
  private typingUsers = new Map<string, Set<string>>(); // Day 52: taskId -> Set<userId>
  private userSockets = new Map<string, Set<string>>(); // Day 52: userId -> Set<socketId>

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: { 
        origin: process.env.CLIENT_URL || "*", 
        methods: ["GET", "POST"],
        credentials: true 
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });
    this.setupEventHandlers();
    logger.info('WebSocket service initialized with enhanced features');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info('Client connected', { socketId: socket.id });

      // Authentication
      socket.on('authenticate', async (token: string) => {
        try {
          const user = JwtUtil.verifyAccessToken(token);
          const socketUser = { ...user, socketId: socket.id };
          this.connectedUsers.set(socket.id, socketUser);
          socket.join(`user_${user.userId}`);
          
          // Day 52: Track user sockets
          if (!this.userSockets.has(user.userId)) {
            this.userSockets.set(user.userId, new Set());
          }
          this.userSockets.get(user.userId)!.add(socket.id);
          
          // Day 52: Update presence
          this.updateUserPresence(user.userId, user.email || 'User', 'online');
          
          socket.emit('authenticated', { success: true });
          
          // Send current online users
          socket.emit('presence:list', this.getOnlineUsers());
          
          logger.info('User authenticated', { userId: user.userId, socketId: socket.id });
        } catch (error) {
          socket.emit('authenticated', { success: false });
          logger.error('Authentication failed', { error, socketId: socket.id });
        }
      });

      // Day 52: Task room management
      socket.on('task:join', (taskId: string) => {
        this.handleTaskJoin(socket, taskId);
      });

      socket.on('task:leave', (taskId: string) => {
        this.handleTaskLeave(socket, taskId);
      });

      // Day 52: Typing indicators
      socket.on('task:typing', (data: { taskId: string; isTyping: boolean }) => {
        this.handleTyping(socket, data);
      });

      // Day 52: Presence updates
      socket.on('presence:update', (status: 'online' | 'away') => {
        this.handlePresenceUpdate(socket, status);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  // Day 52: Enhanced disconnect handler
  private handleDisconnect(socket: Socket): void {
    const user = this.connectedUsers.get(socket.id);
    
    if (user) {
      const userId = user.userId;
      
      // Remove from user sockets
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        
        // If no more sockets, mark offline
        if (sockets.size === 0) {
          this.updateUserPresence(userId, user.email || 'User', 'offline');
          this.userSockets.delete(userId);
        }
      }
      
      this.connectedUsers.delete(socket.id);
      logger.info('Client disconnected', { socketId: socket.id, userId });
    }
  }

  // Day 52: Task room handlers
  private handleTaskJoin(socket: Socket, taskId: string): void {
    socket.join(`task:${taskId}`);
    const user = this.connectedUsers.get(socket.id);
    
    if (user) {
      const presence = this.userPresence.get(user.userId);
      if (presence) {
        presence.currentTask = taskId;
        this.userPresence.set(user.userId, presence);
      }
      
      // Notify others in task room
      socket.to(`task:${taskId}`).emit('task:user_joined', {
        userId: user.userId,
        username: user.email,
        taskId
      });
      
      logger.info('User joined task', { userId: user.userId, taskId });
    }
  }

  private handleTaskLeave(socket: Socket, taskId: string): void {
    socket.leave(`task:${taskId}`);
    const user = this.connectedUsers.get(socket.id);
    
    if (user) {
      const presence = this.userPresence.get(user.userId);
      if (presence) {
        presence.currentTask = undefined;
        this.userPresence.set(user.userId, presence);
      }
      
      // Stop typing
      this.stopTyping(user.userId, taskId);
      
      socket.to(`task:${taskId}`).emit('task:user_left', {
        userId: user.userId,
        username: user.email,
        taskId
      });
      
      logger.info('User left task', { userId: user.userId, taskId });
    }
  }

  // Day 52: Typing handler
  private handleTyping(socket: Socket, data: { taskId: string; isTyping: boolean }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;
    
    const { taskId, isTyping } = data;
    
    if (isTyping) {
      if (!this.typingUsers.has(taskId)) {
        this.typingUsers.set(taskId, new Set());
      }
      this.typingUsers.get(taskId)!.add(user.userId);
    } else {
      this.stopTyping(user.userId, taskId);
    }
    
    socket.to(`task:${taskId}`).emit('task:typing', {
      userId: user.userId,
      username: user.email,
      taskId,
      isTyping
    });
  }

  // Day 52: Presence handler
  private handlePresenceUpdate(socket: Socket, status: 'online' | 'away'): void {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      this.updateUserPresence(user.userId, user.email || 'User', status);
    }
  }

  // Day 52: Helper methods
  private updateUserPresence(userId: string, username: string, status: 'online' | 'away' | 'offline'): void {
    const presence: UserPresence = {
      userId,
      username,
      status,
      lastSeen: new Date(),
      currentTask: this.userPresence.get(userId)?.currentTask
    };
    
    this.userPresence.set(userId, presence);
    
    // Broadcast presence update
    this.io.emit(`user:${status}`, presence);
    this.io.emit('presence:update', presence);
  }

  private stopTyping(userId: string, taskId: string): void {
    const typingSet = this.typingUsers.get(taskId);
    if (typingSet) {
      typingSet.delete(userId);
      if (typingSet.size === 0) {
        this.typingUsers.delete(taskId);
      }
    }
  }

  // Day 52: Public API - Presence
  public getOnlineUsers(): UserPresence[] {
    return Array.from(this.userPresence.values())
      .filter(p => p.status === 'online');
  }

  public getUsersInTask(taskId: string): UserPresence[] {
    return Array.from(this.userPresence.values())
      .filter(p => p.currentTask === taskId && p.status === 'online');
  }

  public getTypingUsers(taskId: string): string[] {
    const typingSet = this.typingUsers.get(taskId);
    return typingSet ? Array.from(typingSet) : [];
  }

  public isUserOnline(userId: string): boolean {
    const presence = this.userPresence.get(userId);
    return presence?.status === 'online' || false;
  }

  // Day 52: Public API - Task updates
  public broadcastTaskUpdate(update: TaskUpdate): void {
    // Broadcast to task room
    this.io.to(`task:${update.task.id}`).emit('task:updated', update);
    
    // Broadcast to task owner
    if (update.task.userId) {
      this.io.to(`user_${update.task.userId}`).emit('task:updated', update);
    }
    
    logger.info('Task update broadcasted', { taskId: update.task.id, action: update.action });
  }

  // Day 52: Activity feed
  public broadcastActivity(activity: {
    type: string;
    userId: string;
    username: string;
    action: string;
    target?: string;
    timestamp: Date;
  }): void {
    this.io.emit('activity:feed', activity);
    logger.info('Activity broadcasted', { type: activity.type });
  }

  // Send notification to specific user
  notifyUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to all users
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Day 52: Get stats
  public getStats() {
    return {
      connectedSockets: this.io.sockets.sockets.size,
      onlineUsers: this.getOnlineUsers().length,
      totalUsers: this.userPresence.size,
      connectedUsers: this.connectedUsers.size,
      activeRooms: Array.from(this.io.sockets.adapter.rooms.keys())
        .filter(room => room.startsWith('task:') || room.startsWith('user_')).length
    };
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}

export let webSocketService: WebSocketService;