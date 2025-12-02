
import express, { Application, Request, Response, NextFunction } from 'express';

import routes from './routes';
import logger from './utils/logger';
import { SERVER_CONFIG, CORS_CONFIG } from './config/server';
import { initializeDatabase } from './database/init';
import { notFoundHandler } from './middleware/error.middleware';
import config, { validateConfig, printConfig } from './config/env';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rate-limit.middleware';
import { addSecurityHeaders, sanitizeInput, preventParameterPollution } from './middleware/security.middleware';
import { requestId } from './middleware/request-id.middleware';
import path from 'path';
import { initializeJobs } from './jobs';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { WebSocketService} from './services/websocket.service';

validateConfig();
printConfig();

class App {
  public app: Application;
  private server: any;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = SERVER_CONFIG.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDatabase();
    initializeJobs();
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
    
    // ============================================
    // STANDARD MIDDLEWARES
    // ============================================
     this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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
        // ============================================
    // SWAGGER DOCUMENTATION - YENİ
    // ============================================
    if (config.features.enableSwagger) {
      this.app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'DevTracker API Documentation'
        })
      );
      
      // Swagger JSON
      this.app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
      
      logger.info('📚 Swagger documentation available at /api-docs');
    }

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
    this.server = createServer(this.app);
    
    // Day 27: Initialize WebSocket
    const webSocketService = new WebSocketService(this.server);
    (global as any).webSocketService = webSocketService;
    
    this.server.listen(this.port, () => {
      logger.info('DevTracker Server Started!');
      logger.info(`Environment: ${SERVER_CONFIG.NODE_ENV}`);
      logger.info(`Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      logger.info(`API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      logger.info(`Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
      logger.info('🔌 WebSocket server initialized');
    });
  }
}
const app = new App();
app.listen();
export default app;