"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmarkMiddleware = exports.Benchmark = void 0;
const metrics_1 = require("../monitoring/metrics");
class Benchmark {
    static async measureAsync(operation, fn) {
        const start = Date.now();
        let success = true;
        try {
            const result = await fn();
            return result;
        }
        catch (error) {
            success = false;
            throw error;
        }
        finally {
            const duration = Date.now() - start;
            this.recordResult(operation, duration, success);
        }
    }
    static measure(operation, fn) {
        const start = Date.now();
        let success = true;
        try {
            const result = fn();
            return result;
        }
        catch (error) {
            success = false;
            throw error;
        }
        finally {
            const duration = Date.now() - start;
            this.recordResult(operation, duration, success);
        }
    }
    static recordResult(operation, duration, success) {
        const result = {
            operation,
            duration,
            timestamp: Date.now(),
            success
        };
        this.results.push(result);
        if (this.results.length > 1000) {
            this.results.shift();
        }
        metrics_1.metricsCollector.recordHistogram('benchmark_duration_ms', duration, { operation });
        metrics_1.metricsCollector.incrementCounter('benchmark_operations_total', {
            operation,
            status: success ? 'success' : 'error'
        });
    }
    static getResults() {
        return [...this.results];
    }
    static getStats(operation) {
        const filtered = operation
            ? this.results.filter(r => r.operation === operation)
            : this.results;
        if (filtered.length === 0)
            return null;
        const durations = filtered.map(r => r.duration);
        const successCount = filtered.filter(r => r.success).length;
        return {
            operation: operation || 'all',
            count: filtered.length,
            successRate: successCount / filtered.length,
            avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
            minDuration: Math.min(...durations),
            maxDuration: Math.max(...durations),
            p95Duration: this.percentile(durations, 0.95),
            p99Duration: this.percentile(durations, 0.99)
        };
    }
    static percentile(arr, p) {
        const sorted = arr.sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * p) - 1;
        return sorted[index];
    }
}
exports.Benchmark = Benchmark;
Benchmark.results = [];
const benchmarkMiddleware = (operation) => {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const success = res.statusCode < 400;
            Benchmark['recordResult'](operation, duration, success);
        });
        next();
    };
};
exports.benchmarkMiddleware = benchmarkMiddleware;
//# sourceMappingURL=benchmark.js.map