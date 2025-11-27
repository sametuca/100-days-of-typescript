import { Request, Response, NextFunction } from 'express';
import MembershipService from '../services/membership.service';
import { Permission } from '../types/organization.types';

export class PermissionMiddleware {
    /**
     * Require specific permission(s)
     */
    requirePermission(...permissions: Permission[]) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                if (!req.organizationId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Organization context required'
                    });
                }

                const hasPermission = await MembershipService.hasAllPermissions(
                    req.user.id,
                    req.organizationId,
                    permissions
                );

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions',
                        required: permissions
                    });
                }

                next();
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify permissions'
                });
            }
        };
    }

    /**
     * Require any of the specified permissions
     */
    requireAnyPermission(...permissions: Permission[]) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                if (!req.organizationId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Organization context required'
                    });
                }

                const hasPermission = await MembershipService.hasAnyPermission(
                    req.user.id,
                    req.organizationId,
                    permissions
                );

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions',
                        required: permissions
                    });
                }

                next();
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify permissions'
                });
            }
        };
    }

    /**
     * Require organization owner role
     */
    requireOwner() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.user || !req.organizationId) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication and organization context required'
                    });
                }

                const membership = await MembershipService.getMembershipByUserAndOrg(
                    req.user.id,
                    req.organizationId
                );

                if (!membership || membership.role !== 'owner') {
                    return res.status(403).json({
                        success: false,
                        error: 'Organization owner access required'
                    });
                }

                next();
            } catch (error) {
                console.error('Owner check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify owner status'
                });
            }
        };
    }

    /**
     * Require admin or owner role
     */
    requireAdmin() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.user || !req.organizationId) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication and organization context required'
                    });
                }

                const membership = await MembershipService.getMembershipByUserAndOrg(
                    req.user.id,
                    req.organizationId
                );

                if (!membership || !['owner', 'admin'].includes(membership.role)) {
                    return res.status(403).json({
                        success: false,
                        error: 'Admin access required'
                    });
                }

                next();
            } catch (error) {
                console.error('Admin check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify admin status'
                });
            }
        };
    }
}

export default new PermissionMiddleware();
