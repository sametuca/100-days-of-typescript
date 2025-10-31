// ============================================
// LOGGER UTILITY
// ============================================
// Winston kullanarak logging sistemi

// Winston'u import et
import winston from 'winston';

// path = Dosya yolu işlemleri
import path from 'path';

// fs = File system
import fs from 'fs';

// ==========================================
// LOG DIRECTORY
// ==========================================
// Log dosyalarının saklanacağı klasör

// __dirname = Bu dosyanın bulunduğu klasör
// ../../logs = İki üst klasör + logs
const logDir = path.join(__dirname, '../../logs');

// logs klasörü yoksa oluştur
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ==========================================
// LOG FORMATS
// ==========================================
// Log mesajlarının formatı

// Custom format = Kendi format'ımızı oluştur
const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  // level = Log seviyesi (info, error, warn, debug)
  // message = Log mesajı
  // timestamp = Tarih-saat
  // meta = Ekstra bilgiler
  
  // meta objesi boş mu kontrol et
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  
  // Format: [2024-01-15 10:30:00] INFO: Log mesajı {meta}
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
});

// ==========================================
// LOGGER INSTANCE
// ==========================================
// Winston logger oluştur

const logger = winston.createLogger({
  // level = En düşük log seviyesi
  // 'debug' = Tüm logları göster
  // NODE_ENV production ise 'info', değilse 'debug'
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // format = Log formatı
  format: winston.format.combine(
    // timestamp = Tarih-saat ekle
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    
    // errors = Error objesini düzgün göster
    winston.format.errors({ stack: true }),
    
    // Custom format'ı uygula
    customFormat
  ),
  
  // transports = Logları nereye yazsın?
  transports: [
    // ------------------------------------------
    // 1. CONSOLE TRANSPORT
    // ------------------------------------------
    // Console'a yazdır (development için)
    new winston.transports.Console({
      // format = Console için özel format
      format: winston.format.combine(
        // colorize = Renklendir
        winston.format.colorize(),
        customFormat
      )
    }),
    
    // ------------------------------------------
    // 2. FILE TRANSPORT - COMBINED LOG
    // ------------------------------------------
    // Tüm logları dosyaya yaz
    new winston.transports.File({
      // filename = Log dosyası yolu
      filename: path.join(logDir, 'combined.log'),
      
      // maxsize = Maksimum dosya boyutu (5MB)
      maxsize: 5242880, // 5MB
      
      // maxFiles = Maksimum dosya sayısı (5 tane)
      // 5 dosya dolunca en eski silinir
      maxFiles: 5
    }),
    
    // ------------------------------------------
    // 3. FILE TRANSPORT - ERROR LOG
    // ------------------------------------------
    // Sadece error logları
    new winston.transports.File({
      // level = Sadece 'error' seviyesi
      level: 'error',
      
      filename: path.join(logDir, 'error.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  
  // exitOnError = Hata olunca çıkış yapma
  exitOnError: false
});

// ==========================================
// STREAM FOR MORGAN
// ==========================================
// Morgan HTTP logger ile entegrasyon için

// stream = Morgan'ın yazacağı stream
logger.stream = {
  // write() = Morgan bu method'u çağırır
  write: (message: string) => {
    // message sonundaki \n'i temizle
    logger.info(message.trim());
  }
} as any;

// ==========================================
// EXPORT LOGGER
// ==========================================

export default logger;