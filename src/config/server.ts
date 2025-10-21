// ============================================
// SERVER CONFIGURATION
// ============================================
// Bu dosya sunucu ayarlarını tutar
// Tüm config değerleri tek bir yerden yönetilir

// process.env = Çevre değişkenleri (environment variables)
// || = VEYA operatörü (eğer yoksa default değeri kullan)
// as const = Bu obje sabit, değiştirilemez demek

export const SERVER_CONFIG = {
  // PORT: Sunucunun çalışacağı port numarası
  // Önce çevre değişkenine bak, yoksa 3000 kullan
  PORT: process.env.PORT || 3000,
  
  // HOST: Sunucunun çalışacağı adres
  // localhost = sadece bu bilgisayardan erişilebilir
  HOST: process.env.HOST || 'localhost',
  
  // NODE_ENV: Çalışma ortamı (development, production, test)
  // Development = geliştirme, Production = canlı sistem
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API_PREFIX: Tüm API endpoint'lerinin başına eklenecek prefix
  // Örnek: /api/v1/health, /api/v1/tasks
  API_PREFIX: '/api/v1'
} as const;

// CORS = Cross-Origin Resource Sharing
// Farklı domain'lerden gelen isteklere izin verme ayarları
export const CORS_CONFIG = {
  // origin: Hangi domain'lerden istek kabul edileceği
  // '*' = herkesten kabul et (development için)
  origin: process.env.CORS_ORIGIN || '*',
  
  // credentials: Cookie ve authentication bilgilerini kabul et
  credentials: true
};