"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const organization_service_1 = __importDefault(require("../services/organization.service"));
const membership_service_1 = __importDefault(require("../services/membership.service"));
class TenantMiddleware {
    async extractTenant(req, res, next) {
        try {
            let organization = null;
            const tenantId = req.headers['x-tenant-id'];
            if (tenantId) {
                try {
                    organization = await organization_service_1.default.getOrganizationById(tenantId);
                }
                catch (error) {
                }
            }
            if (!organization) {
                const hostname = req.hostname;
                const subdomain = hostname.split('.')[0];
                if (subdomain && !['www', 'api', 'localhost'].includes(subdomain)) {
                    try {
                        organization = await organization_service_1.default.getOrganizationBySlug(subdomain);
                    }
                    catch (error) {
                    }
                }
            }
            if (!organization && req.user) {
                const userOrgs = await organization_service_1.default.getUserOrganizations(req.user.userId);
                if (userOrgs.length > 0) {
                    organization = userOrgs[0];
                }
            }
            if (!organization) {
                return res.status(400).json({
                    success: false,
                    error: 'Tenant not found. Please specify organization via header or subdomain.'
                });
            }
            if (req.user) {
                const membership = await membership_service_1.default.getMembershipByUserAndOrg(req.user.userId, organization.id);
                if (!membership || membership.status !== 'active') {
                    return res.status(403).json({
                        success: false,
                        error: 'You do not have access to this organization'
                    });
                }
            }
            req.tenant = organization;
            req.organizationId = organization.id;
            next();
        }
        catch (error) {
            console.error('Tenant extraction error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to extract tenant context'
            });
        }
    }
    requireTenant() {
        return this.extractTenant.bind(this);
    }
    optionalTenant() {
        return async (req, res, next) => {
            try {
                await this.extractTenant(req, res, () => { });
            }
            catch (error) {
            }
            next();
        };
    }
}
exports.TenantMiddleware = TenantMiddleware;
exports.default = new TenantMiddleware();
//# sourceMappingURL=tenant.middleware.js.map