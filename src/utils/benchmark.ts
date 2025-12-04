import { Request, Response } from 'express';
import { metricsCollector } from '../monitoring/metrics';

interface BenchmarkResult {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

export class Benchmark {
  private static results: BenchmarkResult[] = [];

  static async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    let success = true;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      this.recordResult(operation, duration, success);
    }
  }

  static measure<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    let success = true;
    
    try {
      const result = fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      this.recordResult(operation, duration, success);
    }
  }

  private static recordResult(operation: string, duration: number, success: boolean): void {
    const result: BenchmarkResult = {
      operation,
      duration,
      timestamp: Date.now(),
      success
    };

    this.results.push(result);
    
    // Keep only last 1000 results
    if (this.results.length > 1000) {
      this.results.shift();
    }

    // Record to metrics
    metricsCollector.recordHistogram('benchmark_duration_ms', duration, { operation });
    metricsCollector.incrementCounter('benchmark_operations_total', { 
      operation, 
      status: success ? 'success' : 'error' 
    });
  }

  static getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  static getStats(operation?: string): any {
    const filtered = operation 
      ? this.results.filter(r => r.operation === operation)
      : this.results;

    if (filtered.length === 0) return null;

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

  private static percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}

export const benchmarkMiddleware = (operation: string) => {
  return (req: Request, res: Response, next: Function) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const success = res.statusCode < 400;
      
      Benchmark['recordResult'](operation, duration, success);
    });
    
    next();
  };
};