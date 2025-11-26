import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/performance/metrics:
 *   get:
 *     summary: Get system performance metrics
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minutes
 *         schema:
 *           type: number
 *           default: 60
 *         description: Time range in minutes
 *     responses:
 *       200:
 *         description: Performance metrics retrieved
 */
router.get('/metrics', PerformanceController.getMetrics);

/**
 * @swagger
 * /api/performance/api:
 *   get:
 *     summary: Get API performance data
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: endpoint
 *         schema:
 *           type: string
 *         description: Specific endpoint to analyze
 *       - in: query
 *         name: minutes
 *         schema:
 *           type: number
 *           default: 60
 *         description: Time range in minutes
 *     responses:
 *       200:
 *         description: API performance data retrieved
 */
router.get('/api', PerformanceController.getAPIPerformance);

/**
 * @swagger
 * /api/performance/bottlenecks/detect:
 *   post:
 *     summary: Detect performance bottlenecks
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bottleneck detection completed
 */
router.post('/bottlenecks/detect', PerformanceController.detectBottlenecks);

/**
 * @swagger
 * /api/performance/alerts:
 *   get:
 *     summary: Get active performance alerts
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active alerts retrieved
 */
router.get('/alerts', PerformanceController.getActiveAlerts);

/**
 * @swagger
 * /api/performance/optimizations/generate:
 *   post:
 *     summary: Generate optimization suggestions
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Optimization suggestions generated
 */
router.post('/optimizations/generate', PerformanceController.generateOptimizations);

/**
 * @swagger
 * /api/performance/optimizations:
 *   get:
 *     summary: Get optimization suggestions
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [query, caching, code, infrastructure]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Optimization suggestions retrieved
 */
router.get('/optimizations', PerformanceController.getOptimizations);

/**
 * @swagger
 * /api/performance/report:
 *   get:
 *     summary: Generate performance report
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *           default: 24
 *         description: Report time range in hours
 *     responses:
 *       200:
 *         description: Performance report generated
 */
router.get('/report', PerformanceController.generateReport);

export default router;