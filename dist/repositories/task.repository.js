"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = exports.TaskRepository = void 0;
const base_repository_1 = require("./base.repository");
const types_1 = require("../types");
class TaskRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('tasks');
        this.idCounter = 1000;
    }
    create(taskData, userId) {
        const id = this.generateId();
        const now = new Date().toISOString();
        const tags = taskData.tags ? JSON.stringify(taskData.tags) : null;
        const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, 
        user_id, project_id, due_date, tags, 
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, taskData.title, taskData.description || null, taskData.status || types_1.TaskStatus.TODO, taskData.priority || types_1.TaskPriority.MEDIUM, userId, taskData.projectId || null, taskData.dueDate || null, tags, now, now);
        return this.findById(id);
    }
    update(id, taskData) {
        const existingTask = this.db.prepare(`
      SELECT * FROM tasks WHERE id = ?
    `).get(id);
        if (!existingTask) {
            return Promise.resolve(null);
        }
        const updateFields = [];
        const updateValues = [];
        if (taskData.title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(taskData.title);
        }
        if (taskData.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(taskData.description);
        }
        if (taskData.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(taskData.status);
        }
        if (taskData.priority !== undefined) {
            updateFields.push('priority = ?');
            updateValues.push(taskData.priority);
        }
        if (taskData.projectId !== undefined) {
            updateFields.push('project_id = ?');
            updateValues.push(taskData.projectId);
        }
        if (taskData.dueDate !== undefined) {
            updateFields.push('due_date = ?');
            updateValues.push(taskData.dueDate);
        }
        if (taskData.tags !== undefined) {
            updateFields.push('tags = ?');
            updateValues.push(JSON.stringify(taskData.tags));
        }
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        if (updateFields.length === 1) {
            return Promise.resolve(existingTask);
        }
        const sql = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
        updateValues.push(id);
        const stmt = this.db.prepare(sql);
        stmt.run(...updateValues);
        return this.findById(id);
    }
    findByUserId(userId) {
        const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE user_id = ?
    `);
        const rows = stmt.all(userId);
        return Promise.resolve(this.parseTasks(rows));
    }
    findByProjectId(projectId) {
        const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE project_id = ?
    `);
        const rows = stmt.all(projectId);
        return Promise.resolve(this.parseTasks(rows));
    }
    findByStatus(status) {
        const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE status = ?
    `);
        const rows = stmt.all(status);
        return Promise.resolve(this.parseTasks(rows));
    }
    findByPriority(priority) {
        const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE priority = ?
    `);
        const rows = stmt.all(priority);
        return Promise.resolve(this.parseTasks(rows));
    }
    search(query) {
        const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE title LIKE ? OR description LIKE ?
    `);
        const searchPattern = `%${query}%`;
        const rows = stmt.all(searchPattern, searchPattern);
        return Promise.resolve(this.parseTasks(rows));
    }
    findWithFilters(filters) {
        const whereClauses = [];
        const params = [];
        if (filters.userId) {
            whereClauses.push('user_id = ?');
            params.push(filters.userId);
        }
        if (filters.projectId) {
            whereClauses.push('project_id = ?');
            params.push(filters.projectId);
        }
        if (filters.status) {
            whereClauses.push('status = ?');
            params.push(filters.status);
        }
        if (filters.priority) {
            whereClauses.push('priority = ?');
            params.push(filters.priority);
        }
        if (filters.search) {
            whereClauses.push('(title LIKE ? OR description LIKE ?)');
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern);
        }
        let sql = 'SELECT * FROM tasks';
        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return Promise.resolve(this.parseTasks(rows));
    }
    parseTasks(tasks) {
        return tasks.map(task => ({
            ...task,
            tags: task.tags ? JSON.parse(task.tags) : [],
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            createdAt: new Date(task.created_at),
            updatedAt: new Date(task.updated_at),
            userId: task.user_id,
            projectId: task.project_id,
            user_id: undefined,
            project_id: undefined,
            due_date: undefined,
            created_at: undefined,
            updated_at: undefined
        }));
    }
    generateId() {
        return `task_${this.idCounter++}`;
    }
    findAllPaginated(page, limit, filters, sortOptions) {
        const whereClauses = [];
        const params = [];
        if (filters?.userId) {
            whereClauses.push('user_id = ?');
            params.push(filters.userId);
        }
        if (filters?.status && filters.status.length > 0) {
            const statusPlaceholders = filters.status.map(() => '?').join(',');
            whereClauses.push(`status IN (${statusPlaceholders})`);
            params.push(...filters.status);
        }
        if (filters?.priority && filters.priority.length > 0) {
            const priorityPlaceholders = filters.priority.map(() => '?').join(',');
            whereClauses.push(`priority IN (${priorityPlaceholders})`);
            params.push(...filters.priority);
        }
        if (filters?.startDate) {
            whereClauses.push('created_at >= ?');
            params.push(filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            whereClauses.push('created_at <= ?');
            params.push(filters.endDate.toISOString());
        }
        if (filters?.search) {
            whereClauses.push('(title LIKE ? OR description LIKE ?)');
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern);
        }
        let sql = 'SELECT * FROM tasks';
        let countSql = 'SELECT COUNT(*) as total FROM tasks';
        if (whereClauses.length > 0) {
            const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
            sql += whereClause;
            countSql += whereClause;
        }
        const sortBy = sortOptions?.sortBy || 'created_at';
        const sortOrder = sortOptions?.sortOrder || 'desc';
        sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;
        const offset = (page - 1) * limit;
        const queryParams = [...params, limit, offset];
        const countStmt = this.db.prepare(countSql);
        const countResult = countStmt.get(...params);
        const total = countResult.total;
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...queryParams);
        const tasks = this.parseTasks(rows);
        return Promise.resolve({ tasks, total });
    }
}
exports.TaskRepository = TaskRepository;
exports.taskRepository = new TaskRepository();
//# sourceMappingURL=task.repository.js.map