import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import taskRoutes from './task.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { apiLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.get('/', HealthController.getRoot);
router.get('/health', HealthController.getHealth);

router.use(apiLimiter);

router.use('/tasks', taskRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;