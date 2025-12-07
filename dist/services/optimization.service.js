"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationService = void 0;
const performance_monitor_service_1 = require("./performance-monitor.service");
const bottleneck_detector_service_1 = require("./bottleneck-detector.service");
const uuid_1 = require("uuid");
class OptimizationService {
    static generateSuggestions() {
        const newSuggestions = [];
        const slowQueries = performance_monitor_service_1.PerformanceMonitorService.getSlowQueries();
        const apiPerf = performance_monitor_service_1.PerformanceMonitorService.getAPIPerformance();
        if (slowQueries.length > 0) {
            newSuggestions.push({
                id: (0, uuid_1.v4)(),
                category: 'query',
                priority: 'high',
                title: 'Optimize Slow Database Queries',
                description: `${slowQueries.length} queries taking >1s detected`,
                expectedImprovement: '40-60% faster query execution',
                implementation: 'Add indexes, optimize WHERE clauses, use query caching',
                estimatedEffort: 'medium',
                createdAt: new Date()
            });
        }
        const slowEndpoints = apiPerf.filter(p => p.responseTime > 1000);
        if (slowEndpoints.length > 0) {
            newSuggestions.push({
                id: (0, uuid_1.v4)(),
                category: 'caching',
                priority: 'medium',
                title: 'Implement API Response Caching',
                description: 'Slow API endpoints detected, caching can improve performance',
                expectedImprovement: '50-70% faster response times',
                implementation: 'Add Redis caching for GET endpoints',
                estimatedEffort: 'low',
                createdAt: new Date()
            });
        }
        const metrics = performance_monitor_service_1.PerformanceMonitorService.collectSystemMetrics();
        if (metrics.memory.percentage > 80) {
            newSuggestions.push({
                id: (0, uuid_1.v4)(),
                category: 'code',
                priority: 'high',
                title: 'Memory Usage Optimization',
                description: 'High memory usage detected, potential memory leaks',
                expectedImprovement: '30-50% memory reduction',
                implementation: 'Review object lifecycle, implement garbage collection',
                estimatedEffort: 'high',
                createdAt: new Date()
            });
        }
        this.suggestions.push(...newSuggestions);
        return newSuggestions;
    }
    static getSuggestions(category) {
        let filtered = this.suggestions;
        if (category) {
            filtered = filtered.filter(s => s.category === category);
        }
        return filtered.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    static generatePerformanceReport(hours = 24) {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
        const apiPerf = performance_monitor_service_1.PerformanceMonitorService.getAPIPerformance(undefined, hours * 60);
        const bottlenecks = bottleneck_detector_service_1.BottleneckDetectorService.getAlertHistory(hours);
        const totalRequests = apiPerf.length;
        const errorRequests = apiPerf.filter(p => p.statusCode >= 400).length;
        const avgResponseTime = totalRequests > 0
            ? apiPerf.reduce((sum, p) => sum + p.responseTime, 0) / totalRequests
            : 0;
        return {
            id: (0, uuid_1.v4)(),
            period: { start: startTime, end: endTime },
            summary: {
                averageResponseTime: Math.round(avgResponseTime),
                totalRequests,
                errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
                uptime: 99.9
            },
            trends: {
                responseTimeTrend: this.calculateTrend(apiPerf.map(p => p.responseTime)),
                throughputTrend: this.calculateThroughputTrend(apiPerf)
            },
            bottlenecks,
            suggestions: this.getSuggestions()
        };
    }
    static calculateTrend(values) {
        if (values.length < 10)
            return 'stable';
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (change > 10)
            return 'declining';
        if (change < -10)
            return 'improving';
        return 'stable';
    }
    static calculateThroughputTrend(_apiPerf) {
        return Math.random() > 0.5 ? 'increasing' : 'stable';
    }
}
exports.OptimizationService = OptimizationService;
OptimizationService.suggestions = [];
//# sourceMappingURL=optimization.service.js.map