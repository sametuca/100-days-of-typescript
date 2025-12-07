"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageAnalyzerService = void 0;
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
class CoverageAnalyzerService {
    static async analyzeCoverage(projectId) {
        const files = await this.scanProjectFiles();
        const fileCoverageData = await Promise.all(files.map(file => this.analyzeFile(file)));
        const overall = this.calculateOverallMetrics(fileCoverageData);
        const summary = this.generateSummary(fileCoverageData);
        const report = {
            id: (0, uuid_1.v4)(),
            projectId,
            timestamp: new Date(),
            overall,
            files: fileCoverageData,
            summary
        };
        this.coverageHistory.push(report);
        return report;
    }
    static getCoverageHistory(projectId) {
        return projectId
            ? this.coverageHistory.filter(r => r.projectId === projectId)
            : this.coverageHistory;
    }
    static getCoverageTrend(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.coverageHistory
            .filter(r => r.timestamp >= cutoffDate)
            .map(r => ({
            date: r.timestamp.toISOString().split('T')[0],
            coverage: r.overall.lines.percentage
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    static getUncoveredFiles() {
        const latestReport = this.coverageHistory[this.coverageHistory.length - 1];
        if (!latestReport)
            return [];
        return latestReport.files.filter(file => file.metrics.lines.percentage < 80 ||
            file.uncoveredLines.length > 0);
    }
    static generateCoverageGoals(currentCoverage) {
        const goals = [];
        if (currentCoverage < 60) {
            goals.push({
                target: 70,
                timeframe: '2 weeks',
                actions: [
                    'Add unit tests for core functions',
                    'Focus on business logic coverage',
                    'Set up automated test generation'
                ]
            });
        }
        if (currentCoverage < 80) {
            goals.push({
                target: 85,
                timeframe: '1 month',
                actions: [
                    'Add integration tests',
                    'Cover edge cases',
                    'Implement E2E tests for critical paths'
                ]
            });
        }
        if (currentCoverage >= 80) {
            goals.push({
                target: 95,
                timeframe: '6 weeks',
                actions: [
                    'Add mutation testing',
                    'Cover error handling paths',
                    'Add performance tests'
                ]
            });
        }
        return goals;
    }
    static async scanProjectFiles() {
        return [
            'src/controllers/task.controller.ts',
            'src/services/task.service.ts',
            'src/utils/validation.ts',
            'src/models/task.model.ts'
        ];
    }
    static async analyzeFile(filePath) {
        const mockMetrics = this.generateMockMetrics();
        return {
            fileName: path.basename(filePath),
            path: filePath,
            metrics: mockMetrics,
            uncoveredLines: this.generateUncoveredLines(mockMetrics.lines.total, mockMetrics.lines.covered),
            uncoveredFunctions: this.generateUncoveredFunctions()
        };
    }
    static generateMockMetrics() {
        const linesTotal = Math.floor(Math.random() * 200) + 50;
        const linesCovered = Math.floor(linesTotal * (0.6 + Math.random() * 0.3));
        const functionsTotal = Math.floor(Math.random() * 20) + 5;
        const functionsCovered = Math.floor(functionsTotal * (0.7 + Math.random() * 0.25));
        const branchesTotal = Math.floor(Math.random() * 30) + 10;
        const branchesCovered = Math.floor(branchesTotal * (0.5 + Math.random() * 0.4));
        const statementsTotal = Math.floor(Math.random() * 150) + 30;
        const statementsCovered = Math.floor(statementsTotal * (0.65 + Math.random() * 0.25));
        return {
            lines: {
                total: linesTotal,
                covered: linesCovered,
                percentage: Math.round((linesCovered / linesTotal) * 100)
            },
            functions: {
                total: functionsTotal,
                covered: functionsCovered,
                percentage: Math.round((functionsCovered / functionsTotal) * 100)
            },
            branches: {
                total: branchesTotal,
                covered: branchesCovered,
                percentage: Math.round((branchesCovered / branchesTotal) * 100)
            },
            statements: {
                total: statementsTotal,
                covered: statementsCovered,
                percentage: Math.round((statementsCovered / statementsTotal) * 100)
            }
        };
    }
    static generateUncoveredLines(total, covered) {
        const uncoveredCount = total - covered;
        const uncoveredLines = [];
        for (let i = 0; i < uncoveredCount; i++) {
            uncoveredLines.push(Math.floor(Math.random() * total) + 1);
        }
        return [...new Set(uncoveredLines)].sort((a, b) => a - b);
    }
    static generateUncoveredFunctions() {
        const possibleFunctions = [
            'handleError', 'validateInput', 'processData', 'formatOutput', 'cleanup'
        ];
        const uncoveredCount = Math.floor(Math.random() * 3);
        return possibleFunctions.slice(0, uncoveredCount);
    }
    static calculateOverallMetrics(files) {
        const totals = files.reduce((acc, file) => ({
            lines: acc.lines + file.metrics.lines.total,
            linesCovered: acc.linesCovered + file.metrics.lines.covered,
            functions: acc.functions + file.metrics.functions.total,
            functionsCovered: acc.functionsCovered + file.metrics.functions.covered,
            branches: acc.branches + file.metrics.branches.total,
            branchesCovered: acc.branchesCovered + file.metrics.branches.covered,
            statements: acc.statements + file.metrics.statements.total,
            statementsCovered: acc.statementsCovered + file.metrics.statements.covered
        }), {
            lines: 0, linesCovered: 0,
            functions: 0, functionsCovered: 0,
            branches: 0, branchesCovered: 0,
            statements: 0, statementsCovered: 0
        });
        return {
            lines: {
                total: totals.lines,
                covered: totals.linesCovered,
                percentage: Math.round((totals.linesCovered / totals.lines) * 100)
            },
            functions: {
                total: totals.functions,
                covered: totals.functionsCovered,
                percentage: Math.round((totals.functionsCovered / totals.functions) * 100)
            },
            branches: {
                total: totals.branches,
                covered: totals.branchesCovered,
                percentage: Math.round((totals.branchesCovered / totals.branches) * 100)
            },
            statements: {
                total: totals.statements,
                covered: totals.statementsCovered,
                percentage: Math.round((totals.statementsCovered / totals.statements) * 100)
            }
        };
    }
    static generateSummary(files) {
        const totalFiles = files.length;
        const coveredFiles = files.filter(f => f.metrics.lines.percentage >= 80).length;
        const uncoveredLines = files.reduce((sum, f) => sum + f.uncoveredLines.length, 0);
        const totalLines = files.reduce((sum, f) => sum + f.metrics.lines.total, 0);
        return {
            totalFiles,
            coveredFiles,
            uncoveredLines,
            totalLines
        };
    }
}
exports.CoverageAnalyzerService = CoverageAnalyzerService;
CoverageAnalyzerService.coverageHistory = [];
//# sourceMappingURL=coverage-analyzer.service.js.map