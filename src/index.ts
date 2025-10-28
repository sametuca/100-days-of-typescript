
import express, { Application, Request, Response, NextFunction } from 'express';

import routes from './routes';

import { SERVER_CONFIG, CORS_CONFIG } from './config/server';
import { initializeDatabase } from './database/init';
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
    
    // express.json() = Gelen request body'sini JSON olarak parse et
    // Kullanım: req.body ile erişebiliriz
    this.app.use(express.json());
    
    // Form data'sını parse et
    // extended: true = Nested objeler desteklenir
    this.app.use(express.urlencoded({ extended: true }));

    // CORS = Cross-Origin Resource Sharing
    // Farklı domain'lerden gelen isteklere izin ver
    
    // Her istek için bu middleware çalışır
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      
      res.header('Access-Control-Allow-Origin', CORS_CONFIG.origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // OPTIONS request = CORS preflight isteği
      // Browser önce OPTIONS isteği atar, izin varsa gerçek isteği yapar
      if (req.method === 'OPTIONS') {
        // 200 kodu döndür ve bitir
        res.sendStatus(200);
        return;
      }
      
      next();
    });

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    
    // SERVER_CONFIG.API_PREFIX = '/api/v1'
    // Tüm routes'lar /api/v1 ile başlayacak
    // 
    // Örnek:
    // routes'da: router.get('/health', ...)
    // Gerçekte: GET /api/v1/health
    this.app.use(SERVER_CONFIG.API_PREFIX, routes);

    this.app.use('/', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        // req.originalUrl = Kullanıcının girdiği tam URL
        path: req.originalUrl
      });
    });
  }

  
  private initializeErrorHandling(): void {
    
    // err = Yakalanan hata objesi
    // req = İstek bilgisi
    // res = Cevap objesi
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
      
      console.log(`📍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
      
      console.log(`🌐 Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      
      console.log(`📡 API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      
      console.log(`💚 Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
    });
  }
}
const app = new App();
app.listen();
export default app;