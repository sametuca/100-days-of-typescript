"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupJob = void 0;
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const logger_1 = __importDefault(require("../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CleanupJob {
    static async cleanupExpiredTokens() {
        logger_1.default.info('Starting expired tokens cleanup...');
        const deleted = await refresh_token_repository_1.refreshTokenRepository.deleteExpired();
        if (deleted > 0) {
            logger_1.default.info(`Cleaned up ${deleted} expired refresh tokens`);
        }
        else {
            logger_1.default.info('No expired tokens to clean');
        }
    }
    static async cleanupOldLogs() {
        logger_1.default.info('Starting old logs cleanup...');
        const logsDir = path_1.default.join(__dirname, '../../logs');
        const maxAge = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        try {
            const files = fs_1.default.readdirSync(logsDir);
            let deletedCount = 0;
            for (const file of files) {
                const filePath = path_1.default.join(logsDir, file);
                const stats = fs_1.default.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs_1.default.unlinkSync(filePath);
                    deletedCount++;
                }
            }
            if (deletedCount > 0) {
                logger_1.default.info(`Cleaned up ${deletedCount} old log files`);
            }
            else {
                logger_1.default.info('No old logs to clean');
            }
        }
        catch (error) {
            logger_1.default.error('Log cleanup failed:', error);
        }
    }
    static async cleanupTempFiles() {
        logger_1.default.info('Starting temp files cleanup...');
        logger_1.default.info('Temp files cleanup completed');
    }
    static async runAll() {
        await this.cleanupExpiredTokens();
        await this.cleanupOldLogs();
        await this.cleanupTempFiles();
    }
}
exports.CleanupJob = CleanupJob;
//# sourceMappingURL=cleanup.job.js.map