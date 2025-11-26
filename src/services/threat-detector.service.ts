import { ThreatEvent } from '../types/security.types';
import { v4 as uuidv4 } from 'uuid';

export class ThreatDetectorService {
  private static threats: ThreatEvent[] = [];
  private static loginAttempts: Map<string, number[]> = new Map();

  static detectBruteForce(ip: string, userId?: string): ThreatEvent | null {
    const now = Date.now();
    const key = userId || ip;
    const attempts = this.loginAttempts.get(key) || [];
    
    // Clean old attempts (older than 15 minutes)
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 5) {
      const threat: ThreatEvent = {
        id: uuidv4(),
        type: 'brute_force',
        severity: 'high',
        source: ip,
        target: userId || 'unknown',
        description: `Brute force attack detected: ${recentAttempts.length} failed login attempts`,
        indicators: [`IP: ${ip}`, `Attempts: ${recentAttempts.length}`],
        mitigated: false,
        timestamp: new Date()
      };
      
      this.threats.push(threat);
      return threat;
    }
    
    recentAttempts.push(now);
    this.loginAttempts.set(key, recentAttempts);
    return null;
  }

  static detectAnomalousActivity(userId: string, activity: string): ThreatEvent | null {
    // Simple anomaly detection based on activity patterns
    const suspiciousPatterns = [
      'bulk_data_access',
      'unusual_time_access',
      'privilege_escalation',
      'data_exfiltration'
    ];
    
    if (suspiciousPatterns.some(pattern => activity.includes(pattern))) {
      const threat: ThreatEvent = {
        id: uuidv4(),
        type: 'unauthorized_access',
        severity: 'medium',
        source: userId,
        target: 'system',
        description: `Anomalous activity detected: ${activity}`,
        indicators: [`User: ${userId}`, `Activity: ${activity}`],
        mitigated: false,
        timestamp: new Date()
      };
      
      this.threats.push(threat);
      return threat;
    }
    
    return null;
  }

  static detectDDoS(requestCount: number, timeWindow: number): ThreatEvent | null {
    const threshold = 1000; // requests per minute
    const ratePerMinute = (requestCount / timeWindow) * 60;
    
    if (ratePerMinute > threshold) {
      const threat: ThreatEvent = {
        id: uuidv4(),
        type: 'ddos',
        severity: 'critical',
        source: 'multiple',
        target: 'system',
        description: `DDoS attack detected: ${Math.round(ratePerMinute)} requests/minute`,
        indicators: [`Rate: ${Math.round(ratePerMinute)} req/min`, `Threshold: ${threshold} req/min`],
        mitigated: false,
        timestamp: new Date()
      };
      
      this.threats.push(threat);
      return threat;
    }
    
    return null;
  }

  static getActiveThreats(): ThreatEvent[] {
    return this.threats.filter(threat => !threat.mitigated);
  }

  static getThreatHistory(hours: number = 24): ThreatEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.threats.filter(threat => threat.timestamp >= cutoff);
  }

  static mitigateThreat(threatId: string): boolean {
    const threat = this.threats.find(t => t.id === threatId);
    if (threat) {
      threat.mitigated = true;
      return true;
    }
    return false;
  }

  static getThreatSummary(): {
    total: number;
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  } {
    const activeThreats = this.getActiveThreats();
    
    return {
      total: this.threats.length,
      active: activeThreats.length,
      critical: activeThreats.filter(t => t.severity === 'critical').length,
      high: activeThreats.filter(t => t.severity === 'high').length,
      medium: activeThreats.filter(t => t.severity === 'medium').length,
      low: activeThreats.filter(t => t.severity === 'low').length
    };
  }
}