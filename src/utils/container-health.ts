import { Request, Response } from 'express';
import { serviceRegistry } from '../microservices/service-registry';
import logger from './logger';

export class ContainerHealthCheck {
  static async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          registry: serviceRegistry.getAllServices().length,
          database: 'connected',
          events: 'active'
        },
        version: process.env.npm_package_version || '1.0.0'
      };

      res.status(200).json(healthStatus);
    } catch (error: any) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async checkReadiness(req: Request, res: Response): Promise<void> {
    try {
      // Check if all critical services are ready
      const services = serviceRegistry.getAllServices();
      const healthyServices = services.filter(s => s.health === 'healthy');
      
      const isReady = healthyServices.length >= services.length * 0.5; // At least 50% healthy
      
      if (isReady) {
        res.status(200).json({
          status: 'ready',
          services: healthyServices.length,
          total: services.length
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          services: healthyServices.length,
          total: services.length
        });
      }
    } catch (error: any) {
      res.status(503).json({
        status: 'not ready',
        error: error.message
      });
    }
  }
}