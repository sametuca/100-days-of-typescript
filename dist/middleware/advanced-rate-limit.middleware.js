"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.strictLimiter = exports.advancedRateLimit = void 0;
const security_service_1 = require("../services/security.service");
class AdvancedRateLimit {
    constructor() {
        this.requests = new Map();
    }
    createLimiter(config) {
        return (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            if (security_service_1.securityService.isBlocked(ip)) {
                res.status(403).json({
                    success: false,
                    message: 'IP blocked due to suspicious activity'
                });
                return;
            }
            const now = Date.now();
            const windowStart = now - config.windowMs;
            let requestTimes = this.requests.get(ip) || [];
            requestTimes = requestTimes.filter(time => time > windowStart);
            if (requestTimes.length >= config.maxRequests) {
                security_service_1.securityService.logEvent({
                    type: 'RATE_LIMIT_EXCEEDED',
                    ip,
                    details: { requests: requestTimes.length, limit: config.maxRequests }
                });
                res.status(429).json({
                    success: false,
                    message: 'Too many requests',
                    retryAfter: Math.ceil(config.windowMs / 1000)
                });
                return;
            }
            requestTimes.push(now);
            this.requests.set(ip, requestTimes);
            next();
        };
    }
}
exports.advancedRateLimit = new AdvancedRateLimit();
exports.strictLimiter = exports.advancedRateLimit.createLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10
});
exports.authLimiter = exports.advancedRateLimit.createLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5
});
//# sourceMappingURL=advanced-rate-limit.middleware.js.map