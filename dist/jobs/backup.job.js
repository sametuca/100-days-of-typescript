"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupJob = void 0;
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
class BackupJob {
    static async backupDatabase() {
        try {
            const backup = await backupService.createBackup();
            logger_1.logger.info(`Otomatik yedekleme tamamlandı: ${backup.id}`);
        }
        catch (error) {
            logger_1.logger.error('Otomatik yedekleme hatası:', error);
        }
    }
    static startScheduledBackups() {
        backupService.startScheduledBackups();
        logger_1.logger.info('Zamanlanmış yedeklemeler başlatıldı');
    }
    static stopScheduledBackups() {
        backupService.stopScheduledBackups();
        logger_1.logger.info('Zamanlanmış yedeklemeler durduruldu');
    }
}
exports.BackupJob = BackupJob;
//# sourceMappingURL=backup.job.js.map