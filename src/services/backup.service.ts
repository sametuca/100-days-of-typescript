import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip, createGunzip } from 'zlib';
import * as cron from 'node-cron';
import { logger } from '../utils/logger';

export interface BackupConfig {
  dbPath: string;
  backupDir: string;
  maxBackups: number;
  schedule?: string;
  compression: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  compressed: boolean;
  checksum: string;
}

export class BackupService {
  private config: BackupConfig;
  private scheduledTask?: cron.ScheduledTask;

  constructor(config: BackupConfig) {
    this.config = config;
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.config.backupDir);
    } catch {
      await fs.mkdir(this.config.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<BackupMetadata> {
    const timestamp = new Date();
    const backupId = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}`;
    const extension = this.config.compression ? '.db.gz' : '.db';
    const backupPath = path.join(this.config.backupDir, `${backupId}${extension}`);

    try {
      if (this.config.compression) {
        await this.createCompressedBackup(backupPath);
      } else {
        await fs.copyFile(this.config.dbPath, backupPath);
      }

      const stats = await fs.stat(backupPath);
      const checksum = await this.calculateChecksum(backupPath);

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        size: stats.size,
        compressed: this.config.compression,
        checksum
      };

      await this.saveMetadata(metadata);
      await this.cleanupOldBackups();
      
      logger.info(`Yedekleme tamamlandı: ${backupId}`);
      return metadata;
    } catch (error) {
      logger.error('Yedekleme hatası:', error);
      throw new Error(`Backup oluşturma hatası: ${error}`);
    }
  }

  private async createCompressedBackup(backupPath: string): Promise<void> {
    const readStream = createReadStream(this.config.dbPath);
    const writeStream = createWriteStream(backupPath);
    const gzipStream = createGzip({ level: 9 });

    await pipeline(readStream, gzipStream, writeStream);
  }

  async restoreBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) {
      throw new Error(`Yedek bulunamadı: ${backupId}`);
    }

    const extension = metadata.compressed ? '.db.gz' : '.db';
    const backupPath = path.join(this.config.backupDir, `${backupId}${extension}`);

    try {
      const tempBackup = `${this.config.dbPath}.temp`;
      await fs.copyFile(this.config.dbPath, tempBackup);

      if (metadata.compressed) {
        await this.restoreCompressedBackup(backupPath);
      } else {
        await fs.copyFile(backupPath, this.config.dbPath);
      }

      await fs.unlink(tempBackup);
      logger.info(`Geri yükleme tamamlandı: ${backupId}`);
    } catch (error) {
      const tempBackup = `${this.config.dbPath}.temp`;
      try {
        await fs.copyFile(tempBackup, this.config.dbPath);
        await fs.unlink(tempBackup);
      } catch {}
      
      logger.error('Geri yükleme hatası:', error);
      throw new Error(`Geri yükleme hatası: ${error}`);
    }
  }

  private async restoreCompressedBackup(backupPath: string): Promise<void> {
    const readStream = createReadStream(backupPath);
    const writeStream = createWriteStream(this.config.dbPath);
    const gunzipStream = createGunzip();

    await pipeline(readStream, gunzipStream, writeStream);
  }

  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const metadataPath = path.join(this.config.backupDir, 'metadata.json');
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) {
      throw new Error(`Yedek bulunamadı: ${backupId}`);
    }

    const extension = metadata.compressed ? '.db.gz' : '.db';
    const backupPath = path.join(this.config.backupDir, `${backupId}${extension}`);

    await fs.unlink(backupPath);
    await this.removeMetadata(backupId);
    logger.info(`Yedek silindi: ${backupId}`);
  }

  startScheduledBackups(): void {
    if (!this.config.schedule) return;

    this.scheduledTask = cron.schedule(this.config.schedule, async () => {
      try {
        await this.createBackup();
      } catch (error) {
        logger.error('Otomatik yedekleme hatası:', error);
      }
    });

    logger.info(`Otomatik yedekleme başlatıldı: ${this.config.schedule}`);
  }

  stopScheduledBackups(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = undefined;
      logger.info('Otomatik yedekleme durduruldu');
    }
  }

  async verifyBackup(backupId: string): Promise<boolean> {
    const metadata = await this.getBackupMetadata(backupId);
    if (!metadata) return false;

    const extension = metadata.compressed ? '.db.gz' : '.db';
    const backupPath = path.join(this.config.backupDir, `${backupId}${extension}`);

    try {
      const currentChecksum = await this.calculateChecksum(backupPath);
      return currentChecksum === metadata.checksum;
    } catch {
      return false;
    }
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    
    return hash.digest('hex');
  }

  private async saveMetadata(metadata: BackupMetadata): Promise<void> {
    const backups = await this.listBackups();
    backups.push(metadata);
    
    const metadataPath = path.join(this.config.backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(backups, null, 2));
  }

  private async removeMetadata(backupId: string): Promise<void> {
    const backups = await this.listBackups();
    const filtered = backups.filter(b => b.id !== backupId);
    
    const metadataPath = path.join(this.config.backupDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(filtered, null, 2));
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    const backups = await this.listBackups();
    return backups.find(b => b.id === backupId) || null;
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    
    if (backups.length <= this.config.maxBackups) return;

    const sortedBackups = backups.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const toDelete = sortedBackups.slice(0, backups.length - this.config.maxBackups);
    
    for (const backup of toDelete) {
      await this.deleteBackup(backup.id);
    }
  }
}