"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = exports.SecurityService = void 0;
class SecurityService {
    constructor() {
        this.events = [];
        this.blockedIPs = new Set();
        this.suspiciousIPs = new Map();
    }
    logEvent(event) {
        this.events.push({ ...event, timestamp: Date.now() });
        if (this.events.length > 1000) {
            this.events.shift();
        }
        this.analyzeEvent(event);
    }
    analyzeEvent(event) {
        const count = this.suspiciousIPs.get(event.ip) || 0;
        if (event.type === 'FAILED_LOGIN') {
            this.suspiciousIPs.set(event.ip, count + 1);
            if (count >= 4) {
                this.blockedIPs.add(event.ip);
            }
        }
    }
    isBlocked(ip) {
        return this.blockedIPs.has(ip);
    }
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.suspiciousIPs.delete(ip);
    }
    getStats() {
        return {
            totalEvents: this.events.length,
            blockedIPs: Array.from(this.blockedIPs),
            suspiciousIPs: Object.fromEntries(this.suspiciousIPs),
            recentEvents: this.events.slice(-10)
        };
    }
}
exports.SecurityService = SecurityService;
exports.securityService = new SecurityService();
//# sourceMappingURL=security.service.js.map