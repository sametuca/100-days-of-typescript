import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceDiscoveryService } from '../services/service-discovery.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../utils/logger';

export class APIGateway {
  private app: express.Application;
  private serviceDiscovery: ServiceDiscoveryService;
  private rateLimiter: RateLimiterMemory;

  constructor() {
    this.app = express();
    this.serviceDiscovery = new ServiceDiscoveryService();
    this.rateLimiter = new RateLimiterMemory({
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(this.rateLimitMiddleware.bind(this));
    this.app.use(this.loggingMiddleware);
  }

  private async rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const key = req.ip || 'unknown';
      await this.rateLimiter.consume(key);
      next();
    } catch (error: any) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    }
  }

  private loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });

    next();
  }

  private setupRoutes(): void {
    // Task service routes
    this.app.use('/api/tasks', this.createServiceProxy('task-service', '/api/tasks'));
    
    // User service routes
    this.app.use('/api/users', this.createServiceProxy('user-service', '/api/users'));
    
    // Project service routes
    this.app.use('/api/projects', this.createServiceProxy('project-service', '/api/projects'));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Gateway metrics
    this.app.get('/metrics', async (req, res) => {
      const services = await this.getServiceStatus();
      res.json({
        gateway: 'healthy',
        services,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private createServiceProxy(serviceName: string, pathPrefix: string): express.RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const service = await this.serviceDiscovery.getServiceInstance(serviceName);
        
        if (!service) {
          res.status(503).json({ error: `Service ${serviceName} unavailable` });
          return;
        }

        const proxyOptions: Options = {
          target: `http://${service.host}:${service.port}`,
          changeOrigin: true,
          pathRewrite: {
            [`^${pathPrefix}`]: '',
          },
          onProxyReq: (proxyReq, req) => {
            // Add correlation ID
            proxyReq.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string || `${Date.now()}`);
          },
          onError: (err, req, res) => {
            logger.error(`Proxy error for ${serviceName}:`, err);
            (res as Response).status(502).json({ error: 'Bad gateway' });
          },
        };

        const proxy = createProxyMiddleware(proxyOptions);
        proxy(req, res, next);
      } catch (error: any) {
        logger.error(`Failed to proxy request to ${serviceName}:`, error);
        res.status(503).json({ error: 'Service discovery failed' });
      }
    };
  }

  private async getServiceStatus(): Promise<Record<string, any>> {
    const serviceNames = ['task-service', 'user-service', 'project-service'];
    const status: Record<string, any> = {};

    await Promise.all(
      serviceNames.map(async (name) => {
        try {
          const instances = await this.serviceDiscovery.discover(name);
          status[name] = {
            healthy: instances.length > 0,
            instances: instances.length,
          };
        } catch (error: any) {
          status[name] = {
            healthy: false,
            error: error.message,
          };
        }
      })
    );

    return status;
  }

  start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`API Gateway listening on port ${port}`);
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}
