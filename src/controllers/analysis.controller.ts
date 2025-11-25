import { Request, Response } from 'express';
import { AIAnalysisService } from '../services/ai-analysis.service';
import { CodeQualityService } from '../services/code-quality.service';
import { CodeAnalysisRequest } from '../types/analysis.types';
import { logger } from '../utils/logger';

export class AnalysisController {
  static async analyzeCode(req: Request, res: Response): Promise<void> {
    try {
      const analysisRequest: CodeAnalysisRequest = {
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

      const result = await AIAnalysisService.analyzeCode(analysisRequest);
      CodeQualityService.addAnalysisResult(result);

      logger.info(`Code analysis completed for ${result.fileName}`, {
        score: result.overallScore,
        grade: result.grade,
        issues: result.securityIssues.length + result.performanceIssues.length
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Code analysis failed:', error);
      res.status(500).json({
        success: false,
        message: 'Analysis failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const report = await CodeQualityService.generateReport(projectId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Quality report generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQualityMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = CodeQualityService.getQualityMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Quality metrics retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTopIssues(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const issues = CodeQualityService.getTopIssues(limit);

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      logger.error('Top issues retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top issues',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQualityTrend(req: Request, res: Response): Promise<void> {
    try {
      const fileName = req.params.fileName;
      
      if (!fileName) {
        res.status(400).json({
          success: false,
          message: 'File name is required'
        });
        return;
      }

      const trend = CodeQualityService.getQualityTrend(fileName);

      res.json({
        success: true,
        data: { fileName, trend }
      });
    } catch (error) {
      logger.error('Quality trend retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality trend',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async analyzeBatch(req: Request, res: Response): Promise<void> {
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
        const analysisRequest: CodeAnalysisRequest = {
          code: file.code,
          language: file.language || 'javascript',
          fileName: file.fileName || 'untitled.js',
          projectId: file.projectId
        };

        const result = await AIAnalysisService.analyzeCode(analysisRequest);
        CodeQualityService.addAnalysisResult(result);
        results.push(result);
      }

      logger.info(`Batch analysis completed for ${results.length} files`);

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
    } catch (error) {
      logger.error('Batch analysis failed:', error);
      res.status(500).json({
        success: false,
        message: 'Batch analysis failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}