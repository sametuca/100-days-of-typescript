import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import {
    Membership,
    OrganizationRole,
    Permission,
    ROLE_PERMISSIONS,
    InviteMemberDto,
    UpdateMemberDto
} from '../types/organization.types';
import { RowDataPacket } from 'mysql2';

export class MembershipService {
    /**
     * Create a new membership (invite user)
     */
    async inviteMember(
        organizationId: string,
        data: InviteMemberDto,
        invitedBy: string
    ): Promise<Membership> {
        // Check if user exists
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [data.email]
        );

        if (userRows.length === 0) {
            throw new Error('User not found');
        }

        const userId = userRows[0].id;

        // Check if membership already exists
        const existing = await this.getMembershipByUserAndOrg(userId, organizationId);
        if (existing) {
            throw new Error('User is already a member of this organization');
        }

        const membershipId = uuidv4();
        const permissions = ROLE_PERMISSIONS[data.role];

        await pool.query(
            `INSERT INTO memberships (
        id, user_id, organization_id, role, permissions, 
        status, invited_by, invited_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                membershipId,
                userId,
                organizationId,
                data.role,
                JSON.stringify(permissions),
                'invited',
                invitedBy
            ]
        );

        // If team IDs provided, add to teams
        if (data.teamIds && data.teamIds.length > 0) {
            for (const teamId of data.teamIds) {
                await pool.query(
                    `UPDATE memberships SET team_id = ? WHERE id = ?`,
                    [teamId, membershipId]
                );
            }
        }

        return this.getMembershipById(membershipId);
    }

    /**
     * Accept invitation
     */
    async acceptInvitation(membershipId: string): Promise<Membership> {
        await pool.query(
            `UPDATE memberships 
       SET status = 'active', joined_at = NOW() 
       WHERE id = ? AND status = 'invited'`,
            [membershipId]
        );

        return this.getMembershipById(membershipId);
    }

    /**
     * Get membership by ID
     */
    async getMembershipById(membershipId: string): Promise<Membership> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM memberships WHERE id = ?',
            [membershipId]
        );

        if (rows.length === 0) {
            throw new Error('Membership not found');
        }

        return this.mapRowToMembership(rows[0]);
    }

    /**
     * Get membership by user and organization
     */
    async getMembershipByUserAndOrg(
        userId: string,
        organizationId: string
    ): Promise<Membership | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM memberships WHERE user_id = ? AND organization_id = ?',
            [userId, organizationId]
        );

        if (rows.length === 0) {
            return null;
        }

        return this.mapRowToMembership(rows[0]);
    }

    /**
     * Get all members of an organization
     */
    async getOrganizationMembers(organizationId: string): Promise<any[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        m.id as membership_id,
        m.role,
        m.status,
        m.joined_at,
        m.invited_at,
        u.id as user_id,
        u.email,
        u.name
       FROM memberships m
       INNER JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = ?
       ORDER BY m.created_at DESC`,
            [organizationId]
        );

        return rows;
    }

    /**
     * Update member role and permissions
     */
    async updateMember(
        membershipId: string,
        data: UpdateMemberDto
    ): Promise<Membership> {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.role !== undefined) {
            updates.push('role = ?');
            values.push(data.role);

            // Update permissions based on role
            const permissions = ROLE_PERMISSIONS[data.role];
            updates.push('permissions = ?');
            values.push(JSON.stringify(permissions));
        }

        if (data.permissions !== undefined) {
            updates.push('permissions = ?');
            values.push(JSON.stringify(data.permissions));
        }

        if (updates.length === 0) {
            return this.getMembershipById(membershipId);
        }

        updates.push('updated_at = NOW()');
        values.push(membershipId);

        await pool.query(
            `UPDATE memberships SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return this.getMembershipById(membershipId);
    }

    /**
     * Remove member from organization
     */
    async removeMember(membershipId: string): Promise<void> {
        await pool.query('DELETE FROM memberships WHERE id = ?', [membershipId]);
    }

    /**
     * Check if user has permission
     */
    async hasPermission(
        userId: string,
        organizationId: string,
        permission: Permission
    ): Promise<boolean> {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);

        if (!membership || membership.status !== 'active') {
            return false;
        }

        return membership.permissions.includes(permission);
    }

    /**
     * Check if user has any of the permissions
     */
    async hasAnyPermission(
        userId: string,
        organizationId: string,
        permissions: Permission[]
    ): Promise<boolean> {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);

        if (!membership || membership.status !== 'active') {
            return false;
        }

        return permissions.some(permission =>
            membership.permissions.includes(permission)
        );
    }

    /**
     * Check if user has all permissions
     */
    async hasAllPermissions(
        userId: string,
        organizationId: string,
        permissions: Permission[]
    ): Promise<boolean> {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);

        if (!membership || membership.status !== 'active') {
            return false;
        }

        return permissions.every(permission =>
            membership.permissions.includes(permission)
        );
    }

    /**
     * Map database row to Membership object
     */
    private mapRowToMembership(row: any): Membership {
        return {
            id: row.id,
            userId: row.user_id,
            organizationId: row.organization_id,
            teamId: row.team_id,
            role: row.role,
            permissions: typeof row.permissions === 'string'
                ? JSON.parse(row.permissions)
                : row.permissions,
            status: row.status,
            invitedBy: row.invited_by,
            invitedAt: row.invited_at,
            joinedAt: row.joined_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

export default new MembershipService();
