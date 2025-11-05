// Tüm repository'lerin türeyeceği temel sınıf
// Ortak CRUD işlemlerini içerir

import db from '../database/connection';
import { BaseEntity } from '../types';

// Generic class = <T> herhangi bir tip olabilir
// T extends BaseEntity = T, BaseEntity'nin özelliklerini içermeli

export abstract class BaseRepository<T extends BaseEntity> {

  // tableName = Hangi tabloda çalışacağız?
  protected tableName: string;

  // db = Database bağlantısı
  protected db = db;

  // Her repository'de tablo adı belirtilmeli

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public findAll(): Promise<T[]> {
    // SQL query hazırla
    // SELECT * FROM ${tableName} = Tüm sütunları getir
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);

    // .all() = Tüm satırları array olarak döndür
    const rows = stmt.all() as T[];

    // Promise.resolve() = Senkron sonucu Promise'e çevir
    // (async/await uyumluluğu için)
    return Promise.resolve(rows);
  }

  public findById(id: string): Promise<T | null> {
    // WHERE id = ? = ID'si eşleşen kayıt
    // ? = Placeholder (SQL injection'dan korur)
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName} WHERE id = ?
    `);

    // .get(id) = Tek satır döndür, parametre olarak id ver
    const row = stmt.get(id) as T | undefined;

    // row || null = row varsa döndür, yoksa null
    return Promise.resolve(row || null);
  }

  public delete(id: string): Promise<boolean> {
    // DELETE FROM ${tableName} WHERE id = ?
    const stmt = this.db.prepare(`
      DELETE FROM ${this.tableName} WHERE id = ?
    `);

    // .run(id) = Query'yi çalıştır
    // changes = Kaç satır etkilendi?
    const result = stmt.run(id);

    // result.changes > 0 = En az 1 satır silindi mi?
    return Promise.resolve(result.changes > 0);
  }

  // Toplam kayıt sayısı

  public count(): Promise<number> {
    // COUNT(*) = Tüm satırları say
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM ${this.tableName}
    `);

    // .get() = Tek sonuç döndür
    const result = stmt.get() as { count: number };

    return Promise.resolve(result.count);
  }

  public exists(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) as exists
    `);

    // EXISTS() = 1 veya 0 döner (boolean gibi)
    const result = stmt.get(id) as { exists: number };

    // result.exists === 1 = Kayıt var
    return Promise.resolve(result.exists === 1);
  }
}