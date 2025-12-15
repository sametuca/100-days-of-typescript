import { APIGatewayProxyHandler, Context } from 'aws-lambda';
import { ServerlessDBService } from '../services/serverless-db.service';
import { ServerlessMonitoring } from '../middleware/monitoring';
import { withColdStartOptimizations, ColdStartOptimizer } from '../utils/cold-start';
import logger from '../../utils/logger';

const dbService = new ServerlessDBService('tasks');

/**
 * Example: Create item with DynamoDB
 */
export const createItemHandler: APIGatewayProxyHandler = async (event, context) => {
  return withColdStartOptimizations(async () => {
    try {
      const body = JSON.parse(event.body || '{}');

      const item = {
        id: `task-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
      };

      const result = await dbService.put(item);

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      };
    } catch (error: any) {
      logger.error('Create item error:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }, context);
};

/**
 * Example: Query items with monitoring
 */
export const queryItemsHandler: APIGatewayProxyHandler = async (event, context) => {
  return withColdStartOptimizations(async () => {
    const tracker = ServerlessMonitoring.trackExecution('queryItems', context);
    const isCold = ColdStartOptimizer.isColdStart(context);

    try {
      logger.info('Query items called', { coldStart: isCold });

      const gsiName = event.queryStringParameters?.index || 'userIdIndex';
      const value = event.queryStringParameters?.value;
      const limit = parseInt(event.queryStringParameters?.limit || '10');

      if (!value) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Query value required' })
        };
      }

      const items = await dbService.query(gsiName, 'userId', value, { limit });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          count: items.length
        })
      };
    } catch (error: any) {
      logger.error('Query items error:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    } finally {
      await tracker.finish(true);
    }
  }, context);
};
