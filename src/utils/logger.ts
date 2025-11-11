import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(process.env.LOG_DIR || 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
});


const logger = winston.createLogger({
   level: process.env.LOG_LEVEL || 'debug',
  
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      level: 'error',
      filename: path.join(logDir, 'error.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  exitOnError: false
});

logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
} as any;

export default logger;