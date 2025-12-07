"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheController = void 0;
const cache_service_1 = require("../services/cache.service");
class CacheController {
}
exports.CacheController = CacheController;
_a = CacheController;
CacheController.getStats = (_req, res) => {
    const stats = cache_service_1.cacheService.getStats();
    res.json({
        success: true,
        data: stats
    });
};
CacheController.getHealth = (_req, res) => {
    const health = cache_service_1.cacheService.getHealth();
    res.json({
        success: true,
        data: health
    });
};
CacheController.clearAll = (_req, res) => {
    cache_service_1.cacheService.clear();
    res.json({
        success: true,
        message: 'All cache layers cleared successfully'
    });
};
CacheController.clearPattern = (req, res) => {
    const { pattern } = req.params;
    if (!pattern) {
        res.status(400).json({
            success: false,
            message: 'Pattern parameter is required'
        });
        return;
    }
    cache_service_1.cacheService.deletePattern(pattern);
    res.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
    });
};
CacheController.getKeys = (_req, res) => {
    const keys = cache_service_1.cacheService.keys();
    res.json({
        success: true,
        data: {
            count: keys.length,
            keys
        }
    });
};
CacheController.warmCache = async (_req, res) => {
    try {
        const warmupData = [
            { key: 'system:config', data: { version: '1.0.0', env: 'production' }, ttl: 3600 },
            { key: 'system:features', data: { caching: true, monitoring: true }, ttl: 3600 },
            { key: 'system:limits', data: { maxUsers: 10000, maxTasks: 100000 }, ttl: 3600 }
        ];
        for (const item of warmupData) {
            cache_service_1.cacheService.set(item.key, item.data, item.ttl);
        }
        res.json({
            success: true,
            message: `Cache warmed with ${warmupData.length} items`,
            data: {
                itemsWarmed: warmupData.length,
                keys: warmupData.map(item => item.key)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cache warming failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
CacheController.deleteKey = (req, res) => {
    const { key } = req.params;
    if (!key) {
        res.status(400).json({
            success: false,
            message: 'Key parameter is required'
        });
        return;
    }
    cache_service_1.cacheService.delete(key);
    res.json({
        success: true,
        message: `Cache key deleted: ${key}`
    });
};
//# sourceMappingURL=cache.controller.js.map