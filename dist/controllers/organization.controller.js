"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const organization_service_1 = __importDefault(require("../services/organization.service"));
const membership_service_1 = __importDefault(require("../services/membership.service"));
class OrganizationController {
    async createOrganization(req, res) {
        try {
            const data = req.body;
            const userId = req.user.id;
            const isAvailable = await organization_service_1.default.isSlugAvailable(data.slug);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    error: 'Organization slug already taken'
                });
            }
            const organization = await organization_service_1.default.createOrganization(data, userId);
            res.status(201).json({
                success: true,
                data: organization
            });
        }
        catch (error) {
            console.error('Create organization error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create organization'
            });
        }
    }
    async getOrganization(req, res) {
        try {
            const { orgId } = req.params;
            const organization = await organization_service_1.default.getOrganizationById(orgId);
            res.json({
                success: true,
                data: organization
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error.message || 'Organization not found'
            });
        }
    }
    async getUserOrganizations(req, res) {
        try {
            const userId = req.user.id;
            const organizations = await organization_service_1.default.getUserOrganizations(userId);
            res.json({
                success: true,
                data: organizations
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch organizations'
            });
        }
    }
    async updateOrganization(req, res) {
        try {
            const { orgId } = req.params;
            const data = req.body;
            const organization = await organization_service_1.default.updateOrganization(orgId, data);
            res.json({
                success: true,
                data: organization
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update organization'
            });
        }
    }
    async deleteOrganization(req, res) {
        try {
            const { orgId } = req.params;
            await organization_service_1.default.deleteOrganization(orgId);
            res.json({
                success: true,
                message: 'Organization deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete organization'
            });
        }
    }
    async getMembers(req, res) {
        try {
            const { orgId } = req.params;
            const members = await membership_service_1.default.getOrganizationMembers(orgId);
            res.json({
                success: true,
                data: members
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch members'
            });
        }
    }
    async inviteMember(req, res) {
        try {
            const { orgId } = req.params;
            const invitedBy = req.user.id;
            const membership = await membership_service_1.default.inviteMember(orgId, req.body, invitedBy);
            res.status(201).json({
                success: true,
                data: membership,
                message: 'Invitation sent successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to invite member'
            });
        }
    }
    async updateMember(req, res) {
        try {
            const { orgId, userId } = req.params;
            const membership = await membership_service_1.default.getMembershipByUserAndOrg(userId, orgId);
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    error: 'Member not found'
                });
            }
            const updated = await membership_service_1.default.updateMember(membership.id, req.body);
            res.json({
                success: true,
                data: updated
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update member'
            });
        }
    }
    async removeMember(req, res) {
        try {
            const { orgId, userId } = req.params;
            const membership = await membership_service_1.default.getMembershipByUserAndOrg(userId, orgId);
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    error: 'Member not found'
                });
            }
            await membership_service_1.default.removeMember(membership.id);
            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to remove member'
            });
        }
    }
    async updateSubscription(req, res) {
        try {
            const { orgId } = req.params;
            const { plan } = req.body;
            const organization = await organization_service_1.default.updateSubscriptionPlan(orgId, plan);
            res.json({
                success: true,
                data: organization,
                message: 'Subscription updated successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update subscription'
            });
        }
    }
}
exports.OrganizationController = OrganizationController;
exports.default = new OrganizationController();
//# sourceMappingURL=organization.controller.js.map