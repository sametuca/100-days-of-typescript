import db from '../database/connection';
import { BaseEntity } from '../types';

export abstract class BaseRepository<T extends BaseEntity> {

  protected tableName: string;
  protected db = db;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public findAll(): Promise<T[]> {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);

    const rows = stmt.all() as T[];

    return Promise.resolve(rows);
  }

  public findById(id: string): Promise<T | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName} WHERE id = ?
    `);

    const row = stmt.get(id) as T | undefined;

    return Promise.resolve(row || null);
  }

  public delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM ${this.tableName} WHERE id = ?
    `);

    const result = stmt.run(id);

    return Promise.resolve(result.changes > 0);
  }


  public count(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM ${this.tableName}
    `);

    const result = stmt.get() as { count: number };

    return Promise.resolve(result.count);
  }

  public exists(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) as exists
    `);

    const result = stmt.get(id) as { exists: number };

    return Promise.resolve(result.exists === 1);
  }
}