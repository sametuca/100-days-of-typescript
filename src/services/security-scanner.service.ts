import { SecurityVulnerability, SecurityScanResult } from '../types/security.types';
import { v4 as uuidv4 } from 'uuid';

export class SecurityScannerService {
  private static scanHistory: SecurityScanResult[] = [];

  static async scanCode(code: string, fileName: string): Promise<SecurityScanResult> {
    const scanId = uuidv4();
    const startTime = new Date();
    
    const vulnerabilities = this.detectVulnerabilities(code, fileName);
    
    const result: SecurityScanResult = {
      id: scanId,
      scanType: 'code',
      startTime,
      endTime: new Date(),
      status: 'completed',
      vulnerabilities,
      summary: this.generateSummary(vulnerabilities)
    };
    
    this.scanHistory.push(result);
    return result;
  }

  static async scanDependencies(): Promise<SecurityScanResult> {
    const scanId = uuidv4();
    const startTime = new Date();
    
    // Mock dependency vulnerabilities
    const vulnerabilities: SecurityVulnerability[] = [
      {
        id: uuidv4(),
        type: 'insecure_dependency',
        severity: 'high',
        title: 'Vulnerable lodash version',
        description: 'Using lodash version with known security vulnerability',
        location: { file: 'package.json', line: 15 },
        cwe: 'CWE-79',
        cvss: 7.5,
        remediation: 'Update lodash to version 4.17.21 or higher',
        detectedAt: new Date()
      }
    ];
    
    const result: SecurityScanResult = {
      id: scanId,
      scanType: 'dependency',
      startTime,
      endTime: new Date(),
      status: 'completed',
      vulnerabilities,
      summary: this.generateSummary(vulnerabilities)
    };
    
    this.scanHistory.push(result);
    return result;
  }

  static getScanHistory(): SecurityScanResult[] {
    return this.scanHistory;
  }

  private static detectVulnerabilities(code: string, fileName: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // XSS detection
      if (line.includes('innerHTML') && line.includes('=')) {
        vulnerabilities.push({
          id: uuidv4(),
          type: 'xss',
          severity: 'high',
          title: 'Potential XSS vulnerability',
          description: 'Direct assignment to innerHTML without sanitization',
          location: { file: fileName, line: index + 1 },
          cwe: 'CWE-79',
          cvss: 6.1,
          remediation: 'Use textContent or sanitize input before assignment',
          detectedAt: new Date()
        });
      }
      
      // SQL Injection detection
      if (line.includes('SELECT') && line.includes('+')) {
        vulnerabilities.push({
          id: uuidv4(),
          type: 'sql_injection',
          severity: 'critical',
          title: 'SQL Injection vulnerability',
          description: 'SQL query constructed with string concatenation',
          location: { file: fileName, line: index + 1 },
          cwe: 'CWE-89',
          cvss: 9.8,
          remediation: 'Use parameterized queries or prepared statements',
          detectedAt: new Date()
        });
      }
      
      // Weak crypto detection
      if (line.includes('md5') || line.includes('sha1')) {
        vulnerabilities.push({
          id: uuidv4(),
          type: 'weak_crypto',
          severity: 'medium',
          title: 'Weak cryptographic algorithm',
          description: 'Using deprecated hash algorithm',
          location: { file: fileName, line: index + 1 },
          cwe: 'CWE-327',
          cvss: 5.3,
          remediation: 'Use SHA-256 or stronger hash algorithms',
          detectedAt: new Date()
        });
      }
    });
    
    return vulnerabilities;
  }

  private static generateSummary(vulnerabilities: SecurityVulnerability[]) {
    return {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length
    };
  }
}