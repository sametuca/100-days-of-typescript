import { Router } from 'express';
import { TestingController } from '../controllers/testing.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

router.use(authMiddleware.authenticate);

const testingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many testing requests, please try again later'
});

/**
 * @swagger
 * /api/testing/generate:
 *   post:
 *     summary: Generate tests for code
 *     tags: [Testing]
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
 *               language:
 *                 type: string
 *                 default: javascript
 *               fileName:
 *                 type: string
 *               testType:
 *                 type: string
 *                 enum: [unit, integration, e2e]
 *                 default: unit
 *               framework:
 *                 type: string
 *                 enum: [jest, mocha, vitest]
 *                 default: jest
 *     responses:
 *       200:
 *         description: Tests generated successfully
 */
router.post('/generate', testingRateLimit, TestingController.generateTests);

/**
 * @swagger
 * /api/testing/generate/bulk:
 *   post:
 *     summary: Generate tests for multiple files
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requests
 *             properties:
 *               requests:
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
 *                     testType:
 *                       type: string
 *                     framework:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk tests generated successfully
 */
router.post('/generate/bulk', testingRateLimit, TestingController.generateBulkTests);

/**
 * @swagger
 * /api/testing/generate/integration:
 *   post:
 *     summary: Generate integration tests
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoints
 *             properties:
 *               endpoints:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["GET /api/tasks", "POST /api/tasks"]
 *     responses:
 *       200:
 *         description: Integration tests generated
 */
router.post('/generate/integration', TestingController.generateIntegrationTests);

/**
 * @swagger
 * /api/testing/generate/e2e:
 *   post:
 *     summary: Generate E2E tests
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userStories
 *             properties:
 *               userStories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["User can create a task", "User can edit a task"]
 *     responses:
 *       200:
 *         description: E2E tests generated
 */
router.post('/generate/e2e', TestingController.generateE2ETests);

/**
 * @swagger
 * /api/testing/coverage:
 *   get:
 *     summary: Analyze code coverage
 *     tags: [Testing]
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
 *         description: Coverage report generated
 */
router.get('/coverage', TestingController.analyzeCoverage);

/**
 * @swagger
 * /api/testing/coverage/history:
 *   get:
 *     summary: Get coverage history
 *     tags: [Testing]
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
 *         description: Coverage history retrieved
 */
router.get('/coverage/history', TestingController.getCoverageHistory);

/**
 * @swagger
 * /api/testing/coverage/trend:
 *   get:
 *     summary: Get coverage trend
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days for trend analysis
 *     responses:
 *       200:
 *         description: Coverage trend data
 */
router.get('/coverage/trend', TestingController.getCoverageTrend);

/**
 * @swagger
 * /api/testing/quality-gates:
 *   post:
 *     summary: Create quality gate
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rules
 *             properties:
 *               name:
 *                 type: string
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     metric:
 *                       type: string
 *                       enum: [coverage, complexity, duplications, security, maintainability]
 *                     operator:
 *                       type: string
 *                       enum: [gt, gte, lt, lte, eq]
 *                     threshold:
 *                       type: number
 *                     severity:
 *                       type: string
 *                       enum: [blocker, critical, major, minor, info]
 *               projectId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quality gate created
 */
router.post('/quality-gates', TestingController.createQualityGate);

/**
 * @swagger
 * /api/testing/quality-gates:
 *   get:
 *     summary: Get all quality gates
 *     tags: [Testing]
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
 *         description: Quality gates retrieved
 */
router.get('/quality-gates', TestingController.getQualityGates);

/**
 * @swagger
 * /api/testing/quality-gates/default:
 *   get:
 *     summary: Get default quality gate
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default quality gate created
 */
router.get('/quality-gates/default', TestingController.getDefaultQualityGate);

/**
 * @swagger
 * /api/testing/quality-gates/{gateId}/evaluate:
 *   post:
 *     summary: Evaluate quality gate
 *     tags: [Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quality gate ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: number
 *         description: Project ID for evaluation
 *     responses:
 *       200:
 *         description: Quality gate evaluation completed
 */
router.post('/quality-gates/:gateId/evaluate', TestingController.evaluateQualityGate);

export default router;