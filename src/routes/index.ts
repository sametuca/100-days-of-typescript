import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import taskRoutes from './task.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import { apiLimiter } from '../middleware/rate-limit.middleware';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/', HealthController.getRoot);
router.get('/health', HealthController.getHealth);
router.get('/admin/jobs', authenticate, authorize(UserRole.ADMIN), AdminController.getJobsStatus);
router.use(apiLimiter);

router.use('/tasks', taskRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);

export default router;