
import { BaseRepository } from './base.repository';
import { Task, TaskStatus, TaskPriority, CreateTaskDto, UpdateTaskDto, TaskFilter } from '../types';


export class TaskRepository extends BaseRepository<Task> {
  
  constructor() {
    // 'tasks' = Tablo adı
    super('tasks');
  }
  
  
  public create(taskData: CreateTaskDto, userId: string): Promise<Task> {
    
    const id = this.generateId();
    
    const now = new Date().toISOString();
    
    // tags'i JSON string'e çevir
    // SQLite'da array yok, JSON olarak saklarız
    // JSON.stringify(['tag1', 'tag2']) → '["tag1","tag2"]'
    const tags = taskData.tags ? JSON.stringify(taskData.tags) : null;
    
    // SQL INSERT query hazırla
    // ? = Placeholder (parametre)
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, 
        user_id, project_id, due_date, tags, 
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    

    stmt.run(
      id,
      taskData.title,
      taskData.description || null,           // undefined → null
      taskData.status || TaskStatus.TODO,     // Default: TODO
      taskData.priority || TaskPriority.MEDIUM, // Default: MEDIUM
      userId,
      taskData.projectId || null,
      taskData.dueDate || null,
      tags,
      now,  // created_at
      now   // updated_at
    );
    

    return this.findById(id) as Promise<Task>;
  }
  
  public update(id: string, taskData: UpdateTaskDto): Promise<Task | null> {
    
    const existingTask = this.db.prepare(`
      SELECT * FROM tasks WHERE id = ?
    `).get(id) as Task | undefined;
    
    if (!existingTask) {
      return Promise.resolve(null);
    }
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    // title gönderildiyse ekle
    if (taskData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(taskData.title);
    }
    
    // description gönderildiyse ekle
    if (taskData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(taskData.description);
    }
    
    // status gönderildiyse ekle
    if (taskData.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(taskData.status);
    }
    
    // priority gönderildiyse ekle
    if (taskData.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(taskData.priority);
    }
    
    // projectId gönderildiyse ekle
    if (taskData.projectId !== undefined) {
      updateFields.push('project_id = ?');
      updateValues.push(taskData.projectId);
    }
    
    // dueDate gönderildiyse ekle
    if (taskData.dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(taskData.dueDate);
    }
    
    // tags gönderildiyse ekle
    if (taskData.tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(taskData.tags));
    }
    
    // updated_at her zaman güncelle
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    
    // Eğer hiçbir alan güncellenmeyecekse mevcut task'ı döndür
    if (updateFields.length === 1) { // Sadece updated_at var
      return Promise.resolve(existingTask);
    }
    
    // SQL UPDATE query oluştur
    // updateFields.join(', ') = 'title = ?, status = ?, updated_at = ?'
    const sql = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    // ID'yi de parametre olarak ekle (WHERE için)
    updateValues.push(id);
    
    // Query'yi çalıştır
    const stmt = this.db.prepare(sql);
    stmt.run(...updateValues); // Spread operator ile tüm parametreleri ver
    
