// Day 49: Gateway Management Routes

import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All gateway management routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

/**
 * @swagger
 * /gateway/routes:
 *   get:
 *     summary: Get all configured gateway routes
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gateway routes retrieved successfully
 */
router.get('/routes', GatewayController.getRoutes);

/**
 * @swagger
 * /gateway/health:
 *   get:
 *     summary: Get gateway health status
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gateway health status retrieved
 */
router.get('/health', GatewayController.getHealth);

/**
 * @swagger
 * /gateway/metrics:
 *   get:
 *     summary: Get gateway metrics
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gateway metrics retrieved
 */
router.get('/metrics', GatewayController.getMetrics);

/**
 * @swagger
 * /gateway/circuit-breakers:
 *   get:
 *     summary: Get circuit breaker status for all services
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Circuit breaker status retrieved
 */
router.get('/circuit-breakers', GatewayController.getCircuitBreakers);

/**
 * @swagger
 * /gateway/circuit-breakers/{serviceName}/reset:
 *   post:
 *     summary: Reset circuit breaker for a specific service
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Circuit breaker reset successfully
 */
router.post('/circuit-breakers/:serviceName/reset', GatewayController.resetCircuitBreaker);

/**
 * @swagger
 * /gateway/circuit-breakers/reset-all:
 *   post:
 *     summary: Reset all circuit breakers
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All circuit breakers reset
 */
router.post('/circuit-breakers/reset-all', GatewayController.resetAllCircuitBreakers);

/**
 * @swagger
 * /gateway/load-balancers:
 *   get:
 *     summary: Get load balancer statistics
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Load balancer statistics retrieved
 */
router.get('/load-balancers', GatewayController.getLoadBalancerStats);

/**
 * @swagger
 * /gateway/load-balancers/{serviceName}/{algorithm}/reset:
 *   post:
 *     summary: Reset load balancer for a specific service
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: algorithm
 *         required: true
 *         schema:
 *           type: string
 *           enum: [round-robin, least-connections, random]
 *     responses:
 *       200:
 *         description: Load balancer reset successfully
 */
router.post('/load-balancers/:serviceName/:algorithm/reset', GatewayController.resetLoadBalancer);

/**
 * @swagger
 * /gateway/load-balancers/reset-all:
 *   post:
 *     summary: Reset all load balancers
 *     tags: [Gateway]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All load balancers reset
 */
router.post('/load-balancers/reset-all', GatewayController.resetAllLoadBalancers);

export default router;
