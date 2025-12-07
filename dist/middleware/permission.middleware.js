"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionMiddleware = void 0;
const membership_service_1 = __importDefault(require("../services/membership.service"));
class PermissionMiddleware {
    requirePermission(...permissions) {
        return async (req, res, next) => {
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
                const hasPermission = await membership_service_1.default.hasAllPermissions(req.user.id, req.organizationId, permissions);
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions',
                        required: permissions
                    });
                }
                next();
            }
            catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify permissions'
                });
            }
        };
    }
    requireAnyPermission(...permissions) {
        return async (req, res, next) => {
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
                const hasPermission = await membership_service_1.default.hasAnyPermission(req.user.id, req.organizationId, permissions);
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions',
                        required: permissions
                    });
                }
                next();
            }
            catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify permissions'
                });
            }
        };
    }
    requireOwner() {
        return async (req, res, next) => {
            try {
                if (!req.user || !req.organizationId) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication and organization context required'
                    });
                }
                const membership = await membership_service_1.default.getMembershipByUserAndOrg(req.user.id, req.organizationId);
                if (!membership || membership.role !== 'owner') {
                    return res.status(403).json({
                        success: false,
                        error: 'Organization owner access required'
                    });
                }
                next();
            }
            catch (error) {
                console.error('Owner check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify owner status'
                });
            }
        };
    }
    requireAdmin() {
        return async (req, res, next) => {
            try {
                if (!req.user || !req.organizationId) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication and organization context required'
                    });
                }
                const membership = await membership_service_1.default.getMembershipByUserAndOrg(req.user.id, req.organizationId);
                if (!membership || !['owner', 'admin'].includes(membership.role)) {
                    return res.status(403).json({
                        success: false,
                        error: 'Admin access required'
                    });
                }
                next();
            }
            catch (error) {
                console.error('Admin check error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify admin status'
                });
            }
        };
    }
}
exports.PermissionMiddleware = PermissionMiddleware;
exports.default = new PermissionMiddleware();
//# sourceMappingURL=permission.middleware.js.map