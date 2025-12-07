"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingController = void 0;
const test_generator_service_1 = require("../services/test-generator.service");
const coverage_analyzer_service_1 = require("../services/coverage-analyzer.service");
const quality_gate_service_1 = require("../services/quality-gate.service");
const logger_1 = __importDefault(require("../utils/logger"));
class TestingController {
    static async generateTests(req, res) {
        try {
            const request = {
                code: req.body.code,
                language: req.body.language || 'javascript',
                fileName: req.body.fileName || 'untitled.js',
                testType: req.body.testType || 'unit',
                framework: req.body.framework || 'jest'
            };
            if (!request.code) {
                res.status(400).json({
                    success: false,
                    message: 'Code content is required'
                });
                return;
            }
            const result = await test_generator_service_1.TestGeneratorService.generateTests(request);
            logger_1.default.info(`Tests generated for ${result.fileName}`, {
                testCases: result.testCases.length,
                framework: result.framework
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Test generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Test generation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async generateBulkTests(req, res) {
        try {
            const { requests } = req.body;
            if (!Array.isArray(requests) || requests.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Requests array is required'
                });
                return;
            }
            const results = await test_generator_service_1.TestGeneratorService.generateBulkTests(requests);
            logger_1.default.info(`Bulk tests generated for ${results.length} files`);
            res.json({
                success: true,
                data: {
                    results,
                    summary: {
                        totalFiles: results.length,
                        totalTestCases: results.reduce((sum, r) => sum + r.testCases.length, 0),
                        frameworks: [...new Set(results.map(r => r.framework))]
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Bulk test generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Bulk test generation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeCoverage(req, res) {
        try {
            const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
            const report = await coverage_analyzer_service_1.CoverageAnalyzerService.analyzeCoverage(projectId);
            res.json({
                success: true,
                data: report
            });
        }
        catch (error) {
            logger_1.default.error('Coverage analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Coverage analysis failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getCoverageHistory(req, res) {
        try {
            const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
            const history = coverage_analyzer_service_1.CoverageAnalyzerService.getCoverageHistory(projectId);
            res.json({
                success: true,
                data: history
            });
        }
        catch (error) {
            logger_1.default.error('Coverage history retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve coverage history',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getCoverageTrend(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 30;
            const trend = coverage_analyzer_service_1.CoverageAnalyzerService.getCoverageTrend(days);
            res.json({
                success: true,
                data: trend
            });
        }
        catch (error) {
            logger_1.default.error('Coverage trend retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve coverage trend',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async createQualityGate(req, res) {
        try {
            const { name, rules, projectId } = req.body;
            if (!name || !rules) {
                res.status(400).json({
                    success: false,
                    message: 'Name and rules are required'
                });
                return;
            }
            const gate = quality_gate_service_1.QualityGateService.createQualityGate(name, rules, projectId);
            logger_1.default.info(`Quality gate created: ${gate.name}`, { gateId: gate.id });
            res.json({
                success: true,
                data: gate
            });
        }
        catch (error) {
            logger_1.default.error('Quality gate creation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Quality gate creation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async evaluateQualityGate(req, res) {
        try {
            const { gateId } = req.params;
            const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
            const result = await quality_gate_service_1.QualityGateService.evaluateQualityGate(gateId, projectId);
            logger_1.default.info(`Quality gate evaluated: ${gateId}`, {
                status: result.status,
                score: result.overallScore
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Quality gate evaluation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Quality gate evaluation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getQualityGates(req, res) {
        try {
            const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
            const gates = quality_gate_service_1.QualityGateService.getAllQualityGates(projectId);
            res.json({
                success: true,
                data: gates
            });
        }
        catch (error) {
            logger_1.default.error('Quality gates retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quality gates',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getDefaultQualityGate(_req, res) {
        try {
            const gate = quality_gate_service_1.QualityGateService.getDefaultQualityGate();
            res.json({
                success: true,
                data: gate
            });
        }
        catch (error) {
            logger_1.default.error('Default quality gate creation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create default quality gate',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async generateIntegrationTests(req, res) {
        try {
            const { endpoints } = req.body;
            if (!Array.isArray(endpoints)) {
                res.status(400).json({
                    success: false,
                    message: 'Endpoints array is required'
                });
                return;
            }
            const testCode = test_generator_service_1.TestGeneratorService.generateIntegrationTest(endpoints);
            res.json({
                success: true,
                data: {
                    testCode,
                    fileName: 'integration.test.ts',
                    endpoints: endpoints.length
                }
            });
        }
        catch (error) {
            logger_1.default.error('Integration test generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Integration test generation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async generateE2ETests(req, res) {
        try {
            const { userStories } = req.body;
            if (!Array.isArray(userStories)) {
                res.status(400).json({
                    success: false,
                    message: 'User stories array is required'
                });
                return;
            }
            const testCode = test_generator_service_1.TestGeneratorService.generateE2ETest(userStories);
            res.json({
                success: true,
                data: {
                    testCode,
                    fileName: 'e2e.test.ts',
                    stories: userStories.length
                }
            });
        }
        catch (error) {
            logger_1.default.error('E2E test generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'E2E test generation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.TestingController = TestingController;
//# sourceMappingURL=testing.controller.js.map