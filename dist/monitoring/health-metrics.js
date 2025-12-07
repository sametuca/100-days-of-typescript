"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMetrics = void 0;
const metrics_1 = require("./metrics");
const service_registry_1 = require("../microservices/service-registry");
class HealthMetrics {
    static collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        metrics_1.metricsCollector.setGauge('nodejs_memory_heap_used_bytes', memUsage.heapUsed);
        metrics_1.metricsCollector.setGauge('nodejs_memory_heap_total_bytes', memUsage.heapTotal);
        metrics_1.metricsCollector.setGauge('nodejs_memory_rss_bytes', memUsage.rss);
        metrics_1.metricsCollector.setGauge('nodejs_process_uptime_seconds', process.uptime());
        const cpuUsage = process.cpuUsage();
        metrics_1.metricsCollector.setGauge('nodejs_process_cpu_user_seconds_total', cpuUsage.user / 1000000);
        metrics_1.metricsCollector.setGauge('nodejs_process_cpu_system_seconds_total', cpuUsage.system / 1000000);
        const services = service_registry_1.serviceRegistry.getAllServices();
        const healthyServices = services.filter(s => s.health === 'healthy');
        metrics_1.metricsCollector.setGauge('services_total', services.length);
        metrics_1.metricsCollector.setGauge('services_healthy', healthyServices.length);
        metrics_1.metricsCollector.setGauge('services_unhealthy', services.length - healthyServices.length);
    }
    static startMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetrics();
        }, 15000);
        this.collectSystemMetrics();
    }
}
exports.HealthMetrics = HealthMetrics;
//# sourceMappingURL=health-metrics.js.map