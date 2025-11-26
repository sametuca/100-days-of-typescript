export interface PerformanceMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
  };
}

export interface APIPerformance {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
}

export interface DatabasePerformance {
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
  isOptimized: boolean;
}

export interface BottleneckAlert {
  id: string;
  type: 'cpu' | 'memory' | 'database' | 'network' | 'api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'query' | 'caching' | 'code' | 'infrastructure';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImprovement: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface PerformanceReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    uptime: number;
  };
  trends: {
    responseTimeTrend: 'improving' | 'declining' | 'stable';
    throughputTrend: 'increasing' | 'decreasing' | 'stable';
  };
  bottlenecks: BottleneckAlert[];
  suggestions: OptimizationSuggestion[];
}