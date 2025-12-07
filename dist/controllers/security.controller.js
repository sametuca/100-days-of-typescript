"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const security_scanner_service_1 = require("../services/security-scanner.service");
const compliance_checker_service_1 = require("../services/compliance-checker.service");
const threat_detector_service_1 = require("../services/threat-detector.service");
const logger_1 = __importDefault(require("../utils/logger"));
class SecurityController {
    static async scanCode(req, res) {
        try {
            const { code, fileName } = req.body;
            if (!code || !fileName) {
                res.status(400).json({
                    success: false,
                    message: 'Code and fileName are required'
                });
                return;
            }
            const result = await security_scanner_service_1.SecurityScannerService.scanCode(code, fileName);
            logger_1.default.info(`Security scan completed for ${fileName}`, {
                vulnerabilities: result.vulnerabilities.length,
                critical: result.summary.critical
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Security scan failed:', error);
            res.status(500).json({
                success: false,
                message: 'Security scan failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async scanDependencies(_req, res) {
        try {
            const result = await security_scanner_service_1.SecurityScannerService.scanDependencies();
            logger_1.default.info('Dependency scan completed', {
                vulnerabilities: result.vulnerabilities.length
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Dependency scan failed:', error);
            res.status(500).json({
                success: false,
                message: 'Dependency scan failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async checkCompliance(req, res) {
        try {
            const { standard } = req.params;
            let report;
            switch (standard.toLowerCase()) {
                case 'gdpr':
                    report = await compliance_checker_service_1.ComplianceCheckerService.checkGDPRCompliance();
                    break;
                case 'soc2':
                    report = await compliance_checker_service_1.ComplianceCheckerService.checkSOC2Compliance();
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Unsupported compliance standard'
                    });
                    return;
            }
            logger_1.default.info(`${standard} compliance check completed`, {
                score: report.overallScore,
                gaps: report.summary.nonCompliant + report.summary.partial
            });
            res.json({
                success: true,
                data: report
            });
        }
        catch (error) {
            logger_1.default.error('Compliance check failed:', error);
            res.status(500).json({
                success: false,
                message: 'Compliance check failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getThreats(req, res) {
        try {
            const hours = req.query.hours ? parseInt(req.query.hours) : 24;
            const threats = threat_detector_service_1.ThreatDetectorService.getThreatHistory(hours);
            res.json({
                success: true,
                data: threats
            });
        }
        catch (error) {
            logger_1.default.error('Threat retrieval failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve threats',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getSecurityDashboard(_req, res) {
        try {
            const scanHistory = security_scanner_service_1.SecurityScannerService.getScanHistory();
            const complianceReports = compliance_checker_service_1.ComplianceCheckerService.getComplianceReports();
            const threatSummary = threat_detector_service_1.ThreatDetectorService.getThreatSummary();
            const complianceGaps = compliance_checker_service_1.ComplianceCheckerService.getComplianceGaps();
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
        }
        catch (error) {
            logger_1.default.error('Security dashboard generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate security dashboard',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.SecurityController = SecurityController;
//# sourceMappingURL=security.controller.js.map