"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitorService = void 0;
const os = __importStar(require("os"));
class PerformanceMonitorService {
    static collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const metrics = {
            timestamp: new Date(),
            cpu: {
                usage: process.cpuUsage().user / 1000000,
                load: os.loadavg()
            },
            memory: {
                used: memUsage.heapUsed,
                total: totalMem,
                percentage: (memUsage.heapUsed / totalMem) * 100
            },
            responseTime: this.calculateResponseTimeStats(),
            throughput: this.calculateThroughputStats()
        };
        this.metrics.push(metrics);
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
        return metrics;
    }
    static recordAPIPerformance(performance) {
        this.apiPerformance.push(performance);
        if (this.apiPerformance.length > 10000) {
            this.apiPerformance = this.apiPerformance.slice(-10000);
        }
    }
    static recordDatabasePerformance(performance) {
        this.dbPerformance.push(performance);
        if (this.dbPerformance.length > 5000) {
            this.dbPerformance = this.dbPerformance.slice(-5000);
        }
    }
    static getMetrics(minutes = 60) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.metrics.filter(m => m.timestamp >= cutoff);
    }
    static getAPIPerformance(endpoint, minutes = 60) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        let filtered = this.apiPerformance.filter(p => p.timestamp >= cutoff);
        if (endpoint) {
            filtered = filtered.filter(p => p.endpoint === endpoint);
        }
        return filtered;
    }
    static getSlowQueries(threshold = 1000) {
        return this.dbPerformance.filter(p => p.executionTime > threshold);
    }
    static calculateResponseTimeStats() {
        const recent = this.apiPerformance.slice(-100);
        if (recent.length === 0) {
            return { average: 0, p95: 0, p99: 0 };
        }
        const times = recent.map(p => p.responseTime).sort((a, b) => a - b);
        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        const p95Index = Math.floor(times.length * 0.95);
        const p99Index = Math.floor(times.length * 0.99);
        return {
            average: Math.round(average),
            p95: times[p95Index] || 0,
            p99: times[p99Index] || 0
        };
    }
    static calculateThroughputStats() {
        const lastMinute = new Date(Date.now() - 60 * 1000);
        const recentRequests = this.apiPerformance.filter(p => p.timestamp >= lastMinute);
        return {
            requestsPerSecond: Math.round(recentRequests.length / 60),
            totalRequests: this.apiPerformance.length
        };
    }
}
exports.PerformanceMonitorService = PerformanceMonitorService;
PerformanceMonitorService.metrics = [];
PerformanceMonitorService.apiPerformance = [];
PerformanceMonitorService.dbPerformance = [];
//# sourceMappingURL=performance-monitor.service.js.map