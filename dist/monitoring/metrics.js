"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpMetricsMiddleware = exports.metricsCollector = void 0;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.counters = new Map();
        this.histograms = new Map();
    }
    incrementCounter(name, labels) {
        const key = this.getMetricKey(name, labels);
        const current = this.counters.get(key) || 0;
        this.counters.set(key, current + 1);
        this.updateMetric(name, current + 1, labels);
    }
    setGauge(name, value, labels) {
        this.updateMetric(name, value, labels);
    }
    recordHistogram(name, value, labels) {
        const key = this.getMetricKey(name, labels);
        const values = this.histograms.get(key) || [];
        values.push(value);
        this.histograms.set(key, values);
        if (values.length > 100) {
            values.shift();
        }
    }
    updateMetric(name, value, labels) {
        const key = this.getMetricKey(name, labels);
        this.metrics.set(key, {
            name,
            value,
            labels,
            timestamp: Date.now()
        });
    }
    getMetricKey(name, labels) {
        if (!labels)
            return name;
        const labelStr = Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
        return `${name}{${labelStr}}`;
    }
    exportPrometheusMetrics() {
        let output = '';
        for (const [key, value] of this.counters) {
            const metric = this.metrics.get(key);
            if (metric) {
                output += `# TYPE ${metric.name} counter\n`;
                output += `${this.formatMetricLine(metric)}\n`;
            }
        }
        for (const [key, values] of this.histograms) {
            const metric = this.metrics.get(key);
            if (metric && values.length > 0) {
                const sum = values.reduce((a, b) => a + b, 0);
                const count = values.length;
                output += `# TYPE ${metric.name} histogram\n`;
                output += `${metric.name}_sum${this.formatLabels(metric.labels)} ${sum}\n`;
                output += `${metric.name}_count${this.formatLabels(metric.labels)} ${count}\n`;
            }
        }
        return output;
    }
    formatMetricLine(metric) {
        return `${metric.name}${this.formatLabels(metric.labels)} ${metric.value}`;
    }
    formatLabels(labels) {
        if (!labels || Object.keys(labels).length === 0)
            return '';
        const labelStr = Object.entries(labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
        return `{${labelStr}}`;
    }
    getAllMetrics() {
        return Array.from(this.metrics.values());
    }
}
exports.metricsCollector = new MetricsCollector();
const httpMetricsMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const labels = {
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode.toString()
        };
        exports.metricsCollector.incrementCounter('http_requests_total', labels);
        exports.metricsCollector.recordHistogram('http_request_duration_ms', duration, labels);
    });
    next();
};
exports.httpMetricsMiddleware = httpMetricsMiddleware;
//# sourceMappingURL=metrics.js.map