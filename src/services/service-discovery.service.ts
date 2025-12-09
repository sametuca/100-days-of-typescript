import Consul from 'consul';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export interface ServiceConfig {
  name: string;
  host: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
}

export class ServiceDiscoveryService {
  private consul: any;
  private serviceId: string;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(consulHost: string = 'localhost', consulPort: number = 8500) {
    this.consul = new Consul({
      host: consulHost,
      port: consulPort
    });
    this.serviceId = uuidv4();
  }

  /**
   * Register service with Consul
   */
  async register(config: ServiceConfig): Promise<void> {
    try {
      const registration = {
        id: this.serviceId,
        name: config.name,
        address: config.host,
        port: config.port,
        tags: config.tags || [],
        meta: config.meta || {},
        check: {
          http: `http://${config.host}:${config.port}/health`,
          interval: '10s',
          timeout: '5s',
          deregisterCriticalServiceAfter: '30s'
        }
      };

      await this.consul.agent.service.register(registration);
      logger.info(`Service registered: ${config.name} (${this.serviceId})`);

      // Start health check heartbeat
      this.startHealthCheck(config);
    } catch (error: any) {
      logger.error('Service registration failed:', error);
      throw error;
    }
  }

  /**
   * Deregister service from Consul
   */
  async deregister(): Promise<void> {
    try {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      await this.consul.agent.service.deregister(this.serviceId);
      logger.info(`Service deregistered: ${this.serviceId}`);
    } catch (error: any) {
      logger.error('Service deregistration failed:', error);
      throw error;
    }
  }

  /**
   * Discover services by name
   */
  async discover(serviceName: string): Promise<ServiceConfig[]> {
    try {
      const result = await this.consul.health.service({
        service: serviceName,
        passing: true
      }) as any;

      return result.map((entry: any) => ({
        name: entry.Service.Service,
        host: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta
      }));
    } catch (error: any) {
      logger.error(`Service discovery failed for ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Get random healthy service instance
   */
  async getServiceInstance(serviceName: string): Promise<ServiceConfig | null> {
    const services = await this.discover(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple random selection (can be enhanced with load balancing)
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  }

  /**
   * Watch for service changes
   */
  async watchService(
    serviceName: string,
    callback: (services: ServiceConfig[]) => void
  ): Promise<any> {
    const watch = (this.consul.watch as any)({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: true
      }
    });

    watch.on('change', (data: any) => {
      const services = data.map((entry: any) => ({
        name: entry.Service.Service,
        host: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta
      }));
      callback(services);
    });

    watch.on('error', (error: any) => {
      logger.error('Service watch error:', error);
    });

    return watch;
  }

  private startHealthCheck(config: ServiceConfig): void {
    this.checkInterval = setInterval(async () => {
      try {
        await this.consul.agent.check.pass(`service:${this.serviceId}`);
      } catch (error: any) {
        logger.error('Health check failed:', error);
      }
    }, 5000);
  }
}
