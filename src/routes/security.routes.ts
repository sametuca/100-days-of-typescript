import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/security/scan/code:
 *   post:
 *     summary: Scan code for security vulnerabilities
 *     tags: [Security]
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
 *               - fileName
 *             properties:
 *               code:
 *                 type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Security scan completed
 */
router.post('/scan/code', SecurityController.scanCode);

/**
 * @swagger
 * /api/security/scan/dependencies:
 *   post:
 *     summary: Scan dependencies for vulnerabilities
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dependency scan completed
 */
router.post('/scan/dependencies', SecurityController.scanDependencies);

/**
 * @swagger
 * /api/security/compliance/{standard}:
 *   get:
 *     summary: Check compliance with security standard
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: standard
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gdpr, soc2]
 *         description: Compliance standard to check
 *     responses:
 *       200:
 *         description: Compliance check completed
 */
router.get('/compliance/:standard', SecurityController.checkCompliance);

/**
 * @swagger
 * /api/security/threats:
 *   get:
 *     summary: Get security threats
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *           default: 24
 *         description: Time range in hours
 *     responses:
 *       200:
 *         description: Security threats retrieved
 */
router.get('/threats', SecurityController.getThreats);

/**
 * @swagger
 * /api/security/dashboard:
 *   get:
 *     summary: Get security dashboard
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security dashboard data
 */
router.get('/dashboard', SecurityController.getSecurityDashboard);

export default router;