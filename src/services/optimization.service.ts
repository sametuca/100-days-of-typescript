import { OptimizationSuggestion, PerformanceReport } from '../types/performance.types';
import { PerformanceMonitorService } from './performance-monitor.service';
import { BottleneckDetectorService } from './bottleneck-detector.service';
import { v4 as uuidv4 } from 'uuid';

export class OptimizationService {
  private static suggestions: OptimizationSuggestion[] = [];

  static generateSuggestions(): OptimizationSuggestion[] {
    const newSuggestions: OptimizationSuggestion[] = [];
    const slowQueries = PerformanceMonitorService.getSlowQueries();
    const apiPerf = PerformanceMonitorService.getAPIPerformance();
    
    // Database optimization suggestions
    if (slowQueries.length > 0) {
      newSuggestions.push({
        id: uuidv4(),
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
    
    // API caching suggestions
    const slowEndpoints = apiPerf.filter(p => p.responseTime > 1000);
    if (slowEndpoints.length > 0) {
      newSuggestions.push({
        id: uuidv4(),
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
    
    // Memory optimization
    const metrics = PerformanceMonitorService.collectSystemMetrics();
    if (metrics.memory.percentage > 80) {
      newSuggestions.push({
        id: uuidv4(),
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

  static getSuggestions(category?: OptimizationSuggestion['category']): OptimizationSuggestion[] {
    let filtered = this.suggestions;
    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static generatePerformanceReport(hours: number = 24): PerformanceReport {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    
    const apiPerf = PerformanceMonitorService.getAPIPerformance(undefined, hours * 60);
    const bottlenecks = BottleneckDetectorService.getAlertHistory(hours);
    
    const totalRequests = apiPerf.length;
    const errorRequests = apiPerf.filter(p => p.statusCode >= 400).length;
    const avgResponseTime = totalRequests > 0 
      ? apiPerf.reduce((sum, p) => sum + p.responseTime, 0) / totalRequests 
      : 0;
    
    return {
      id: uuidv4(),
      period: { start: startTime, end: endTime },
      summary: {
        averageResponseTime: Math.round(avgResponseTime),
        totalRequests,
        errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
        uptime: 99.9 // Mock uptime
      },
      trends: {
        responseTimeTrend: this.calculateTrend(apiPerf.map(p => p.responseTime)),
        throughputTrend: this.calculateThroughputTrend(apiPerf)
      },
      bottlenecks,
      suggestions: this.getSuggestions()
    };
  }

  private static calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 10) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'declining';
    if (change < -10) return 'improving';
    return 'stable';
  }

  private static calculateThroughputTrend(_apiPerf: any[]): 'increasing' | 'decreasing' | 'stable' {
    // Mock implementation
    return Math.random() > 0.5 ? 'increasing' : 'stable';
  }
}