
import express, { Application, Request, Response, NextFunction } from 'express';

import routes from './routes';
import logger from './utils/logger';
import { SERVER_CONFIG, CORS_CONFIG } from './config/server';
import { initializeDatabase } from './database/init';
import { notFoundHandler } from './middleware/error.middleware';
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
  }

  // Request → Middleware 1 → Middleware 2 → Route → Response
  
private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
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
    
    // next = Sonraki middleware (kullanılmıyor ama gerekli)
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
      logger.info('═══════════════════════════════════════');
      logger.info('🚀 DevTracker Server Started!');
      logger.info('═══════════════════════════════════════');
      logger.info(`📍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
      logger.info(`🌐 Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      logger.info(`📡 API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      logger.info(`💚 Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
      logger.info('═══════════════════════════════════════');
    });
  }
}
const app = new App();
app.listen();
export default app;