import { BottleneckAlert } from '../types/performance.types';
import { PerformanceMonitorService } from './performance-monitor.service';
import { v4 as uuidv4 } from 'uuid';

export class BottleneckDetectorService {
  private static alerts: BottleneckAlert[] = [];
  private static thresholds = {
    cpu: 80,
    memory: 85,
    responseTime: 2000,
    dbQuery: 1000,
    errorRate: 5
  };

  static detectBottlenecks(): BottleneckAlert[] {
    const newAlerts: BottleneckAlert[] = [];
    const metrics = PerformanceMonitorService.collectSystemMetrics();
    
    // CPU bottleneck
    if (metrics.cpu.usage > this.thresholds.cpu) {
      newAlerts.push(this.createAlert(
        'cpu',
        'high',
        `High CPU usage detected: ${metrics.cpu.usage.toFixed(1)}%`,
        this.thresholds.cpu,
        metrics.cpu.usage
      ));
    }
    
    // Memory bottleneck
    if (metrics.memory.percentage > this.thresholds.memory) {
      newAlerts.push(this.createAlert(
        'memory',
        'high',
        `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`,
        this.thresholds.memory,
        metrics.memory.percentage
      ));
    }
    
    // Response time bottleneck
    if (metrics.responseTime.average > this.thresholds.responseTime) {
      newAlerts.push(this.createAlert(
        'api',
        'medium',
        `Slow API response time: ${metrics.responseTime.average}ms`,
        this.thresholds.responseTime,
        metrics.responseTime.average
      ));
    }
    
    // Database bottleneck
    const slowQueries = PerformanceMonitorService.getSlowQueries(this.thresholds.dbQuery);
    if (slowQueries.length > 0) {
      newAlerts.push(this.createAlert(
        'database',
        'medium',
        `${slowQueries.length} slow database queries detected`,
        this.thresholds.dbQuery,
        slowQueries.length
      ));
    }
    
    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  static getActiveAlerts(): BottleneckAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  static getAlertHistory(hours: number = 24): BottleneckAlert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  private static createAlert(
    type: BottleneckAlert['type'],
    severity: BottleneckAlert['severity'],
    message: string,
    threshold: number,
    currentValue: number
  ): BottleneckAlert {
    return {
      id: uuidv4(),
      type,
      severity,
      message,
      threshold,
      currentValue,
      timestamp: new Date(),
      resolved: false
    };
  }

  static updateThresholds(newThresholds: Partial<typeof BottleneckDetectorService.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}