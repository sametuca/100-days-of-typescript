import { Request, Response } from 'express';
import OrganizationService from '../services/organization.service';
import MembershipService from '../services/membership.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../types/organization.types';

export class OrganizationController {
    /**
     * Create new organization
     */
    async createOrganization(req: Request, res: Response) {
        try {
            const data: CreateOrganizationDto = req.body;
            const userId = req.user!.id;

            // Validate slug availability
            const isAvailable = await OrganizationService.isSlugAvailable(data.slug);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    error: 'Organization slug already taken'
                });
            }

            const organization = await OrganizationService.createOrganization(data, userId);

            res.status(201).json({
                success: true,
                data: organization
            });
        } catch (error: any) {
            console.error('Create organization error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create organization'
            });
        }
    }

    /**
     * Get organization by ID
     */
    async getOrganization(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const organization = await OrganizationService.getOrganizationById(orgId);

            res.json({
                success: true,
                data: organization
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                error: error.message || 'Organization not found'
            });
        }
    }

    /**
     * Get user's organizations
     */
    async getUserOrganizations(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const organizations = await OrganizationService.getUserOrganizations(userId);

            res.json({
                success: true,
                data: organizations
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch organizations'
            });
        }
    }

    /**
     * Update organization
     */
    async updateOrganization(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const data: UpdateOrganizationDto = req.body;

            const organization = await OrganizationService.updateOrganization(orgId, data);

            res.json({
                success: true,
                data: organization
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update organization'
            });
        }
    }

    /**
     * Delete organization
     */
    async deleteOrganization(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            await OrganizationService.deleteOrganization(orgId);

            res.json({
                success: true,
                message: 'Organization deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete organization'
            });
        }
    }

    /**
     * Get organization members
     */
    async getMembers(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const members = await MembershipService.getOrganizationMembers(orgId);

            res.json({
                success: true,
                data: members
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch members'
            });
        }
    }

    /**
     * Invite member to organization
     */
    async inviteMember(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const invitedBy = req.user!.id;
            const membership = await MembershipService.inviteMember(orgId, req.body, invitedBy);

            res.status(201).json({
                success: true,
                data: membership,
                message: 'Invitation sent successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to invite member'
            });
        }
    }

    /**
     * Update member role
     */
    async updateMember(req: Request, res: Response) {
        try {
            const { orgId, userId } = req.params;

            const membership = await MembershipService.getMembershipByUserAndOrg(userId, orgId);
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    error: 'Member not found'
                });
            }

            const updated = await MembershipService.updateMember(membership.id, req.body);

            res.json({
                success: true,
                data: updated
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update member'
            });
        }
    }

    /**
     * Remove member from organization
     */
    async removeMember(req: Request, res: Response) {
        try {
            const { orgId, userId } = req.params;

            const membership = await MembershipService.getMembershipByUserAndOrg(userId, orgId);
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    error: 'Member not found'
                });
            }

            await MembershipService.removeMember(membership.id);

            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to remove member'
            });
        }
    }

    /**
     * Update subscription plan
     */
    async updateSubscription(req: Request, res: Response) {
        try {
            const { orgId } = req.params;
            const { plan } = req.body;

            const organization = await OrganizationService.updateSubscriptionPlan(orgId, plan);

            res.json({
                success: true,
                data: organization,
                message: 'Subscription updated successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update subscription'
            });
        }
    }
}

export default new OrganizationController();
