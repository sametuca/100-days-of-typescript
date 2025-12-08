import { Request, Response } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

/**
 * Day 52: Realtime Controller
 * HTTP endpoints for WebSocket management and stats
 */

// Import from server initialization
let wsService: any;

export function setWebSocketService(service: any) {
  wsService = service;
}

export class RealtimeController {
  
  /**
   * Get WebSocket connection stats
   * GET /api/v1/realtime/stats
   */
  public static getStats = catchAsync(async (_req: AuthRequest, res: Response): Promise<void> => {
    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const stats = wsService.getStats();

    res.status(200).json({
      success: true,
      message: 'WebSocket stats retrieved',
      data: stats
    });
  });

  /**
   * Get online users
   * GET /api/v1/realtime/users/online
   */
  public static getOnlineUsers = catchAsync(async (_req: AuthRequest, res: Response): Promise<void> => {
    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const onlineUsers = wsService.getOnlineUsers();

    res.status(200).json({
      success: true,
      message: 'Online users retrieved',
      data: {
        count: onlineUsers.length,
        users: onlineUsers
      }
    });
  });

  /**
   * Get users viewing a specific task
   * GET /api/v1/realtime/task/:taskId/users
   */
  public static getTaskUsers = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId } = req.params;

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const users = wsService.getUsersInTask(taskId);
    const typingUsers = wsService.getTypingUsers(taskId);

    res.status(200).json({
      success: true,
      message: 'Task users retrieved',
      data: {
        taskId,
        viewingUsers: users,
        typingUsers: typingUsers,
        totalViewing: users.length
      }
    });
  });

  /**
   * Check if user is online
   * GET /api/v1/realtime/user/:userId/status
   */
  public static getUserStatus = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const isOnline = wsService.isUserOnline(userId);

    res.status(200).json({
      success: true,
      message: 'User status retrieved',
      data: {
        userId,
        isOnline,
        status: isOnline ? 'online' : 'offline'
      }
    });
  });

  /**
   * Broadcast a message to all connected clients (Admin only)
   * POST /api/v1/realtime/broadcast
   */
  public static broadcastMessage = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { event, message, data } = req.body;

    if (!event) {
      res.status(400).json({
        success: false,
        message: 'Event name is required'
      });
      return;
    }

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    wsService.broadcast(event, {
      message,
      data,
      timestamp: new Date(),
      from: 'system'
    });

    logger.info('Broadcast message sent', { event, userId: req.user?.userId });

    res.status(200).json({
      success: true,
      message: 'Broadcast sent successfully',
      data: {
        event,
        recipientCount: wsService.getStats().connectedSockets
      }
    });
  });

  /**
   * Send notification to specific user
   * POST /api/v1/realtime/notify/:userId
   */
  public static notifyUser = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { event, title, message, data } = req.body;

    if (!event || !message) {
      res.status(400).json({
        success: false,
        message: 'Event and message are required'
      });
      return;
    }

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const notification = {
      id: `notif_${Date.now()}`,
      type: event,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };

    wsService.notifyUser(userId, 'notification', notification);

    logger.info('User notification sent', { userId, event });

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        userId,
        notification
      }
    });
  });

  /**
   * Trigger task update broadcast
   * POST /api/v1/realtime/task/update
   */
  public static broadcastTaskUpdate = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId, action, task } = req.body;

    if (!taskId || !action) {
      res.status(400).json({
        success: false,
        message: 'Task ID and action are required'
      });
      return;
    }

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const update = {
      action,
      task: task || { id: taskId },
      userId: req.user?.userId || 'system',
      username: req.user?.email || 'System',
      timestamp: new Date()
    };

    wsService.broadcastTaskUpdate(update);

    logger.info('Task update broadcasted', { taskId, action });

    res.status(200).json({
      success: true,
      message: 'Task update broadcasted',
      data: update
    });
  });

  /**
   * Broadcast activity to feed
   * POST /api/v1/realtime/activity
   */
  public static broadcastActivity = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
    const { type, action, target } = req.body;

    if (!type || !action) {
      res.status(400).json({
        success: false,
        message: 'Type and action are required'
      });
      return;
    }

    if (!wsService) {
      res.status(503).json({
        success: false,
        message: 'WebSocket service not available'
      });
      return;
    }

    const activity = {
      type,
      userId: req.user?.userId || 'system',
      username: req.user?.email || 'System',
      action,
      target,
      timestamp: new Date()
    };

    wsService.broadcastActivity(activity);

    logger.info('Activity broadcasted', { type, action });

    res.status(200).json({
      success: true,
      message: 'Activity broadcasted',
      data: activity
    });
  });

  /**
   * Get realtime health check
   * GET /api/v1/realtime/health
   */
  public static getHealth = catchAsync(async (_req: Request, res: Response): Promise<void> => {
    const isHealthy = wsService !== undefined && wsService !== null;
    const stats = isHealthy ? wsService.getStats() : null;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'WebSocket service is healthy' : 'WebSocket service unavailable',
      data: {
        status: isHealthy ? 'healthy' : 'unavailable',
        timestamp: new Date(),
        stats
      }
    });
  });
}
