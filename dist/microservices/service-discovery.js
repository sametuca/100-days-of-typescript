"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_registry_1 = require("./service-registry");
const express_1 = require("express");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.post('/register', (req, res) => {
    try {
        const { id, name, host, port, metadata } = req.body;
        if (!id || !name || !host || !port) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        service_registry_1.serviceRegistry.register({
            id,
            name,
            host,
            port,
            health: 'healthy',
            metadata
        });
        logger_1.default.info(`Service registered via API: ${name} (${id})`);
        res.json({ success: true, message: 'Service registered' });
    }
    catch (error) {
        logger_1.default.error('Service registration failed:', error.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});
router.delete('/unregister/:serviceId', (req, res) => {
    try {
        const { serviceId } = req.params;
        service_registry_1.serviceRegistry.unregister(serviceId);
        res.json({ success: true, message: 'Service unregistered' });
    }
    catch (error) {
        logger_1.default.error('Service unregistration failed:', error.message);
        res.status(500).json({ error: 'Unregistration failed' });
    }
});
router.post('/heartbeat/:serviceId', (req, res) => {
    try {
        const { serviceId } = req.params;
        service_registry_1.serviceRegistry.updateHeartbeat(serviceId);
        res.json({ success: true });
    }
    catch (error) {
        logger_1.default.error('Heartbeat update failed:', error.message);
        res.status(500).json({ error: 'Heartbeat failed' });
    }
});
router.get('/services', (_req, res) => {
    try {
        const services = service_registry_1.serviceRegistry.getAllServices();
        res.json({ services });
    }
    catch (error) {
        logger_1.default.error('Service discovery failed:', error.message);
        res.status(500).json({ error: 'Discovery failed' });
    }
});
router.get('/services/:serviceName', (req, res) => {
    try {
        const { serviceName } = req.params;
        const services = service_registry_1.serviceRegistry.getServicesByName(serviceName);
        res.json({ services });
    }
    catch (error) {
        logger_1.default.error('Service lookup failed:', error.message);
        res.status(500).json({ error: 'Lookup failed' });
    }
});
exports.default = router;
//# sourceMappingURL=service-discovery.js.map