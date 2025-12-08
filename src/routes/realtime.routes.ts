import { Router } from 'express';
import { RealtimeController } from '../controllers/realtime.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

/**
 * Day 52: Realtime Routes
 * HTTP endpoints for WebSocket management
 */

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /realtime/health:
 *   get:
 *     summary: Check WebSocket service health
 *     tags: [Realtime]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', RealtimeController.getHealth);

/**
 * @swagger
 * /realtime/stats:
 *   get:
 *     summary: Get WebSocket statistics
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
router.get('/stats', RealtimeController.getStats);

/**
 * @swagger
 * /realtime/users/online:
 *   get:
 *     summary: Get list of online users
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Online users list
 */
router.get('/users/online', RealtimeController.getOnlineUsers);

/**
 * @swagger
 * /realtime/task/{taskId}/users:
 *   get:
 *     summary: Get users viewing a specific task
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task viewers list
 */
router.get('/task/:taskId/users', RealtimeController.getTaskUsers);

/**
 * @swagger
 * /realtime/user/{userId}/status:
 *   get:
 *     summary: Check if user is online
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status
 */
router.get('/user/:userId/status', RealtimeController.getUserStatus);

/**
 * @swagger
 * /realtime/broadcast:
 *   post:
 *     summary: Broadcast message to all clients (Admin)
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcast', authorize(UserRole.ADMIN), RealtimeController.broadcastMessage);

/**
 * @swagger
 * /realtime/notify/{userId}:
 *   post:
 *     summary: Send notification to specific user
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent
 */
router.post('/notify/:userId', RealtimeController.notifyUser);

/**
 * @swagger
 * /realtime/task/update:
 *   post:
 *     summary: Broadcast task update
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               action:
 *                 type: string
 *               task:
 *                 type: object
 *     responses:
 *       200:
 *         description: Update broadcasted
 */
router.post('/task/update', RealtimeController.broadcastTaskUpdate);

/**
 * @swagger
 * /realtime/activity:
 *   post:
 *     summary: Broadcast activity to feed
 *     tags: [Realtime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               action:
 *                 type: string
 *               target:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity broadcasted
 */
router.post('/activity', RealtimeController.broadcastActivity);

export default router;
