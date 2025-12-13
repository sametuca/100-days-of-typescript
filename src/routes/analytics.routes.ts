/**
 * Day 54: Analytics Routes
 * 
 * API routes for Advanced Analytics & Business Intelligence
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Advanced Analytics & Business Intelligence endpoints
 */

/**
 * @swagger
 * /api/v1/analytics/kpi:
 *   get:
 *     summary: Get comprehensive KPI metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analysis
 *     responses:
 *       200:
 *         description: KPI metrics retrieved successfully
 */
router.get('/kpi', authenticate, (req, res) => analyticsController.getKPIMetrics(req, res));

/**
 * @swagger
 * /api/v1/analytics/trends/{metric}:
 *   get:
 *     summary: Analyze trends for a specific metric
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: [completions, creations, velocity, productivity]
 *         description: Metric to analyze
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
 */
router.get('/trends/:metric', authenticate, (req, res) => analyticsController.analyzeTrend(req, res));

/**
 * @swagger
 * /api/v1/analytics/trends:
 *   get:
 *     summary: Get multiple trend analyses
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metrics
 *         schema:
 *           type: string
 *         description: Comma-separated list of metrics
 *     responses:
 *       200:
 *         description: Multiple trends retrieved successfully
 */
router.get('/trends', authenticate, (req, res) => analyticsController.getMultipleTrends(req, res));

/**
 * @swagger
 * /api/v1/analytics/me:
 *   get:
 *     summary: Get analytics for current user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/me', authenticate, (req, res) => analyticsController.getMyAnalytics(req, res));

/**
 * @swagger
 * /api/v1/analytics/users/{userId}:
 *   get:
 *     summary: Get detailed analytics for a specific user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to analyze
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/users/:userId', authenticate, authorize('ADMIN', 'MODERATOR'), (req, res) => analyticsController.getUserAnalytics(req, res));

/**
 * @swagger
 * /api/v1/analytics/leaderboard:
 *   get:
 *     summary: Get user leaderboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [completed, productivity, streak]
 *         description: Metric to rank by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users to return
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/leaderboard', authenticate, (req, res) => analyticsController.getLeaderboard(req, res));

/**
 * @swagger
 * /api/v1/analytics/team:
 *   get:
 *     summary: Get team-wide analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Optional team ID to filter
 *     responses:
 *       200:
 *         description: Team analytics retrieved successfully
 */
router.get('/team', authenticate, (req, res) => analyticsController.getTeamAnalytics(req, res));

/**
 * @swagger
 * /api/v1/analytics/cohorts:
 *   get:
 *     summary: Perform cohort analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [signup_week, first_task_week, custom]
 *         description: Cohort type
 *     responses:
 *       200:
 *         description: Cohort analysis completed successfully
 */
router.get('/cohorts', authenticate, (req, res) => analyticsController.analyzeCohorts(req, res));

/**
 * @swagger
 * /api/v1/analytics/funnel:
 *   get:
 *     summary: Analyze task lifecycle funnel
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Funnel analysis retrieved successfully
 */
router.get('/funnel', authenticate, (req, res) => analyticsController.analyzeTaskFunnel(req, res));

/**
 * @swagger
 * /api/v1/analytics/reports:
 *   post:
 *     summary: Generate a comprehensive report
 *     tags: [Analytics]
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
 *                 enum: [summary, detailed, executive, custom]
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               format:
 *                 type: string
 *                 enum: [json, csv, pdf]
 *     responses:
 *       200:
 *         description: Report generated successfully
 */
router.post('/reports', authenticate, (req, res) => analyticsController.generateReport(req, res));

/**
 * @swagger
 * /api/v1/analytics/reports/executive:
 *   get:
 *     summary: Generate executive summary report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Executive report generated successfully
 */
router.get('/reports/executive', authenticate, authorize('ADMIN'), (req, res) => analyticsController.getExecutiveReport(req, res));

/**
 * @swagger
 * /api/v1/analytics/charts/{chartType}:
 *   get:
 *     summary: Get chart-ready data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chartType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tasksByStatus, tasksByPriority, completionTrend, userActivity, workloadHeatmap]
 *         description: Type of chart data to retrieve
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 */
router.get('/charts/:chartType', authenticate, (req, res) => analyticsController.getChartData(req, res));

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get complete dashboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', authenticate, (req, res) => analyticsController.getDashboard(req, res));

export default router;
