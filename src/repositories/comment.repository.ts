import { BaseRepository } from './base.repository';
import { Comment, CreateCommentDTO, UpdateCommentDTO } from '../types/comment.types';
import { randomUUID } from 'crypto';

export class CommentRepository extends BaseRepository<Comment> {
    constructor() {
        super('comments');
    }

    public create(data: CreateCommentDTO, taskId: string, userId: string): Promise<Comment> {
        const id = randomUUID();
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
      INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, taskId, userId, data.content, now, now);

        return this.findById(id) as Promise<Comment>;
    }

    public findByTaskId(taskId: string): Promise<Comment[]> {
        const stmt = this.db.prepare(`
      SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC
    `);

        const rows = stmt.all(taskId) as any[];
        return Promise.resolve(this.parseComments(rows));
    }

    public update(id: string, data: UpdateCommentDTO): Promise<Comment | null> {
        const existing = this.findById(id);
        if (!existing) return Promise.resolve(null);

        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      UPDATE comments SET content = ?, updated_at = ? WHERE id = ?
    `);

        stmt.run(data.content, now, id);

        return this.findById(id) as Promise<Comment>;
    }

    public delete(id: string): Promise<boolean> {
        const stmt = this.db.prepare('DELETE FROM comments WHERE id = ?');
        const result = stmt.run(id);
        return Promise.resolve(result.changes > 0);
    }

    private parseComments(rows: any[]): Comment[] {
        return rows.map(row => ({
            ...row
        }));
    }
}

export const commentRepository = new CommentRepository();
