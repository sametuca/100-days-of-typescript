"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRepository = exports.ActivityRepository = void 0;
const base_repository_1 = require("./base.repository");
const crypto_1 = require("crypto");
class ActivityRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('activity_logs');
    }
    findById(id) {
        const stmt = this.db.prepare(`SELECT * FROM activity_logs WHERE id = ?`);
        const row = stmt.get(id);
        if (!row)
            return Promise.resolve(null);
        return Promise.resolve(this.parseLogs([row])[0]);
    }
    create(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const details = data.details ? JSON.stringify(data.details) : null;
        const stmt = this.db.prepare(`
      INSERT INTO activity_logs (id, task_id, user_id, action_type, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.task_id, data.user_id, data.action_type, details, now);
        return this.findById(id);
    }
    findByTaskId(taskId) {
        const stmt = this.db.prepare(`
      SELECT * FROM activity_logs WHERE task_id = ? ORDER BY created_at DESC
    `);
        const rows = stmt.all(taskId);
        return Promise.resolve(this.parseLogs(rows));
    }
    parseLogs(rows) {
        return rows.map(row => ({
            ...row,
            details: row.details ? JSON.parse(row.details) : null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.created_at)
        }));
    }
}
exports.ActivityRepository = ActivityRepository;
exports.activityRepository = new ActivityRepository();
//# sourceMappingURL=activity.repository.js.map