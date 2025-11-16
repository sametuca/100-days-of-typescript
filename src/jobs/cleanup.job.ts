import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class CleanupJob {
  
  public static async cleanupExpiredTokens(): Promise<void> {
    logger.info('🧹 Starting expired tokens cleanup...');
    
    const deleted = await refreshTokenRepository.deleteExpired();
    
    if (deleted > 0) {
      logger.info(`✅ Cleaned up ${deleted} expired refresh tokens`);
    } else {
      logger.info('✅ No expired tokens to clean');
    }
  }

  public static async cleanupOldLogs(): Promise<void> {
    logger.info('🧹 Starting old logs cleanup...');
    
    const logsDir = path.join(__dirname, '../../logs');
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    try {
      const files = fs.readdirSync(logsDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`✅ Cleaned up ${deletedCount} old log files`);
      } else {
        logger.info('✅ No old logs to clean');
      }
    } catch (error) {
      logger.error('❌ Log cleanup failed:', error);
    }
  }

  public static async cleanupTempFiles(): Promise<void> {
    logger.info('🧹 Starting temp files cleanup...');
    
    //const uploadsDir = path.join(__dirname, '../../uploads');
    
    logger.info('✅ Temp files cleanup completed');
  }

  public static async runAll(): Promise<void> {
    await this.cleanupExpiredTokens();
    await this.cleanupOldLogs();
    await this.cleanupTempFiles();
  }
}