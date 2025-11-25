import { CodeAnalysisResult, AnalysisReport } from '../types/analysis.types';
import { AIAnalysisService } from './ai-analysis.service';

export class CodeQualityService {
  private static analysisHistory: CodeAnalysisResult[] = [];

  static async generateReport(projectId?: number): Promise<AnalysisReport> {
    const relevantResults = projectId 
      ? this.analysisHistory.filter(r => r.fileName.includes(`project-${projectId}`))
      : this.analysisHistory;

    if (relevantResults.length === 0) {
      return this.getEmptyReport();
    }

    const summary = this.calculateSummary(relevantResults);
    const trends = this.calculateTrends(relevantResults);
    const recommendations = AIAnalysisService.generateAIInsights(relevantResults);

    return {
      summary,
      trends,
      recommendations
    };
  }

  static addAnalysisResult(result: CodeAnalysisResult): void {
    this.analysisHistory.push(result);
    
    // Keep only last 100 results to prevent memory issues
    if (this.analysisHistory.length > 100) {
      this.analysisHistory = this.analysisHistory.slice(-100);
    }
  }

  static getQualityTrend(fileName: string): 'improving' | 'declining' | 'stable' {
    const fileResults = this.analysisHistory
      .filter(r => r.fileName === fileName)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-5); // Last 5 analyses

    if (fileResults.length < 2) return 'stable';

    const scores = fileResults.map(r => r.overallScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  static getTopIssues(limit: number = 10): Array<{
    type: string;
    count: number;
    severity: string;
    description: string;
  }> {
    const issueMap = new Map<string, { count: number; severity: string; description: string }>();

    this.analysisHistory.forEach(result => {
      // Security issues
      result.securityIssues.forEach(issue => {
        const key = `${issue.rule}-${issue.severity}`;
        if (issueMap.has(key)) {
          issueMap.get(key)!.count++;
        } else {
          issueMap.set(key, {
            count: 1,
            severity: issue.severity,
            description: issue.message
          });
        }
      });

      // Performance issues
      result.performanceIssues.forEach(issue => {
        const key = `${issue.type}-${issue.severity}`;
        if (issueMap.has(key)) {
          issueMap.get(key)!.count++;
        } else {
          issueMap.set(key, {
            count: 1,
            severity: issue.severity,
            description: issue.message
          });
        }
      });
    });

    return Array.from(issueMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static getQualityMetrics(): {
    averageComplexity: number;
    averageMaintainability: number;
    averageScore: number;
    totalAnalyses: number;
  } {
    if (this.analysisHistory.length === 0) {
      return {
        averageComplexity: 0,
        averageMaintainability: 0,
        averageScore: 0,
        totalAnalyses: 0
      };
    }

    const totalComplexity = this.analysisHistory.reduce((sum, r) => sum + r.metrics.complexity, 0);
    const totalMaintainability = this.analysisHistory.reduce((sum, r) => sum + r.metrics.maintainabilityIndex, 0);
    const totalScore = this.analysisHistory.reduce((sum, r) => sum + r.overallScore, 0);

    return {
      averageComplexity: Math.round(totalComplexity / this.analysisHistory.length),
      averageMaintainability: Math.round(totalMaintainability / this.analysisHistory.length),
      averageScore: Math.round(totalScore / this.analysisHistory.length),
      totalAnalyses: this.analysisHistory.length
    };
  }

  private static calculateSummary(results: CodeAnalysisResult[]) {
    const totalFiles = new Set(results.map(r => r.fileName)).size;
    const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    const totalIssues = results.reduce((sum, r) => 
      sum + r.securityIssues.length + r.performanceIssues.length, 0
    );
    const criticalIssues = results.reduce((sum, r) => 
      sum + r.securityIssues.filter(i => i.severity === 'critical').length +
      r.performanceIssues.filter(i => i.severity === 'critical').length, 0
    );

    return {
      totalFiles,
      averageScore: Math.round(averageScore),
      totalIssues,
      criticalIssues
    };
  }

  private static calculateTrends(results: CodeAnalysisResult[]) {
    const sortedResults = results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (sortedResults.length < 2) {
      return {
        qualityTrend: 'stable' as const,
        complexityTrend: 'stable' as const
      };
    }

    const midPoint = Math.floor(sortedResults.length / 2);
    const firstHalf = sortedResults.slice(0, midPoint);
    const secondHalf = sortedResults.slice(midPoint);

    const firstQualityAvg = firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length;
    const secondQualityAvg = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length;

    const firstComplexityAvg = firstHalf.reduce((sum, r) => sum + r.metrics.complexity, 0) / firstHalf.length;
    const secondComplexityAvg = secondHalf.reduce((sum, r) => sum + r.metrics.complexity, 0) / secondHalf.length;

    const qualityDiff = secondQualityAvg - firstQualityAvg;
    const complexityDiff = secondComplexityAvg - firstComplexityAvg;

    return {
      qualityTrend: qualityDiff > 5 ? 'improving' : qualityDiff < -5 ? 'declining' : 'stable',
      complexityTrend: complexityDiff > 2 ? 'increasing' : complexityDiff < -2 ? 'decreasing' : 'stable'
    };
  }

  private static getEmptyReport(): AnalysisReport {
    return {
      summary: {
        totalFiles: 0,
        averageScore: 0,
        totalIssues: 0,
        criticalIssues: 0
      },
      trends: {
        qualityTrend: 'stable',
        complexityTrend: 'stable'
      },
      recommendations: []
    };
  }
}