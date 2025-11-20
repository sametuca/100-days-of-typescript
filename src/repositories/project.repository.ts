import { BaseRepository } from './base.repository';
import { Project, CreateProjectDto, UpdateProjectDto } from '../types';
import { ProjectModel } from '../models/project.model';
import db from '../database/connection';

export class ProjectRepository extends BaseRepository<Project> {
  
  constructor() {
    super('projects');
  }
  
  async create(createDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const project = ProjectModel.createProject(
      createDto.name,
      ownerId,
      createDto.description,
      createDto.color,
      createDto.memberIds
    );

    // Insert project
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description, owner_id, status, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      project.id,
      project.name,
      project.description,
      project.ownerId,
      project.status,
      project.color,
      project.createdAt.toISOString(),
      project.updatedAt.toISOString()
    );

    // Insert project members (including owner)
    await this.addMembers(project.id, project.memberIds);

    return project;
  }

  async findById(id: string): Promise<Project | null> {
    const stmt = db.prepare(`
      SELECT * FROM projects WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;

    // Get project members
    const memberIds = await this.getMemberIds(id);

    return this.mapRowToProject(row, memberIds);
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE owner_id = ? 
      ORDER BY updated_at DESC
    `);
    
    const rows = stmt.all(ownerId) as any[];
    
    const projects: Project[] = [];
    for (const row of rows) {
      const memberIds = await this.getMemberIds(row.id);
      projects.push(this.mapRowToProject(row, memberIds));
    }

    return projects;
  }

  async findByMemberId(userId: string): Promise<Project[]> {
    const stmt = db.prepare(`
      SELECT p.* FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
      ORDER BY p.updated_at DESC
    `);
    
    const rows = stmt.all(userId) as any[];
    
    const projects: Project[] = [];
    for (const row of rows) {
      const memberIds = await this.getMemberIds(row.id);
      projects.push(this.mapRowToProject(row, memberIds));
    }

    return projects;
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<Project | null> {
    const existingProject = await this.findById(id);
    if (!existingProject) return null;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateDto.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updateDto.name);
    }
    if (updateDto.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updateDto.description);
    }
    if (updateDto.color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(updateDto.color);
    }
    if (updateDto.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updateDto.status);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    const stmt = db.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...updateValues);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  async addMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const stmt = db.prepare(`
        INSERT INTO project_members (id, project_id, user_id)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(`pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, projectId, userId);
      return true;
    } catch (error) {
      // Unique constraint violation (user already member)
      return false;
    }
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const stmt = db.prepare(`
      DELETE FROM project_members 
      WHERE project_id = ? AND user_id = ?
    `);
    
    const result = stmt.run(projectId, userId);
    return result.changes > 0;
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const stmt = db.prepare(`
      SELECT 1 FROM project_members 
      WHERE project_id = ? AND user_id = ?
    `);
    
    return !!stmt.get(projectId, userId);
  }

  async getMemberIds(projectId: string): Promise<string[]> {
    const stmt = db.prepare(`
      SELECT user_id FROM project_members 
      WHERE project_id = ?
      ORDER BY joined_at ASC
    `);
    
    const rows = stmt.all(projectId) as any[];
    return rows.map(row => row.user_id);
  }

  async getProjectStats(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    memberCount: number;
  }> {
    // Get task stats
    const taskStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'DONE' THEN 1 ELSE 0 END) as pending
      FROM tasks 
      WHERE project_id = ?
    `);
    
    const taskStats = taskStmt.get(projectId) as any;
    
    // Get member count
    const memberStmt = db.prepare(`
      SELECT COUNT(*) as count FROM project_members WHERE project_id = ?
    `);
    
    const memberStats = memberStmt.get(projectId) as any;

    return {
      totalTasks: taskStats.total || 0,
      completedTasks: taskStats.completed || 0,
      pendingTasks: taskStats.pending || 0,
      memberCount: memberStats.count || 0
    };
  }

  private async addMembers(projectId: string, memberIds: string[]): Promise<void> {
    if (memberIds.length === 0) return;

    const stmt = db.prepare(`
      INSERT INTO project_members (id, project_id, user_id)
      VALUES (?, ?, ?)
    `);

    for (const userId of memberIds) {
      try {
        stmt.run(`pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, projectId, userId);
      } catch (error) {
        // Ignore duplicate member errors
      }
    }
  }

  private mapRowToProject(row: any, memberIds: string[]): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.owner_id,
      memberIds,
      status: row.status as 'ACTIVE' | 'ARCHIVED' | 'COMPLETED',
      color: row.color,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}