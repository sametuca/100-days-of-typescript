"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRepository = exports.RefreshTokenRepository = void 0;
const connection_1 = __importDefault(require("../database/connection"));
class RefreshTokenRepository {
    constructor() {
        this.db = connection_1.default;
        this.idCounter = 1000;
    }
    create(data) {
        const id = this.generateId();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, revoked)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.userId, data.token, data.expiresAt.toISOString(), now, 0);
        return this.findById(id);
    }
    findById(id) {
        const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return Promise.resolve(null);
        return Promise.resolve(this.parseRefreshToken(row));
    }
    findByToken(token) {
        const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens WHERE token = ?
    `);
        const row = stmt.get(token);
        if (!row)
            return Promise.resolve(null);
        return Promise.resolve(this.parseRefreshToken(row));
    }
    findByUserId(userId) {
        const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? AND revoked = 0
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(userId);
        return Promise.resolve(rows.map(row => this.parseRefreshToken(row)));
    }
    revoke(token) {
        const stmt = this.db.prepare(`
      UPDATE refresh_tokens 
      SET revoked = 1, revoked_at = ? 
      WHERE token = ?
    `);
        const result = stmt.run(new Date().toISOString(), token);
        return Promise.resolve(result.changes > 0);
    }
    revokeAllForUser(userId) {
        const stmt = this.db.prepare(`
      UPDATE refresh_tokens 
      SET revoked = 1, revoked_at = ? 
      WHERE user_id = ? AND revoked = 0
    `);
        const result = stmt.run(new Date().toISOString(), userId);
        return Promise.resolve(result.changes);
    }
    deleteExpired() {
        const stmt = this.db.prepare(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < ?
    `);
        const result = stmt.run(new Date().toISOString());
        return Promise.resolve(result.changes);
    }
    parseRefreshToken(row) {
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
    generateId() {
        return `rt_${this.idCounter++}`;
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.refreshTokenRepository = new RefreshTokenRepository();
//# sourceMappingURL=refresh-token.repository.js.map