"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const promises_2 = require("stream/promises");
const zlib_1 = require("zlib");
const cron = __importStar(require("node-cron"));
const logger_1 = require("../utils/logger");
class BackupService {
    constructor(config) {
        this.config = config;
        this.ensureBackupDirectory();
    }
    async ensureBackupDirectory() {
        try {
            await promises_1.default.access(this.config.backupDir);
        }
        catch {
            await promises_1.default.mkdir(this.config.backupDir, { recursive: true });
        }
    }
    async createBackup() {
        const timestamp = new Date();
        const backupId = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}`;
        const extension = this.config.compression ? '.db.gz' : '.db';
        const backupPath = path_1.default.join(this.config.backupDir, `${backupId}${extension}`);
        try {
            if (this.config.compression) {
                await this.createCompressedBackup(backupPath);
            }
            else {
                await promises_1.default.copyFile(this.config.dbPath, backupPath);
            }
            const stats = await promises_1.default.stat(backupPath);
            const checksum = await this.calculateChecksum(backupPath);
            const metadata = {
                id: backupId,
                timestamp,
                size: stats.size,
                compressed: this.config.compression,
                checksum
            };
            await this.saveMetadata(metadata);
            await this.cleanupOldBackups();
            logger_1.logger.info(`Yedekleme tamamlandı: ${backupId}`);
            return metadata;
        }
        catch (error) {
            logger_1.logger.error('Yedekleme hatası:', error);
            throw new Error(`Backup oluşturma hatası: ${error}`);
        }
    }
    async createCompressedBackup(backupPath) {
        const readStream = (0, fs_1.createReadStream)(this.config.dbPath);
        const writeStream = (0, fs_1.createWriteStream)(backupPath);
        const gzipStream = (0, zlib_1.createGzip)({ level: 9 });
        await (0, promises_2.pipeline)(readStream, gzipStream, writeStream);
    }
    async restoreBackup(backupId) {
        const metadata = await this.getBackupMetadata(backupId);
        if (!metadata) {
            throw new Error(`Yedek bulunamadı: ${backupId}`);
        }
        const extension = metadata.compressed ? '.db.gz' : '.db';
        const backupPath = path_1.default.join(this.config.backupDir, `${backupId}${extension}`);
        try {
            const tempBackup = `${this.config.dbPath}.temp`;
            await promises_1.default.copyFile(this.config.dbPath, tempBackup);
            if (metadata.compressed) {
                await this.restoreCompressedBackup(backupPath);
            }
            else {
                await promises_1.default.copyFile(backupPath, this.config.dbPath);
            }
            await promises_1.default.unlink(tempBackup);
            logger_1.logger.info(`Geri yükleme tamamlandı: ${backupId}`);
        }
        catch (error) {
            const tempBackup = `${this.config.dbPath}.temp`;
            try {
                await promises_1.default.copyFile(tempBackup, this.config.dbPath);
                await promises_1.default.unlink(tempBackup);
            }
            catch { }
            logger_1.logger.error('Geri yükleme hatası:', error);
            throw new Error(`Geri yükleme hatası: ${error}`);
        }
    }
    async restoreCompressedBackup(backupPath) {
        const readStream = (0, fs_1.createReadStream)(backupPath);
        const writeStream = (0, fs_1.createWriteStream)(this.config.dbPath);
        const gunzipStream = (0, zlib_1.createGunzip)();
        await (0, promises_2.pipeline)(readStream, gunzipStream, writeStream);
    }
    async listBackups() {
        try {
            const metadataPath = path_1.default.join(this.config.backupDir, 'metadata.json');
            const data = await promises_1.default.readFile(metadataPath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async deleteBackup(backupId) {
        const metadata = await this.getBackupMetadata(backupId);
        if (!metadata) {
            throw new Error(`Yedek bulunamadı: ${backupId}`);
        }
        const extension = metadata.compressed ? '.db.gz' : '.db';
        const backupPath = path_1.default.join(this.config.backupDir, `${backupId}${extension}`);
        await promises_1.default.unlink(backupPath);
        await this.removeMetadata(backupId);
        logger_1.logger.info(`Yedek silindi: ${backupId}`);
    }
    startScheduledBackups() {
        if (!this.config.schedule)
            return;
        this.scheduledTask = cron.schedule(this.config.schedule, async () => {
            try {
                await this.createBackup();
            }
            catch (error) {
                logger_1.logger.error('Otomatik yedekleme hatası:', error);
            }
        });
        logger_1.logger.info(`Otomatik yedekleme başlatıldı: ${this.config.schedule}`);
    }
    stopScheduledBackups() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = undefined;
            logger_1.logger.info('Otomatik yedekleme durduruldu');
        }
    }
    async verifyBackup(backupId) {
        const metadata = await this.getBackupMetadata(backupId);
        if (!metadata)
            return false;
        const extension = metadata.compressed ? '.db.gz' : '.db';
        const backupPath = path_1.default.join(this.config.backupDir, `${backupId}${extension}`);
        try {
            const currentChecksum = await this.calculateChecksum(backupPath);
            return currentChecksum === metadata.checksum;
        }
        catch {
            return false;
        }
    }
    async calculateChecksum(filePath) {
        const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
        const hash = crypto.createHash('sha256');
        const stream = (0, fs_1.createReadStream)(filePath);
        for await (const chunk of stream) {
            hash.update(chunk);
        }
        return hash.digest('hex');
    }
    async saveMetadata(metadata) {
        const backups = await this.listBackups();
        backups.push(metadata);
        const metadataPath = path_1.default.join(this.config.backupDir, 'metadata.json');
        await promises_1.default.writeFile(metadataPath, JSON.stringify(backups, null, 2));
    }
    async removeMetadata(backupId) {
        const backups = await this.listBackups();
        const filtered = backups.filter(b => b.id !== backupId);
        const metadataPath = path_1.default.join(this.config.backupDir, 'metadata.json');
        await promises_1.default.writeFile(metadataPath, JSON.stringify(filtered, null, 2));
    }
    async getBackupMetadata(backupId) {
        const backups = await this.listBackups();
        return backups.find(b => b.id === backupId) || null;
    }
    async cleanupOldBackups() {
        const backups = await this.listBackups();
        if (backups.length <= this.config.maxBackups)
            return;
        const sortedBackups = backups.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const toDelete = sortedBackups.slice(0, backups.length - this.config.maxBackups);
        for (const backup of toDelete) {
            await this.deleteBackup(backup.id);
        }
    }
}
exports.BackupService = BackupService;
//# sourceMappingURL=backup.service.js.map