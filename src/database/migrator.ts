import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import logger from '../utils/logger';

interface Migration {
  id: number;
  filename: string;
  description: string;
  sql: string;
}

export class DatabaseMigrator {
  private db: Database.Database;
  private migrationsPath: string;

  constructor(db: Database.Database) {
    this.db = db;
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.initMigrationsTable();
  }

  private initMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        description TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private getMigrationFiles(): Migration[] {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Extract migration info from comments
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

  private getExecutedMigrations(): string[] {
    const stmt = this.db.prepare('SELECT filename FROM migrations ORDER BY id');
    return stmt.all().map((row: any) => row.filename);
  }

  async runMigrations(): Promise<void> {
    const allMigrations = this.getMigrationFiles();
    const executedMigrations = this.getExecutedMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration.filename)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      try {
        logger.info(`Executing migration: ${migration.filename}`);
        
        this.db.transaction(() => {
          this.db.exec(migration.sql);
          
          this.db.prepare(`
            INSERT INTO migrations (id, filename, description)
            VALUES (?, ?, ?)
          `).run(migration.id, migration.filename, migration.description);
        })();

        logger.info(`Migration completed: ${migration.filename}`);
      } catch (error: any) {
        logger.error(`Migration failed: ${migration.filename}`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
  }

  async rollback(steps: number = 1): Promise<void> {
    const executedMigrations = this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const toRollback = executedMigrations.slice(-steps);
    
    logger.info(`Rolling back ${toRollback.length} migrations`);

    for (const filename of toRollback.reverse()) {
      try {
        logger.info(`Rolling back migration: ${filename}`);
        
        // Note: SQLite doesn't support DROP COLUMN, so rollbacks are limited
        this.db.prepare('DELETE FROM migrations WHERE filename = ?').run(filename);
        
        logger.info(`Rollback completed: ${filename}`);
      } catch (error: any) {
        logger.error(`Rollback failed: ${filename}`, error);
        throw error;
      }
    }
  }

  getMigrationStatus(): any[] {
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