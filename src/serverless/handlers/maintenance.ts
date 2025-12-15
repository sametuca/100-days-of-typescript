import { APIGatewayProxyHandler, Context } from 'aws-lambda';
import logger from '../../utils/logger';

/**
 * Warm up function to avoid cold starts
 */
export const warmupHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.source === 'warmup' || event.body === 'warmup') {
    logger.debug('Warmup event received');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Function warmed up' })
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Invalid warmup request' })
  };
};

/**
 * Health check endpoint
 */
export const healthCheckHandler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    memoryUsed: context.memoryLimitInMB,
    remainingTime: context.getRemainingTimeInMillis()
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(healthStatus)
  };
};

/**
 * Maintenance function for cleanup
 */
export const cleanupHandler = async (event: any, context: Context): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    logger.info('Running cleanup task', {
      time: new Date().toISOString(),
      requestId: context.requestId
    });

    // Simulate cleanup operations
    const cleanupItems = [
      { type: 'old-tasks', count: 10 },
      { type: 'expired-sessions', count: 5 },
      { type: 'temporary-files', count: 3 }
    ];

    for (const item of cleanupItems) {
      logger.info(`Cleaned up ${item.count} ${item.type}`);
    }

    logger.info('Cleanup task completed');
  } catch (error: any) {
    logger.error('Cleanup task error:', error);
    throw error;
  }
};
