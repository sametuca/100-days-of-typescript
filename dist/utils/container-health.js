"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerHealthCheck = void 0;
const service_registry_1 = require("../microservices/service-registry");
const logger_1 = __importDefault(require("./logger"));
class ContainerHealthCheck {
    static async checkHealth(req, res) {
        try {
            const healthStatus = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                services: {
                    registry: service_registry_1.serviceRegistry.getAllServices().length,
                    database: 'connected',
                    events: 'active'
                },
                version: process.env.npm_package_version || '1.0.0'
            };
            res.status(200).json(healthStatus);
        }
        catch (error) {
            logger_1.default.error('Health check failed:', error);
            res.status(503).json({
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    static async checkReadiness(req, res) {
        try {
            const services = service_registry_1.serviceRegistry.getAllServices();
            const healthyServices = services.filter(s => s.health === 'healthy');
            const isReady = healthyServices.length >= services.length * 0.5;
            if (isReady) {
                res.status(200).json({
                    status: 'ready',
                    services: healthyServices.length,
                    total: services.length
                });
            }
            else {
                res.status(503).json({
                    status: 'not ready',
                    services: healthyServices.length,
                    total: services.length
                });
            }
        }
        catch (error) {
            res.status(503).json({
                status: 'not ready',
                error: error.message
            });
        }
    }
}
exports.ContainerHealthCheck = ContainerHealthCheck;
//# sourceMappingURL=container-health.js.map