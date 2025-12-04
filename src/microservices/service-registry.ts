import logger from '../utils/logger';

export interface ServiceInfo {
  id: string;
  name: string;
  host: string;
  port: number;
  health: string;
  lastHeartbeat: Date;
  metadata?: Record<string, any>;
}

export class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();
  private heartbeatInterval = 30000; // 30 seconds

  constructor() {
    this.startHealthCheck();
  }

  register(service: Omit<ServiceInfo, 'lastHeartbeat'>): void {
    const serviceInfo: ServiceInfo = {
      ...service,
      lastHeartbeat: new Date()
    };
    
    this.services.set(service.id, serviceInfo);
    logger.info(`Service registered: ${service.name} (${service.id})`);
  }

  unregister(serviceId: string): void {
    if (this.services.delete(serviceId)) {
      logger.info(`Service unregistered: ${serviceId}`);
    }
  }

  getService(serviceId: string): ServiceInfo | undefined {
    return this.services.get(serviceId);
  }

  getServicesByName(serviceName: string): ServiceInfo[] {
    return Array.from(this.services.values())
      .filter(service => service.name === serviceName && service.health === 'healthy');
  }

  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  updateHeartbeat(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (service) {
      service.lastHeartbeat = new Date();
      service.health = 'healthy';
    }
  }

  private startHealthCheck(): void {
    setInterval(() => {
      const now = new Date();
      
      for (const [serviceId, service] of this.services) {
        const timeSinceHeartbeat = now.getTime() - service.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > this.heartbeatInterval * 2) {
          service.health = 'unhealthy';
          logger.warn(`Service unhealthy: ${service.name} (${serviceId})`);
        }
      }
    }, this.heartbeatInterval);
  }
}

export const serviceRegistry = new ServiceRegistry();