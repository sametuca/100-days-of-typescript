
import express, { Application, Request, Response, NextFunction } from 'express';

import routes from './routes';

import { SERVER_CONFIG, CORS_CONFIG } from './config/server';

class App {
  public app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = SERVER_CONFIG.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  // Middleware = İstek geldiğinde çalışan ara katman
  // Request → Middleware 1 → Middleware 2 → Route → Response
  
  private initializeMiddlewares(): void {
    
    // express.json() = Gelen request body'sini JSON olarak parse et
    // Örnek: { "name": "Ali" } → JavaScript objesi
    // Kullanım: req.body ile erişebiliriz
    this.app.use(express.json());
    
    // Form data'sını parse et
    // extended: true = Nested objeler desteklenir
    this.app.use(express.urlencoded({ extended: true }));

    // CORS = Cross-Origin Resource Sharing
    // Farklı domain'lerden gelen isteklere izin ver
    
    // Her istek için bu middleware çalışır
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      
      // Access-Control-Allow-Origin = Hangi domain'lerden istek kabul edilir
      // '*' = Herkesten (development için, production'da değiştirilmeli)
      res.header('Access-Control-Allow-Origin', CORS_CONFIG.origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      
      // Access-Control-Allow-Headers = Hangi header'lar gönderilebilir
      // Content-Type = JSON/XML vb., Authorization = Token bilgisi
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // OPTIONS request = CORS preflight isteği
      // Browser önce OPTIONS isteği atar, izin varsa gerçek isteği yapar
      if (req.method === 'OPTIONS') {
        // 200 kodu döndür ve bitir
        res.sendStatus(200);
        return;
      }
      
      // next() = Bir sonraki middleware'e geç
      // Bunu çağırmazsak istek takılır kalır
      next();
    });

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // ==========================================
  // INITIALIZE ROUTES
  // ==========================================
  // Route'ları (yol tariflerini) tanımla
  
  private initializeRoutes(): void {
    
    // SERVER_CONFIG.API_PREFIX = '/api/v1'
    // Tüm routes'lar /api/v1 ile başlayacak
    // 
    // Örnek:
    // routes'da: router.get('/health', ...)
    // Gerçekte: GET /api/v1/health
    this.app.use(SERVER_CONFIG.API_PREFIX, routes);

    // ------------------------------------------
    // 2. 404 HANDLER - BULUNAMADI
    // ------------------------------------------
    // '*' = Her URL için geçerli (catch-all)
    // Yukarıdaki route'lardan hiçbiri eşleşmezse burası çalışır
    
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

  // Sunucuyu dinlemeye başla
  
  public listen(): void {
    
    // this.app.listen() = Express sunucusunu başlat
    // this.port = Port numarası (3000)
    // () => { ... } = Arrow function, sunucu başladığında çalışır
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