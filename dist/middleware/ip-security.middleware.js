"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipSecurityMiddleware = void 0;
const security_service_1 = require("../services/security.service");
const ipSecurityMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (security_service_1.securityService.isBlocked(ip)) {
        security_service_1.securityService.logEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            ip,
            details: { reason: 'Blocked IP attempted access', path: req.path }
        });
        res.status(403).json({
            success: false,
            message: 'Access denied'
        });
        return;
    }
    next();
};
exports.ipSecurityMiddleware = ipSecurityMiddleware;
//# sourceMappingURL=ip-security.middleware.js.map