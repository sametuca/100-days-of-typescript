"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatDetectorService = void 0;
const uuid_1 = require("uuid");
class ThreatDetectorService {
    static detectBruteForce(ip, userId) {
        const now = Date.now();
        const key = userId || ip;
        const attempts = this.loginAttempts.get(key) || [];
        const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
        if (recentAttempts.length >= 5) {
            const threat = {
                id: (0, uuid_1.v4)(),
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
    static detectAnomalousActivity(userId, activity) {
        const suspiciousPatterns = [
            'bulk_data_access',
            'unusual_time_access',
            'privilege_escalation',
            'data_exfiltration'
        ];
        if (suspiciousPatterns.some(pattern => activity.includes(pattern))) {
            const threat = {
                id: (0, uuid_1.v4)(),
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
    static detectDDoS(requestCount, timeWindow) {
        const threshold = 1000;
        const ratePerMinute = (requestCount / timeWindow) * 60;
        if (ratePerMinute > threshold) {
            const threat = {
                id: (0, uuid_1.v4)(),
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
    static getActiveThreats() {
        return this.threats.filter(threat => !threat.mitigated);
    }
    static getThreatHistory(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.threats.filter(threat => threat.timestamp >= cutoff);
    }
    static mitigateThreat(threatId) {
        const threat = this.threats.find(t => t.id === threatId);
        if (threat) {
            threat.mitigated = true;
            return true;
        }
        return false;
    }
    static getThreatSummary() {
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
exports.ThreatDetectorService = ThreatDetectorService;
ThreatDetectorService.threats = [];
ThreatDetectorService.loginAttempts = new Map();
//# sourceMappingURL=threat-detector.service.js.map