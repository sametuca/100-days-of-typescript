export interface TestGenerationRequest {
  code: string;
  language: string;
  fileName: string;
  testType: 'unit' | 'integration' | 'e2e';
  framework?: 'jest' | 'mocha' | 'vitest';
}

export interface GeneratedTest {
  id: string;
  fileName: string;
  testFileName: string;
  testCode: string;
  framework: string;
  testCases: TestCase[];
  coverage: {
    functions: string[];
    branches: string[];
    statements: number;
  };
  createdAt: Date;
}

export interface TestCase {
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'edge';
  input: any;
  expectedOutput: any;
  assertions: string[];
}

export interface CoverageReport {
  id: string;
  projectId?: number;
  timestamp: Date;
  overall: CoverageMetrics;
  files: FileCoverage[];
  summary: {
    totalFiles: number;
    coveredFiles: number;
    uncoveredLines: number;
    totalLines: number;
  };
}

export interface CoverageMetrics {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
}

export interface FileCoverage {
  fileName: string;
  path: string;
  metrics: CoverageMetrics;
  uncoveredLines: number[];
  uncoveredFunctions: string[];
}

export interface QualityGate {
  id: string;
  name: string;
  rules: QualityRule[];
  isActive: boolean;
  projectId?: number;
  createdAt: Date;
}

export interface QualityRule {
  metric: 'coverage' | 'complexity' | 'duplications' | 'security' | 'maintainability';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  threshold: number;
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info';
}

export interface QualityGateResult {
  gateId: string;
  status: 'passed' | 'failed' | 'warning';
  timestamp: Date;
  results: QualityRuleResult[];
  overallScore: number;
  canDeploy: boolean;
}

export interface QualityRuleResult {
  rule: QualityRule;
  actualValue: number;
  status: 'passed' | 'failed';
  message: string;
}

export interface TestSuite {
  id: string;
  name: string;
  tests: GeneratedTest[];
  coverage: CoverageReport;
  qualityGate?: QualityGateResult;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  createdAt: Date;
}

export interface MockData {
  type: string;
  value: any;
  description: string;
}

export interface TestTemplate {
  name: string;
  framework: string;
  template: string;
  variables: string[];
  description: string;
}