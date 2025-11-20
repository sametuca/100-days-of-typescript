"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const base_repository_1 = require("./base.repository");
const project_model_1 = require("../models/project.model");
const connection_1 = __importDefault(require("../database/connection"));
class ProjectRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('projects');
    }
    async create(createDto, ownerId) {
        const project = project_model_1.ProjectModel.createProject(createDto.name, ownerId, createDto.description, createDto.color, createDto.memberIds);
        const stmt = connection_1.default.prepare(`
      INSERT INTO projects (id, name, description, owner_id, status, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(project.id, project.name, project.description, project.ownerId, project.status, project.color, project.createdAt.toISOString(), project.updatedAt.toISOString());
        await this.addMembers(project.id, project.memberIds);
        return project;
    }
    async findById(id) {
        const stmt = connection_1.default.prepare(`
      SELECT * FROM projects WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        const memberIds = await this.getMemberIds(id);
        return this.mapRowToProject(row, memberIds);
    }
    async findByOwnerId(ownerId) {
        const stmt = connection_1.default.prepare(`
      SELECT * FROM projects 
      WHERE owner_id = ? 
      ORDER BY updated_at DESC
    `);
        const rows = stmt.all(ownerId);
        const projects = [];
        for (const row of rows) {
            const memberIds = await this.getMemberIds(row.id);
            projects.push(this.mapRowToProject(row, memberIds));
        }
        return projects;
    }
    async findByMemberId(userId) {
        const stmt = connection_1.default.prepare(`
      SELECT p.* FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
      ORDER BY p.updated_at DESC
    `);
        const rows = stmt.all(userId);
        const projects = [];
        for (const row of rows) {
            const memberIds = await this.getMemberIds(row.id);
            projects.push(this.mapRowToProject(row, memberIds));
        }
        return projects;
    }
    async update(id, updateDto) {
        const existingProject = await this.findById(id);
        if (!existingProject)
            return null;
        const updateFields = [];
        const updateValues = [];
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
        const stmt = connection_1.default.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
        stmt.run(...updateValues);
        return this.findById(id);
    }
    async delete(id) {
        const stmt = connection_1.default.prepare('DELETE FROM projects WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    async addMember(projectId, userId) {
        try {
            const stmt = connection_1.default.prepare(`
        INSERT INTO project_members (id, project_id, user_id)
        VALUES (?, ?, ?)
      `);
            stmt.run(`pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, projectId, userId);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async removeMember(projectId, userId) {
        const stmt = connection_1.default.prepare(`
      DELETE FROM project_members 
      WHERE project_id = ? AND user_id = ?
    `);
        const result = stmt.run(projectId, userId);
        return result.changes > 0;
    }
    async isMember(projectId, userId) {
        const stmt = connection_1.default.prepare(`
      SELECT 1 FROM project_members 
      WHERE project_id = ? AND user_id = ?
    `);
        return !!stmt.get(projectId, userId);
    }
    async getMemberIds(projectId) {
        const stmt = connection_1.default.prepare(`
      SELECT user_id FROM project_members 
      WHERE project_id = ?
      ORDER BY joined_at ASC
    `);
        const rows = stmt.all(projectId);
        return rows.map(row => row.user_id);
    }
    async getProjectStats(projectId) {
        const taskStmt = connection_1.default.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'DONE' THEN 1 ELSE 0 END) as pending
      FROM tasks 
      WHERE project_id = ?
    `);
        const taskStats = taskStmt.get(projectId);
        const memberStmt = connection_1.default.prepare(`
      SELECT COUNT(*) as count FROM project_members WHERE project_id = ?
    `);
        const memberStats = memberStmt.get(projectId);
        return {
            totalTasks: taskStats.total || 0,
            completedTasks: taskStats.completed || 0,
            pendingTasks: taskStats.pending || 0,
            memberCount: memberStats.count || 0
        };
    }
    async addMembers(projectId, memberIds) {
        if (memberIds.length === 0)
            return;
        const stmt = connection_1.default.prepare(`
      INSERT INTO project_members (id, project_id, user_id)
      VALUES (?, ?, ?)
    `);
        for (const userId of memberIds) {
            try {
                stmt.run(`pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, projectId, userId);
            }
            catch (error) {
            }
        }
    }
    mapRowToProject(row, memberIds) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            ownerId: row.owner_id,
            memberIds,
            status: row.status,
            color: row.color,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
exports.ProjectRepository = ProjectRepository;
//# sourceMappingURL=project.repository.js.map