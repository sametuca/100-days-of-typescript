"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceClient = exports.ServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const service_registry_1 = require("./service-registry");
const logger_1 = __importDefault(require("../utils/logger"));
class ServiceClient {
    constructor() {
        this.client = axios_1.default.create({
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    async callService(serviceName, endpoint, data, method = 'GET') {
        const services = service_registry_1.serviceRegistry.getServicesByName(serviceName);
        if (services.length === 0) {
            throw new Error(`No healthy instances of service '${serviceName}' found`);
        }
        const service = services[Math.floor(Math.random() * services.length)];
        const url = `http://${service.host}:${service.port}${endpoint}`;
        try {
            logger_1.default.info(`Calling service: ${serviceName} at ${url}`);
            const response = await this.client.request({
                method,
                url,
                data
            });
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Service call failed: ${serviceName}`, error.message);
            throw new Error(`Service call failed: ${error.message}`);
        }
    }
    async getUserService(endpoint, data, method = 'GET') {
        return this.callService('user-service', endpoint, data, method);
    }
    async getTaskService(endpoint, data, method = 'GET') {
        return this.callService('task-service', endpoint, data, method);
    }
    async getNotificationService(endpoint, data, method = 'GET') {
        return this.callService('notification-service', endpoint, data, method);
    }
}
exports.ServiceClient = ServiceClient;
exports.serviceClient = new ServiceClient();
//# sourceMappingURL=service-client.js.map