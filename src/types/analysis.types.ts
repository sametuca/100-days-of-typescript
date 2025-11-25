export interface CodeAnalysisRequest {
  code: string;
  language: string;
  fileName: string;
  projectId?: number;
}

export interface CodeQualityMetrics {
  complexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  codeSmells: number;
  duplications: number;
  coverage?: number;
}

export interface SecurityIssue {
  type: 'vulnerability' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  column: number;
  message: string;
  rule: string;
  suggestion?: string;
}

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'io' | 'network';
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  message: string;
  impact: string;
  suggestion: string;
}

export interface RefactoringSuggestion {
  type: 'extract_method' | 'rename' | 'move' | 'inline' | 'optimize';
  priority: 'high' | 'medium' | 'low';
  startLine: number;
  endLine: number;
  description: string;
  before: string;
  after: string;
  benefits: string[];
}

export interface CodeAnalysisResult {
  id: string;
  fileName: string;
  language: string;
  timestamp: Date;
  metrics: CodeQualityMetrics;
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  suggestions: RefactoringSuggestion[];
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface AIInsight {
  category: 'best_practice' | 'performance' | 'security' | 'maintainability';
  confidence: number;
  description: string;
  recommendation: string;
  resources: string[];
}

export interface AnalysisReport {
  summary: {
    totalFiles: number;
    averageScore: number;
    totalIssues: number;
    criticalIssues: number;
  };
  trends: {
    qualityTrend: 'improving' | 'declining' | 'stable';
    complexityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: AIInsight[];
}