"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
class HealthController {
    static getRoot(_req, res) {
        res.status(200).json({
            success: true,
            message: 'Welcome to DevTracker API',
            version: '1.0.0',
            endpoints: {
                health: '/api/v1/health',
                docs: '/api/v1/docs'
            }
        });
    }
    static getHealth(_req, res) {
        const healthCheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        };
        res.status(200).json({
            success: true,
            data: healthCheck
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map