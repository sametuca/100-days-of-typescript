"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.cacheMiddleware = void 0;
const cache_service_1 = require("../services/cache.service");
const cacheMiddleware = (ttl = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            next();
            return;
        }
        const cacheKey = `${req.originalUrl}_${req.user?.userId || 'anonymous'}`;
        const cachedData = cache_service_1.cacheService.get(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }
        const originalJson = res.json;
        res.json = function (data) {
            if (res.statusCode === 200) {
                cache_service_1.cacheService.set(cacheKey, data, ttl);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
const invalidateCache = (patterns) => {
    return (_req, _res, next) => {
        patterns.forEach(pattern => {
            cache_service_1.cacheService.deletePattern(pattern);
        });
        next();
    };
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=cache.middleware.js.map