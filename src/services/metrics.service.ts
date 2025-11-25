// Day 26: Performance Monitoring & Metrics

interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

interface PerformanceMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  data: MetricData[];
}

export class MetricsService {
  private metrics = new Map<string, PerformanceMetric>();

  // API response time tracking
  recordResponseTime(endpoint: string, duration: number): void {
    this.addMetric('api_response_time', 'histogram', duration, { endpoint });
  }

  // Request count tracking
  incrementRequestCount(method: string, endpoint: string): void {
    this.addMetric('api_requests_total', 'counter', 1, { method, endpoint });
  }

  // Memory usage tracking
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.addMetric('memory_heap_used', 'gauge', usage.heapUsed);
    this.addMetric('memory_heap_total', 'gauge', usage.heapTotal);
  }

  private addMetric(name: string, type: PerformanceMetric['type'], value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { name, type, data: [] });
    }

    const metric = this.metrics.get(name)!;
    metric.data.push({
      timestamp: Date.now(),
      value,
      tags
    });

    // Keep only last 1000 data points
    if (metric.data.length > 1000) {
      metric.data.shift();
    }
  }

  getMetrics(): Record<string, PerformanceMetric> {
    return Object.fromEntries(this.metrics);
  }

  getMetricSummary(name: string): { avg: number; min: number; max: number; count: number } | null {
    const metric = this.metrics.get(name);
    if (!metric || metric.data.length === 0) return null;

    const values = metric.data.map(d => d.value);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }
}

export const metricsService = new MetricsService();