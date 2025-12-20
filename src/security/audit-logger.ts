interface AuditEvent {
  type: string;
  userId?: string;
  action: string;
  ip?: string;
  metadata?: any;
}

interface AuditLog extends AuditEvent {
  id: string;
  timestamp: number;
}

interface AuditLogFilter {
  userId?: string;
  type?: string;
  startDate?: number;
  endDate?: number;
}

export class AuditLogger {
  private logs: AuditLog[] = [];

  log(event: AuditEvent): void {
    const log: AuditLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...event
    };

    this.logs.push(log);
    this.persistLog(log);
  }

  logAuthentication(userId: string, success: boolean, ip: string): void {
    this.log({
      type: 'authentication',
      userId,
      action: success ? 'login_success' : 'login_failure',
      ip,
      metadata: { success }
    });
  }

  logAPICall(userId: string, endpoint: string, method: string, statusCode: number): void {
    this.log({
      type: 'api_call',
      userId,
      action: `${method} ${endpoint}`,
      metadata: { endpoint, method, statusCode }
    });
  }

  logDataAccess(userId: string, resource: string, action: string): void {
    this.log({
      type: 'data_access',
      userId,
      action,
      metadata: { resource }
    });
  }

  logSecurityEvent(type: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): void {
    this.log({
      type: 'security_event',
      action: type,
      metadata: { severity, ...details }
    });
  }

  queryLogs(filter: AuditLogFilter): AuditLog[] {
    return this.logs.filter(log => {
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.type && log.type !== filter.type) return false;
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      return true;
    });
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private persistLog(log: AuditLog): void {
    // In production, save to database or log service
    console.log('[AUDIT]', JSON.stringify(log));
  }

  clear(): void {
    this.logs = [];
  }
}
