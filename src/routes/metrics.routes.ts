// Day 26: Metrics Routes

import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { CacheController } from '../controllers/cache.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Admin only routes for metrics
router.get('/metrics', authMiddleware, metricsController.getMetrics);
router.get('/metrics/:name', authMiddleware, metricsController.getMetricSummary);
router.get('/health', metricsController.getHealthMetrics);

// Day 28: Cache management routes
router.get('/cache/stats', authMiddleware, CacheController.getStats);
router.delete('/cache/clear', authMiddleware, CacheController.clearAll);
router.delete('/cache/clear/:pattern', authMiddleware, CacheController.clearPattern);

export default router;