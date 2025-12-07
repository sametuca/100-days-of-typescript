"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = exports.MetricsService = void 0;
class MetricsService {
    constructor() {
        this.metrics = new Map();
    }
    recordResponseTime(endpoint, duration) {
        this.addMetric('api_response_time', 'histogram', duration, { endpoint });
    }
    incrementRequestCount(method, endpoint) {
        this.addMetric('api_requests_total', 'counter', 1, { method, endpoint });
    }
    recordMemoryUsage() {
        const usage = process.memoryUsage();
        this.addMetric('memory_heap_used', 'gauge', usage.heapUsed);
        this.addMetric('memory_heap_total', 'gauge', usage.heapTotal);
    }
    addMetric(name, type, value, tags) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, { name, type, data: [] });
        }
        const metric = this.metrics.get(name);
        metric.data.push({
            timestamp: Date.now(),
            value,
            tags
        });
        if (metric.data.length > 1000) {
            metric.data.shift();
        }
    }
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    getMetricSummary(name) {
        const metric = this.metrics.get(name);
        if (!metric || metric.data.length === 0)
            return null;
        const values = metric.data.map(d => d.value);
        return {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length
        };
    }
}
exports.MetricsService = MetricsService;
exports.metricsService = new MetricsService();
//# sourceMappingURL=metrics.service.js.map