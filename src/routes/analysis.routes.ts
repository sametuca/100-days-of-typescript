import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Apply rate limiting for analysis endpoints
const analysisRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many analysis requests, please try again later'
});

/**
 * @swagger
 * /api/analysis/code:
 *   post:
 *     summary: Analyze code quality and generate suggestions
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Source code to analyze
 *               language:
 *                 type: string
 *                 default: javascript
 *                 description: Programming language
 *               fileName:
 *                 type: string
 *                 default: untitled.js
 *                 description: File name
 *               projectId:
 *                 type: number
 *                 description: Project ID (optional)
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *       400:
 *         description: Invalid request data
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/code', analysisRateLimit, AnalysisController.analyzeCode);

/**
 * @swagger
 * /api/analysis/batch:
 *   post:
 *     summary: Analyze multiple files at once
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     language:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     projectId:
 *                       type: number
 *     responses:
 *       200:
 *         description: Batch analysis completed
 *       400:
 *         description: Invalid files array
 */
router.post('/batch', analysisRateLimit, AnalysisController.analyzeBatch);

/**
 * @swagger
 * /api/analysis/report:
 *   get:
 *     summary: Get quality analysis report
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: number
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Quality report generated
 */
router.get('/report', AnalysisController.getQualityReport);

/**
 * @swagger
 * /api/analysis/metrics:
 *   get:
 *     summary: Get overall quality metrics
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quality metrics retrieved
 */
router.get('/metrics', AnalysisController.getQualityMetrics);

/**
 * @swagger
 * /api/analysis/issues/top:
 *   get:
 *     summary: Get most common issues
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of top issues to return
 *     responses:
 *       200:
 *         description: Top issues retrieved
 */
router.get('/issues/top', AnalysisController.getTopIssues);

/**
 * @swagger
 * /api/analysis/trend/{fileName}:
 *   get:
 *     summary: Get quality trend for a specific file
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file
 *     responses:
 *       200:
 *         description: Quality trend retrieved
 *       400:
 *         description: File name is required
 */
router.get('/trend/:fileName', AnalysisController.getQualityTrend);

export default router;