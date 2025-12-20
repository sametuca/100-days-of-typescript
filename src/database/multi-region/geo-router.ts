import { RegionManager } from './region-manager';

interface WriteResult {
  success: boolean;
  region: string;
  replicationStatus: 'pending' | 'completed' | 'failed';
}

export class GeographicRouter {
  constructor(private regionManager: RegionManager) {}

  async routeRead(userLocation: string, query: any): Promise<any> {
    const region = this.regionManager.getNearestRegion(userLocation);

    if (!region) {
      throw new Error('No healthy region available');
    }

    console.log(`Routing read to ${region.name} for user in ${userLocation}`);
    
    return this.executeQuery(region.name, query);
  }

  async routeWrite(
    _userLocation: string,
    operation: any
  ): Promise<WriteResult> {
    const primaryRegion = this.getPrimaryRegion();

    console.log(`Routing write to primary region ${primaryRegion}`);

    await this.executeWrite(primaryRegion, operation);

    await this.replicateToOtherRegions(primaryRegion, operation);

    return {
      success: true,
      region: primaryRegion,
      replicationStatus: 'pending'
    };
  }

  async routeWithLocalityPreference(
    userLocation: string,
    operation: any,
    preferLocal: boolean = true
  ): Promise<any> {
    if (preferLocal) {
      const local = this.regionManager.getNearestRegion(userLocation);
      if (local?.isHealthy) {
        return this.executeQuery(local.name, operation);
      }
    }

    const healthy = this.regionManager.getHealthyRegions();
    if (healthy.length === 0) {
      throw new Error('No healthy regions available');
    }

    return this.executeQuery(healthy[0].name, operation);
  }

  private getPrimaryRegion(): string {
    return this.regionManager.getPrimaryRegion() || 'us-east-1';
  }

  private async executeQuery(region: string, _query: any): Promise<any> {
    console.log(`Executing query on ${region}`);
    return { data: [], region };
  }

  private async executeWrite(region: string, _operation: any): Promise<any> {
    console.log(`Executing write on ${region}`);
    return { success: true, region };
  }

  private async replicateToOtherRegions(
    sourceRegion: string,
    _operation: any
  ): Promise<void> {
    console.log(`Replicating from ${sourceRegion} to other regions`);
  }
}
