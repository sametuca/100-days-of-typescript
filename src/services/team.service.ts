import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Team, CreateTeamDto, UpdateTeamDto, TeamSettings } from '../types/organization.types';
import { RowDataPacket } from 'mysql2';

export class TeamService {
    /**
     * Create a new team
     */
    async createTeam(
        organizationId: string,
        data: CreateTeamDto
    ): Promise<Team> {
        const teamId = uuidv4();
        const defaultSettings: TeamSettings = {
            visibility: 'private',
            defaultRole: 'member'
        };

        const settings = { ...defaultSettings, ...data.settings };

        await pool.query(
            `INSERT INTO teams (
        id, organization_id, name, description, avatar, settings
      ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                teamId,
                organizationId,
                data.name,
                data.description || null,
                data.avatar || null,
                JSON.stringify(settings)
            ]
        );

        return this.getTeamById(teamId);
    }

    /**
     * Get team by ID
     */
    async getTeamById(teamId: string): Promise<Team> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM teams WHERE id = ?',
            [teamId]
        );

        if (rows.length === 0) {
            throw new Error('Team not found');
        }

        return this.mapRowToTeam(rows[0]);
    }

    /**
     * Get all teams in an organization
     */
    async getOrganizationTeams(organizationId: string): Promise<Team[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM teams WHERE organization_id = ? ORDER BY created_at DESC',
            [organizationId]
        );

        return rows.map(row => this.mapRowToTeam(row));
    }

    /**
     * Get teams for a user
     */
    async getUserTeams(userId: string, organizationId: string): Promise<Team[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT t.* FROM teams t
       INNER JOIN memberships m ON t.id = m.team_id
       WHERE m.user_id = ? AND t.organization_id = ? AND m.status = 'active'
       ORDER BY t.created_at DESC`,
            [userId, organizationId]
        );

        return rows.map(row => this.mapRowToTeam(row));
    }

    /**
     * Update team
     */
    async updateTeam(teamId: string, data: UpdateTeamDto): Promise<Team> {
        const team = await this.getTeamById(teamId);

        const updates: string[] = [];
        const values: any[] = [];

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

        await pool.query(
            `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return this.getTeamById(teamId);
    }

    /**
     * Delete team
     */
    async deleteTeam(teamId: string): Promise<void> {
        await pool.query('DELETE FROM teams WHERE id = ?', [teamId]);
    }

    /**
     * Add member to team
     */
    async addTeamMember(
        teamId: string,
        userId: string,
        organizationId: string
    ): Promise<void> {
        await pool.query(
            `UPDATE memberships 
       SET team_id = ? 
       WHERE user_id = ? AND organization_id = ?`,
            [teamId, userId, organizationId]
        );
    }

    /**
     * Remove member from team
     */
    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        await pool.query(
            `UPDATE memberships 
       SET team_id = NULL 
       WHERE user_id = ? AND team_id = ?`,
            [userId, teamId]
        );
    }

    /**
     * Get team members
     */
    async getTeamMembers(teamId: string): Promise<any[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT u.id, u.email, u.name, m.role, m.status
       FROM memberships m
       INNER JOIN users u ON m.user_id = u.id
       WHERE m.team_id = ? AND m.status = 'active'`,
            [teamId]
        );

        return rows;
    }

    /**
     * Map database row to Team object
     */
    private mapRowToTeam(row: any): Team {
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

export default new TeamService();
