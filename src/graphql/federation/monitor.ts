interface ServiceMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalDuration: number;
  avgDuration: number;
  errors: Array<{ message: string; timestamp: number }>;
}

interface MonitoringReport {
  timestamp: number;
  totalQueries: number;
  services: Record<string, ServiceMetrics>;
  healthStatus: 'healthy' | 'degraded' | 'down';
}

export class FederationMonitor {
  private metrics: Map<string, ServiceMetrics> = new Map();

  trackQuery(service: string, duration: number, success: boolean): void {
    const metrics = this.getOrCreateMetrics(service);

    metrics.totalQueries++;
    metrics.totalDuration += duration;
    
    if (success) {
      metrics.successfulQueries++;
    } else {
      metrics.failedQueries++;
    }

    metrics.avgDuration = metrics.totalDuration / metrics.totalQueries;
  }

  trackError(service: string, error: Error): void {
    const metrics = this.getOrCreateMetrics(service);
    metrics.errors.push({
      message: error.message,
      timestamp: Date.now()
    });
  }

  getServiceMetrics(service: string): ServiceMetrics | undefined {
    return this.metrics.get(service);
  }

  getAllMetrics(): Record<string, ServiceMetrics> {
    const result: Record<string, ServiceMetrics> = {};
    
    for (const [service, metrics] of this.metrics) {
      result[service] = metrics;
    }

    return result;
  }

  generateReport(): MonitoringReport {
    const services = this.getAllMetrics();
    const totalQueries = Object.values(services).reduce(
      (sum, s) => sum + s.totalQueries,
      0
    );

    return {
      timestamp: Date.now(),
      totalQueries,
      services,
      healthStatus: this.calculateHealthStatus(services)
    };
  }

  private getOrCreateMetrics(service: string): ServiceMetrics {
    let metrics = this.metrics.get(service);
    
    if (!metrics) {
      metrics = {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        totalDuration: 0,
        avgDuration: 0,
        errors: []
      };
      this.metrics.set(service, metrics);
    }

    return metrics;
  }

  private calculateHealthStatus(
    services: Record<string, ServiceMetrics>
  ): 'healthy' | 'degraded' | 'down' {
    for (const metrics of Object.values(services)) {
      if (metrics.totalQueries === 0) continue;
      
      const errorRate = metrics.failedQueries / metrics.totalQueries;
      
      if (errorRate > 0.5) return 'down';
      if (errorRate > 0.1) return 'degraded';
    }

    return 'healthy';
  }

  clear(): void {
    this.metrics.clear();
  }
}
