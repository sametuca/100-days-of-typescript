import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import taskRoutes from './task.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
const router = Router();

router.get('/', HealthController.getRoot);

router.get('/health', HealthController.getHealth);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/auth', authRoutes);
export default router;