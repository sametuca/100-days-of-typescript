"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisController = void 0;
const ai_analysis_service_1 = require("../services/ai-analysis.service");
const code_quality_service_1 = require("../services/code-quality.service");
const logger_1 = __importDefault(require("../utils/logger"));
class AnalysisController {
    static async analyzeCode(req, res) {
        try {
            const analysisRequest = {
                code: req.body.code,
                language: req.body.language || 'javascript',
                fileName: req.body.fileName || 'untitled.js',
                projectId: req.body.projectId
            };
            if (!analysisRequest.code) {
                res.status(400).json({
                    success: false,
                    message: 'Code content is required'
                });
                return;
            }
            const result = await ai_analysis_service_1.AIAnalysisService.analyzeCode(analysisRequest);
            code_quality_service_1.CodeQualityService.addAnalysisResult(result);
            logger_1.default.info(`Code analysis completed for ${result.fileName}`, {
                score: result.overallScore,
                grade: result.grade,
                issues: result.securityIssues.length + result.performanceIssues.length
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Code analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Analysis failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getQualityReport(req, res) {
        try {
            const projectId = req.query.projectId ? parseInt(req.query.projectId) : undefined;
            const report = await code_quality_service_1.CodeQualityService.generateReport(projectId);
            res.json({
                success: true,
                data: report
            });
        }
        catch (error) {
            logger_1.default.error('Quality report generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate quality report',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getQualityMetrics(_req, res) {
        try {
            const metrics = code_quality_service_1.CodeQualityService.getQualityMetrics();
            res.json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            logger_1.default.error('Quality metrics retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quality metrics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getTopIssues(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const issues = code_quality_service_1.CodeQualityService.getTopIssues(limit);
            res.json({
                success: true,
                data: issues
            });
        }
        catch (error) {
            logger_1.default.error('Top issues retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve top issues',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getQualityTrend(req, res) {
        try {
            const fileName = req.params.fileName;
            if (!fileName) {
                res.status(400).json({
                    success: false,
                    message: 'File name is required'
                });
                return;
            }
            const trend = code_quality_service_1.CodeQualityService.getQualityTrend(fileName);
            res.json({
                success: true,
                data: { fileName, trend }
            });
        }
        catch (error) {
            logger_1.default.error('Quality trend retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quality trend',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeBatch(req, res) {
        try {
            const { files } = req.body;
            if (!Array.isArray(files) || files.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Files array is required'
                });
                return;
            }
            const results = [];
            for (const file of files) {
                const analysisRequest = {
                    code: file.code,
                    language: file.language || 'javascript',
                    fileName: file.fileName || 'untitled.js',
                    projectId: file.projectId
                };
                const result = await ai_analysis_service_1.AIAnalysisService.analyzeCode(analysisRequest);
                code_quality_service_1.CodeQualityService.addAnalysisResult(result);
                results.push(result);
            }
            logger_1.default.info(`Batch analysis completed for ${results.length} files`);
            res.json({
                success: true,
                data: {
                    results,
                    summary: {
                        totalFiles: results.length,
                        averageScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
                        totalIssues: results.reduce((sum, r) => sum + r.securityIssues.length + r.performanceIssues.length, 0)
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Batch analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Batch analysis failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.AnalysisController = AnalysisController;
//# sourceMappingURL=analysis.controller.js.map