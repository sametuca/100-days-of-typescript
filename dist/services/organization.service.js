"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const organization_types_1 = require("../types/organization.types");
class OrganizationService {
    async createOrganization(data, ownerId) {
        const connection = await database_1.default.getConnection();
        try {
            await connection.beginTransaction();
            const organizationId = (0, uuid_1.v4)();
            const defaultSettings = {
                theme: {
                    primaryColor: '#3B82F6'
                },
                features: {
                    aiAnalysis: false,
                    advancedSecurity: false,
                    customWorkflows: false
                },
                limits: organization_types_1.SUBSCRIPTION_PLANS.free.limits
            };
            await connection.query(`INSERT INTO organizations (
          id, name, slug, description, logo, website, 
          settings, subscription_plan, subscription_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                organizationId,
                data.name,
                data.slug,
                data.description || null,
                data.logo || null,
                data.website || null,
                JSON.stringify(defaultSettings),
                'free',
                'active'
            ]);
            const membershipId = (0, uuid_1.v4)();
            await connection.query(`INSERT INTO memberships (
          id, user_id, organization_id, role, permissions, status, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [
                membershipId,
                ownerId,
                organizationId,
                'owner',
                JSON.stringify(['org:manage', 'org:settings', 'org:billing']),
                'active'
            ]);
            await connection.commit();
            return this.getOrganizationById(organizationId);
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getOrganizationById(organizationId) {
        const [rows] = await database_1.default.query('SELECT * FROM organizations WHERE id = ?', [organizationId]);
        if (rows.length === 0) {
            throw new Error('Organization not found');
        }
        return this.mapRowToOrganization(rows[0]);
    }
    async getOrganizationBySlug(slug) {
        const [rows] = await database_1.default.query('SELECT * FROM organizations WHERE slug = ?', [slug]);
        if (rows.length === 0) {
            throw new Error('Organization not found');
        }
        return this.mapRowToOrganization(rows[0]);
    }
    async getUserOrganizations(userId) {
        const [rows] = await database_1.default.query(`SELECT o.* FROM organizations o
       INNER JOIN memberships m ON o.id = m.organization_id
       WHERE m.user_id = ? AND m.status = 'active'
       ORDER BY o.created_at DESC`, [userId]);
        return rows.map(row => this.mapRowToOrganization(row));
    }
    async updateOrganization(organizationId, data) {
        const org = await this.getOrganizationById(organizationId);
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
        if (data.logo !== undefined) {
            updates.push('logo = ?');
            values.push(data.logo);
        }
        if (data.website !== undefined) {
            updates.push('website = ?');
            values.push(data.website);
        }
        if (data.settings !== undefined) {
            const newSettings = { ...org.settings, ...data.settings };
            updates.push('settings = ?');
            values.push(JSON.stringify(newSettings));
        }
        if (updates.length === 0) {
            return org;
        }
        updates.push('updated_at = NOW()');
        values.push(organizationId);
        await database_1.default.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.getOrganizationById(organizationId);
    }
    async deleteOrganization(organizationId) {
        await database_1.default.query('DELETE FROM organizations WHERE id = ?', [organizationId]);
    }
    async updateSubscriptionPlan(organizationId, plan) {
        const planConfig = organization_types_1.SUBSCRIPTION_PLANS[plan];
        await database_1.default.query(`UPDATE organizations 
       SET subscription_plan = ?, 
           settings = JSON_SET(settings, '$.limits', ?)
       WHERE id = ?`, [plan, JSON.stringify(planConfig.limits), organizationId]);
        return this.getOrganizationById(organizationId);
    }
    async isSlugAvailable(slug) {
        const [rows] = await database_1.default.query('SELECT COUNT(*) as count FROM organizations WHERE slug = ?', [slug]);
        return rows[0].count === 0;
    }
    mapRowToOrganization(row) {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            logo: row.logo,
            website: row.website,
            settings: typeof row.settings === 'string'
                ? JSON.parse(row.settings)
                : row.settings,
            subscriptionPlan: row.subscription_plan,
            subscriptionStatus: row.subscription_status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
exports.OrganizationService = OrganizationService;
exports.default = new OrganizationService();
//# sourceMappingURL=organization.service.js.map