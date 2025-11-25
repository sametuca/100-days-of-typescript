import { QualityGate, QualityRule, QualityGateResult, QualityRuleResult } from '../types/testing.types';
import { CoverageAnalyzerService } from './coverage-analyzer.service';
import { CodeQualityService } from './code-quality.service';
import { v4 as uuidv4 } from 'uuid';

export class QualityGateService {
  private static qualityGates: QualityGate[] = [];

  static createQualityGate(name: string, rules: QualityRule[], projectId?: number): QualityGate {
    const gate: QualityGate = {
      id: uuidv4(),
      name,
      rules,
      isActive: true,
      projectId,
      createdAt: new Date()
    };
    
    this.qualityGates.push(gate);
    return gate;
  }

  static getDefaultQualityGate(): QualityGate {
    const defaultRules: QualityRule[] = [
      {
        metric: 'coverage',
        operator: 'gte',
        threshold: 80,
        severity: 'blocker'
      },
      {
        metric: 'complexity',
        operator: 'lte',
        threshold: 15,
        severity: 'critical'
      },
      {
        metric: 'duplications',
        operator: 'lte',
        threshold: 5,
        severity: 'major'
      },
      {
        metric: 'security',
        operator: 'eq',
        threshold: 0,
        severity: 'blocker'
      },
      {
        metric: 'maintainability',
        operator: 'gte',
        threshold: 70,
        severity: 'major'
      }
    ];

    return this.createQualityGate('Default Quality Gate', defaultRules);
  }

  static async evaluateQualityGate(gateId: string, projectId?: number): Promise<QualityGateResult> {
    const gate = this.qualityGates.find(g => g.id === gateId);
    if (!gate) {
      throw new Error(`Quality gate ${gateId} not found`);
    }

    // Collect metrics from various services
    const coverageReport = await CoverageAnalyzerService.analyzeCoverage(projectId);
    const qualityMetrics = CodeQualityService.getQualityMetrics();
    
    const results: QualityRuleResult[] = [];
    let overallScore = 100;
    let hasBlockers = false;

    for (const rule of gate.rules) {
      const actualValue = this.getMetricValue(rule.metric, coverageReport, qualityMetrics);
      const passed = this.evaluateRule(rule, actualValue);
      
      results.push({
        rule,
        actualValue,
        status: passed ? 'passed' : 'failed',
        message: this.generateRuleMessage(rule, actualValue, passed)
      });

      if (!passed) {
        const penalty = this.getSeverityPenalty(rule.severity);
        overallScore -= penalty;
        
        if (rule.severity === 'blocker') {
          hasBlockers = true;
        }
      }
    }

    const status = hasBlockers ? 'failed' : 
                  overallScore >= 80 ? 'passed' : 'warning';

    return {
      gateId,
      status,
      timestamp: new Date(),
      results,
      overallScore: Math.max(0, overallScore),
      canDeploy: status !== 'failed'
    };
  }

  static getAllQualityGates(projectId?: number): QualityGate[] {
    return projectId 
      ? this.qualityGates.filter(g => g.projectId === projectId)
      : this.qualityGates;
  }

  static updateQualityGate(gateId: string, updates: Partial<QualityGate>): QualityGate {
    const gateIndex = this.qualityGates.findIndex(g => g.id === gateId);
    if (gateIndex === -1) {
      throw new Error(`Quality gate ${gateId} not found`);
    }

    this.qualityGates[gateIndex] = { ...this.qualityGates[gateIndex], ...updates };
    return this.qualityGates[gateIndex];
  }

  static deleteQualityGate(gateId: string): boolean {
    const gateIndex = this.qualityGates.findIndex(g => g.id === gateId);
    if (gateIndex === -1) {
      return false;
    }

    this.qualityGates.splice(gateIndex, 1);
    return true;
  }

  static generateQualityReport(gateResults: QualityGateResult[]): {
    summary: {
      totalGates: number;
      passedGates: number;
      failedGates: number;
      warningGates: number;
    };
    trends: {
      qualityTrend: 'improving' | 'declining' | 'stable';
      averageScore: number;
    };
    recommendations: string[];
  } {
    const summary = {
      totalGates: gateResults.length,
      passedGates: gateResults.filter(r => r.status === 'passed').length,
      failedGates: gateResults.filter(r => r.status === 'failed').length,
      warningGates: gateResults.filter(r => r.status === 'warning').length
    };

    const averageScore = gateResults.reduce((sum, r) => sum + r.overallScore, 0) / gateResults.length;
    
    const recommendations: string[] = [];
    
    // Analyze common failures
    const failedRules = gateResults.flatMap(r => r.results.filter(rr => rr.status === 'failed'));
    const ruleFailureCounts = failedRules.reduce((acc, rule) => {
      acc[rule.rule.metric] = (acc[rule.rule.metric] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(ruleFailureCounts).forEach(([metric, count]) => {
      if (count > 1) {
        recommendations.push(this.getMetricRecommendation(metric));
      }
    });

    return {
      summary,
      trends: {
        qualityTrend: 'stable', // Would be calculated from historical data
        averageScore: Math.round(averageScore)
      },
      recommendations
    };
  }

  private static getMetricValue(
    metric: string, 
    coverageReport: any, 
    qualityMetrics: any
  ): number {
    switch (metric) {
      case 'coverage':
        return coverageReport.overall.lines.percentage;
      case 'complexity':
        return qualityMetrics.averageComplexity;
      case 'duplications':
        return 2; // Mock value
      case 'security':
        return 0; // Mock value - no security issues
      case 'maintainability':
        return qualityMetrics.averageMaintainability;
      default:
        return 0;
    }
  }

  private static evaluateRule(rule: QualityRule, actualValue: number): boolean {
    switch (rule.operator) {
      case 'gt':
        return actualValue > rule.threshold;
      case 'gte':
        return actualValue >= rule.threshold;
      case 'lt':
        return actualValue < rule.threshold;
      case 'lte':
        return actualValue <= rule.threshold;
      case 'eq':
        return actualValue === rule.threshold;
      default:
        return false;
    }
  }

  private static generateRuleMessage(rule: QualityRule, actualValue: number, passed: boolean): string {
    const status = passed ? 'PASSED' : 'FAILED';
    const operator = this.getOperatorSymbol(rule.operator);
    
    return `${rule.metric.toUpperCase()} ${status}: ${actualValue} ${operator} ${rule.threshold}`;
  }

  private static getOperatorSymbol(operator: string): string {
    const symbols = {
      'gt': '>',
      'gte': '>=',
      'lt': '<',
      'lte': '<=',
      'eq': '='
    };
    return symbols[operator as keyof typeof symbols] || operator;
  }

  private static getSeverityPenalty(severity: string): number {
    const penalties = {
      'blocker': 50,
      'critical': 30,
      'major': 20,
      'minor': 10,
      'info': 5
    };
    return penalties[severity as keyof typeof penalties] || 10;
  }

  private static getMetricRecommendation(metric: string): string {
    const recommendations = {
      'coverage': 'Increase test coverage by adding unit and integration tests',
      'complexity': 'Reduce cyclomatic complexity by breaking down large functions',
      'duplications': 'Eliminate code duplications through refactoring',
      'security': 'Fix security vulnerabilities and implement secure coding practices',
      'maintainability': 'Improve code maintainability through better documentation and structure'
    };
    
    return recommendations[metric as keyof typeof recommendations] || 
           `Improve ${metric} metrics according to quality standards`;
  }
}