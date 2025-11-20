"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupJob = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
class BackupJob {
    static async backupDatabase() {
        logger_1.default.info('Starting database backup...');
        try {
            const dbPath = path_1.default.join(__dirname, '../../data/devtracker.db');
            const backupDir = path_1.default.join(__dirname, '../../backups');
            if (!fs_1.default.existsSync(backupDir)) {
                fs_1.default.mkdirSync(backupDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const backupPath = path_1.default.join(backupDir, `devtracker-${timestamp}.db`);
            fs_1.default.copyFileSync(dbPath, backupPath);
            logger_1.default.info(`Database backup created: ${backupPath}`);
            this.cleanupOldBackups(backupDir);
        }
        catch (error) {
            logger_1.default.error('Database backup failed:', error);
        }
    }
    static cleanupOldBackups(backupDir) {
        const maxBackups = 7;
        const files = fs_1.default.readdirSync(backupDir)
            .filter(file => file.endsWith('.db'))
            .map(file => ({
            name: file,
            path: path_1.default.join(backupDir, file),
            time: fs_1.default.statSync(path_1.default.join(backupDir, file)).mtime.getTime()
        }))
            .sort((a, b) => b.time - a.time);
        if (files.length > maxBackups) {
            const toDelete = files.slice(maxBackups);
            toDelete.forEach(file => {
                fs_1.default.unlinkSync(file.path);
                logger_1.default.info(`Deleted old backup: ${file.name}`);
            });
        }
    }
}
exports.BackupJob = BackupJob;
//# sourceMappingURL=backup.job.js.map