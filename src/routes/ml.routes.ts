import { Router } from 'express';
import { MLController } from '../controllers/ml.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Day 51: ML/AI Routes
 * Machine Learning and AI-powered features
 */

const router = Router();

// All ML routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /ml/predict-completion:
 *   post:
 *     summary: Predict task completion time
 *     tags: [ML/AI]
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
 *     responses:
 *       200:
 *         description: Prediction successful
 */
router.post('/predict-completion', MLController.predictCompletion);

/**
 * @swagger
 * /ml/prioritize:
 *   get:
 *     summary: Get smart task prioritization
 *     tags: [ML/AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks prioritized
 */
router.get('/prioritize', MLController.prioritizeTasks);

/**
 * @swagger
 * /ml/detect-anomalies:
 *   get:
 *     summary: Detect anomalies in tasks
 *     tags: [ML/AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anomalies detected
 */
router.get('/detect-anomalies', MLController.detectAnomalies);

/**
 * @swagger
 * /ml/recommend:
 *   get:
 *     summary: Get task recommendations
 *     tags: [ML/AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommendations generated
 */
router.get('/recommend', MLController.recommendTasks);

/**
 * @swagger
 * /ml/sentiment:
 *   post:
 *     summary: Analyze sentiment of text
 *     tags: [ML/AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               taskId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sentiment analyzed
 */
router.post('/sentiment', MLController.analyzeSentiment);

/**
 * @swagger
 * /ml/insights:
 *   get:
 *     summary: Get comprehensive ML insights
 *     tags: [ML/AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ML insights generated
 */
router.get('/insights', MLController.getMLInsights);

export default router;
