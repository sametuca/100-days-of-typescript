import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import {
    Organization,
    CreateOrganizationDto,
    UpdateOrganizationDto,
    OrganizationSettings,
    SUBSCRIPTION_PLANS,
    SubscriptionPlanName
} from '../types/organization.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class OrganizationService {
    /**
     * Create a new organization
     */
    async createOrganization(
        data: CreateOrganizationDto,
        ownerId: string
    ): Promise<Organization> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const organizationId = uuidv4();
            const defaultSettings: OrganizationSettings = {
                theme: {
                    primaryColor: '#3B82F6'
                },
                features: {
                    aiAnalysis: false,
                    advancedSecurity: false,
                    customWorkflows: false
                },
                limits: SUBSCRIPTION_PLANS.free.limits
            };

            // Create organization
            await connection.query(
                `INSERT INTO organizations (
          id, name, slug, description, logo, website, 
          settings, subscription_plan, subscription_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    organizationId,
                    data.name,
                    data.slug,
                    data.description || null,
                    data.logo || null,
                    data.website || null,
                    JSON.stringify(defaultSettings),
                    'free',
                    'active'
                ]
            );

            // Create owner membership
            const membershipId = uuidv4();
            await connection.query(
                `INSERT INTO memberships (
          id, user_id, organization_id, role, permissions, status, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [
                    membershipId,
                    ownerId,
                    organizationId,
                    'owner',
                    JSON.stringify(['org:manage', 'org:settings', 'org:billing']),
                    'active'
                ]
            );

            await connection.commit();

            return this.getOrganizationById(organizationId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get organization by ID
     */
    async getOrganizationById(organizationId: string): Promise<Organization> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM organizations WHERE id = ?',
            [organizationId]
        );

        if (rows.length === 0) {
            throw new Error('Organization not found');
        }

        return this.mapRowToOrganization(rows[0]);
    }

    /**
     * Get organization by slug
     */
    async getOrganizationBySlug(slug: string): Promise<Organization> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM organizations WHERE slug = ?',
            [slug]
        );

        if (rows.length === 0) {
            throw new Error('Organization not found');
        }

        return this.mapRowToOrganization(rows[0]);
    }

    /**
     * Get all organizations for a user
     */
    async getUserOrganizations(userId: string): Promise<Organization[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT o.* FROM organizations o
       INNER JOIN memberships m ON o.id = m.organization_id
       WHERE m.user_id = ? AND m.status = 'active'
       ORDER BY o.created_at DESC`,
            [userId]
        );

        return rows.map(row => this.mapRowToOrganization(row));
    }

    /**
     * Update organization
     */
    async updateOrganization(
        organizationId: string,
        data: UpdateOrganizationDto
    ): Promise<Organization> {
        const org = await this.getOrganizationById(organizationId);

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

        await pool.query(
            `UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return this.getOrganizationById(organizationId);
    }

    /**
     * Delete organization
     */
    async deleteOrganization(organizationId: string): Promise<void> {
        await pool.query('DELETE FROM organizations WHERE id = ?', [organizationId]);
    }

    /**
     * Update subscription plan
     */
    async updateSubscriptionPlan(
        organizationId: string,
        plan: SubscriptionPlanName
    ): Promise<Organization> {
        const planConfig = SUBSCRIPTION_PLANS[plan];

        await pool.query(
            `UPDATE organizations 
       SET subscription_plan = ?, 
           settings = JSON_SET(settings, '$.limits', ?)
       WHERE id = ?`,
            [plan, JSON.stringify(planConfig.limits), organizationId]
        );

        return this.getOrganizationById(organizationId);
    }

    /**
     * Check if slug is available
     */
    async isSlugAvailable(slug: string): Promise<boolean> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM organizations WHERE slug = ?',
            [slug]
        );

        return rows[0].count === 0;
    }

    /**
     * Map database row to Organization object
     */
    private mapRowToOrganization(row: any): Organization {
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

export default new OrganizationService();
