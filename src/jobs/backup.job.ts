import { BackupService } from '../services/backup.service';
import { logger } from '../utils/logger';
import path from 'path';

const backupService = new BackupService({
  dbPath: path.join(process.cwd(), 'data', 'devtracker.db'),
  backupDir: path.join(process.cwd(), 'data', 'backups'),
  maxBackups: 10,
  schedule: '0 2 * * *',
  compression: true
});

export class BackupJob {
  public static async backupDatabase(): Promise<void> {
    try {
      const backup = await backupService.createBackup();
      logger.info(`Otomatik yedekleme tamamlandı: ${backup.id}`);
    } catch (error) {
      logger.error('Otomatik yedekleme hatası:', error);
    }
  }

  public static startScheduledBackups(): void {
    backupService.startScheduledBackups();
    logger.info('Zamanlanmış yedeklemeler başlatıldı');
  }

  public static stopScheduledBackups(): void {
    backupService.stopScheduledBackups();
    logger.info('Zamanlanmış yedeklemeler durduruldu');
  }
}