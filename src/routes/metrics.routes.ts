// Day 26: Metrics Routes

import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { CacheController } from '../controllers/cache.controller';
import { SecurityController } from '../controllers/security.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/metrics', authMiddleware.authenticate, metricsController.getMetrics);
router.get('/metrics/:name', authMiddleware.authenticate, metricsController.getMetricSummary);
router.get('/health', metricsController.getHealthMetrics);

router.get('/cache/stats', authMiddleware.authenticate, CacheController.getStats);
router.delete('/cache/clear', authMiddleware.authenticate, CacheController.clearAll);
router.delete('/cache/clear/:pattern', authMiddleware.authenticate, CacheController.clearPattern);

router.get('/security/stats', authMiddleware.authenticate, SecurityController.getStats);
router.delete('/security/unblock/:ip', authMiddleware.authenticate, SecurityController.unblockIP);

export default router;