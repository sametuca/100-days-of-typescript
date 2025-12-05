import { Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import { logger } from '../utils/logger';
import path from 'path';

const backupService = new BackupService({
  dbPath: path.join(process.cwd(), 'data', 'devtracker.db'),
  backupDir: path.join(process.cwd(), 'data', 'backups'),
  maxBackups: 10,
  schedule: '0 2 * * *', // Her gün saat 02:00
  compression: true
});

export class BackupController {
  async createBackup(req: Request, res: Response): Promise<void> {
    try {
      const backup = await backupService.createBackup();
      res.status(201).json({
        success: true,
        message: 'Yedekleme başarıyla oluşturuldu',
        data: backup
      });
    } catch (error) {
      logger.error('Backup creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedekleme oluşturulurken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  async listBackups(req: Request, res: Response): Promise<void> {
    try {
      const backups = await backupService.listBackups();
      res.json({
        success: true,
        data: backups,
        count: backups.length
      });
    } catch (error) {
      logger.error('List backups error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedekler listelenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  async restoreBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      
      if (!backupId) {
        res.status(400).json({
          success: false,
          message: 'Backup ID gerekli'
        });
        return;
      }

      await backupService.restoreBackup(backupId);
      res.json({
        success: true,
        message: 'Yedek başarıyla geri yüklendi'
      });
    } catch (error) {
      logger.error('Restore backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedek geri yüklenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  async deleteBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      
      if (!backupId) {
        res.status(400).json({
          success: false,
          message: 'Backup ID gerekli'
        });
        return;
      }

      await backupService.deleteBackup(backupId);
      res.json({
        success: true,
        message: 'Yedek başarıyla silindi'
      });
    } catch (error) {
      logger.error('Delete backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedek silinirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  async verifyBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      
      if (!backupId) {
        res.status(400).json({
          success: false,
          message: 'Backup ID gerekli'
        });
        return;
      }

      const isValid = await backupService.verifyBackup(backupId);
      res.json({
        success: true,
        data: {
          backupId,
          isValid,
          message: isValid ? 'Yedek geçerli' : 'Yedek bozuk veya bulunamadı'
        }
      });
    } catch (error) {
      logger.error('Verify backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedek doğrulanırken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  async getBackupStatus(req: Request, res: Response): Promise<void> {
    try {
      const backups = await backupService.listBackups();
      const latestBackup = backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      res.json({
        success: true,
        data: {
          totalBackups: backups.length,
          latestBackup: latestBackup || null,
          scheduledBackupsActive: true
        }
      });
    } catch (error) {
      logger.error('Get backup status error:', error);
      res.status(500).json({
        success: false,
        message: 'Yedek durumu alınırken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }
}

// Otomatik yedeklemeyi başlat
backupService.startScheduledBackups();