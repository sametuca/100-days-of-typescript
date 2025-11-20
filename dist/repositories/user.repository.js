"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const types_1 = require("../types");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('users');
        this.idCounter = 1000;
    }
    create(userData) {
        const id = this.generateId();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO users (
        id, email, username, password_hash, first_name, last_name, 
        role, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, userData.email, userData.username, userData.passwordHash, userData.firstName || null, userData.lastName || null, userData.role || types_1.UserRole.USER, 1, now, now);
        return this.findById(id);
    }
    findByEmail(email) {
        const stmt = this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
        const row = stmt.get(email);
        if (!row)
            return Promise.resolve(null);
        return Promise.resolve(this.parseUser(row));
    }
    findByUsername(username) {
        const stmt = this.db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);
        const row = stmt.get(username);
        if (!row)
            return Promise.resolve(null);
        return Promise.resolve(this.parseUser(row));
    }
    emailExists(email) {
        const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE email = ?
    `);
        const result = stmt.get(email);
        return Promise.resolve(result.count > 0);
    }
    usernameExists(username) {
        const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE username = ?
    `);
        const result = stmt.get(username);
        return Promise.resolve(result.count > 0);
    }
    update(id, data) {
        const updateFields = [];
        const updateValues = [];
        if (data.email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(data.email);
        }
        if (data.username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(data.username);
        }
        if (data.firstName !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(data.firstName);
        }
        if (data.lastName !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(data.lastName);
        }
        if (data.avatar !== undefined) {
            updateFields.push('avatar = ?');
            updateValues.push(data.avatar);
        }
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        if (updateFields.length === 1) {
            return this.findById(id);
        }
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);
        const stmt = this.db.prepare(sql);
        stmt.run(...updateValues);
        return this.findById(id);
    }
    updatePassword(id, passwordHash) {
        const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = ? 
      WHERE id = ?
    `);
        const result = stmt.run(passwordHash, new Date().toISOString(), id);
        return Promise.resolve(result.changes > 0);
    }
    parseUser(row) {
        return {
            id: row.id,
            email: row.email,
            username: row.username,
            passwordHash: row.password_hash,
            firstName: row.first_name,
            lastName: row.last_name,
            avatar: row.avatar,
            role: row.role,
            isActive: row.is_active === 1,
            lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
    generateId() {
        return `user_${this.idCounter++}`;
    }
    findAllPaginated(page, limit, filters) {
        const whereClauses = [];
        const params = [];
        if (filters?.role) {
            whereClauses.push('role = ?');
            params.push(filters.role);
        }
        if (filters?.isActive !== undefined) {
            whereClauses.push('is_active = ?');
            params.push(filters.isActive ? 1 : 0);
        }
        if (filters?.search) {
            whereClauses.push('(email LIKE ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        let sql = 'SELECT * FROM users';
        let countSql = 'SELECT COUNT(*) as total FROM users';
        if (whereClauses.length > 0) {
            const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
            sql += whereClause;
            countSql += whereClause;
        }
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        const queryParams = [...params, limit, offset];
        const countStmt = this.db.prepare(countSql);
        const countResult = countStmt.get(...params);
        const total = countResult.total;
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...queryParams);
        const users = rows.map(row => this.parseUser(row));
        return Promise.resolve({ users, total });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map