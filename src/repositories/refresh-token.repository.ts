import db from '../database/connection';

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
  revokedAt?: Date;
}

export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  private db = db;
  private idCounter: number = 1000;

  public create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, revoked)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId,
      data.token,
      data.expiresAt.toISOString(),
      now,
      0
    );

    return this.findById(id) as Promise<RefreshToken>;
  }

  public findById(id: string): Promise<RefreshToken | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens WHERE id = ?
    `);

    const row = stmt.get(id) as any;

    if (!row) return Promise.resolve(null);

    return Promise.resolve(this.parseRefreshToken(row));
  }

  public findByToken(token: string): Promise<RefreshToken | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens WHERE token = ?
    `);

    const row = stmt.get(token) as any;

    if (!row) return Promise.resolve(null);

    return Promise.resolve(this.parseRefreshToken(row));
  }

  public findByUserId(userId: string): Promise<RefreshToken[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? AND revoked = 0
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];

    return Promise.resolve(rows.map(row => this.parseRefreshToken(row)));
  }

  public revoke(token: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE refresh_tokens 
      SET revoked = 1, revoked_at = ? 
      WHERE token = ?
    `);

    const result = stmt.run(new Date().toISOString(), token);

    return Promise.resolve(result.changes > 0);
  }

  public revokeAllForUser(userId: string): Promise<number> {
    const stmt = this.db.prepare(`
      UPDATE refresh_tokens 
      SET revoked = 1, revoked_at = ? 
      WHERE user_id = ? AND revoked = 0
    `);

    const result = stmt.run(new Date().toISOString(), userId);

    return Promise.resolve(result.changes);
  }

  public deleteExpired(): Promise<number> {
    const stmt = this.db.prepare(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < ?
    `);

    const result = stmt.run(new Date().toISOString());

    return Promise.resolve(result.changes);
  }

  private parseRefreshToken(row: any): RefreshToken {
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      revoked: row.revoked === 1,
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : undefined
    };
  }

  private generateId(): string {
    return `rt_${this.idCounter++}`;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();