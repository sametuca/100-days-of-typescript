"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const backup_service_1 = require("../services/backup.service");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const backupService = new backup_service_1.BackupService({
    dbPath: path_1.default.join(process.cwd(), 'data', 'devtracker.db'),
    backupDir: path_1.default.join(process.cwd(), 'data', 'backups'),
    maxBackups: 10,
    schedule: '0 2 * * *',
    compression: true
});
class BackupController {
    async createBackup(req, res) {
        try {
            const backup = await backupService.createBackup();
            res.status(201).json({
                success: true,
                message: 'Yedekleme başarıyla oluşturuldu',
                data: backup
            });
        }
        catch (error) {
            logger_1.logger.error('Backup creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedekleme oluşturulurken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    async listBackups(req, res) {
        try {
            const backups = await backupService.listBackups();
            res.json({
                success: true,
                data: backups,
                count: backups.length
            });
        }
        catch (error) {
            logger_1.logger.error('List backups error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedekler listelenirken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    async restoreBackup(req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Restore backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedek geri yüklenirken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    async deleteBackup(req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Delete backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedek silinirken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    async verifyBackup(req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Verify backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedek doğrulanırken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
    async getBackupStatus(req, res) {
        try {
            const backups = await backupService.listBackups();
            const latestBackup = backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            res.json({
                success: true,
                data: {
                    totalBackups: backups.length,
                    latestBackup: latestBackup || null,
                    scheduledBackupsActive: true
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get backup status error:', error);
            res.status(500).json({
                success: false,
                message: 'Yedek durumu alınırken hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        }
    }
}
exports.BackupController = BackupController;
backupService.startScheduledBackups();
//# sourceMappingURL=backup.controller.js.map