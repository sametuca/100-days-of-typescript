import { RegionConfig } from './config';

interface RegionConnection {
  name: string;
  config: RegionConfig;
  isHealthy: boolean;
  lastHealthCheck: number;
  replicationLag: number;
}

interface RegionHealth {
  region: string;
  healthy: boolean;
  latency: number;
  replicationLag: number;
}

interface HealthStatus {
  timestamp: number;
  regions: RegionHealth[];
  allHealthy: boolean;
}

export class RegionManager {
  private regions: Map<string, RegionConnection> = new Map();
  private primaryRegion?: string;

  async initialize(configs: RegionConfig[]): Promise<void> {
    for (const config of configs) {
      const connection = await this.connectToRegion(config);
      this.regions.set(config.name, connection);

      if (config.isPrimary) {
        this.primaryRegion = config.name;
      }
    }

    console.log(`Initialized ${this.regions.size} regions`);
  }

  async connectToRegion(config: RegionConfig): Promise<RegionConnection> {
    console.log(`Connecting to region ${config.name} (${config.location})`);

    return {
      name: config.name,
      config,
      isHealthy: true,
      lastHealthCheck: Date.now(),
      replicationLag: 0
    };
  }

  getNearestRegion(userLocation: string): RegionConnection | undefined {
    const regionMapping: Record<string, string> = {
      'US': 'us-east-1',
      'EU': 'eu-west-1',
      'APAC': 'ap-southeast-1'
    };

    const regionName = regionMapping[userLocation] || this.primaryRegion;
    return regionName ? this.regions.get(regionName) : undefined;
  }

  getHealthyRegions(): RegionConnection[] {
    return Array.from(this.regions.values()).filter(r => r.isHealthy);
  }

  async checkHealth(): Promise<HealthStatus> {
    const results: RegionHealth[] = [];

    for (const [name, connection] of this.regions) {
      const startTime = Date.now();
      const isHealthy = await this.pingRegion(connection);
      const latency = Date.now() - startTime;

      connection.isHealthy = isHealthy;
      connection.lastHealthCheck = Date.now();

      results.push({
        region: name,
        healthy: isHealthy,
        latency,
        replicationLag: connection.replicationLag
      });
    }

    return {
      timestamp: Date.now(),
      regions: results,
      allHealthy: results.every(r => r.healthy)
    };
  }

  private async pingRegion(_connection: RegionConnection): Promise<boolean> {
    return true;
  }

  getPrimaryRegion(): string | undefined {
    return this.primaryRegion;
  }

  getRegion(name: string): RegionConnection | undefined {
    return this.regions.get(name);
  }
}
