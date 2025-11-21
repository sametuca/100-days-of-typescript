import { BaseRepository } from './base.repository';
import { ActivityLog, CreateActivityLogDTO } from '../types/activity.types';
import { randomUUID } from 'crypto';

export class ActivityRepository extends BaseRepository<ActivityLog> {
    constructor() {
        super('activity_logs');
    }

    public findById(id: string): Promise<ActivityLog | null> {
        const stmt = this.db.prepare(`SELECT * FROM activity_logs WHERE id = ?`);
        const row = stmt.get(id);
        if (!row) return Promise.resolve(null);
        return Promise.resolve(this.parseLogs([row])[0]);
    }

    public create(data: CreateActivityLogDTO): Promise<ActivityLog> {
        const id = randomUUID();
        const now = new Date().toISOString();
        const details = data.details ? JSON.stringify(data.details) : null;

        const stmt = this.db.prepare(`
      INSERT INTO activity_logs (id, task_id, user_id, action_type, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, data.task_id, data.user_id, data.action_type, details, now);

        return this.findById(id) as Promise<ActivityLog>;
    }

    public findByTaskId(taskId: string): Promise<ActivityLog[]> {
        const stmt = this.db.prepare(`
      SELECT * FROM activity_logs WHERE task_id = ? ORDER BY created_at DESC
    `);

        const rows = stmt.all(taskId) as any[];
        return Promise.resolve(this.parseLogs(rows));
    }

    private parseLogs(rows: any[]): ActivityLog[] {
        return rows.map(row => ({
            ...row,
            details: row.details ? JSON.parse(row.details) : null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.created_at)
        }));
    }
}

export const activityRepository = new ActivityRepository();
