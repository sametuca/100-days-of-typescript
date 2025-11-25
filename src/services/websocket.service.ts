// Day 27: WebSocket Real-time Notifications

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtPayload } from '../types';
import { verifyToken } from '../utils/jwt';

interface SocketUser extends JwtPayload {
  socketId: string;
}

export class WebSocketService {
  private io: Server;
  private connectedUsers = new Map<string, SocketUser>();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      socket.on('authenticate', async (token: string) => {
        try {
          const user = verifyToken(token) as JwtPayload;
          this.connectedUsers.set(socket.id, { ...user, socketId: socket.id });
          socket.join(`user_${user.userId}`);
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('authenticated', { success: false });
        }
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  // Send notification to specific user
  notifyUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send notification to all users
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}

export let webSocketService: WebSocketService;