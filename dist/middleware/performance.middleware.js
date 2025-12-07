"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMiddleware = void 0;
const performance_monitor_service_1 = require("../services/performance-monitor.service");
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        performance_monitor_service_1.PerformanceMonitorService.recordAPIPerformance({
            endpoint: req.path,
            method: req.method,
            responseTime,
            statusCode: res.statusCode,
            timestamp: new Date(),
            userId: req.user?.userId
        });
    });
    next();
};
exports.performanceMiddleware = performanceMiddleware;
//# sourceMappingURL=performance.middleware.js.map