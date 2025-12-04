import { serviceRegistry } from './service-registry';
import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Service registration endpoint
router.post('/register', (req: Request, res: Response) => {
  try {
    const { id, name, host, port, metadata } = req.body;
    
    if (!id || !name || !host || !port) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    serviceRegistry.register({
      id,
      name,
      host,
      port,
      health: 'healthy',
      metadata
    });

    logger.info(`Service registered via API: ${name} (${id})`);
    res.json({ success: true, message: 'Service registered' });
  } catch (error: any) {
    logger.error('Service registration failed:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Service unregistration endpoint
router.delete('/unregister/:serviceId', (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    serviceRegistry.unregister(serviceId);
    res.json({ success: true, message: 'Service unregistered' });
  } catch (error: any) {
    logger.error('Service unregistration failed:', error.message);
    res.status(500).json({ error: 'Unregistration failed' });
  }
});

// Heartbeat endpoint
router.post('/heartbeat/:serviceId', (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    serviceRegistry.updateHeartbeat(serviceId);
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Heartbeat update failed:', error.message);
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

// Service discovery endpoint
router.get('/services', (_req: Request, res: Response) => {
  try {
    const services = serviceRegistry.getAllServices();
    res.json({ services });
  } catch (error: any) {
    logger.error('Service discovery failed:', error.message);
    res.status(500).json({ error: 'Discovery failed' });
  }
});

// Get services by name
router.get('/services/:serviceName', (req: Request, res: Response) => {
  try {
    const { serviceName } = req.params;
    const services = serviceRegistry.getServicesByName(serviceName);
    res.json({ services });
  } catch (error: any) {
    logger.error('Service lookup failed:', error.message);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

export default router;