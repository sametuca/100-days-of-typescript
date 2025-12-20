import { AnalyticsEvent, EdgeMetrics } from './types';

export class EdgeAnalytics {
  private events: AnalyticsEvent[] = [];
  private batchSize = 100;
  private flushInterval = 10000; // 10 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.startAutoFlush();
  }

  track(event: Partial<AnalyticsEvent>): void {
    this.events.push({
      timestamp: Date.now(),
      type: event.type || 'pageview',
      path: event.path || '',
      method: event.method || 'GET',
      status: event.status || 200,
      duration: event.duration || 0,
      geo: event.geo,
      userAgent: event.userAgent,
      referer: event.referer
    });

    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      await this.send(batch);
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events on failure
      this.events.push(...batch);
    }
  }

  private async send(events: AnalyticsEvent[]): Promise<void> {
    // In production, send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
    console.log(`Sending ${events.length} analytics events`);
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  getMetrics(): EdgeMetrics {
    const now = Date.now();
    const recentEvents = this.events.filter(
      e => now - e.timestamp < 60000 // Last minute
    );

    const totalRequests = recentEvents.length;
    const avgDuration = recentEvents.reduce((sum, e) => sum + e.duration, 0) / totalRequests || 0;
    
    const statusCodes = recentEvents.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topPaths = this.getTopN(
      recentEvents.map(e => e.path),
      5
    );

    return {
      totalRequests,
      avgDuration,
      statusCodes,
      topPaths
    };
  }

  private getTopN(items: string[], n: number): Array<{ item: string; count: number }> {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }
}
