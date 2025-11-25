import { Request, Response } from 'express';
import { TestGeneratorService } from '../services/test-generator.service';
import { CoverageAnalyzerService } from '../services/coverage-analyzer.service';
import { QualityGateService } from '../services/quality-gate.service';
import { TestGenerationRequest } from '../types/testing.types';
import { logger } from '../utils/logger';

export class TestingController {
  static async generateTests(req: Request, res: Response): Promise<void> {
    try {
      const request: TestGenerationRequest = {
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

      const result = await TestGeneratorService.generateTests(request);

      logger.info(`Tests generated for ${result.fileName}`, {
        testCases: result.testCases.length,
        framework: result.framework
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Test generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Test generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateBulkTests(req: Request, res: Response): Promise<void> {
    try {
      const { requests } = req.body;

      if (!Array.isArray(requests) || requests.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Requests array is required'
        });
        return;
      }

      const results = await TestGeneratorService.generateBulkTests(requests);

      logger.info(`Bulk tests generated for ${results.length} files`);

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
    } catch (error) {
      logger.error('Bulk test generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk test generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async analyzeCoverage(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const report = await CoverageAnalyzerService.analyzeCoverage(projectId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Coverage analysis failed:', error);
      res.status(500).json({
        success: false,
        message: 'Coverage analysis failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCoverageHistory(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const history = CoverageAnalyzerService.getCoverageHistory(projectId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Coverage history retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve coverage history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCoverageTrend(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const trend = CoverageAnalyzerService.getCoverageTrend(days);

      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      logger.error('Coverage trend retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve coverage trend',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createQualityGate(req: Request, res: Response): Promise<void> {
    try {
      const { name, rules, projectId } = req.body;

      if (!name || !rules) {
        res.status(400).json({
          success: false,
          message: 'Name and rules are required'
        });
        return;
      }

      const gate = QualityGateService.createQualityGate(name, rules, projectId);

      logger.info(`Quality gate created: ${gate.name}`, { gateId: gate.id });

      res.json({
        success: true,
        data: gate
      });
    } catch (error) {
      logger.error('Quality gate creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Quality gate creation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async evaluateQualityGate(req: Request, res: Response): Promise<void> {
    try {
      const { gateId } = req.params;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;

      const result = await QualityGateService.evaluateQualityGate(gateId, projectId);

      logger.info(`Quality gate evaluated: ${gateId}`, { 
        status: result.status, 
        score: result.overallScore 
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Quality gate evaluation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Quality gate evaluation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQualityGates(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const gates = QualityGateService.getAllQualityGates(projectId);

      res.json({
        success: true,
        data: gates
      });
    } catch (error) {
      logger.error('Quality gates retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality gates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDefaultQualityGate(req: Request, res: Response): Promise<void> {
    try {
      const gate = QualityGateService.getDefaultQualityGate();

      res.json({
        success: true,
        data: gate
      });
    } catch (error) {
      logger.error('Default quality gate creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create default quality gate',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateIntegrationTests(req: Request, res: Response): Promise<void> {
    try {
      const { endpoints } = req.body;

      if (!Array.isArray(endpoints)) {
        res.status(400).json({
          success: false,
          message: 'Endpoints array is required'
        });
        return;
      }

      const testCode = TestGeneratorService.generateIntegrationTest(endpoints);

      res.json({
        success: true,
        data: {
          testCode,
          fileName: 'integration.test.ts',
          endpoints: endpoints.length
        }
      });
    } catch (error) {
      logger.error('Integration test generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Integration test generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateE2ETests(req: Request, res: Response): Promise<void> {
    try {
      const { userStories } = req.body;

      if (!Array.isArray(userStories)) {
        res.status(400).json({
          success: false,
          message: 'User stories array is required'
        });
        return;
      }

      const testCode = TestGeneratorService.generateE2ETest(userStories);

      res.json({
        success: true,
        data: {
          testCode,
          fileName: 'e2e.test.ts',
          stories: userStories.length
        }
      });
    } catch (error) {
      logger.error('E2E test generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'E2E test generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}