import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import taskRoutes from './task.routes';

const router = Router();

router.get('/', HealthController.getRoot);

router.get('/health', HealthController.getHealth);

router.use('/tasks', taskRoutes);

export default router;