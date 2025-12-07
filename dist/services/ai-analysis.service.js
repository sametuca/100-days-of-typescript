"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalysisService = void 0;
const code_parser_1 = require("../utils/code-parser");
const uuid_1 = require("uuid");
class AIAnalysisService {
    static async analyzeCode(request) {
        const { code, language, fileName } = request;
        const metrics = {
            complexity: code_parser_1.CodeParser.calculateComplexity(code),
            maintainabilityIndex: code_parser_1.CodeParser.calculateMaintainabilityIndex(code),
            technicalDebt: 0,
            codeSmells: code_parser_1.CodeParser.detectCodeSmells(code),
            duplications: this.detectDuplications(code)
        };
        metrics.technicalDebt = code_parser_1.CodeParser.calculateTechnicalDebt(metrics);
        const securityIssues = code_parser_1.CodeParser.detectSecurityIssues(code);
        const performanceIssues = code_parser_1.CodeParser.detectPerformanceIssues(code);
        const suggestions = this.generateRefactoringSuggestions(code, metrics);
        const overallScore = code_parser_1.CodeParser.calculateOverallScore(metrics, securityIssues, performanceIssues);
        const grade = code_parser_1.CodeParser.getGrade(overallScore);
        return {
            id: (0, uuid_1.v4)(),
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
    static generateRefactoringSuggestions(code, metrics) {
        const suggestions = [];
        const lines = code.split('\n');
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
    static generateAIInsights(results) {
        const insights = [];
        const avgComplexity = results.reduce((sum, r) => sum + r.metrics.complexity, 0) / results.length;
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
    static isLongMethod(code, startIndex) {
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
    static detectDuplications(code) {
        const lines = code.split('\n').filter(line => line.trim().length > 10);
        const duplicates = new Set();
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
exports.AIAnalysisService = AIAnalysisService;
//# sourceMappingURL=ai-analysis.service.js.map