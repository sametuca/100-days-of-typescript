import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import logger from '../utils/logger';

export class CleanupJob {
  
  public static async cleanupExpiredTokens(): Promise<void> {
    try {
      const deleted = await refreshTokenRepository.deleteExpired();
      
      if (deleted > 0) {
        logger.info(`Cleanup: ${deleted} expired refresh tokens deleted`);
      }
    } catch (error) {
      logger.error('Cleanup job failed:', error);
    }
  }

  public static start(): void {
    const INTERVAL = 24 * 60 * 60 * 1000;
    
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, INTERVAL);
    
    logger.info('Cleanup job started (runs every 24 hours)');
  }
}