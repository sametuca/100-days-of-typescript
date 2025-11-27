import { Router } from 'express';
import OrganizationController from '../controllers/organization.controller';
import TeamController from '../controllers/team.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import TenantMiddleware from '../middleware/tenant.middleware';
import PermissionMiddleware from '../middleware/permission.middleware';
import { Permission } from '../types/organization.types';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Organization CRUD
router.post(
    '/',
    OrganizationController.createOrganization
);

router.get(
    '/',
    OrganizationController.getUserOrganizations
);

router.get(
    '/:orgId',
    TenantMiddleware.requireTenant(),
    OrganizationController.getOrganization
);

router.patch(
    '/:orgId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.ORG_SETTINGS),
    OrganizationController.updateOrganization
);

router.delete(
    '/:orgId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requireOwner(),
    OrganizationController.deleteOrganization
);

// Member management
router.get(
    '/:orgId/members',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.ORG_SETTINGS),
    OrganizationController.getMembers
);

router.post(
    '/:orgId/members/invite',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.ORG_MEMBERS_INVITE),
    OrganizationController.inviteMember
);

router.patch(
    '/:orgId/members/:userId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requireAdmin(),
    OrganizationController.updateMember
);

router.delete(
    '/:orgId/members/:userId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.ORG_MEMBERS_REMOVE),
    OrganizationController.removeMember
);

// Subscription management
router.patch(
    '/:orgId/subscription',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.ORG_BILLING),
    OrganizationController.updateSubscription
);

// Team routes
router.post(
    '/:orgId/teams',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.TEAM_CREATE),
    TeamController.createTeam
);

router.get(
    '/:orgId/teams',
    TenantMiddleware.requireTenant(),
    TeamController.getOrganizationTeams
);

router.get(
    '/:orgId/teams/my-teams',
    TenantMiddleware.requireTenant(),
    TeamController.getUserTeams
);

router.get(
    '/:orgId/teams/:teamId',
    TenantMiddleware.requireTenant(),
    TeamController.getTeam
);

router.patch(
    '/:orgId/teams/:teamId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.TEAM_MANAGE),
    TeamController.updateTeam
);

router.delete(
    '/:orgId/teams/:teamId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.TEAM_DELETE),
    TeamController.deleteTeam
);

router.get(
    '/:orgId/teams/:teamId/members',
    TenantMiddleware.requireTenant(),
    TeamController.getTeamMembers
);

router.post(
    '/:orgId/teams/:teamId/members',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.TEAM_MANAGE),
    TeamController.addTeamMember
);

router.delete(
    '/:orgId/teams/:teamId/members/:userId',
    TenantMiddleware.requireTenant(),
    PermissionMiddleware.requirePermission(Permission.TEAM_MANAGE),
    TeamController.removeTeamMember
);

export default router;
