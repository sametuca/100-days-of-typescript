import { BaseRepository } from './base.repository';
import { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../types/subtask.types';
import { randomUUID } from 'crypto';

export class SubtaskRepository extends BaseRepository<Subtask> {
    constructor() {
        super('subtasks');
    }

    public create(data: CreateSubtaskDto, taskId: string): Promise<Subtask> {
        const id = randomUUID();
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
            INSERT INTO subtasks (id, task_id, title, is_completed, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, taskId, data.title, 0, now, now);

        return this.findById(id) as Promise<Subtask>;
    }

    public findByTaskId(taskId: string): Promise<Subtask[]> {
        const stmt = this.db.prepare(`
            SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC
        `);

        const rows = stmt.all(taskId) as any[];
        return Promise.resolve(this.parseSubtasks(rows));
    }

    public update(id: string, data: UpdateSubtaskDto): Promise<Subtask | null> {
        const existing = this.findById(id);
        if (!existing) return Promise.resolve(null);

        const updates: string[] = [];
        const values: any[] = [];

        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title);
        }

        if (data.is_completed !== undefined) {
            updates.push('is_completed = ?');
            values.push(data.is_completed ? 1 : 0);
        }

        if (updates.length === 0) return Promise.resolve(existing);

        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const stmt = this.db.prepare(`
            UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?
        `);

        stmt.run(...values);

        return this.findById(id) as Promise<Subtask>;
    }

    public delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM subtasks WHERE id = ?');
        const result = stmt.run(id);
        return Promise.resolve(result.changes > 0);
    }

    public toggleComplete(id: string): Promise<Subtask | null> {
        const subtask = this.findById(id) as any;
        if (!subtask) return Promise.resolve(null);

        return this.update(id, { is_completed: !subtask.is_completed });
    }

    private parseSubtasks(rows: any[]): Subtask[] {
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

export const subtaskRepository = new SubtaskRepository();
