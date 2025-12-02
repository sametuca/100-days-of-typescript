import { Request, Response } from 'express';
import { SecurityScannerService } from '../services/security-scanner.service';
import { ComplianceCheckerService } from '../services/compliance-checker.service';
import { ThreatDetectorService } from '../services/threat-detector.service';
import logger from '../utils/logger';

export class SecurityController {
  static async scanCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, fileName } = req.body;
      
      if (!code || !fileName) {
        res.status(400).json({
          success: false,
          message: 'Code and fileName are required'
        });
        return;
      }
      
      const result = await SecurityScannerService.scanCode(code, fileName);
      
      logger.info(`Security scan completed for ${fileName}`, {
        vulnerabilities: result.vulnerabilities.length,
        critical: result.summary.critical
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Security scan failed:', error);
      res.status(500).json({
        success: false,
        message: 'Security scan failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async scanDependencies(_req: Request, res: Response): Promise<void> {
    try {
      const result = await SecurityScannerService.scanDependencies();
      
      logger.info('Dependency scan completed', {
        vulnerabilities: result.vulnerabilities.length
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Dependency scan failed:', error);
      res.status(500).json({
        success: false,
        message: 'Dependency scan failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async checkCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { standard } = req.params;
      let report;
      
      switch (standard.toLowerCase()) {
        case 'gdpr':
          report = await ComplianceCheckerService.checkGDPRCompliance();
          break;
        case 'soc2':
          report = await ComplianceCheckerService.checkSOC2Compliance();
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Unsupported compliance standard'
          });
          return;
      }
      
      logger.info(`${standard} compliance check completed`, {
        score: report.overallScore,
        gaps: report.summary.nonCompliant + report.summary.partial
      });
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Compliance check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Compliance check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getThreats(req: Request, res: Response): Promise<void> {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      const threats = ThreatDetectorService.getThreatHistory(hours);
      
      res.json({
        success: true,
        data: threats
      });
    } catch (error) {
      logger.error('Threat retrieval failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve threats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSecurityDashboard(_req: Request, res: Response): Promise<void> {
    try {
      const scanHistory = SecurityScannerService.getScanHistory();
      const complianceReports = ComplianceCheckerService.getComplianceReports();
      const threatSummary = ThreatDetectorService.getThreatSummary();
      const complianceGaps = ComplianceCheckerService.getComplianceGaps();
      
      const dashboard = {
        security: {
          totalScans: scanHistory.length,
          recentVulnerabilities: scanHistory.slice(-5).reduce((sum, scan) => sum + scan.vulnerabilities.length, 0)
        },
        compliance: {
          totalReports: complianceReports.length,
          averageScore: complianceReports.length > 0 
            ? Math.round(complianceReports.reduce((sum, r) => sum + r.overallScore, 0) / complianceReports.length)
            : 0,
          gaps: complianceGaps.length
        },
        threats: threatSummary
      };
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Security dashboard generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate security dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}