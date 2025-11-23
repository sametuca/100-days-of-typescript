"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtaskRepository = exports.SubtaskRepository = void 0;
const base_repository_1 = require("./base.repository");
const crypto_1 = require("crypto");
class SubtaskRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('subtasks');
    }
    create(data, taskId) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            INSERT INTO subtasks (id, task_id, title, is_completed, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, taskId, data.title, 0, now, now);
        return this.findById(id);
    }
    findByTaskId(taskId) {
        const stmt = this.db.prepare(`
            SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC
        `);
        const rows = stmt.all(taskId);
        return Promise.resolve(this.parseSubtasks(rows));
    }
    update(id, data) {
        const existing = this.findById(id);
        if (!existing)
            return Promise.resolve(null);
        const updates = [];
        const values = [];
        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.is_completed !== undefined) {
            updates.push('is_completed = ?');
            values.push(data.is_completed ? 1 : 0);
        }
        if (updates.length === 0)
            return Promise.resolve(existing);
        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);
        const stmt = this.db.prepare(`
            UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?
        `);
        stmt.run(...values);
        return this.findById(id);
    }
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM subtasks WHERE id = ?');
        const result = stmt.run(id);
        return Promise.resolve(result.changes > 0);
    }
    toggleComplete(id) {
        const subtask = this.findById(id);
        if (!subtask)
            return Promise.resolve(null);
        return this.update(id, { is_completed: !subtask.is_completed });
    }
    parseSubtasks(rows) {
        return rows.map(row => ({
            ...row,
            is_completed: Boolean(row.is_completed),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            created_at: undefined,
            updated_at: undefined
        }));
    }
}
exports.SubtaskRepository = SubtaskRepository;
exports.subtaskRepository = new SubtaskRepository();
//# sourceMappingURL=subtask.repository.js.map