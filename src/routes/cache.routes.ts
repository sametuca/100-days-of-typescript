// Day 48: Cache Management Routes

import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All cache management routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', CacheController.getStats);

/**
 * @swagger
 * /cache/health:
 *   get:
 *     summary: Get cache health status
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache health status retrieved successfully
 */
router.get('/health', CacheController.getHealth);

/**
 * @swagger
 * /cache/keys:
 *   get:
 *     summary: Get all cache keys
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache keys retrieved successfully
 */
router.get('/keys', CacheController.getKeys);

/**
 * @swagger
 * /cache/warm:
 *   post:
 *     summary: Warm cache with predefined data
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache warmed successfully
 */
router.post('/warm', CacheController.warmCache);

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Clear all cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.delete('/clear', CacheController.clearAll);

/**
 * @swagger
 * /cache/pattern/{pattern}:
 *   delete:
 *     summary: Clear cache by pattern
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Pattern to match cache keys (supports wildcards)
 *     responses:
 *       200:
 *         description: Cache cleared for pattern
 */
router.delete('/pattern/:pattern', CacheController.clearPattern);

/**
 * @swagger
 * /cache/key/{key}:
 *   delete:
 *     summary: Delete specific cache key
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key to delete
 *     responses:
 *       200:
 *         description: Cache key deleted successfully
 */
router.delete('/key/:key', CacheController.deleteKey);

export default router;
