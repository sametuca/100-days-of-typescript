"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityGateService = void 0;
const coverage_analyzer_service_1 = require("./coverage-analyzer.service");
const code_quality_service_1 = require("./code-quality.service");
const uuid_1 = require("uuid");
class QualityGateService {
    static createQualityGate(name, rules, projectId) {
        const gate = {
            id: (0, uuid_1.v4)(),
            name,
            rules,
            isActive: true,
            projectId,
            createdAt: new Date()
        };
        this.qualityGates.push(gate);
        return gate;
    }
    static getDefaultQualityGate() {
        const defaultRules = [
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
    static async evaluateQualityGate(gateId, projectId) {
        const gate = this.qualityGates.find(g => g.id === gateId);
        if (!gate) {
            throw new Error(`Quality gate ${gateId} not found`);
        }
        const coverageReport = await coverage_analyzer_service_1.CoverageAnalyzerService.analyzeCoverage(projectId);
        const qualityMetrics = code_quality_service_1.CodeQualityService.getQualityMetrics();
        const results = [];
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
    static getAllQualityGates(projectId) {
        return projectId
            ? this.qualityGates.filter(g => g.projectId === projectId)
            : this.qualityGates;
    }
    static updateQualityGate(gateId, updates) {
        const gateIndex = this.qualityGates.findIndex(g => g.id === gateId);
        if (gateIndex === -1) {
            throw new Error(`Quality gate ${gateId} not found`);
        }
        this.qualityGates[gateIndex] = { ...this.qualityGates[gateIndex], ...updates };
        return this.qualityGates[gateIndex];
    }
    static deleteQualityGate(gateId) {
        const gateIndex = this.qualityGates.findIndex(g => g.id === gateId);
        if (gateIndex === -1) {
            return false;
        }
        this.qualityGates.splice(gateIndex, 1);
        return true;
    }
    static generateQualityReport(gateResults) {
        const summary = {
            totalGates: gateResults.length,
            passedGates: gateResults.filter(r => r.status === 'passed').length,
            failedGates: gateResults.filter(r => r.status === 'failed').length,
            warningGates: gateResults.filter(r => r.status === 'warning').length
        };
        const averageScore = gateResults.reduce((sum, r) => sum + r.overallScore, 0) / gateResults.length;
        const recommendations = [];
        const failedRules = gateResults.flatMap(r => r.results.filter(rr => rr.status === 'failed'));
        const ruleFailureCounts = failedRules.reduce((acc, rule) => {
            acc[rule.rule.metric] = (acc[rule.rule.metric] || 0) + 1;
            return acc;
        }, {});
        Object.entries(ruleFailureCounts).forEach(([metric, count]) => {
            if (count > 1) {
                recommendations.push(this.getMetricRecommendation(metric));
            }
        });
        return {
            summary,
            trends: {
                qualityTrend: 'stable',
                averageScore: Math.round(averageScore)
            },
            recommendations
        };
    }
    static getMetricValue(metric, coverageReport, qualityMetrics) {
        switch (metric) {
            case 'coverage':
                return coverageReport.overall.lines.percentage;
            case 'complexity':
                return qualityMetrics.averageComplexity;
            case 'duplications':
                return 2;
            case 'security':
                return 0;
            case 'maintainability':
                return qualityMetrics.averageMaintainability;
            default:
                return 0;
        }
    }
    static evaluateRule(rule, actualValue) {
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
    static generateRuleMessage(rule, actualValue, passed) {
        const status = passed ? 'PASSED' : 'FAILED';
        const operator = this.getOperatorSymbol(rule.operator);
        return `${rule.metric.toUpperCase()} ${status}: ${actualValue} ${operator} ${rule.threshold}`;
    }
    static getOperatorSymbol(operator) {
        const symbols = {
            'gt': '>',
            'gte': '>=',
            'lt': '<',
            'lte': '<=',
            'eq': '='
        };
        return symbols[operator] || operator;
    }
    static getSeverityPenalty(severity) {
        const penalties = {
            'blocker': 50,
            'critical': 30,
            'major': 20,
            'minor': 10,
            'info': 5
        };
        return penalties[severity] || 10;
    }
    static getMetricRecommendation(metric) {
        const recommendations = {
            'coverage': 'Increase test coverage by adding unit and integration tests',
            'complexity': 'Reduce cyclomatic complexity by breaking down large functions',
            'duplications': 'Eliminate code duplications through refactoring',
            'security': 'Fix security vulnerabilities and implement secure coding practices',
            'maintainability': 'Improve code maintainability through better documentation and structure'
        };
        return recommendations[metric] ||
            `Improve ${metric} metrics according to quality standards`;
    }
}
exports.QualityGateService = QualityGateService;
QualityGateService.qualityGates = [];
//# sourceMappingURL=quality-gate.service.js.map