import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import taskRoutes from './task.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import commentRoutes from './comment.routes';
import subtaskRoutes from './subtask.routes';
import metricsRoutes from './metrics.routes';
import searchRoutes from './search.routes';
import analysisRoutes from './analysis.routes';
import testingRoutes from './testing.routes';
import performanceRoutes from './performance.routes';
import securityRoutes from './security.routes';
import { apiLimiter } from '../middleware/rate-limit.middleware';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import workflowRuleRoutes from './workflow-rule.routes';
import graphqlRoutes from './graphql.routes';
import { apiGateway, serviceDiscovery } from '../microservices';
import benchmarkRoutes from './benchmark.routes';
import migrationRoutes from './migration.routes';
import versionRoutes from './version.routes';
import backupRoutes from './backup.routes';
import cacheRoutes from './cache.routes';
import gatewayRoutes from './gateway.routes';
import mlRoutes from './ml.routes';
import realtimeRoutes from './realtime.routes';
import v1Routes from './v1';
import v2Routes from './v2';
import { versionMiddleware } from '../versioning/version-manager';
const router = Router();

router.get('/', HealthController.getRoot);
router.get('/health', HealthController.getHealth);
router.get('/health/container', HealthController.getContainerHealth);
router.get('/health/ready', HealthController.getReadiness);
router.get('/deployment', HealthController.getDeploymentInfo);
router.get('/admin/jobs', authenticate, authorize(UserRole.ADMIN), AdminController.getJobsStatus);
router.use(apiLimiter);

router.use('/tasks', taskRoutes);
router.use('/workflow/rules', workflowRuleRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/comments', commentRoutes);
router.use('/subtasks', subtaskRoutes);
router.use('/search', searchRoutes);
router.use('/analysis', analysisRoutes);
router.use('/testing', testingRoutes);
router.use('/performance', performanceRoutes);
router.use('/security', securityRoutes);
router.use('/', metricsRoutes);
router.use('/', graphqlRoutes);
router.use('/gateway', apiGateway);
router.use('/discovery', serviceDiscovery);
router.use('/', benchmarkRoutes);
router.use('/', migrationRoutes);
router.use('/', versionRoutes);
router.use('/backup', backupRoutes);
router.use('/cache', cacheRoutes);
router.use('/gateway-admin', gatewayRoutes);
router.use('/ml', mlRoutes); // Day 51: Machine Learning routes
router.use('/realtime', realtimeRoutes); // Day 52: Real-time collaboration routes

// Versioned routes
router.use(versionMiddleware);
router.use('/v1', v1Routes);
router.use('/v2', v2Routes);

export default router;