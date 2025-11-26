import { ComplianceCheck, ComplianceReport } from '../types/security.types';
import { v4 as uuidv4 } from 'uuid';

export class ComplianceCheckerService {
  private static reports: ComplianceReport[] = [];

  static async checkGDPRCompliance(): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = [
      {
        id: uuidv4(),
        standard: 'gdpr',
        control: 'Art. 25',
        requirement: 'Data Protection by Design and by Default',
        status: 'compliant',
        evidence: 'Privacy controls implemented in user registration',
        lastChecked: new Date()
      },
      {
        id: uuidv4(),
        standard: 'gdpr',
        control: 'Art. 32',
        requirement: 'Security of Processing',
        status: 'partial',
        gaps: ['Missing encryption at rest', 'Weak password policy'],
        remediation: 'Implement database encryption and strengthen password requirements',
        lastChecked: new Date()
      },
      {
        id: uuidv4(),
        standard: 'gdpr',
        control: 'Art. 17',
        requirement: 'Right to Erasure',
        status: 'non_compliant',
        gaps: ['No data deletion mechanism implemented'],
        remediation: 'Implement user data deletion functionality',
        lastChecked: new Date()
      }
    ];

    const report: ComplianceReport = {
      id: uuidv4(),
      standard: 'GDPR',
      generatedAt: new Date(),
      overallScore: this.calculateScore(checks),
      checks,
      summary: this.generateSummary(checks)
    };

    this.reports.push(report);
    return report;
  }

  static async checkSOC2Compliance(): Promise<ComplianceReport> {
    const checks: ComplianceCheck[] = [
      {
        id: uuidv4(),
        standard: 'soc2',
        control: 'CC6.1',
        requirement: 'Logical and Physical Access Controls',
        status: 'compliant',
        evidence: 'Multi-factor authentication implemented',
        lastChecked: new Date()
      },
      {
        id: uuidv4(),
        standard: 'soc2',
        control: 'CC6.7',
        requirement: 'Data Transmission Controls',
        status: 'compliant',
        evidence: 'HTTPS enforced for all communications',
        lastChecked: new Date()
      },
      {
        id: uuidv4(),
        standard: 'soc2',
        control: 'CC7.2',
        requirement: 'System Monitoring',
        status: 'partial',
        gaps: ['Limited security event monitoring'],
        remediation: 'Implement comprehensive security monitoring',
        lastChecked: new Date()
      }
    ];

    const report: ComplianceReport = {
      id: uuidv4(),
      standard: 'SOC2',
      generatedAt: new Date(),
      overallScore: this.calculateScore(checks),
      checks,
      summary: this.generateSummary(checks)
    };

    this.reports.push(report);
    return report;
  }

  static getComplianceReports(standard?: string): ComplianceReport[] {
    if (standard) {
      return this.reports.filter(r => r.standard.toLowerCase() === standard.toLowerCase());
    }
    return this.reports;
  }

  static getComplianceGaps(): ComplianceCheck[] {
    const allChecks = this.reports.flatMap(r => r.checks);
    return allChecks.filter(c => c.status === 'non_compliant' || c.status === 'partial');
  }

  private static calculateScore(checks: ComplianceCheck[]): number {
    const weights = { compliant: 100, partial: 50, non_compliant: 0, not_applicable: 100 };
    const totalWeight = checks.reduce((sum, check) => sum + weights[check.status], 0);
    return Math.round(totalWeight / checks.length);
  }

  private static generateSummary(checks: ComplianceCheck[]) {
    return {
      total: checks.length,
      compliant: checks.filter(c => c.status === 'compliant').length,
      nonCompliant: checks.filter(c => c.status === 'non_compliant').length,
      partial: checks.filter(c => c.status === 'partial').length
    };
  }
}