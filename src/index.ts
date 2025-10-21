// ============================================
// MAIN APPLICATION FILE
// ============================================
// Bu dosya uygulamanın beyni, her şey buradan başlar

// Express framework'ünü import et
// Application = Express app'inin tipi
// Request, Response, NextFunction = Middleware'lerde kullanılacak tipler
import express, { Application, Request, Response, NextFunction } from 'express';

// Az önce oluşturduğumuz routes'ları import et
import routes from './routes';

// Config dosyasından ayarları import et
import { SERVER_CONFIG, CORS_CONFIG } from './config/server';

// ============================================
// APP CLASS - UYGULAMA SINIFI
// ============================================
// Class = Nesne şablonu (obje oluşturmak için)
class App {
  // ==========================================
  // CLASS PROPERTIES - SINIF ÖZELLİKLERİ
  // ==========================================
  
  // public = Dışarıdan erişilebilir
  // app: Application = Express uygulaması, tipi Application
  public app: Application;
  
  // private = Sadece bu class içinden erişilebilir
  // port = Sunucunun çalışacağı port (3000 gibi)
  // number | string = ya sayı ya da string olabilir
  private port: number | string;

  // ==========================================
  // CONSTRUCTOR - KURUCU METHOD
  // ==========================================
  // new App() dediğimizde otomatik çalışır
  // Uygulama başlatılırken yapılacak işlemler
  constructor() {
    // express() = Yeni bir Express uygulaması oluştur
    this.app = express();
    
    // Port numarasını config'den al
    this.port = SERVER_CONFIG.PORT;

    // Sırayla başlatma methodlarını çağır
    // 1. Önce middleware'leri başlat
    this.initializeMiddlewares();
    
    // 2. Sonra route'ları başlat
    this.initializeRoutes();
    
    // 3. En son error handling'i başlat
    this.initializeErrorHandling();
  }

  // ==========================================
  // INITIALIZE MIDDLEWARES
  // ==========================================
  // Middleware = İstek geldiğinde çalışan ara katman
  // Request → Middleware 1 → Middleware 2 → Route → Response
  
  private initializeMiddlewares(): void {
    
    // ------------------------------------------
    // 1. JSON PARSER MIDDLEWARE
    // ------------------------------------------
    // express.json() = Gelen request body'sini JSON olarak parse et
    // Örnek: { "name": "Ali" } → JavaScript objesi
    // Kullanım: req.body ile erişebiliriz
    this.app.use(express.json());
    
    // ------------------------------------------
    // 2. URL ENCODED PARSER
    // ------------------------------------------
    // Form data'sını parse et
    // extended: true = Nested objeler desteklenir
    this.app.use(express.urlencoded({ extended: true }));

    // ------------------------------------------
    // 3. CORS MIDDLEWARE
    // ------------------------------------------
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

    // ------------------------------------------
    // 4. LOGGER MIDDLEWARE
    // ------------------------------------------
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
    
    // ------------------------------------------
    // 1. API ROUTES
    // ------------------------------------------
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
      // 404 = Not Found (Sayfa bulunamadı)
      res.status(404).json({
        success: false,
        message: 'Route not found',
        // req.originalUrl = Kullanıcının girdiği tam URL
        path: req.originalUrl
      });
    });
  }

  // ==========================================
  // INITIALIZE ERROR HANDLING
  // ==========================================
  // Hata yakalandığında ne yapılacak?
  
  private initializeErrorHandling(): void {
    
    // 4 parametreli middleware = Error handler
    // err = Yakalanan hata objesi
    // req = İstek bilgisi
    // res = Cevap objesi
    // next = Sonraki middleware (kullanılmıyor ama gerekli)
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      
      // Hatayı console'a yazdır
      // err.message = Hatanın açıklaması
      console.error('Error:', err.message);
      
      // 500 = Internal Server Error (Sunucu hatası)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        
        // Development'taysa hatanın detayını göster
        // Production'daysa güvenlik için gösterme
        // ? : = Ternary operator (şart ? doğruysa : yanlışsa)
        error: SERVER_CONFIG.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  // ==========================================
  // LISTEN - SUNUCUYU BAŞLAT
  // ==========================================
  // Sunucuyu dinlemeye başla
  
  public listen(): void {
    
    // this.app.listen() = Express sunucusunu başlat
    // this.port = Port numarası (3000)
    // () => { ... } = Arrow function, sunucu başladığında çalışır
    this.app.listen(this.port, () => {
      
      // Console'a güzel bir başlangıç mesajı yazdır
      console.log('═══════════════════════════════════════');
      console.log('🚀 DevTracker Server Started!');
      console.log('═══════════════════════════════════════');
      
      // Çalışma ortamını göster (development/production)
      console.log(`📍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
      
      // Ana server URL'i
      console.log(`🌐 Server: http://${SERVER_CONFIG.HOST}:${this.port}`);
      
      // API base URL'i
      console.log(`📡 API: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}`);
      
      // Health check URL'i (sunucu çalışıyor mu?)
      console.log(`💚 Health: http://${SERVER_CONFIG.HOST}:${this.port}${SERVER_CONFIG.API_PREFIX}/health`);
      
      console.log('═══════════════════════════════════════');
    });
  }
}

// ============================================
// APPLICATION START - UYGULAMAYI BAŞLAT
// ============================================

// new App() = App class'ından yeni bir obje oluştur
// Bu satır çalışınca constructor() çalışır
const app = new App();

// app.listen() = Sunucuyu dinlemeye başla
// Artık sunucu istekleri kabul ediyor
app.listen();

// app objesini dışa aktar
// Testlerde veya başka dosyalarda kullanabiliriz
export default app;