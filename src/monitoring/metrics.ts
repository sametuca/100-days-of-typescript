import { Request, Response } from 'express';

interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  // Counter metrics
  incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
    
    this.updateMetric(name, current + 1, labels);
  }

  // Gauge metrics
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.updateMetric(name, value, labels);
  }

  // Histogram metrics
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  private updateMetric(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.metrics.set(key, {
      name,
      value,
      labels,
      timestamp: Date.now()
    });
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics(): string {
    let output = '';
    
    // Counters
    for (const [key, value] of this.counters) {
      const metric = this.metrics.get(key);
      if (metric) {
        output += `# TYPE ${metric.name} counter\n`;
        output += `${this.formatMetricLine(metric)}\n`;
      }
    }
    
    // Histograms
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

  private formatMetricLine(metric: Metric): string {
    return `${metric.name}${this.formatLabels(metric.labels)} ${metric.value}`;
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return '';
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `{${labelStr}}`;
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }
}

export const metricsCollector = new MetricsCollector();

// Middleware to collect HTTP metrics
export const httpMetricsMiddleware = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString()
    };
    
    metricsCollector.incrementCounter('http_requests_total', labels);
    metricsCollector.recordHistogram('http_request_duration_ms', duration, labels);
  });
  
  next();
};