    // Güncellenmiş task'ı döndür
    return this.findById(id) as Promise<Task>;
  }
  
  public findByUserId(userId: string): Promise<Task[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE user_id = ?
    `);
    
    const rows = stmt.all(userId) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  public findByProjectId(projectId: string): Promise<Task[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE project_id = ?
    `);
    
    const rows = stmt.all(projectId) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  public findByStatus(status: TaskStatus): Promise<Task[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE status = ?
    `);
    
    const rows = stmt.all(status) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  public findByPriority(priority: TaskPriority): Promise<Task[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE priority = ?
    `);
    
    const rows = stmt.all(priority) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  public search(query: string): Promise<Task[]> {

    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE title LIKE ? OR description LIKE ?
    `);
    
    // Query'nin etrafına % ekle
    const searchPattern = `%${query}%`;
    
    const rows = stmt.all(searchPattern, searchPattern) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  public findWithFilters(filters: {
    userId?: string;
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    
    // WHERE clause'ları ve parametreleri dinamik oluştur
    const whereClauses: string[] = [];
    const params: any[] = [];
    
    // userId filtresi
    if (filters.userId) {
      whereClauses.push('user_id = ?');
      params.push(filters.userId);
    }
    
    // projectId filtresi
    if (filters.projectId) {
      whereClauses.push('project_id = ?');
      params.push(filters.projectId);
    }
    
    // status filtresi
    if (filters.status) {
      whereClauses.push('status = ?');
      params.push(filters.status);
    }
    
    // priority filtresi
    if (filters.priority) {
      whereClauses.push('priority = ?');
      params.push(filters.priority);
    }
    
    // search filtresi
    if (filters.search) {
      whereClauses.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    // SQL query oluştur
    let sql = 'SELECT * FROM tasks';
    
    // Eğer filtre varsa WHERE ekle
    if (whereClauses.length > 0) {
      // whereClauses.join(' AND ') = 'user_id = ? AND status = ?'
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    // Query'yi çalıştır
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Task[];
    
    return Promise.resolve(this.parseTasks(rows));
  }
  
  private parseTasks(tasks: any[]): Task[] {
    return tasks.map(task => ({
      ...task,
      // tags: JSON string'i array'e çevir
      // task.tags varsa parse et, yoksa []
      tags: task.tags ? JSON.parse(task.tags) : [],
      
      // due_date: String'den Date'e çevir
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      
      // created_at: String'den Date'e çevir
      createdAt: new Date(task.created_at),
      
      // updated_at: String'den Date'e çevir
      updatedAt: new Date(task.updated_at),
      
      // Snake_case → camelCase dönüşümü
      userId: task.user_id,
      projectId: task.project_id,
      
      // Gereksiz alanları çıkar (snake_case'ler)
      user_id: undefined,
      project_id: undefined,
      due_date: undefined,
      created_at: undefined,
      updated_at: undefined
    }));
  }
  
  // Gerçek projede: UUID kullanılmalı
  
  private idCounter: number = 1000;
  
  private generateId(): string {
    return `task_${this.idCounter++}`;
  }

  // Day 23: Gelişmiş filtering ve arama
  public findAllPaginated(
    page: number,
    limit: number,
    filters?: TaskFilter,
    sortOptions?: { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  ): Promise<{ tasks: Task[]; total: number }> {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters?.userId) {
      whereClauses.push('user_id = ?');
      params.push(filters.userId);
    }

    // Multiple status filtering
    if (filters?.status && filters.status.length > 0) {
      const statusPlaceholders = filters.status.map(() => '?').join(',');
      whereClauses.push(`status IN (${statusPlaceholders})`);
      params.push(...filters.status);
    }

    // Multiple priority filtering
    if (filters?.priority && filters.priority.length > 0) {
      const priorityPlaceholders = filters.priority.map(() => '?').join(',');
      whereClauses.push(`priority IN (${priorityPlaceholders})`);
      params.push(...filters.priority);
    }

    // Date range filtering
    if (filters?.startDate) {
      whereClauses.push('created_at >= ?');
      params.push(filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      whereClauses.push('created_at <= ?');
      params.push(filters.endDate.toISOString());
    }

    // Text search in title and description
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

    // Dynamic sorting
    const sortBy = sortOptions?.sortBy || 'created_at';
    const sortOrder = sortOptions?.sortOrder || 'desc';
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;

    const offset = (page - 1) * limit;
    const queryParams = [...params, limit, offset];

    const countStmt = this.db.prepare(countSql);
    const countResult = countStmt.get(...params) as { total: number };
    const total = countResult.total;

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...queryParams) as any[];

    const tasks = this.parseTasks(rows);

    return Promise.resolve({ tasks, total });
  }
}

export const taskRepository = new TaskRepository();