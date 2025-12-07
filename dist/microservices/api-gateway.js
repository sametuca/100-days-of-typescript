"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_client_1 = require("./service-client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.use('/users/*', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const endpoint = req.path.replace('/users', '');
        const result = await service_client_1.serviceClient.getUserService(endpoint, req.body, req.method);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Gateway error - users:', error.message);
        res.status(500).json({ error: 'Service unavailable' });
    }
});
router.use('/tasks/*', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const endpoint = req.path.replace('/tasks', '');
        const result = await service_client_1.serviceClient.getTaskService(endpoint, req.body, req.method);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Gateway error - tasks:', error.message);
        res.status(500).json({ error: 'Service unavailable' });
    }
});
router.use('/notifications/*', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const endpoint = req.path.replace('/notifications', '');
        const result = await service_client_1.serviceClient.getNotificationService(endpoint, req.body, req.method);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Gateway error - notifications:', error.message);
        res.status(500).json({ error: 'Service unavailable' });
    }
});
router.get('/health/services', async (_req, res) => {
    try {
        const services = await Promise.allSettled([
            service_client_1.serviceClient.getUserService('/health').catch(() => ({ status: 'down' })),
            service_client_1.serviceClient.getTaskService('/health').catch(() => ({ status: 'down' })),
            service_client_1.serviceClient.getNotificationService('/health').catch(() => ({ status: 'down' }))
        ]);
        const healthStatus = {
            gateway: 'up',
            services: {
                users: services[0].status === 'fulfilled' ? 'up' : 'down',
                tasks: services[1].status === 'fulfilled' ? 'up' : 'down',
                notifications: services[2].status === 'fulfilled' ? 'up' : 'down'
            }
        };
        res.json(healthStatus);
    }
    catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});
exports.default = router;
//# sourceMappingURL=api-gateway.js.map