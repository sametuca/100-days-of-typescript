import { 
  CodeAnalysisRequest, 
  CodeAnalysisResult, 
  RefactoringSuggestion, 
  AIInsight,
  CodeQualityMetrics 
} from '../types/analysis.types';
import { CodeParser } from '../utils/code-parser';
import { v4 as uuidv4 } from 'uuid';

export class AIAnalysisService {
  static async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResult> {
    const { code, language, fileName } = request;
    
    // Calculate metrics
    const metrics: CodeQualityMetrics = {
      complexity: CodeParser.calculateComplexity(code),
      maintainabilityIndex: CodeParser.calculateMaintainabilityIndex(code),
      technicalDebt: 0, // Will be calculated after other metrics
      codeSmells: CodeParser.detectCodeSmells(code),
      duplications: this.detectDuplications(code)
    };
    
    metrics.technicalDebt = CodeParser.calculateTechnicalDebt(metrics);
    
    // Detect issues
    const securityIssues = CodeParser.detectSecurityIssues(code);
    const performanceIssues = CodeParser.detectPerformanceIssues(code);
    
    // Generate suggestions
    const suggestions = this.generateRefactoringSuggestions(code, metrics);
    
    // Calculate overall score
    const overallScore = CodeParser.calculateOverallScore(metrics, securityIssues, performanceIssues);
    const grade = CodeParser.getGrade(overallScore);
    
    return {
      id: uuidv4(),
      fileName,
      language,
      timestamp: new Date(),
      metrics,
      securityIssues,
      performanceIssues,
      suggestions,
      overallScore,
      grade
    };
  }

  static generateRefactoringSuggestions(code: string, metrics: CodeQualityMetrics): RefactoringSuggestion[] {
    const suggestions: RefactoringSuggestion[] = [];
    const lines = code.split('\n');
    
    // Long method detection
    lines.forEach((line, index) => {
      if (line.includes('function') && this.isLongMethod(code, index)) {
        suggestions.push({
          type: 'extract_method',
          priority: 'high',
          startLine: index + 1,
          endLine: index + 20,
          description: 'This method is too long and should be broken down',
          before: 'Long method with multiple responsibilities',
          after: 'Smaller, focused methods with single responsibilities',
          benefits: ['Improved readability', 'Better testability', 'Easier maintenance']
        });
      }
    });
    
    // Variable naming suggestions
    const badVariableNames = code.match(/\b[a-z]\b|\btemp\b|\bdata\b|\binfo\b/g);
    if (badVariableNames && badVariableNames.length > 0) {
      suggestions.push({
        type: 'rename',
        priority: 'medium',
        startLine: 1,
        endLine: lines.length,
        description: 'Use more descriptive variable names',
        before: 'Generic names like "data", "temp", single letters',
        after: 'Descriptive names that explain the purpose',
        benefits: ['Better code readability', 'Self-documenting code', 'Easier debugging']
      });
    }
    
    // Performance optimization suggestions
    if (metrics.complexity > 10) {
      suggestions.push({
        type: 'optimize',
        priority: 'high',
        startLine: 1,
        endLine: lines.length,
        description: 'Reduce cyclomatic complexity',
        before: 'Complex nested conditions and loops',
        after: 'Simplified logic with early returns and guard clauses',
        benefits: ['Better performance', 'Easier to understand', 'Reduced bugs']
      });
    }
    
    return suggestions;
  }

  static generateAIInsights(results: CodeAnalysisResult[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const avgComplexity = results.reduce((sum, r) => sum + r.metrics.complexity, 0) / results.length;
    
    // Complexity insight
    if (avgComplexity > 15) {
      insights.push({
        category: 'maintainability',
        confidence: 0.85,
        description: 'Your codebase has high cyclomatic complexity',
        recommendation: 'Consider breaking down complex functions into smaller, more focused units',
        resources: [
          'Clean Code by Robert Martin',
          'Refactoring: Improving the Design of Existing Code'
        ]
      });
    }
    
    // Security insight
    const hasSecurityIssues = results.some(r => r.securityIssues.length > 0);
    if (hasSecurityIssues) {
      insights.push({
        category: 'security',
        confidence: 0.9,
        description: 'Security vulnerabilities detected in your code',
        recommendation: 'Review and fix security issues, implement secure coding practices',
        resources: [
          'OWASP Top 10',
          'Secure Coding Guidelines'
        ]
      });
    }
    
    // Performance insight
    const hasPerformanceIssues = results.some(r => r.performanceIssues.length > 0);
    if (hasPerformanceIssues) {
      insights.push({
        category: 'performance',
        confidence: 0.8,
        description: 'Performance bottlenecks identified',
        recommendation: 'Optimize loops, cache DOM queries, and reduce computational complexity',
        resources: [
          'High Performance JavaScript',
          'Web Performance Best Practices'
        ]
      });
    }
    
    return insights;
  }

  private static isLongMethod(code: string, startIndex: number): boolean {
    const lines = code.split('\n');
    let braceCount = 0;
    let lineCount = 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      lineCount++;
      
      if (braceCount === 0 && lineCount > 1) {
        return lineCount > 20;
      }
    }
    
    return lineCount > 20;
  }

  private static detectDuplications(code: string): number {
    const lines = code.split('\n').filter(line => line.trim().length > 10);
    const duplicates = new Set<string>();
    
    for (let i = 0; i < lines.length - 2; i++) {
      const block = lines.slice(i, i + 3).join('\n');
      for (let j = i + 3; j < lines.length - 2; j++) {
        const compareBlock = lines.slice(j, j + 3).join('\n');
        if (block === compareBlock) {
          duplicates.add(block);
        }
      }
    }
    
    return duplicates.size;
  }
}