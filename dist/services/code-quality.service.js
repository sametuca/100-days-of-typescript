"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeQualityService = void 0;
const ai_analysis_service_1 = require("./ai-analysis.service");
class CodeQualityService {
    static async generateReport(projectId) {
        const relevantResults = projectId
            ? this.analysisHistory.filter(r => r.fileName.includes(`project-${projectId}`))
            : this.analysisHistory;
        if (relevantResults.length === 0) {
            return this.getEmptyReport();
        }
        const summary = this.calculateSummary(relevantResults);
        const trends = this.calculateTrends(relevantResults);
        const recommendations = ai_analysis_service_1.AIAnalysisService.generateAIInsights(relevantResults);
        return {
            summary,
            trends,
            recommendations
        };
    }
    static addAnalysisResult(result) {
        this.analysisHistory.push(result);
        if (this.analysisHistory.length > 100) {
            this.analysisHistory = this.analysisHistory.slice(-100);
        }
    }
    static getQualityTrend(fileName) {
        const fileResults = this.analysisHistory
            .filter(r => r.fileName === fileName)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .slice(-5);
        if (fileResults.length < 2)
            return 'stable';
        const scores = fileResults.map(r => r.overallScore);
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        const difference = secondAvg - firstAvg;
        if (difference > 5)
            return 'improving';
        if (difference < -5)
            return 'declining';
        return 'stable';
    }
    static getTopIssues(limit = 10) {
        const issueMap = new Map();
        this.analysisHistory.forEach(result => {
            result.securityIssues.forEach(issue => {
                const key = `${issue.rule}-${issue.severity}`;
                if (issueMap.has(key)) {
                    issueMap.get(key).count++;
                }
                else {
                    issueMap.set(key, {
                        count: 1,
                        severity: issue.severity,
                        description: issue.message
                    });
                }
            });
            result.performanceIssues.forEach(issue => {
                const key = `${issue.type}-${issue.severity}`;
                if (issueMap.has(key)) {
                    issueMap.get(key).count++;
                }
                else {
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
    static getQualityMetrics() {
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
    static calculateSummary(results) {
        const totalFiles = new Set(results.map(r => r.fileName)).size;
        const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
        const totalIssues = results.reduce((sum, r) => sum + r.securityIssues.length + r.performanceIssues.length, 0);
        const criticalIssues = results.reduce((sum, r) => sum + r.securityIssues.filter(i => i.severity === 'critical').length +
            r.performanceIssues.filter(i => i.severity === 'critical').length, 0);
        return {
            totalFiles,
            averageScore: Math.round(averageScore),
            totalIssues,
            criticalIssues
        };
    }
    static calculateTrends(results) {
        const sortedResults = results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        if (sortedResults.length < 2) {
            return {
                qualityTrend: 'stable',
                complexityTrend: 'stable'
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
    static getEmptyReport() {
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
exports.CodeQualityService = CodeQualityService;
CodeQualityService.analysisHistory = [];
//# sourceMappingURL=code-quality.service.js.map