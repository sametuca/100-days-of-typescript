"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const organization_types_1 = require("../types/organization.types");
class MembershipService {
    async inviteMember(organizationId, data, invitedBy) {
        const [userRows] = await database_1.default.query('SELECT id FROM users WHERE email = ?', [data.email]);
        if (userRows.length === 0) {
            throw new Error('User not found');
        }
        const userId = userRows[0].id;
        const existing = await this.getMembershipByUserAndOrg(userId, organizationId);
        if (existing) {
            throw new Error('User is already a member of this organization');
        }
        const membershipId = (0, uuid_1.v4)();
        const permissions = organization_types_1.ROLE_PERMISSIONS[data.role];
        await database_1.default.query(`INSERT INTO memberships (
        id, user_id, organization_id, role, permissions, 
        status, invited_by, invited_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
            membershipId,
            userId,
            organizationId,
            data.role,
            JSON.stringify(permissions),
            'invited',
            invitedBy
        ]);
        if (data.teamIds && data.teamIds.length > 0) {
            for (const teamId of data.teamIds) {
                await database_1.default.query(`UPDATE memberships SET team_id = ? WHERE id = ?`, [teamId, membershipId]);
            }
        }
        return this.getMembershipById(membershipId);
    }
    async acceptInvitation(membershipId) {
        await database_1.default.query(`UPDATE memberships 
       SET status = 'active', joined_at = NOW() 
       WHERE id = ? AND status = 'invited'`, [membershipId]);
        return this.getMembershipById(membershipId);
    }
    async getMembershipById(membershipId) {
        const [rows] = await database_1.default.query('SELECT * FROM memberships WHERE id = ?', [membershipId]);
        if (rows.length === 0) {
            throw new Error('Membership not found');
        }
        return this.mapRowToMembership(rows[0]);
    }
    async getMembershipByUserAndOrg(userId, organizationId) {
        const [rows] = await database_1.default.query('SELECT * FROM memberships WHERE user_id = ? AND organization_id = ?', [userId, organizationId]);
        if (rows.length === 0) {
            return null;
        }
        return this.mapRowToMembership(rows[0]);
    }
    async getOrganizationMembers(organizationId) {
        const [rows] = await database_1.default.query(`SELECT 
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
       ORDER BY m.created_at DESC`, [organizationId]);
        return rows;
    }
    async updateMember(membershipId, data) {
        const updates = [];
        const values = [];
        if (data.role !== undefined) {
            updates.push('role = ?');
            values.push(data.role);
            const permissions = organization_types_1.ROLE_PERMISSIONS[data.role];
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
        await database_1.default.query(`UPDATE memberships SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.getMembershipById(membershipId);
    }
    async removeMember(membershipId) {
        await database_1.default.query('DELETE FROM memberships WHERE id = ?', [membershipId]);
    }
    async hasPermission(userId, organizationId, permission) {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);
        if (!membership || membership.status !== 'active') {
            return false;
        }
        return membership.permissions.includes(permission);
    }
    async hasAnyPermission(userId, organizationId, permissions) {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);
        if (!membership || membership.status !== 'active') {
            return false;
        }
        return permissions.some(permission => membership.permissions.includes(permission));
    }
    async hasAllPermissions(userId, organizationId, permissions) {
        const membership = await this.getMembershipByUserAndOrg(userId, organizationId);
        if (!membership || membership.status !== 'active') {
            return false;
        }
        return permissions.every(permission => membership.permissions.includes(permission));
    }
    mapRowToMembership(row) {
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
exports.MembershipService = MembershipService;
exports.default = new MembershipService();
//# sourceMappingURL=membership.service.js.map