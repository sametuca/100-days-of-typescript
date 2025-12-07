"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const connection_1 = __importDefault(require("../database/connection"));
class SearchService {
    constructor() {
        this.db = connection_1.default;
    }
    async searchTasks(query, userId) {
        const { query: searchText, filters, sort, pagination } = query;
        const { page = 1, limit = 20 } = pagination || {};
        const offset = (page - 1) * limit;
        let sql = `
      SELECT DISTINCT t.* FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE (t.user_id = ? OR t.assignee_id = ? OR p.user_id = ?)
    `;
        const params = [userId, userId, userId];
        if (searchText) {
            sql += ` AND (
        t.title LIKE ? OR 
        t.description LIKE ? OR
        t.tags LIKE ?
      )`;
            const searchPattern = `%${searchText}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        if (filters?.status?.length) {
            sql += ` AND t.status IN (${filters.status.map(() => '?').join(',')})`;
            params.push(...filters.status);
        }
        if (filters?.priority?.length) {
            sql += ` AND t.priority IN (${filters.priority.map(() => '?').join(',')})`;
            params.push(...filters.priority);
        }
        if (filters?.assigneeId?.length) {
            sql += ` AND t.assignee_id IN (${filters.assigneeId.map(() => '?').join(',')})`;
            params.push(...filters.assigneeId);
        }
        if (filters?.projectId?.length) {
            sql += ` AND t.project_id IN (${filters.projectId.map(() => '?').join(',')})`;
            params.push(...filters.projectId);
        }
        if (filters?.dateRange?.from) {
            sql += ` AND t.created_at >= ?`;
            params.push(filters.dateRange.from.toISOString());
        }
        if (filters?.dateRange?.to) {
            sql += ` AND t.created_at <= ?`;
            params.push(filters.dateRange.to.toISOString());
        }
        const countSql = sql.replace('SELECT DISTINCT t.*', 'SELECT COUNT(DISTINCT t.id) as total');
        const countResult = this.db.prepare(countSql).get(...params);
        const total = countResult.total;
        const sortField = sort?.field || 'createdAt';
        const sortOrder = sort?.order || 'desc';
        const sortMap = {
            relevance: 't.title',
            createdAt: 't.created_at',
            updatedAt: 't.updated_at',
            priority: 't.priority',
            dueDate: 't.due_date'
        };
        sql += ` ORDER BY ${sortMap[sortField]} ${sortOrder.toUpperCase()}`;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const tasks = this.db.prepare(sql).all(...params);
        const facets = await this.getFacets(userId, searchText, filters);
        return {
            items: tasks,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            facets
        };
    }
    async getFacets(userId, searchText, _filters) {
        let baseSql = `
      SELECT t.* FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE (t.user_id = ? OR t.assignee_id = ? OR p.user_id = ?)
    `;
        const params = [userId, userId, userId];
        if (searchText) {
            baseSql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
            const searchPattern = `%${searchText}%`;
            params.push(searchPattern, searchPattern);
        }
        const statusFacets = this.db.prepare(`
      ${baseSql.replace('SELECT t.*', 'SELECT t.status, COUNT(*) as count')}
      GROUP BY t.status
    `).all(...params);
        const priorityFacets = this.db.prepare(`
      ${baseSql.replace('SELECT t.*', 'SELECT t.priority, COUNT(*) as count')}
      GROUP BY t.priority
    `).all(...params);
        return {
            status: Object.fromEntries(statusFacets.map(f => [f.status, f.count])),
            priority: Object.fromEntries(priorityFacets.map(f => [f.priority, f.count])),
            assignee: {},
            project: {},
            tags: {}
        };
    }
    async getSuggestions(query, userId) {
        const suggestions = [];
        const pattern = `%${query}%`;
        const tasks = this.db.prepare(`
      SELECT title FROM tasks 
      WHERE (user_id = ? OR assignee_id = ?) AND title LIKE ?
      LIMIT 5
    `).all(userId, userId, pattern);
        tasks.forEach(t => {
            suggestions.push({ text: t.title, type: 'task', score: 1.0 });
        });
        const projects = this.db.prepare(`
      SELECT name FROM projects 
      WHERE user_id = ? AND name LIKE ?
      LIMIT 3
    `).all(userId, pattern);
        projects.forEach(p => {
            suggestions.push({ text: p.name, type: 'project', score: 0.9 });
        });
        return suggestions.sort((a, b) => b.score - a.score);
    }
    async saveSearch(userId, name, query) {
        const id = `search_${Date.now()}`;
        const savedSearch = {
            id,
            userId,
            name,
            query,
            isDefault: false,
            createdAt: new Date()
        };
        this.db.prepare(`
      INSERT INTO saved_searches (id, user_id, name, query, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, name, JSON.stringify(query), 0, savedSearch.createdAt.toISOString());
        return savedSearch;
    }
    async getSavedSearches(userId) {
        const searches = this.db.prepare(`
      SELECT * FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);
        return searches.map(s => ({
            ...s,
            query: JSON.parse(s.query),
            isDefault: Boolean(s.is_default),
            createdAt: new Date(s.created_at)
        }));
    }
    async deleteSavedSearch(id, userId) {
        this.db.prepare(`
      DELETE FROM saved_searches WHERE id = ? AND user_id = ?
    `).run(id, userId);
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
//# sourceMappingURL=search.service.js.map