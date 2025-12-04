import { Router, Request, Response } from 'express';
import { serviceClient } from './service-client';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();

// API Gateway routes
router.use('/users/*', authenticate, async (req: Request, res: Response) => {
  try {
    const endpoint = req.path.replace('/users', '');
    const result = await serviceClient.getUserService(endpoint, req.body, req.method as any);
    res.json(result);
  } catch (error: any) {
    logger.error('Gateway error - users:', error.message);
    res.status(500).json({ error: 'Service unavailable' });
  }
});

router.use('/tasks/*', authenticate, async (req: Request, res: Response) => {
  try {
    const endpoint = req.path.replace('/tasks', '');
    const result = await serviceClient.getTaskService(endpoint, req.body, req.method as any);
    res.json(result);
  } catch (error: any) {
    logger.error('Gateway error - tasks:', error.message);
    res.status(500).json({ error: 'Service unavailable' });
  }
});

router.use('/notifications/*', authenticate, async (req: Request, res: Response) => {
  try {
    const endpoint = req.path.replace('/notifications', '');
    const result = await serviceClient.getNotificationService(endpoint, req.body, req.method as any);
    res.json(result);
  } catch (error: any) {
    logger.error('Gateway error - notifications:', error.message);
    res.status(500).json({ error: 'Service unavailable' });
  }
});

// Health check for all services
router.get('/health/services', async (_req: Request, res: Response) => {
  try {
    const services = await Promise.allSettled([
      serviceClient.getUserService('/health').catch(() => ({ status: 'down' })),
      serviceClient.getTaskService('/health').catch(() => ({ status: 'down' })),
      serviceClient.getNotificationService('/health').catch(() => ({ status: 'down' }))
    ]);

    const healthStatus = {
      gateway: 'up',
      services: {
        users: services[0].status === 'fulfilled' ? 'up' : 'down',
        tasks: services[1].status === 'fulfilled' ? 'up' : 'down',
        notifications: services[2].status === 'fulfilled' ? 'up' : 'down'
      }
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

export default router;