"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMigrator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
class DatabaseMigrator {
    constructor(db) {
        this.db = db;
        this.migrationsPath = path_1.default.join(__dirname, 'migrations');
        this.initMigrationsTable();
    }
    initMigrationsTable() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        description TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    getMigrationFiles() {
        const files = fs_1.default.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();
        return files.map(filename => {
            const filePath = path_1.default.join(this.migrationsPath, filename);
            const sql = fs_1.default.readFileSync(filePath, 'utf8');
            const lines = sql.split('\n');
            const idMatch = lines[0].match(/-- Migration: (\d+)/);
            const descMatch = lines[1].match(/-- Description: (.+)/);
            return {
                id: idMatch ? parseInt(idMatch[1]) : 0,
                filename,
                description: descMatch ? descMatch[1] : '',
                sql
            };
        });
    }
    getExecutedMigrations() {
        const stmt = this.db.prepare('SELECT filename FROM migrations ORDER BY id');
        return stmt.all().map((row) => row.filename);
    }
    async runMigrations() {
        const allMigrations = this.getMigrationFiles();
        const executedMigrations = this.getExecutedMigrations();
        const pendingMigrations = allMigrations.filter(migration => !executedMigrations.includes(migration.filename));
        if (pendingMigrations.length === 0) {
            logger_1.default.info('No pending migrations');
            return;
        }
        logger_1.default.info(`Running ${pendingMigrations.length} pending migrations`);
        for (const migration of pendingMigrations) {
            try {
                logger_1.default.info(`Executing migration: ${migration.filename}`);
                this.db.transaction(() => {
                    this.db.exec(migration.sql);
                    this.db.prepare(`
            INSERT INTO migrations (id, filename, description)
            VALUES (?, ?, ?)
          `).run(migration.id, migration.filename, migration.description);
                })();
                logger_1.default.info(`Migration completed: ${migration.filename}`);
            }
            catch (error) {
                logger_1.default.error(`Migration failed: ${migration.filename}`, error);
                throw error;
            }
        }
        logger_1.default.info('All migrations completed successfully');
    }
    async rollback(steps = 1) {
        const executedMigrations = this.getExecutedMigrations();
        if (executedMigrations.length === 0) {
            logger_1.default.info('No migrations to rollback');
            return;
        }
        const toRollback = executedMigrations.slice(-steps);
        logger_1.default.info(`Rolling back ${toRollback.length} migrations`);
        for (const filename of toRollback.reverse()) {
            try {
                logger_1.default.info(`Rolling back migration: ${filename}`);
                this.db.prepare('DELETE FROM migrations WHERE filename = ?').run(filename);
                logger_1.default.info(`Rollback completed: ${filename}`);
            }
            catch (error) {
                logger_1.default.error(`Rollback failed: ${filename}`, error);
                throw error;
            }
        }
    }
    getMigrationStatus() {
        const allMigrations = this.getMigrationFiles();
        const executedMigrations = this.getExecutedMigrations();
        return allMigrations.map(migration => ({
            id: migration.id,
            filename: migration.filename,
            description: migration.description,
            executed: executedMigrations.includes(migration.filename)
        }));
    }
}
exports.DatabaseMigrator = DatabaseMigrator;
//# sourceMappingURL=migrator.js.map