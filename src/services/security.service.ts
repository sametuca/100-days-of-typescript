// Day 29: Advanced Security Service

interface SecurityEvent {
  type: 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED';
  ip: string;
  userId?: string;
  timestamp: number;
  details?: any;
}

export class SecurityService {
  private events: SecurityEvent[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, number>();

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    this.events.push({ ...event, timestamp: Date.now() });
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events.shift();
    }

    this.analyzeEvent(event);
  }

  // Analyze security patterns
  private analyzeEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const count = this.suspiciousIPs.get(event.ip) || 0;
    
    if (event.type === 'FAILED_LOGIN') {
      this.suspiciousIPs.set(event.ip, count + 1);
      
      // Block IP after 5 failed attempts
      if (count >= 4) {
        this.blockedIPs.add(event.ip);
      }
    }
  }

  // Check if IP is blocked
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Unblock IP
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
  }

  // Get security stats
  getStats() {
    return {
      totalEvents: this.events.length,
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Object.fromEntries(this.suspiciousIPs),
      recentEvents: this.events.slice(-10)
    };
  }
}

export const securityService = new SecurityService();