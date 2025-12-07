"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScannerService = void 0;
const uuid_1 = require("uuid");
class SecurityScannerService {
    static async scanCode(code, fileName) {
        const scanId = (0, uuid_1.v4)();
        const startTime = new Date();
        const vulnerabilities = this.detectVulnerabilities(code, fileName);
        const result = {
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
    static async scanDependencies() {
        const scanId = (0, uuid_1.v4)();
        const startTime = new Date();
        const vulnerabilities = [
            {
                id: (0, uuid_1.v4)(),
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
        const result = {
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
    static getScanHistory() {
        return this.scanHistory;
    }
    static detectVulnerabilities(code, fileName) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('innerHTML') && line.includes('=')) {
                vulnerabilities.push({
                    id: (0, uuid_1.v4)(),
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
            if (line.includes('SELECT') && line.includes('+')) {
                vulnerabilities.push({
                    id: (0, uuid_1.v4)(),
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
            if (line.includes('md5') || line.includes('sha1')) {
                vulnerabilities.push({
                    id: (0, uuid_1.v4)(),
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
    static generateSummary(vulnerabilities) {
        return {
            total: vulnerabilities.length,
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length
        };
    }
}
exports.SecurityScannerService = SecurityScannerService;
SecurityScannerService.scanHistory = [];
//# sourceMappingURL=security-scanner.service.js.map