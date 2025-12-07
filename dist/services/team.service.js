"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class TeamService {
    async createTeam(organizationId, data) {
        const teamId = (0, uuid_1.v4)();
        const defaultSettings = {
            visibility: 'private',
            defaultRole: 'member'
        };
        const settings = { ...defaultSettings, ...data.settings };
        await database_1.default.query(`INSERT INTO teams (
        id, organization_id, name, description, avatar, settings
      ) VALUES (?, ?, ?, ?, ?, ?)`, [
            teamId,
            organizationId,
            data.name,
            data.description || null,
            data.avatar || null,
            JSON.stringify(settings)
        ]);
        return this.getTeamById(teamId);
    }
    async getTeamById(teamId) {
        const [rows] = await database_1.default.query('SELECT * FROM teams WHERE id = ?', [teamId]);
        if (rows.length === 0) {
            throw new Error('Team not found');
        }
        return this.mapRowToTeam(rows[0]);
    }
    async getOrganizationTeams(organizationId) {
        const [rows] = await database_1.default.query('SELECT * FROM teams WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
        return rows.map(row => this.mapRowToTeam(row));
    }
    async getUserTeams(userId, organizationId) {
        const [rows] = await database_1.default.query(`SELECT t.* FROM teams t
       INNER JOIN memberships m ON t.id = m.team_id
       WHERE m.user_id = ? AND t.organization_id = ? AND m.status = 'active'
       ORDER BY t.created_at DESC`, [userId, organizationId]);
        return rows.map(row => this.mapRowToTeam(row));
    }
    async updateTeam(teamId, data) {
        const team = await this.getTeamById(teamId);
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.avatar !== undefined) {
            updates.push('avatar = ?');
            values.push(data.avatar);
        }
        if (data.settings !== undefined) {
            const newSettings = { ...team.settings, ...data.settings };
            updates.push('settings = ?');
            values.push(JSON.stringify(newSettings));
        }
        if (updates.length === 0) {
            return team;
        }
        updates.push('updated_at = NOW()');
        values.push(teamId);
        await database_1.default.query(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.getTeamById(teamId);
    }
    async deleteTeam(teamId) {
        await database_1.default.query('DELETE FROM teams WHERE id = ?', [teamId]);
    }
    async addTeamMember(teamId, userId, organizationId) {
        await database_1.default.query(`UPDATE memberships 
       SET team_id = ? 
       WHERE user_id = ? AND organization_id = ?`, [teamId, userId, organizationId]);
    }
    async removeTeamMember(teamId, userId) {
        await database_1.default.query(`UPDATE memberships 
       SET team_id = NULL 
       WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
    }
    async getTeamMembers(teamId) {
        const [rows] = await database_1.default.query(`SELECT u.id, u.email, u.name, m.role, m.status
       FROM memberships m
       INNER JOIN users u ON m.user_id = u.id
       WHERE m.team_id = ? AND m.status = 'active'`, [teamId]);
        return rows;
    }
    mapRowToTeam(row) {
        return {
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            description: row.description,
            avatar: row.avatar,
            settings: typeof row.settings === 'string'
                ? JSON.parse(row.settings)
                : row.settings,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
exports.TeamService = TeamService;
exports.default = new TeamService();
//# sourceMappingURL=team.service.js.map