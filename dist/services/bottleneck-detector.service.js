"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetectorService = void 0;
const performance_monitor_service_1 = require("./performance-monitor.service");
const uuid_1 = require("uuid");
class BottleneckDetectorService {
    static detectBottlenecks() {
        const newAlerts = [];
        const metrics = performance_monitor_service_1.PerformanceMonitorService.collectSystemMetrics();
        if (metrics.cpu.usage > this.thresholds.cpu) {
            newAlerts.push(this.createAlert('cpu', 'high', `High CPU usage detected: ${metrics.cpu.usage.toFixed(1)}%`, this.thresholds.cpu, metrics.cpu.usage));
        }
        if (metrics.memory.percentage > this.thresholds.memory) {
            newAlerts.push(this.createAlert('memory', 'high', `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`, this.thresholds.memory, metrics.memory.percentage));
        }
        if (metrics.responseTime.average > this.thresholds.responseTime) {
            newAlerts.push(this.createAlert('api', 'medium', `Slow API response time: ${metrics.responseTime.average}ms`, this.thresholds.responseTime, metrics.responseTime.average));
        }
        const slowQueries = performance_monitor_service_1.PerformanceMonitorService.getSlowQueries(this.thresholds.dbQuery);
        if (slowQueries.length > 0) {
            newAlerts.push(this.createAlert('database', 'medium', `${slowQueries.length} slow database queries detected`, this.thresholds.dbQuery, slowQueries.length));
        }
        this.alerts.push(...newAlerts);
        return newAlerts;
    }
    static getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    static resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            return true;
        }
        return false;
    }
    static getAlertHistory(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.alerts.filter(alert => alert.timestamp >= cutoff);
    }
    static createAlert(type, severity, message, threshold, currentValue) {
        return {
            id: (0, uuid_1.v4)(),
            type,
            severity,
            message,
            threshold,
            currentValue,
            timestamp: new Date(),
            resolved: false
        };
    }
    static updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }
}
exports.BottleneckDetectorService = BottleneckDetectorService;
BottleneckDetectorService.alerts = [];
BottleneckDetectorService.thresholds = {
    cpu: 80,
    memory: 85,
    responseTime: 2000,
    dbQuery: 1000,
    errorRate: 5
};
//# sourceMappingURL=bottleneck-detector.service.js.map