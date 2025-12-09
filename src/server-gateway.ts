import { APIGateway } from './gateway/api-gateway';
import { initTracing } from './config/tracing.config';
import logger from './utils/logger';

const PORT = parseInt(process.env.GATEWAY_PORT || '8080');

// Initialize distributed tracing
const tracingSdk = initTracing('api-gateway');

// Start API Gateway
const gateway = new APIGateway();
gateway.start(PORT);

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down API Gateway...');
  
  try {
    await tracingSdk.shutdown();
    logger.info('Gateway shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info(`API Gateway started on port ${PORT}`);
