"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRegistry = exports.ServiceRegistry = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.heartbeatInterval = 30000;
        this.startHealthCheck();
    }
    register(service) {
        const serviceInfo = {
            ...service,
            lastHeartbeat: new Date()
        };
        this.services.set(service.id, serviceInfo);
        logger_1.default.info(`Service registered: ${service.name} (${service.id})`);
    }
    unregister(serviceId) {
        if (this.services.delete(serviceId)) {
            logger_1.default.info(`Service unregistered: ${serviceId}`);
        }
    }
    getService(serviceId) {
        return this.services.get(serviceId);
    }
    getServicesByName(serviceName) {
        return Array.from(this.services.values())
            .filter(service => service.name === serviceName && service.health === 'healthy');
    }
    getAllServices() {
        return Array.from(this.services.values());
    }
    updateHeartbeat(serviceId) {
        const service = this.services.get(serviceId);
        if (service) {
            service.lastHeartbeat = new Date();
            service.health = 'healthy';
        }
    }
    startHealthCheck() {
        setInterval(() => {
            const now = new Date();
            for (const [serviceId, service] of this.services) {
                const timeSinceHeartbeat = now.getTime() - service.lastHeartbeat.getTime();
                if (timeSinceHeartbeat > this.heartbeatInterval * 2) {
                    service.health = 'unhealthy';
                    logger_1.default.warn(`Service unhealthy: ${service.name} (${serviceId})`);
                }
            }
        }, this.heartbeatInterval);
    }
}
exports.ServiceRegistry = ServiceRegistry;
exports.serviceRegistry = new ServiceRegistry();
//# sourceMappingURL=service-registry.js.map