import { serviceRegistry } from './service-registry';
import config from '../config/env';
import logger from '../utils/logger';

export class MicroserviceManager {
  static init() {
    // Register current service as main API gateway
    serviceRegistry.register({
      id: 'main-api-gateway',
      name: 'api-gateway',
      host: 'localhost',
      port: parseInt(config.server.port),
      health: 'healthy',
      metadata: {
        version: '1.0.0',
        type: 'gateway'
      }
    });

    logger.info('🔧 Microservice architecture initialized');
  }

  static registerService(id: string, name: string, host: string, port: number, metadata?: any) {
    serviceRegistry.register({
      id,
      name,
      host,
      port,
      health: 'healthy',
      metadata
    });
  }
}

export { serviceRegistry } from './service-registry';
export { serviceClient } from './service-client';
export { default as apiGateway } from './api-gateway';
export { default as serviceDiscovery } from './service-discovery';