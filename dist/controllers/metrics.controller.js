"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const metrics_1 = require("../monitoring/metrics");
class MetricsController {
    static getPrometheusMetrics(_req, res) {
        const metrics = metrics_1.metricsCollector.exportPrometheusMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    }
    static getMetricsJson(_req, res) {
        const metrics = metrics_1.metricsCollector.getAllMetrics();
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    }
    static getSystemMetrics(_req, res) {
        const systemMetrics = {
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            cpu: process.cpuUsage(),
            version: process.version,
            platform: process.platform,
            arch: process.arch
        };
        res.json({
            success: true,
            data: systemMetrics,
            timestamp: new Date().toISOString()
        });
    }
}
exports.MetricsController = MetricsController;
//# sourceMappingURL=metrics.controller.js.map