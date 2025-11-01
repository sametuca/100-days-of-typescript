// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
// Environment variables'ı yükler ve validate eder

// dotenv'i import et ve hemen çalıştır
// config() = .env dosyasını okur ve process.env'e yükler
import dotenv from 'dotenv';
dotenv.config();

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// ------------------------------------------
// GET ENV VARIABLE
// ------------------------------------------
// Zorunlu environment variable al
// Yoksa hata fırlat

function getEnv(key: string, defaultValue?: string): string {
  // process.env[key] = Environment variable'ı oku
  const value = process.env[key];
  
  // Değer yoksa
  if (value === undefined) {
    // Default value varsa onu kullan
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    // Default value da yoksa hata fırlat
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
}

// ------------------------------------------
// GET NUMBER ENV
// ------------------------------------------
// Sayı olarak environment variable al

function getNumberEnv(key: string, defaultValue?: number): number {
  const value = process.env[key];
  
  // Değer yoksa default kullan
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  // String'i number'a çevir
  // parseInt(value, 10) = 10 tabanında integer'a çevir
  const numValue = parseInt(value, 10);
  
  // NaN kontrolü (Not a Number)
  // isNaN() = Sayı değilse true
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  
  return numValue;
}

// ------------------------------------------
// GET BOOLEAN ENV
// ------------------------------------------
// Boolean olarak environment variable al

function getBooleanEnv(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  // String'i boolean'a çevir
  // 'true', '1', 'yes' → true
  // 'false', '0', 'no' → false
  return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
}

// ==========================================
// ENVIRONMENT CONFIG OBJECT
// ==========================================
// Tüm config değerlerini içeren obje

export const config = {
  
  // ------------------------------------------
  // APPLICATION
  // ------------------------------------------
  app: {
    // NODE_ENV = development | production | test
    env: getEnv('NODE_ENV', 'development'),
    
    // isDevelopment, isProduction, isTest = Kolay kontrol için
    isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
    isProduction: getEnv('NODE_ENV', 'development') === 'production',
    isTest: getEnv('NODE_ENV', 'development') === 'test',
    
    // name = Uygulama adı
    name: getEnv('APP_NAME', 'DevTracker'),
    
    // version = Versiyon
    version: getEnv('APP_VERSION', '1.0.0')
  },
  
  // ------------------------------------------
  // SERVER
  // ------------------------------------------
  server: {
    // port = Sunucu port numarası
    port: getNumberEnv('PORT', 3000),
    
    // host = Sunucu adresi
    host: getEnv('HOST', 'localhost'),
    
    // apiPrefix = API route prefix
    apiPrefix: getEnv('API_PREFIX', '/api/v1')
  },
  
  // ------------------------------------------
  // DATABASE
  // ------------------------------------------
  database: {
    // path = SQLite database dosyası
    path: getEnv('DB_PATH', './data/devtracker.db'),
    
    // verbose = SQL query'leri logla
    verbose: getBooleanEnv('DB_VERBOSE', false)
  },
  
  // ------------------------------------------
  // CORS
  // ------------------------------------------
  cors: {
    // origin = Hangi origin'lerden istek kabul edilir
    origin: getEnv('CORS_ORIGIN', '*'),
    
    // credentials = Cookie gönderilsin mi?
    credentials: true
  },
  
  // ------------------------------------------
  // LOGGING
  // ------------------------------------------
  logging: {
    // level = Log seviyesi
    level: getEnv('LOG_LEVEL', 'debug'),
    
    // dir = Log dosyaları klasörü
    dir: getEnv('LOG_DIR', './logs')
  },
  
  // ------------------------------------------
  // JWT (İleride kullanılacak)
  // ------------------------------------------
  jwt: {
    // secret = JWT secret key
    secret: getEnv('JWT_SECRET', 'change-this-secret'),
    
    // expiresIn = Token süresi
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    
    // refreshSecret = Refresh token secret
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'change-this-refresh-secret'),
    
    // refreshExpiresIn = Refresh token süresi
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d')
  },
  
  // ------------------------------------------
  // SECURITY
  // ------------------------------------------
  security: {
    // bcryptRounds = Password hash round sayısı
    bcryptRounds: getNumberEnv('BCRYPT_ROUNDS', 10),
    
    // rateLimit = Rate limiting ayarları
    rateLimit: {
      // windowMs = Zaman penceresi (ms)
      windowMs: getNumberEnv('RATE_LIMIT_WINDOW', 900000), // 15 dakika
      
      // max = Maksimum istek sayısı
      max: getNumberEnv('RATE_LIMIT_MAX', 100)
    }
  },
  
  // ------------------------------------------
  // FEATURES
  // ------------------------------------------
  features: {
    // enableApiDocs = API dokümantasyonu aktif mi?
    enableApiDocs: getBooleanEnv('ENABLE_API_DOCS', true),
    
    // enableSwagger = Swagger UI aktif mi?
    enableSwagger: getBooleanEnv('ENABLE_SWAGGER', true)
  },
  
  // ------------------------------------------
  // EMAIL (İleride kullanılacak)
  // ------------------------------------------
  email: {
    // host = SMTP server
    host: getEnv('EMAIL_HOST', 'smtp.gmail.com'),
    
    // port = SMTP port
    port: getNumberEnv('EMAIL_PORT', 587),
    
    // user = SMTP kullanıcı adı
    user: getEnv('EMAIL_USER', ''),
    
    // password = SMTP şifresi
    password: getEnv('EMAIL_PASSWORD', ''),
    
    // from = Gönderen email adresi
    from: getEnv('EMAIL_FROM', 'noreply@devtracker.com')
  }
};

// ==========================================
// VALIDATE CONFIGURATION
// ==========================================
// Config'in geçerli olduğunu kontrol et

export function validateConfig(): void {
  console.log('🔍 Validating configuration...');
  
  // Production'daysa kritik kontroller yap
  if (config.app.isProduction) {
    
    // JWT secret kontrolü
    if (config.jwt.secret === 'change-this-secret') {
      throw new Error('JWT_SECRET must be changed in production!');
    }
    
    // Refresh secret kontrolü
    if (config.jwt.refreshSecret === 'change-this-refresh-secret') {
      throw new Error('JWT_REFRESH_SECRET must be changed in production!');
    }
    
    // CORS kontrolü
    if (config.cors.origin === '*') {
      console.warn('⚠️  Warning: CORS_ORIGIN is set to * in production. Consider restricting it.');
    }
  }
  
  console.log('✅ Configuration validated');
}

// ==========================================
// PRINT CONFIGURATION (DEBUG)
// ==========================================
// Config'i console'a yazdır (development için)

export function printConfig(): void {
  // Sadece development'ta yazdır
  if (!config.app.isDevelopment) {
    return;
  }
  
  console.log('\n📋 Configuration:');
  console.log('─────────────────────────────────────');
  console.log(`Environment: ${config.app.env}`);
  console.log(`App Name: ${config.app.name}`);
  console.log(`Version: ${config.app.version}`);
  console.log(`Port: ${config.server.port}`);
  console.log(`Host: ${config.server.host}`);
  console.log(`API Prefix: ${config.server.apiPrefix}`);
  console.log(`Database: ${config.database.path}`);
  console.log(`Log Level: ${config.logging.level}`);
  console.log(`CORS Origin: ${config.cors.origin}`);
  console.log('─────────────────────────────────────\n');
}

// Export config as default
export default config;