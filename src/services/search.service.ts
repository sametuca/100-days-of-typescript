import { Database } from 'better-sqlite3';
import db from '../database/connection';
import { SearchQuery, SearchResult, SearchFacets, SearchSuggestion, SavedSearch } from '../types/search.types';
import { Task } from '../models/task.model';

export class SearchService {
  private db: Database;

  constructor() {
    this.db = db;
  }

  async searchTasks(query: SearchQuery, userId: string): Promise<SearchResult<Task>> {
    const { query: searchText, filters, sort, pagination } = query;
    const { page = 1, limit = 20 } = pagination || {};
    const offset = (page - 1) * limit;

    let sql = `
      SELECT DISTINCT t.* FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE (t.user_id = ? OR t.assignee_id = ? OR p.user_id = ?)
    `;
    const params: any[] = [userId, userId, userId];

    // Full-text search
    if (searchText) {
      sql += ` AND (
        t.title LIKE ? OR 
        t.description LIKE ? OR
        t.tags LIKE ?
      )`;
      const searchPattern = `%${searchText}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Apply filters
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

    // Count total
    const countSql = sql.replace('SELECT DISTINCT t.*', 'SELECT COUNT(DISTINCT t.id) as total');
    const countResult = this.db.prepare(countSql).get(...params) as { total: number };
    const total = countResult.total;

    // Apply sorting
    const sortField = sort?.field || 'createdAt';
    const sortOrder = sort?.order || 'desc';
    const sortMap: Record<string, string> = {
      relevance: 't.title',
      createdAt: 't.created_at',
      updatedAt: 't.updated_at',
      priority: 't.priority',
      dueDate: 't.due_date'
    };
    sql += ` ORDER BY ${sortMap[sortField]} ${sortOrder.toUpperCase()}`;

    // Apply pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const tasks = this.db.prepare(sql).all(...params) as Task[];

    // Get facets
    const facets = await this.getFacets(userId, searchText, filters);

    return {
      items: tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets
    };
  }

  private async getFacets(userId: string, searchText?: string, _filters?: any): Promise<SearchFacets> {
    let baseSql = `
      SELECT t.* FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE (t.user_id = ? OR t.assignee_id = ? OR p.user_id = ?)
    `;
    const params: any[] = [userId, userId, userId];

    if (searchText) {
      baseSql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const searchPattern = `%${searchText}%`;
      params.push(searchPattern, searchPattern);
    }

    const statusFacets = this.db.prepare(`
      ${baseSql.replace('SELECT t.*', 'SELECT t.status, COUNT(*) as count')}
      GROUP BY t.status
    `).all(...params) as Array<{ status: string; count: number }>;

    const priorityFacets = this.db.prepare(`
      ${baseSql.replace('SELECT t.*', 'SELECT t.priority, COUNT(*) as count')}
      GROUP BY t.priority
    `).all(...params) as Array<{ priority: string; count: number }>;

    return {
      status: Object.fromEntries(statusFacets.map(f => [f.status, f.count])),
      priority: Object.fromEntries(priorityFacets.map(f => [f.priority, f.count])),
      assignee: {},
      project: {},
      tags: {}
    };
  }

  async getSuggestions(query: string, userId: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    const pattern = `%${query}%`;

    // Task suggestions
    const tasks = this.db.prepare(`
      SELECT title FROM tasks 
      WHERE (user_id = ? OR assignee_id = ?) AND title LIKE ?
      LIMIT 5
    `).all(userId, userId, pattern) as Array<{ title: string }>;

    tasks.forEach(t => {
      suggestions.push({ text: t.title, type: 'task', score: 1.0 });
    });

    // Project suggestions
    const projects = this.db.prepare(`
      SELECT name FROM projects 
      WHERE user_id = ? AND name LIKE ?
      LIMIT 3
    `).all(userId, pattern) as Array<{ name: string }>;

    projects.forEach(p => {
      suggestions.push({ text: p.name, type: 'project', score: 0.9 });
    });

    return suggestions.sort((a, b) => b.score - a.score);
  }

  async saveSearch(userId: string, name: string, query: SearchQuery): Promise<SavedSearch> {
    const id = `search_${Date.now()}`;
    const savedSearch: SavedSearch = {
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

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const searches = this.db.prepare(`
      SELECT * FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId) as any[];

    return searches.map(s => ({
      ...s,
      query: JSON.parse(s.query),
      isDefault: Boolean(s.is_default),
      createdAt: new Date(s.created_at)
    }));
  }

  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    this.db.prepare(`
      DELETE FROM saved_searches WHERE id = ? AND user_id = ?
    `).run(id, userId);
  }
}

export const searchService = new SearchService();
