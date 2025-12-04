import { Request, Response, NextFunction } from 'express';
import OrganizationService from '../services/organization.service';
import MembershipService from '../services/membership.service';
import { Organization } from '../types/organization.types';

// Extend Express Request to include tenant
declare global {
    namespace Express {
        interface Request {
            tenant?: Organization;
            organizationId?: string;
        }
    }
}

export class TenantMiddleware {
    /**
     * Extract tenant from request
     * Priority: 1. Header, 2. Subdomain, 3. User's default org
     */
    async extractTenant(req: Request, res: Response, next: NextFunction) {
        try {
            let organization: Organization | null = null;

            // 1. Try to get from header
            const tenantId = req.headers['x-tenant-id'] as string;
            if (tenantId) {
                try {
                    organization = await OrganizationService.getOrganizationById(tenantId);
                } catch (error) {
                    // Continue to next method
                }
            }

            // 2. Try to get from subdomain
            if (!organization) {
                const hostname = req.hostname;
                const subdomain = hostname.split('.')[0];

                // Skip common subdomains
                if (subdomain && !['www', 'api', 'localhost'].includes(subdomain)) {
                    try {
                        organization = await OrganizationService.getOrganizationBySlug(subdomain);
                    } catch (error) {
                        // Continue to next method
                    }
                }
            }

            // 3. Try to get from user's organizations
            if (!organization && req.user) {
                const userOrgs = await OrganizationService.getUserOrganizations(req.user.userId);
                if (userOrgs.length > 0) {
                    organization = userOrgs[0]; // Use first organization as default
                }
            }

            if (!organization) {
                return res.status(400).json({
                    success: false,
                    error: 'Tenant not found. Please specify organization via header or subdomain.'
                });
            }

            // Verify user has access to this organization
            if (req.user) {
                const membership = await MembershipService.getMembershipByUserAndOrg(
                    req.user.userId,
                    organization.id
                );

                if (!membership || membership.status !== 'active') {
                    return res.status(403).json({
                        success: false,
                        error: 'You do not have access to this organization'
                    });
                }
            }

            // Attach tenant to request
            req.tenant = organization;
            req.organizationId = organization.id;

            next();
        } catch (error) {
            console.error('Tenant extraction error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to extract tenant context'
            });
        }
    }

    /**
     * Require tenant middleware
     */
    requireTenant() {
        return this.extractTenant.bind(this);
    }

    /**
     * Optional tenant middleware (doesn't fail if no tenant found)
     */
    optionalTenant() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.extractTenant(req, res, () => { });
            } catch (error) {
                // Silently continue without tenant
            }
            next();
        };
    }
}

export default new TenantMiddleware();