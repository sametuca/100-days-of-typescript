import { PerformanceMetrics, APIPerformance, DatabasePerformance } from '../types/performance.types';
import * as os from 'os';

export class PerformanceMonitorService {
  private static metrics: PerformanceMetrics[] = [];
  private static apiPerformance: APIPerformance[] = [];
  private static dbPerformance: DatabasePerformance[] = [];

  static collectSystemMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    
    const metrics: PerformanceMetrics = {
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

  static recordAPIPerformance(performance: APIPerformance): void {
    this.apiPerformance.push(performance);
    if (this.apiPerformance.length > 10000) {
      this.apiPerformance = this.apiPerformance.slice(-10000);
    }
  }

  static recordDatabasePerformance(performance: DatabasePerformance): void {
    this.dbPerformance.push(performance);
    if (this.dbPerformance.length > 5000) {
      this.dbPerformance = this.dbPerformance.slice(-5000);
    }
  }

  static getMetrics(minutes: number = 60): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  static getAPIPerformance(endpoint?: string, minutes: number = 60): APIPerformance[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    let filtered = this.apiPerformance.filter(p => p.timestamp >= cutoff);
    
    if (endpoint) {
      filtered = filtered.filter(p => p.endpoint === endpoint);
    }
    
    return filtered;
  }

  static getSlowQueries(threshold: number = 1000): DatabasePerformance[] {
    return this.dbPerformance.filter(p => p.executionTime > threshold);
  }

  private static calculateResponseTimeStats() {
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

  private static calculateThroughputStats() {
    const lastMinute = new Date(Date.now() - 60 * 1000);
    const recentRequests = this.apiPerformance.filter(p => p.timestamp >= lastMinute);
    
    return {
      requestsPerSecond: Math.round(recentRequests.length / 60),
      totalRequests: this.apiPerformance.length
    };
  }
}