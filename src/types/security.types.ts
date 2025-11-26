export interface SecurityVulnerability {
  id: string;
  type: 'xss' | 'sql_injection' | 'csrf' | 'insecure_dependency' | 'weak_crypto' | 'auth_bypass';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location: {
    file: string;
    line: number;
    column?: number;
  };
  cwe?: string;
  cvss?: number;
  remediation: string;
  detectedAt: Date;
}

export interface ComplianceCheck {
  id: string;
  standard: 'gdpr' | 'soc2' | 'iso27001' | 'pci_dss' | 'hipaa';
  control: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  evidence?: string;
  gaps?: string[];
  remediation?: string;
  lastChecked: Date;
}

export interface ThreatEvent {
  id: string;
  type: 'brute_force' | 'ddos' | 'malware' | 'data_breach' | 'unauthorized_access';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  target: string;
  description: string;
  indicators: string[];
  mitigated: boolean;
  timestamp: Date;
}

export interface SecurityScanResult {
  id: string;
  scanType: 'vulnerability' | 'dependency' | 'configuration' | 'code';
  startTime: Date;
  endTime: Date;
  status: 'completed' | 'failed' | 'in_progress';
  vulnerabilities: SecurityVulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ComplianceReport {
  id: string;
  standard: string;
  generatedAt: Date;
  overallScore: number;
  checks: ComplianceCheck[];
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
  };
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
  createdAt: Date;
}

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'block' | 'alert' | 'log';
  severity: 'critical' | 'high' | 'medium' | 'low';
}