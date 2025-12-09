import { TaskGrpcService } from './grpc/services/task-grpc.service';
import { ServiceDiscoveryService } from './services/service-discovery.service';
import { initTracing } from './config/tracing.config';
import logger from './utils/logger';

const GRPC_PORT = parseInt(process.env.GRPC_PORT || '50051');
const SERVICE_NAME = process.env.SERVICE_NAME || 'task-service';
const SERVICE_HOST = process.env.SERVICE_HOST || 'localhost';
const HTTP_PORT = parseInt(process.env.PORT || '3000');

// Initialize distributed tracing
const tracingSdk = initTracing(SERVICE_NAME);

// Start gRPC server
const grpcService = new TaskGrpcService();
grpcService.start(GRPC_PORT);

// Register with service discovery
const serviceDiscovery = new ServiceDiscoveryService();

async function registerService() {
  try {
    await serviceDiscovery.register({
      name: SERVICE_NAME,
      host: SERVICE_HOST,
      port: HTTP_PORT,
      tags: ['grpc', 'tasks', 'v1'],
      meta: {
        version: '1.0.0',
        grpc_port: GRPC_PORT.toString()
      }
    });
    logger.info(`Service ${SERVICE_NAME} registered successfully`);
  } catch (error) {
    logger.error('Failed to register service:', error);
  }
}

registerService();

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  try {
    await serviceDiscovery.deregister();
    grpcService.stop();
    await tracingSdk.shutdown();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info(`gRPC server started on port ${GRPC_PORT}`);
logger.info(`Service ${SERVICE_NAME} is ready`);
