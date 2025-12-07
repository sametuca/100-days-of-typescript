"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const container_health_1 = require("../utils/container-health");
const deployment_info_1 = require("../utils/deployment-info");
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
    static async getContainerHealth(req, res) {
        await container_health_1.ContainerHealthCheck.checkHealth(req, res);
    }
    static async getReadiness(req, res) {
        await container_health_1.ContainerHealthCheck.checkReadiness(req, res);
    }
    static getDeploymentInfo(_req, res) {
        const deploymentInfo = deployment_info_1.DeploymentTracker.getDeploymentInfo();
        res.json(deploymentInfo);
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map