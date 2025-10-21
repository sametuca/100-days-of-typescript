// ============================================
// MAIN APPLICATION FILE
// ============================================
// Bu dosya uygulamanın beyni, her şey buradan başlar

// Express framework'ünü import et
// Application = Express app'inin tipi
// Request, Response, NextFunction = Middleware'lerde kullanılacak tipler
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
      
      // Response header'larını ayarla
      
      // Access-Control-Allow-Origin = Hangi domain'lerden istek kabul edilir
      // '*' = Herkesten (development için, production'da değiştirilmeli)
      res.header('Access-Control-Allow-Origin', CORS_CONFIG.origin);
      
      // Access-Control-Allow-Methods = Hangi HTTP methodları kabul edilir
      // GET, POST, PUT, DELETE, OPTIONS
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

    // Her gelen isteği console'a yazdır (loglama)
    
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      // Console'a şunu yazdır:
      // [2024-01-15T10:30:00.000Z] GET /api/v1/health
      
      // new Date().toISOString() = Şu anki tarih-saat
      // req.method = GET, POST, PUT, DELETE
      // req.path = /api/v1/health
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      
      // Bir sonraki middleware'e geç
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
      
      console.log('═══════════════════════════════════════');
      console.log('🚀 DevTracker Server Started!');
      console.log('═══════════════════════════════════════');
      
      console.log(`📍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
      
      console.log(`🌐 Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      
      console.log(`📡 API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      
      console.log(`💚 Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
      
      console.log('═══════════════════════════════════════');
    });
  }
}

// new App() = App class'ından yeni bir obje oluştur
// Bu satır çalışınca constructor() çalışır
const app = new App();

// app.listen() = Sunucuyu dinlemeye başla
// Artık sunucu istekleri kabul ediyor
app.listen();

// app objesini dışa aktar
export default app;