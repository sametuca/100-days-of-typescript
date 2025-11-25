import { CodeQualityMetrics, SecurityIssue, PerformanceIssue } from '../types/analysis.types';

export class CodeParser {
  static calculateComplexity(code: string): number {
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'try', '&&', '||', '?'
    ];
    
    let complexity = 1;
    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });
    
    return Math.min(complexity, 50);
  }

  static calculateMaintainabilityIndex(code: string): number {
    const lines = code.split('\n').length;
    const complexity = this.calculateComplexity(code);
    const volume = code.length;
    
    const maintainability = Math.max(0, 
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(lines)
    );
    
    return Math.round(maintainability);
  }

  static detectCodeSmells(code: string): number {
    const smells = [
      /function\s+\w+\([^)]*\)\s*{[^}]{500,}}/g, // Long methods
      /class\s+\w+\s*{[^}]{2000,}}/g, // Large classes
      /\/\*[\s\S]*?\*\/|\/\/.*$/gm, // Excessive comments
      /console\.log/g, // Debug statements
      /eval\(/g, // Eval usage
    ];
    
    return smells.reduce((count, pattern) => {
      const matches = code.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  static detectSecurityIssues(code: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = code.split('\n');
    
    const patterns = [
      { pattern: /eval\(/, type: 'vulnerability', severity: 'critical', rule: 'no-eval', message: 'Avoid using eval()' },
      { pattern: /innerHTML\s*=/, type: 'vulnerability', severity: 'high', rule: 'no-innerHTML', message: 'Potential XSS vulnerability' },
      { pattern: /document\.write/, type: 'vulnerability', severity: 'medium', rule: 'no-document-write', message: 'Avoid document.write' },
      { pattern: /Math\.random\(\)/, type: 'warning', severity: 'low', rule: 'secure-random', message: 'Use crypto.randomBytes for security' }
    ];
    
    lines.forEach((line, index) => {
      patterns.forEach(({ pattern, type, severity, rule, message }) => {
        if (pattern.test(line)) {
          issues.push({
            type: type as 'vulnerability' | 'warning',
            severity: severity as 'critical' | 'high' | 'medium' | 'low',
            line: index + 1,
            column: line.search(pattern) + 1,
            message,
            rule,
            suggestion: `Consider refactoring this code to follow security best practices`
          });
        }
      });
    });
    
    return issues;
  }

  static detectPerformanceIssues(code: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const lines = code.split('\n');
    
    const patterns = [
      { 
        pattern: /for\s*\([^)]*\.length[^)]*\)/, 
        type: 'cpu', 
        severity: 'medium',
        message: 'Loop with length calculation in condition',
        impact: 'Repeated length calculation in loop',
        suggestion: 'Cache array length before loop'
      },
      {
        pattern: /document\.getElementById.*loop|for.*document\.getElementById/,
        type: 'io',
        severity: 'high',
        message: 'DOM query in loop',
        impact: 'Repeated DOM queries cause performance issues',
        suggestion: 'Cache DOM elements outside the loop'
      }
    ];
    
    lines.forEach((line, index) => {
      patterns.forEach(({ pattern, type, severity, message, impact, suggestion }) => {
        if (pattern.test(line)) {
          issues.push({
            type: type as 'memory' | 'cpu' | 'io',
            severity: severity as 'critical' | 'high' | 'medium' | 'low',
            line: index + 1,
            message,
            impact,
            suggestion
          });
        }
      });
    });
    
    return issues;
  }

  static calculateTechnicalDebt(metrics: CodeQualityMetrics): number {
    const complexityWeight = 0.3;
    const maintainabilityWeight = 0.4;
    const smellsWeight = 0.3;
    
    const normalizedComplexity = Math.min(metrics.complexity / 10, 1);
    const normalizedMaintainability = Math.max(0, (100 - metrics.maintainabilityIndex) / 100);
    const normalizedSmells = Math.min(metrics.codeSmells / 20, 1);
    
    return Math.round(
      (normalizedComplexity * complexityWeight + 
       normalizedMaintainability * maintainabilityWeight + 
       normalizedSmells * smellsWeight) * 100
    );
  }

  static calculateOverallScore(metrics: CodeQualityMetrics, securityIssues: SecurityIssue[], performanceIssues: PerformanceIssue[]): number {
    let score = 100;
    
    // Complexity penalty
    score -= Math.min(metrics.complexity * 2, 30);
    
    // Maintainability bonus/penalty
    score += (metrics.maintainabilityIndex - 50) * 0.5;
    
    // Security issues penalty
    securityIssues.forEach(issue => {
      const penalties = { critical: 20, high: 10, medium: 5, low: 2 };
      score -= penalties[issue.severity];
    });
    
    // Performance issues penalty
    performanceIssues.forEach(issue => {
      const penalties = { critical: 15, high: 8, medium: 4, low: 2 };
      score -= penalties[issue.severity];
    });
    
    // Code smells penalty
    score -= metrics.codeSmells * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}