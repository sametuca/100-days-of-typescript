import { RegionManager } from './region-manager';

export class FailoverManager {
  private failoverInProgress = false;
  private healthCheckInterval = 30000;
  private intervalId?: NodeJS.Timeout;

  constructor(private regionManager: RegionManager) {}

  startHealthChecks(): void {
    this.intervalId = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  stopHealthChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async performHealthCheck(): Promise<void> {
    const health = await this.regionManager.checkHealth();

    if (!health.allHealthy) {
      console.warn('Some regions are unhealthy');
      
      for (const region of health.regions) {
        if (!region.healthy) {
          await this.handleUnhealthyRegion(region.region);
        }
      }
    }
  }

  private async handleUnhealthyRegion(region: string): Promise<void> {
    console.error(`Region ${region} is unhealthy`);

    if (await this.isPrimaryRegion(region)) {
      await this.initiateFailover(region);
    }
  }

  private async initiateFailover(failedRegion: string): Promise<void> {
    if (this.failoverInProgress) {
      console.log('Failover already in progress');
      return;
    }

    this.failoverInProgress = true;
    console.log(`Initiating failover from ${failedRegion}`);

    try {
      const newPrimary = await this.selectNewPrimary(failedRegion);
      console.log(`Selected ${newPrimary} as new primary`);

      await this.promoteRegion(newPrimary);
      await this.redirectTraffic(failedRegion, newPrimary);
      this.notifyFailover(failedRegion, newPrimary);

      console.log(`Failover completed: ${failedRegion} → ${newPrimary}`);
    } catch (error) {
      console.error('Failover failed:', error);
    } finally {
      this.failoverInProgress = false;
    }
  }

  private async selectNewPrimary(excludeRegion: string): Promise<string> {
    const healthy = this.regionManager.getHealthyRegions();
    const candidates = healthy.filter(r => r.name !== excludeRegion);

    if (candidates.length === 0) {
      throw new Error('No healthy regions available for failover');
    }

    return candidates.sort((a, b) => 
      a.replicationLag - b.replicationLag
    )[0].name;
  }

  private async promoteRegion(region: string): Promise<void> {
    console.log(`Promoting ${region} to primary`);
  }

  private async redirectTraffic(from: string, to: string): Promise<void> {
    console.log(`Redirecting traffic: ${from} → ${to}`);
  }

  private notifyFailover(from: string, to: string): void {
    console.log(`[ALERT] Failover: ${from} → ${to}`);
  }

  private async isPrimaryRegion(region: string): Promise<boolean> {
    return region === this.regionManager.getPrimaryRegion();
  }
}
