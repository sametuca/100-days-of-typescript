import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export class BackupJob {
  
  public static async backupDatabase(): Promise<void> {
    logger.info('💾 Starting database backup...');

    try {
      const dbPath = path.join(__dirname, '../../data/devtracker.db');
      const backupDir = path.join(__dirname, '../../backups');

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const backupPath = path.join(backupDir, `devtracker-${timestamp}.db`);

      fs.copyFileSync(dbPath, backupPath);

      logger.info(`✅ Database backup created: ${backupPath}`);

      this.cleanupOldBackups(backupDir);
    } catch (error) {
      logger.error('❌ Database backup failed:', error);
    }
  }

  private static cleanupOldBackups(backupDir: string): void {
    const maxBackups = 7;

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxBackups) {
      const toDelete = files.slice(maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        logger.info(`🗑️  Deleted old backup: ${file.name}`);
      });
    }
  }
}