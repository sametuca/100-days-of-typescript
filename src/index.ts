
import express, { Application, Request, Response, NextFunction } from 'express';

import routes from './routes';
import logger from './utils/logger';
import { SERVER_CONFIG, CORS_CONFIG } from './config/server';
import { initializeDatabase } from './database/init';
import { notFoundHandler } from './middleware/error.middleware';
import { validateConfig, printConfig } from './config/env';
import { CleanupJob } from './jobs/cleanup.job';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rate-limit.middleware';
import { addSecurityHeaders, sanitizeInput, preventParameterPollution } from './middleware/security.middleware';
import { requestId } from './middleware/request-id.middleware';

validateConfig();
printConfig();

class App {
  public app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = SERVER_CONFIG.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDatabase();
    CleanupJob.start();
  }


  private initializeMiddlewares(): void {
    this.app.use(requestId);
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:']
        }
      },
      crossOriginEmbedderPolicy: false
    }));
    
    this.app.use(generalLimiter);
    this.app.use(addSecurityHeaders);
    this.app.use(sanitizeInput);
    this.app.use(preventParameterPollution);
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', CORS_CONFIG.origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }

      next();
      return undefined;
    });

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      logger.info(`[${req.method}] ${req.path}`);
      next();
      return undefined;
    });
  }

  private initializeRoutes(): void {
    this.app.use(SERVER_CONFIG.API_PREFIX, routes);
    this.app.use(notFoundHandler);
  }

  private initializeErrorHandling(): void {

    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',

        error: SERVER_CONFIG.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  private initializeDatabase(): void {
    initializeDatabase();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info('DevTracker Server Started!');
      logger.info(`Environment: ${SERVER_CONFIG.NODE_ENV}`);
      logger.info(`Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      logger.info(`API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      logger.info(`Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
    });
  }
}
const app = new App();
app.listen();
export default app;