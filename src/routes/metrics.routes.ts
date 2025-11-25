// Day 26: Metrics Routes

import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Admin only routes for metrics
router.get('/metrics', authMiddleware, metricsController.getMetrics);
router.get('/metrics/:name', authMiddleware, metricsController.getMetricSummary);
router.get('/health', metricsController.getHealthMetrics);

export default router;