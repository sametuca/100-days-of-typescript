"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = exports.CommentRepository = void 0;
const base_repository_1 = require("./base.repository");
const crypto_1 = require("crypto");
class CommentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('comments');
    }
    create(data, taskId, userId) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, taskId, userId, data.content, now, now);
        return this.findById(id);
    }
    findByTaskId(taskId) {
        const stmt = this.db.prepare(`
      SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC
    `);
        const rows = stmt.all(taskId);
        return Promise.resolve(this.parseComments(rows));
    }
    update(id, data) {
        const existing = this.findById(id);
        if (!existing)
            return Promise.resolve(null);
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      UPDATE comments SET content = ?, updated_at = ? WHERE id = ?
    `);
        stmt.run(data.content, now, id);
        return this.findById(id);
    }
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM comments WHERE id = ?');
        const result = stmt.run(id);
        return Promise.resolve(result.changes > 0);
    }
    parseComments(rows) {
        return rows.map(row => ({
            ...row,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            created_at: undefined,
            updated_at: undefined
        }));
    }
}
exports.CommentRepository = CommentRepository;
exports.commentRepository = new CommentRepository();
//# sourceMappingURL=comment.repository.js.map